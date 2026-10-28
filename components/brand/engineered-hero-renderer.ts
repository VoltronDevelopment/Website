import {particleWaveGLSL} from './particle-wave';
import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {addArtworkSoftboxes,createArtworkEnvironment,createFloorEcho,edgePrism} from "./artwork-studio";
import {MeshSurfaceSampler} from "three/addons/math/MeshSurfaceSampler.js";
import {glassFace,setGlass,stroke,strokeMaterial,type GlassFace} from "../home/lattice-materials";
import {createSceneHandoff} from "../performance/scene-handoff";
import {createRenderQuality} from "../performance/scene-policy";
import {ease,heroSceneDurations,heroSceneState,manufacturingSurfaceState,type HeroSceneKind} from "./hero-scene-timeline";
import {createQualityScan} from './quality-scan';
import {createArtworkRoute} from './artwork-route';
import {observeArtworkTuning,artworkDefaults} from './artwork-tuning';

export type SceneMode="static"|"playing"|"paused"|"settled";
export type EngineeredController={toggle():void;replay():void;seek(seconds:number):void;dispose():void};
type Arrival={group:THREE.Group;position:THREE.Vector3;index:number};
type ThemeMaterial={material:THREE.MeshStandardMaterial;light:number;dark:number};
const random=(i:number)=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};

