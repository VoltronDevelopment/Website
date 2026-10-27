// Derive route-specific assets without modifying the downloaded source bundles.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {execFileSync} from 'node:child_process';

const out='public/stories';fs.mkdirSync(out,{recursive:true});
const source=JSON.parse(fs.readFileSync('public/populate_models_stairs/scene.gltf','utf8'));
const buffer=fs.readFileSync('public/populate_models_stairs/scene.bin');
// Preserve two original stair structures and their matching authored walkers.
const selected=new Set([0,1,2,3]);
function retain(i){selected.add(i);for(const child of source.nodes[i].children||[])retain(child);}
retain(5);retain(77);retain(381);retain(452);
const ids=[...selected].sort((a,b)=>a-b),nodeMap=new Map(ids.map((id,i)=>[id,i]));
const meshIds=[...new Set(ids.flatMap(i=>source.nodes[i].mesh===undefined?[]:[source.nodes[i].mesh]))];
const meshMap=new Map(meshIds.map((id,i)=>[id,i]));
const accessors=new Set(),views=new Set();
const meshes=meshIds.map(i=>({name:source.meshes[i].name,primitives:source.meshes[i].primitives.map(p=>{
 const attributes=Object.fromEntries(Object.entries(p.attributes).filter(([key])=>!key.startsWith('TEXCOORD')));
 Object.values(attributes).forEach(a=>accessors.add(a));if(p.indices!==undefined)accessors.add(p.indices);
 return {...p,material:undefined,attributes};
})}));
const skinIds=[...new Set(ids.flatMap(i=>source.nodes[i].skin===undefined?[]:[source.nodes[i].skin]))],skinMap=new Map(skinIds.map((id,i)=>[id,i]));
const skins=skinIds.map(id=>{const skin=structuredClone(source.skins[id]);skin.joints=skin.joints.map(i=>nodeMap.get(i));if(skin.joints.some(i=>i===undefined))throw Error('Missing selected skeleton joint');if(skin.skeleton!==undefined)skin.skeleton=nodeMap.get(skin.skeleton);accessors.add(skin.inverseBindMatrices);return skin;});
function subtree(i,result=new Set()){result.add(i);for(const child of source.nodes[i].children||[])subtree(child,result);return result;}
const animations=[5,381].map((root,index)=>{const scope=subtree(root),animation=structuredClone(source.animations[0]);animation.name=index?'L stair ascent':'Straight stair ascent';animation.channels=animation.channels.filter(c=>scope.has(c.target.node));const samplerIds=[...new Set(animation.channels.map(c=>c.sampler))],samplerMap=new Map(samplerIds.map((id,i)=>[id,i]));animation.samplers=samplerIds.map(i=>animation.samplers[i]);animation.samplers.forEach(s=>{accessors.add(s.input);accessors.add(s.output);});animation.channels.forEach(c=>{c.sampler=samplerMap.get(c.sampler);c.target.node=nodeMap.get(c.target.node);});return animation;});
const accessorIds=[...accessors].sort((a,b)=>a-b),accessorMap=new Map(accessorIds.map((id,i)=>[id,i]));
accessorIds.forEach(i=>views.add(source.accessors[i].bufferView));const viewIds=[...views].sort((a,b)=>a-b),viewMap=new Map(viewIds.map((id,i)=>[id,i]));
let offset=0;const chunks=[],packedAccessors=[],deduplicated=new Map();const sizes={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},bytes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const bufferViews=accessorIds.map((id,index)=>{const a=source.accessors[id],v=source.bufferViews[a.bufferView],unit=sizes[a.type]*bytes[a.componentType],data=Buffer.alloc(a.count*unit);for(let row=0;row<a.count;row++){const start=(v.byteOffset||0)+(a.byteOffset||0)+row*(v.byteStride||unit);buffer.copy(data,row*unit,start,start+unit);}const hash=createHash('sha256').update(data).digest('hex'),existing=deduplicated.get(hash);if(existing){packedAccessors.push({...a,bufferView:index,byteOffset:0});return {...existing};}const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}const result={buffer:0,byteOffset:offset,byteLength:data.length};deduplicated.set(hash,result);chunks.push(data);offset+=data.length;packedAccessors.push({...a,bufferView:index,byteOffset:0});return result;});
const derived={asset:{version:'2.0',generator:'Voltron selected stair/walker derivative',copyright:'Based on populate models (stairs), vicente betoret ferrero, CC BY 4.0'},scene:0,scenes:[{nodes:[0]}],nodes:ids.map(i=>{const n=structuredClone(source.nodes[i]);if(n.children)n.children=n.children.filter(c=>selected.has(c)).map(c=>nodeMap.get(c));if(n.mesh!==undefined)n.mesh=meshMap.get(n.mesh);if(n.skin!==undefined)n.skin=skinMap.get(n.skin);return n;}),meshes,skins,animations,accessors:packedAccessors,bufferViews,buffers:[{uri:'progression.bin',byteLength:offset}]};
meshes.forEach(m=>m.primitives.forEach(p=>{for(const k of Object.keys(p.attributes))p.attributes[k]=accessorMap.get(p.attributes[k]);if(p.indices!==undefined)p.indices=accessorMap.get(p.indices);}));
skins.forEach(s=>s.inverseBindMatrices=accessorMap.get(s.inverseBindMatrices));animations.forEach(animation=>animation.samplers.forEach(s=>{s.input=accessorMap.get(s.input);s.output=accessorMap.get(s.output);}));
fs.writeFileSync(out+'/progression.gltf',JSON.stringify(derived));fs.writeFileSync(out+'/progression.bin',Buffer.concat(chunks));

