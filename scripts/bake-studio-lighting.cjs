/* Bake the authored studio at its native precision so visitors can reuse its filtered lighting. */
const {chromium} = require('playwright');
const ts = require('typescript');
const path = require('node:path');
const {gzipSync} = require('node:zlib');
const {readFileSync,writeFileSync} = require('node:fs');

async function bake() {
  const browser = await chromium.launch({channel:'chrome',args:['--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage();
    const threeRoot = path.resolve('node_modules/three');
    await page.route('http://studio.test/**',async route=>{
      const file=new URL(route.request().url()).pathname.slice(1);
      if(!file)return route.fulfill({contentType:'text/html',body:'<script type="importmap">{"imports":{"three":"/build/three.module.js","three/addons/":"/examples/jsm/"}}</script>'});
      if(file==='studio.js')return route.fulfill({contentType:'application/javascript',body:ts.transpile(readFileSync('components/brand/artwork-studio.ts','utf8'),{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})});
      const source=path.resolve(threeRoot,file);
      if(!source.startsWith(threeRoot+path.sep))return route.abort();
      return route.fulfill({path:source,contentType:'application/javascript'});
    });
    await page.goto('http://studio.test/');
    const encoded = await page.evaluate(async () => {
      const {WebGLRenderer}=await import('three');
      const Studio=await import('/studio.js');
      const renderer = new WebGLRenderer();
      const target = Studio.createArtworkEnvironment(renderer);
      const pixels = new Uint16Array(target.width * target.height * 4);
      renderer.readRenderTargetPixels(target,0,0,target.width,target.height,pixels);
      if(!pixels.some(value=>value))throw Error('Empty studio lighting');
      const bytes = new Uint8Array(8+pixels.byteLength);
      new Uint32Array(bytes.buffer,0,2).set([target.width,target.height]);
      bytes.set(new Uint8Array(pixels.buffer),8);
      let binary = '';
      for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
      target.dispose();
      renderer.dispose();
      return btoa(binary);
    });
    writeFileSync('public/studio-lighting.bin.gz',gzipSync(Buffer.from(encoded,'base64'),{level:9}));
  } finally { await browser.close(); }
}
bake().catch(error=>{console.error(error);process.exitCode=1;});
