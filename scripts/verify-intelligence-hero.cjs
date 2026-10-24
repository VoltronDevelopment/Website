/* Local production fixture. Random test credentials; no real inquiries or secrets. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {chromium}=require(require.resolve('playwright',{paths:[process.cwd(),path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')]}));
const out=path.resolve('.audit-logs/intelligence-hero');fs.mkdirSync(out,{recursive:true});
const base='http://localhost:3192',password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex');
const digest=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex');
const log=fs.openSync(path.join(out,'server.log'),'w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next',(process.env.ARTWORK_DEV?'dev':'start'),'-H','localhost','-p','3192'],{windowsHide:true,stdio:['ignore',log,log],env:{...process.env,FOUNDER_CREDENTIALS:`herotest:${salt}:${digest},herotesttwo:${salt}:${digest}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
let browser;
(async()=>{
  for(let i=0;i<80;i++){try{await fetch(base);break;}catch{await new Promise(r=>setTimeout(r,250));}}
  browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const login=await context.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'herotest',password}});
  if(login.status()!==200)throw new Error('Fixture login failed');
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const theme of ['light','dark']){
    await page.addInitScript(value=>localStorage.setItem('voltron-lattice-theme',value),theme);
    await page.goto(base+'/intelligence?intelligence-time=6');
    await page.waitForSelector('.intelligence-face-stage[data-live="true"]',{timeout:30000});
    await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.intelligence-face-stage canvas')).opacity)===1);
    await page.screenshot({path:path.join(out,`desktop-${theme}.png`)});
    const transparent=await page.addStyleTag({content:'*{background:transparent!important;box-shadow:none!important}*:before,*:after{display:none!important}'});
    await page.locator('.intelligence-face-stage canvas').screenshot({path:path.join(out,`poster-${theme}.png`),omitBackground:true});
    await transparent.evaluate(element=>element.remove());
  }
  if(process.env.ARTWORK_CAPTURE)return;
  for(const [name,time] of [['cloud',0],['formation',3],['formed',6]]){
    await page.goto(base+'/intelligence?intelligence-time='+time);
    await page.waitForSelector('.intelligence-face-stage[data-live="true"]');
    await page.screenshot({path:path.join(out,name+'.png')});
  }
  await page.getByRole('button',{name:'Replay animation'}).click();
  await page.getByRole('button',{name:'Pause animation'}).click();
  await page.getByRole('button',{name:'Resume animation'}).waitFor();
  await page.getByRole('button',{name:'Resume animation'}).click();
  await page.waitForSelector('.intelligence-face-stage[data-phase="formed"]',{timeout:20000});
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/intelligence?intelligence-time=6');
  await page.waitForSelector('.intelligence-face-stage[data-live="true"]');await page.screenshot({path:path.join(out,'mobile-dark.png'),fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForSelector('.face-poster-dark');
  if(await page.locator('.intelligence-face-stage[data-live="true"]').count())throw new Error('Reduced motion started WebGL');
  await page.screenshot({path:path.join(out,'reduced-dark.png')});
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('Passed desktop themes, mobile, finite playback, pause/resume/replay, reduced motion and browser errors.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();fs.closeSync(log);});
