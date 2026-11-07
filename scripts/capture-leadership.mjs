import { createServer } from "vite";
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";
import {mkdir} from "node:fs/promises";

// Render the same transparent WebGL scene used by the page, including the still
// displayed when the visitor requests reduced motion.
const server = await createServer({
  configFile: false,
  optimizeDeps: { entries:["components/about/leadership-renderer.ts"] },
  resolve: { alias: { "@": process.cwd() } },
  server: { host: "127.0.0.1", port: 3185, strictPort:true, watch:null },
});
let browser;
try {
  console.log("Starting local scene server");
  await server.listen();
  const base = server.resolvedUrls.local[0];
  console.log("Opening browser",base);
  browser = await chromium.launch({channel:"chrome", args:["--enable-unsafe-swiftshader"]});
  const page = await browser.newPage({deviceScaleFactor:3});
  page.on("pageerror",error=>console.error(error.message));
  page.on("requestfailed",request=>console.error(request.url(),request.failure()));
  await page.route("**/capture?*", route => route.fulfill({contentType:"text/html",body:
    '<style>*{box-sizing:border-box}body{margin:0}main,canvas{width:100vw;height:100vh;display:block}</style><main><canvas></canvas></main>'}));
  const studyPass=process.argv.includes("--brand-studies");
  if(studyPass){
    await mkdir("public/surface-finishes",{recursive:true});
    for(const theme of ["light","dark"]){
      for(const [index,slug] of ["phosphating","ced","powder"].entries()){
        await page.goto(base+"capture?surface");
        const image=await page.evaluate(async ({index,theme})=>{
          const {bracketFinish}=await import("/scripts/render-bracket-finishes.ts");
          return bracketFinish(document.querySelector("canvas"),index,theme==="dark");
        },{index,theme});
        await sharp(Buffer.from(image,"base64")).webp({quality:88}).toFile(`public/surface-finishes/${slug}-${theme}.webp`);
      }
      for(const [device,w,h] of [["",720,480],["-mobile",390,340]]){
        await page.setViewportSize({width:w,height:h});
        for(const [kind,index] of [["resources",0],["learning",0],["learning",1],["workshop",0]]){
          await page.goto(base+"capture?commons-capture");
          const image=await page.evaluate(async ({kind,index,theme})=>{
            document.documentElement.dataset.theme=theme;
            const {mountCommonsStudy,prepareArtworkEnvironment}=await import("/components/commons/commons-renderer.ts");
            await prepareArtworkEnvironment();
            const canvas=document.querySelector("canvas"),host=canvas.parentElement;
            const scene=await mountCommonsStudy(canvas,host,kind);
            scene.select(index);
            await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
            if(Number(host.dataset.selected)!==index)throw Error("Wrong Commons frame");
            const image=canvas.toDataURL().split(",")[1];scene.dispose();return image;
          },{kind,index,theme});
          const filename=`public/commons-scenes/${kind}-${index}${device}-${theme}`;
          const frame=sharp(Buffer.from(image,"base64"));
          await frame.clone().webp({quality:88}).toFile(filename+".webp");
          if(kind==="learning")await frame.png().toFile(filename+".png");
        }
      }
    }
  }
  if(!process.argv.includes("--factory-and-people"))for (const kind of ["portrait","automotive","search"]) {
    for (const [device,width,height] of [["desktop",600,500],["mobile",360,370]]) {
      await page.setViewportSize({width,height});
      for (const theme of ["light","dark"]) {
        await page.goto(base+"capture?scene-capture&leadership-time=6.4");
        console.log("Rendering",kind,device,theme);
        const png = await page.evaluate(async ({kind,theme}) => {
          document.documentElement.dataset.theme=theme;
          const {mountLeadership}=await import("/components/about/leadership-renderer.ts");
          const canvas=document.querySelector("canvas");
          const scene=await mountLeadership(canvas,canvas.parentElement,kind);
          const image=canvas.toDataURL("image/png").split(",")[1];scene.dispose();return image;
        },{kind,theme});
        const output=path.join("public","leadership",kind+"-"+device+"-"+theme+".webp");
        await sharp(Buffer.from(png,"base64")).resize(width*2,height*2).webp({quality:90}).toFile(output);
        console.log(output);
      }
    }
  }
  if(process.argv.includes("--factory-and-people")){
    for(const kind of ["factory","about","partner"])for(const device of ["desktop","mobile"])for(const theme of ["light","dark"])for(const pose of kind==="factory"?["complete"]:["opening","complete"]){
      const output=kind==="factory"?`public/factory-scenes/${device}-${theme}.webp`:kind==="about"?`public/about-scenes/stairs-${device}-${theme}-${pose}.png`:`public/stories/partner-scene-${device}-${theme}-${pose}.webp`;
      const {width,height}=await sharp(output).metadata();
      const viewportWidth=device==="desktop"?(kind==="factory"?1200:800):360;
      await page.setViewportSize({width:viewportWidth,height:Math.round(viewportWidth*height/width)});
      const time=kind==="factory"?52:pose==="complete"?12:kind==="about"?.8:1.6;
      await page.goto(base+"capture?scene-capture&story-time="+time);
      const png=await page.evaluate(async ({kind,theme,time})=>{
        document.documentElement.dataset.theme=theme;
        const canvas=document.querySelector("canvas"),host=canvas.parentElement;
        let scene;
        if(kind==="factory"){
          const {mountOperatingScene}=await import("/components/technology/operating-renderer.ts");
          const {operatingState}=await import("/components/technology/operating-model.ts");
          scene=await mountOperatingScene(canvas,host,()=>{});
          scene.draw(operatingState(time),null,true);
        }else{
          const {mountCollaboration}=await import("/components/brand/collaboration-renderer.ts");
          scene=await mountCollaboration(canvas,host,kind,()=>{},new AbortController().signal);
          scene.seek(time);
        }
        const image=canvas.toDataURL().split(",")[1];scene.dispose();return image;
      },{kind,theme,time});
      const frame=sharp(Buffer.from(png,"base64")).resize(width,height);
      const stats=await frame.clone().stats();
      if(stats.channels.at(-1).max===0)throw Error("Empty frame "+output);
      await frame.toFile(output);
      console.log(output);
    }
  }
} finally {
  await browser?.close();
  await server.close();
}
