// Local artwork authoring harness. Uses the production renderer without app/session data.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
import Module from 'node:module';
const require=createRequire(import.meta.url);
const root=process.cwd(), cache=path.join(root,'node_modules/.cache/alpha-posters');
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
await compile('components/manufacturing/alpha-line-renderer.ts');
await compile('components/manufacturing/alpha-line-tour.ts');
await compile('components/manufacturing/alpha-line-config.ts');
await compile('components/home/alpha-process-renderer.ts');
const resolve=Module._resolveFilename;
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.join(root,name.slice(2)):name,...args);};
for(const extension of ['.ts','.tsx'])require.extensions[extension]=(module,filename)=>module._compile(ts.transpileModule(require('node:fs').readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,resolveJsonModule:true}}).outputText,filename);
require.extensions['.css']=()=>{};
const page=require(path.join(root,'app/manufacturing/page.tsx')).default();
const markup=require('react-dom/server').renderToStaticMarkup(page.props.children);
const composition=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/presentation.css"><link rel="stylesheet" href="/alpha.css"><style>body{margin:0}.alpha-page .alpha-line{width:auto;margin:0}</style><div class="site-presentation"><main>${markup}</main></div>`;
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/alpha.css"><style>body{margin:0}.alpha-line{width:min(1440px,calc(100% - 96px));margin:20px auto}.alpha-line-art{border:0;border-radius:0;background:transparent}.alpha-line-layout{align-items:start}.alpha-line-panel{visibility:hidden}@media(max-width:600px){.alpha-line{width:calc(100% - 48px)}}</style><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script><div class="alpha-line"><div class="alpha-line-layout"><div class="alpha-line-stage"><div class="alpha-line-art"><canvas></canvas><svg class="alpha-line-leaders"></svg><div class="alpha-line-numbers"></div></div></div><aside class="alpha-line-panel"></aside></div></div><script type="module">import {mountAlphaLine} from '/modules/components/manufacturing/alpha-line-renderer.js';import {alphaTourStateAt} from '/modules/components/manufacturing/alpha-line-tour.js';import {alphaLineStations} from '/modules/components/manufacturing/alpha-line-config.js';const query=new URLSearchParams(location.search);document.documentElement.dataset.theme=query.get('theme')||'light';document.body.style.background=query.get('background')||'white';const host=document.querySelector('.alpha-line-art');document.querySelector('.alpha-line-numbers').innerHTML=alphaLineStations.filter(s=>s.kind!=='tank').map(s=>'<span data-station="'+s.id+'" data-kind="'+s.kind+'" data-active="'+(s.id==='LOAD')+'">'+(s.kind==='tank'?s.number:s.name)+'</span>').join('');document.querySelector('svg').innerHTML=['LOAD','UNLOAD'].map(id=>'<line data-bay="'+id+'"/>').join('');await mountAlphaLine(document.querySelector('canvas'),host,{paused:true,initialState:alphaTourStateAt(0),onState(){},onSelect(){},onReady(){},onEnded(){}});</script>`;
const imports='<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>';
const ui=require('react-dom/server').renderToString(require('react').createElement(require(path.join(root,'components/manufacturing/AlphaLineExperience.tsx')).AlphaLineExperience));
const cockpit=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/alpha.css"><style>body{padding:24px}.alpha-line{max-width:1380px;margin:auto}.alpha-line-art{container-type:size}</style><div id="root">${ui}</div><script>document.documentElement.dataset.theme=new URLSearchParams(location.search).get('theme')||'light';</script><script defer src="/bundle/ui.js"></script>`;
const processHtml=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{margin:0}.alpha-process-art{width:100vw;height:100vh;position:relative}canvas{width:100%;height:100%;display:block}</style>${imports}<div class="alpha-process-art"><canvas></canvas></div><script type="module">import {mountAlphaProcess} from '/modules/components/home/alpha-process-renderer.js';const q=new URLSearchParams(location.search);document.documentElement.dataset.theme=q.get('theme')||'light';document.body.style.background=q.get('background')||'white';await mountAlphaProcess(document.querySelector('canvas'),document.querySelector('div'),{paused:true,onStage(){},onReady(){}});</script>`;
http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
  if(pathname==='/capture'){const capture=html.replace(/<style>[\s\S]*?<\/style>/,'<style>body{margin:0}.alpha-line,.alpha-line-layout,.alpha-line-stage,.alpha-line-art{display:block!important;width:100vw!important;height:100vh!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important}.alpha-line-panel,.alpha-line-numbers,.alpha-line-leaders{display:none!important}</style>');res.setHeader('Content-Type','text/html; charset=utf-8');res.end(capture);return;}
  if(pathname==='/cockpit'){res.setHeader('Content-Type','text/html');res.end(cockpit);return;}
  if(pathname==='/process'){res.setHeader('Content-Type','text/html');res.end(processHtml);return;}
  if(pathname==='/composition'){res.setHeader('Content-Type','text/html');res.end(composition);return;}
  const base=pathname.startsWith('/bundle/')?path.join(root,'node_modules/.cache/alpha-preview-ui'):pathname.startsWith('/modules/')?cache:pathname.startsWith('/three/')?path.join(root,'node_modules/three'):pathname.startsWith('/optimized/')?path.join(root,'public/optimized'):null;
  let file=pathname==='/presentation.css'?path.join(root,'components/brand/presentation.css'):pathname==='/globals.css'?path.join(root,'app/globals.css'):pathname==='/alpha.css'?path.join(root,'app/manufacturing/alpha.css'):base?path.resolve(base,'.'+pathname.replace(/^\/(bundle|modules|three|optimized)/,'')):null;
  if(!file || base&&!file.startsWith(base+path.sep)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'text/javascript');res.end(await fs.readFile(file));
}catch{res.writeHead(404);res.end();}}).listen(Number(process.env.ALPHA_PREVIEW_PORT||3111),'127.0.0.1',()=>console.log('Alpha artwork authoring on port '+(process.env.ALPHA_PREVIEW_PORT||3111)));
