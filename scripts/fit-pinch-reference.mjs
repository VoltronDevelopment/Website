// Offline geometric audit. Samples are evidence, not a continuous collision proof.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import * as T from 'three';
import {contactProbe} from './hand-contact-solver.mjs';

function moduleURL(file){
 let source=fs.readFileSync(file,'utf8');
 source=source.replace(/from\s+(["'])(\.[^"']+)\1/g,(_,quote,relative)=>`from ${quote}${moduleURL(path.resolve(path.dirname(file),relative+'.ts'))}${quote}`);
 return 'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
}
const {handSceneState,cultureCubePosition}=await import(moduleURL(path.resolve('components/brand/hand-scene-timeline.ts')));
const anchors=JSON.parse(fs.readFileSync('public/hands/anchors.json','utf8'));
const read=name=>{const b=fs.readFileSync('public/hands/'+name);return new Float32Array(b.buffer,b.byteOffset,b.length/4);};
function surface(kind){const b=fs.readFileSync(`public/hands/${kind}-depth.bin`),count=b.readUInt32LE(0),n=b.readUInt32LE(4);return {base:new Float32Array(b.buffer,b.byteOffset+8,count*3),indices:new Uint32Array(b.buffer,b.byteOffset+8+count*12,n),pose:read(kind+'-pose-depth.bin'),samples:read(kind+'-points.bin'),target:read(kind+'-pose.bin')};}
const hand=surface('hand'),index=new T.Vector3(...anchors.pinch.index),thumb=new T.Vector3(...anchors.pinch.thumb),centre=index.clone().add(thumb).multiplyScalar(.5),span=index.clone().sub(thumb).normalize();
const wrist=new T.Vector3(0,-1,0).addScaledVector(span,span.y).normalize(),across=new T.Vector3(0,1,0),right=new T.Vector3(7,0,-6).normalize();
const q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(across,right,new T.Vector3().crossVectors(across,right)).multiply(new T.Matrix4().makeBasis(span,wrist,new T.Vector3().crossVectors(span,wrist)).invert()));
const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(hand.base,3));geometry.setIndex(new T.BufferAttribute(hand.indices,1));const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));mesh.quaternion.copy(q);
const hold=new T.Vector3(0,1.5,0);
function align(scale){mesh.scale.setScalar(scale);mesh.position.copy(hold).sub(centre.clone().applyQuaternion(q).multiplyScalar(scale));mesh.updateMatrixWorld(true);}
function gap(){const a=new T.Raycaster(hold,across).intersectObject(mesh)[0],b=new T.Raycaster(hold,across.clone().negate()).intersectObject(mesh)[0];if(!a||!b)throw Error('No opposing pads');return {distance:a.distance+b.distance,centre:a.point.clone().add(b.point).multiplyScalar(.5)};}
align(.8);align(T.MathUtils.clamp(.8*.36/gap().distance,.6,1.8));const corrected=gap();mesh.position.add(hold.clone().sub(corrected.centre));mesh.updateMatrixWorld(true);

const centreHome=mesh.position.clone(),points=[];
for(let i=0;i<hand.samples.length/8;i+=6)points.push(new T.Vector3().fromArray(hand.samples,i*8).sub(centre).applyQuaternion(q));
const result=[];
for(const scale of [1.2,1.4,1.6,1.8,2.0])for(const dx of [-.18,-.12,-.06,0,.06,.12,.18])for(const dy of [-.06,0,.06])for(const dz of [-.18,-.12,-.06,0,.06,.12,.18]){
 let inside=0,penalty=0,max=0,top=1,bottom=1;
 for(const p of points){const x=p.x*scale+dx,y=p.y*scale+dy,z=p.z*scale+dz,depth=.184-Math.max(Math.abs(x),Math.abs(y),Math.abs(z));if(depth>0){inside++;penalty+=depth*depth;max=Math.max(max,depth);}if(Math.abs(x)<.12&&Math.abs(z)<.12){if(y>0)top=Math.min(top,Math.abs(y-.18));else bottom=Math.min(bottom,Math.abs(y+.18));}}
 const score=penalty*20000+max*100+top*10+bottom*10+Math.abs(scale-1.5)*.02;
 result.push({scale,dx,dy,dz,inside,penalty,max,top,bottom,score});
}
result.sort((a,b)=>a.score-b.score);console.log(JSON.stringify(result.slice(0,8),null,2));fs.writeFileSync('.audit-logs/hand-authoring/pinch-fit.json',JSON.stringify(result.slice(0,50),null,2));
