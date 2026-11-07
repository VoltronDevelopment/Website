export {prepareArtworkEnvironment} from '../brand/artwork-studio';
import * as T from 'three';
import {receivingForkPath} from "./network-simulation";
import {plantFrame} from './plant-framing';
import {operatingFacility} from './authored-scenes';
import {mountAuthoredNetwork} from './authored-renderer';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import {productionState,routePoint,networkStatus,inspectionSweep,ownedBathContact,receivingDoorOpen,type Point} from './network-simulation';
import {sceneEnvironment,addArtworkSoftboxes,releaseStudioLookups} from '../brand/artwork-studio';
import {createRenderQuality} from '../performance/scene-policy';
import {factoryKit} from './factory-kit';
import {sceneDuration,smooth,type NetworkSceneKind} from './network-story';
export function mountNetworkStory(canvas:HTMLCanvasElement,host:HTMLElement,kind:NetworkSceneKind,onTime:(t:number)=>void){
 return kind==='owned'?mountOwnedNetwork(canvas,host,kind,onTime):mountAuthoredNetwork(canvas,host,kind,onTime);
}
function mountOwnedNetwork(canvas:HTMLCanvasElement,host:HTMLElement,kind:NetworkSceneKind,onTime:(t:number)=>void){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:new URLSearchParams(location.search).has('scene-capture')}),quality=createRenderQuality(canvas,2,55);renderer.setPixelRatio(quality.ratio);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const scene=new T.Scene(),root=new T.Group();scene.add(root);const camera=new T.OrthographicCamera(-11,11,8,-8,.1,150),environment=sceneEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe9f5ff,0x183047,2));const light=new T.DirectionalLight(0xffffff,3);light.position.set(-10,18,12);scene.add(light);
 const resources=new Set<{dispose:()=>void}>(),own=<R extends {dispose:()=>void}>(r:R)=>{resources.add(r);return r;},kit=factoryKit(own),factories:ReturnType<typeof kit.factory>[]=[];
 const primary=kit.factory(root);const facility=operatingFacility(primary,kit,own);factories.push(primary);const truck=kit.truck(root);truck.g.position.set(-4.5,0,8.5);truck.g.rotation.y=-Math.PI/2;
 const handler=new T.Group();root.add(handler);kit.box(handler,[.8,.35,.75],[0,.3,.8],kit.navy);kit.box(handler,[.08,1.2,.08],[0,.65,.45],kit.steel);
 primary.g.add(primary.part);primary.part.visible=kind==='owned';
 // The receiver pallet remains under the panel through both roller transfers.
 const gripper=new T.Group();primary.hook.add(gripper);
 kit.box(gripper,[.32,.045,.16],[0,.0225,0],kit.steel);
 const jaws=[-1,1].map(side=>kit.box(gripper,[.28,.07,.025],[0,-.035,side*.038],kit.navy));
 const receiver=new T.Group();primary.equipment.add(receiver);
 kit.box(receiver,[.78,.08,.48],[0,-.04,0],kit.steel);
 for(const z of [-.07,.07])kit.box(receiver,[.64,.09,.055],[0,.045,z],kit.navy);
 const rollerGeometry=own(new T.CylinderGeometry(.055,.055,.8,16));
 function rollerRun(x:number,z:number,length:number,alongX=false){
  const bed=new T.Group();primary.equipment.add(bed);bed.position.set(x,0,z);
  if(alongX)bed.rotation.y=Math.PI/2;
  for(const side of [-.41,.41]){
   kit.box(bed,[.08,.14,length],[side,.66,0],kit.navy);
   for(const end of [-1,1])kit.box(bed,[.09,.58,.1],[side,.32,end*(length/2-.12)],kit.steel);
  }
  const intervals=Math.ceil(length/.24);
  for(let i=0;i<intervals;i++){
   const roller=new T.Mesh(rollerGeometry,kit.steel);roller.rotation.z=Math.PI/2;
   roller.position.set(0,.715,(i+.5)*length/intervals-length/2);bed.add(roller);
  }
 }
 rollerRun(3.83,-1.8,1.2,true);rollerRun(3.4,-.37,2.45);
 rollerRun(3.85,1,1.25,true);rollerRun(4.3,2.04,1.53);
 const lift=new T.Group();primary.equipment.add(lift);lift.position.set(4.3,0,3.2);
 kit.box(lift,[1,.12,.77],[0,.1,0],kit.navy);
 const ram=kit.box(lift,[.25,1,.24],[0,0,0],kit.steel);
 const liftTop=kit.box(lift,[.88,.08,.65],[0,0,0],kit.steel);
 let transfer:T.Group|undefined;const routes:T.Line[]=[],paths:Point[][]=[],signals:T.Mesh[]=[];
 const handlerWheels:T.Group[]=[];const forkLift=new T.Group();handler.add(forkLift);for(const x of [-.18,.18])kit.box(forkLift,[.1,.08,1.1],[x,.27,0],kit.steel);for(const x of [-.4,.4])for(const z of [.55,1.05]){const wheel=new T.Mesh(own(new T.CylinderGeometry(.16,.16,.1,12)),kit.navy);wheel.rotation.z=Math.PI/2;const axle=new T.Group();axle.position.set(x,.16,z);handler.add(axle);axle.add(wheel);
 kit.box(axle,[.012,.16,.035],[Math.sign(x)*.057,0,0],kit.steel);handlerWheels.push(axle);}
 if(kind==='learning'){
  primary.g.position.set(-7,0,3);primary.g.scale.setScalar(.7);
  const second=kit.factory(root,1);second.g.position.set(7,0,3);second.g.scale.setScalar(.7);factories.push(second);
  const third=kit.factory(root,1);third.g.position.set(0,0,-8);third.g.scale.setScalar(.58);factories.push(third);
  truck.g.visible=false;transfer=kit.panel(root,0,5,0);

 }
 if(kind==='products'){
  primary.g.scale.setScalar(.65);primary.g.position.set(-5,0,-3);truck.g.visible=false;
  const bench=new T.Group();root.add(bench);kit.box(bench,[5,.2,3],[3,1.4,3],kit.glass);for(const x of [1,5])for(const z of [2,4])kit.box(bench,[.15,1.4,.15],[x,.7,z],kit.steel);
  transfer=kit.panel(root,3,2.8,1);const assembly=new T.Group();assembly.name='prototype';assembly.position.set(3,1.6,3);root.add(assembly);kit.box(assembly,[2,.18,1.2],[0,0,0],kit.steel);const ring=new T.Mesh(own(new T.TorusGeometry(.47,.15,12,36)),kit.pearl);ring.position.set(0,.65,0);assembly.add(ring);for(const x of [-.65,.65])kit.box(assembly,[.18,.7,.3],[x,.35,0],kit.navy);
 }
 root.updateMatrixWorld(true);
 if(kind==='learning'&&transfer){
  const port=(f:typeof primary,side:number)=>f.record.localToWorld(new T.Vector3(side*.825,.55,.1)).toArray() as Point;
  const source=port(primary,1),destination=port(factories[1],-1),future=port(factories[2],-1),left:Point=[-.825,5.55,.1],right:Point=[.825,5.55,.1];
  paths.push([source,[source[0],7,source[2]],[-.825,7,source[2]],[-.825,7,.1],left],[right,[.825,7,.1],[destination[0],7,.1],[destination[0],7,destination[2]],destination],[right,[.825,7,.1],[future[0],7,.1],[future[0],7,future[2]],future]);
  for(const path of paths){routes.push(kit.line(root,path));const point=new T.Mesh(own(new T.SphereGeometry(.095,10,10)),kit.active);root.add(point);signals.push(point);}
 }
 const clip=new T.Plane(new T.Vector3(0,-1,0),20);renderer.localClippingEnabled=true;for(const mat of [kit.pearl,kit.navy,kit.steel,kit.glass,kit.reading,kit.active])mat.clippingPlanes=[clip];
 // Fine surface particles resolve into the actual factory geometry, with no incoming wave.
 const stagedMaterials:{base:T.MeshStandardMaterial;copy:T.MeshStandardMaterial}[]=[],installation=new T.Plane(new T.Vector3(0,-1,0),10);const stagedGroup=kind==='partnership'?primary.equipment:kind==='products'?root.getObjectByName('prototype'):null;if(stagedGroup){const clones=new Map<T.Material,T.Material>();stagedGroup.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;const base=o.material;let copy=clones.get(base);if(!copy){const created=own(base.clone()) as T.Material;created.clippingPlanes=[clip,installation];clones.set(base,created);copy=created;if(base instanceof T.MeshStandardMaterial&&copy instanceof T.MeshStandardMaterial)stagedMaterials.push({base,copy});}o.material=copy!;});}
 root.updateMatrixWorld(true);const samples:number[]=[],starts:number[]=[],samplers=new Map<T.BufferGeometry,MeshSurfaceSampler>();root.traverse(o=>{if(!(o instanceof T.Mesh)||o.geometry.type==='PlaneGeometry')return;let sampler=samplers.get(o.geometry);if(!sampler){sampler=new MeshSurfaceSampler(o).build();samplers.set(o.geometry,sampler);}for(let i=0;i<24;i++){const p=new T.Vector3();sampler.sample(p);o.localToWorld(p);samples.push(p.x,p.y,p.z);let ancestor:T.Object3D|null=o,staged=false;while(ancestor){if(ancestor===stagedGroup)staged=true;ancestor=ancestor.parent;}starts.push(staged?(kind==='partnership'?4:8):0);}});
 const count=Math.min(12000,samples.length/3),positions=new Float32Array(count*3),targets=new Float32Array(count*3),particleStarts=new Float32Array(count);for(let i=0;i<count;i++){const index=Math.floor(i*(samples.length/3)/count)*3;targets.set(samples.slice(index,index+3),i*3);particleStarts[i]=starts[index/3];}
 const pg=own(new T.BufferGeometry());pg.setAttribute('position',new T.BufferAttribute(positions,3));const pm=own(new T.PointsMaterial({color:0x49abe0,size:.035,transparent:true,opacity:.8,depthWrite:false})),particles=new T.Points(pg,pm);scene.add(particles);
 let time=0,paused=false,visible=false,disposed=false,lost=false,raf=0,previous=0,lastReport=-1;const duration=sceneDuration(kind);
 const entry=ownedBathContact(false),exit=ownedBathContact(true);
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);const span=kind==='learning'?(host.clientWidth<768?13:30):kind==='products'?23:21;const aspect=w/Math.max(1,h),height=Math.max(kind==='learning'?(host.clientWidth<768?15:20):14,span/aspect);camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;camera.position.set(20,17,24);camera.lookAt(0,kind==='learning'?0:1,0);camera.updateProjectionMatrix();}
 function render(){if(disposed||lost)return;if(kind==='learning'&&host.clientWidth<768){let x=-7,z=3;if(time>=7){const a=smooth((time-7)/2);x=-7+7*a;z=3-3*a;}if(time>=11){const a=smooth((time-11)/2);x=7*a;z=3*a;}if(time>=19){const a=smooth((time-19)/2);x=7-7*a;z=3-11*a;}camera.position.set(x+20,17,z+24);camera.lookAt(x,1,z);factories.forEach((f,i)=>{f.g.visible=(i===0&&time<13)||(i===1&&time>=11&&time<21)||(i===2&&time>=19);});}else{factories.forEach(f=>f.g.visible=true);}const dark=document.documentElement.dataset.theme==='dark';if(host.dataset.renderTheme!==String(dark)){kit.theme(dark);stagedMaterials.forEach(({base,copy})=>{copy.color.copy(base.color);copy.opacity=base.opacity;});host.dataset.renderTheme=String(dark);}const form=smooth(time/2.8);clip.constant=-.4+form*9;installation.constant=kind==='partnership'?-.1+3.6*smooth((time-4)/2):1.5+1.8*smooth((time-8)/2);const secondary=kind==='partnership'?time>=4&&time<6:kind==='products'?time>=8&&time<10:false;particles.visible=form<1||secondary;pm.opacity=.8;if(particles.visible){for(let i=0;i<count;i++){const start=particleStarts[i],progress=smooth((time-start)/(start?2:2.8)),show=time>=start&&progress<1;positions[i*3]=targets[i*3]+Math.sin(i*2.7)*.35*(1-progress);positions[i*3+1]=show?targets[i*3+1]+Math.cos(i*1.3)*.7*(1-progress):1000;positions[i*3+2]=targets[i*3+2]+Math.sin(i*.7)*.35*(1-progress);}pg.attributes.position.needsUpdate=true;}

  const p=productionState(time);truck.g.position.z=p.truckZ;const open=receivingDoorOpen(time);truck.doors.forEach((door,i)=>door.rotation.y=(i===0?1:-1)*Math.PI*.52*open);truck.wheels.forEach(w=>w.rotation.y=-p.truckZ/.24);primary.cargo.visible=false;
  // Stage the transporter outside the rear opening, then retreat after the hoist takes the load.
  handler.visible=kind==='owned'&&time>=4&&time<9.1;
  const insertion=T.MathUtils.smoothstep(time,5.1,5.5);
  const withdrawal=T.MathUtils.smoothstep(time,8.15,9.1);
  handler.position.set(time<5.5?-4.5:time<8?p.part[0]:-2.4+withdrawal*1.8,0,time<5.5?1.6+1.6*insertion:time<8?p.part[2]:-1.8);
  const path=receivingForkPath(time);handler.rotation.y=path.yaw;
  const travel=path.distance+withdrawal*1.8-insertion*1.6;
  handlerWheels.forEach(wheel=>{wheel.rotation.x=travel/.16;});
  forkLift.position.y=(time<5.5?.805:time<8?p.part[1]:1.12)-.325-.31;
  factories.forEach((f,i)=>{const localTime=kind==='owned'?time:kind==='learning'?(i===0?8+Math.min(3,time):i===1?Math.max(0,time-8):0):kind==='partnership'?Math.max(0,time-4):0;const operation=productionState(localTime);f.carrier.position.set(localTime<8?-2.4:operation.part[0],0,-1.8);f.hook.position.y=localTime<8?0:operation.part[1]-1.12;f.part.visible=kind==='owned'?true:kind==='learning'&&((i===0&&time<8)||(i===1&&time>=16&&time<20));if(kind==='owned')f.part.position.fromArray(p.part);f.scan.visible=kind==='owned'?p.scan:kind==='learning'&&i===1&&time>=18&&time<20;const sweep=inspectionSweep(time);f.scan.userData.scanner.update(f.scan.visible?sweep.strength:0,dark);f.scan.position.y=sweep.height;f.record.visible=kind==='owned'?p.record:kind==='learning'?time>=[3,12,21][i]:false;f.capability.visible=kind==='owned'?time>=20:false;f.cargo.visible=false;f.tanks.forEach((tank,j)=>{tank.material=operation.phase==='Dwell'&&j===2?kit.active:kit.navy;});});
  if(kind==='owned'){primary.carrier.position.x=time>=12?4.2:Math.max(-2.4,Math.min(4.2,p.part[0]));primary.hook.position.y=0;
   const tip=time<8?1.445:time<=12?p.part[1]+.325:1.5+.68*smooth((time-12)/.5);
   primary.stem.scale.y=2.38-tip;
   primary.stem.position.y=(2.38+tip)/2;
   gripper.position.y=tip;
   const open=1-smooth((time-7.8)/.2)+smooth((time-12)/.18);
   jaws.forEach((jaw,i)=>jaw.position.z=(i===0?-1:1)*(.037+.07*open));}
  if(kind==='partnership'){primary.equipment.visible=time>=4;primary.record.visible=time>=10;primary.capability.visible=time>=13;truck.g.visible=false;}
  if(kind==='learning'&&transfer){transfer.visible=time>=8;const windows=[[8,11],[12,15],[21,23.5]];signals.forEach((signal,i)=>{const [start,end]=windows[i];routes[i].visible=time>=start;signal.visible=time>=start&&time<end;if(signal.visible)signal.position.fromArray(routePoint(paths[i],smooth((time-start)/(end-start))));});if(time>=19&&time<20){signals[1].visible=true;signals[1].position.fromArray(routePoint(paths[1],1-smooth(time-19)));}}
  if(kind==='products'){primary.record.visible=time>=4;primary.capability.visible=false;primary.scan.visible=false;primary.cargo.visible=false;if(transfer)transfer.visible=time>=4;const assembly=root.getObjectByName('prototype')!;assembly.visible=time>=8;assembly.scale.setScalar(.95+.05*smooth((time-8)/2));}
  const panels=[...factories.flatMap(f=>[f.record,f.capability]),...(transfer?[transfer]:[])];panels.forEach((panel,index)=>{const nodes=panel.userData.nodes as T.Mesh[];if(!nodes)return;const progress=kind==='learning'?(panel===transfer?smooth((time-8)/3):index===0?smooth((time-4)/3):index===2?smooth((time-12)/3):smooth((time-21)/2)):kind==='owned'?smooth((time-15)/2):smooth((time-9)/3);nodes.forEach((node,i)=>node.material=progress>i/5?kit.active:kit.steel);});
  const supported=time>=12;
  receiver.position.set(supported?p.part[0]:4.2,supported?p.part[1]-.325:.85,supported?p.part[2]:-1.8);
  const liftHeight=time<15.7?.77:receiver.position.y-.08;
  liftTop.position.y=liftHeight-.04;
  ram.scale.y=liftHeight-.08-.16;ram.position.y=.16+ram.scale.y/2;
  for(const water of [primary.water,primary.quietWater]){
   water.uniforms.uTime.value=time;water.uniforms.uDark.value=dark?1:0;
  }
  // First and last contact occur when the underside reaches the bath surface.
  const ages=primary.water.uniforms.uContacts.value;
  ages.set(time>=entry?time-entry:-1,-1,-1,time>=exit?time-exit:-1);
  facility.update(time,dark);
  const aspect=host.clientWidth/Math.max(1,host.clientHeight),frame=plantFrame('owned',time,aspect);
  camera.top=frame.height/2;camera.bottom=-camera.top;
  camera.right=camera.top*aspect;camera.left=-camera.right;
  camera.position.set(frame.x+20,frame.y+24,frame.z+24);
  camera.lookAt(frame.x,frame.y,frame.z);camera.updateProjectionMatrix();
  renderer.render(scene,camera);host.dataset.sceneState='live';host.dataset.storyTime=time.toFixed(2);host.dataset.truckZ=p.truckZ.toFixed(3);host.dataset.partPosition=p.part.join(',');host.dataset.support=p.support;host.dataset.operation=networkStatus(kind,time);
 }
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.1;if(visible)wake();else stop();},{threshold:[0,.1]});observer.observe(host);const ro=new ResizeObserver(()=>{resize();render();});ro.observe(host);const themeObserver=new MutationObserver(()=>render());themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 function stop(){cancelAnimationFrame(raf);raf=0;previous=0;host.dataset.running='false';}
 function wake(){if(!disposed&&!lost&&visible&&!document.hidden&&!raf&&(!paused)){host.dataset.running='true';raf=requestAnimationFrame(tick);}}
 function tick(now:number){raf=0;if(disposed||lost||!visible||document.hidden)return;if(previous&&now-previous<33){wake();return;}const dt=previous?Math.min(.08,(now-previous)/1000):0;previous=now;if(!paused)time=Math.min(duration,time+dt);if(time>=duration)paused=true;render();const report=Math.floor(time*4);if(report!==lastReport){lastReport=report;onTime(time);}if(quality.sample(now))renderer.setPixelRatio(quality.ratio);wake();if(!raf)host.dataset.running='false';}
 function visibility(){if(document.hidden)stop();else wake();}
 const contextLost=(e:Event)=>{e.preventDefault();lost=true;stop();host.dataset.ready='false';host.dataset.sceneState='fallback';};
 const contextRestored=()=>{lost=false;host.dataset.ready='true';quality.reset();render();wake();};
 canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);document.addEventListener('visibilitychange',visibility);

 resize();render();wake();
 return {seek(t:number){time=Math.max(0,Math.min(duration,t));paused=true;stop();render();onTime(time);},replay(){time=0;paused=false;stop();wake();},dispose(){disposed=true;stop();canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);document.removeEventListener('visibilitychange',visibility);observer.disconnect();ro.disconnect();themeObserver.disconnect();releaseStudioLookups(renderer,scene);resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();if(!canvas.isConnected)renderer.forceContextLoss();}};
}
