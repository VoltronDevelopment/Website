import * as T from 'three';
import {createAlphaPanelGeometry} from '../manufacturing/alpha-panel-geometry';
import {createAlphaBathSurface} from '../home/alpha-bath-surface';
import {createQualityScan} from '../brand/quality-scan';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createSupportingGlass,updateSupportingGlass} from '../brand/supporting-materials';
export function factoryKit(own:<R extends {dispose:()=>void}>(r:R)=>R){
 const pearl=own(new T.MeshStandardMaterial({color:0xdbe8f3,roughness:.38,metalness:.25})),navy=own(new T.MeshStandardMaterial({color:0x19374f,roughness:.35,metalness:.45})),steel=own(new T.MeshStandardMaterial({color:0x9bb7ca,metalness:.75,roughness:.26})),glass=own(createSupportingGlass('clear-enclosure')),reading=own(createSupportingGlass('frosted-reading')),active=own(new T.MeshStandardMaterial({color:0x278fc3,emissive:0x1275b9,emissiveIntensity:.5}));
 const geometry=new Map<string,T.BufferGeometry>();
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const context=shadowCanvas.getContext('2d')!;const gradient=context.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(9,29,48,.5)');gradient.addColorStop(1,'rgba(9,29,48,0)');context.fillStyle=gradient;context.fillRect(0,0,128,128);const shadowTexture=own(new T.CanvasTexture(shadowCanvas)),shadowMaterial=own(new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.5}));
 function box(parent:T.Object3D,size:number[],pos:number[],material:T.Material=pearl){const key=size.join(',');let geo=geometry.get(key);if(!geo){geo=own(new RoundedBoxGeometry(size[0],size[1],size[2],1,Math.min(.045,...size.map(n=>n/5))));geometry.set(key,geo);}const m=new T.Mesh(geo,material);m.position.fromArray(pos);parent.add(m);return m;}
 function line(parent:T.Object3D,points:number[][],color=0x4c8ab0){const m=own(new T.LineBasicMaterial({color,transparent:true,opacity:.55}));const l=new T.Line(own(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p as [number,number,number])))),m);parent.add(l);return l;}
 function panel(parent:T.Object3D,x:number,y:number,z:number){const g=new T.Group();g.position.set(x,y,z);parent.add(g);box(g,[1.65,1.05,.09],[0,.55,0],navy);box(g,[1.49,.89,.025],[0,.55,.06],reading);const nodes=[];for(let i=0;i<3;i++){nodes.push(box(g,[.27,.12,.025],[-.48,.82-i*.25,.09],steel));line(g,[[-.34,.82-i*.25,.1],[-.12,.82-i*.25,.1],[-.12,.57,.1],[.08,.57,.1]]);}nodes.push(box(g,[.27,.23,.025],[.22,.57,.09],steel));nodes.push(box(g,[.17,.12,.025],[.57,.57,.09],steel));line(g,[[.36,.57,.1],[.49,.57,.1]]);g.userData.nodes=nodes;box(g,[.08,.45,.08],[0,-.1,0],steel);return g;}
 function factory(parent:T.Object3D,variant=0){const g=new T.Group();parent.add(g);const shell=new T.Group(),equipment=new T.Group();g.add(shell,equipment);
  const shadow=new T.Mesh(own(new T.PlaneGeometry(18,14)),shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=-.28;g.add(shadow);
  box(shell,[14,.22,10],[0,-.15,0],steel);box(shell,[12,.1,6.6],[0,.01,-.8],pearl);
  // Rear wall, office frontage and an open production cutaway facing the reader.
  box(shell,[12,2.6,.16],[0,1.35,-4],pearl);box(shell,[.16,2.6,6.4],[-6,1.35,-.8],pearl);
  for(const x of [-5.8,-2,2,5.8])for(const z of [-3.8,2.1])box(shell,[.13,3.1,.13],[x,1.55,z],steel);
  for(const x of [-3.9,0,3.9]){box(shell,[3.7,.16,1.9],[x,3.05,-3.1],navy).rotation.z=variant?.06:-.07;for(let i=0;i<5;i++)box(shell,[.04,.06,1.8],[x-1.5+i*.7,3.18,-3.1],steel);}
  box(shell,[2.15,2.35,2.4],[-4.7,1.2,.7],glass);for(const x of [-5.75,-4.7,-3.65])box(shell,[.06,2.35,.06],[x,1.2,1.9],steel);box(shell,[2.2,.1,2.5],[-4.7,2.4,.7],navy);
  box(shell,[2,.25,1.45],[-4.5,.15,3.1],navy);for(let i=0;i<5;i++)box(shell,[1.8,.06,.1],[-4.5,.31,2.6+i*.22],steel);
  const tanks:T.Mesh[]=[],water=own(createAlphaBathSurface(0)),quietWater=own(createAlphaBathSurface(1));
  const surface=own(new T.PlaneGeometry(1.15,1.45,12,10));
  // The fifth rail position is the dry handoff to inspection.
  for(const [index,x] of [-2.4,-.75,.9,2.29].entries()){
   const vessel=new T.Group();equipment.add(vessel);vessel.position.set(x,0,-1.8);
   box(vessel,[1.35,.12,1.7],[0,.12,0],steel);
   for(const z of [-.8,.8]){
    box(vessel,[1.35,.84,.08],[0,.52,z],z>0?glass:steel);
    box(vessel,[1.39,.055,.09],[0,.95,z],steel);
   }
   for(const side of [-.635,.635]){
    box(vessel,[.08,.84,1.54],[side,.52,0],steel);
    box(vessel,[.09,.055,1.53],[side,.95,0],steel);
    for(const z of [-.8,.8])box(vessel,[.055,.82,.06],[side,.53,z],steel);
   }
   box(vessel,[1.18,.04,1.46],[0,.21,0],navy);
   const liquid=new T.Mesh(surface,index===2?water:quietWater);
   liquid.name='owned-liquid-'+index;liquid.rotation.x=-Math.PI/2;liquid.position.y=.79;liquid.renderOrder=3;vessel.add(liquid);
   tanks.push(box(vessel,[.09,.09,.09],[.55,1.02,.8],navy));
  }
  for(const x of [-3.2,5])box(equipment,[.1,2.5,.1],[x,1.25,-1.8],steel);box(equipment,[8.4,.14,.2],[.9,2.5,-1.8],steel);
  const carrier=new T.Group();equipment.add(carrier);box(carrier,[.9,.14,.7],[0,2.38,0],navy);const hook=new T.Group();carrier.add(hook);const stem=box(hook,[.06,1,.06],[0,1.85,0],steel);const panelGeometry=own(createAlphaPanelGeometry());panelGeometry.computeBoundingBox();
  const panelHeight=panelGeometry.boundingBox!.max.y-panelGeometry.boundingBox!.min.y;
  const part=new T.Mesh(panelGeometry,steel);part.name='owned-workpiece';part.scale.setScalar(.65/panelHeight);
  part.position.y=1.12;hook.add(part);
  const booth=new T.Group();booth.position.set(3.4,0,1);equipment.add(booth);box(booth,[2,.68,1.2],[0,.34,0],navy);for(const x of [-.9,.9])box(booth,[.08,1.7,.08],[x,1.6,0],steel);box(booth,[1.9,.1,.15],[0,2.4,0],steel);const scanner=createQualityScan(1.7,1,own),scan=scanner.group;scan.position.set(0,1.6,0);scan.rotation.x=-Math.PI/2;booth.add(scan);scan.userData.scanner=scanner;
  const record=panel(g,-4.5,2.6,.5);const capability=panel(g,1,3.3,-2);record.visible=false;capability.visible=false;
  for(const x of [2.8,5.8]){box(shell,[.9,.06,.8],[x,.09,3.9],steel);box(shell,[.65,.4,.55],[x,.33,3.9],navy);}
  const cargo=box(g,[.8,.6,.7],[-4.5,.7,3.2],pearl);
  // Site-specific equipment and storage layout retain a common architecture.
  if(variant===1){equipment.position.x=-.4;equipment.scale.x=.88;box(shell,[1.8,1.4,.65],[4.8,.75,-3.4],navy);for(let i=0;i<3;i++)box(shell,[1.9,.06,.7],[4.8,.35+i*.5,-3.4],steel);}
  return {g,shell,equipment,carrier,hook,stem,part,scan,record,capability,cargo,tanks,water,quietWater};
 }
 function truck(parent:T.Object3D){const g=new T.Group();parent.add(g);box(g,[2.7,.15,1.2],[0,.4,0],steel);box(g,[1.8,.08,1.15],[-.4,1.65,0],pearl);for(const z of [-.55,.55])box(g,[1.8,1.2,.07],[-.4,1.05,z],pearl);box(g,[.08,1.2,1.15],[.5,1.05,0],pearl);box(g,[.85,.95,1.2],[1,.9,0],navy);box(g,[.04,.4,1.05],[1.44,1.12,0],glass);for(const z of [-.61,.61])box(g,[.6,.35,.03],[1,1.12,z],glass);const wheels:T.Mesh[]=[];const geo=own(new T.CylinderGeometry(.24,.24,.15,16));for(const x of [-.9,.65,1.15])for(const z of [-.62,.62]){const w=new T.Mesh(geo,navy);w.rotation.x=Math.PI/2;w.position.set(x,.27,z);g.add(w);wheels.push(w);}const doors:T.Group[]=[];for(const side of [-1,1]){const hinge=new T.Group();hinge.position.set(-1.3,1.05,side*.55);g.add(hinge);box(hinge,[.07,1.2,.55],[0,0,-side*.275],pearl);doors.push(hinge);}return {g,wheels,doors};}
 return {box,line,panel,factory,truck,pearl,navy,steel,glass,reading,active,theme(dark:boolean){pearl.color.set(dark?0x91a9bf:0xdbe8f3);navy.color.set(dark?0x152e46:0x254760);updateSupportingGlass(glass,dark);updateSupportingGlass(reading,dark);}};
}
