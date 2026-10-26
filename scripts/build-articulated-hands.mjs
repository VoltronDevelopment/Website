import fs from 'node:fs';
import * as T from 'three';
import {prepareRhinoHands} from './rhino-hand-authoring.mjs';
const out='public/hands';fs.mkdirSync(out,{recursive:true});
const prepared=prepareRhinoHands();
const mesh=(position,index)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(position,3));g.setIndex(index);g.computeVertexNormals();const n=g.attributes.normal;for(let i=0;i<n.count;i++)if(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))<.001)n.setXYZ(i,0,0,1);return g;};
const anchors=prepared.anchors;
for(const kind of ['hand','grip']){
 const {base,target,other,indices,original}=prepared[kind];
 const geometry=mesh(base,indices),targetGeometry=mesh(target,indices),otherGeometry=other?mesh(other,indices):null,normals=geometry.attributes.normal.array,targetNormals=targetGeometry.attributes.normal.array;
 let seed=kind==='hand'?81371:93119;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const cdf=new Float64Array(indices.length/3),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();let total=0;
 for(let i=0;i<indices.length;i+=3){a.fromArray(base,indices[i]*3);b.fromArray(base,indices[i+1]*3);c.fromArray(base,indices[i+2]*3);total+=b.sub(a).cross(c.sub(a)).length()*.5;cdf[i/3]=total;}
 const points=[],posePoints=[],otherPoints=[],count=kind==='hand'?42000:32000;
 for(let i=0;i<count;i++){
  const sample=random()*total;let lo=0,hi=cdf.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(cdf[mid]<sample)lo=mid+1;else hi=mid;}
  let u=random(),v=random();if(u+v>1){u=1-u;v=1-v;}const weights=[1-u-v,u,v],triangle=indices.slice(lo*3,lo*3+3);
  const interpolate=array=>{const p=new T.Vector3();triangle.forEach((index,j)=>p.addScaledVector(a.fromArray(array,index*3),weights[j]));return p;};
  const position=interpolate(base),normal=interpolate(normals).normalize(),end=interpolate(target),endNormal=interpolate(targetNormals).normalize();
  points.push(...position.toArray(),...normal.toArray(),random(),T.MathUtils.clamp((interpolate(original).y+.2)/2.2,0,1));posePoints.push(...end.toArray(),...endNormal.toArray());
  if(otherGeometry)otherPoints.push(...interpolate(other).toArray(),...interpolate(otherGeometry.attributes.normal.array).normalize().toArray());
 }
 fs.writeFileSync(`${out}/${kind}-points.bin`,Buffer.from(new Float32Array(points).buffer));fs.writeFileSync(`${out}/${kind}-pose.bin`,Buffer.from(new Float32Array(posePoints).buffer));
 if(otherGeometry)fs.writeFileSync(`${out}/grip-other-pose.bin`,Buffer.from(new Float32Array(otherPoints).buffer));
 // Weld once in rest space, retaining exactly the same topology in both poses.
 const lookup=new Map(),map=new Uint32Array(original.length/3),representatives=[];
 for(let i=0;i<original.length;i+=3){const key=[original[i],original[i+1],original[i+2]].map(v=>Math.round(v/.00001)).join(',');let index=lookup.get(key);if(index===undefined){index=representatives.length;lookup.set(key,index);representatives.push(i/3);}map[i/3]=index;}
 const faces=[];for(let i=0;i<indices.length;i+=3){const [a,b,c]=[map[indices[i]],map[indices[i+1]],map[indices[i+2]]];if(a!==b&&a!==c&&b!==c)faces.push(a,b,c);}
 const start=new Float32Array(representatives.flatMap(index=>[base[index*3],base[index*3+1],base[index*3+2]]));
 const finish=new Float32Array(representatives.flatMap(index=>[target[index*3],target[index*3+1],target[index*3+2]]));
 const targetDepth=mesh(finish,faces),finishNormals=targetDepth.attributes.normal.array,depthPose=[];
 for(let i=0;i<finish.length;i+=3)depthPose.push(finish[i],finish[i+1],finish[i+2],finishNormals[i],finishNormals[i+1],finishNormals[i+2]);
 fs.writeFileSync(`${out}/${kind}-depth.bin`,Buffer.concat([Buffer.from(new Uint32Array([start.length/3,faces.length]).buffer),Buffer.from(start.buffer),Buffer.from(new Uint32Array(faces).buffer)]));
 fs.writeFileSync(`${out}/${kind}-pose-depth.bin`,Buffer.from(new Float32Array(depthPose).buffer));
 if(otherGeometry){const otherFinish=new Float32Array(representatives.flatMap(index=>[other[index*3],other[index*3+1],other[index*3+2]])),g=mesh(otherFinish,faces),n=g.attributes.normal.array,data=[];for(let i=0;i<otherFinish.length;i+=3)data.push(otherFinish[i],otherFinish[i+1],otherFinish[i+2],n[i],n[i+1],n[i+2]);fs.writeFileSync(`${out}/grip-other-pose-depth.bin`,Buffer.from(new Float32Array(data).buffer));g.dispose();otherGeometry.dispose();}
 console.log(kind,count,'samples;',start.length/3,'depth vertices;',faces.length/3,'faces');geometry.dispose();targetGeometry.dispose();targetDepth.dispose();
}
fs.writeFileSync(`${out}/anchors.json`,JSON.stringify(anchors,null,2));
fs.writeFileSync(`${out}/manifest.json`,JSON.stringify({version:2,source:prepared.source,stride:8,poseStride:6,attributes:['position.xyz','normal.xyz','seed','finger'],handCount:42000,gripCount:32000,notes:'Rhino P08 pinch and wrist-aligned P15/P11 matching-topology grip. Shared barycentric particle/depth correspondence; reference geometry remains hidden.'},null,2));
