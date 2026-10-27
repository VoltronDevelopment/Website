// Capture both loading and completed poses from the production renderer itself.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {chromium}=require('playwright'),sharp=require('sharp');
const port=process.env.SCENE_PORT||'3131',base='http://127.0.0.1:'+port,password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex'),digest=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex');
const out='.audit-logs/scene-continuity';fs.mkdirSync(out,{recursive:true});const log=fs.openSync(out+'/capture-server.log','w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next',process.env.SCENE_DEV?'dev':'start','-H','127.0.0.1','-p',port],{cwd:process.env.SCENE_SOURCE_ROOT||process.cwd(),windowsHide:true,stdio:['ignore',log,log],env:{...process.env,NEXT_DIST_DIR:process.env.SCENE_DIST||'.next-scene-continuity',FOUNDER_CREDENTIALS:`sceneone:${salt}:${digest},scenetwo:${salt}:${digest}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
const openingTimes=require('../lib/scene-opening-times.json');
const definitions=[
 ['cultureHelix','/about/people-culture','.culture-helix-stage','.culture-helix-stage canvas','helix-time',.6,7.5,640,640],
 ['home','/','[data-lattice-slot]','[data-persistent-stage] canvas','hero-time',openingTimes.home,14,1440,960],
 ['technology','/technology','.engineered-technology .engineered-stage','.engineered-technology canvas','hero-time',openingTimes.technology,9.5,960,640],
 ['commons','/about/voltron-commons','.human-hero-art','.human-hero-art canvas','human-time',openingTimes.commons,10.5,640,640],
 ['intelligence','/intelligence','.intelligence-face-stage','.intelligence-face-stage canvas','intelligence-time',openingTimes.intelligence,7.5,960,640],
 ['philosophy','/','.home-cube-philosophy','.home-cube-philosophy canvas','cube-time',openingTimes.philosophy,6.8,480,640],
 ['process','/','.alpha-process-art','.alpha-process-art canvas','process-time',openingTimes.process,28,1120,450],
 ['handCulture','/about/people-culture','.particle-hand-stage','.particle-hand-stage canvas','hand-time',openingTimes.culture,14,960,640],
 ['handPartner','/partner','.particle-hand-stage','.particle-hand-stage canvas','hand-time',openingTimes.partner,9.5,960,640],
 ['plant','/manufacturing','.alpha-line-art','.alpha-line-art canvas','alpha-time',0,0,1120,600]
];
let browser;
(async()=>{try{
for(let i=0;i<120;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
browser=await chromium.launch({...(process.env.SCENE_BROWSER==='chromium'?{}:{channel:process.env.SCENE_BROWSER||'chrome'}),headless:true,args:['--enable-unsafe-swiftshader']});
const auth=await browser.newContext();const login=await auth.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'sceneone',password}});if(login.status()!==200)throw Error('Fixture login failed');const storageState=await auth.storageState();await auth.close();

if(process.env.SCENE_CAPTURE_COMPONENT){
 const T=require('three'),camera=new T.OrthographicCamera();camera.position.set(12,9.6,14);camera.lookAt(0,0,0);camera.updateMatrixWorld();const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
 const unit=Math.min(270/(1.65*(Math.abs(right.x)+Math.abs(right.y)+Math.abs(right.z))),252/(1.65*(Math.abs(up.x)+Math.abs(up.y)+Math.abs(up.z))));
 const manifest={worldWidth:300/unit,worldHeight:280/unit};
 for(const theme of ['light','dark']){
  const c=await browser.newContext({storageState,viewport:{width:1440,height:1000},deviceScaleFactor:1});await c.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const p=await c.newPage();await p.goto(base+'/?hero-time=11&factory-time=0&scene-capture=1');
  const host=p.locator('.factory-systems-stage');await host.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.factory-systems-stage').dataset.sceneState==='live');
  await p.locator('[data-system-anchor]').evaluateAll(elements=>elements.forEach(e=>{e.style.width='300px';e.style.height='280px';}));await host.evaluate(e=>{e.style.width=(e.getBoundingClientRect().width-1)+'px';});await p.waitForTimeout(150);
  await p.addStyleTag({content:'*{background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;filter:none!important;visibility:hidden!important}*:before,*:after{display:none!important}canvas{visibility:visible!important}.lattice-atmosphere{display:none!important}'});
  const canvas=p.locator('.factory-systems-canvas'),png=await canvas.screenshot({omitBackground:true});const cr=await canvas.boundingBox(),anchor=await p.locator('[data-system-anchor]').nth(1).boundingBox();
  const image=await sharp(png).extract({left:Math.round(anchor.x-cr.x),top:Math.round(anchor.y-cr.y),width:300,height:280}).webp({quality:94,alphaQuality:100,effort:6}).toBuffer();const hash=crypto.createHash('sha256').update(image).digest('hex').slice(0,16);const url='/optimized/component-pose-'+theme+'-'+hash+'.webp';fs.writeFileSync('public'+url,image);manifest[theme]=url;console.log('component',theme,image.length);await c.close();
 }
 fs.writeFileSync('lib/component-scene-poster.json',JSON.stringify(manifest,null,2)+'\n');return;
}
const manifests={opening:JSON.parse(fs.readFileSync('lib/scene-opening-posters.json')),complete:JSON.parse(fs.readFileSync('lib/scene-posters.json'))};const framing=JSON.parse(fs.readFileSync('lib/scene-poster-framing.json'));const selected=process.env.SCENE_KINDS?.split(',');
// These values mirror the current sculpture cameras, not the earlier hand assets.
const neuralFit=require('../public/sculptures/neural-network.json').camera.framing;framing.technology={minWidth:neuralFit.minWidth,minHeight:neuralFit.minHeight,width:Math.max(neuralFit.minWidth,neuralFit.minHeight*1.5),height:Math.max(neuralFit.minHeight,neuralFit.minWidth/1.5)};
framing.commons={minWidth:5.7,minHeight:5.7,width:5.7,height:5.7};
framing.handCulture={minWidth:5.4,minHeight:7.6,width:11.4,height:7.6};
framing.handPartner={minWidth:5.8,minHeight:7.2,width:10.8,height:7.2};
for(const [name,route,hostSelector,canvasSelector,param,opening,end,width,height] of definitions.filter(row=>!selected||selected.includes(row[0]))){
 for(const pose of ['opening','complete']){manifests[pose][name]={};for(const theme of ['light','dark']){
  const context=await browser.newContext({storageState,viewport:{width:2800,height:1600},deviceScaleFactor:1});await context.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/Shader|THREE|GL_INVALID/.test(m.text()))errors.push(m.text());});
  await p.goto(base+route+'?scene-capture=1&'+param+'='+(pose==='opening'?opening:end));
  const host=p.locator(hostSelector);await host.scrollIntoViewIfNeeded();await p.waitForFunction(selector=>document.querySelector(selector)?.dataset.sceneState==='live',hostSelector,{timeout:60000});
  await host.evaluate((e,rect)=>{e.style.width=rect[0]+'px';e.style.height=rect[1]+'px';e.style.minHeight=rect[1]+'px';e.style.maxHeight='none';},[width,height]);
  await p.evaluate(()=>{window.dispatchEvent(new Event("resize"));return document.fonts.ready;});await p.waitForTimeout(200);
  await p.addStyleTag({content:'*{background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;filter:none!important;visibility:hidden!important}*:before,*:after{display:none!important}canvas{visibility:visible!important}.lattice-atmosphere{display:none!important}'});
  const canvas=p.locator(canvasSelector);const raw=await canvas.screenshot({omitBackground:true});const box=await canvas.boundingBox(),captureWidth=name==='plant'?Math.round(box.width):width,captureHeight=name==='plant'?Math.round(box.height):height;const png=await sharp(raw).resize(captureWidth,captureHeight,{fit:'fill'}).png().toBuffer();if(name==='process'||name==='plant'){const insets=await canvas.evaluate(e=>JSON.parse(e.dataset.frameInsets));framing[name]={minWidth:captureWidth-insets.left-insets.right,minHeight:captureHeight-insets.top-insets.bottom,width:captureWidth,height:captureHeight,padding:true};}
  let image=await sharp(png).webp({quality:name==='home'?94:90,alphaQuality:100,effort:6}).toBuffer();if(name==='home')for(const quality of [92,90,88,86,84]){if(image.length<=200000)break;image=await sharp(png).webp({quality,alphaQuality:100,effort:6}).toBuffer();}const hash=crypto.createHash('sha256').update(image).digest('hex').slice(0,16),url=`/optimized/scene-${name}-${pose}-${theme}-${hash}.webp`;
  fs.writeFileSync('public'+url,image);manifests[pose][name][theme]=url;
  fs.writeFileSync(`${out}/${name}-${pose}-${theme}.png`,png);console.log(name,pose,theme,image.length,errors);if(errors.length)throw Error(errors.join('; '));await context.close();
 }}
}
const names=definitions.filter(row=>!selected||selected.includes(row[0])).map(row=>row[0]);
const freshFraming=JSON.parse(fs.readFileSync('lib/scene-poster-framing.json'));for(const name of names)if(framing[name])freshFraming[name]=framing[name];fs.writeFileSync('lib/scene-poster-framing.json',JSON.stringify(freshFraming,null,2)+'\n');
for(const pose of ['opening','complete']){const file=pose==='opening'?'lib/scene-opening-posters.json':'lib/scene-posters.json',fresh=JSON.parse(fs.readFileSync(file));for(const name of names)fresh[name]=manifests[pose][name];fs.writeFileSync(file,JSON.stringify(fresh,null,2)+'\n');}
}finally{await browser?.close();server.kill();fs.closeSync(log);}})().catch(e=>{console.error(e);process.exitCode=1;});
