import fs from 'node:fs';
import * as T from 'three';
import path from 'node:path';
import ts from 'typescript';
function moduleURL(file){let source=fs.readFileSync(file,'utf8');source=source.replace(/from\s+(["'])(\.[^"']+)\1/g,(_,quote,relative)=>`from ${quote}${moduleURL(path.resolve(path.dirname(file),relative+'.ts'))}${quote}`);return 'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');}
const {cultureCorePosition,cultureHead,handSceneState}=await import(moduleURL(path.resolve('components/brand/hand-scene-timeline.ts')));
const route=JSON.parse(fs.readFileSync('public/sculptures/arm-path.json'));
const b=fs.readFileSync('public/sculptures/arm-mesh.bin'),count=b.readUInt32LE(0),vertices=new Float32Array(b.buffer,b.byteOffset+8,count*8),samplesBytes=fs.readFileSync('public/sculptures/arm-points.bin'),samples=new Float32Array(samplesBytes.buffer,samplesBytes.byteOffset,samplesBytes.length/4);
const right=new T.Vector3(7,0,-6).normalize(),normal=new T.Vector3(6,0,7).normalize();
const board=(r,y,d)=>right.clone().multiplyScalar(r).add(new T.Vector3(0,y,0)).addScaledVector(normal,d);
const armOffset=board(...route.armOffset),world=values=>{const points=[];for(let i=0;i<values.length;i+=8){const p=new T.Vector3(values[i],values[i+1],values[i+2]).applyAxisAngle(new T.Vector3(0,1,0),route.armTwist).applyAxisAngle(new T.Vector3(0,0,1),route.armRotation).multiplyScalar(route.scale);points.push(board(p.x,p.y,p.z).add(armOffset));}return points;};
const points=[...world(vertices),...world(samples)],report=[];
const poses=[];for(let i=0;i<route.points.length-1;i++)for(let k=0;k<4;k++){const a=route.points[i],b=route.points[i+1],t=k/4;poses.push({s:T.MathUtils.lerp(a.s,b.s,t),r:T.MathUtils.lerp(a.r,b.r,t),y:T.MathUtils.lerp(a.y,b.y,t),d:T.MathUtils.lerp(a.d,b.d,t),q:new T.Quaternion(...a.q).slerp(new T.Quaternion(...b.q),t).toArray(),supportHits:Math.min(a.supportHits,b.supportHits)});}poses.push(route.points.at(-1));
for(const entry of poses){const inverse=new T.Quaternion(...entry.q).invert(),centre=board(entry.r,entry.y,entry.d);let inside=0,worst=0;
 for(const p of points){const q=p.clone().sub(centre).applyQuaternion(inverse),depth=.18-Math.max(Math.abs(q.x),Math.abs(q.y),Math.abs(q.z));if(depth>.006){inside++;worst=Math.max(worst,depth);}}
 report.push({s:entry.s,inside,worst,support:entry.supportHits});
}
const hb=fs.readFileSync('public/sculptures/head-mesh.bin'),hc=hb.readUInt32LE(0),ha=new Float32Array(hb.buffer,hb.byteOffset+8,hc*8),headWorld=[];
for(let i=0;i<hc;i++){const p=new T.Vector3(ha[i*8],ha[i*8+1],ha[i*8+2]).multiplyScalar(cultureHead.scale).applyAxisAngle(new T.Vector3(0,1,0),cultureHead.yaw);headWorld.push(board(p.x,p.y,p.z).add(board(cultureHead.r,cultureHead.y,cultureHead.d)));}
const crown=[];for(let time=4;time<=6.25;time+=.05){const state=handSceneState('culture',time),centre=board(...cultureCorePosition(state.emerge,state.transfer));let inside=0,worst=0;for(const p of headWorld){const q=p.clone().sub(centre),depth=.41-Math.max(Math.abs(q.x),Math.abs(q.y),Math.abs(q.z));if(depth>.006){inside++;worst=Math.max(worst,depth);}}crown.push({time,inside,worst});}
const result={note:'Sampled vertices and surface points; local support was baked with 54 cube-surface probes per pose. This does not certify continuous triangle collision.',crown,crownWorst:Math.max(...crown.map(x=>x.worst)),checked:points.length,pose:route.pose,frames:report,worst:Math.max(...report.map(x=>x.worst))};
fs.mkdirSync('.audit-logs/sculpture-review',{recursive:true});fs.writeFileSync('.audit-logs/sculpture-review/contact-audit.json',JSON.stringify(result,null,2));
console.log({frames:report.length,checked:points.length,worst:result.worst,penetratingFrames:report.filter(x=>x.inside).length,crownWorst:result.crownWorst});
if(result.worst>.006||result.crownWorst>.006)process.exitCode=1;
