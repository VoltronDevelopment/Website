import {sceneOpeningTime} from '@/lib/scene-continuity';
import {createPhilosophyWave} from '../home/philosophy-wave';
import sculptureManifest from "../../public/sculptures/manifest.json";
import {observeArtworkTuning} from "./artwork-tuning";
import {createRenderQuality} from "../performance/scene-policy";
import {createSceneHandoff} from "../performance/scene-handoff";
import * as THREE from "three";
import {addPhilosophyLighting,createPhilosophyCubes} from "../home/philosophy-cubes";
import {philosophyCamera,philosophyDimensions} from "../home/philosophy-cube-timeline";
import {createArtworkEnvironment,addArtworkSoftboxes} from "./artwork-studio";
import {loadSculptureAsset,createSculptureSurface} from "./sculpture-surface";
import {cultureParticleCubePosition,cultureCorePosition,cultureHead,handSceneDuration,handSceneState,type HandSceneKind} from "./hand-scene-timeline";
export type HandSceneController={pause():void;replay():void;scrub(time:number):void;dispose():void};
export type HandSceneMode="static"|"playing"|"paused"|"settled";
export async function mountHandScene(canvas:HTMLCanvasElement,host:HTMLDivElement,kind:HandSceneKind,onMode:(mode:HandSceneMode)=>void):Promise<HandSceneController>{
 const handoff=createSceneHandoff(host,canvas),culture=kind==='culture';
 const first=await loadSculptureAsset(culture?'head':'dosti');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const quality=createRenderQuality(canvas,1.5);renderer.setPixelRatio(quality.ratio);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,50),environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addPhilosophyLighting(scene);addArtworkSoftboxes(scene);
 const key=scene.children.find(o=>o instanceof THREE.DirectionalLight) as THREE.DirectionalLight;key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:25});key.shadow.bias=-.0004;key.shadow.normalBias=.015;
 const right=new THREE.Vector3(7,0,-6).normalize(),normal=new THREE.Vector3(6,0,7).normalize(),basis=new THREE.Matrix4().makeBasis(right,new THREE.Vector3(0,1,0),normal);
 const board=(r:number,y:number,d=0)=>right.clone().multiplyScalar(r).add(new THREE.Vector3(0,y,0)).addScaledVector(normal,d);
 const target=new THREE.Vector3(0,culture?-.40:1.15,0).addScaledVector(right,0),offset=new THREE.Vector3(...philosophyCamera.position).sub(new THREE.Vector3(...philosophyCamera.target));
 if(culture)offset.set(6,2.2,7);
 const query=new URLSearchParams(location.search),angle=query.get('hand-angle');if(angle==='side')offset.set(8,1,0);if(angle==='top')offset.set(0,8,.01);if(angle==='front')offset.set(0,.5,8);
 camera.position.copy(target).add(offset);camera.lookAt(target);camera.updateMatrixWorld();
 const solidReview=query.get('hand-view')==='solid',mobile=matchMedia('(max-width:767px)').matches;
 const main=createSculptureSurface(first,culture?'head':'dosti',mobile,solidReview),sculptures=[main];
 sculptures.forEach(s=>scene.add(s.group));main.group.quaternion.setFromRotationMatrix(basis);
 if(culture){main.group.scale.setScalar(cultureHead.scale);main.group.position.copy(board(cultureHead.r,cultureHead.y,cultureHead.d));main.group.rotateY(cultureHead.yaw);}else{
  const reference=sculptureManifest.assets.dosti.referenceView,sourceDirection=new THREE.Vector3(...reference.direction as [number,number,number]),sourceUp=new THREE.Vector3(...reference.up as [number,number,number]);
  const sourceRight=new THREE.Vector3().crossVectors(sourceUp,sourceDirection).normalize();sourceUp.crossVectors(sourceDirection,sourceRight).normalize();
  const cameraRight=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),cameraUp=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1),cameraDirection=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,2);
  main.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(cameraRight,cameraUp,cameraDirection).multiply(new THREE.Matrix4().makeBasis(sourceRight,sourceUp,sourceDirection).invert()));
  main.group.scale.setScalar(4.5);main.group.position.copy(board(0,3.0,0));
 }
 const receiver=createPhilosophyCubes();receiver.root.position.y=culture?.7:-.65;scene.add(receiver.root);receiver.groups[2].traverse(o=>{if(o instanceof THREE.Mesh)o.castShadow=true;});
 const carrier=culture?createPhilosophyCubes():null;if(carrier)scene.add(carrier.root);
 const overhead=culture?createPhilosophyWave(receiver.groups[2],{direction:new THREE.Vector3(0,-1,.08),reach:.9}):null;if(overhead)receiver.root.add(overhead.points);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const context=shadowCanvas.getContext('2d')!;const gradient=context.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(15,39,62,.22)');gradient.addColorStop(1,'rgba(15,39,62,0)');context.fillStyle=gradient;context.fillRect(0,0,64,64);const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
 const shadows=(culture?[board(cultureHead.r,cultureHead.y-.015,cultureHead.d)]:[board(0,-1.715,0)]).map(position=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.6),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:0}));mesh.rotation.x=-Math.PI/2;mesh.position.copy(position);scene.add(mesh);return mesh;});
 let time=sceneOpeningTime[kind] as number,paused=false,frozen=false,visible=false,disposed=false,frame=0,last=0,contextLost=false;
 const review=query.get('hand-time');if(review!==null&&Number.isFinite(Number(review))){time=THREE.MathUtils.clamp(Number(review),0,handSceneDuration[kind]);frozen=true;}if(solidReview&&review===null){time=handSceneDuration[kind];frozen=true;}
 const dark=()=>document.documentElement.dataset.theme==='dark';
 function draw(){if(disposed||contextLost)return;const state=handSceneState(kind,time),isDark=dark();
  main.update(time,culture?state.head:state.grip,isDark,renderer.getPixelRatio());
  receiver.apply({outer:state.outer,core:culture?0:state.core,individual:culture?state.smallFormation:state.individual,height:state.height});
  shadows.forEach((s,i)=>{s.material.opacity=(isDark?.6:1)*(i?state.head:state.outer);});
  if(culture&&carrier){
   const core=cultureCorePosition(state.emerge,state.transfer);carrier.root.position.copy(board(core[0],core[1],core[2]));
   carrier.apply({outer:0,core:state.emerge,individual:0,height:0,merge:state.merge});
   const individual=receiver.groups[2],position=cultureParticleCubePosition(state.smallDescent);individual.position.copy(board(...position)).sub(receiver.root.position);individual.quaternion.identity();
   individual.traverse(o=>{if(o instanceof THREE.LineSegments)o.visible=state.smallFormation>=1;});
   overhead!.update(time,state.smallFormation,individual.position.y,isDark,renderer.getPixelRatio());overhead!.points.visible=state.smallFormation>0&&state.smallFormation<1;
   host.dataset.mediumOrigin='head';host.dataset.smallOrigin='overhead-particles';host.dataset.outerMeaning='voltron';host.dataset.armPresent='false';
   host.dataset.smallFormation=state.smallFormation.toFixed(3);host.dataset.smallDescent=state.smallDescent.toFixed(3);
   host.dataset.phase=state.done?'settled':time<3.25?'head-and-voltron':time<4.7?'head-contribution':time<6.7?'core-transfer':time<7?'holding':time<8.8?'particle-cube-formation':time<9.3?'particle-cube-hold':time<12.2?'particle-cube-descent':'contribution-merge';
   host.dataset.cubePosition=individual.getWorldPosition(new THREE.Vector3()).toArray().map(v=>v.toFixed(4)).join(',');
  }else{main.group.position.copy(board(0,3.0+Math.sin(state.settle*Math.PI)*.025,0));host.dataset.phase=state.done?'settled':time<3.5?'forming':time<7.5?'foundation':'holding';}
  renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.theme=isDark?'dark':'light';
 }
 function theme(){receiver.setTheme(dark());carrier?.setTheme(dark());draw();}
 function size(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height,extent=Math.max(culture?7.6:7.2,(culture?5.4:5.8)/aspect);camera.left=-extent*aspect/2;camera.right=extent*aspect/2;camera.top=extent/2;camera.bottom=-extent/2;camera.updateProjectionMatrix();draw();}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;host.dataset.running="false";}
 function tick(now:number){frame=0;if(quality.sample(now)){renderer.setPixelRatio(quality.ratio);size();}if(disposed||paused||frozen||!visible||document.hidden||contextLost)return;time=Math.min(handSceneDuration[kind],time+(last?(now-last)/1000:0));last=now;draw();if(time<handSceneDuration[kind])frame=requestAnimationFrame(tick);else{stop();onMode("settled");}}
 function schedule(){if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&host.dataset.sceneState==="live"&&!disposed&&!paused&&!frozen&&visible&&!document.hidden&&!contextLost&&!frame&&time<handSceneDuration[kind]){last=0;host.dataset.running="true";frame=requestAnimationFrame(tick);}}
 function visibility(){if(document.hidden)stop();else schedule();}
 function lost(event:Event){event.preventDefault();contextLost=true;stop();handoff.fallback();host.dataset.fallback="true";host.dataset.live="false";onMode("static");}
 function restored(){contextLost=false;delete host.dataset.fallback;theme();size();void handoff.reveal().then(()=>{if(disposed)return;host.dataset.live="true";onMode(time===handSceneDuration[kind]?"settled":paused?"paused":"playing");schedule();});}
 const studio=observeArtworkTuning(kind,value=>{key.position.x=-4+Math.sin(value.keyDirection)*5;sculptures.forEach(s=>s.tune(value));draw();});
 const resize=new ResizeObserver(size),themes=new MutationObserver(theme),view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else stop();},{threshold:.1});resize.observe(host);themes.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});view.observe(host);
 document.addEventListener("visibilitychange",visibility);canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restored);theme();size();await handoff.reveal();host.dataset.live="true";onMode(frozen?"settled":"playing");schedule();
 return {pause(){paused=!paused;onMode(paused?"paused":"playing");if(paused)stop();else schedule();},replay(){time=0;frozen=false;paused=false;draw();onMode("playing");schedule();},scrub(seconds){stop();time=THREE.MathUtils.clamp(Number.isFinite(seconds)?seconds:0,0,handSceneDuration[kind]);frozen=true;draw();onMode("settled");},dispose(){disposed=true;studio.dispose();handoff.dispose();stop();resize.disconnect();themes.disconnect();view.disconnect();document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restored);host.dataset.live="false";const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)geometries.add(m.geometry);if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(a=>materials.add(a));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());receiver.dispose();carrier?.dispose();sculptures.forEach(s=>s.dispose());environment.dispose();shadowTexture.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
