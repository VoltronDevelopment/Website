// Local-only visual fixture; authenticates normally using disposable credentials.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require('playwright');
const baseline=process.argv.includes('--baseline'),out=path.resolve('.audit-logs/home-polish',baseline?'before':'after');fs.mkdirSync(out,{recursive:true});
const base='http://127.0.0.1:3297',password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex'),hash=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex');
const log=fs.openSync(path.join(out,'server.log'),'w'),production=!!process.env.HOME_POLISH_DIST;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next',production?'start':'dev','-H','127.0.0.1','-p','3297'],{windowsHide:true,stdio:['ignore',log,log],env:{...process.env,NEXT_DIST_DIR:process.env.HOME_POLISH_DIST||'.next-home-polish-preview',FOUNDER_CREDENTIALS:`homepolish:${salt}:${hash},homepolishtwo:${salt}:${hash}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
const report={captures:[],checks:[],errors:[]};let browser;
const canvas='[data-persistent-stage] canvas',host='[data-lattice-slot="home"]';
async function live(page){await page.locator(host).scrollIntoViewIfNeeded();await page.waitForFunction(s=>document.querySelector(s)?.dataset.sceneState==='live',host,{timeout:90000});await page.evaluate(()=>document.fonts.ready);}
(async()=>{try{
 for(let i=0;i<180;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,500));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
 const auth=await browser.newContext();const login=await auth.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'homepolish',password}});assert.equal(login.status(),200);const storageState=await auth.storageState();await auth.close();
 for(const theme of ['light','dark']){
  const context=await browser.newContext({storageState,viewport:{width:1440,height:1000},deviceScaleFactor:1});await context.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader|GL_INVALID/.test(m.text()))report.errors.push(m.text());});
  await page.goto(base+'/?hero-time=6.5&hero-review=1');await live(page);
  for(const time of [6.5,4.5,5.3]){await page.getByRole('slider',{name:'Artwork time'}).fill(String(time));await page.screenshot({path:path.join(out,`desktop-${theme}-${time}.png`)});report.captures.push({theme,time,width:1440,actual:await page.locator(canvas).getAttribute('data-theme')});}
  await page.getByRole('slider',{name:'Artwork time'}).fill('6.5');await page.setViewportSize({width:390,height:844});await page.locator(host).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`mobile-${theme}-6.5.png`)});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(!baseline){
   assert.equal(await page.locator(canvas).getAttribute('data-cells'),'7');assert.equal(await page.locator(canvas).getAttribute('data-upper-front-empty'),'true');assert.equal(await page.locator(canvas).getAttribute('data-logo-glow-opacity'),'0.000');
   await page.setViewportSize({width:1440,height:1000});await page.locator(host).scrollIntoViewIfNeeded();
   await page.locator('.home-hero-controlled').getByRole('button',{name:'Replay animation',exact:true}).click();await page.waitForTimeout(700);await page.locator('.home-hero-controlled').getByRole('button',{name:'Pause animation',exact:true}).click();const paused=await page.locator(canvas).getAttribute('data-animation-time');await page.waitForTimeout(200);assert.equal(await page.locator(canvas).getAttribute('data-animation-time'),paused);
   await page.locator('.home-hero-controlled').getByRole('button',{name:'Resume animation',exact:true}).click();await page.waitForFunction(s=>document.querySelector(s)?.dataset.settled==='true',canvas,{timeout:20000});await page.waitForTimeout(100);const frames=await page.locator(canvas).getAttribute('data-rendered-frames');await page.waitForTimeout(250);assert.equal(await page.locator(canvas).getAttribute('data-rendered-frames'),frames);assert.equal(await page.locator(canvas).getAttribute('data-scan-strength'),'0.000');
   const finalTime=await page.locator(canvas).getAttribute('data-animation-time');await page.evaluate(()=>document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark');await page.setViewportSize({width:768,height:1000});await page.waitForTimeout(150);assert.equal(await page.locator(canvas).getAttribute('data-animation-time'),finalTime);
   report.checks.push({theme,sevenCells:true,pauseResume:true,finiteSettlement:true,themeResizeContinuity:true,mobileOverflow:false});
  }
  if(!baseline){
   await page.setViewportSize({width:1440,height:1000});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   await page.getByRole('slider',{name:'Artwork time'}).fill('6.5');await page.addStyleTag({content:'.hero-review{display:none!important}.home-hero-controlled .hero-motion-controls{bottom:12px!important}'});await page.locator(host).scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,`home-${theme}-final.png`)});
  }
  await context.close();
 }
 if(!baseline)for(const mode of ['reduce','saveData']){
  const c=await browser.newContext({storageState,viewport:{width:390,height:844},reducedMotion:mode==='reduce'?'reduce':'no-preference'});await c.addInitScript(save=>{window.__contexts=0;const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/.test(type))window.__contexts++;return get.call(this,type,...args);};if(save)Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true});},mode==='saveData');const p=await c.newPage();await p.goto(base);await p.locator(host).scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.documentElement.dataset.sceneMotion==='static',null,{timeout:15000});assert.equal(await p.evaluate(()=>window.__contexts),0);await p.waitForFunction(s=>[...document.querySelectorAll(s+' img')].filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0),host,{timeout:15000});await p.screenshot({path:path.join(out,mode+'.png')});report.checks.push({mode,webglContexts:0});await c.close();
 }
 assert.deepEqual(report.errors,[]);report.complete=true;console.log(JSON.stringify(report,null,2));
}finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser?.close();server.kill();fs.closeSync(log);}})().catch(e=>{console.error(e);process.exitCode=1;});
