import * as T from 'three';

// Source-space landmarks, inspected against the supplied hand mesh in three views.
const landmarks={
 index:[[.25,.8,.195],[.05,1.35,.514],[-.1,1.75,.467],[-.23,1.98,.369]],
 middle:[[-.02,.65,.34],[-.35,1.1,.576],[-.6,1.42,.455],[-.77,1.67,.318]],
 ring:[[-.3,.4,.351],[-.63,.75,.423],[-.82,1.05,.294],[-.99,1.2,.189]],
 little:[[-.48,.12,.326],[-.7,.4,.397],[-.87,.58,.288],[-1,.72,.17]],
 thumb:[[.55,.05,-.071],[.75,.65,-.131],[.65,1.1,-.473],[.58,1.43,-.556]],
};
export const chains=Object.fromEntries(Object.entries(landmarks).map(([key,values])=>[key,values.map(p=>new T.Vector3(...p))]));
const smooth=v=>{const t=T.MathUtils.clamp(v,0,1);return t*t*(3-2*t);};

const gripChains=Object.fromEntries(Object.entries(chains).map(([name,chain])=>[name,chain.map(p=>new T.Vector3(p.x,p.y,p.z*.6))]));
function solve(chain,endpoint,avoidPalm=false){
 const joints=chain.map(p=>p.clone()),base=joints[0].clone(),lengths=chain.slice(1).map((p,i)=>p.distanceTo(chain[i]));
 const target=new T.Vector3(...endpoint),reach=lengths.reduce((a,b)=>a+b,0);
 if(target.distanceTo(base)>reach*.995)target.sub(base).setLength(reach*.995).add(base);
 for(let iteration=0;iteration<35;iteration++){
  joints[3].copy(target);
  for(let i=2;i>=0;i--)joints[i].sub(joints[i+1]).setLength(lengths[i]).add(joints[i+1]);
  joints[0].copy(base);
  for(let i=1;i<4;i++)joints[i].sub(joints[i-1]).setLength(lengths[i-1]).add(joints[i-1]);
  if(avoidPalm)for(const i of [1,2]){
   const centre=new T.Vector3(.05,.95,-.32),radius=new T.Vector3(.66,.66,.38),relative=joints[i].clone().sub(centre).divide(radius);
   if(relative.length()<1)joints[i].copy(relative.normalize().multiply(radius).add(centre));
  }
 }
 return joints;
}

export function poseTransforms(kind,release=false){
 const endpoints=kind==='pinch'?{
  index:[.15,1.43,.15],thumb:[.50,1.60,-.30],
  middle:[-.12,.62,-.58],ring:[-.4,.28,-.48],little:[-.58,-.05,-.30],
 }:{index:[.28,1.05,-.74],middle:[-.03,.87,-.72],ring:[-.3,.65,-.65],little:[-.5,.40,-.50],thumb:[.72,.83,-.50]};
 if(kind==='pinch'&&release){
  const span=new T.Vector3(...endpoints.index).sub(new T.Vector3(...endpoints.thumb)).normalize(),q=new T.Quaternion().setFromUnitVectors(span,new T.Vector3(0,1,0)),right=new T.Vector3(7,0,-6).normalize(),wrist=new T.Vector3(0,-1,0).applyQuaternion(q);
  q.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.atan2(right.x,right.z)-Math.atan2(wrist.x,wrist.z)+.35));
  const away=right.multiplyScalar(.28/.8).applyQuaternion(q.clone().invert()),up=new T.Vector3(0,.10/.8,0).applyQuaternion(q.clone().invert());
  endpoints.index=new T.Vector3(...endpoints.index).add(away).add(up).toArray();endpoints.thumb=new T.Vector3(...endpoints.thumb).add(away).toArray();
 }
 const poses={};
 for(const [name,chain]of Object.entries(kind==='grip'?gripChains:chains)){
  const solved=solve(chain,endpoints[name],kind==='grip'&&name!=='thumb');
  if(kind==='grip'&&release)solved.forEach((p,i)=>p.lerp(chain[i],.16));
  const rotations=chain.slice(0,3).map((p,i)=>new T.Quaternion().setFromUnitVectors(chain[i+1].clone().sub(p).normalize(),solved[i+1].clone().sub(solved[i]).normalize()));
  poses[name]={joints:solved,rotations,matrices:chain.slice(0,3).map((p,i)=>{
   const q=new T.Quaternion().setFromUnitVectors(chain[i+1].clone().sub(p).normalize(),solved[i+1].clone().sub(solved[i]).normalize());
   return new T.Matrix4().makeTranslation(...solved[i].toArray()).multiply(new T.Matrix4().makeRotationFromQuaternion(q)).multiply(new T.Matrix4().makeTranslation(-p.x,-p.y,-p.z));
  })};
 }
 return poses;
}

