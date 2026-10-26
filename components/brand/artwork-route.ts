import * as THREE from 'three';
import {stroke,strokeMaterial} from '../home/lattice-materials';
/** A fixed structural connection with a finite travelling highlight; no extra render pass. */
export function createArtworkRoute(parent:THREE.Object3D,points:THREE.Vector3[],track:<T extends {dispose():void}>(resource:T)=>T){
 const pairs=points.slice(1).flatMap((point,i)=>[points[i],point]);
 const coreMaterial=track(strokeMaterial(true));coreMaterial.userData.cssWidth=1.15;
 const haloMaterial=track(strokeMaterial(true));haloMaterial.userData.cssWidth=5;
 const tipMaterial=track(strokeMaterial(true));tipMaterial.userData.cssWidth=2;
 const core=stroke(pairs,coreMaterial),halo=stroke(pairs,haloMaterial),tip=stroke(points.slice(0,2),tipMaterial);
 for(const line of [core,halo,tip]){track(line.geometry);parent.add(line);}
 const total=points.length-1;
 return {end:points.at(-1)!,setTheme(dark:boolean){coreMaterial.color.setHex(dark?0x75b8ec:0x246bd4);haloMaterial.color.setHex(0x4abaff);tipMaterial.color.setHex(dark?0xe0f7ff:0x42b9f2);},update(progress:number,response:number,glow=1){
  const count=Math.round(total*progress);core.geometry.instanceCount=count;halo.geometry.instanceCount=count;
  coreMaterial.opacity=.56+response*.25;haloMaterial.opacity=(.09+response*.14)*glow;
  tip.visible=progress>0&&progress<1&&glow>0;
  if(tip.visible){const a=points[Math.max(0,count-Math.max(2,Math.round(total*.17)))],b=points[count];tip.geometry.attributes.instanceStart.setXYZ(0,a.x,a.y,a.z);tip.geometry.attributes.instanceEnd.setXYZ(0,b.x,b.y,b.z);tip.geometry.attributes.instanceStart.needsUpdate=true;tip.geometry.attributes.instanceEnd.needsUpdate=true;tip.geometry.computeBoundingSphere();tipMaterial.opacity=.95*glow;}
 }};
}
