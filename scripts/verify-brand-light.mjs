import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.AUDIT_BASE||'http://localhost:3077',out='data/brand-light/checks';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});const results=[];
try{for(const width of (process.env.MOTION_ONLY?[]:[390,1440]))for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await context.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const page=await context.newPage();
 for(const route of ['/?enter=1','/technology','/intelligence','/manufacturing','/network','/about','/about/voltron-commons','/partner']){
  await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:120000});await page.evaluate(()=>document.fonts.ready);
  const result=await page.locator('.hero h1').evaluate(e=>({text:e.textContent,weight:getComputedStyle(e).fontWeight,spacing:getComputedStyle(e).letterSpacing,overflow:document.documentElement.scrollWidth>innerWidth}));assert.equal(result.weight,'300');assert.equal(result.overflow,false);
  await page.screenshot({path:`${out}/${width}-${theme}-${route.split('?')[0].replaceAll('/','')||'home'}.png`});results.push({width,theme,route,...result});
 }await context.close();console.log(width,theme,'hero typography and overflow passed');
}
for(const width of [390,1440])for(const viaEntry of [false,true]){
 const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();
 await page.addInitScript(()=>{window.__entrance=[];const tick=()=>{const line=document.querySelector('.home-brand-tagline span:last-child'),vera=document.querySelector('.vectra-launch');if(line)window.__entrance.push({opacity:+getComputedStyle(line).opacity,vera:!!vera&&!vera.hidden&&getComputedStyle(vera).visibility!=='hidden'});requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 await page.goto(base+(viaEntry?'/':'/?enter=1'),{waitUntil:'domcontentloaded',timeout:120000});if(viaEntry)await page.getByRole('link',{name:'Enter Lattice without waiting for the introduction'}).click();await page.getByRole('button',{name:'Ask Vera',exact:true}).waitFor({timeout:60000});await page.waitForTimeout(700);
 const samples=await page.evaluate(()=>window.__entrance);assert(samples.some(s=>s.opacity<.9&&!s.vera));assert(samples.some(s=>s.vera));assert(!samples.some(s=>s.vera&&s.opacity<.999));console.log(width,viaEntry?'from brand intro':'direct','Vera follows completed tagline');await context.close();
}await writeFile(out+'/results.json',JSON.stringify(results,null,2));}finally{await browser.close();}
