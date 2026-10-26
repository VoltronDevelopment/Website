import * as T from 'three';
export const handshakePlacement={x:.58,y:.08,z:.18};
const {x,y,z}=handshakePlacement;
export const handContactTransforms=[new T.Matrix4().makeTranslation(-x,y,-z).multiply(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(1,0,0),new T.Vector3(0,0,-1))),new T.Matrix4().makeTranslation(x,-y,z).multiply(new T.Matrix4().makeRotationZ(Math.PI/2))];

// Vertical triangle columns accelerate the local, baked skin-contact solve.
export function contactField(vertices,indices){
 const buckets=new Map(),step=.07;
 for(let i=0;i<indices.length;i+=3){const tri=[vertices[indices[i]],vertices[indices[i+1]],vertices[indices[i+2]]];for(let x=Math.floor(Math.min(...tri.map(p=>p.x))/step);x<=Math.floor(Math.max(...tri.map(p=>p.x))/step);x++)for(let y=Math.floor(Math.min(...tri.map(p=>p.y))/step);y<=Math.floor(Math.max(...tri.map(p=>p.y))/step);y++){const key=x+','+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(tri);}}
 return point=>{
  const hits=[];for(const [a,b,c]of buckets.get(Math.floor(point.x/step)+','+Math.floor(point.y/step))||[]){const d=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);if(Math.abs(d)<1e-9)continue;const u=((b.y-c.y)*(point.x-c.x)+(c.x-b.x)*(point.y-c.y))/d,v=((c.y-a.y)*(point.x-c.x)+(a.x-c.x)*(point.y-c.y))/d;if(u>=0&&v>=0&&u+v<=1)hits.push(u*a.z+v*b.z+(1-u-v)*c.z);}
  hits.sort((a,b)=>a-b);const unique=hits.filter((v,i)=>!i||Math.abs(v-hits[i-1])>.001),above=unique.filter(v=>v>point.z+.001);
  if(above.length%2!==1||!unique.length)return 0;
  const closest=unique.reduce((best,z)=>Math.abs(z-point.z)<Math.abs(best-point.z)?z:best,unique[0]);return closest-point.z;
 };
}

/** A single projection can misclassify a tiny open seam in the scanned mesh. */
export function contactProbe(vertices,indices){
 const fields=[contactField(vertices,indices),contactField(vertices.map(p=>new T.Vector3(p.y,p.z,p.x)),indices),contactField(vertices.map(p=>new T.Vector3(p.z,p.x,p.y)),indices)];
 const a=new T.Vector3(),b=new T.Vector3();
 return point=>{
  const deltas=[fields[0](point),fields[1](a.set(point.y,point.z,point.x)),fields[2](b.set(point.z,point.x,point.y))],inside=deltas.filter(value=>Math.abs(value)>.001);
  return {inside:inside.length>=2,depth:inside.length>=2?Math.min(...inside.map(Math.abs)):0,z:deltas[0]};
 };
}

export function resolveHandContact(rest,closed,indices,options={}){
 const transforms=options.transforms||handContactTransforms,limit=options.limit??.055;
 const lookup=new Map(),representatives=[],map=new Uint32Array(rest.length/3);
 for(let i=0;i<rest.length;i+=3){const key=[rest[i],rest[i+1],rest[i+2]].map(v=>Math.round(v/.025)).join(',');let j=lookup.get(key);if(j===undefined){j=representatives.length;lookup.set(key,j);representatives.push(i/3);}map[i/3]=j;}
 const faces=[];for(let i=0;i<indices.length;i+=3){const a=map[indices[i]],b=map[indices[i+1]],c=map[indices[i+2]];if(a!==b&&a!==c&&b!==c)faces.push(a,b,c);}
 const worlds=transforms.map(matrix=>representatives.map(index=>new T.Vector3().fromArray(closed,index*3).applyMatrix4(matrix)));
 const starts=worlds.map(vertices=>vertices.map(p=>p.z));
 const neighbours=representatives.map(()=>new Set());for(let i=0;i<faces.length;i+=3)for(let k=0;k<3;k++){neighbours[faces[i+k]].add(faces[i+(k+1)%3]);neighbours[faces[i+k]].add(faces[i+(k+2)%3]);}
 for(let iteration=0;iteration<9;iteration++){
  const fields=worlds.map(vertices=>contactProbe(vertices,faces));
  const changes=worlds.map((vertices,hand)=>vertices.map((point,i)=>{
   const index=representatives[i]*3;if(options.reference?rest[index+1]<-.5:rest[index+1]<-.1||closed[index+2]>.15)return 0;
   const contact=fields[1-hand](point);return contact.inside?T.MathUtils.clamp(contact.z,-.025,.025)*.45:0;
  }));
  worlds.forEach((vertices,hand)=>vertices.forEach((point,i)=>{
   let average=0;for(const j of neighbours[i])average+=changes[hand][j];average/=Math.max(1,neighbours[i].size);
   point.z=T.MathUtils.clamp(point.z+changes[hand][i]*.65+average*.35,starts[hand][i]-limit,starts[hand][i]+limit);
  }));
 }
 return worlds.map((vertices,hand)=>{
  const inverse=transforms[hand].clone().invert(),correction=vertices.map((p,i)=>p.clone().applyMatrix4(inverse).sub(new T.Vector3().fromArray(closed,representatives[i]*3))),output=closed.slice();
  for(let i=0;i<map.length;i++){output[i*3]+=correction[map[i]].x;output[i*3+1]+=correction[map[i]].y;output[i*3+2]+=correction[map[i]].z;}
  return output;
 });
}
