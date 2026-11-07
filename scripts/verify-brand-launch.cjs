const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {createServer} = require('node:http');
const {randomBytes, scryptSync} = require('node:crypto');
const {chromium} = require('playwright');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
require('node:dns').setDefaultResultOrder('ipv4first');
const base = 'http://localhost:3893';
const rows = new Map(), messages = [];
// Smoke-test the real SDK serialization against an isolated receipt store and mailbox.
const adapters = createServer(async (req,res) => {
  let body = '';
  for await (const chunk of req) body += chunk;
  const data = JSON.parse(body);
  const action = req.headers['x-amz-target']?.split('.').pop();
  let result = {};
  if (action === 'PutItem') {
    if (rows.has(data.Item.id.S)) {
      res.statusCode = 400;
      result = {__type:'ConditionalCheckFailedException',message:'Already saved'};
    } else rows.set(data.Item.id.S, data.Item);
  } else if (action === 'UpdateItem') {
    const row=rows.get(data.Key.id.S);
    if(row && data.ExpressionAttributeValues[':status'])row.notificationStatus=data.ExpressionAttributeValues[':status'];
  } else if (req.url === '/v2/email/outbound-emails') {
    messages.push(data);result={MessageId:'fixture-mail'};
  } else {res.statusCode=400;result={message:'Unknown fixture request'};}
  res.setHeader('content-type','application/json');res.end(JSON.stringify(result));
});
let server,browser;
const secret=randomBytes(32).toString('hex'), password=randomBytes(16).toString('hex');
const salt=randomBytes(16), digest=scryptSync(password,salt,32).toString('hex');
async function start(deadline) {
  const endpoint='http://127.0.0.1:'+adapters.address().port;
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3893','-H','127.0.0.1'],{
    windowsHide:true,stdio:['ignore','ignore','inherit'],env:{...process.env,NEXT_DIST_DIR:process.env.AUDIT_DIST_DIR||'.next',
      VOLTRON_LAUNCH_AT:new Date(deadline).toISOString(),FOUNDER_SESSION_SECRET:secret,
      FOUNDER_CREDENTIALS:['first','second'].map(name=>[name,salt.toString('hex'),digest].join(':')).join(','),
      VOLTRON_SHARED_LIMITS:'1',INQUIRIES_TABLE_NAME:'Audit',VOLTRON_INQUIRY_EMAIL:'0',SES_FROM_EMAIL:'',INQUIRY_TO_EMAIL:'',
      VOLTRON_AWS_REGION:'ap-south-1',AWS_ACCESS_KEY_ID:'fixture',AWS_SECRET_ACCESS_KEY:'fixture',AWS_ENDPOINT_URL:endpoint}});
  for(let i=0;i<100;i++){
    try{const r=await fetch('http://127.0.0.1:3893/api/launch');if(r.ok&&(await r.json()).launchAt===deadline)return;}catch{}
    await wait(150);
  }
  throw Error('Isolated launch clock did not start');
}
async function stop(){
  if(server && server.exitCode===null){const stopped=new Promise(resolve=>server.once('exit',resolve));server.kill();await stopped;}
}
async function run(){
  await new Promise(resolve=>adapters.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({...(process.env.AUDIT_BROWSER==='chromium'?{}:{channel:'chrome'}),args:['--enable-unsafe-swiftshader']});
  const deadline=Date.now()+30000;
  await start(deadline);
  const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const p=await c.newPage();
  p.on('pageerror',error=>console.error('Browser:',error.message));
  await p.goto(base,{waitUntil:'domcontentloaded'});
  console.log('Brand page opened before launch');
  await p.getByRole('button',{name:'Founder login'}).waitFor();
  await p.getByRole('timer').waitFor();
  await p.locator('.launch-fireworks').waitFor({state:'attached'});
  const ring=await p.locator('.entry-radial-grid span').last().boundingBox();
  const name=await p.locator('.entry-wordmark').boundingBox();
  assert.ok(name.y>=ring.y+ring.height+6,'The brand wordmark must clear the outer ring');

  await p.getByRole('button',{name:/switch to dark/i}).click();
  await p.getByRole('button',{name:'Play music'}).click();
  await p.getByRole('button',{name:'Pause music'}).waitFor();
  assert.equal(await p.getByRole('link',{name:/enter lattice/i}).count(),0);
  assert.equal((await c.request.post(base+'/api/inquiries',{data:{}})).status(),423);
  const founder=await browser.newContext();
  assert.equal((await founder.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'first',password}})).status(),200);
  const preview=await founder.newPage();await preview.goto(base+'/technology');await preview.locator('#operating-platform').waitFor({state:'attached'});
  await founder.close();
  await p.getByRole('link',{name:'Enter Lattice',exact:true}).waitFor({timeout:40000});
  assert.equal(await p.getByRole('timer').count(),0);
  assert.equal(await p.getByRole('button',{name:'Founder login'}).count(),0);
  assert.equal(await p.locator('.launch-fireworks').count(),1);
  assert.equal((await c.request.post(base+'/api/founder/login',{data:{}})).status(),404);
  await p.getByRole('link',{name:'Enter Lattice',exact:true}).click();
  await p.locator('.home-hero').waitFor();
  assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
  await p.getByRole('button',{name:'Pause music'}).waitFor({state:'attached'});
  assert.ok((await c.cookies()).some(cookie=>cookie.name==='voltron_entered'));
  await p.goto(base);await p.locator('.home-hero').waitFor();
  await p.goto(base+'/partner#inquiry');
  const form=p.getByRole('form',{name:'Production inquiry'});await form.scrollIntoViewIfNeeded();
  await form.locator('[name=name]').fill('Audit visitor');await form.locator('[name=email]').fill('visitor@example.test');
  await form.locator('[name=intent]').selectOption({index:1});
  await form.getByRole('button',{name:'Add optional production details'}).click();
  for (const [field,value] of Object.entries({part:'Bearing housing',volume:'40 per week',timing:'December',requirement:'Bore inspection'}))
    await form.locator('[name='+field+']').fill(value);
  const posted=p.waitForRequest(r=>r.url().endsWith('/api/inquiries')&&r.method()==='POST');
  await form.getByRole('button',{name:/submit production/i}).click();
  await form.getByRole('heading',{name:'Inquiry received'}).waitFor();
  const id=await form.locator('.inquiry-reference strong').innerText();
  const row=rows.get(id);assert.equal(row.timing.S,'December');assert.equal(row.qualityRequirements.S,'Bore inspection');
  assert.equal(row.partOrApplication.S,'Bearing housing');assert.equal(row.expectedVolume.S,'40 per week');
  assert.equal(row.coatingThickness,undefined);assert.equal(row.saltSprayRequirement,undefined);
  assert.equal(row.notificationStatus.S,'stored');
  const retry=await c.request.post(base+'/api/inquiries',{data:(await posted).postDataJSON()});
  assert.equal((await retry.json()).inquiryId,id);assert.equal(rows.size,1);
  for(const inquiryType of ['Production — Powder Coating','Platform partnership']){
    const data={...(await posted).postDataJSON(),inquiryType,submissionKey:require('node:crypto').randomUUID()};
    const response=await c.request.post(base+'/api/inquiries',{data});
    const receipt=await response.json();
    assert.ok(response.ok(),JSON.stringify(receipt));assert.equal(rows.get(receipt.inquiryId).inquiryType.S,inquiryType);
  }
  assert.equal(rows.size,3);assert.equal(messages.length,0);
  assert.equal((await c.request.get(base+'/missing-release-test-page')).status(),404);
  await c.close();await stop();
  await start(Date.now()-181000);
  for(const [width,height] of [[320,640],[768,1024],[1440,900],[844,390]]){
    const ctx=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
    const page=await ctx.newPage();await page.goto(base);await page.getByRole('link',{name:'Enter Lattice',exact:true}).waitFor();
    assert.equal(await page.locator('.launch-fireworks').count(),0);
    assert.equal(await page.locator('.home-hero').count(),0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await ctx.close();
  }
  console.log('Passed founder preview, anonymous midnight unlock, celebration expiry, brand-first entry, repeat Home, inquiry delivery and retry.');
}
run().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();await stop();adapters.close();});