export function bindHand(position,kind='pinch',surface=null){
 const binding=[],point=new T.Vector3(),delta=new T.Vector3();
 for(let i=0;i<position.length;i+=3){
  point.fromArray(position,i);const candidates=[];
  for(const [name,chain]of Object.entries(kind==='grip'?gripChains:chains)){
   let distance=Infinity;const segments=[];
   for(let j=0;j<3;j++){
    const direction=chain[j+1].clone().sub(chain[j]),t=T.MathUtils.clamp(delta.copy(point).sub(chain[j]).dot(direction)/direction.lengthSq(),0,1);
    const d=point.distanceToSquared(direction.multiplyScalar(t).add(chain[j]));distance=Math.min(distance,d);segments.push({distance:d,along:j+t});
   }
   // Blend the projection coordinate across adjacent bones. A nearest-segment
   // switch creates a discontinuous skin parameter on the curved source thumb.
   let along=0,total=0;for(const segment of segments){const weight=Math.exp(-(segment.distance-distance)/.02);along+=segment.along*weight;total+=weight;}
   candidates.push({finger:name,along:along/total,distance});
  }
  candidates.sort((a,b)=>a.distance-b.distance);let influences;
  if(surface){
   const node=surface.map[i/3],values=candidates.map(item=>surface.fields[item.finger][node]),palm=surface.fields.palm[node],min=Math.min(palm,...values);
   if(Number.isFinite(min)){let sum=Math.exp(-(palm-min)/.18);influences=candidates.map((item,index)=>{const blend=Math.exp(-(values[index]-min)/.18);sum+=blend;return {...item,blend,weight:smooth(item.along/.75)};});influences.forEach(item=>item.blend/=sum);}
  }
  if(!influences){const min=candidates[0].distance;let sum=0;influences=candidates.slice(0,3).map(item=>{const blend=Math.exp(-(item.distance-min)/.02);sum+=blend;return {...item,blend,weight:smooth(item.along/.75)};});influences.forEach(item=>item.blend/=sum);}
  binding.push(influences);
 }
 return binding;
}

export function deformHand(position,binding,poses,kind){
 const output=new Float32Array(position.length),p=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),change=new T.Vector3(),radial=new T.Vector3(),rotation=new T.Quaternion();
 for(let i=0;i<binding.length;i++){
  p.fromArray(position,i*3);change.set(0,0,0);let weight=0;
  for(const influence of binding[i]){
   const {finger,along,weight:rootWeight,blend}=influence,pose=poses[finger],source=(kind==='grip'?gripChains:chains)[finger],coordinate=T.MathUtils.clamp(along-.5,0,2),lo=Math.floor(coordinate),hi=Math.min(2,lo+1),segment=Math.min(2,Math.floor(along)),fraction=along-segment;
   // Transport a radial skin offset with a unit quaternion, avoiding collapsed knuckles.
   a.copy(source[segment]).lerp(source[segment+1],fraction);b.copy(pose.joints[segment]).lerp(pose.joints[segment+1],fraction);rotation.copy(pose.rotations[lo]).slerp(pose.rotations[hi],smooth(coordinate-lo));
   radial.copy(p).sub(a).applyQuaternion(rotation).add(b).sub(p);change.addScaledVector(radial,rootWeight*blend);weight+=rootWeight*blend;
  }
  p.add(change);
  if(kind==='grip'&&position[i*3+2]<.15){const x=position[i*3],y=position[i*3+1],mask=(1-smooth((Math.hypot((x-.05)/.72,(y-.12)/.78)-.55)/.5))*(1-weight);p.z=.15+(p.z-.15)*(1-.55*mask);}
  if(p.y<-.4)p.y=-.4+(p.y+.4)*1.35;p.toArray(output,i*3);
 }
 return output;
}
