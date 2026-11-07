// Read-only. Set the database variables from the intended branch before invoking.
import {SESv2Client,GetAccountCommand,GetEmailIdentityCommand} from '@aws-sdk/client-sesv2';
import {DynamoDBClient,DescribeTableCommand,DescribeTimeToLiveCommand} from '@aws-sdk/client-dynamodb';

const {VOLTRON_AWS_REGION:region,INQUIRIES_TABLE_NAME:table,SES_FROM_EMAIL:from,INQUIRY_TO_EMAIL:to}=process.env;
if(!region||!table)throw Error('Missing inquiry region or table.');
const db=new DynamoDBClient({region}),ses=new SESv2Client({region});
async function verified(address){
  for(const candidate of [address,address.split('@').pop()]){
    try{
      if((await ses.send(new GetEmailIdentityCommand({EmailIdentity:candidate}))).VerifiedForSendingStatus)return true;
    }catch(e){if(e.name!=='NotFoundException')throw e;}
  }
  return false;
}
const [tableInfo, ttl] = await Promise.all([
  db.send(new DescribeTableCommand({TableName:table})),
  db.send(new DescribeTimeToLiveCommand({TableName:table}))
]);
const checks = {
  tableActive: tableInfo.Table?.TableStatus === 'ACTIVE',
  rateCounterExpiry: ttl.TimeToLiveDescription?.AttributeName === 'ttlEpoch' &&
    ['ENABLED','ENABLING'].includes(ttl.TimeToLiveDescription?.TimeToLiveStatus)
};
if (process.env.VOLTRON_INQUIRY_EMAIL === '1') {
  if (!from || !to) throw Error('Email mode requires a sender and recipient.');
  const [account,sender,recipient] = await Promise.all([ses.send(new GetAccountCommand({})),verified(from),verified(to)]);
  Object.assign(checks,{sendingEnabled:account.SendingEnabled===true,senderVerified:sender,recipientAllowed:account.ProductionAccessEnabled===true||recipient});
}
console.log(region,checks);
if(Object.values(checks).includes(false))process.exitCode=1;
