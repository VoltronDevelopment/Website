import * as T from 'three';

/** Snapshot the posed world surface once. Tessellation must not determine particle density. */
export function sampleWorldSurface(root:T.Object3D,count:number,random:()=>number){
 root.updateWorldMatrix(true,true);
 const triangles:{mesh:T.Mesh;offset:number;end:number}[]=[];
 const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3();
 let area=0;
 function vertices(mesh:T.Mesh,offset:number){
  const index=mesh.geometry.index;
  mesh.getVertexPosition(index?index.getX(offset):offset,a).applyMatrix4(mesh.matrixWorld);
  mesh.getVertexPosition(index?index.getX(offset+1):offset+1,b).applyMatrix4(mesh.matrixWorld);
  mesh.getVertexPosition(index?index.getX(offset+2):offset+2,c).applyMatrix4(mesh.matrixWorld);
 }
 root.traverse(object=>{
  const mesh=object as T.Mesh;if(!mesh.isMesh||!mesh.geometry.attributes.position)return;
  const length=mesh.geometry.index?.count??mesh.geometry.attributes.position.count;
  for(let offset=0;offset+2<length;offset+=3){vertices(mesh,offset);const weight=ab.subVectors(b,a).cross(ac.subVectors(c,a)).length()/2;if(weight>0&&Number.isFinite(weight)){area+=weight;triangles.push({mesh,offset,end:area});}}
 });
 const positions=new Float32Array(Math.max(0,Math.floor(count))*3);
 if(!triangles.length)return positions;
 const point=new T.Vector3();
 for(let i=0;i<positions.length/3;i++){
  const target=Math.min(1-Number.EPSILON,Math.max(0,random()))*area;let lo=0,hi=triangles.length-1;
  while(lo<hi){const mid=(lo+hi)>>>1;if(target<triangles[mid].end)hi=mid;else lo=mid+1;}
  const triangle=triangles[lo];vertices(triangle.mesh,triangle.offset);
  const u=Math.sqrt(random()),v=random();point.copy(a).multiplyScalar(1-u).addScaledVector(b,u*(1-v)).addScaledVector(c,u*v);point.toArray(positions,i*3);
 }
 return positions;
}
