import {expect,it} from 'vitest';
import * as T from 'three';
import {solvePartnerLimb} from '../components/brand/partner-rig-motion';

it('reaches the same handshake target while preserving both physical limb lengths',()=>{
 const root=new T.Group(),upper=new T.Bone(),lower=new T.Bone(),hand=new T.Bone();root.rotation.y=.6;root.position.set(-.4,1.35,0);root.add(upper);upper.add(lower);lower.add(hand);lower.position.x=.28;hand.position.x=.25;root.updateMatrixWorld(true);
 const target=new T.Vector3(-.075,1.18,.04),pole=new T.Vector3(-.4,.83,.28),point=new T.Vector3();
 for(let i=0;i<5;i++){solvePartnerLimb(upper,lower,hand,target,pole);expect(hand.getWorldPosition(point).distanceTo(target)).toBeLessThan(.00001);expect(upper.getWorldPosition(new T.Vector3()).distanceTo(lower.getWorldPosition(new T.Vector3()))).toBeCloseTo(.28);expect(lower.getWorldPosition(new T.Vector3()).distanceTo(hand.getWorldPosition(new T.Vector3()))).toBeCloseTo(.25);}
});
