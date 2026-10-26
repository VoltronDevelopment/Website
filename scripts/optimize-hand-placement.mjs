import fs from 'node:fs';
import * as T from 'three';
import {contactProbe} from './hand-contact-solver.mjs';
const handshakePlacement=JSON.parse(fs.readFileSync('public/hands/anchors.json','utf8')).handshake;
const {x,y,z}=handshakePlacement;
const handContactTransforms=[new T.Matrix4().makeTranslation(-x,y,-z).multiply(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(1,0,0),new T.Vector3(0,0,-1))),new T.Matrix4().makeTranslation(x,-y,z).multiply(new T.Matrix4().makeRotationZ(Math.PI/2))];
const read=name=>{const b=fs.readFileSync('public/hands/'+name);return new Float32Array(b.buffer,b.byteOffset,b.length/4);};
const b=fs.readFileSync('public/hands/grip-depth.bin'),header=new Uint32Array(b.buffer,b.byteOffset,2),indices=new Uint32Array(b.buffer,b.byteOffset+8+header[0]*12,header[1]);
const depths=[read('grip-pose-depth.bin'),read('grip-other-pose-depth.bin')],samples=[read('grip-pose.bin'),read('grip-other-pose.bin')];
const worlds=depths.map((data,hand)=>{const vertices=[];for(let i=0;i<data.length;i+=6)vertices.push(new T.Vector3(data[i],data[i+1],data[i+2]).applyMatrix4(handContactTransforms[hand]));return vertices;});
const probes=worlds.map(vertices=>contactProbe(vertices,indices));
const clouds=samples.map((data,hand)=>{const points=[];for(let i=0;i<data.length;i+=6*4)points.push(new T.Vector3(data[i],data[i+1],data[i+2]).applyMatrix4(handContactTransforms[hand]));return points;});
const near=clouds.map(points=>{const buckets=new Map(),step=.06;for(const p of points){const key=[p.x,p.y,p.z].map(v=>Math.floor(v/step)).join(',');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(p);}return point=>{const x=Math.floor(point.x/step),y=Math.floor(point.y/step),z=Math.floor(point.z/step);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++)for(const other of buckets.get([x+a,y+b,z+c].join(','))||[])if(point.distanceToSquared(other)<.035**2)return true;return false;};});
const results=[];
for(const x of [.04,.08,.12,.16,.20,.24])for(const y of [0,.04,.08,.12,.16])for(const z of [-.25,-.30,-.35,-.40,-.45]){
 let penalty=0,contact=0,deep=0,max=0;
 for(let hand=0;hand<2;hand++){
  const sign=hand===0?1:-1,offset=new T.Vector3(sign*2*(handshakePlacement.x-x),sign*2*(y-handshakePlacement.y),sign*2*(handshakePlacement.z-z));
  for(let i=0;i<clouds[hand].length;i+=16){const point=clouds[hand][i].clone().add(offset),probe=probes[1-hand](point);if(probe.inside){penalty+=Math.max(0,probe.depth-.015)**2;max=Math.max(max,probe.depth);if(probe.depth>.035)deep++;}if(near[1-hand](point))contact++;}
 }
 const score=penalty*1000+Math.max(0,15-contact)*.05;
 results.push({x,y,z,score,penalty,contact,deep,max});
}
results.sort((a,b)=>a.score-b.score);console.log(JSON.stringify(results.slice(0,10),null,2));fs.writeFileSync('.audit-logs/hand-authoring/placement-search.json',JSON.stringify(results,null,2));
