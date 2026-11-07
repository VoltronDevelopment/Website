// Node 22: node --experimental-strip-types scripts/inquiry-delivery.mjs [--retry RECEIPT]
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient,ScanCommand,UpdateCommand} from '@aws-sdk/lib-dynamodb';
import {SESv2Client,SendEmailCommand} from '@aws-sdk/client-sesv2';
import {formatInquiryEmail,sanitizeEmailSubjectPart} from '../lib/inquiry-email.ts';

const {INQUIRIES_TABLE_NAME:table,SES_FROM_EMAIL:sender,INQUIRY_TO_EMAIL:recipient,VOLTRON_AWS_REGION:region}=process.env;
if(!region || !table)throw Error('Set the inquiry table and region for the intended environment.');
const db=DynamoDBDocumentClient.from(new DynamoDBClient({region}));
const args=process.argv.slice(2);
if(!args.length){
  let cursor;
  do{
    const page=await db.send(new ScanCommand({TableName:table,ExclusiveStartKey:cursor,
      FilterExpression:'notificationStatus IN (:failed,:pending,:sending)',ProjectionExpression:'id,createdAt,notificationStatus',
      ExpressionAttributeValues:{':failed':'failed',':pending':'pending',':sending':'sending'}}));
    for(const row of page.Items??[])console.log(row.id,row.createdAt,row.notificationStatus);
    cursor=page.LastEvaluatedKey;
  }while(cursor);
}else{
  if(args.length!==2 || args[0]!=='--retry' || !/^[0-9a-f-]{32,36}$/i.test(args[1]) || !sender || !recipient)
    throw Error('Supply --retry and one failed receipt, with sender and recipient configured.');
  const key={TableName:table,Key:{id:args[1]}};
  const claim=await db.send(new UpdateCommand({...key,ConditionExpression:'notificationStatus = :failed',
    UpdateExpression:'SET notificationStatus = :sending',ExpressionAttributeValues:{':failed':'failed',':sending':'sending'},ReturnValues:'ALL_NEW'}));
  const row=claim.Attributes;
  const mark=status=>db.send(new UpdateCommand({...key,ConditionExpression:'notificationStatus = :sending',
    UpdateExpression:'SET notificationStatus = :status',ExpressionAttributeValues:{':sending':'sending',':status':status}}));
  try{
    await new SESv2Client({region}).send(new SendEmailCommand({FromEmailAddress:sender,Destination:{ToAddresses:[recipient]},
      Content:{Simple:{Subject:{Data:'Voltron website inquiry: '+sanitizeEmailSubjectPart(row.company)},Body:{Text:{Data:formatInquiryEmail(row)}}}}}));
  }catch(error){
    // A lost transport acknowledgement may follow an accepted send. Leave it for manual reconciliation.
    if(error.$metadata?.httpStatusCode>=400 && error.$metadata.httpStatusCode<500)await mark('failed');
    throw error;
  }
  await mark('sent');
  console.log('Delivery accepted for receipt',args[1]);
}
