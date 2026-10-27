// Local, session-free production geometry capture for the existing two-matte builder.
const {spawn}=require('node:child_process'),fs=require('node:fs'),{chromium}=require('playwright');
const folder='node_modules/.cache/lot-posters';fs.mkdirSync(folder,{recursive:true});
const log=fs.openSync(folder+'/capture.log','w'),server=spawn(process.execPath,['scripts/preview-lot-posters.mjs'],{windowsHide:true,stdio:['ignore',log,log]});let browser;
(async()=>{try{
 for(let i=0;i<120;i++){try{if((await fetch('http://127.0.0.1:3110')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
 for(const layout of ['desktop','mobile'])for(const theme of ['light','dark'])for(const time of [0,1.9,4.4,7.7,12.4]){
  const context=await browser.newContext({viewport:{width:layout==='desktop'?1440:390,height:1800},deviceScaleFactor:1}),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/Shader|THREE|GL_INVALID/.test(m.text()))errors.push(m.text());});
  await page.goto(`http://127.0.0.1:3110/?theme=${theme}&background=white&lot-time=${time}`);await page.waitForSelector('canvas[data-ready="true"]',{timeout:60000});
  for(const background of ['white','black']){await page.evaluate(v=>document.body.style.background=v,background);await page.locator('canvas').screenshot({path:`${folder}/${layout}-${theme}-${time}-${background}.png`});}
  if(errors.length)throw Error(errors.join('; '));console.log(layout,theme,time);await context.close();
 }
}finally{await browser?.close();server.kill();fs.closeSync(log);}})().catch(e=>{console.error(e);process.exitCode=1;});
