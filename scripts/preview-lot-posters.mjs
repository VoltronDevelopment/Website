// Local artwork authoring harness. Uses the production renderer without app/session data.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
import Module from 'node:module';
const require=createRequire(import.meta.url);
const root=process.cwd(), cache=path.join(root,'node_modules/.cache/lot-posters');
await fs.mkdir(cache,{recursive:true});
const seen=new Set();
async function compile(relative){
  if(seen.has(relative))return;seen.add(relative);
  const source=await fs.readFile(path.join(root,relative),'utf8');
  const dependencies=[];
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from ["'](\.[^"']+)["']/g,(_,name)=>{
    const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(relative),name))+'.ts';dependencies.push(dependency);return `from ${JSON.stringify(name+'.js')}`;
  });
  const output=path.join(cache,relative.replace(/\.ts$/,'.js'));await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,code);
  await Promise.all(dependencies.map(compile));
}
await compile('components/home/lot-story-renderer.ts');
// Render the actual React markup for a static composition/card review as well.
const resolve=Module._resolveFilename;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.join(root,name.slice(2)):name,...args);};
for(const extension of ['.ts','.tsx'])require.extensions[extension]=(module,filename)=>module._compile(ts.transpileModule(require('node:fs').readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
require.extensions['.css']=()=>{};
const markup=require('react-dom/server').renderToStaticMarkup(require('react').createElement(require(path.join(root,'components/home/LotStory.tsx')).HomeLotFlow));
const composition=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/lot.css"><style>body{margin:0;padding:24px 48px}.lot-story{max-width:1120px;margin:auto}@media(max-width:767px){body{padding:24px}}</style>${markup}`;
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/lot.css"><style>body{background:transparent;margin:0}.lot-story-art{width:min(1120px,calc(100% - 96px));margin:40px auto}h3{height:44px;margin:0}.lot-snapshot-caption{height:48px}canvas{opacity:1!important}@media(max-width:767px){.lot-story-art{width:calc(100% - 48px)}}</style><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script><div class="lot-story-art"><canvas class="lot-story-canvas"></canvas><div class="lot-story-snapshots">${Array.from({length:4},()=>'<article class="lot-snapshot"><h3></h3><div class="lot-snapshot-anchor" data-lot-story-anchor></div><p class="lot-snapshot-caption"></p></article>').join('')}</div></div><script type="module">import {mountLotStory} from '/modules/components/home/lot-story-renderer.js';const query=new URLSearchParams(location.search);document.documentElement.dataset.theme=query.get('theme')||'light';document.body.style.background=query.get('background')||'white';const host=document.querySelector('.lot-story-art');mountLotStory(document.querySelector('canvas'),host,{initialTime:Number(query.get('lot-time')||0),onState(){},onReady(){}});</script>`;
http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
  if(pathname==='/composition'){res.setHeader('Content-Type','text/html');res.end(composition);return;}
  const base=pathname.startsWith('/modules/')?cache:pathname.startsWith('/three/')?path.join(root,'node_modules/three'):pathname.startsWith('/optimized/')?path.join(root,'public/optimized'):null;
  let file=pathname==='/globals.css'?path.join(root,'app/globals.css'):pathname==='/lot.css'?path.join(root,'components/home/lot-story.css'):base?path.resolve(base,'.'+pathname.replace(/^\/(modules|three|optimized)/,'')):null;
  if(!file || base&&!file.startsWith(base+path.sep)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'text/javascript');res.end(await fs.readFile(file));
}catch{res.writeHead(404);res.end();}}).listen(3110,'127.0.0.1',()=>console.log('Lot artwork authoring: http://127.0.0.1:3110'));
