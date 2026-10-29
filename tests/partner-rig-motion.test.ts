import {afterEach,expect,it,vi} from 'vitest';
import fs from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createPartnerActor,partnerFootstep,partnerStart} from '../components/brand/partner-rig-motion';
import {collaborationState} from '../components/brand/collaboration-timeline';
import {partnerStage} from '../components/brand/partner-stage';
import {partnerPanelInverse} from '../components/brand/partner-stage-space';

afterEach(()=>vi.unstubAllGlobals());
it('locks the feet during stance and lands the three arrivals at the final standing position',()=>{
 for(const first of [true,false]){const a=partnerFootstep(0,first),b=partnerFootstep(1,first);expect(a).toEqual({advance:0,lift:0,pitch:0});expect(b).toEqual({advance:1,lift:0,pitch:0});
  const start=first?.34:.01,end=first?.65:.32;for(let p=start;p<end;p+=.02){expect(partnerFootstep(p,first).lift).toBe(0);expect(partnerFootstep(p,first).advance).toBe(first?.5:0);}
  let previous=0;for(let p=0;p<=1;p+=.005){const foot=partnerFootstep(p,first);expect(foot.advance).toBeGreaterThanOrEqual(previous);expect(foot.lift).toBeLessThanOrEqual(.065);previous=foot.advance;}
 }
});
it('poses both real rigs reversibly with clear presentation hands and non-twisting elbows',async()=>{
 vi.stubGlobal('ProgressEvent',class{constructor(_name:string,init:object){Object.assign(this,init);}});
 const loaded=await Promise.all(['carla','eric'].map(async name=>{const g=JSON.parse(fs.readFileSync(`public/stories/partner-${name}.gltf`,'utf8'));expect(g.images).toBeUndefined();expect(g.textures).toBeUndefined();g.buffers[0].uri='data:application/octet-stream;base64,'+fs.readFileSync(`public/stories/partner-${name}.bin`).toString('base64');return new GLTFLoader().parseAsync(JSON.stringify(g),'');}));const material=new T.MeshPhysicalMaterial();const actors=[0,1].map(i=>createPartnerActor(loaded[i].scene,i,material));
 expect(actors.map(a=>a.bones)).toEqual([89,89]);expect(actors.map(a=>a.meshes.length)).toEqual([1,1]);
 const poses=new Map<number,number[]>();
 for(const p of [0,.125,.25,.375,.5,.625,.75,.875,1,.5,0,1]){
  actors.forEach(a=>a.pose(p,p===1?1:0,p===1?12:3.5+p*3.5,p===1?1:0));
  const values=actors.flatMap(a=>a.meshes.flatMap(m=>{m.computeBoundingBox();return [...m.boundingBox!.min.toArray(),...m.boundingBox!.max.toArray()];}));expect(values.every(Number.isFinite)).toBe(true);
  if(poses.has(p))values.forEach((v,i)=>expect(v).toBeCloseTo(poses.get(p)![i],5));else poses.set(p,values);
  actors.forEach((a,i)=>expect(Math.abs(a.root.position.x)).toBeCloseTo(T.MathUtils.lerp(partnerStart,a.stopDistance,p)));
 }
 // Exercise the whole curved reach, including the intermediate poses absent from the final tableau.
 for(let time=6.1;time<=12;time+=.1){const state=collaborationState('partner',time);actors.forEach((a,i)=>{a.pose(state.walks[i],state.gesture,time,state.stamp);expect(a.activePalm.getWorldPosition(new T.Vector3()).distanceTo(a.armTargets[i?0:1])).toBeLessThan(.015);expect(a.footTargets.every(t=>t.y<.20)).toBe(true);const point=a.activePalm.getWorldPosition(new T.Vector3()).applyMatrix4(partnerPanelInverse);if(Math.abs(point.x)<partnerStage.panel.width/2&&Math.abs(point.y)<partnerStage.panel.height/2)expect(point.z-partnerStage.panel.depth/2).toBeGreaterThan(.04);});}
 actors.forEach(a=>a.pose(1,1,12,1));
 for(const [i,a]of actors.entries()){
  const armSide=i?'l':'r',upper=a.root.getObjectByName(i?'upperarm_l_024':'upperarm_r_049')!,elbow=a.root.getObjectByName(i?'lowerarm_l_025':'lowerarm_r_050')!,hand=a.activePalm;
  const arm=elbow.getWorldPosition(new T.Vector3()).sub(upper.getWorldPosition(new T.Vector3())).normalize(),forearm=hand.getWorldPosition(new T.Vector3()).sub(elbow.getWorldPosition(new T.Vector3())).normalize();
  expect(Math.acos(T.MathUtils.clamp(arm.dot(forearm),-1,1))).toBeGreaterThan(.25);expect(Math.abs(elbow.quaternion.x)).toBeLessThan(.001);expect(Math.abs(elbow.quaternion.y)).toBeLessThan(.001);
  expect(hand.getWorldPosition(new T.Vector3()).distanceTo(a.armTargets[i?0:1])).toBeLessThan(.015);
  for(const digit of ['index','middle','ring','pinky']){let bone:T.Object3D|undefined;a.root.traverse(o=>{if(o.name.startsWith(digit+'_end_'+armSide+'_'))bone=o;});const p=bone!.getWorldPosition(new T.Vector3()).applyMatrix4(partnerPanelInverse);if(Math.abs(p.x)<partnerStage.panel.width/2&&Math.abs(p.y)<partnerStage.panel.height/2)expect(p.z-partnerStage.panel.depth/2).toBeGreaterThan(.04);}
 }
 // Check actual deformed fingertips against the trouser silhouette, not merely wrist targets.
 for(const [i,a]of actors.entries()){
  const authored=loaded[i].scene.getObjectByName(i?'hand_r_051':'hand_l_026')!;expect(a.idlePalm.quaternion.angleTo(authored.quaternion)).toBeLessThan(.0001);
  const mesh=a.meshes[0],ids=mesh.geometry.getAttribute('skinIndex'),weights=mesh.geometry.getAttribute('skinWeight'),pants:T.Vector3[]=[];
  for(let v=0;v<ids.count;v++){let influence=0;for(let k=0;k<4;k++)if(/^(hip_|upperleg_)/.test(mesh.skeleton.bones[ids.array[v*4+k]].name))influence+=weights.array[v*4+k];if(influence>.45){const p=new T.Vector3();mesh.getVertexPosition(v,p).applyMatrix4(mesh.matrixWorld);pants.push(a.root.worldToLocal(p));}}
  for(const digit of ['index','middle','ring','pinky']){let tip:T.Object3D|undefined;const side=i?'r':'l';a.root.traverse(o=>{if(o.name.startsWith(digit+'_end_'+side+'_'))tip=o;});const point=a.root.worldToLocal(tip!.getWorldPosition(new T.Vector3())),sign=Math.sign(point.x),slice=pants.filter(p=>Math.abs(p.y-point.y)<.08);expect(slice.length).toBeGreaterThan(5);expect(point.x*sign-Math.max(...slice.map(p=>p.x*sign))).toBeGreaterThan(.01);}
 }
 for(const a of actors){expect(a.footTargets.every(t=>t.y<.20)).toBe(true);expect(new T.Box3().setFromObject(a.root).getSize(new T.Vector3()).y).toBeGreaterThan(1.6);}
 const geometries=new Set<T.BufferGeometry>();loaded.forEach(g=>g.scene.traverse(o=>{if(o instanceof T.Mesh)geometries.add(o.geometry);}));geometries.forEach(g=>g.dispose());actors.forEach(a=>a.meshes.forEach(m=>m.skeleton.dispose()));material.dispose();
});
