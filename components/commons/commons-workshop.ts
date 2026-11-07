import {courtyardStudy} from './courtyard-study';
import {createAlphaPanelGeometry} from '../manufacturing/alpha-panel-geometry';
import * as T from 'three';
import type {factoryKit} from '../network/factory-kit';
import type {CommonsKind} from './commons-content';

type WorkshopTools={
 logo?:T.Texture;
 bindFinish:(color:T.Color,light:number,dark:number)=>void;
 kit:ReturnType<typeof factoryKit>;
 box:(parent:T.Object3D,size:number[],position:number[],material?:T.Material|T.Material[])=>T.Mesh;
 own:<R extends {dispose:()=>void}>(resource:R)=>R;
};
const ease=(value:number)=>T.MathUtils.smoothstep(value,0,1);

/** Drawing, paper and observations give Commons its own physical vocabulary. */
export function createCommonsWorkshop(kind:CommonsKind,index:number,root:T.Group,{kit,box,own,bindFinish,logo}:WorkshopTools){
 if(!['workshop','resources','learning'].includes(kind))return null;
 if(kind==='workshop')return courtyardStudy(root,kit,own,bindFinish);
 if(kind==='resources' && logo){
  const side=2.38,half=side/2;
  const cabinet=new T.Group();
  cabinet.position.set(.16,.57,0);cabinet.rotation.y=.15;root.add(cabinet);
  const glass=own(new T.MeshPhysicalMaterial({roughness:.16,metalness:.06,clearcoat:1,transparent:true,opacity:.37,depthWrite:false}));
  bindFinish(glass.color,0x85b8d4,0x407a9b);
  for(const x of [-half,half])box(cabinet,[.055,side,side],[x,0,0],glass);
  for(const y of [-half,half])box(cabinet,[side,.055,side],[0,y,0],glass);
  const backing=own(new T.MeshStandardMaterial({roughness:.28,metalness:.09}));
  bindFinish(backing.color,0xd6e9f3,0x17324a);
  box(cabinet,[side,side,.08],[0,0,-half],backing);
  const tile=box(cabinet,[2.02,2.02,.065],[0,0,-.74],backing);
  const mark=new T.Mesh(own(new T.PlaneGeometry(1.72,1.72)),own(new T.MeshBasicMaterial({map:logo,transparent:true,depthWrite:false,toneMapped:false})));
  mark.position.z=.56;tile.add(mark);mark.scale.set(1/2.02,1/2.02,1);
  const hinge=new T.Group();hinge.position.set(-half,0,half);cabinet.add(hinge);
  const doorFinish=own(new T.MeshPhysicalMaterial({roughness:.26,metalness:.25,clearcoat:1}));
  bindFinish(doorFinish.color,0x234969,0x18344f);
  const door=box(hinge,[side,side,.07],[half,0,0],doorFinish);
  const edges=new T.LineSegments(own(new T.EdgesGeometry(door.geometry)),own(new T.LineBasicMaterial({color:0x447fa6})));
  door.add(edges);
  for(const y of [-.82,.82])box(hinge,[.085,.23,.12],[0,y,0],kit.steel);
  const latch=box(hinge,[.08,.32,.09],[side-.18,0,.085],kit.steel);
  return (time:number)=>{
   const release=ease((time-.35)/.7);
   latch.rotation.z=-release*Math.PI/2;
   const opening=ease((time-1.05)/3.25);
   hinge.rotation.y=-opening*Math.PI*.54;
   tile.position.z=-.74+1.54*ease((time-3.25)/2.55);
  };
 }
 const paper=own(new T.MeshStandardMaterial({color:0xdce3e7,roughness:.92,metalness:0,side:T.DoubleSide}));
 bindFinish(paper.color,0xedf2f6,0x314558);
 const graphite=0x354c61;
 const point=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
 function stroke(parent:T.Object3D,points:number[][],color=graphite){
  const samples:number[][]=[];
  const subdivisions=points.length<10?20:1;
  for(let segment=1;segment<points.length;segment++){
   for(let step=0;step<subdivisions;step++){
    const u=step/subdivisions;
    samples.push(points[segment-1].map((value,axis)=>value+(points[segment][axis]-value)*u));
   }
  }
  samples.push(points[points.length-1]);
  const line=kit.line(parent,samples,color);
  bindFinish(line.material.color,color,color===graphite?0xd3e3ef:0x78b0ff);
  return {line,reveal:(amount:number)=>line.geometry.setDrawRange(0,Math.round(samples.length*ease(amount)))};
 }
 function rod(parent:T.Object3D,a:T.Vector3,b:T.Vector3,radius:number,material:T.Material){
  const direction=b.clone().sub(a);
  const mesh=new T.Mesh(own(new T.CylinderGeometry(radius,radius,direction.length(),10)),material);
  mesh.position.copy(a).add(b).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(point(0,1,0),direction.normalize());parent.add(mesh);return mesh;
 }
 function drawing(parent:T.Object3D,x:number,z:number){
  const group=new T.Group();group.position.set(x,.145,z);parent.add(group);
  box(group,[1.9,.025,1.7],[0,-.025,0],paper);
  const points=Array.from({length:65},(_,i)=>{const u=i/64;return [-.7+u*1.4,.006,Math.sin(u*Math.PI*2)*.38];});
  return {group,points,mark:stroke(group,points)};
 }
 const bench=own(new T.MeshStandardMaterial({roughness:.79}));
 bindFinish(bench.color,0xbac9d5,0x1d3042);
 box(root,[5.7,.14,3.2],[0,.015,0],bench);
 for(const x of [-2.45,2.45])for(const z of [-1.25,1.25])box(root,[.12,.77,.12],[x,-.43,z],kit.navy);
 if(index===0){
  const sketch=drawing(root,-1.35,0);
  const construction=stroke(root,[[-.1,.16,-.7],[2.3,.16,-.7],[2.3,.16,.7],[-.1,.16,.7],[-.1,.16,-.7]],0x246bd4);
  const geometry=own(new T.BufferGeometry()),vertices=new Float32Array(33*2*3),indices:number[]=[];
  for(let i=0;i<32;i++){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
  const positions=new T.BufferAttribute(vertices,3);geometry.setAttribute('position',positions);geometry.setIndex(indices);
  const enamel=own(new T.MeshStandardMaterial({roughness:.3,metalness:.38,side:T.DoubleSide}));
  bindFinish(enamel.color,0x246bd4,0x69aafa);
  const ribbon=new T.Mesh(geometry,enamel);ribbon.position.x=1.1;root.add(ribbon);
  const dimension=stroke(sketch.group,[[-.70,.012,.38],[-.70,.012,.59],[.70,.012,.59],[.70,.012,.38]],0x246bd4);
  const observation=stroke(root,[[.55,.96,.35],[.55,1.15,.35],[.31,1.15,.35]],0x246bd4);
  const recorded=stroke(sketch.group,[[.45,.014,-.57],[.53,.014,-.48],[.68,.014,-.66]],0x246bd4);
  const nib=box(root,[.075,.075,.075],[0,.17,0],kit.active);
  return (time:number)=>{
   const drawn=ease((time-.2)/1.8);
   sketch.mark.reveal((time-.2)/1.8);construction.reveal((time-2.1)/1.8);
   const tip=sketch.points[Math.round(drawn*64)];
   observation.reveal((time-5.8)/.65);
   dimension.reveal((time-6.25)/.85);
   recorded.reveal((time-7)/.55);
   nib.position.set(-1.35+tip[0],.18,tip[2]);nib.visible=time<2.05;
   const lift=ease((time-4.1)/2.7);
   for(let i=0;i<=32;i++)for(let side=0;side<2;side++){
    const u=i/32,wave=Math.sin(u*Math.PI*2);
    positions.setXYZ(i*2+side,-1.1+u*2.2,.16+lift*(.5+wave*.3),wave*.35+(side?1:-1)*.18);
   }
   positions.needsUpdate=true;geometry.computeVertexNormals();
  };
 }
 if(index===1){
  // The same panel travels from the fixture through the gauge to a recorded observation.
  const stations=[-1.72,0,1.72];
  for(const x of stations)box(root,[1.29,.11,1.02],[x,.155,0],kit.steel);
  for(const x of [-.57,.57])box(root,[.065,1.42,.09],[x,.89,-.04],kit.navy);
  box(root,[1.22,.07,.095],[0,1.6,-.04],kit.navy);
  const panel=new T.Mesh(own(createAlphaPanelGeometry()),kit.steel);panel.scale.setScalar(.72);root.add(panel);
  const mark=stroke(root,[[1.35,.23,.23],[1.56,.23,.42],[2.01,.23,-.24]],0x246bd4);
  const guide=stroke(root,[[-1.75,.11,.82],[0,.11,.82],[1.75,.11,.82]],0x246bd4);
  return (time:number)=>{const infeed=ease((time-.7)/2.3),outfeed=ease((time-5)/1.9);
   panel.position.set(-1.72+1.72*(infeed+outfeed),.676,0);
   guide.reveal((infeed+outfeed)/2);mark.reveal((time-7)/1);};
 }
 if(index===2){
  const panel=new T.Mesh(own(createAlphaPanelGeometry()),kit.steel);panel.rotation.x=-Math.PI/2;panel.scale.setScalar(1.65);panel.position.set(-.55,.27,0);root.add(panel);
  const hole=point(-.55+.36*1.65,.38,-.5*1.65);
  const lens=new T.Group();root.add(lens);
  const ring=new T.Mesh(own(new T.TorusGeometry(.3,.037,9,42)),kit.navy);ring.rotation.x=-Math.PI/2;lens.add(ring);
  rod(lens,point(.2,0,.2),point(.7,0,.7),.055,kit.steel);
  box(root,[1.25,.025,1.48],[1.66,.12,0],paper);
  const note=stroke(root,Array.from({length:45},(_,i)=>[1.66+.27*Math.cos(i*Math.PI/22),.14,.27*Math.sin(i*Math.PI/22)]));
  return (time:number)=>{const focus=ease((time-.5)/2.7);lens.position.set(hole.x-.95*(1-focus),.54+.35*(1-focus),hole.z+.95*(1-focus));note.reveal((time-4)/2);};
 }
 // Contour sheets, a reflective pool and a small tree show a place rather than a component.
 for(let layer=0;layer<4;layer++){
  const geo=own(new T.CylinderGeometry(2-layer*.23,2-layer*.23,.055,7));
  const sheet=new T.Mesh(geo,layer===0?kit.navy:paper);sheet.scale.z=.6;sheet.position.y=layer*.06;root.add(sheet);
 }
 const pool=new T.Mesh(own(new T.CircleGeometry(.65,32)),kit.glass);pool.rotation.x=-Math.PI/2;pool.position.set(-.65,.25,.05);root.add(pool);
 const tree=new T.Group();tree.position.set(.65,.24,0);root.add(tree);
 rod(tree,point(0,0,0),point(0,1.2,0),.035,kit.steel);
 for(let i=0;i<5;i++){
  const branch=new T.Mesh(own(new T.SphereGeometry(.38,12,8)),kit.pearl);
  branch.position.set(Math.sin(i*2.4)*.28,.65+i*.15,Math.cos(i*2.4)*.2);branch.scale.set(1,.5,.75);tree.add(branch);
 }
 return (time:number)=>{tree.scale.setScalar(.8+.2*ease((time-.2)/3));};
}
