// Local artwork authoring harness. Uses the production renderer without app/session data.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';
import Module from 'node:module';
const require=createRequire(import.meta.url);
const root=process.cwd(), cache=path.join(root,'node_modules/.cache/factory-particles');
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
await compile('components/home/factory-systems-renderer.ts');
const assets=JSON.parse(await fs.readFile(path.join(root,'lib/optimized-assets.json'),'utf8'));
const names=['Robot arm and cube conveyor-1.png','Pastel display with floating checklists.png','Floating Powder-Blue Brain Sculpture.png'];
const systems=['Execution','Context','Intelligence'];
const descriptions=['Physical production on the factory floor.','Requirements, records and relationships.','Evidence that supports human judgment.'];
const art=names.map(name=>assets['/Brand Assets/voltron brand page/voltron-factory-systems/'+name]?.url);
if(art.some(url=>!url))throw new Error('Missing capability artwork');
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/globals.css"><link rel="stylesheet" href="/home.css"><style>body{margin:0;padding:40px 48px}.factory-systems{max-width:1120px;margin:auto}@media(max-width:767px){body{padding:24px}}</style><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script><figure class="factory-systems"><div class="factory-systems-stage"><canvas class="factory-systems-canvas"></canvas><div class="factory-systems-grid">${systems.map((title,i)=>'<article class="factory-system"><h3>'+title+'</h3><div class="factory-system-anchor" data-system-anchor><div class="factory-system-fallback"><img src="'+art[i]+'" alt=""/></div></div><p>'+descriptions[i]+'</p></article>').join('')}</div></div></figure><script type="module">import {mountFactorySystems} from '/modules/components/home/factory-systems-renderer.js';document.documentElement.dataset.theme=new URLSearchParams(location.search).get('theme')||'light';const controller=mountFactorySystems(document.querySelector('canvas'),document.querySelector('.factory-systems-stage'),{onReady(){},onPhase(){}});await controller.ready;</script>`;
http.createServer(async(req,res)=>{try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
  const base=pathname.startsWith('/modules/')?cache:pathname.startsWith('/three/')?path.join(root,'node_modules/three'):pathname.startsWith('/optimized/')?path.join(root,'public/optimized'):null;
  let file=pathname==='/globals.css'?path.join(root,'app/globals.css'):pathname==='/home.css'?path.join(root,'app/home.css'):base?path.resolve(base,'.'+pathname.replace(/^\/(modules|three|optimized)/,'')):null;
  if(!file || base&&!file.startsWith(base+path.sep)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'text/javascript');res.end(await fs.readFile(file));
}catch{res.writeHead(404);res.end();}}).listen(3112,'127.0.0.1',()=>console.log('Component particle review: http://127.0.0.1:3112'));