// Read the original archive directly; no downloaded model is overwritten.
const zipPath=fs.realpathSync('public/human-after-all/source/all.zip');
const ps="Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[System.IO.Compression.ZipFile]::OpenRead('"+zipPath.replaceAll("'","''")+"'); $r=[System.IO.StreamReader]::new($z.Entries[0].Open()); [Console]::Out.Write($r.ReadToEnd()); $r.Dispose(); $z.Dispose()";
const obj=execFileSync('powershell',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8',maxBuffer:10*1024*1024,windowsHide:true});
const figures=new OBJLoader().parse(obj),meta=[];
figures.children.forEach((figure,i)=>{
 const raw=figure.geometry.clone();raw.deleteAttribute('normal');raw.deleteAttribute('uv');const g=mergeVertices(raw);raw.dispose();g.computeBoundingBox();const b=g.boundingBox,c=b.getCenter(new T.Vector3()),height=b.max.y-b.min.y;
 g.translate(-c.x,-b.min.y,-c.z);g.scale(1/height,1/height,1/height);g.computeVertexNormals();
 const positions=g.getAttribute('position'),normals=g.getAttribute('normal'),indices=g.index.array;
 const data=Buffer.alloc(8+positions.count*24+indices.length*4);data.writeUInt32LE(positions.count,0);data.writeUInt32LE(indices.length,4);
 for(let j=0;j<positions.count;j++)for(let k=0;k<3;k++){data.writeFloatLE(positions.array[j*3+k],8+j*24+k*4);data.writeFloatLE(normals.array[j*3+k],8+j*24+12+k*4);}
 for(let j=0;j<indices.length;j++)data.writeUInt32LE(indices[j],8+positions.count*24+j*4);
 fs.writeFileSync(`${out}/figure-${i}.bin`,data);meta.push({name:figure.name,vertices:positions.count,triangles:indices.length/3,bytes:data.length});g.dispose();
});
fs.writeFileSync(out+'/assets.json',JSON.stringify({progression:{peopleInSource:8,retainedWalkers:2,displayedPeople:3,stairs:2,occupancy:[1,2],skins:2,meshes:meshes.length,channels:animations.reduce((n,a)=>n+a.channels.length,0),bytes:offset,sourceClipSeconds:8.333333015441895},figures:meta},null,2)+'\n');
fs.copyFileSync('public/populate_models_stairs/license.txt',out+'/stairs-license.txt');
console.log(fs.readFileSync(out+'/assets.json','utf8'));
