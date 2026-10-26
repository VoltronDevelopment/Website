import fs from 'node:fs';
import {bindHand,deformHand,poseTransforms} from './hand-pose-authoring.mjs';
import {buildHandGeodesics} from './hand-surface-binding.mjs';
const vertices=[],indices=[];
for(const line of fs.readFileSync('public/3D hand/hand1.OBJ','utf8').split('\n')){
 if(line.startsWith('v ')){const p=line.trim().split(/\s+/).slice(1).map(Number);vertices.push((p[0]-65)*.055,(p[1]-190)*.055,(p[2]-64)*.055);}
 else if(line.startsWith('f ')){const p=line.trim().split(/\s+/).slice(1).map(v=>Number(v.split('/')[0])-1);for(let j=1;j<p.length-1;j++)indices.push(p[0],p[j],p[j+1]);}
}
const rest=new Float32Array(vertices),surface=buildHandGeodesics(rest,indices,{index:[-.23,1.98,.369],middle:[-.77,1.67,.318],ring:[-.99,1.2,.189],little:[-1,.72,.17],thumb:[.58,1.43,-.556],palm:[0,-.35,.2]}),posed=deformHand(rest,bindHand(rest,'pinch',surface),poseTransforms('pinch'),'pinch');
let checked=0,overTwo=0,overThree=0,overFive=0,max=0;const worst=[];
for(let i=0;i<indices.length;i+=3)for(let k=0;k<3;k++){
 const a=indices[i+k]*3,b=indices[i+(k+1)%3]*3,before=Math.hypot(rest[a]-rest[b],rest[a+1]-rest[b+1],rest[a+2]-rest[b+2]);if(before<.005)continue;
 const ratio=Math.hypot(posed[a]-posed[b],posed[a+1]-posed[b+1],posed[a+2]-posed[b+2])/before;
 checked++;if(ratio>12)worst.push({ratio,source:Array.from(rest.slice(a,a+3)),posed:Array.from(posed.slice(a,a+3)),neighbour:Array.from(rest.slice(b,b+3))});max=Math.max(max,ratio);if(ratio>2)overTwo++;if(ratio>3)overThree++;if(ratio>5)overFive++;
}
const result={checked,overTwo,overThree,overFive,max,worst:worst.sort((a,b)=>b.ratio-a.ratio).slice(0,4)};console.log(JSON.stringify(result));fs.mkdirSync('.audit-logs/hand-authoring',{recursive:true});fs.writeFileSync('.audit-logs/hand-authoring/strain.json',JSON.stringify(result,null,2));
if(overFive>0)process.exitCode=1;
