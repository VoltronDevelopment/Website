import * as T from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {partnerStage} from './partner-stage';
import {partnerHandTargets} from './partner-stage-space';

export const partnerStart=partnerStage.start,partnerStop=partnerStage.stop;
export const partnerEase=(x:number)=>{const t=T.MathUtils.clamp(x,0,1);return t*t*t*(t*(t*6-15)+10);};
/** Three alternating footfalls finish with a shorter braking step; stance is world-fixed. */
export function partnerFootstep(progress:number,first:boolean){
 const p=T.MathUtils.clamp(progress,0,1),intervals=first?[[0,1/3,.5],[2/3,1,.5]]:[[1/3,2/3,1]];
 let advance=0,lift=0,pitch=0;
 for(const [start,end,distance]of intervals){const u=T.MathUtils.clamp((p-start)/(end-start),0,1);advance+=partnerEase(u)*distance;if(u>0&&u<1){lift=Math.sin(Math.PI*u)**2*(start===2/3?.045:.060);pitch=Math.sin(Math.PI*2*u)*.08;}}
 return {advance,lift,pitch};
}
function turnWorld(bone:T.Object3D,axis:T.Vector3,angle:number){
 const world=bone.getWorldQuaternion(new T.Quaternion()),parent=bone.parent!.getWorldQuaternion(new T.Quaternion()).invert();
 bone.quaternion.copy(parent.multiply(new T.Quaternion().setFromAxisAngle(axis,angle).multiply(world)));bone.updateWorldMatrix(false,true);
}
export function aimPartnerBone(bone:T.Object3D,child:T.Object3D,target:T.Vector3){
 const origin=bone.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(origin).normalize(),to=target.clone().sub(origin).normalize();
 const world=bone.getWorldQuaternion(new T.Quaternion()),parent=bone.parent!.getWorldQuaternion(new T.Quaternion()).invert();
 bone.quaternion.copy(parent.multiply(new T.Quaternion().setFromUnitVectors(from,to).multiply(world)));bone.updateWorldMatrix(false,true);
}
export function solvePartnerLimb(upper:T.Object3D,lower:T.Object3D,end:T.Object3D,target:T.Vector3,pole:T.Vector3){
 const start=upper.getWorldPosition(new T.Vector3()),middle=lower.getWorldPosition(new T.Vector3()),tip=end.getWorldPosition(new T.Vector3());
 const a=start.distanceTo(middle),b=middle.distanceTo(tip),direction=target.clone().sub(start),distance=T.MathUtils.clamp(direction.length(),Math.abs(a-b)+.0001,a+b-.0001);direction.normalize();
 const bend=pole.clone().sub(start);bend.addScaledVector(direction,-bend.dot(direction));
 if(bend.lengthSq()<1e-8)bend.set(0,0,1).addScaledVector(direction,-direction.z);bend.normalize();
 const along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
 aimPartnerBone(upper,lower,start.clone().addScaledVector(direction,along).addScaledVector(bend,height));
 aimPartnerBone(lower,end,start.clone().addScaledVector(direction,distance));
}
/** Align the upper-arm roll with the authored elbow hinge before flexing the forearm. */
export function solvePartnerArm(upper:T.Object3D,lower:T.Object3D,hand:T.Object3D,target:T.Vector3,pole:T.Vector3){
 const start=upper.getWorldPosition(new T.Vector3()),middle=lower.getWorldPosition(new T.Vector3()),tip=hand.getWorldPosition(new T.Vector3()),a=start.distanceTo(middle),b=middle.distanceTo(tip),direction=target.clone().sub(start),distance=T.MathUtils.clamp(direction.length(),Math.abs(a-b)+.0001,a+b-.0001);direction.normalize();
 const bend=pole.clone().sub(start).addScaledVector(direction,-pole.clone().sub(start).dot(direction)).normalize(),along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along)),joint=start.clone().addScaledVector(direction,along).addScaledVector(bend,height),end=start.clone().addScaledVector(direction,distance);
 const x=joint.clone().sub(start).normalize(),z=new T.Vector3().crossVectors(x,end.clone().sub(joint)).normalize(),y=new T.Vector3().crossVectors(z,x).normalize();
 const localX=lower.position.clone().normalize(),localZ=new T.Vector3(0,0,Math.sign(lower.quaternion.z)||-1),localY=new T.Vector3().crossVectors(localZ,localX).normalize();
 const desired=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z)).multiply(new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(localX,localY,localZ)).invert());
 upper.quaternion.copy(upper.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(desired));upper.updateWorldMatrix(false,true);aimPartnerBone(lower,hand,end);
}
const up=new T.Vector3(0,1,0),right=new T.Vector3(1,0,0),forward=new T.Vector3(0,0,1);
export function createPartnerActor(source:T.Group,index:number,material:T.Material){
 const root=new T.Group(),asset=clone(source);
 const characters:T.SkinnedMesh[]=[];asset.traverse(o=>{if(o instanceof T.SkinnedMesh)characters.push(o);});
 if(characters.length!==1)throw Error('Expected one prepared business figure');
 root.add(asset);root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(asset),center=bounds.getCenter(new T.Vector3()),scale=1.82/(bounds.max.y-bounds.min.y);
 asset.scale.multiplyScalar(scale);asset.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 const meshes:T.SkinnedMesh[]=[];root.traverse(o=>{if(o instanceof T.SkinnedMesh){o.material=material;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;meshes.push(o);}});root.updateMatrixWorld(true);
 const bones:T.Bone[]=[];root.traverse(o=>{if(o instanceof T.Bone)bones.push(o);});
 const names:Record<string,string>={Hip:'upperleg',Shin:'lowerleg',Foot:'foot',UpperArm:'upperarm',Forearm:'lowerarm',Palm:'hand',Chest:'spine_03',Head:'head'};
 const find=(prefix:string,side?:string)=>{const finger=prefix.match(/^(Middle|Index|Ring|Pinky|Thumb)([123])$/),stem=finger?finger[1].toLowerCase()+'_0'+finger[2]:names[prefix]||prefix,pattern=new RegExp('^'+stem+(side?'_'+side.toLowerCase():'')+'_\\d+$');const b=bones.find(o=>pattern.test(o.name));if(!b)throw Error('Business joint missing '+prefix+' '+side);return b;};
 const bind=bones.map(b=>({bone:b,p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()}));
 const feet=['L','R'].map(side=>{const upper=find('Hip',side),lower=find('Shin',side),foot=find('Foot',side),rest=foot.getWorldPosition(new T.Vector3()),worldQ=foot.getWorldQuaternion(new T.Quaternion()),ankle=new T.Object3D();ankle.position.copy(lower.worldToLocal(rest.clone()));lower.add(ankle);return {upper,lower,foot,ankle,rest,worldQ};});
 const arms=['L','R'].map(side=>{const upper=find('UpperArm',side),lower=find('Forearm',side),palm=find('Palm',side),shoulder=upper.getWorldPosition(new T.Vector3()),elbow=lower.getWorldPosition(new T.Vector3()),wrist=palm.getWorldPosition(new T.Vector3()),rest=new T.Vector3(Math.sign(shoulder.x)*(Math.abs(shoulder.x)+.11),shoulder.y-(shoulder.distanceTo(elbow)+elbow.distanceTo(wrist))*.90,shoulder.z+.07),twist=bones.find(o=>o.name.startsWith('lowerarm_twist_'+side.toLowerCase()+'_'));return {upper,lower,palm,rest,twist};});
 const palm=arms[1].palm;
 const handBases=['L','R'].map((side,j)=>{const hand=arms[j].palm,middle=find('Middle1',side),pinky=find('Pinky1',side),fingerIndex=find('Index1',side),long=middle.getWorldPosition(new T.Vector3()).sub(hand.getWorldPosition(new T.Vector3())).normalize(),across=fingerIndex.getWorldPosition(new T.Vector3()).sub(pinky.getWorldPosition(new T.Vector3())).normalize();across.addScaledVector(long,-across.dot(long)).normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(long,across,new T.Vector3().crossVectors(long,across))).invert().multiply(hand.getWorldQuaternion(new T.Quaternion()));});
 const stopDistance=partnerStop,chest=find('Chest'),head=find('Head'),side=index?1:-1,walkYaw=-side*(Math.PI/2-.24),walkHeading=new T.Quaternion().setFromAxisAngle(up,walkYaw),heading=new T.Quaternion();
 const footTargets:T.Vector3[]=[],armTargets:T.Vector3[]=[];
 function pose(walk:number,gesture:number,time:number,completion:number,measure=false){
  bind.forEach(({bone,p,q,s})=>{bone.position.copy(p);bone.quaternion.copy(q);bone.scale.copy(s);});
  heading.setFromAxisAngle(up,walkYaw+side*gesture*.10);root.quaternion.copy(heading);root.position.set(side*T.MathUtils.lerp(partnerStart,stopDistance,walk),-(Math.sin(walk*Math.PI*3)**2)*.010,0);root.updateMatrixWorld(true);
  const sway=Math.sin(walk*Math.PI*3)*(1-gesture),attention=partnerEase(T.MathUtils.clamp((time-5.85)/1.05,0,1));turnWorld(chest,up,sway*.022);turnWorld(head,up,-side*attention*.12);const nod=Math.sin(Math.PI*T.MathUtils.clamp((time-(index?10.55:10.8))/.85,0,1))*.025;turnWorld(head,right.clone().applyQuaternion(heading),attention*.11+nod);
  footTargets.length=0;armTargets.length=0;
  feet.forEach((leg,j)=>{
   const step=partnerFootstep(walk,j===(index?0:1)),target=leg.rest.clone().applyQuaternion(walkHeading);target.x+=side*partnerStart-side*(partnerStart-stopDistance)*step.advance;target.y+=step.lift;footTargets.push(target.clone());
   solvePartnerLimb(leg.upper,leg.lower,leg.ankle,target,new T.Vector3(root.position.x-side*.5,.55,target.z));
   leg.foot.position.copy(leg.foot.parent!.worldToLocal(target.clone()));const desired=walkHeading.clone().multiply(new T.Quaternion().setFromAxisAngle(right,step.pitch)).multiply(leg.worldQ);leg.foot.quaternion.copy(leg.foot.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(desired));leg.foot.updateWorldMatrix(false,true);
  });
  arms.forEach((arm,j)=>{
   const active=j===(index?0:1),reach=partnerEase(T.MathUtils.clamp((gesture-(index?0:.08))/(index?1:.92),0,1)),target=arm.rest.clone().applyQuaternion(heading).add(root.position);target.x+=-side*sway*.055*(j?-1:1);target.y+=Math.abs(sway)*.009;
   if(active){const relaxedGesture=partnerHandTargets[index].clone();relaxedGesture.y-=completion*.025;target.lerp(relaxedGesture,reach);const arc=Math.sin(Math.PI*reach);target.y+=arc*(index?.065:.045);target.z+=arc*.055;}armTargets.push(target.clone());
   // Anatomical outward poles rotate with the actor: never send Eric's idle elbow through his torso.
   const outward=Math.sign(arm.rest.x),pole=new T.Vector3(outward*.48,1.12,.16).applyQuaternion(heading).add(root.position);if(active)pole.lerp(new T.Vector3(root.position.x+side*.08,1.10,.40),reach);
   const solve=!active&&index===0?solvePartnerLimb:solvePartnerArm;solve(arm.upper,arm.lower,arm.palm,target,pole);
   const neutral=arm.palm.getWorldQuaternion(new T.Quaternion());let handWorld=neutral.clone();
   if(active&&gesture>0){const long=index?new T.Vector3(-.93,.35,-.06).normalize():new T.Vector3(1,.05,0).normalize(),across=index?up.clone().addScaledVector(long,-long.y).normalize():new T.Vector3(0,1,0).cross(long).normalize(),desired=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(long,across,new T.Vector3().crossVectors(long,across))).multiply(handBases[j]);handWorld=neutral.clone().slerp(desired,reach);}
   arm.palm.quaternion.copy(arm.palm.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(handWorld));arm.palm.updateWorldMatrix(false,true);
   if(active&&gesture>0&&arm.twist){const axis=arm.palm.getWorldPosition(new T.Vector3()).sub(arm.lower.getWorldPosition(new T.Vector3())).normalize(),delta=handWorld.clone().multiply(neutral.invert());if(delta.w<0)delta.set(-delta.x,-delta.y,-delta.z,-delta.w);const angle=T.MathUtils.clamp(2*Math.atan2(new T.Vector3(delta.x,delta.y,delta.z).dot(axis),delta.w),-1.1,1.1);turnWorld(arm.twist,axis,angle*.45);}
   const digitSide=j?'R':'L';for(const digit of ['Index','Middle','Ring','Pinky'])for(let joint=1;joint<=3;joint++){let curl=[.025,.045,.025][joint-1];if(active&&index===1)curl=T.MathUtils.lerp(curl,digit==='Index'?-.12:[.18,.28,.20][joint-1],reach);const bone=find(digit+joint,digitSide);bone.rotateZ(curl);bone.updateWorldMatrix(false,true);}
  });
  root.updateMatrixWorld(true);if(measure)meshes.forEach(m=>m.computeBoundingBox());
 }
 pose(0,0,0,0,true);
 return {root,bones:bones.length,meshes,pose,palm,footTargets,armTargets,stopDistance,activePalm:arms[index?0:1].palm,idlePalm:arms[index?1:0].palm};
}
