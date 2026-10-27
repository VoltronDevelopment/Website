import * as T from 'three';
import {cultureHandPosition} from './hand-scene-timeline';
type ArmReference={armRotation:number;armTwist:number;scale:number;armOffset:readonly number[];points:{r:number;y:number;d:number;q:readonly number[]}[]};
const right=new T.Vector3(7,0,-6).normalize(),normal=new T.Vector3(6,0,7).normalize();
export const cultureBoard=(r:number,y:number,d=0)=>right.clone().multiplyScalar(r).add(new T.Vector3(0,y,0)).addScaledVector(normal,d);
export function cultureArmPose(path:ArmReference){
 const basis=new T.Matrix4().makeBasis(right,new T.Vector3(0,1,0),normal),oldQ=new T.Quaternion().setFromRotationMatrix(basis).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),path.armRotation)).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),path.armTwist));
 const oldMatrix=new T.Matrix4().compose(cultureBoard(path.armOffset[0],path.armOffset[1],path.armOffset[2]),oldQ,new T.Vector3().setScalar(path.scale)),contact=path.points[0];
 const localPalm=cultureBoard(contact.r,contact.y,contact.d).applyMatrix4(oldMatrix.clone().invert());
 const quaternion=new T.Quaternion().setFromRotationMatrix(basis).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-Math.PI*.30)).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-Math.PI*.30));
 const scale=new T.Vector3(5.2,4.42,5.2),offset=localPalm.clone().multiply(scale).applyQuaternion(quaternion),position=cultureBoard(...cultureHandPosition(0)).sub(offset);
 const palmQuaternion=quaternion.clone().multiply(oldQ.clone().invert()).multiply(new T.Quaternion().fromArray(contact.q));
 return {position,quaternion,scale,palmQuaternion,matrix:new T.Matrix4().compose(position,quaternion,scale)};
}
