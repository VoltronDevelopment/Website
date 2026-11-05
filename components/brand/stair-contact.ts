import * as T from 'three';

const smooth=(value:number)=>{const t=T.MathUtils.clamp(value,0,1);return t*t*(3-2*t);};
/** The source straight-stair clip plants its last right step one riser too low. */
export function stairContactLift(clipTime:number){
 return .15167*smooth((clipTime-6.28)/.32)*(1-smooth((clipTime-7.08)/.32));
}

/** Correct that foot only, retaining the authored ankle angle, hip and opposite stance. */
export function createStairContact(root:T.Object3D){
 let upper:T.Bone|undefined,lower:T.Bone|undefined,foot:T.Bone|undefined;
 root.traverse(o=>{if(!(o instanceof T.Bone))return;if(/Bip001_R_Thigh_/.test(o.name))upper=o;if(/Bip001_R_Calf_/.test(o.name))lower=o;if(/Bip001_R_Foot_/.test(o.name))foot=o;});
 let saved:T.Quaternion[]|undefined;
 const bones=upper&&lower&&foot?[upper,lower,foot]:[];
 function aim(bone:T.Object3D,child:T.Object3D,target:T.Vector3){
  const origin=bone.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(origin).normalize(),to=target.clone().sub(origin).normalize();
  const rotation=new T.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new T.Quaternion()));
  bone.quaternion.copy(bone.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(rotation));bone.updateWorldMatrix(false,true);
 }
 return {
  restore(){if(saved){bones.forEach((bone,i)=>bone.quaternion.copy(saved![i]));saved=undefined;}},
  apply(time:number){
   const lift=stairContactLift(time);if(!upper||!lower||!foot||lift<=0)return;
   saved=bones.map(bone=>bone.quaternion.clone());root.updateMatrixWorld(true);
   const start=upper.getWorldPosition(new T.Vector3()),middle=lower.getWorldPosition(new T.Vector3()),end=foot.getWorldPosition(new T.Vector3()),ankleRotation=foot.getWorldQuaternion(new T.Quaternion());
   const target=end.clone().add(new T.Vector3(0,lift,0)),direction=target.clone().sub(start),a=start.distanceTo(middle),b=middle.distanceTo(end),distance=T.MathUtils.clamp(direction.length(),Math.abs(a-b)+1e-5,a+b-1e-5);direction.normalize();
   const bend=middle.clone().sub(start);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
   const along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
   aim(upper,lower,start.clone().addScaledVector(direction,along).addScaledVector(bend,height));
   aim(lower,foot,target);
   foot.quaternion.copy(foot.parent!.getWorldQuaternion(new T.Quaternion()).invert().multiply(ankleRotation));foot.updateWorldMatrix(false,true);
  },
 };
}
