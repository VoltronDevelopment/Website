import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createArtworkEnvironment,addArtworkSoftboxes,createFloorEcho} from './artwork-studio';
import {createStoryFormation} from './story-formation';
import {collaborationState,collaborationGait,collaborationOpening,type CollaborationKind} from './collaboration-timeline';
import {createSceneHandoff} from '../performance/scene-handoff';
import {createRenderQuality,prefersStaticScene} from '../performance/scene-policy';

export type CollaborationController={toggle():void;replay():void;seek(time:number):void;dispose():void};
type Mode='static'|'playing'|'paused'|'settled';
export async function mountCollaboration(canvas:HTMLCanvasElement,host:HTMLElement,kind:CollaborationKind,onMode:(mode:Mode)=>void,signal:AbortSignal):Promise<CollaborationController>{
 const handoff=createSceneHandoff(host,canvas),query=new URLSearchParams(location.search),capture=query.has('scene-capture');
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:capture});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const quality=createRenderQuality(canvas,1.5);renderer.setPixelRatio(quality.ratio);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-4,4,3,-3,.1,60),target=new T.Vector3(kind==='about'?.15:0,kind==='about'?1.3:1.7,0);
 camera.position.copy(target).add(new T.Vector3(kind==='about'?6:2.8,kind==='about'?3:3.7,kind==='about'?9:8.5));camera.lookAt(target);
 const environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene,target);
 const key=new T.DirectionalLight(0xffffff,3.6);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.1,far:20});key.shadow.bias=-.0003;key.shadow.normalBias=.025;
 scene.add(key,new T.HemisphereLight(0xeef8ff,0x344c65,1.1));const rim=new T.DirectionalLight(0x9bcce9,1.4);rim.position.set(4,4,-5);scene.add(rim);
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),palette:{material:T.MeshStandardMaterial;light:number;dark:number}[]=[];
 const standard=(light:number,dark=light,metalness=.4,roughness=.35)=>{const m=new T.MeshStandardMaterial({color:light,metalness,roughness});materials.add(m);palette.push({material:m,light,dark});return m;};
 const glass=(light:number,night:number,opacity:number,roughness=.16)=>{const m=new T.MeshPhysicalMaterial({color:light,metalness:.15,roughness,transparent:true,opacity,clearcoat:1,clearcoatRoughness:.14,envMapIntensity:1,side:T.DoubleSide,depthWrite:false});materials.add(m);palette.push({material:m,light,dark:night});return m;};
 function mesh(g:T.BufferGeometry,m:T.Material|T.Material[],parent:T.Object3D,p:number[]=[0,0,0]){geometries.add(g);const o=new T.Mesh(g,m);o.position.fromArray(p);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(parent:T.Object3D,size:[number,number,number],p:number[],m:T.Material,r=.045){return mesh(new RoundedBoxGeometry(...size,3,Math.min(r,...size.map(v=>v*.22))),m,parent,p);}
 const foundations:T.Object3D[]=[],people:T.Object3D[]=[],mixers:T.AnimationMixer[]=[],formations:ReturnType<typeof createStoryFormation>[]=[],mobile=matchMedia('(max-width:767px)').matches;
 let reflection:ReturnType<typeof createFloorEcho>|undefined;
 let diagram:T.Group|undefined,wire:T.LineSegments|undefined,sample:T.Group|undefined,sampleFormation:ReturnType<typeof createStoryFormation>|undefined,scan:T.Mesh|undefined,sweep:T.RectAreaLight|undefined;
 let teardown:(()=>void)|undefined;
 try {
 if(kind==='about'){
  const gltf=await new GLTFLoader().loadAsync('/stories/progression.gltf');if(signal.aborted)throw new DOMException('Aborted','AbortError');
  gltf.scene.updateMatrixWorld(true);
  const arrangements=[{stair:'StraightStair001',rig:'Bip001',offset:new T.Vector3(1.344,0,4.95)},{stair:'LTypeStair002',rig:'Bip006',offset:new T.Vector3(10.04,0,-2.19)}];
  for(const [family,setup]of arrangements.entries()){
   const stairs=new T.Group();stairs.position.copy(setup.offset);scene.add(stairs);foundations.push(stairs);
   const tread=standard(0xd7e7f0,0x66869e,.45,.27),near=glass(0xb7d3e4,0x3a5972,.48,.19),recess=glass(0x789fb8,0x122d43,.56,.25);
   gltf.scene.getObjectByName(setup.stair)!.traverse(o=>{if(!(o instanceof T.Mesh))return;let g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(g.index){const expanded=g.toNonIndexed();g.dispose();g=expanded;}const n=g.getAttribute('normal'),groups:number[][]=[[],[],[]];for(let i=0;i<n.count;i+=3){const role=n.getY(i)>.7?0:n.getX(i)<-.5||n.getZ(i)<-.5?2:1;groups[role].push(i,i+1,i+2);}g.setIndex(groups.flat());g.clearGroups();let at=0;groups.forEach((group,index)=>{g.addGroup(at,group.length,index);at+=group.length;});mesh(g,[tread,near,recess],stairs);});
   const sourceBounds=new T.Box3().setFromObject(gltf.scene.getObjectByName(setup.stair)!),centre=sourceBounds.getCenter(new T.Vector3()),extent=sourceBounds.getSize(new T.Vector3());box(stairs,[extent.x+.24,.09,extent.z+.24],[centre.x,-.07,centre.z],near,.025);
   const indices=family?[1,2]:[0];for(const i of indices){const root=clone(gltf.scene);for(const entry of arrangements){root.getObjectByName(entry.stair)?.removeFromParent();if(entry.rig!==setup.rig)root.getObjectByName(entry.rig)?.removeFromParent();}root.position.copy(setup.offset);scene.add(root);const mixer=new T.AnimationMixer(root),action=mixer.clipAction(gltf.animations[family]);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();mixer.setTime(collaborationGait(i,0));root.updateMatrixWorld(true);const material=standard([0xd2e1ea,0x36546c,0x99b5c8][i],[0x9ebacb,0x284458,0x637f96][i],.3,.39);root.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);o.material=material;o.castShadow=true;}});people.push(root);mixers.push(mixer);}
  }
  host.dataset.peopleCount='3';host.dataset.stairCount='2';host.dataset.stairOccupancy='1,2';host.dataset.skeletons='3';
 }else{
  const table=new T.Group();scene.add(table);foundations.push(table);
  const tabletop=glass(0xe2f1f8,0x759bb8,.48,.13);tabletop.transmission=.16;tabletop.thickness=.18;tabletop.ior=1.46;tabletop.attenuationColor.setHex(0xcde6f5);tabletop.attenuationDistance=4;box(table,[4.3,.12,2.5],[0,1.38,0],tabletop,.16);
  box(table,[4.24,.30,2.44],[0,1.18,0],glass(0xbed9e8,0x294d67,.19,.23),.14);
  const silver=standard(0x9eb7c8,0x688ca7,.82,.24),graphite=standard(0x26455d,0x172f43,.65,.3);
  for(const x of [-1.52,1.52])for(const z of [-.67,.67])mesh(new T.CylinderGeometry(.23,.26,1,32),z<0?graphite:silver,table,[x,.5,z]);
  // Quiet reinforcement sits inside the structural fascia, below the work surface.
  const linePoints:number[]=[];for(let x=-1.9;x<1.9;x+=.38)linePoints.push(x,1.05,1.20,x+.38,1.31,1.20,x+.38,1.31,1.20,x+.38,1.05,1.20);
  const bracing=new T.BufferGeometry();bracing.setAttribute('position',new T.Float32BufferAttribute(linePoints,3));geometries.add(bracing);const braceMaterial=new T.LineBasicMaterial({color:0x6a9bb9,transparent:true,opacity:.3});materials.add(braceMaterial);table.add(new T.LineSegments(bracing,braceMaterial));
  const data=await Promise.all([0,1].map(async i=>{const response=await fetch(`/stories/figure-${i}.bin`,{signal});if(!response.ok)throw Error('Figure unavailable');return response.arrayBuffer();}));
  for(let i=0;i<2;i++){
   const buffer=data[i],header=new Uint32Array(buffer,0,2);if(buffer.byteLength!==8+header[0]*24+header[1]*4)throw Error('Invalid collaboration figure');
   const interleaved=new T.InterleavedBuffer(new Float32Array(buffer,8,header[0]*6),6),g=new T.BufferGeometry();g.setAttribute('position',new T.InterleavedBufferAttribute(interleaved,3,0));g.setAttribute('normal',new T.InterleavedBufferAttribute(interleaved,3,3));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,8+header[0]*24,header[1]),1));
   const person=new T.Group();person.position.set(i?1.03:-1.08,0,-1.6);person.rotation.y=i?-.20:.3;person.scale.setScalar(3.35);scene.add(person);const finish=standard(i?0x34546b:0xc0d2df,i?0x34516a:0x9ab5c9,.32,.42);finish.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying float vFigureHeight;').replace('#include <begin_vertex>','#include <begin_vertex>\nvFigureHeight=position.y;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFigureHeight;').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.16,smoothstep(.80,.85,vFigureHeight));').replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,.92,smoothstep(.80,.85,vFigureHeight));');};mesh(g,finish,person);people.push(person);
  }
  const shape=new T.Shape();shape.moveTo(-.76,.03);shape.bezierCurveTo(-.34,.03,-.40,.79,0,.79);shape.bezierCurveTo(.40,.79,.34,.03,.76,.03);shape.lineTo(.64,0);shape.bezierCurveTo(.28,0,.30,.69,0,.69);shape.bezierCurveTo(-.30,.69,-.28,0,-.64,0);shape.closePath();
  const piece=new T.ExtrudeGeometry(shape,{depth:.5,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:3,steps:1,curveSegments:32});piece.translate(0,0,-.25);geometries.add(piece);
  sample=new T.Group();sample.position.set(.58,1.47,.28);sample.rotation.y=-.10;scene.add(sample);const sampleMetal=new T.MeshPhysicalMaterial({color:0xb3c6d2,metalness:1,roughness:.24,clearcoat:.28,clearcoatRoughness:.2,envMapIntensity:1.1});materials.add(sampleMetal);palette.push({material:sampleMetal,light:0xb3c6d2,dark:0xb3cad9});mesh(piece,sampleMetal,sample);
  const edges=new T.EdgesGeometry(piece,16);geometries.add(edges);const ink=new T.LineBasicMaterial({color:0x247cae,transparent:true,opacity:0});materials.add(ink);wire=new T.LineSegments(edges,ink);wire.position.copy(sample.position);wire.rotation.copy(sample.rotation);scene.add(wire);
  diagram=new T.Group();diagram.position.set(mobile?.58:-1.12,1.47,mobile?.28:.30);diagram.scale.setScalar(mobile?1:.66);scene.add(diagram);const drawing=new T.LineSegments(edges,new T.LineBasicMaterial({color:0x237ea8,transparent:true,opacity:0}));materials.add(drawing.material);drawing.scale.y=.015;diagram.add(drawing);
  const grid=new T.GridHelper(1.7,8,0x5393b4,0x8bb7d0);(grid.material as T.Material).transparent=true;(grid.material as T.Material).opacity=.25;materials.add(grid.material as T.Material);geometries.add(grid.geometry);diagram.add(grid);
  scan=mesh(new T.PlaneGeometry(.025,1.1),new T.MeshBasicMaterial({color:0x85dfff,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}),scene,[.58,1.85,.58]);materials.add(scan.material as T.Material);
  sweep=new T.RectAreaLight(0xd8f4ff,0,.18,1.4);sweep.position.set(-.2,3,.5);sweep.lookAt(.58,1.7,.28);scene.add(sweep);
  reflection=createFloorEcho([sample],1.455);scene.add(reflection.group);
  host.dataset.peopleCount='2';host.dataset.handshake='false';host.dataset.workpiece='shared-arch';
 }
 const floorMaterial=new T.ShadowMaterial({color:0x183e59,transparent:true,opacity:.12});floorMaterial.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFloorWorld;').replace('#include <project_vertex>','#include <project_vertex>\nvFloorWorld=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vFloorWorld;').replace('#include <tonemapping_fragment>','gl_FragColor.a*=exp(-dot(vFloorWorld.xz,vFloorWorld.xz)*.18);\n#include <tonemapping_fragment>');};materials.add(floorMaterial);const floor=mesh(new T.PlaneGeometry(20,20),floorMaterial,scene,[0,-.125,0]);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 for(const [i,root]of [...foundations,...people].entries()){const f=createStoryFormation(root,mobile?i<foundations.length?3000:4200:i<foundations.length?5500:7200,i+1);formations.push(f);scene.add(f.points);}
 if(sample){sampleFormation=createStoryFormation(sample,mobile?6000:10000,20);scene.add(sampleFormation.points);}
 let time=collaborationOpening,paused=false,frozen=false,visible=false,disposed=false,lost=false,frame=0,last=0;
 const review=query.get('story-time')??query.get(kind==='about'?'hero-time':'hand-time');if(review!==null&&Number.isFinite(+review)){time=T.MathUtils.clamp(+review,0,12);paused=frozen=true;}
 const dark=()=>document.documentElement.dataset.theme==='dark';
 function draw(){if(disposed||lost)return;const state=collaborationState(kind,time),night=dark();palette.forEach(p=>p.material.color.setHex(night?p.dark:p.light));floorMaterial.opacity=night?.24:.12;
  foundations.forEach((root,i)=>{formations[i].update(state.structure,time,night,renderer.getPixelRatio());root.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=state.structure>.98;});});
  people.forEach((root,i)=>{mixers[i]?.setTime(collaborationGait(i,state.walk));formations[foundations.length+i].update(state.people[i],time,night,renderer.getPixelRatio());root.traverse(o=>{if(o instanceof T.Mesh)o.castShadow=state.people[i]>.98;});});
  if(diagram){diagram.visible=state.diagram>.001;diagram.traverse(o=>{if(o instanceof T.LineSegments)(o.material as T.LineBasicMaterial).opacity=state.diagram*(night?.8:.65);});}
  if(wire){wire.visible=state.wire>.001;(wire.material as T.LineBasicMaterial).opacity=state.wire*(night?.8:.8);}
  sampleFormation?.update(state.surface,time,night,renderer.getPixelRatio());reflection?.update(state.surface*.75);
  if(sweep){sweep.position.x=-.4+2*state.scan;sweep.intensity=Math.sin(state.scan*Math.PI)*4;sweep.lookAt(.58,1.7,.28);}
  if(scan){scan.visible=time>8.1&&time<9.7;scan.position.x=-.25+1.65*state.scan;(scan.material as T.MeshBasicMaterial).opacity=Math.sin(state.scan*Math.PI)*.75;}
  renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);host.dataset.phase=state.phase;host.dataset.figureProgress=state.people.join(',');host.dataset.formingFigures=String(state.people.filter(p=>p>0&&p<1).length);host.dataset.walkProgress=state.walk.toFixed(3);canvas.dataset.theme=night?'dark':'light';
  if(capture){const bound=new T.Box3();const projected=[];for(const root of [...foundations,...people,...sample?[sample]:[]]){bound.setFromObject(root);for(let i=0;i<8;i++)projected.push(new T.Vector3(i&1?bound.max.x:bound.min.x,i&2?bound.max.y:bound.min.y,i&4?bound.max.z:bound.min.z).project(camera));}host.dataset.essentialBounds=JSON.stringify({left:Math.min(...projected.map(p=>p.x)),right:Math.max(...projected.map(p=>p.x)),top:Math.max(...projected.map(p=>p.y)),bottom:Math.min(...projected.map(p=>p.y))});}
 }
 function size(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);const aspect=r.width/r.height,h=Math.max(kind==='about'?5.6:5.3,(kind==='about'?7.4:5.8)/aspect);camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();draw();}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;quality.reset();host.dataset.running='false';}
 function schedule(){if(!disposed&&!lost&&!prefersStaticScene()&&!paused&&!frozen&&visible&&!document.hidden&&!frame&&time<12&&host.dataset.sceneState==='live'){host.dataset.running='true';frame=requestAnimationFrame(tick);}}
 function tick(now:number){frame=0;if(disposed||lost||!visible||document.hidden||paused||frozen)return;time=Math.min(12,time+(last?Math.min(.08,(now-last)/1000):0));last=now;if(quality.sample(now)){renderer.setPixelRatio(quality.ratio);size();}draw();if(time<12)frame=requestAnimationFrame(tick);else{stop();onMode('settled');}}
 const sizing=new ResizeObserver(size),themes=new MutationObserver(draw),view=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)schedule();else stop();},{threshold:.1});
 const visibility=()=>document.hidden?stop():schedule(),contextLost=(e:Event)=>{e.preventDefault();lost=true;stop();handoff.fallback();onMode('static');},restore=()=>{lost=false;size();void handoff.reveal().then(()=>{if(!disposed){onMode(time===12?'settled':paused?'paused':'playing');schedule();}});};
 const controller:CollaborationController={toggle(){if(time===12)return;paused=!paused;if(paused)stop();else{frozen=false;schedule();}onMode(paused?'paused':'playing');},replay(){stop();time=0;paused=frozen=false;draw();onMode('playing');schedule();},seek(value){stop();time=Number.isFinite(value)?T.MathUtils.clamp(value,0,12):0;paused=frozen=true;draw();onMode(time===12?'settled':'paused');},dispose(){if(disposed)return;disposed=true;stop();handoff.dispose();sizing.disconnect();themes.disconnect();view.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',restore);signal.removeEventListener('abort',controller.dispose);mixers.forEach(m=>{m.stopAllAction();m.uncacheRoot(m.getRoot());});const skeletons=new Set<T.Skeleton>();people.forEach(root=>root.traverse(o=>{if(o instanceof T.SkinnedMesh)skeletons.add(o.skeleton);}));skeletons.forEach(s=>s.dispose());formations.forEach(f=>f.dispose());sampleFormation?.dispose();reflection?.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());key.shadow.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
 teardown=controller.dispose;
 signal.addEventListener('abort',controller.dispose,{once:true});if(signal.aborted){controller.dispose();return controller;}
 sizing.observe(host);themes.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});view.observe(host);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',restore);
 size();for(const root of [...foundations,...people,...sample?[sample]:[]])root.visible=true;formations.forEach(f=>f.points.visible=true);if(sampleFormation)sampleFormation.points.visible=true;await renderer.compileAsync(scene,camera);if(disposed)return controller;draw();await handoff.reveal();if(!disposed){onMode(time===12?'settled':frozen?'paused':'playing');schedule();}return controller;
 }catch(error){if(teardown)teardown();else{handoff.dispose();formations.forEach(f=>f.dispose());sampleFormation?.dispose();reflection?.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());key.shadow.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();}throw error;}
}
