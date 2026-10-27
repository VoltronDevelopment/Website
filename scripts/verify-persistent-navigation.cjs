const fs = require('fs');
const crypto = require('crypto');
const assert = require('node:assert/strict');
const {spawn} = require('child_process');
const {chromium} = require('playwright');
const out = process.env.NAV_VERIFY_OUT || '.audit-logs/persistent-navigation-20261027';
fs.mkdirSync(out, {recursive:true});
const base = 'http://127.0.0.1:3298';
const password = crypto.randomBytes(24).toString('hex');
const salt = crypto.randomBytes(16).toString('hex');
const digest = crypto.scryptSync(password, Buffer.from(salt,'hex'),32).toString('hex');
const log = fs.openSync(out+'/server.log','w');
const report = {cases:[],errors:[]};
const server = spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3298'],{windowsHide:true,stdio:['ignore',log,log],env:{...process.env,NEXT_DIST_DIR:process.env.SCENE_DIST||'.next-network-page-20261027',FOUNDER_CREDENTIALS:`frameone:${salt}:${digest},frametwo:${salt}:${digest}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
let browser;
const save = () => fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));
const titles = {'/technology':'Architecture for connected manufacturing.','/intelligence':'Intelligence for the manufacturing situation.','/manufacturing':'Where architecture meets production.','/network':'Built to connect. Designed to grow.'};
(async()=>{
 try {
  for(let i=0;i<120;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
  browser = await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
  const auth = await browser.newContext();
  assert.equal((await auth.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'frameone',password}})).status(),200);
  const storageState = await auth.storageState();
  await auth.close();
  for(const width of [1440,390])for(const theme of ['light','dark']){
   const c = await browser.newContext({storageState,viewport:{width,height:900},deviceScaleFactor:1});
   await c.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);
   const p = await c.newPage();
   p.on('pageerror',e=>report.errors.push(e.message));
   await p.goto(base+'/technology?hero-time=9.5&scene-capture=1');
   await p.waitForSelector('.engineered-stage[data-scene-state="live"]',{timeout:60000});
   await p.evaluate(()=>{window.__frameWitness={header:document.querySelector('.site-header'),frame:document.querySelector('.site-presentation'),main:document.querySelector('main'),footer:document.querySelector('.site-footer'),background:document.querySelector('.lattice-atmosphere')};});
   const checkShell = async()=>{
    const result = await p.evaluate(()=>{
     const selectors={header:'.site-header',frame:'.site-presentation',main:'main',footer:'.site-footer',background:'.lattice-atmosphere'};
     return {same:!!window.__frameWitness&&Object.entries(window.__frameWitness).every(([key,node])=>node===document.querySelector(selectors[key])),headers:document.querySelectorAll('.site-header').length,frames:document.querySelectorAll('.site-presentation').length,mains:document.querySelectorAll('main').length,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    assert.ok(result.same,'Navigation remounted the shared shell');
    assert.equal(result.headers,1);assert.equal(result.frames,1);assert.equal(result.mains,1);
    assert.equal(result.theme,theme);assert.equal(result.overflow,false);
   };
   const check = async name=>{
    await checkShell();
    const box = await p.locator('.hero').evaluate(hero=>({art:hero.querySelector('.hero-visual').getBoundingClientRect().toJSON(),copy:hero.querySelector('.hero-copy').getBoundingClientRect().toJSON()}));
    if(width>900)assert.equal(box.art.x<box.copy.x,['Technology','Manufacturing'].includes(name));
    else assert.ok(box.copy.y+box.copy.height<=box.art.y+2);
    assert.equal(await p.locator('#site-navigation a[href="/'+name.toLowerCase()+'"]').getAttribute('aria-current'),'page');
   };
   const go = async(name,path)=>{
    if(width<768)await p.getByRole('button',{name:'Open navigation',exact:true}).click();
    await p.locator('#site-navigation').getByRole('link',{name,exact:true}).click();
    await p.waitForURL(base+path);
    await p.waitForFunction(({path,titles})=>document.querySelector('.hero h1')?.textContent===titles[path],{path,titles});
    await check(name);
    if(width<768)assert.equal(await p.getByRole('button',{name:'Open navigation',exact:true}).getAttribute('aria-expanded'),'false');
   };
   await check('Technology');
   await p.screenshot({path:out+'/'+width+'-'+theme+'-technology.png'});
   for(const [name,path]of [['Intelligence','/intelligence'],['Manufacturing','/manufacturing'],['Network','/network'],['Technology','/technology']]){
    await go(name,path);
    if(name==='Manufacturing')await p.screenshot({path:out+'/'+width+'-'+theme+'-manufacturing.png'});
   }
   await p.goBack();await p.waitForURL(base+'/network');await check('Network');
   await p.goForward();await p.waitForURL(base+'/technology');await check('Technology');
   await p.locator('.site-header .brand-lockup').click();await p.waitForURL(base+'/');
   await p.waitForSelector('.home-page');await checkShell();
   await go('Technology','/technology');
   await p.goto(base+'/enter');
   assert.equal(await p.locator('.site-header').count(),0);assert.equal(await p.locator('.site-presentation').count(),0);
   report.cases.push({width,theme,persistentFrame:true,contentUpdates:true,alternatingHeroes:true,mobileCopyFirst:width<768,backForward:true,homeRoundTrip:true,entryStandalone:true});
   save();console.log(width,theme,'persistent frame passed');await c.close();
  }
  const c = await browser.newContext();const p = await c.newPage();
  const r = await c.request.get(base+'/technology',{maxRedirects:0});
  assert.equal(r.status(),307);assert.equal(new URL(r.headers().location,base).pathname,'/');
  await p.goto(base+'/');assert.equal(await p.locator('.site-header').count(),0);assert.equal(await p.locator('.site-presentation').count(),0);await p.goto(base+'/coming-soon');assert.equal(await p.locator('.site-header').count(),0);assert.equal(await p.locator('.site-presentation').count(),0);
  report.serverGate=true;await c.close();assert.deepEqual(report.errors,[]);report.complete=true;
 }finally{save();await browser?.close();server.kill();fs.closeSync(log);}
})().catch(e=>{console.error(e);process.exitCode=1;});
