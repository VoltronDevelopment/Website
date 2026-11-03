const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const out=path.resolve('.audit-logs/commons-story'),assets=path.resolve('public/commons-scenes');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(assets,{recursive:true});
const base='http://127.0.0.1:3462',password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex'),digest=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex'),log=fs.openSync(path.join(out,'server.log'),'w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3462'],{windowsHide:true,stdio:['ignore',log,log],env:{...process.env,NEXT_DIST_DIR:'.next-site-refinement-20261104',FOUNDER_CREDENTIALS:`commonsone:${salt}:${digest},commonstwo:${salt}:${digest}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
let browser,auth;const report={cases:[],errors:[]};
(async()=>{
 for(let i=0;i<120;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
 for(const width of [1440,390,360,768,1024])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:width<768?3:2,storageState:auth});
  if(!auth){const login=await context.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'commonsone',password}});if(login.status()!==200)throw Error('Fixture login failed');auth=await context.storageState();}
  await context.addInitScript(t=>{localStorage.setItem('voltron-lattice-theme',t);},theme);
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/about/voltron-commons?commons-capture=1',{waitUntil:'networkidle'});
  await page.evaluate(t=>{document.documentElement.dataset.theme=t;},theme);
  for(const [kind,count] of [['programs',5],['learning',4],['participation',3]]){
   const section=page.locator('.commons-study-'+kind),host=section.locator('.commons-study-art');await host.scrollIntoViewIfNeeded();await page.waitForFunction(k=>document.querySelector('.commons-study-'+k+' .commons-study-art')?.dataset.ready==='true',kind);
   for(let i=0;i<count;i++){
    await section.locator('button').nth(i).click();await host.scrollIntoViewIfNeeded();await page.waitForFunction(({kind,i})=>{const h=document.querySelector('.commons-study-'+kind+' .commons-study-art');return h?.dataset.selected===String(i)&&h.dataset.settled==='true';},{kind,i});
    if(!process.env.COMMONS_SKIP_CAPTURE&&(width===1440||width===390))fs.writeFileSync(path.join(assets,`${kind}-${i}-${width<768?'mobile-':''}${theme}.png`),Buffer.from((await host.locator('canvas').evaluate(c=>c.toDataURL('image/png'))).split(',')[1],'base64'));
   }
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)throw Error('Horizontal overflow '+width+' '+theme);
  await page.screenshot({path:path.join(out,`${width}-${theme}.png`),fullPage:true});report.cases.push({width,theme,overflow});await context.close();
 }
 // Real finite animation, chapter changes and static preferences.
 const c=await browser.newContext({viewport:{width:390,height:844},storageState:auth});const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(base+'/about/voltron-commons');const h=p.locator('.commons-study-programs .commons-study-art');await h.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.commons-study-programs .commons-study-art')?.dataset.settled==='true',null,{timeout:30000});await p.locator('.commons-study-programs button').nth(1).click();await p.waitForFunction(()=>document.querySelector('.commons-study-programs .commons-study-art')?.dataset.settled==='true',null,{timeout:30000});await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('.commons-study-programs .commons-study-art')?.dataset.ready==='false');await c.close();
 if(report.errors.length)throw Error([...new Set(report.errors)].join('\n'));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server.kill();});




