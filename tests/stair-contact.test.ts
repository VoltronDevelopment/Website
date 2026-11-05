import {afterEach,expect,it,vi} from 'vitest';
import fs from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createStairContact,stairContactLift} from '../components/brand/stair-contact';

afterEach(()=>vi.unstubAllGlobals());
it('corrects the actual straight-stair planted foot while preserving the other leg and repeatable poses',async()=>{
 vi.stubGlobal('ProgressEvent',class{constructor(_name:string,init:object){Object.assign(this,init);}});
 const json=JSON.parse(fs.readFileSync('public/stories/progression.gltf','utf8'));json.buffers[0].uri='data:application/octet-stream;base64,'+fs.readFileSync('public/stories/progression.bin').toString('base64');
 const asset=await new GLTFLoader().parseAsync(JSON.stringify(json),'');asset.scene.updateMatrixWorld(true);
 const stair=new T.Group(),material=new T.MeshBasicMaterial({side:T.DoubleSide});
 asset.scene.getObjectByName('StraightStair001')!.traverse(o=>{if(o instanceof T.Mesh)stair.add(new T.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),material));});stair.updateMatrixWorld(true);
 for(const name of ['StraightStair001','LTypeStair002','Bip006'])asset.scene.getObjectByName(name)?.removeFromParent();
 const root=asset.scene,mixer=new T.AnimationMixer(root);mixer.clipAction(asset.animations[0]).setLoop(T.LoopOnce,1).play();const correction=createStairContact(root),vertices:{mesh:T.SkinnedMesh;index:number}[]=[];
 root.traverse(o=>{if(!(o instanceof T.SkinnedMesh))return;const indices=o.geometry.getAttribute('skinIndex'),weights=o.geometry.getAttribute('skinWeight');for(let i=0;i<indices.count;i++){let weight=0;for(let j=0;j<4;j++)if(/_R_.*(Foot|Toe)/.test(o.skeleton.bones[indices.getComponent(i,j)]?.name||''))weight+=weights.getComponent(i,j);if(weight>.8)vertices.push({mesh:o,index:i});}});
 expect(vertices.length).toBe(35);const poses=new Map<number,number[]>();
 for(const time of [2.3,6.65,6.75,6.9,7,7.4,6.75,7.4]){
  correction.restore();mixer.setTime(time);root.updateMatrixWorld(true);
  const opposite=root.getObjectByName('Bip001_L_Foot_061')??(()=>{let found:T.Object3D|undefined;root.traverse(o=>{if(/Bip001_L_Foot_/.test(o.name))found=o;});return found!;})(),before=opposite.getWorldPosition(new T.Vector3());
  let foot:T.Object3D|undefined;root.traverse(o=>{if(/Bip001_R_Foot_/.test(o.name))foot=o;});const angle=foot!.getWorldQuaternion(new T.Quaternion());
  correction.apply(time);root.updateMatrixWorld(true);root.traverse(o=>{if(o instanceof T.SkinnedMesh)o.skeleton.update();});
  expect(opposite.getWorldPosition(new T.Vector3()).distanceTo(before)).toBeLessThan(1e-8);expect(foot!.getWorldQuaternion(new T.Quaternion()).angleTo(angle)).toBeLessThan(.001);
  const values=vertices.map(({mesh,index})=>mesh.localToWorld(mesh.getVertexPosition(index,new T.Vector3()))),flat=values.flatMap(v=>v.toArray());
  if(poses.has(time))flat.forEach((value,i)=>expect(value).toBeCloseTo(poses.get(time)![i],7));else poses.set(time,flat);
  if(time>=6.65&&time<=7){const low=Math.min(...values.map(v=>v.y)),sole=values.filter(v=>v.y<low+.018),center=sole.reduce((v,p)=>v.add(p),new T.Vector3()).multiplyScalar(1/sole.length),hit=new T.Raycaster(center.clone().add(new T.Vector3(0,4,0)),new T.Vector3(0,-1,0)).intersectObject(stair,true)[0];expect(hit).toBeDefined();expect(Math.abs(low-hit.point.y)).toBeLessThan(.02);}
 }
 expect(stairContactLift(2.3)).toBe(0);expect(stairContactLift(7.4)).toBe(0);
 const resources=new Set<T.BufferGeometry>();root.traverse(o=>{if(o instanceof T.Mesh)resources.add(o.geometry);});stair.traverse(o=>{if(o instanceof T.Mesh)resources.add(o.geometry);});resources.forEach(g=>g.dispose());material.dispose();mixer.stopAllAction();mixer.uncacheRoot(root);
});
