// Session-free review of the production renderer through its local authoring harness.
const fs=require('node:fs'),{spawn}=require('node:child_process'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const out='.audit-logs/connected-lot-moving';fs.mkdirSync(out,{recursive:true});const log=fs.openSync(out+'/server.log','w'),server=spawn(process.execPath,['scripts/preview-lot-posters.mjs'],{windowsHide:true,stdio:['ignore',log,log]});let browser;
const report={frames:[],checks:[],errors:[]};const save=()=>fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));
(async()=>{try{
 for(let i=0;i<120;i++){try{if((await fetch('http://127.0.0.1:3110')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
 for(const width of [1440,390])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader|GL_INVALID/.test(m.text()))report.errors.push(m.text());});
  await page.goto(`http://127.0.0.1:3110/?theme=${theme}&background=${theme==='dark'?'%2309121b':'%23edf3f7'}`);await page.waitForSelector('canvas[data-ready="true"]',{timeout:60000});let last=-1,mobilePosition;
  for(const time of [0,.6,1.9,2.1,3.5,5,6.5,9,11,12.4,13.2,14]){
   await page.evaluate(t=>window.__lot.select(t),time);const data=await page.locator('canvas').evaluate(e=>({...e.dataset}));assert.equal(data.carrierCount,'1');assert.ok(Number(data.lotPosition)>=last);last=Number(data.lotPosition);
   if(width===390){mobilePosition??=data.carrierPosition;assert.equal(data.carrierPosition,mobilePosition);assert.equal(data.mobileConveyor,'true');}
   if(time===6.5){assert.equal(data.scanGlow,'enhanced');assert.ok(Number(data.scanEnergy)>.8);}
   if(time===9)assert.equal(data.lotPosition,'2.0000');if(time===13.2){assert.ok(Number(data.departure)>0);assert.equal(data.particles,'true');}if(time===14){assert.equal(data.departure,'1.0000');assert.equal(data.particles,'false');}
   await page.locator('canvas').screenshot({path:`${out}/${width}-${theme}-${time}.png`});report.frames.push({width,theme,time,...data});save();
  }
  if(width===390&&theme==='dark'){
   await page.evaluate(()=>window.__lot.replay());await page.waitForTimeout(450);await page.evaluate(()=>window.__lot.setPaused(true));const clock=await page.locator('canvas').getAttribute('data-animation-time');await page.waitForTimeout(150);assert.equal(await page.locator('canvas').getAttribute('data-animation-time'),clock);
   await page.evaluate(()=>window.__lot.setPaused(false));await page.waitForSelector('canvas[data-settled="true"]',{timeout:25000});const frames=await page.locator('canvas').getAttribute('data-rendered-frames');await page.waitForTimeout(150);assert.equal(await page.locator('canvas').getAttribute('data-rendered-frames'),frames);report.checks.push({pauseResume:true,finiteSettlement:true});
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);report.checks.push({width,theme,singleCarrier:true,mobileAnchoring:width===390,scanGlow:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);report.complete=true;save();console.log('Connected lot passed:',report.frames.length,'keyframes; single carrier, mobile belt, particle lifecycle, glow and finite playback.');
}finally{save();await browser?.close();server.kill();fs.closeSync(log);}})().catch(e=>{console.error(e);process.exitCode=1;});
