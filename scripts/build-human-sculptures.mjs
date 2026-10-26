// Offline preparation; source models and textures remain unchanged.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import * as T from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import {MeshoptSimplifier} from 'meshoptimizer/simplifier';

await MeshoptSimplifier.ready;
const out='public/sculptures';fs.mkdirSync(out,{recursive:true});
let dostiRotation=new T.Matrix4();
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
function gltf(file){
 const bytes=fs.readFileSync(file),isGLB=file.endsWith('.glb'),length=isGLB?bytes.readUInt32LE(12):0;
 const json=isGLB?JSON.parse(bytes.subarray(20,20+length).toString()):JSON.parse(bytes.toString());
 const bin=isGLB?bytes.subarray(28+length):fs.readFileSync(new URL(json.buffers[0].uri,new URL('../'+file,import.meta.url)));
 const read=index=>{const a=json.accessors[index],v=json.bufferViews[a.bufferView],columns={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],Constructor={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType],offset=(v.byteOffset||0)+(a.byteOffset||0),result=[];
  for(let i=0;i<a.count;i++)for(let k=0;k<columns;k++){const at=offset+i*(v.byteStride||columns*Constructor.BYTES_PER_ELEMENT)+k*Constructor.BYTES_PER_ELEMENT;result.push(a.componentType===5126?bin.readFloatLE(at):a.componentType===5125?bin.readUInt32LE(at):a.componentType===5123?bin.readUInt16LE(at):bin[at]);}return result;};
 const root=new T.Group();
 function node(index,parent){const n=json.nodes[index],group=new T.Group();if(n.matrix)group.applyMatrix4(new T.Matrix4().fromArray(n.matrix));else{if(n.translation)group.position.fromArray(n.translation);if(n.rotation)group.quaternion.fromArray(n.rotation);if(n.scale)group.scale.fromArray(n.scale);}parent.add(group);
  if(n.mesh!==undefined)for(const p of json.meshes[n.mesh].primitives){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(read(p.attributes.POSITION),3));if(p.indices!==undefined)g.setIndex(read(p.indices));group.add(new T.Mesh(g));}
  for(const child of n.children||[])node(child,group);
 }for(const index of json.scenes[json.scene||0].nodes)node(index,root);root.updateMatrixWorld(true);return root;
}
function collect(root){const positions=[],normals=[],indices=[],parts=[];root.updateMatrixWorld(true);let part=0;root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld),a=g.attributes.position,offset=positions.length/3;for(let i=0;i<a.count;i++){positions.push(a.getX(i),a.getY(i),a.getZ(i));parts.push(part);if(g.attributes.normal)normals.push(g.attributes.normal.getX(i),g.attributes.normal.getY(i),g.attributes.normal.getZ(i));else normals.push(0,1,0);}if(g.index)for(const index of g.index.array)indices.push(index+offset);else for(let i=0;i<a.count;i++)indices.push(offset+i);g.dispose();part++;});return {positions,indices,parts,normals};}
function weld(data){const map=new Map(),positions=[],parts=[],indices=[],remap=[];for(let i=0;i<data.positions.length/3;i++){const p=data.positions.slice(i*3,i*3+3),key=p.map(x=>Math.round(x*100000)).join(',');let j=map.get(key);if(j===undefined){j=positions.length/3;map.set(key,j);positions.push(...p);parts.push(data.parts[i]||0);}remap[i]=j;}for(let i=0;i<data.indices.length;i+=3){const a=remap[data.indices[i]],b=remap[data.indices[i+1]],c=remap[data.indices[i+2]];if(a!==b&&b!==c&&a!==c)indices.push(a,b,c);}return {positions:new Float32Array(positions),indices:new Uint32Array(indices),parts};}
function normalize(data,kind){
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(data.positions),3));g.setIndex(Array.from(data.indices));if(data.normals)g.setAttribute('normal',new T.Float32BufferAttribute(data.normals,3));
 if(kind==='dosti'){
  g.rotateY(Math.PI/2);
  const a=g.attributes.position;let xx=0,xy=0,yy=0;const centre=new T.Vector3();for(let i=0;i<a.count;i++)centre.add(new T.Vector3().fromBufferAttribute(a,i));centre.divideScalar(a.count);
  for(let i=0;i<a.count;i++){const x=a.getX(i)-centre.x,y=a.getY(i)-centre.y;xx+=x*x;xy+=x*y;yy+=y*y;}const angle=-.5*Math.atan2(2*xy,xx-yy);g.rotateZ(angle);dostiRotation=new T.Matrix4().makeRotationZ(angle).multiply(new T.Matrix4().makeRotationY(Math.PI/2));
 }
 // Bounds of referenced vertices only: cropping must not retain shoulder bounds.
 const bound=new T.Box3();for(const index of g.index.array)bound.expandByPoint(new T.Vector3().fromBufferAttribute(g.attributes.position,index));
 const centre=bound.getCenter(new T.Vector3()),size=bound.getSize(new T.Vector3());
 g.translate(-centre.x,kind==='head'||kind==='planes'||kind==='arm'?-bound.min.y:-centre.y,-centre.z);
 const scale=1/(kind==='head'||kind==='planes'||kind==='arm'?size.y:size.x);g.scale(scale,scale,scale);
 const prepared={positions:Array.from(g.attributes.position.array),indices:Array.from(g.index.array),parts:data.parts,normals:g.attributes.normal?Array.from(g.attributes.normal.array):undefined};return kind==='dosti'?{...prepared,positions:new Float32Array(prepared.positions),indices:new Uint32Array(prepared.indices)}:weld(prepared);
}
function withoutBrain(data){
 const parent=Array.from({length:data.positions.length/3},(_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
 for(let i=0;i<data.indices.length;i+=3){const [a,b,c]=data.indices.slice(i,i+3);parent[find(a)]=find(b);parent[find(c)]=find(b);}
 const groups=new Map();for(let i=0;i<data.indices.length;i+=3){const key=find(data.indices[i]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(...data.indices.slice(i,i+3));}
 const kept=[];let removed=0;for(const indices of groups.values()){let max=-Infinity;for(const index of indices)max=Math.max(max,data.positions[index*3+1]);if(indices.length===456*3&&max>8)removed++;else kept.push(...indices);}if(removed!==2)throw Error('Brain component identity changed');return {...data,indices:new Uint32Array(kept)};
}
function subdivide(data){
 const positions=Array.from(data.positions),parts=[...data.parts],indices=[],cache=new Map();
 const midpoint=(a,b)=>{const key=a<b?a+','+b:b+','+a;if(cache.has(key))return cache.get(key);const j=positions.length/3;for(let k=0;k<3;k++)positions.push((positions[a*3+k]+positions[b*3+k])/2);parts.push(parts[a]);cache.set(key,j);return j;};
 for(let i=0;i<data.indices.length;i+=3){const [a,b,c]=data.indices.slice(i,i+3),ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);indices.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}
 const neighbours=positions.map(()=>null).slice(0,positions.length/3).map(()=>new Set());for(let i=0;i<indices.length;i+=3)for(let k=0;k<3;k++){neighbours[indices[i+k]].add(indices[i+(k+1)%3]);neighbours[indices[i+k]].add(indices[i+(k+2)%3]);}
 const smoothPass=(source,factor)=>{const output=source.slice();neighbours.forEach((set,i)=>{if(!set.size)return;for(let k=0;k<3;k++){let sum=0;for(const n of set)sum+=source[n*3+k];output[i*3+k]+=(sum/set.size-source[i*3+k])*factor;}});return output;};
 return {positions:new Float32Array(smoothPass(smoothPass(positions,.32),-.33)),indices:new Uint32Array(indices),parts};
}
const manifest={version:1,assets:{},credits:[{asset:'arm',title:'Arm & Hand sculpting',author:'alfance',url:'https://sketchfab.com/3d-models/arm-hand-sculpting-e97f3be309ce4907afbcfa672832808d',license:'CC BY 4.0'}]};
const sources={head:'public/brain-in-head/source/Brain In Head.glb',arm:'public/arm__hand_sculpting/scene.gltf',dosti:'public/rrrs-dosti-symbol/source/#DostiSymbol.fbx',planes:'public/planes-of-the-head/source/planes of the head_DECIM.zip'};
if(process.env.SCULPTURE_ASSETS&&fs.existsSync(`${out}/manifest.json`))Object.assign(manifest.assets,JSON.parse(fs.readFileSync(`${out}/manifest.json`)).assets);
for(const kind of Object.keys(sources).filter(k=>!process.env.SCULPTURE_ASSETS||process.env.SCULPTURE_ASSETS.split(',').includes(k))){
 let root;
 if(kind==='dosti'){globalThis.window={URL:globalThis.URL};const manager=new T.LoadingManager();manager.addHandler(/.*/,{setPath(){return this;},load(){return new T.Texture();}});const b=fs.readFileSync(sources[kind]);root=new FBXLoader(manager).parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'');}
 else if(kind==='planes'){const source=execFileSync('python',['-c',"import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);sys.stdout.buffer.write(z.read(next(n for n in z.namelist() if n.lower().endswith('.obj'))))",sources[kind]],{maxBuffer:60*1024*1024});root=new OBJLoader().parse(source.toString());}
 else root=gltf(sources[kind]);
 let data=kind==='dosti'?collect(root):weld(collect(root));if(kind==='head')data=withoutBrain(data);data=normalize(data,kind);
 // Preserve the Dosti artist's geometry and split normals exactly.
 const target=kind==='arm'?18000:kind==='planes'?22000:20000;
 if(data.indices.length>target*3){const [indices]=MeshoptSimplifier.simplify(data.indices,data.positions,3,target*3,.006,['Permissive']);data.indices=indices;}
 // Compact away unreferenced vertices after crop and simplification.
 const lookup=new Map(),positions=[],normals=[],parts=[],indices=[];for(const old of data.indices){let index=lookup.get(old);if(index===undefined){index=positions.length/3;lookup.set(old,index);positions.push(...data.positions.slice(old*3,old*3+3));parts.push(data.parts[old]||0);if(data.normals)normals.push(...data.normals.slice(old*3,old*3+3));}indices.push(index);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);if(kind==='dosti'&&normals.length)geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));else geometry.computeVertexNormals();
 const vertex=[],normal=geometry.attributes.normal,p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){const region=kind==='head'||kind==='planes'?smooth(p.getY(i)):kind==='arm'?smooth(1-p.getY(i)):smooth((p.getX(i)+.5));vertex.push(p.getX(i),p.getY(i),p.getZ(i),normal.getX(i),normal.getY(i),normal.getZ(i),region,parts[i]);}
 fs.writeFileSync(`${out}/${kind}-mesh.bin`,Buffer.concat([Buffer.from(new Uint32Array([p.count,indices.length]).buffer),Buffer.from(new Float32Array(vertex).buffer),Buffer.from(new Uint32Array(indices).buffer)]));
 let seed=kind==='head'?38273:kind==='arm'?58299:78271;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const sampler=new MeshSurfaceSampler(new T.Mesh(geometry)).setRandomGenerator(random).build(),point=new T.Vector3(),n=new T.Vector3(),samples=[],count=kind==='planes'?32000:kind==='arm'?22000:20000;
 for(let i=0;i<count;i++){sampler.sample(point,n);const region=kind==='head'||kind==='planes'?smooth(point.y):kind==='arm'?smooth(1-point.y):smooth(point.x+.5);samples.push(...point.toArray(),...n.normalize().toArray(),region,random());}
 fs.writeFileSync(`${out}/${kind}-points.bin`,Buffer.from(new Float32Array(samples).buffer));
 manifest.assets[kind]={source:sources[kind],vertices:p.count,triangles:indices.length/3,particles:count,stride:8};if(kind==='dosti')Object.assign(manifest.assets[kind],{authoredNormals:true,sourceTriangles:2588,poseLocked:true});if(kind==='arm')manifest.assets[kind].orientation='original-y-up';if(kind==='dosti')manifest.assets[kind].referenceView={direction:new T.Vector3(4,2.2,6).normalize().transformDirection(dostiRotation).toArray(),up:new T.Vector3(0,1,0).transformDirection(dostiRotation).toArray()};console.log(kind,manifest.assets[kind]);
}
fs.writeFileSync(`${out}/manifest.json`,JSON.stringify(manifest,null,2));
