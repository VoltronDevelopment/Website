const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const out='.audit-logs/architecture-20261028',base='http://127.0.0.1:3296';fs.mkdirSync(out,{recursive:true});
const password=crypto.randomBytes(24).toString('hex'),salt=crypto.randomBytes(16).toString('hex'),digest=crypto.scryptSync(password,Buffer.from(salt,'hex'),32).toString('hex'),log=fs.openSync(out+'/server.log','w');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3296'],{windowsHide:true,stdio:['ignore',log,log],env:{...process.env,NEXT_DIST_DIR:process.env.ARCH_DIST||'.next-architecture-20261028',FOUNDER_CREDENTIALS:`archone:${salt}:${digest},archtwo:${salt}:${digest}`,FOUNDER_SESSION_SECRET:crypto.randomBytes(48).toString('hex')}});
const report={layouts:[],sequence:[],errors:[]};let browser;
const save=()=>fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));
async function geometry(p){return p.locator('.technology-map').evaluate(map=>{
 const buttons=[...map.querySelectorAll('button')],rects=buttons.map(b=>b.getBoundingClientRect()),origin=map.getBoundingClientRect();
 return [...map.querySelectorAll('.architecture-track')].map((path,index)=>{
  const total=path.getTotalLength();let intersections=0;
  for(let i=1;i<100;i++){const point=path.getPointAtLength(total*i/100),x=point.x+origin.left,y=point.y+origin.top;if(rects.some(r=>x>r.left+.8&&x<r.right-.8&&y>r.top+.8&&y<r.bottom-.8))intersections++;}
  const start=path.getPointAtLength(0),end=path.getPointAtLength(total),leaf=rects[index+1];
  const distance=Math.min(Math.abs(end.x+origin.left-leaf.left),Math.abs(end.x+origin.left-leaf.right),Math.abs(end.y+origin.top-leaf.top),Math.abs(end.y+origin.top-leaf.bottom));
  return {d:path.getAttribute('d'),intersections,distance};
 });
});}
(async()=>{try{
 for(let i=0;i<120;i++){try{if((await fetch(base+'/coming-soon')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});const auth=await browser.newContext();assert.equal((await auth.request.post(base+'/api/founder/login',{headers:{Origin:base},data:{username:'archone',password}})).status(),200);const storageState=await auth.storageState();await auth.close();
 for(const [width,height] of [[1440,1000],[1024,900],[820,1180],[390,844],[360,640]])for(const theme of ['light','dark']){
  const c=await browser.newContext({storageState,viewport:{width,height},reducedMotion:'reduce'});await c.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto(base+'/technology');await p.locator('.technology-architecture').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelectorAll('.architecture-track').length===4);
  const host=p.locator('.technology-architecture');assert.equal(await host.getAttribute('data-selected'),'ontology');assert.equal(await host.getAttribute('data-revealed'),'4');
  const paths=await geometry(p);for(const path of paths){assert.equal(path.intersections,0,JSON.stringify({width,path}));assert.ok(path.distance<1);assert.ok(!/[CQAL]/.test(path.d));}
  for(const system of ['mes','scada','twin','ai','ontology']){
   await p.locator('.node-'+system).click();assert.equal(await host.getAttribute('data-selected'),system);assert.equal(await p.locator('.technology-node[aria-pressed="true"]').count(),1);assert.ok(await p.locator('.architecture-insight h3').textContent());
   if(width<768){const dialog=p.locator('.architecture-dialog');await dialog.waitFor({state:'visible'});assert.ok(await dialog.locator('h3').textContent());assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');const close=dialog.getByRole('button',{name:'Close system details'});assert.ok(await close.evaluate(e=>e===document.activeElement));await p.keyboard.press('Shift+Tab');assert.ok(await dialog.locator('a').evaluate(e=>e===document.activeElement));await p.keyboard.press('Tab');assert.ok(await close.evaluate(e=>e===document.activeElement));await p.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'));assert.deepEqual(await p.evaluate(async()=>(await axe.run(document.querySelector('.architecture-dialog'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>v.id)),[]);if(system==='ai')await dialog.screenshot({path:`${out}/${width}-${theme}-popup.png`});await p.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await p.waitForFunction(s=>document.activeElement?.matches('.node-'+s)&&document.body.style.overflow!=='hidden',system);assert.ok(await p.locator('.node-'+system).evaluate(e=>e===document.activeElement));assert.notEqual(await p.evaluate(()=>document.body.style.overflow),'hidden');}

  }
  await p.locator('.node-twin').focus();await p.keyboard.press('Enter');assert.equal(await host.getAttribute('data-selected'),'twin');if(width<768){await p.keyboard.press('Escape');await p.locator('.architecture-dialog').waitFor({state:'hidden'});await p.waitForFunction(()=>document.activeElement?.matches('.node-twin'));}await p.keyboard.press('Tab');assert.ok(await p.locator('.node-ai').evaluate(e=>e===document.activeElement));
  await p.locator('.node-ontology').click();if(width<768){await p.getByRole('button',{name:'Close system details'}).click();}await p.locator('#architecture').screenshot({path:`${out}/${width}-${theme}-architecture.png`});
  await p.locator('[data-pack="1"]').click();assert.equal(await p.locator('.modularity-section').getAttribute('data-selected-pack'),'forming');if(width<768){await p.getByRole('button',{name:'Close process details'}).click();await p.locator('.modularity-dialog').waitFor({state:'hidden'});}
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Page overflow');
  await p.evaluate(fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'));const violations=await p.evaluate(async()=>(await axe.run(document.querySelector('.technology-page'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));report.layouts.push({width,height,theme,paths,violations});save();
  await p.screenshot({path:`${out}/${width}-${theme}-page.png`,fullPage:true});await c.close();console.log('Layout',width,theme,JSON.stringify(violations));
 }
 const c=await browser.newContext({storageState,viewport:{width:1440,height:1000}}),p=await c.newPage();await p.goto(base+'/technology');await p.locator('.technology-architecture').scrollIntoViewIfNeeded();
 for(const system of ['ontology','mes','scada','twin','ai']){await p.waitForFunction(s=>document.querySelector('.technology-architecture')?.dataset.selected===s,system,{timeout:12000});assert.ok((await p.locator('.architecture-insight h3').textContent()).includes({ontology:'V-MO',mes:'V-MES',scada:'SCADA',twin:'V-Twin',ai:'V-AI'}[system]));report.sequence.push(system);save();}
 await p.waitForTimeout(3500);assert.equal(await p.locator('.technology-architecture').getAttribute('data-selected'),'ai');await p.locator('.node-mes').click();await p.waitForTimeout(3700);assert.equal(await p.locator('.technology-architecture').getAttribute('data-selected'),'mes');
 await p.reload();await p.locator('.technology-architecture').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.technology-architecture')?.dataset.selected==='mes');await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(3800);assert.equal(await p.locator('.technology-architecture').getAttribute('data-selected'),'mes');
 await p.locator('.technology-architecture').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('.technology-architecture')?.dataset.selected==='scada');
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(3500);assert.equal(await p.locator('.technology-architecture').getAttribute('data-selected'),'scada');assert.equal(await p.locator('.technology-architecture').getAttribute('data-revealed'),'4');await c.close();
 assert.deepEqual(report.errors,[]);assert.ok(report.layouts.every(v=>v.violations.length===0));report.complete=true;save();
 }finally{save();await browser?.close();server.kill();fs.closeSync(log);}
})().catch(e=>{console.error(e);process.exitCode=1;});
