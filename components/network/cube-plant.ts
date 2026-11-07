import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {factoryKit} from './factory-kit';

type Kit=ReturnType<typeof factoryKit>;
type Own=<R extends {dispose:()=>void}>(resource:R)=>R;

// Keep every feature on the same foundation; the signal port sits at the front edge.
export function buildCubePlant(group:T.Group,id:number,kit:Kit,own:Own){
 const {pearl,steel,navy,glass}=kit;
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:T.Material=pearl)=>
  kit.box(group,[w,h,d],[x,y,z],m);
 function drum(x:number,z:number,r:number,h:number){
  const unit=own(new T.CylinderGeometry(r,r,h,14)),body=new T.Mesh(unit,steel);
  body.position.set(x,h/2,z);group.add(body);
  for(const height of [.22,.8]){
   const band=new T.Mesh(unit,navy);band.scale.set(1.04,.045,1.04);band.position.set(x,h*height,z);group.add(band);
  }
 }
 function hall(x:number,z:number,w:number,d:number,h:number){
  box(w,h,d,x,h/2,z);
  box(w+.1,.1,d+.1,x,h+.055,z,navy);
  const front=z+d/2;
  box(w*.65,h*.53,.05,x,h*.36,front+.018,navy);
  for(const level of [.22,.38,.54])box(w*.58,.026,.06,x,h*level,front+.035,steel);
  box(w*.76,.075,.35,x,.035,front+.12,steel);
 }
 function frame(x:number,z:number,w:number,d:number,h:number){
  for(const side of [-1,1])for(const end of [-1,1])box(.085,h,.085,x+side*w/2,h/2,z+end*d/2,steel);
  box(w+.16,.1,d+.16,x,h,z,navy);
 }
 function glazing(x:number,z:number,w:number,h:number){
  box(w,h,.065,x,h/2+.08,z,glass);
  for(const side of [-1,0,1])box(.045,h,.075,x+side*w*.47,h/2+.08,z,steel);
 }
 box(3.12,.17,2.48,0,-.13,-.85,steel);
 switch(id){
  case 0: // Utility plant with a bank of vertical vessels and a common header.
   hall(-.94,-1.08,.94,1.55,.85);
   for(const x of [-.12,.55,1.18])drum(x,-1.05,.26,1.28);
   box(1.85,.095,.095,.52,1.33,-1.05,navy);break;
  case 1: // Dispatch warehouse with two loading docks and a projecting canopy.
   hall(-.68,-1.12,1.28,1.62,1.18);hall(.67,-1.12,1.28,1.62,1.18);
   frame(0,-.18,2.56,.49,.9);break;
  case 2: // Daylit production hall with a sawtooth roof and clerestory glazing.
   hall(0,-1.08,2.69,1.53,.85);
   for(const x of [-.9,0,.9]){
    box(.84,.28,1.45,x,.99,-1.08,glass);
    box(.94,.09,1.6,x,1.18,-1.08,navy).rotation.z=.24;
   }break;
  case 3: // Inspection booth and infeed rollers.
   hall(-.91,-1.1,.89,1.48,.96);frame(.45,-1.04,1.52,1.36,1.28);
   glazing(.45,-.36,1.48,.96);
   box(.58,.18,1.57,.45,.28,-.62,navy);
   for(let i=0;i<6;i++)box(.6,.06,.075,.45,.4,-1.18+i*.22,steel);
   break;
  case 4: // Open wet line with three lipped tanks and an overhead carrier.
   box(2.72,.97,.09,0,.49,-1.86);
   for(const x of [-.88,0,.88]){
    box(.76,.55,.97,x,.28,-1,steel);box(.67,.035,.86,x,.57,-1,glass);
    for(const z of [-1.48,-.52])box(.79,.055,.055,x,.61,z,pearl);
   }
   for(const x of [-1.32,1.32])box(.09,1.35,.1,x,.67,-1,steel);
   box(2.74,.1,.14,0,1.37,-1,navy);box(.37,.21,.27,-.36,1.24,-1,navy);break;
  case 5: // Oven with a chamber opening, shorter exit conveyor and exhaust stack.
   hall(-.34,-1.15,1.97,1.52,1.05);
   drum(-.89,-1.45,.16,1.47);
   box(.73,.28,1.37,1.02,.24,-.86,steel);
   for(let i=0;i<5;i++)box(.72,.05,.08,1.02,.41,-1.35+i*.22,navy);
   break;
  case 6: // Two assembly bays with a glazed control room.
   hall(-.65,-1.13,1.37,1.5,.73);
   frame(.69,-1.05,1.1,1.35,1.32);glazing(.69,-.36,1.08,1.13);
   for(const x of [-.99,-.34])box(.37,.22,.55,x,.99,-1.25,steel);
   break;
  case 7: // Fabrication gantry and an open work bed.
   for(const x of [-1.15,1.15])for(const z of [-1.65,-.45])box(.15,1.28,.14,x,.64,z,steel);
   for(const z of [-1.65,-.45])box(2.6,.17,.18,0,1.32,z,navy);
   box(.28,.18,1.4,.41,1.32,-1.05,steel);box(.085,.48,.09,.41,1.03,-1.05,navy);
   box(2.06,.22,.87,0,.21,-1.02,navy);box(1.6,.15,.62,0,.4,-1.02,steel);
   break;
 }
 // Batch static opaque components by finish; glass keeps independent depth ordering.
 const batches=new Map<T.Material,T.BufferGeometry[]>();
 for(const child of [...group.children]){
  if(!(child instanceof T.Mesh)||Array.isArray(child.material)||child.material.transparent)continue;
  child.updateMatrix();
  const geometry=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();
  geometry.applyMatrix4(child.matrix);group.remove(child);
  const list=batches.get(child.material)??[];list.push(geometry);batches.set(child.material,list);
 }
 for(const [finish,parts] of batches){
  const merged=mergeGeometries(parts);if(merged)group.add(new T.Mesh(own(merged),finish));
  parts.forEach(g=>g.dispose());
 }
}
