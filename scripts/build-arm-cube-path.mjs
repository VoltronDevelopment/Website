import fs from 'node:fs';
import * as T from 'three';
const b=fs.readFileSync('public/sculptures/arm-mesh.bin'),count=b.readUInt32LE(0),n=b.readUInt32LE(4),data=new Float32Array(b.buffer,b.byteOffset+8,count*8),positions=[];
for(let i=0;i<count;i++)positions.push(data[i*8],data[i*8+1],data[i*8+2]);
const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(new T.BufferAttribute(new Uint32Array(b.buffer,b.byteOffset+8+count*32,n),1));
const armRotation=-Math.PI/3,armTwist=-Math.PI/4;
g.rotateY(armTwist);
g.rotateZ(armRotation);
const mesh=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide})),ray=new T.Raycaster(),back=new T.Vector3(0,0,-1),scale=3.6;
const right=new T.Vector3(7,0,-6).normalize(),normal=new T.Vector3(6,0,7).normalize(),basis=new T.Matrix4().makeBasis(right,new T.Vector3(0,1,0),normal),yaw=new T.Quaternion().setFromRotationMatrix(basis);
function front(x,y){ray.set(new T.Vector3(x,y,3),back);return ray.intersectObject(mesh)[0]?.point.z;}
const corridor=[];
// Only the palm carries the cube; the forearm keeps its authored anatomy.
const sourceG=g.clone().rotateZ(-armRotation),sourceMesh=new T.Mesh(sourceG,new T.MeshBasicMaterial({side:T.DoubleSide}));
function sourceFront(x,y){ray.set(new T.Vector3(x,y,3),back);return ray.intersectObject(sourceMesh)[0]?.point.z;}
for(let y=.10;y<=.18;y+=.0025){const hits=[];for(let x=-.40;x<=.40;x+=.01)if(Number.isFinite(sourceFront(x,y)))hits.push(x);if(hits.length)corridor.push({y,x:(hits[0]+hits.at(-1))/2});}
if(corridor.length<25)throw Error('Natural arm corridor unavailable');
for(let i=1;i<corridor.length-1;i++)corridor[i].x=(corridor[i-1].x+corridor[i].x+corridor[i+1].x)/3;
const start=corridor.at(-1).y,end=corridor[0].y,endX=corridor[0].x,length=(start-end)*scale,turns=Math.max(1,Math.round(length/.36)),points=[];
const centreX=y=>{const index=T.MathUtils.clamp((y-end)/.0025,0,corridor.length-1),a=Math.floor(index),b=Math.min(a+1,corridor.length-1);return T.MathUtils.lerp(corridor[a].x,corridor[b].x,index-a);};
const probes=[];for(let axis=0;axis<3;axis++)for(const sign of [-1,1])for(const u of [-1,0,1])for(const v of [-1,0,1]){const p=new T.Vector3();p.setComponent(axis,sign*.18);p.setComponent((axis+1)%3,u*.18);p.setComponent((axis+2)%3,v*.18);probes.push(p);}
for(let i=0;i<=80;i++){
 const s=i/80,sourceY=start+(end-start)*s,sourceX=centreX(sourceY),centre=new T.Vector3(sourceX,sourceY,0).applyAxisAngle(new T.Vector3(0,0,1),armRotation),x=centre.x,y=centre.y,angle=-(1-s)*turns*Math.PI/2,q=yaw.clone().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(Math.cos(armRotation),Math.sin(armRotation),0),angle));
 if(s>.84)q.slerp(new T.Quaternion(),T.MathUtils.smoothstep(s,.84,1));
 let support=-Infinity,hits=0;
 for(const original of probes){const p=original.clone().applyQuaternion(q),z=front(x+p.dot(right)/scale,y+p.y/scale);if(Number.isFinite(z)){support=Math.max(support,z*scale-p.dot(normal));hits++;}}
 if(hits<6)throw Error('Insufficient support along rolling path at '+s);
 // Refine clearance against the prepared surface, including between ray probes.
 const inverse=q.clone().invert(),localNormal=normal.clone().applyQuaternion(inverse);
 const samples=fs.readFileSync('public/sculptures/arm-points.bin'),sampleData=new Float32Array(samples.buffer,samples.byteOffset,samples.length/4);
 const candidate=[];for(let j=0;j<data.length;j+=8)candidate.push(new T.Vector3(data[j],data[j+1],data[j+2]).applyAxisAngle(new T.Vector3(0,1,0),armTwist).applyAxisAngle(new T.Vector3(0,0,1),armRotation).multiplyScalar(scale));
 for(let j=0;j<sampleData.length;j+=8)candidate.push(new T.Vector3(sampleData[j],sampleData[j+1],sampleData[j+2]).applyAxisAngle(new T.Vector3(0,1,0),armTwist).applyAxisAngle(new T.Vector3(0,0,1),armRotation).multiplyScalar(scale));
 let depth=support+.022;
 for(let pass=0;pass<80;pass++){let inside=false;for(const v of candidate){const delta=right.clone().multiplyScalar(v.x-x*scale).add(new T.Vector3(0,v.y-y*scale,0)).addScaledVector(normal,v.z-depth).applyQuaternion(inverse);if(Math.max(Math.abs(delta.x),Math.abs(delta.y),Math.abs(delta.z))<.182){inside=true;break;}}if(!inside)break;depth+=.004;}
 points.push({s,r:(x-endX)*scale,y:(y-end)*scale,d:depth,q:q.toArray(),supportHits:hits});
}
const finalDepth=points.at(-1).d,finalR=points.at(-1).r,finalY=points.at(-1).y;for(const p of points){p.d-=finalDepth;p.r-=finalR;p.y-=finalY;}
fs.writeFileSync('public/sculptures/arm-path.json',JSON.stringify({version:3,pose:'upper-right-palm',armRotation,armTwist,edge:.36,scale,turns,length,armOffset:[-endX*scale-finalR,-end*scale-finalY,-finalDepth],points},null,2));
console.log({points:points.length,turns,length,start,end,minSupport:Math.min(...points.map(p=>p.supportHits))});
