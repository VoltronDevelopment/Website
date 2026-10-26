// Trace the supplied alpha silhouette; never substitute a generated brand mark.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import crypto from 'node:crypto';
const source='public/Brand Assets/voltron brand page/voltron-hero-assets/voltron-mark-original.png';
const bytes=await fs.readFile(source),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const w=info.width,h=info.height,on=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&data[(y*w+x)*4+3]>=96;
const edges=new Map(),key=(x,y)=>y*(w+1)+x,add=(x,y,a,b)=>{const k=key(x,y);const list=edges.get(k)||[];list.push([a,b]);edges.set(k,list);};
for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(on(x,y)){
 if(!on(x,y-1))add(x,y,x+1,y);if(!on(x+1,y))add(x+1,y,x+1,y+1);
 if(!on(x,y+1))add(x+1,y+1,x,y+1);if(!on(x-1,y))add(x,y+1,x,y);
}
const area=p=>p.reduce((a,v,i)=>{const q=p[(i+1)%p.length];return a+v[0]*q[1]-q[0]*v[1];},0)/2;
const loops=[];
while(edges.size){const start=edges.keys().next().value;let at=start;const p=[];do{p.push([at%(w+1),Math.floor(at/(w+1))]);const list=edges.get(at),next=list.pop();if(!list.length)edges.delete(at);at=key(...next);}while(at!==start&&p.length<100000);
 const reduced=p.filter((v,i)=>{const a=p[(i+p.length-1)%p.length],b=p[(i+1)%p.length];return (v[0]-a[0])*(b[1]-v[1])!==(v[1]-a[1])*(b[0]-v[0]);});
 if(reduced.length>=3&&Math.abs(area(reduced))>1)loops.push(reduced);
}
const contains=(p,[x,y])=>{let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;};
const shapes=loops.filter(p=>area(p)>0).map(outline=>({outline,holes:[]}));
for(const hole of loops.filter(p=>area(p)<0)){const owner=shapes.filter(s=>contains(s.outline,hole[0])).sort((a,b)=>area(a.outline)-area(b.outline))[0];if(owner)owner.holes.push(hole);}
await fs.writeFile('public/heroes/voltron-mark-outline.json',JSON.stringify({sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),width:w,height:h,shapes}));
console.log(`Exact alpha trace: ${shapes.length} shapes, ${loops.length} contours`);
