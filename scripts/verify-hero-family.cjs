/* Isolated local fixture. Uses random credentials; never submits a production inquiry. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {chromium}=require('playwright'),sharp=require('sharp');
const out=path.resolve(process.env.HERO_OUT||'.audit-logs/hero-family'),base='http://127.0.0.1:3294';fs.mkdirSync(out,{recursive:true});fs.mkdirSync('public/heroes',{recursive:true});
const password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex'),hash=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex'),log=fs.openSync(path.join(out,'server.log'),'w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3294'],{windowsHide:true,stdio:['ignore',log,log],env:{...process.env,FOUNDER_CREDENTIALS:`heroone:${salt}:${hash},herotwo:${salt}:${hash}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
const definitions=[['technology','/technology',7.5],['manufacturing','/manufacturing',8],['network','/network',10],['ontology','/ontology',6],['about','/about',6]];
let browser;
(async()=>{
 for(let i=0;i<120;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});const auth=await browser.newContext();const login=await auth.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'heroone',password}});if(login.status()!==200)throw Error('Local fixture login failed');const storageState=await auth.storageState();await auth.close();
 const errors=[],results=[];
 for(const [kind,route,end] of definitions.filter(row=>!process.env.HERO_KINDS||process.env.HERO_KINDS.split(",").includes(row[0]))){for(const theme of ['light','dark']){
  const context=await browser.newContext({storageState,viewport:{width:1440,height:1000},deviceScaleFactor:1});await context.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const page=await context.newPage();
  page.on('pageerror',e=>errors.push(kind+': '+e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(kind+': '+m.text());});page.on('response',r=>{if(r.status()>=400&&!(process.env.HERO_CAPTURE&&r.url().includes('/heroes/')))errors.push(r.status()+' '+r.url());});
  await page.goto(base+route+'?hero-time='+end+'&hero-review=1&scene-capture=1');await page.waitForSelector('.engineered-stage[data-scene-state="live"]',{timeout:60000});await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(out,kind+'-'+theme+'.png')});
  const links=await page.locator('.hero-actions a').evaluateAll(links=>links.map(a=>({href:a.href,valid:!a.hash||a.pathname!==location.pathname||!!document.getElementById(a.hash.slice(1))})));
  if(links.some(link=>!link.valid))throw Error(kind+' broken action anchor');
  results.push({kind,theme,heading:await page.locator('.hero h1').evaluate(e=>({size:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight})),links});
  if(process.env.HERO_CAPTURE){
   await page.setViewportSize({width:2400,height:1400});await page.locator('.engineered-stage').evaluate(e=>{e.style.width='960px';e.style.height='760px';});
   for(const pose of ['complete','opening']){
    await page.getByRole('slider',{name:'Artwork time'}).fill(String(pose==='complete'?end:.65));await page.waitForTimeout(100);
    const style=await page.addStyleTag({content:'*{background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;visibility:hidden!important}*:before,*:after{display:none!important}.engineered-stage>canvas{visibility:visible!important}'});
    const raw=await page.locator('.engineered-stage>canvas').screenshot({omitBackground:true});await sharp(raw).webp({quality:92,alphaQuality:100}).toFile(`public/heroes/${kind}-${pose}-${theme}.webp`);await style.evaluate(e=>e.remove());
   }
   if(kind==='network'){
    await page.setViewportSize({width:390,height:844});await page.locator('.engineered-stage').evaluate(e=>{e.style.width='318px';e.style.height='380px';});
    for(const pose of ['complete','opening']){
     await page.getByRole('slider',{name:'Artwork time'}).fill(String(pose==='complete'?end:.65));await page.waitForTimeout(100);
     const style=await page.addStyleTag({content:'*{background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;visibility:hidden!important}*:before,*:after{display:none!important}.engineered-stage>canvas{visibility:visible!important}'});
     const raw=await page.locator('.engineered-stage>canvas').screenshot({omitBackground:true});await sharp(raw).webp({quality:96,alphaQuality:100}).toFile(`public/heroes/network-${pose}-${theme}-mobile.webp`);await style.evaluate(e=>e.remove());
    }
   }
  }else{
   await page.getByRole('slider',{name:'Artwork time'}).fill('3');await page.screenshot({path:path.join(out,kind+'-sequence-'+theme+'.png')});
   await page.getByRole('button',{name:'Replay animation',exact:true}).first().click();await page.getByRole('button',{name:'Pause animation',exact:true}).first().click();const before=await page.locator('.engineered-stage>canvas').getAttribute('data-animation-time');await page.waitForTimeout(180);if(before!==await page.locator('.engineered-stage>canvas').getAttribute('data-animation-time'))throw Error(kind+' pause failed');await page.getByRole('button',{name:'Resume animation',exact:true}).first().click();
   await page.waitForSelector('.engineered-stage[data-phase="settled"]',{timeout:25000});
   const endTime=await page.locator('.engineered-stage>canvas').getAttribute('data-animation-time');await page.evaluate(()=>document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark');await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);if(endTime!==await page.locator('.engineered-stage>canvas').getAttribute('data-animation-time'))throw Error(kind+' theme/resize restarted timeline');await page.screenshot({path:path.join(out,kind+'-mobile-'+theme+'.png'),fullPage:false});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(kind+' mobile overflow');
   await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForSelector('.engineered-stage[data-scene-state="fallback"]');if(await page.locator('.engineered-stage[data-scene-state="live"]').count())throw Error('Reduced motion started live scene');
   const loaded=await page.locator('.engineered-complete img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth));if(!loaded)throw Error(kind+' fallback missing');
  }
  results.push({kind,theme,passed:true});await context.close();
 }}
 if(!process.env.HERO_CAPTURE){
  const context=await browser.newContext({storageState,viewport:{width:1440,height:1000}});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/THREE\.WebGLProgram|VALIDATE_STATUS|Shader Error|GL_INVALID_OPERATION/.test(m.text()))errors.push(m.text());});
  for(const [name,route,query,selector] of [['home','/','hero-time=6.5','[data-lattice-slot]'],['intelligence','/intelligence','intelligence-time=13','.intelligence-face-stage'],['culture','/about/people-culture','hand-time=14','.particle-hand-stage'],['partner','/partner','hand-time=9.5','.particle-hand-stage'],['commons','/about/voltron-commons','human-time=10.5','.human-hero-art']]){
   await p.goto(base+route+'?'+query);await p.waitForFunction(s=>document.querySelector(s)?.dataset.sceneState==='live',selector,{timeout:60000});await p.screenshot({path:path.join(out,name+'-review.png')});
   const replay=p.locator('.hero').getByRole('button',{name:'Replay animation',exact:true});await replay.click();await p.locator('.hero').getByRole('button',{name:'Pause animation',exact:true}).click();await p.waitForTimeout(100);await p.locator('.hero').getByRole('button',{name:'Resume animation',exact:true}).click();await p.waitForTimeout(200);await p.locator('.hero').getByRole('button',{name:'Pause animation',exact:true}).click();
   const timeSelector=name==='home'?'[data-persistent-stage] canvas':selector+' canvas';if(Number(await p.locator(timeSelector).getAttribute('data-animation-time'))<=0)throw Error(name+' replay did not advance');
   await p.setViewportSize({width:390,height:844});await p.screenshot({path:path.join(out,name+'-mobile.png')});if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(name+' mobile overflow');await p.setViewportSize({width:1440,height:1000});
  }
  await p.goto(base+'/technology');await p.getByRole('link',{name:'Network',exact:true}).first().click();await p.getByRole('link',{name:'Manufacturing',exact:true}).first().click();await p.goBack();await p.goForward();await p.waitForSelector('.engineered-stage[data-scene-state="live"]');
  const primary=await p.locator('.hero-actions a').evaluateAll(links=>links.map(a=>({href:a.getAttribute('href'),valid:!a.hash||a.pathname!==location.pathname||!!document.getElementById(a.hash.slice(1))})));if(primary.some(l=>!l.valid))throw Error('Broken primary anchor');
  await p.goto(base+'/network?hero-time=7.5');await p.waitForSelector('.engineered-stage[data-scene-state="live"]');await p.screenshot({path:path.join(out,'network-final.png')});
  await p.evaluate(()=>{const canvas=document.querySelector('.engineered-stage>canvas'),gl=canvas.getContext('webgl2');gl.getExtension('WEBGL_lose_context').loseContext();});await p.waitForSelector('.engineered-stage[data-scene-state="fallback"]');
  // A failed anatomical asset must reveal its completed poster.
  await p.route('**/sculptures/planes-points.bin',route=>route.fulfill({status:503,body:''}));await p.goto(base+'/intelligence');await p.waitForSelector('.intelligence-face-stage[data-scene-state="fallback"]');await p.unroute('**/sculptures/planes-points.bin');
  await p.route('**/sculptures/dosti-points.bin',route=>route.fulfill({status:503,body:''}));await p.goto(base+'/partner');await p.waitForSelector('.particle-hand-stage[data-scene-state="fallback"]');await p.unroute('**/sculptures/dosti-points.bin');
  await p.route('**/sculptures/dosti-mesh.bin',route=>route.fulfill({status:503,body:''}));await p.goto(base+'/partner');await p.waitForSelector('.particle-hand-stage[data-scene-state="fallback"]');
  await context.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,errors},null,2));if(errors.length)throw Error(errors.join('\n'));console.log(process.env.HERO_CAPTURE?'Captured matching hero posters.':'Hero family passed themes, timelines, controls, mobile, reduced motion, route interruption, history and context-loss fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();fs.closeSync(log);});
