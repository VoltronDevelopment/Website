import * as THREE from "three";

import {philosophyDimensions} from "./philosophy-cube-timeline";
import {glassFace,setGlass,type GlassFace} from './lattice-materials';
export {philosophyCubeState} from "./philosophy-cube-timeline";

export function addPhilosophyLighting(scene:THREE.Scene){
 scene.add(new THREE.HemisphereLight(0xeaf6ff,0x314d6b,2));
 const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(-4,6,4);scene.add(key);
 const fill=new THREE.DirectionalLight(0x81c9ff,.65);fill.position.set(4,1,3);scene.add(fill);
}

/** Canonical geometry and materials for both Individual Excellence illustrations. */
export function createPhilosophyCubes(){
 const root=new THREE.Group(),resources:{dispose():void}[]=[],materials:{material:THREE.Material&{color:THREE.Color};role:'solid'|'glass'|'edge'|'node'}[]=[];
 const track=<T extends {dispose():void}>(resource:T)=>{resources.push(resource);return resource;};
 const sizes=[philosophyDimensions.outer,philosophyDimensions.core,philosophyDimensions.individual];
 const groups=sizes.map((size,index)=>{
  const group=new THREE.Group();root.add(group);const solid=index>0,geometry=track(new THREE.BoxGeometry(size,size,size));
  if(solid){const face=track(new THREE.MeshPhongMaterial({toneMapped:false,transparent:true,opacity:1,depthWrite:true,shininess:90,specular:0xd8efff}));face.userData.level=index;materials.push({material:face,role:'solid'});group.add(new THREE.Mesh(geometry,face));}
  else{const kinds:GlassFace[]=['side','rear','top','bottom','front','rear'];group.add(new THREE.Mesh(geometry,kinds.map(kind=>{const face=track(glassFace(kind,false,true,'display'));materials.push({material:face,role:'glass'});return face;})));}
  const edge=track(new THREE.LineBasicMaterial({toneMapped:false,transparent:true,opacity:.65,depthWrite:false}));materials.push({material:edge,role:'edge'});group.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geometry)),edge));
  if(!solid){const node=track(new THREE.MeshPhongMaterial({toneMapped:false,transparent:true,opacity:.9}));materials.push({material:node,role:'node'});const point=track(new THREE.SphereGeometry(.015,10,6));for(let i=0;i<8;i++){const mesh=new THREE.Mesh(point,node);mesh.position.set((i&1?1:-1)*size/2,(i&2?1:-1)*size/2,(i&4?1:-1)*size/2);group.add(mesh);}}
  return group;
 });
 function setTheme(dark:boolean,active=false){
  materials.forEach(({material,role})=>{
   if(role==='glass'){setGlass(material as THREE.MeshPhysicalMaterial,material.userData.faceKind,dark);}
   else{material.color.setHex(role==='solid'?(material.userData.level===1?(dark?0x164d75:0x15547e):(dark?0x73afd0:0x68a5cb)):role==='node'?(dark?0x78b0ff:0x168cee):(dark?0x72b3d4:0x397cae));material.opacity=role==='edge'?(active?.9:.5):role==='node'?.9:1;}
   material.userData.baseOpacity=material.opacity;
   if(role==='node'&&material instanceof THREE.MeshPhongMaterial){material.emissive.setHex(active?0x246bd4:0);material.emissiveIntensity=.3;}
  });
 }
 function apply(state:{outer:number;core:number;individual:number;height:number}){groups.forEach((group,index)=>{const reveal=[state.outer,state.core,state.individual][index];group.visible=reveal>.001;group.scale.setScalar(.94+.06*reveal);group.position.y=index===2?state.height:index===0?.14*(1-reveal):0;group.rotation.y=index===0?.03*(1-reveal):0;group.traverse(object=>{const item=object as THREE.Mesh;if(item.material)for(const material of Array.isArray(item.material)?item.material:[item.material])material.opacity=(material.userData.baseOpacity??1)*reveal;});});}
 setTheme(false);return {root,groups,setTheme,apply,dispose(){resources.forEach(resource=>resource.dispose());}};
}
