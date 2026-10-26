import fs from 'node:fs';
import * as T from 'three';
import {resolveHandContact} from './hand-contact-solver.mjs';
import {buildHandGeodesics} from './hand-surface-binding.mjs';

// Authored Rhino surfaces are reference targets, never visible solid hero assets.
const library=JSON.parse(fs.readFileSync(new URL('./assets/rhino-hand-poses.json',import.meta.url),'utf8'));
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
export function prepareRhinoHands(){
 const parts=library.pinch.parts,positions=[],indices=[];
 for(const part of parts){const offset=positions.length/3;positions.push(...part.positions);indices.push(...part.indices.map(i=>i+offset));}
 const rest=new Float32Array(positions);
 const landmarks={index:[.28,1.10,-.73],thumb:[.37,1.04,-.39],palm:[.12,.43,-.28],middle:[.59,1.33,-.35],ring:[.47,1.34,-.46],little:[.38,1.22,-.62]};
 const surface=buildHandGeodesics(rest,indices,landmarks);
 const bodyOffset=parts.filter(p=>p.object!==30).reduce((n,p)=>n+p.vertices,0);
 // Rhino stores nails as disconnected meshes. Bind them to the nearest skin
 // vertex, inheriting its continuous digit weights instead of guessing a digit.
 const skinNode=new Uint32Array(rest.length/3);
 for(let i=0;i<skinNode.length;i++){
  let nearest=i;
  if(i<bodyOffset){let best=Infinity;for(let j=bodyOffset;j<skinNode.length;j++){
   const distance=(rest[i*3]-rest[j*3])**2+(rest[i*3+1]-rest[j*3+1])**2+(rest[i*3+2]-rest[j*3+2])**2;
   if(distance<best){best=distance;nearest=j;}
  }}
  skinNode[i]=surface.map[nearest];
 }
 // Small rotations of the two pinch digits; no remodelling of the authored knuckles.
 function articulate(amount){const result=rest.slice();for(let i=0;i<rest.length/3;i++){
  const p=new T.Vector3().fromArray(rest,i*3),node=skinNode[i],distance=Object.fromEntries(Object.keys(landmarks).map(k=>[k,surface.fields[k][node]]));
  const min=Math.min(...Object.values(distance));
  const weights=Object.fromEntries(Object.entries(distance).map(([name,d])=>[name,Math.exp(-(d-min)/.12)]));
  const total=Object.values(weights).reduce((a,b)=>a+b,0),change=new T.Vector3();
  for(const digit of ['index','thumb']){
   const influence=weights[digit]/total;
   if(influence<.00001)continue;
   const pivot=new T.Vector3(...(digit==='index'?[-.10,.87,-.56]:[.39,.47,-.25]));
   const weight=smooth((p.y-.52)/.42);
   const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),(digit==='index'?-1:1)*amount*weight);
   change.addScaledVector(p.clone().sub(pivot).applyQuaternion(q).add(pivot).sub(p),influence);
  }
  p.add(change);
  p.toArray(result,i*3);
 }return result;}
 let base=articulate(.25),target;
 const tip=(name)=>{const pivot=new T.Vector3(...(name==='index'?[-.10,.87,-.56]:[.39,.47,-.25]));return new T.Vector3(...landmarks[name]).sub(pivot).applyAxisAngle(new T.Vector3(1,0,0),(name==='index'?-1:1)*.25).add(pivot);};
 const indexTip=tip('index'),thumbTip=tip('thumb'),centre=indexTip.clone().add(thumbTip).multiplyScalar(.5),span=indexTip.clone().sub(thumbTip).normalize();
 const wrist=new T.Vector3(0,-1,0).addScaledVector(span,span.y).normalize(),across=new T.Vector3(0,1,0),right=new T.Vector3(7,0,-6).normalize();
 const rotation=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(across,right,new T.Vector3().crossVectors(across,right)).multiply(new T.Matrix4().makeBasis(span,wrist,new T.Vector3().crossVectors(span,wrist)).invert()));
 const scale=1.5,inverse=rotation.clone().invert();
 const world=point=>point.clone().sub(centre).applyQuaternion(rotation).multiplyScalar(scale);
 const local=point=>point.clone().divideScalar(scale).applyQuaternion(inverse).add(centre);
 // Compliant finger pads conform to the complete cube footprint, with a smooth
 // transition into the surrounding skin. The cube remains a rigid .36 solid.
 for(let i=0;i<base.length;i+=3){const p=world(new T.Vector3().fromArray(base,i));
  const footprint=1-smooth((Math.max(Math.abs(p.x),Math.abs(p.z))-.19)/.12);
  if(Math.abs(p.y)<.21)p.y+=Math.sign(p.y||1)*Math.max(0,.192-Math.abs(p.y))*footprint;
  local(p).toArray(base,i);
 }
 target=base.slice();
 for(let i=0;i<base.length/3;i++){
  const p=world(new T.Vector3().fromArray(base,i*3)),node=skinNode[i],distances=Object.fromEntries(Object.keys(landmarks).map(name=>[name,surface.fields[name][node]])),min=Math.min(...Object.values(distances));
  const weights=Object.fromEntries(Object.entries(distances).map(([name,d])=>[name,Math.exp(-(d-min)/.12)])),total=Object.values(weights).reduce((a,b)=>a+b,0),root=smooth((rest[i*3+1]-.52)/.42);
  p.addScaledVector(right,(weights.thumb*.30+weights.index*.05)/total*root);
  p.y+=(weights.index*.20-weights.thumb*.20)/total*root;
  local(p).toArray(target,i*3);
 }
 const grip=library.grip;
 const canonical=array=>{const output=new Float32Array(array);for(let i=0;i<output.length;i+=3){output[i]*=2.4;output[i+1]=(output[i+1]-.9)*2.4;output[i+2]*=2.4;}return output;};
 const closed=canonical(grip.cupped),open=canonical(grip.open);
 // The cupped reference is an intermediate pose. Curl the distal fingers around
 // the opposite palm while retaining the authored knuckles and wrist surface.
 for(let i=0;i<closed.length;i+=3){
  const mask=smooth((closed[i+1]-.12)/.60)*(1-smooth((open[i]-.55)/.30));
  const pivot=new T.Vector3(0,.18,.05),p=new T.Vector3().fromArray(closed,i);
  p.sub(pivot).applyAxisAngle(new T.Vector3(1,0,0),.92*mask).add(pivot).toArray(closed,i);
 }
 // Keep the same wrist and forearm throughout closure; the authored pair differs
 // in forearm posture, which should not rubber-band while the fingers close.
 for(let i=0;i<open.length;i+=3){const weight=smooth((closed[i+1]+.65)/.55);for(let j=0;j<3;j++)open[i+j]=T.MathUtils.lerp(closed[i+j],open[i+j],weight);}
 const faces=[];for(let i=0;i<grip.indices.length;i+=3){const triangle=grip.indices.slice(i,i+3);if(triangle.every(index=>closed[index*3+1]>-1.3))faces.push(...triangle);}
 const placement={x:.08,y:.02,z:-.25};
 const {x,y,z}=placement;
 const transforms=[new T.Matrix4().makeTranslation(-x,y,-z).multiply(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(1,0,0),new T.Vector3(0,0,-1))),new T.Matrix4().makeTranslation(x,-y,z).multiply(new T.Matrix4().makeRotationZ(Math.PI/2))];
 const [contact,other]=resolveHandContact(closed,closed,faces,{transforms,reference:true,limit:.035});
 const pinch={index:indexTip.toArray(),thumb:thumbTip.toArray(),placement:{quaternion:rotation.toArray(),scale,offset:centre.clone().applyQuaternion(rotation).multiplyScalar(-scale).toArray()}};
 return {hand:{base,target,indices,original:rest},grip:{base:open,target:contact,other,indices:faces,original:closed},anchors:{version:2,pinch,handshake:placement},source:library.source};
}
