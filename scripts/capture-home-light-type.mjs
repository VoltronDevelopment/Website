import {chromium} from 'playwright';
import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=process.env.AUDIT_BASE||'http://localhost:3077';
const names=['launch-opening-frames','scene-hd-posters','scene-posters','scene-hd-openings','scene-opening-posters'];
const manifests=Object.fromEntries(await Promise.all(names.map(async name=>[name,JSON.parse(await readFile(`lib/${name}.json`,'utf8'))])));
const out='data/brand-light';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
async function store(raw,label,width){const bytes=await sharp(raw).resize({width}).webp({quality:96,alphaQuality:100}).toBuffer();const hash=createHash('sha256').update(bytes).digest('hex').slice(0,16);const url=`/optimized/home-light-type-${label}-${hash}.webp`;await writeFile('public'+url,bytes);return {url,...await sharp(bytes).metadata(),bytes:bytes.length};}
try{
for(const [device,width,height] of [['phone',390,844],['tablet',820,1180],['desktop',1440,900],['complete',1440,1000]])for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2});await context.addInitScript(t=>localStorage.setItem('voltron-lattice-theme',t),theme);const page=await context.newPage();
 await page.goto(base+'/?enter=1&scene-capture=1&hero-time='+(device==='complete'?14:0),{timeout:120000});
 await page.waitForSelector('[data-lattice-slot][data-live=true]',{timeout:120000});await page.evaluate(()=>document.fonts.ready);
 const host=page.locator('[data-lattice-slot]');const canvas=page.locator('[data-persistent-stage] canvas');
 if(device==='complete')await host.evaluate(e=>{e.style.setProperty('width','1440px','important');e.style.setProperty('height','960px','important');e.style.setProperty('max-width','none','important');});
 await page.waitForTimeout(300);await page.screenshot({path:`${out}/${device}-${theme}.png`});
 const raw=Buffer.from(await canvas.evaluate(c=>c.toDataURL('image/png').split(',')[1]),'base64');const bounds=await canvas.boundingBox();const standard=await store(raw,device+'-'+theme+'-1x',Math.round(bounds.width));const hd=await store(raw,device+'-'+theme+'-2x',Math.round(bounds.width)*2);
 if(device==='complete'){
  manifests['scene-posters'].home[theme]=standard.url;
  manifests['scene-hd-posters'].home.complete[theme]={url:hd.url,width:hd.width,height:hd.height,bytes:hd.bytes};
 }else manifests['launch-opening-frames'].home[device][theme]=[standard.url,hd.url];
 console.log(device,theme,standard.width,hd.width);await context.close();
}
for(const name of names.slice(0,3))await writeFile(`lib/${name}.json`,JSON.stringify(manifests[name],null,2)+'\n');
}finally{await browser.close();}
