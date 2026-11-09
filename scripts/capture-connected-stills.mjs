import {createServer} from 'vite';
import {chromium} from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:3193';
const server=await createServer({configFile:false,optimizeDeps:{entries:['components/technology/operating-renderer.ts','components/brand/neural-network-renderer.ts']},resolve:{alias:{'@':process.cwd()}},server:{host:'127.0.0.1',port:3193,strictPort:true,watch:null}});
await server.listen();
let browser;
try{
 browser=await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});
 const page=await browser.newPage({deviceScaleFactor:2});
 page.on('requestfailed',r=>console.warn(r.url(),r.failure()));page.on('response',r=>{if(r.status()>=400)console.warn(r.status(),r.url())});await page.route('**/capture?*',r=>r.fulfill({contentType:'text/html',body:'<style>*{margin:0}main,canvas{width:100vw;height:100vh;display:block}</style><main><canvas></canvas></main>'}));
 for(const kind of process.argv.includes('--neural-only')?['neural']:['factory','neural'])for(const device of ['desktop','mobile'])for(const theme of ['light','dark']){
 const name=(pose)=>kind==='factory'?`public/factory-scenes/${device}-${theme}.webp`:`public/heroes/neural-layered-${device}-${theme}-${pose}.webp`;
 const width=device==='desktop'?(kind==='factory'?1658:1276):640,height=device==='desktop'?(kind==='factory'?864:1192):(kind==='factory'?592:740),w=width/2;
 await page.setViewportSize({width:w,height:Math.round(w*height/width)});
 await page.goto(base+'/capture?scene-capture');
 for(const pose of kind==='factory'?['opening']:['opening','complete']){
 const png=await page.evaluate(async ({kind,theme,pose})=>{
 document.documentElement.dataset.theme=theme;
 const canvas=document.querySelector('canvas'),host=canvas.parentElement;
 if(kind==='factory'){
 const {mountOperatingScene}=await import('/components/technology/operating-renderer.ts'),{operatingState}=await import('/components/technology/operating-model.ts');
 const scene=await mountOperatingScene(canvas,host,()=>{});scene.draw(operatingState(0),null,false);
 const png=canvas.toDataURL();scene.dispose();return png;
 }
 const {mountNeuralNetwork}=await import('/components/brand/neural-network-renderer.ts');
 const scene=window.network??=await mountNeuralNetwork(canvas,host,()=>{},new AbortController().signal);
 const {sceneOpeningTime}=await import('/lib/scene-continuity.ts');scene.seek(pose==='opening'?sceneOpeningTime.technology:6.2);return canvas.toDataURL();
 },{kind,theme,pose});
 const frame=sharp(Buffer.from(png.split(',')[1],'base64'));
 if((await frame.stats()).channels.at(-1).max===0)throw Error('Blank '+name(pose));
 const bytes=await frame.resize(width,height).webp({quality:89}).toBuffer();await fs.writeFile(name(pose),bytes);console.log(name(pose));
 }
 }
}finally{await browser?.close();await server.close();}

