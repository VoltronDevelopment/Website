import fs from 'node:fs';
import * as T from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
const root=new OBJLoader().parse(fs.readFileSync('public/3D face/female_head.obj','utf8'));
let head;root.traverse(o=>{if(o.isMesh&&o.name.endsWith(':head'))head=o;});
let seed=73921;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const faceWeight=(y,z)=>smooth(2,8,-y)*smooth(9,15,z)*(1-smooth(25,32,z));
const source=head.geometry.attributes.position;const weights=[];
for(let i=0;i<source.count;i++){const y=source.getY(i),z=source.getZ(i);weights.push(.5+3.8*faceWeight(y,z));}
head.geometry.setAttribute("weight",new T.Float32BufferAttribute(weights,1));
const sampler=new MeshSurfaceSampler(head).setWeightAttribute("weight").setRandomGenerator(random).build();
const p=new T.Vector3(),n=new T.Vector3(),rotation=new T.Matrix4().makeRotationY(1.20).multiply(new T.Matrix4().makeRotationX(-.20)),data=[];
// Preserve the facial landmarks; compress only the upper cranium above the brow.
// The normal uses the inverse Jacobian of exactly the same deformation.
function preparePoint(point,normal){
 const h=Math.max(0,point.z-25.5),t=Math.min(1,h/3),s=t*t*(3-2*t);
 const derivative=1-.32*(s+(t<1?h*2*t*(1-t):0));
 point.z-=.32*h*s;
 if(normal)normal.set(normal.x,normal.y,normal.z/derivative).normalize();
 point.set(point.x,point.z-21.8,-point.y-2).multiplyScalar(.116).applyMatrix4(rotation);point.y+=.03;
 if(normal)normal.set(normal.x,normal.z,-normal.y).transformDirection(rotation);
 return point;
}
while(data.length/8<45000){sampler.sample(p,n);if(p.z<8.5)continue;
 const original=p.clone();preparePoint(p,n);
 if(Math.max(Math.abs(p.x),Math.abs(p.z))>1.43||p.y < -1.48||p.y>1.53)continue;
 // A porous rear skull; anatomy remains dense around the forward surface.
 const rear=original.y>0?1:0;if(rear&&random()<.45)continue;
 const dispersing=rear&&random()<.65;
 if(dispersing){p.x+=(random()-.5)*.15;p.z+=(random()-.5)*.15;}
 data.push(p.x,p.y,p.z,n.x,n.y,n.z,random(),dispersing?1:-faceWeight(original.y,original.z));
}
fs.writeFileSync('public/intelligence/head-points.bin',Buffer.from(new Float32Array(data).buffer));
fs.writeFileSync('public/intelligence/head-points.meta.json',JSON.stringify({version:2,crown:{sourceBrow:25.5,compression:.32,transition:3},count:45000,stride:8,source:'3D face/female_head.obj',seed:73921,axes:'Y up; source Z up converted; yaw 1.20 radians; pitch -0.20 radians',attributes:['position.xyz','normal.xyz','seed','rear']}));
console.log('Prepared 45000 surface samples with normals');

// Weld the source into a compact indexed depth surface. It never writes colour.
const verts=[],indices=[],lookup=new Map();const a=head.geometry.attributes.position;
for(let i=0;i<a.count;i+=3){const triangle=[];let keep=true;for(let j=0;j<3;j++){const p=new T.Vector3().fromBufferAttribute(a,i+j);if(p.z<8.5)keep=false;preparePoint(p);if(p.y < -1.48||p.y>1.53)keep=false;triangle.push(p);}if(!keep)continue;
 for(const p of triangle){const key=p.toArray().map(v=>Math.round(v*100000)).join(',');let index=lookup.get(key);if(index===undefined){index=verts.length/3;lookup.set(key,index);verts.push(...p.toArray());}indices.push(index);}}
const header=new Uint32Array([verts.length/3,indices.length]);fs.writeFileSync('public/intelligence/head-depth.bin',Buffer.concat([Buffer.from(header.buffer),Buffer.from(new Float32Array(verts).buffer),Buffer.from(new Uint32Array(indices).buffer)]));
console.log('Depth surface',verts.length/3,'vertices',indices.length/3,'triangles');
