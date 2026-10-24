import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import * as THREE from "three";
const root=new URL("../public/intelligence/",import.meta.url);
const {data,info}=await sharp(fileURLToPath(new URL("face-source.png",root))).resize(136,170,{fit:"fill"}).removeAlpha().raw().toBuffer({resolveWithObject:true});
const samples=[];
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const index=(y*info.width+x)*info.channels;
  const level=(data[index]*.2126+data[index+1]*.7152+data[index+2]*.0722)/255;
  if(level<.08)continue;
  const px=(x/(info.width-1)-.5)*1.9,py=(.5-y/(info.height-1))*2.5;
  const depth=Math.round(level*8)/8*.19;
  samples.push(...[px,py,depth,level].map(value=>Number(value.toFixed(4))));
}
await fs.writeFile(new URL("face-points.json",root),JSON.stringify(samples));
const camera=new THREE.OrthographicCamera(-2.2*700/620,2.2*700/620,2.2,-2.2,.1,50);camera.position.set(12,9.6,14);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const project=p=>{const v=new THREE.Vector3(...p).project(camera);return [(v.x+1)*350,(1-v.y)*310].map(n=>n.toFixed(2)).join(",");};
const vertices=Array.from({length:8},(_,i)=>[(i&1)?1.2:-1.2,(i&2)?1.2:-1.2,(i&4)?1.2:-1.2]);
for(const dark of [false,true]){
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="620" viewBox="0 0 700 620">`;
  for(const indices of [[2,3,7,6],[1,3,7,5],[4,5,7,6]])svg+=`<polygon points="${indices.map(i=>project(vertices[i])).join(" ")}" fill="${dark?"#397da8":"#91c7ec"}" fill-opacity=".07"/>`;
  for(let i=0;i<samples.length;i+=4){const [x,y,,level]=samples.slice(i,i+4);svg+=`<circle cx="${(350+x*620/4.4).toFixed(2)}" cy="${(310-y*620/4.4).toFixed(2)}" r="${(.55+level*.65).toFixed(2)}" fill="${dark?`rgb(${Math.round(66+148*level)},${Math.round(135+105*level)},${Math.round(212+43*level)})`:"#174778"}" opacity="${(.35+level*.6).toFixed(2)}"/>`;}
  for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))svg+=`<polyline points="${project(vertices[i])} ${project(vertices[i|bit])}" fill="none" stroke="${dark?"#78b0ff":"#246bd4"}" stroke-width="1.3" opacity=".55"/>`;
  svg+="</svg>";
  await sharp(Buffer.from(svg)).webp({quality:90}).toFile(fileURLToPath(new URL(`face-cube-${dark?"dark":"light"}.webp`,root)));
}
console.log(`Built ${samples.length/4} portrait particles and two static posters.`);
