const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const out=path.resolve('.audit-logs/about-followthrough'),assets=path.resolve('public/commons-scenes');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(assets,{recursive:true});
const base='http://127.0.0.1:3476',password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex'),digest=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex'),log=fs.openSync(path.join(out,'server.log'),'w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3476'],{windowsHide:true,stdio:['ignore',log,log],env:{...process.env,NEXT_DIST_DIR:'.next-followthrough-final-20261104',FOUNDER_CREDENTIALS:`commonsone:${salt}:${digest},commonstwo:${salt}:${digest}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
let browser,auth;const report={cases:[],errors:[]};
(async()=>{
 for(let i=0;i<120;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
 for(const width of [1440,390])for(const theme of ['light','dark']){
 const c=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:2,storageState:auth});
 if(!auth){await c.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'commonsone',password}});auth=await c.storageState();}
 await c.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 await p.addInitScript(()=>{window.__studyDraws=0;for(const type of [WebGLRenderingContext,WebGL2RenderingContext])for(const name of ['drawArrays','drawElements']){const original=type.prototype[name];type.prototype[name]=function(...args){if(this.canvas.closest('.about-study-art'))window.__studyDraws++;return original.apply(this,args);};}});await p.goto(base+'/about?about-capture=1&scene-capture=1&story-time=12');
 for(const kind of ['disciplines','principles']){
 const h=p.locator('.about-study-'+kind+' .about-study-art');await h.scrollIntoViewIfNeeded();await p.waitForFunction(k=>document.querySelector('.about-study-'+k+' .about-study-art')?.dataset.settled==='true',kind,{timeout:60000});
 const bytes=Buffer.from((await h.locator('canvas').evaluate(c=>c.toDataURL())).split(',')[1],'base64');const name=`public/about-scenes/${kind}-${width<768?'mobile-':''}${theme}`;fs.writeFileSync(name+'.png',bytes);await require('sharp')(bytes).webp({quality:92,alphaQuality:100,effort:0}).toFile(name+'.webp');
 // A settled scene must also remain stopped after a manual selection and offscreen scroll.
 await p.locator('.about-study-'+kind+' button').last().click();await h.scrollIntoViewIfNeeded();await p.waitForTimeout(300);if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow');
 }
 const settled=await p.evaluate(()=>window.__studyDraws);await p.waitForTimeout(500);const after=await p.evaluate(()=>window.__studyDraws);if(after!==settled)throw Error('Settled About scene still drawing');const loss=p.locator('.about-study-principles .about-study-art');const supported=await loss.locator('canvas').evaluate(c=>{const gl=c.getContext('webgl2');window.__loss=gl?.getExtension('WEBGL_lose_context');window.__loss?.loseContext();return !!window.__loss;});if(supported){await p.waitForFunction(()=>document.querySelector('.about-study-principles .about-study-art').dataset.ready==='false');await p.evaluate(()=>window.__loss.restoreContext());await p.waitForFunction(()=>document.querySelector('.about-study-principles .about-study-art').dataset.ready==='true');}report.cases.push({width,theme,idleDrawCalls:after-settled,contextRecovery:supported});await p.screenshot({path:path.join(out,`${width}-${theme}.png`),fullPage:true});await c.close();
 }
 console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await browser?.close();server.kill();});