/** Procedural authoring stand-ins are isolated here so approved GLBs can replace them later. */
export async function mountEngineeredHero(canvas:HTMLCanvasElement,host:HTMLDivElement,kind:HeroSceneKind,onMode:(mode:SceneMode)=>void,signal:AbortSignal):Promise<EngineeredController>{
 if(kind==="technology")return (await import("./neural-network-renderer")).mountNeuralNetwork(canvas,host,onMode,signal);
 if(kind==="ontology")return (await import("./ontology-puzzle-renderer")).mountOntologyPuzzle(canvas,host,onMode,signal);
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power",preserveDrawingBuffer:new URLSearchParams(location.search).has("scene-capture")});
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const quality=createRenderQuality(canvas,1.5);renderer.setPixelRatio(quality.ratio);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,80);
 const target=new THREE.Vector3(kind==="network"?.3:0,kind==="manufacturing"?.8:kind==="network"?-.15:.4,kind==="network"?-.6:0);
 camera.position.copy(target).add(new THREE.Vector3(kind==="manufacturing"?6:8,kind==="network"?6:4.7,11));camera.lookAt(target);
 const resources=new Set<{dispose():void}>(),track=<T extends {dispose():void}>(resource:T):T=>{resources.add(resource);return resource;};
 const environment=track(createArtworkEnvironment(renderer));scene.environment=environment.texture;
 const hemi=new THREE.HemisphereLight(0xeaf5ff,0x264058,.9),key=new THREE.DirectionalLight(0xffffff,3.2),rim=new THREE.DirectionalLight(0x78c9ff,1.4);key.position.set(-4,8,7);rim.position.set(5,4,-5);scene.add(hemi,key,rim);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;key.castShadow=true;
 key.shadow.mapSize.set(512,512);key.shadow.radius=4;key.shadow.camera.left=key.shadow.camera.bottom=-6;key.shadow.camera.right=key.shadow.camera.top=6;key.shadow.normalBias=.025;key.shadow.bias=-.0002;
 track(key.shadow);
 addArtworkSoftboxes(scene,target);
 const panes:{material:THREE.MeshPhysicalMaterial;kind:GlassFace}[]=[],palette:ThemeMaterial[]=[],arrivals:Arrival[]=[],routes:ReturnType<typeof createArtworkRoute>[]=[],junctions:THREE.Mesh[]=[];
 let tuning={...artworkDefaults};
 const outlines:ReturnType<typeof strokeMaterial>[]=[];
 const dark=()=>document.documentElement.dataset.theme==="dark";
 function standard(light:number,night=light,metalness=.15,roughness=.35){const material=track(new THREE.MeshStandardMaterial({color:light,metalness,roughness}));palette.push({material,light,dark:night});return material;}
 const metal=standard(0xb8c5cf,0x8ba5b9,.95,.22),navy=standard(0x19364e,0x153951,.45,.32),white=standard(0xe4edf2,0x7d9bad,.2,.4),blue=standard(0x246bd4,0x48bce6,.45,.28);
 const glassEdge=standard(0x8cbbdf,0x70a8ce,.55,.12),visualRoots:THREE.Object3D[]=[];
 function mesh(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Object3D,position:number[]=[0,0,0]){const item=new THREE.Mesh(track(geometry),material);item.position.fromArray(position);parent.add(item);return item;}
 function box(parent:THREE.Object3D,size:number[],position:number[],mat:THREE.Material=white){const radius=Math.min(.025,...size.map(v=>v*.18));return mesh(new RoundedBoxGeometry(...size as [number,number,number],2,radius),mat,parent,position);}
 function line(parent:THREE.Object3D,points:THREE.Vector3[],front=true){const material=track(strokeMaterial(front)),object=stroke(points,material);outlines.push(material);track(object.geometry);parent.add(object);return object;}
 function cell(size:number,position:number[],index:number,frameOnly=false){
  const group=new THREE.Group();group.position.fromArray(position);scene.add(group);arrivals.push({group,position:group.position.clone(),index});
  visualRoots.push(group);
  if(!frameOnly){const faces:[GlassFace,number[],number[]][]=[["front",[0,0,size/2],[0,0,0]],["rear",[0,0,-size/2],[0,Math.PI,0]],["side",[size/2,0,0],[0,Math.PI/2,0]],["side",[-size/2,0,0],[0,-Math.PI/2,0]],["top",[0,size/2,0],[-Math.PI/2,0,0]],["bottom",[0,-size/2,0],[Math.PI/2,0,0]]];
   for(const [face,p,r] of faces){const material=track(glassFace(face,false,true,"display",face==="front"?"clear":face==="top"?"crown":p[0]<0||face==="rear"?"recess":"near"));panes.push({material,kind:face});const pane=mesh(new THREE.PlaneGeometry(size,size),material,group,p);pane.rotation.set(r[0],r[1],r[2]);}
  }
  const corners=Array.from({length:8},(_,i)=>new THREE.Vector3((i&1?1:-1)*size/2,(i&2?1:-1)*size/2,(i&4?1:-1)*size/2));
  const pairs=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  if(!frameOnly){const rails=pairs.map(([a,b])=>edgePrism(corners[a],corners[b],.009));const geometry=mergeGeometries(rails)!;rails.forEach(rail=>rail.dispose());mesh(geometry,glassEdge,group);}
  for(const front of [false,true]){const segments=pairs.filter(([a,b])=>(corners[a].clone().add(corners[b]).dot(camera.position)>0)===front).flatMap(([a,b])=>[corners[a],corners[b]]);const edge=line(group,segments,front);edge.material.opacity*=frameOnly?.45:.4;}
  const glint=line(group,[corners[6],corners[7],corners[7],corners[5]]);glint.material.color.setHex(0xe6f5ff);glint.material.userData.cssWidth=.75;glint.material.opacity=frameOnly?.12:.55;
  for(const point of corners){const node=mesh(new THREE.BoxGeometry(.065,.065,.065),blue,group,point.toArray());junctions.push(node);}
  return group;
 }
 function route(points:number[][]){const curve:THREE.Vector3[]=[];for(let i=1;i<points.length;i++){const a=new THREE.Vector3(...points[i-1]),b=new THREE.Vector3(...points[i]);for(let k=0;k<20;k++)curve.push(a.clone().lerp(b,k/20));}curve.push(new THREE.Vector3(...points.at(-1)!));
  routes.push(createArtworkRoute(scene,curve,track));
  for(const p of points.slice(1,-1))junctions.push(mesh(new THREE.BoxGeometry(.085,.085,.085),blue,scene,p));
 }
 function plate(parent:THREE.Object3D,width:number,depth:number,y:number){return box(parent,[width,.09,depth],[0,y,0],metal);}
 function ring(parent:THREE.Object3D,outer:number,inner:number,depth:number,position:number[],horizontal=false){const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);const object=mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:40}),metal,parent,position);if(horizontal)object.rotation.x=-Math.PI/2;return object;}
 function part(parent:THREE.Object3D){ring(parent,.55,.27,.15,[0,-.42,0],true);ring(parent,.32,.23,.55,[0,-.4,0],true);for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh(new THREE.CylinderGeometry(.047,.047,.02,12),navy,parent,[Math.cos(a)*.43,-.235,Math.sin(a)*.43]);}}
 function equipment(parent:THREE.Object3D){
  plate(parent,1.05,.8,-.5);box(parent,[1,.15,.78],[0,-.36,0],navy);
  box(parent,[.18,.76,.7],[-.43,.01,0]);box(parent,[.18,.76,.7],[.43,.01,0]);box(parent,[1,.13,.75],[0,.43,0]);
  box(parent,[.68,.62,.08],[0,.06,-.31],navy);box(parent,[.64,.08,.48],[0,-.22,.04],metal);
  for(let i=0;i<5;i++)box(parent,[.025,.012,.43],[-.23+i*.115,-.173,.04],navy);
  box(parent,[.17,.22,.16],[0,.28,-.1],metal);mesh(new THREE.CylinderGeometry(.048,.08,.22,20),metal,parent,[0,.08,-.04]);
  box(parent,[.23,.34,.065],[.54,.12,.36],navy);box(parent,[.16,.14,.02],[.54,.18,.402],blue);
  for(let i=0;i<3;i++)box(parent,[.025,.025,.012],[.49+i*.05,.055,.405],metal);
  box(parent,[.024,.28,.025],[.3,.08,.39],metal);
 }
 function lot(parent:THREE.Object3D){plate(parent,1.1,.9,-.5);for(let i=0;i<6;i++)ring(parent,.14,.075,.32,[(i%3-1)*.32,-.4,Math.floor(i/3)*.36-.18],true);}
 function record(parent:THREE.Object3D,telemetry=false){box(parent,[1,.94,.055],[0,0,0],white);if(telemetry){const points=Array.from({length:70},(_,i)=>new THREE.Vector3(-.44+i*.013,.23*Math.sin(i*.13),.04));line(parent,points.slice(1).flatMap((point,i)=>[points[i],point]));}
  else for(let row=0;row<3;row++){const y=.27-row*.25;line(parent,[new THREE.Vector3(-.12,y,.04),new THREE.Vector3(.36,y,.04)]);line(parent,[new THREE.Vector3(-.35,y,.04),new THREE.Vector3(-.29,y-.05,.04),new THREE.Vector3(-.29,y-.05,.04),new THREE.Vector3(-.2,y+.07,.04)]);}}
 function factory(parent:THREE.Object3D,scale=1){
  const building=new THREE.Group();building.scale.setScalar(scale);parent.add(building);
  box(building,[1.42,.08,1.05],[0,.04,0],metal);box(building,[1.34,.64,.94],[0,.39,0]);
  const glazing=standard(0x52748d,0x34546f,.6,.16);
  box(building,[1.26,.42,.028],[0,.36,.485],glazing);box(building,[.028,.42,.82],[.685,.36,0],glazing);
  // Three pitched roof bays, with raised ridge and fascia depth.
  for(let i=0;i<3;i++)for(const side of [-1,1]){
    const roof=box(building,[.254,.045,1.06],[-.47+i*.47+side*.116,.78,0],navy);roof.rotation.z=-side*.25;
  }
  for(let i=0;i<8;i++)box(building,[.014,.45,.04],[-.625+i*.178,.36,.505],metal);
  box(building,[1.29,.018,.04],[0,.37,.505],metal);
  for(let i=0;i<5;i++)box(building,[.04,.45,.014],[.705,.36,-.39+i*.195],metal);
  box(building,[.2,.4,.04],[.43,.28,.53],navy);box(building,[.016,.09,.025],[.49,.31,.56],metal);
  box(building,[.34,.035,.2],[.43,.54,.59],metal);
  box(building,[1.25,.035,.026],[0,.13,.515],blue);
  return building;
 }
 function site(size:number,position:number[],index:number){
  const group=new THREE.Group();group.position.fromArray(position);scene.add(group);visualRoots.push(group);arrivals.push({group,position:group.position.clone(),index});
  const glass=track(glassFace("side",false,true));panes.push({material:glass,kind:"side"});box(group,[size,.14,size*.78],[0,0,0],glass);
  const corners=Array.from({length:4},(_,i)=>new THREE.Vector3((i&1?1:-1)*size/2,.075,(i&2?1:-1)*size*.39));
  const pieces=[[0,1],[1,3],[3,2],[2,0]].map(([a,b])=>edgePrism(corners[a],corners[b],.012));const rails=mergeGeometries(pieces)!;pieces.forEach(piece=>piece.dispose());mesh(rails,glassEdge,group);
  line(group,[corners[0],corners[1],corners[1],corners[3],corners[3],corners[2],corners[2],corners[0]]);
  corners.forEach(p=>junctions.push(box(group,[.055,.055,.055],p.toArray(),blue)));
  return group;
 }

 let surfaceParticles:THREE.Points<THREE.BufferGeometry,THREE.ShaderMaterial>|undefined;
 let distantPoints:THREE.Points<THREE.BufferGeometry,THREE.PointsMaterial>|undefined;
 const boundary={value:-3.5},response={value:0},formation={value:0};
 let scanner:ReturnType<typeof createQualityScan>|undefined;
 if(kind==="network"){
  const sites:[[number,number,number],number][]=[[[0,-1.32,1.6],3.3],[[-2.2,-1.32,-.65],1.85],[[2.15,-1.32,-1],1.85],[[0,-1.32,-3.2],1.55]];
  sites.forEach(([p,size],i)=>{const module=site(size,p,i);if(i<3){const building=factory(module,size/1.85);building.position.y=.1;}else{const foundation=box(module,[size*.78,.06,size*.55],[0,.11,0],white);foundation.material=white;}});
  route([[0,-1.23,.31],[0,-1.23,-.7],[-1.28,-1.23,-.7]]);route([[0,-1.23,-.7],[1.23,-1.23,-.7]]);route([[0,-1.23,-.7],[0,-1.23,-2.6]]);
  const sparse:number[]=[];for(let i=0;i<96;i++){const p=[(random(i+10)-.5)*.85,(random(i+20)-.5)*.85,(random(i+30)-.5)*.85];p[i%3]=(i%2?1:-1)*.425;sparse.push(p[0],p[1]+.5,p[2]-3.85);}
  const sparseGeometry=track(new THREE.BufferGeometry());sparseGeometry.setAttribute("position",new THREE.Float32BufferAttribute(sparse,3));distantPoints=new THREE.Points(sparseGeometry,track(new THREE.PointsMaterial({color:0x468ab8,size:.023,transparent:true,opacity:.5,depthWrite:false})));distantPoints.position.set(0,-1.2,.65);scene.add(distantPoints);
 }else if(kind==="ontology"){
  part(cell(1.8,[0,.2,0],0));record(cell(1.1,[-1.7,.8,.8],1));record(cell(1.1,[1.7,.8,-.7],2),true);lot(cell(1.1,[.2,-.5,1.9],3));route([[-1.7,.25,.8],[-.9,.25,.8]]);route([[.9,.25,0],[1.7,.25,0],[1.7,.25,-.7]]);route([[0,-.7,0],[0,-.7,1.9]]);
 }else if(kind==="about"){
  const positions=[[-1.55,-.1,.3],[0,.55,-.5],[1.55,-.1,.3]];
  positions.forEach((p,i)=>{const block=cell(1.45,p,i);if(i===0)part(block);else if(i===1){for(let k=0;k<3;k++)plate(block,.85,.65,-.3+k*.22);}else{const core=box(block,[.45,.45,.45],[0,0,0],navy);core.rotation.y=Math.PI/4;}});
  route([[-1.55,-.85,.3],[-1.55,-1,-.5],[0,-1,-.5],[0,-.175,-.5]]);route([[0,-1,-.5],[1.55,-1,-.5],[1.55,-.85,.3]]);
 }else{
  // Asset seam: replace this group with a prepared GLB, retaining component-local X.
  const component=new THREE.Group();scene.add(component);visualRoots.push(component);component.rotation.y=-.22;
  const finish=track(new THREE.MeshStandardMaterial({color:0xbfc8cf,metalness:.88,roughness:.3}));
  finish.onBeforeCompile=shader=>{shader.uniforms.uBoundary=boundary;shader.uniforms.uResponse=response;shader.uniforms.uFormation=formation;
   shader.vertexShader=shader.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vComponent;varying vec3 vSurfaceNormal;").replace("#include <begin_vertex>","#include <begin_vertex>\nvComponent=position;vSurfaceNormal=normal;");
   shader.fragmentShader=shader.fragmentShader.replace("#include <common>","#include <common>\nuniform float uBoundary,uResponse,uFormation;varying vec3 vComponent;varying vec3 vSurfaceNormal;").replace("#include <color_fragment>","#include <color_fragment>\nfloat grain=fract(sin(dot(floor(vComponent*85.),vec3(12.9898,78.233,37.719)))*43758.5453);float field=clamp((vComponent.x+2.1)/4.2,0.,1.)*.8+grain*.15;if(grain>smoothstep(field-.08,field+.08,uFormation))discard;float edge=vComponent.x+.09*sin(vComponent.y*4.)+.045*sin(vComponent.z*7.);float shell=1.-smoothstep(.25,.75,abs(vSurfaceNormal.y));float bore=smoothstep(.47,.58,length(vComponent.xy-vec2(0.,1.75)));float coated=(1.-smoothstep(uBoundary-.16,uBoundary+.16,edge))*shell*bore;diffuseColor.rgb=mix(vec3(.65,.71,.76),vec3(.055,.10,.15),coated);diffuseColor.rgb+=uResponse*.035;").replace("#include <roughnessmap_fragment>","#include <roughnessmap_fragment>\nroughnessFactor=mix(.19,.43,coated)+.004*sin(vComponent.x*190.);").replace("#include <emissivemap_fragment>","#include <emissivemap_fragment>\nfloat treatmentLight=exp(-pow((edge-uBoundary)/.075,2.))*step(-2.1,uBoundary)*step(uBoundary,2.1);totalEmissiveRadiance+=vec3(.035,.25,.48)*treatmentLight*shell;");};
  const base=new THREE.Shape();base.moveTo(-1.55,-.7);base.quadraticCurveTo(-2.03,-.7,-2.03,-.2);base.quadraticCurveTo(-2.03,.65,-1.45,.65);base.bezierCurveTo(-.75,.65,-.6,.28,0,.3);base.bezierCurveTo(.6,.28,.75,.65,1.45,.65);base.quadraticCurveTo(2.03,.65,2.03,-.2);base.quadraticCurveTo(2.03,-.7,1.55,-.7);base.bezierCurveTo(.65,-.7,.7,-.45,0,-.46);base.bezierCurveTo(-.7,-.45,-.65,-.7,-1.55,-.7);base.closePath();
  for(const x of [-1.45,1.45]){const hole=new THREE.Path();hole.absarc(x,0,.23,0,Math.PI*2,true);base.holes.push(hole);}
  const baseGeo=new THREE.ExtrudeGeometry(base,{depth:.22,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:3,curveSegments:40});baseGeo.rotateX(-Math.PI/2);mesh(baseGeo,finish,component);
  const upright=new THREE.Shape();upright.moveTo(-1.25,.2);upright.bezierCurveTo(-.83,.35,-.76,1.15,-.69,1.75);upright.absarc(0,1.75,.7,Math.PI,0,true);upright.bezierCurveTo(.76,1.15,.83,.35,1.25,.2);upright.closePath();const bore=new THREE.Path();bore.absarc(0,1.75,.46,0,Math.PI*2,false);upright.holes.push(bore);
  const uprightGeo=new THREE.ExtrudeGeometry(upright,{depth:.45,bevelEnabled:true,bevelSize:.065,bevelThickness:.055,bevelSegments:4,curveSegments:56});uprightGeo.translate(0,0,-.225);mesh(uprightGeo,finish,component);
  const positions:number[]=[],normals:number[]=[],seed:number[]=[];const point=new THREE.Vector3(),normal=new THREE.Vector3();let index=0;
  for(const geometry of [baseGeo,uprightGeo]){const sampler=(new MeshSurfaceSampler(new THREE.Mesh(geometry)) as MeshSurfaceSampler & {setRandomGenerator(fn:()=>number):MeshSurfaceSampler}).setRandomGenerator(()=>random(++index)).build();for(let i=0;i<(matchMedia("(max-width:767px)").matches?4500:9000);i++){sampler.sample(point,normal);positions.push(...point.addScaledVector(normal,.014).toArray());normals.push(...normal.toArray());seed.push(random(++index));}}
  const geo=track(new THREE.BufferGeometry());geo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geo.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));geo.setAttribute("aSeed",new THREE.Float32BufferAttribute(seed,1));
  const mat=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uBoundary:boundary,uFormation:formation,uRatio:{value:quality.ratio},uDark:{value:dark()?1:0}},vertexShader:`${particleWaveGLSL}
uniform float uBoundary,uRatio,uFormation;attribute float aSeed;varying float vAlpha;void main(){float edge=position.x+.09*sin(position.y*4.)+.045*sin(position.z*7.);float field=clamp((position.x+2.1)/4.2,0.,1.)*.8+aSeed*.15;float arrived=smoothstep(field-.18,field+.04,uFormation);vec3 p=latticeWave(position,arrived,aSeed,uFormation*3.,vec3(1.,.12,.1),2.3,.32);vAlpha=uFormation<.999?(1.-smoothstep(field,field+.16,uFormation)):exp(-pow((edge-uBoundary)/.18,2.));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(.9+aSeed*.8)*uRatio;}`,fragmentShader:`uniform float uDark;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.12,.4,.8),vec3(.65,.88,1.),uDark),vAlpha*(1.-smoothstep(.15,.5,r)));}`}));
  surfaceParticles=new THREE.Points(geo,mat);component.add(surfaceParticles);
  scanner=createQualityScan(1.8,3.0,track);component.add(scanner.group);scanner.group.rotation.y=Math.PI/2;scanner.group.position.y=1.05;
 }
 // A directional open ribbon; no rings, orbital motion or permanent atmospheric loop.
 const cloud:number[]=[],seeds:number[]=[];for(let i=0;i<(matchMedia("(max-width:767px)").matches?650:1800);i++){cloud.push(-3.5+random(i+1)*6,(Math.floor(random(i+2)*3)-1)*.52+(random(i+3)-.5)*.15,-1.2+(random(i+4)-.5)*1.2);seeds.push(random(i+5));}
 const waveGeo=track(new THREE.BufferGeometry());waveGeo.setAttribute("position",new THREE.Float32BufferAttribute(cloud,3));waveGeo.setAttribute("seed",new THREE.Float32BufferAttribute(seeds,1));
 const waveMat=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uAlpha:{value:0},uRatio:{value:quality.ratio},uDark:{value:0}},vertexShader:`uniform float uTime,uRatio;attribute float seed;varying float vSeed;void main(){vSeed=seed;vec3 p=position;p.x+=uTime*.28;p.y+=sin(position.x*1.7-uTime*1.4+floor(seed*3.)*.4)*.24;p.z+=sin(position.x-uTime)*.18;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(.8+seed*1.6)*uRatio;}`,fragmentShader:`uniform float uAlpha,uDark;varying float vSeed;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.12,.40,.65),vec3(.5,.78,.97),uDark),uAlpha*(.12+vSeed*.36)*(1.-smoothstep(.15,.5,r)));}`}));const waves=new THREE.Points(waveGeo,waveMat);scene.add(waves);if(kind==="manufacturing")waves.position.y=1.3;
 const shadowCanvas=document.createElement("canvas");shadowCanvas.width=shadowCanvas.height=128;const context=shadowCanvas.getContext("2d")!;const gradient=context.createRadialGradient(64,64,3,64,64,64);gradient.addColorStop(0,"rgba(15,43,65,.3)");gradient.addColorStop(.45,"rgba(26,65,90,.15)");gradient.addColorStop(1,"rgba(26,65,90,0)");context.fillStyle=gradient;context.fillRect(0,0,128,128);
 const shadowMaterial=track(new THREE.MeshBasicMaterial({map:track(new THREE.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false}));const shadow=mesh(new THREE.PlaneGeometry(kind==="network"?8:6,5),shadowMaterial,scene,[0,kind==="manufacturing"?-.03:-1.5,0]);shadow.rotation.x=-Math.PI/2;
 const floorY=kind==="manufacturing"?-.075:kind==="network"?-1.405:-1.5;
 visualRoots.forEach(root=>root.traverse(object=>{const item=object as THREE.Mesh;if(item.isMesh&&!Array.isArray(item.material)&&!(item as THREE.Mesh&{isLine2?:boolean}).isLine2)item.castShadow=!item.material.transparent&&item.material!==glassEdge&&item.material!==blue;}));
 const catcherMaterial=track(new THREE.ShadowMaterial({color:0x142d43,opacity:.22,depthWrite:false}));const catcher=mesh(new THREE.PlaneGeometry(16,16),catcherMaterial,scene,[0,floorY,0]);catcher.rotation.x=-Math.PI/2;catcher.receiveShadow=true;
 const echo=track(createFloorEcho(visualRoots,floorY));scene.add(echo.group);
 const duration=heroSceneDurations[kind],query=new URLSearchParams(location.search),review=query.get("hero-time");let time=review===null?.65:THREE.MathUtils.clamp(Number(review)||0,0,duration),frozen=review!==null,paused=false,visible=false,disposed=false,lost=false,frame=0,last=0;
 const handoff=createSceneHandoff(host,canvas);
 function draw(){if(disposed||lost)return;const state=heroSceneState(kind,kind==="manufacturing"&&time<duration?Math.min(duration,time*tuning.waveSpeed):time);
  arrivals.forEach(({group,position,index})=>{const arrival=state.arrival(index);group.visible=arrival>0;group.position.copy(position).add(new THREE.Vector3(0,(1-arrival)*.38,0));group.scale.setScalar(.92+.08*arrival);});
  routes.forEach((route,i)=>{const age=time-3.5-i*.22,local=age>0&&age<.6?Math.sin(Math.PI*age/.6)**2:0;route.update(state.connection(i),Math.max(local,state.response*.4),tuning.glow);});
  junctions.forEach((node,i)=>node.scale.setScalar(1+state.response*.35*(.6+random(i)*.4)));
  if(distantPoints){distantPoints.material.opacity=state.connection(3)*.5;distantPoints.material.color.setHex(dark()?0x73bce4:0x246b9e);}
  boundary.value=-2.5+state.finish*5;response.value=state.response;waveMat.uniforms.uTime.value=time;waveMat.uniforms.uAlpha.value=state.wave;waves.visible=state.wave>.001;
  const surface=manufacturingSurfaceState(kind==="manufacturing"?state.time:time);formation.value=surface.formation;if(scanner){scanner.group.position.x=surface.boundary;scanner.update(surface.scan,dark(),tuning.glow);}
  if(surfaceParticles){surfaceParticles.visible=time>.5&&time<6.9;surfaceParticles.material.uniforms.uRatio.value=quality.ratio*tuning.particleScale;}shadowMaterial.opacity=state.ground;
  if(kind==="manufacturing"){waves.visible=false;waveMat.uniforms.uAlpha.value=0;}
  echo.update(state.ground*(dark()?.5:.85));catcherMaterial.opacity=state.ground*(dark()?.18:.12);renderer.shadowMap.needsUpdate=true;
  renderer.render(scene,camera);canvas.dataset.partFormation=formation.value.toFixed(3);canvas.dataset.scanPlane=String(scanner?.group.visible??false);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.scanEnergy=surface.scan.toFixed(3);canvas.dataset.surfacePhase=surface.phase;host.dataset.phase=state.done?"settled":time<2?"establishing":time<4.5?"connecting":"resolving";
 }
 function size(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const extent=Math.max(kind==="manufacturing"?4.2:kind==="network"?6.2:5.8,(kind==="manufacturing"?4.2:kind==="network"?6.2:5.8)*(960/760)/aspect);camera.left=-extent*aspect/2;camera.right=extent*aspect/2;camera.top=extent/2;camera.bottom=-extent/2;camera.updateProjectionMatrix();draw();}
 function theme(){outlines.forEach(material=>{material.userData.restOutline??=material.opacity;material.opacity=material.userData.restOutline*tuning.outline;});routes.forEach(route=>route.setTheme(dark()));palette.forEach(({material,light,dark:night})=>material.color.setHex(dark()?night:light));panes.forEach(({material,kind})=>{setGlass(material,kind,dark());material.opacity*=tuning.glassOpacity;material.roughness*=tuning.roughness;material.envMapIntensity*=tuning.reflection;const transmission=kind==="side"?tuning.transmission*.35:0;if((material.transmission>0)!==(transmission>0))material.needsUpdate=true;material.transmission=transmission;material.thickness=.025;});waveMat.uniforms.uDark.value=dark()?1:0;if(surfaceParticles)surfaceParticles.material.uniforms.uDark.value=dark()?1:0;hemi.intensity=dark()?.65:.8;key.position.set(-4+Math.sin(tuning.keyDirection)*5,8,7);draw();}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;quality.reset();host.dataset.running="false";}
 function tick(now:number){frame=0;if(disposed||lost||!visible||document.hidden||paused||frozen)return;time=Math.min(duration,time+(last?Math.min(.08,(now-last)/1000):0));last=now;if(quality.sample(now)){renderer.setPixelRatio(quality.ratio);waveMat.uniforms.uRatio.value=quality.ratio;if(surfaceParticles)surfaceParticles.material.uniforms.uRatio.value=quality.ratio;size();}draw();if(time<duration)frame=requestAnimationFrame(tick);else{stop();onMode("settled");}}
 function schedule(){if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&!disposed&&!lost&&visible&&!document.hidden&&!paused&&!frozen&&!frame&&time<duration&&host.dataset.sceneState==="live"){last=0;host.dataset.running="true";frame=requestAnimationFrame(tick);}}
 const resize=new ResizeObserver(size),themes=new MutationObserver(theme),view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&(kind!=="manufacturing"||entry.intersectionRatio>=.25);if(visible)schedule();else stop();},{threshold:kind==="manufacturing"?[0,.25]:.05});
 function visibility(){if(document.hidden)stop();else schedule();}
 function contextLost(event:Event){event.preventDefault();lost=true;stop();handoff.fallback();onMode("static");}
 function restored(){lost=false;theme();size();void handoff.reveal().then(()=>{if(disposed)return;onMode(time>=duration?"settled":paused?"paused":"playing");schedule();});}
 const controller:EngineeredController={toggle(){paused=!paused;onMode(paused?"paused":"playing");if(paused)stop();else schedule();},replay(){stop();time=0;paused=frozen=false;draw();onMode("playing");schedule();},seek(seconds){stop();time=THREE.MathUtils.clamp(Number.isFinite(seconds)?seconds:0,0,duration);frozen=true;draw();onMode("settled");},dispose(){if(disposed)return;disposed=true;stop();handoff.dispose();resize.disconnect();themes.disconnect();view.disconnect();document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("webglcontextlost",contextLost);canvas.removeEventListener("webglcontextrestored",restored);signal.removeEventListener("abort",controller.dispose);resources.forEach(resource=>resource.dispose());renderer.dispose();renderer.forceContextLoss();}};
 track(observeArtworkTuning(kind,value=>{tuning=value;theme();}));
 signal.addEventListener("abort",controller.dispose,{once:true});if(signal.aborted){controller.dispose();return controller;}
 resize.observe(host);themes.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});view.observe(host);document.addEventListener("visibilitychange",visibility);canvas.addEventListener("webglcontextlost",contextLost);canvas.addEventListener("webglcontextrestored",restored);
 theme();size();await handoff.reveal();if(!disposed){onMode(frozen?"settled":"playing");schedule();}return controller;
}
