import * as THREE from "three";

import {matteFaces,tintMatte} from './matte-faces';
import {philosophyDimensions} from "./philosophy-cube-timeline";
import {glassFace,setGlass,type GlassFace} from './lattice-materials';
export {philosophyCubeState} from "./philosophy-cube-timeline";

export function addPhilosophyLighting(scene:THREE.Scene){
 scene.add(new THREE.HemisphereLight(0xeaf6ff,0x314d6b,2));
 const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(-4,6,4);scene.add(key);
 const fill=new THREE.DirectionalLight(0x81c9ff,.65);fill.position.set(4,1,3);scene.add(fill);
}

/** The outer frame stays open toward the viewer as the individual joins the core. */
export function createMattePhilosophyCubes(){
 const root=new THREE.Group();
 const levels=[philosophyDimensions.outer,philosophyDimensions.core,philosophyDimensions.individual].map((size,level)=>{
  const group=new THREE.Group(),geometry=new THREE.BoxGeometry(size,size,size);
  const faces=matteFaces();
  for(const [i,m] of faces.entries()){
   m.transparent=true;m.depthWrite=level!==0;
   m.userData.coverage=level===0?([1,3,5].includes(i)?.22:0):1;
   m.visible=m.userData.coverage>0;
   if(level===0)m.side=THREE.DoubleSide;
  }
  const edges=new THREE.EdgesGeometry(geometry),line=new THREE.LineBasicMaterial({transparent:true,toneMapped:false});
  group.add(new THREE.Mesh(geometry,faces),new THREE.LineSegments(edges,line));root.add(group);
  return {group,geometry,faces,edges,line};
 });
 function setTheme(dark:boolean,_active=false){
  levels.forEach(({faces,line},i)=>{
   tintMatte(faces,(dark?[0x91afc3,0x5f9bca,0x87abbc]:[0x819caf,0x417aa7,0x7797a8])[i]);
   line.color.setHex(dark?0x89a6b9:0x526f83);
  });
 }
 const outline=levels[0].edges.getAttribute('position');
 const endpoints=new Float32Array(outline.array);
 function apply(s:ReturnType<typeof import('./philosophy-cube-timeline').homePhilosophyCubeState>){
  for(let i=0;i<outline.count;i+=2){
   const a=i*3,b=a+3;
   outline.setXYZ(i+1,...[0,1,2].map(axis=>THREE.MathUtils.lerp(endpoints[a+axis],endpoints[b+axis],s.outer)) as [number,number,number]);
  }
  outline.needsUpdate=true;
  const [shell,core,individual]=levels;
  shell.line.opacity=.85;shell.group.visible=s.outer>0;
  shell.faces.forEach((m,i)=>m.opacity=m.userData.coverage*s.shell);
  core.group.visible=s.core>0;core.group.scale.setScalar(s.core);
  core.group.position.y=0;core.faces.forEach(m=>m.opacity=s.core);core.line.opacity=.35*s.core;
  individual.group.visible=s.individual>0&&s.merge<1;
  individual.group.scale.setScalar(Math.max(.001,s.individual));
  individual.group.position.y=s.height;
  individual.faces.forEach(m=>m.opacity=s.individual*(1-s.merge));
  individual.line.opacity=.35*s.individual*(1-s.merge);
 }
 setTheme(false);return {root,groups:levels.map(l=>l.group),setTheme,apply,dispose(){levels.forEach(l=>{l.geometry.dispose();l.edges.dispose();l.line.dispose();l.faces.forEach(f=>f.dispose());});}};
}

/** Canonical geometry and materials for both Individual Excellence illustrations. */
export function createPhilosophyCubes(){
 const root=new THREE.Group(),resources:{dispose():void}[]=[],materials:{material:THREE.Material&{color:THREE.Color};role:'solid'|'glass'|'edge'|'node'}[]=[];
 const track=<T extends {dispose():void}>(resource:T)=>{resources.push(resource);return resource;};
 const sizes=[philosophyDimensions.outer,philosophyDimensions.core,philosophyDimensions.individual];
 const groups=sizes.map((size,index)=>{
  const group=new THREE.Group();root.add(group);const solid=index>0,geometry=track(new THREE.BoxGeometry(size,size,size));
  if(solid){const face=track(new THREE.MeshPhysicalMaterial({transparent:true,opacity:index===1?.54:.94,depthWrite:false,roughness:.16,metalness:.08,clearcoat:.95,clearcoatRoughness:.1,envMapIntensity:1.35}));face.userData.level=index;materials.push({material:face,role:'solid'});group.add(new THREE.Mesh(geometry,face));}
  else{const kinds:GlassFace[]=['side','rear','top','bottom','front','rear'];group.add(new THREE.Mesh(geometry,kinds.map((kind,i)=>{const face=track(glassFace(kind,false,true,'display',(['near','recess','crown','base','clear','recess'] as const)[i]));materials.push({material:face,role:'glass'});return face;})));}
  const edge=track(new THREE.LineBasicMaterial({toneMapped:false,transparent:true,opacity:.65,depthWrite:false}));materials.push({material:edge,role:'edge'});group.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geometry)),edge));
  if(!solid){const node=track(new THREE.MeshPhongMaterial({toneMapped:false,transparent:true,opacity:.9}));materials.push({material:node,role:'node'});const point=track(new THREE.SphereGeometry(.015,10,6));for(let i=0;i<8;i++){const mesh=new THREE.Mesh(point,node);mesh.position.set((i&1?1:-1)*size/2,(i&2?1:-1)*size/2,(i&4?1:-1)*size/2);group.add(mesh);}}
  return group;
 });
 function setTheme(dark:boolean,active=false){
  materials.forEach(({material,role})=>{
   if(role==='glass'){setGlass(material as THREE.MeshPhysicalMaterial,material.userData.faceKind,dark);}
   else{material.color.setHex(role==='solid'?(dark?0x164d75:0x15547e):role==='node'?(dark?0x78b0ff:0x168cee):(dark?0x72b3d4:0x397cae));material.opacity=role==='edge'?(active?.9:.5):role==='node'?.9:role==='solid'?(material.userData.level===1?.54:.72):1;}
   material.userData.baseOpacity=material.opacity;
   if(role==='node'&&material instanceof THREE.MeshPhongMaterial){material.emissive.setHex(active?0x246bd4:0);material.emissiveIntensity=.3;}
  });
 }
 function apply(state:{outer:number;core:number;individual:number;height:number;merge?:number;alignment?:number;response?:number}){const merge=state.merge??0;groups.forEach((group,index)=>{const reveal=[state.outer,state.core,state.individual][index];group.visible=reveal>.001&&(index!==2||merge<.999);group.scale.setScalar((.94+.06*reveal)*(index===2?1:index===1?1+merge*.04:1));group.position.y=index===2?state.height:index===0?.14*(1-reveal):0;group.rotation.y=0;group.traverse(object=>{const item=object as THREE.Mesh;if(item.material)for(const material of Array.isArray(item.material)?item.material:[item.material]){material.opacity=(material.userData.baseOpacity??1)*reveal*(index===2?1-merge:1);if(index===1&&material instanceof THREE.MeshPhysicalMaterial)material.emissiveIntensity=.012+(state.response??0)*.12;}});});}
 setTheme(false);return {root,groups,setTheme,apply,dispose(){resources.forEach(resource=>resource.dispose());}};
}
