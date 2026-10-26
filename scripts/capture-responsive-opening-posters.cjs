// Capture responsive loading poses directly from the production renderer.
const fs=require('node:fs'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {chromium}=require('playwright'),sharp=require('sharp');
const port=process.env.SCENE_PORT||'3131',base='http://127.0.0.1:'+port,password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex'),digest=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex');
const out='.audit-logs/scene-continuity';fs.mkdirSync(out,{recursive:true});const log=fs.openSync(out+'/capture-server.log','w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next',process.env.SCENE_DEV?'dev':'start','-H','127.0.0.1','-p',port],{cwd:process.env.SCENE_SOURCE_ROOT||process.cwd(),windowsHide:true,stdio:['ignore',log,log],env:{...process.env,NEXT_DIST_DIR:process.env.SCENE_DIST||'.next-scene-continuity',FOUNDER_CREDENTIALS:`sceneone:${salt}:${digest},scenetwo:${salt}:${digest}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});

let browser;
(async()=>{try{
for(let i=0;i<120;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
browser=await chromium.launch({...(process.env.SCENE_BROWSER==='chromium'?{}:{channel:process.env.SCENE_BROWSER||'chrome'}),headless:true,args:['--enable-unsafe-swiftshader']});
const auth=await browser.newContext();const login=await auth.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'sceneone',password}});if(login.status()!==200)throw Error('Fixture login failed');const storageState=await auth.storageState();await auth.close();


// Capture at the actual CSS presentation size: screen-space strokes cannot be
// downscaled from a large desktop render without changing their apparent glow.
const manifest={};for(const kind of ['technology','process']){manifest[kind]={};for(const width of [1440,390]){const device=width<768?'mobile':'desktop';manifest[kind][device]={};for(const theme of ['light','dark']){
 const c=await browser.newContext({storageState,viewport:{width,height:1000},deviceScaleFactor:1});await c.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const p=await c.newPage();const selector=kind==='technology'?'.engineered-stage':'.alpha-process-art';
 await p.goto(base+(kind==='technology'?'/technology?hero-time=2.1':'/?hero-time=11&process-time=0')+'&scene-capture=1');await p.locator(selector).scrollIntoViewIfNeeded();await p.waitForFunction(s=>document.querySelector(s)?.dataset.sceneState==='live',selector);await p.waitForTimeout(150);
 const canvas=p.locator(selector+' canvas:not([data-scene-blend])'),cr=await canvas.boundingBox(),ir=await p.locator(selector+' .scene-pose-opening img.art-theme-'+theme).boundingBox();
 await p.addStyleTag({content:'*{background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;visibility:hidden!important}*:before,*:after{display:none!important}canvas{visibility:visible!important}.lattice-atmosphere{display:none!important}'});
 let png=await canvas.screenshot({omitBackground:true});if(kind==='technology'&&width<768){const meta=await sharp(png).metadata(),w=Math.round(ir.width),h=Math.round(ir.height),left=Math.round(ir.x-cr.x),top=Math.round(ir.y-cr.y),x=Math.max(0,-left),y=Math.max(0,-top);const expanded=await sharp(png).extend({left:x,top:y,right:Math.max(0,left+w-meta.width),bottom:Math.max(0,top+h-meta.height),background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();png=await sharp(expanded).extract({left:left+x,top:top+y,width:w,height:h}).png().toBuffer();}const image=await sharp(png).webp({quality:95,alphaQuality:100}).toBuffer();const hash=crypto.createHash('sha256').update(image).digest('hex').slice(0,16),url='/optimized/scene-'+kind+'-opening-'+theme+'-'+device+'-'+hash+'.webp';fs.writeFileSync('public'+url,image);manifest[kind][device][theme]=url;console.log(kind,device,theme,image.length);await c.close();
 }}}fs.writeFileSync('lib/scene-responsive-opening-posters.json',JSON.stringify(manifest,null,2)+'\n');
}finally{await browser?.close();server.kill();fs.closeSync(log);}})().catch(e=>{console.error(e);process.exitCode=1;});