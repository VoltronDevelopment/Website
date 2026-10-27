import * as THREE from 'three';
import {createFactoryHousing} from './factory-housing';
import {createPartInspectionEffects} from './part-inspection-effects';

// The approved flange housing is the one master throughout the homepage.
export const partFeatures={radius:.4,base:.16,scale:.02};
export const millingPath=Array.from({length:65},(_,i)=>new THREE.Vector2(Math.cos(i/64*Math.PI*2)*.49,Math.sin(i/64*Math.PI*2)*.49));
export const millingLengths=millingPath.slice(1).map((p,i)=>p.distanceTo(millingPath[i]));
export const millingLength=millingLengths.reduce((a,b)=>a+b,0);
export function millingPosition(progress:number){let distance=THREE.MathUtils.clamp(progress,0,1)*millingLength;for(let i=0;i<millingLengths.length;i++){if(distance<=millingLengths[i])return millingPath[i].clone().lerp(millingPath[i+1],distance/millingLengths[i]);distance-=millingLengths[i];}return millingPath.at(-1)!.clone();}
export function createMachiningPartGeometry(){return createFactoryHousing();}
export function createMachiningView(index:number){
 const group=new THREE.Group();group.name='manufacturing-perspective-'+index;group.scale.setScalar(.78);
 const metal=new THREE.MeshPhysicalMaterial({color:0xb9cddd,metalness:.86,roughness:.20,clearcoat:.5,envMapIntensity:1.3});
 const fixture=new THREE.MeshStandardMaterial({color:0x29455d,metalness:.65,roughness:.36});
 const accent=new THREE.MeshPhysicalMaterial({color:0x368fe0,metalness:.55,roughness:.23,emissive:0x145a9b,emissiveIntensity:.12});
 const master=createMachiningPartGeometry();
 function part(){const p=new THREE.Group();p.name='shared-flange-housing';p.add(new THREE.Mesh(master,metal));return p;}
 function box(w:number,h:number,d:number,x:number,y:number,z:number){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),fixture);mesh.position.set(x,y,z);group.add(mesh);return mesh;}
 const primary=part();group.add(primary);
 const effects=createPartInspectionEffects(index);group.add(effects.group);
 const guides=new THREE.Group();guides.name='context-feature-guides';group.add(guides);
 const lineMaterial=new THREE.LineBasicMaterial({color:0x329fe0,transparent:true,opacity:.9,depthTest:false});
 function line(points:THREE.Vector3[]){const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),lineMaterial);l.renderOrder=9;guides.add(l);}
 line(Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2;return new THREE.Vector3(Math.cos(a)*.4,Math.sin(a)*.4,.343);}));
 line([new THREE.Vector3(.73,-.5,-.27),new THREE.Vector3(.86,-.5,-.27),new THREE.Vector3(.86,-.5,-.11),new THREE.Vector3(.73,-.5,-.11)]);
 const stockMaterial=metal.clone(),cut={value:0};
 stockMaterial.onBeforeCompile=shader=>{
  shader.uniforms.uMachiningProgress=cut;
  shader.vertexShader='varying vec2 vStock;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStock=position.xy;');
  shader.fragmentShader='varying vec2 vStock;uniform float uMachiningProgress;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat angle=atan(vStock.y,vStock.x);if(angle<0.)angle+=6.2831853;if(uMachiningProgress>0.&&angle<uMachiningProgress*6.2831853)discard;');
 };stockMaterial.customProgramCacheKey=()=> 'approved-flange-face-finish-v1';
 const stockShape=new THREE.Shape();stockShape.absarc(0,0,.54,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,.44,0,Math.PI*2,true);stockShape.holes.push(hole);
 const stockGeometry=new THREE.ExtrudeGeometry(stockShape,{depth:.025,bevelEnabled:false,curveSegments:64});stockGeometry.translate(0,0,.335);
 const stock=new THREE.Mesh(stockGeometry,stockMaterial);group.add(stock);
 const tool=new THREE.Group();tool.name='flange-end-mill';tool.rotation.x=Math.PI/2;group.add(tool);
 function cylinder(r:number,h:number,y:number,m:THREE.Material){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m);mesh.position.y=y;tool.add(mesh);}
 cylinder(.06,.36,.18,metal);cylinder(.13,.18,.45,fixture);cylinder(.16,.07,.575,accent);
 const chipsGeometry=new THREE.BufferGeometry(),chipPositions=new Float32Array(72*3);chipsGeometry.setAttribute('position',new THREE.BufferAttribute(chipPositions,3));
 const chips=new THREE.Points(chipsGeometry,new THREE.PointsMaterial({color:0x97caff,size:.015,transparent:true,opacity:.8}));group.add(chips);
 box(1.90,.08,1.2,0,-.94,0);
 if(index===0){box(.12,.16,.65,-.86,-.83,0);box(.12,.16,.65,.86,-.83,0);}
 if(index===2){box(1.94,.06,.16,0,-1.02,-.49);box(1.94,.06,.16,0,-1.02,.49);}
 const probe=new THREE.Group();group.add(probe);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.26,12),accent);stem.position.set(.4,.14,.20);probe.add(stem);
 const tip=new THREE.Mesh(new THREE.SphereGeometry(.025,12,8),accent);tip.position.set(.4,.01,.20);probe.add(tip);
 return {group,update(time:number,cutProgress:number,_context:number,_intelligence:number){
  cut.value=cutProgress;stock.visible=index===0&&cutProgress<1;tool.visible=index===0;
  guides.visible=index===1&&time>3.5&&time<7.8;lineMaterial.opacity=THREE.MathUtils.smoothstep(time,3.5,4.2)*(1-THREE.MathUtils.smoothstep(time,6.7,7.8))*.9;
  probe.visible=index===2&&time>6&&time<10.5;effects.update(time,typeof document!=='undefined'&&document.documentElement.dataset.theme==='dark');
  const at=millingPosition(cutProgress),retract=THREE.MathUtils.smoothstep(time,4,4.8),approach=1-THREE.MathUtils.smoothstep(time,.7,1);
  tool.position.set(at.x,at.y,.335+(retract+approach)*.20);
  chips.visible=index===0&&time>1&&time<4;for(let i=0;i<72;i++){const age=(time*1.8+i*.137)%1;chipPositions.set([at.x+Math.cos(i*2.4)*age*.14,at.y+Math.sin(i*2.4)*age*.14,.35+Math.sin(age*Math.PI)*.14],i*3);}chipsGeometry.attributes.position.needsUpdate=true;
 }};
}
