import {createSceneHandoff} from "../performance/scene-handoff";
import {loadSculptureAsset,createSculptureSurface} from "./sculpture-surface";
import {sceneOpeningTime} from "@/lib/scene-continuity";
import * as THREE from "three";
import { glassFace, setGlass, stroke, strokeMaterial, type GlassFace } from "../home/lattice-materials";
import { intelligenceHeroDuration, intelligenceHeroState } from "./intelligence-hero-timeline";
import {addArtworkSoftboxes,createArtworkEnvironment,edgePrism} from "./artwork-studio";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {observeArtworkTuning,artworkDefaults} from './artwork-tuning';
import {createPortraitScans} from './portrait-scans';
export type IntelligenceHeroController = { toggle(): void; replay(): void; scrub(seconds:number): void; dispose(): void };
type Mode = "static" | "playing" | "paused" | "settled";

export async function mountIntelligenceHero(canvas: HTMLCanvasElement, host: HTMLDivElement, onMode: (mode: Mode) => void): Promise<IntelligenceHeroController> {
  const handoff=createSceneHandoff(host,canvas);
  const asset=await loadSculptureAsset('planes');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true, powerPreference:"low-power" });
  renderer.setClearColor(0,0); renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;
  addArtworkSoftboxes(scene);
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const sculpture=new THREE.Group();sculpture.scale.setScalar(1.15);sculpture.position.y=.06;sculpture.rotation.y=.22;scene.add(sculpture);
  const camera = new THREE.OrthographicCamera(-3.2,3.2,2.4,-2.4,.1,50);
  camera.position.set(12,4.55,12); camera.lookAt(0,0,0);
  const cube = new THREE.Group(); scene.add(cube);
  const scans=createPortraitScans();scene.add(scans.group);host.dataset.networkNodes='0';
  const faces: { material:THREE.MeshPhysicalMaterial; kind:GlassFace }[] = [];
  const planes: [GlassFace,number[],number[]][] = [["front",[0,0,1.6],[0,0,0]],["rear",[0,0,-1.6],[0,Math.PI,0]],["side",[1.6,0,0],[0,Math.PI/2,0]],["side",[-1.6,0,0],[0,-Math.PI/2,0]],["top",[0,1.6,0],[-Math.PI/2,0,0]],["bottom",[0,-1.6,0],[Math.PI/2,0,0]]];
  planes.forEach(([kind,position,rotation])=>{
    const material = glassFace(kind,false,true,"portrait"); faces.push({material,kind});
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),material); mesh.position.fromArray(position); mesh.rotation.set(rotation[0],rotation[1],rotation[2]); mesh.renderOrder=3; cube.add(mesh);
  });
  scene.add(new THREE.HemisphereLight(0xf0f8ff,0x54718b,2));
  const light = new THREE.DirectionalLight(0xffffff,2); light.position.set(-3,6,5); scene.add(light);
  const box = new THREE.BoxGeometry(3.2,3.2,3.2), edges = new THREE.EdgesGeometry(box);
  const edgePositions = edges.getAttribute("position");
  const points = Array.from({length:edgePositions.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(edgePositions,i));
  const edgeMat = strokeMaterial(true); edgeMat.userData.cssWidth = 1; edgeMat.opacity = .28;
  cube.add(stroke(points,edgeMat));
  const rimPieces=[];for(let i=0;i<points.length;i+=2)rimPieces.push(edgePrism(points[i],points[i+1],.005));
  const rimGeometry=mergeGeometries(rimPieces)!;rimPieces.forEach(piece=>piece.dispose());
  const rimMaterial=new THREE.MeshPhysicalMaterial({color:0x8bbce0,metalness:.45,roughness:.15,envMapIntensity:1.2,transparent:true,opacity:.45});
  cube.add(new THREE.Mesh(rimGeometry,rimMaterial));
  const lowerMat=strokeMaterial(true);lowerMat.userData.cssWidth=1.1;lowerMat.opacity=.65;
  cube.add(stroke([new THREE.Vector3(-1.6,-1.6,1.6),new THREE.Vector3(1.6,-1.6,1.6),new THREE.Vector3(1.6,-1.6,1.6),new THREE.Vector3(1.6,-1.6,-1.6)],lowerMat)); box.dispose(); edges.dispose();
  const query=new URLSearchParams(location.search),review=query.get("intelligence-time"),reviewView=query.get("intelligence-view"),mobile=matchMedia("(max-width:767px)").matches;
  const figure=createSculptureSurface(asset,'planes',mobile,reviewView==='solid',mobile?3:2);figure.group.scale.setScalar(2.5);figure.group.position.y=-1.25;figure.group.rotation.y=1.05;sculpture.add(figure.group);
  let disposed=false, frame=0, visible=false, paused=false, time=sceneOpeningTime.intelligence as number,last=0;
  let frozen:number|null=null,tuning={...artworkDefaults};
  if(reviewView&&review===null){frozen=intelligenceHeroDuration;time=frozen;}
  if(review!==null&&Number.isFinite(Number(review))) { frozen=Math.max(0,Math.min(intelligenceHeroDuration,Number(review)));time=frozen; }
  function draw(){
    if(disposed)return;
    const state=intelligenceHeroState(time);
    const dark=document.documentElement.dataset.theme==='dark';
    const diagnostic=reviewView==='solid'||reviewView==='particles';
    figure.update(time,reviewView==='particles'?Math.min(.88,state.formation):state.formation,document.documentElement.dataset.theme==='dark',renderer.getPixelRatio());
    figure.mesh.visible=reviewView!=='particles';cube.visible=!diagnostic;
    scans.update(time,dark);scans.group.visible=!diagnostic;
    canvas.dataset.scanHorizontal=state.scans.horizontal.strength.toFixed(4);canvas.dataset.scanVertical=state.scans.vertical.strength.toFixed(4);canvas.dataset.formationParticles=String(figure.particleCount);
    edgeMat.opacity=state.enclosure*.20*tuning.outline;lowerMat.opacity=state.enclosure*(.42+state.response*.3*tuning.glow)*tuning.outline;
    rimMaterial.opacity=state.enclosure*.4;
    faces.forEach(({material})=>{material.opacity=(material.userData.restOpacity as number)*(state.enclosure+state.response*.4);});
    host.parentElement?.style.setProperty("--scene-response",String(state.response));
    host.dataset.phase=state.settled?"formed":time<1.5?"waves":time<3.8?"forming":time<4.5?"holding":time<5.9?"horizontal-scan":"vertical-scan";
    renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.theme=document.documentElement.dataset.theme||"light";
  }
  function tick(now:number){frame=0;if(disposed||!visible||document.hidden||paused||frozen!==null)return;
    const delta=last?(now-last)/1000:0;last=now;
    time=Math.min(intelligenceHeroDuration,time+delta);draw();
    if(time<intelligenceHeroDuration)frame=requestAnimationFrame(tick);else {last=0;host.dataset.running="false";onMode("settled");}
  }
  function schedule(){last=0;if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&host.dataset.sceneState==="live"&&!disposed&&visible&&!document.hidden&&!paused&&frozen===null&&!frame&&(time<intelligenceHeroDuration)){host.dataset.running='true';frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;host.dataset.running='false';}
  function size(){const {width,height}=host.getBoundingClientRect(); if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const half=aspect<1?2.55/aspect:2.55;camera.top=half;camera.bottom=-half;camera.left=-half*aspect;camera.right=half*aspect;camera.updateProjectionMatrix();draw();}
  function theme(){const dark=document.documentElement.dataset.theme==="dark";faces.forEach(({material,kind})=>{setGlass(material,kind,dark);material.opacity*=tuning.glassOpacity;material.roughness*=tuning.roughness;material.envMapIntensity*=tuning.reflection;material.userData.restOpacity=material.opacity;});edgeMat.color.setHex(dark?0x78b0ff:0x246bd4);lowerMat.color.setHex(dark?0xb0def4:0x307ca6);draw();}
  function visibility(){if(document.hidden)stop();else schedule();}
  function lost(event:Event){event.preventDefault();stop();handoff.fallback();host.dataset.live="false";onMode("static");}
  function restored(){theme();size();void handoff.reveal().then(()=>{if(disposed)return;host.dataset.live="true";onMode(time>=intelligenceHeroDuration?"settled":paused?"paused":"playing");schedule();});}
  const resize=new ResizeObserver(size);resize.observe(host);
  const themes=new MutationObserver(theme);themes.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.25;if(visible)schedule();else stop();},{threshold:[0,.25]});view.observe(host);
  const studio=observeArtworkTuning('intelligence',value=>{tuning=value;figure.tune(value);theme();});
  document.addEventListener("visibilitychange",visibility);canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restored);
  theme();size();await handoff.reveal();if(disposed)return {toggle(){},replay(){},scrub(){},dispose(){}};host.dataset.live="true";onMode(frozen!==null?"settled":"playing");schedule();
  return {scrub(seconds){stop();frozen=THREE.MathUtils.clamp(Number.isFinite(seconds)?seconds:0,0,intelligenceHeroDuration);time=frozen;draw();onMode("settled");},replay(){time=0;frozen=null;paused=false;onMode("playing");draw();schedule();},toggle(){if(time>=intelligenceHeroDuration||frozen!==null){time=0;frozen=null;paused=false;}else paused=!paused;onMode(paused?"paused":"playing");if(paused)stop();else schedule();},
    dispose(){disposed=true;studio.dispose();handoff.dispose();stop();resize.disconnect();themes.disconnect();view.disconnect();document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restored);host.dataset.live="false";
      scene.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(item=>item.dispose());}});figure.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();} };
}
