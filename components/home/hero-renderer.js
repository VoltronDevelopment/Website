import {optimizedAsset} from "@/lib/optimized-assets";
import {sceneOpeningTime} from "@/lib/scene-continuity";
import {mountHomeReveal} from './home-reveal-renderer';
import {updateLineDistance} from "../performance/line-distance";
import {createRenderQuality,yieldToBrowser} from "../performance/scene-policy";
import * as THREE from "three";
import {mergeGeometries} from "three/addons/utils/BufferGeometryUtils.js";
import {addArtworkSoftboxes,createArtworkEnvironment,createFloorEcho,edgePrism} from "../brand/artwork-studio";
import * as homeTimeline from "./hero-timeline";
import * as technologyTimeline from "./technology-hero-timeline";
import {glassFace,setGlass,strokeMaterial,stroke} from "./lattice-materials";
import {cloneArtworkMaterial,homePaneRole,homeCellTone} from "./home-glass";
import {observeArtworkTuning,artworkDefaults} from '../brand/artwork-tuning';
import {alignmentLight,junctionPulse,contactShadow} from "./lattice-lighting";
import {createLatticeActivity} from "./lattice-activity";
import {sizeHeroSurface} from "./hero-surface";
import {homeCells,cellsAt} from "../navigation/lattice-transition";
const {smooth,gridOpacityAt}=homeTimeline;

export function mountHero(canvas, container, hero, variant="home", options={}) {
if(variant==='home')return mountHomeReveal(canvas,container,hero,options);
const quality=createRenderQuality(canvas,1.75);
const technology=variant==="technology";
const {duration,offsets,stateAt}=technology ? technologyTimeline : homeTimeline;
canvas.hidden=false;
for(const key of ["fallback","fallbackReason","innerCubes","coreSizeRatio","coreCentre","logoConnection","outerGap","corePlacement","coreOpacity","connectionProgress","nonblankSamples"])delete canvas.dataset[key];
// Four supported base cells and three upper cells. Upper-front stays empty.
const cells = technology ? technologyTimeline.cells : homeCells;
const logoRegion = technology ? new THREE.Vector3(0,3.28,0) : new THREE.Vector3(.5,1.5,.5);
const coreCentre=new THREE.Vector3(...technologyTimeline.coreCentre);
const target = new THREE.Vector3(0,technology ? 1.6 : 1,0);
const frontPosition = new THREE.Vector3(6,technology ? 5.85 : 5.25,8);
const direction = frontPosition.clone().sub(target).normalize();
const faces = [
  {normal:[1,0,0],corners:[1,3,7,5],kind:"side"},
  {normal:[-1,0,0],corners:[0,4,6,2],kind:"side"},
  {normal:[0,1,0],corners:[2,6,7,3],kind:"top"},
  {normal:[0,-1,0],corners:[0,1,5,4],kind:"bottom"},
  {normal:[0,0,1],corners:[4,5,7,6],kind:"front"},
  {normal:[0,0,-1],corners:[0,2,3,1],kind:"rear"}
];
const cubeEdges = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
const cellKeys = new Set(cells.map(cell=>cell.join(",")));
const edges = new Map(), vertices = new Map(), surfaces = new Set();
const edgeCounts = new Map(), nodeCounts = new Map(), faceCounts = new Map();
const resources = [], groundMaterials = [], materialGroups = {};
const groundObjects=[];
let floorReflection;
let groundEcho;
const glassRims=[];
const homeFloorLights=[];
const arrivals = [], arrivalMaterials = [];
const illuminatedMaterials=[];
const nodeAccents=[],connectionHighlights=[];
let logoJunctions=[];
const assembled = new THREE.Group(), arrivalRoot = new THREE.Group();
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light", view = "hero";
let renderer, scene, camera, logo, proof, keyLight, hemisphere;
let edgeFront, edgeRear, nodeFront, nodeRear;
let core,coreEdge,coreConnection,connectionEnd;
let blurTarget, blurMaterial, compositeScene, compositeCamera, logoMask;
let blurX,blurY,gaussianMaterial,gaussianScene;
let raf = 0, startTime = 0, currentTime = 0, renderedFrames = 0;
let fallback = false, disposed = false, observer, visibilityObserver, themeObserver;
let inView = true;
let started=!options.deferStart;
const reviewTime=new URLSearchParams(location.search).get("hero-time");
const initialTime=reviewTime!==null?Math.max(0,Math.min(duration,Number(reviewTime)||0)):options.immediate?duration:sceneOpeningTime[variant];
currentTime=initialTime;
let activity;
let tuning={...artworkDefaults};
let entranceWave;
let userPaused=false,manualReplay=false;
let morphState=null;
let morphSurface=null;
const markUrl = optimizedAsset("/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png");
const reduceMotion=()=>motionPreference.matches || new URLSearchParams(location.search).get("motion")==="reduced";
const pixelProof=new URLSearchParams(location.search).get("diagnostics")==="pixels";
canvas.dataset.composition=variant;

function surfaceKind(cell,face) {
  const neighbour=cell.map((coordinate,index)=>coordinate+face.normal[index]);
  if(cellKeys.has(neighbour.join(",")))return "internal";
  return face.kind;
}
function paneMaterial(cell,face){
  const kind=surfaceKind(cell,face),role=technology?undefined:homePaneRole(cell,face.normal,kind==="internal"),tone=technology?undefined:homeCellTone(cell),key=technology?kind:kind+":"+role+":"+tone;
  if(!materialGroups[key]){
    const material=tracked(glassFace(kind,false,true,technology?undefined:"home",role));
    if(!technology){material.userData.homeCellTone=tone;setGlass(material,kind,false);}
    materialGroups[key]=material;
  }
  return materialGroups[key];
}

function tracked(resource) { resources.push(resource); return resource; }
function pointKey(point) { return point.toArray().join(","); }
function litMaterial(base,position,kind) {
  const material=tracked(cloneArtworkMaterial(base));
  illuminatedMaterials.push({material,base,position:position.clone(),distance:position.distanceTo(coreCentre ?? logoRegion),kind});
  return material;
}

function createGeometry() {
  for (const cell of cells) {
    const corners = Array.from({length:8},(_,index)=>new THREE.Vector3(
      cell[0]+((index&1) ? .5 : -.5),
      cell[1]+((index&2) ? .5 : -.5),
      cell[2]+((index&4) ? .5 : -.5)
    ));
    for (const corner of corners) {
      const key=pointKey(corner);vertices.set(key,corner);nodeCounts.set(key,(nodeCounts.get(key)??0)+1);
    }
    for (const [from,to] of cubeEdges) {
      const key = [pointKey(corners[from]),pointKey(corners[to])].sort().join("|");
      edges.set(key,[corners[from],corners[to]]);
      edgeCounts.set(key,(edgeCounts.get(key)??0)+1);
    }
    for (const face of faces) {
      const points = face.corners.map(index=>corners[index]);
      const key = points.map(pointKey).sort().join("|");
      faceCounts.set(key,(faceCounts.get(key)??0)+1);
      if (surfaces.has(key)) continue;
      surfaces.add(key);
      const kind = surfaceKind(cell,face);
      const geometry = tracked(new THREE.BufferGeometry());
      geometry.setAttribute("position",new THREE.Float32BufferAttribute(points.flatMap(point=>point.toArray()),3));
      geometry.setIndex([0,1,2,0,2,3]); geometry.computeVertexNormals();
      const material = paneMaterial(cell,face);
      const mesh = new THREE.Mesh(geometry,material);
      // Transparent panes sort around their own centres, not the world origin.
      const centre = points.reduce((sum,point)=>sum.add(point),new THREE.Vector3()).multiplyScalar(.25);
      mesh.material=litMaterial(material,centre,"face");
      geometry.translate(-centre.x,-centre.y,-centre.z); mesh.position.copy(centre);
      mesh.layers.set(isForeground(centre) ? 1 : 0);assembled.add(mesh);
    }
  }
  edgeFront = tracked(strokeMaterial(true));
  edgeRear = tracked(strokeMaterial(false));
  for (const pair of edges.values()) {
    const midpoint = pair[0].clone().add(pair[1]).multiplyScalar(.5);
    const material = midpoint.clone().sub(target).dot(direction)>-.1 ? edgeFront : edgeRear;
    const edge = stroke(pair.map(point=>point.clone().sub(midpoint)),litMaterial(material,midpoint,"edge"));tracked(edge.geometry);edge.position.copy(midpoint);
    edge.layers.set(isForeground(midpoint) ? 1 : 0);assembled.add(edge);
  }
  // Thin hexagonal rails give glass highlights a physical surface and stay batched.
  for(const layer of [0,1]){
    const pieces=[...edges.values()].filter(pair=>Number(isForeground(pair[0].clone().lerp(pair[1],.5)))===layer).map(pair=>edgePrism(pair[0],pair[1],technology?.0075:.011));
    if(!pieces.length)continue;
    const geometry=tracked(mergeGeometries(pieces));pieces.forEach(piece=>piece.dispose());
    const material=tracked(new THREE.MeshPhysicalMaterial({color:0x99c9ed,metalness:.4,roughness:technology?.12:.08,clearcoat:1,envMapIntensity:technology?1.6:2,transparent:true,opacity:1}));
    const rim=new THREE.Mesh(geometry,material);rim.layers.set(layer);assembled.add(rim);glassRims.push(rim);
  }
  const nodeGeometry = tracked(new THREE.SphereGeometry(.029,12,8));
  const haloTexture=radialTexture([[0,"rgba(72,207,234,.5)"],[.25,"rgba(72,207,234,.22)"],[1,"rgba(72,207,234,0)"]]);
  nodeFront = tracked(new THREE.MeshBasicMaterial({color:0x2384ef,transparent:true,opacity:.95,depthWrite:false,toneMapped:false}));
  nodeRear = tracked(new THREE.MeshBasicMaterial({color:0x45bafa,transparent:true,opacity:.46,depthWrite:false,toneMapped:false}));
  for (const point of vertices.values()) {
    const front=point.clone().sub(target).dot(direction)>-.1;
    const base=front ? nodeFront : nodeRear;
    const mesh = new THREE.Mesh(nodeGeometry,litMaterial(base,point,"node"));
    mesh.position.copy(point);mesh.layers.set(isForeground(point) ? 1 : 0);
    assembled.add(mesh);
    const highlight=new THREE.Mesh(tracked(new THREE.SphereGeometry(.008,8,6)),tracked(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,depthWrite:false,toneMapped:false})));
    highlight.position.set(-.008,.01,.023);mesh.add(highlight);highlight.layers.mask=mesh.layers.mask;
    const halo=new THREE.Sprite(tracked(new THREE.SpriteMaterial({map:haloTexture,transparent:true,opacity:0,depthWrite:false,toneMapped:false})));
    halo.position.copy(point).addScaledVector(direction,.025);halo.layers.mask=mesh.layers.mask;assembled.add(halo);
    nodeAccents.push({mesh,highlight,halo,point,front});
  }
  proof = new THREE.Group();
  proof.visible = false; scene.add(proof);
  scene.add(assembled,arrivalRoot);
  logoJunctions=[...vertices.values()].sort((a,b)=>a.distanceTo(logoRegion)-b.distanceTo(logoRegion)).slice(0,3);
  for(const [index,cell] of cells.entries()){
    const from=new THREE.Vector3(cell[0]-.5,cell[1]+.5,cell[2]+.5),to=from.clone().add(new THREE.Vector3(1,0,0));
    const material=tracked(strokeMaterial(true));material.color.setHex(0x48cfea);material.userData.cssWidth=technology?1.6:1.9;
    const line=stroke([from,to],material);tracked(line.geometry);line.layers.set(isForeground(from.clone().lerp(to,.5))?1:0);scene.add(line);
    if(!technology){material.depthTest=false;line.renderOrder=4;}
    const halos=[];
    if(!technology)for(const [width,opacity]of [[7,.12],[4,.23]]){
      const haloMaterial=tracked(strokeMaterial(true));haloMaterial.userData.cssWidth=width;haloMaterial.color.setHex(0x43b9ff);haloMaterial.userData.peakOpacity=opacity;
      const halo=stroke([from,to],haloMaterial);tracked(halo.geometry);halo.layers.mask=line.layers.mask;scene.add(halo);halos.push(halo);
      haloMaterial.depthTest=false;halo.renderOrder=3;
    }
    connectionHighlights.push({line,halos,from,to,index});
  }
}

function isForeground(point) { return (point.x>=.999 || point.z>=.999) && point.y<=1.001; }

function createCore() {
  core=new THREE.Group();core.position.copy(coreCentre);
  const coreMaterials=["side","top","front"].map(kind=>{
    const base=tracked(new THREE.MeshPhysicalMaterial({
      color:0x155a91,roughness:.3,metalness:0,clearcoat:.35,clearcoatRoughness:.12,
      transparent:true,opacity:.96,depthWrite:false,envMapIntensity:.08,
      emissive:0x1671ab,emissiveIntensity:.015,
    }));
    materialGroups[`core-${kind}`]=base;
    return litMaterial(base,coreCentre,"face");
  });
  const geometry=tracked(new THREE.BoxGeometry(technologyTimeline.coreSize,technologyTimeline.coreSize,technologyTimeline.coreSize));
  const coreMesh=new THREE.Mesh(geometry,[coreMaterials[0],coreMaterials[0],coreMaterials[1],coreMaterials[1],coreMaterials[2],coreMaterials[2]]);
  // Keep the core crisp in the foreground pass; background softening belongs to the outer lattice.
  coreMesh.layers.set(1);coreMesh.renderOrder=2;core.add(coreMesh);
  coreEdge=new THREE.LineSegments(tracked(new THREE.EdgesGeometry(geometry)),tracked(new THREE.LineBasicMaterial({color:0x299bdd,transparent:true,opacity:.8,depthWrite:false,toneMapped:false})));
  coreEdge.layers.set(1);coreEdge.renderOrder=3;
  core.add(coreEdge);scene.add(core);core.visible=technology;
  coreConnection=new THREE.Line(tracked(new THREE.BufferGeometry().setFromPoints([coreCentre,coreCentre])),tracked(new THREE.LineDashedMaterial({color:0x299bdd,transparent:true,opacity:.65,dashSize:.045,gapSize:.035,depthWrite:false,toneMapped:false})));
  scene.add(coreConnection);
  if(technology){canvas.dataset.innerCubes="1";canvas.dataset.coreSizeRatio=String(technologyTimeline.coreSize);
  canvas.dataset.coreCentre=coreCentre.toArray().join(",");}
}

function createArrivals() {
  for(const [cellIndex,cell] of cells.entries()) {
    const group=new THREE.Group();group.position.set(...cell);arrivalRoot.add(group);arrivals.push(group);
    const corners=Array.from({length:8},(_,index)=>new THREE.Vector3((index&1)?.5:-.5,(index&2)?.5:-.5,(index&4)?.5:-.5));
    const world=point=>point.clone().add(new THREE.Vector3(...cell));
    const materialFor=(base,count,kind,point)=>{
      const material=tracked(cloneArtworkMaterial(base));arrivalMaterials.push({material,base,count,cellIndex,kind,point});return material;
    };
    for(const face of faces) {
      const points=face.corners.map(index=>corners[index]);
      const key=points.map(world).map(pointKey).sort().join("|");
      const count=faceCounts.get(key);
      const base=paneMaterial(cell,face);
      const geometry=tracked(new THREE.BufferGeometry());
      geometry.setAttribute("position",new THREE.Float32BufferAttribute(points.flatMap(point=>point.toArray()),3));
      geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
      const centre=points.reduce((sum,point)=>sum.add(point),new THREE.Vector3()).multiplyScalar(.25);
      const mesh=new THREE.Mesh(geometry,materialFor(base,count,"face",world(centre)));
      geometry.translate(-centre.x,-centre.y,-centre.z);mesh.position.copy(centre);
      mesh.layers.set(isForeground(world(centre)) ? 1 : 0);group.add(mesh);
    }
    for(const [from,to] of cubeEdges) {
      const points=[corners[from],corners[to]], globalPoints=points.map(world);
      const key=globalPoints.map(pointKey).sort().join("|");
      const midpoint=globalPoints[0].clone().add(globalPoints[1]).multiplyScalar(.5);
      const base=midpoint.clone().sub(target).dot(direction)>-.1 ? edgeFront : edgeRear;
      const edge=stroke(points,materialFor(base,edgeCounts.get(key),"edge",midpoint));tracked(edge.geometry);
      edge.layers.set(isForeground(midpoint) ? 1 : 0);group.add(edge);
    }
    const nodeGeometry=tracked(new THREE.SphereGeometry(.029,12,8));
    for(const point of corners) {
      const absolute=world(point), base=absolute.z>=.5 || absolute.x>=1 || absolute.y>=2 ? nodeFront : nodeRear;
      const node=new THREE.Mesh(nodeGeometry,materialFor(base,nodeCounts.get(pointKey(absolute)),"node",absolute));
      node.position.copy(point);node.layers.set(isForeground(absolute) ? 1 : 0);group.add(node);
    }
  }
}

function radialTexture(stops) {
  const source = document.createElement("canvas"); source.width = source.height = 128;
  const context = source.getContext("2d");
  const gradient = context.createRadialGradient(64,64,0,64,64,64);
  for (const [offset,colour] of stops) gradient.addColorStop(offset,colour);
  context.fillStyle = gradient; context.fillRect(0,0,128,128);
  return tracked(new THREE.CanvasTexture(source));
}

function createGround() {
  const texture = radialTexture([[0,"rgba(22,61,91,.65)"],[.25,"rgba(36,91,133,.4)"],[.65,"rgba(57,124,174,.07)"],[1,"rgba(57,124,174,0)"]]);
  for (const [cellIndex,cell] of cells.entries()) {
    if(cell[1]!==.5)continue;
    const material = tracked(new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.48,depthWrite:false,toneMapped:false}));
    const mesh = new THREE.Mesh(tracked(new THREE.PlaneGeometry(1.08,1.08)),material);
    mesh.rotation.x = -Math.PI/2; mesh.position.set(cell[0],-.018,cell[2]);mesh.userData.cellIndex=cellIndex; scene.add(mesh); groundMaterials.push(material);groundObjects.push(mesh);
  }
  const reflectionTexture = radialTexture([[0,"rgba(56,174,238,.25)"],[.4,"rgba(78,182,241,.1)"],[1,"rgba(78,182,241,0)"]]);
  const material = tracked(new THREE.MeshBasicMaterial({map:reflectionTexture,transparent:true,opacity:.55,depthWrite:false,toneMapped:false}));
  const floor = new THREE.Mesh(tracked(new THREE.PlaneGeometry(2.7,2.7)),material);
  floorReflection=floor;
  floor.rotation.x = -Math.PI/2; floor.position.y = -.025; scene.add(floor); groundMaterials.push(material);
  groundEcho=tracked(createFloorEcho([assembled],0));scene.add(groundEcho.group);
  if(!technology){
    const glow=radialTexture([[0,"rgba(207,245,255,.9)"],[.12,"rgba(65,178,255,.55)"],[.42,"rgba(36,107,212,.12)"],[1,"rgba(36,107,212,0)"]]);
    const geometry=tracked(new THREE.PlaneGeometry(.28,.28));
    for(const point of vertices.values())if(point.y===0){
      const material=tracked(new THREE.MeshBasicMaterial({map:glow,transparent:true,opacity:0,depthWrite:false,toneMapped:false}));
      const pool=new THREE.Mesh(geometry,material);pool.rotation.x=-Math.PI/2;pool.position.set(point.x,-.006,point.z);scene.add(pool);homeFloorLights.push(pool);
    }
  }
}

function measureLogo(texture) {
  const source = document.createElement("canvas");
  source.width = texture.image.width; source.height = texture.image.height;
  const context = source.getContext("2d",{willReadFrequently:true}); context.drawImage(texture.image,0,0);
  const {data} = context.getImageData(0,0,source.width,source.height);
  if(technology)logoMask=createLogoMask(data,source.width,source.height);
  let minX=source.width,minY=source.height,maxX=0,maxY=0;
  for (let y=0;y<source.height;y++) for (let x=0;x<source.width;x++) {
    if (data[(y*source.width+x)*4+3]<32) continue;
    minX=Math.min(minX,x); maxX=Math.max(maxX,x); minY=Math.min(minY,y); maxY=Math.max(maxY,y);
  }
  const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
  const horizontal = [...vertices.values()].map(point=>point.dot(right));
  const latticeWidth = Math.max(...horizontal)-Math.min(...horizontal);
  const alphaWidth = (maxX-minX+1)/source.width;
  const scale = latticeWidth*(technology ? .4 : .43)/alphaWidth;
  const alphaCentre = new THREE.Vector3((minX+maxX+1)/(2*source.width)-.5,.5-(minY+maxY+1)/(2*source.height),0);
  logo.scale.setScalar(scale);
  // Centre the actual ink in the missing upper-front cell, with modest forward clearance.
  logo.position.copy(logoRegion).addScaledVector(direction,.3).sub(alphaCentre.multiplyScalar(scale).applyQuaternion(camera.quaternion));
  if(technology) {
    const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    const inkHeight=(maxY-minY+1)/source.height*scale;
    connectionEnd=logoRegion.clone().addScaledVector(direction,.3).addScaledVector(up,-inkHeight/2-.045);
    canvas.dataset.logoConnection="core-to-mark";
    canvas.dataset.innerCubes="1";canvas.dataset.coreSizeRatio=String(technologyTimeline.coreSize);
    canvas.dataset.coreCentre=coreCentre.toArray().join(",");
  }
  canvas.dataset.logoVisibleWidthRatio = (alphaWidth*scale/latticeWidth).toFixed(3);
  canvas.dataset.logoAlphaBounds = [minX,minY,maxX,maxY].join(",");
  canvas.dataset.logoDepthTest = String(logo.material.depthTest);
  canvas.dataset.supported = technology ? "spaced" : String(cells.every(([x,y,z])=>y===.5 || cellKeys.has([x,y-1,z].join(","))));
  if(technology) {
    canvas.dataset.outerGap=technologyTimeline.outerGap.toFixed(2);
    canvas.dataset.corePlacement="centre-of-eight-position-envelope";
  }
  const reached = new Set([cells[0].join(",")]); const queue = [cells[0]];
  while(queue.length) {
    const cell=queue.shift();
    for(const face of faces) {
      const neighbour=cell.map((value,index)=>value+face.normal[index]); const key=neighbour.join(",");
      if(cellKeys.has(key) && !reached.has(key)) {reached.add(key);queue.push(neighbour);}
    }
  }
  canvas.dataset.connected = String(reached.size===cells.length);
  canvas.dataset.baseCells = String(cells.filter(cell=>cell[1]===.5).length);
  canvas.dataset.upperCells = String(cells.filter(cell=>cell[1]===(technology ? technologyTimeline.upperHeight : 1.5)).length);
  canvas.dataset.upperFrontEmpty = String(!cellKeys.has(logoRegion.toArray().join(",")));
  canvas.dataset.logoPlacement=technology ? "above-core" : "upper-front";
  canvas.dataset.missingCornerAbsent = String(!vertices.has("1,2,1"));
  canvas.dataset.cells = String(cells.length); canvas.dataset.edges = String(edges.size);
  canvas.dataset.surfaces = String(surfaces.size);
  canvas.dataset.junctions = String(vertices.size); canvas.dataset.heightLevels = "2";
}

function createLogoMask(pixels,width,height) {
  const size=192,inner=128,padding=32;
  let minX=inner,minY=inner,maxX=0,maxY=0;
  for(let y=0;y<inner;y++) for(let x=0;x<inner;x++) {
    if(pixels[(Math.floor(y*height/inner)*width+Math.floor(x*width/inner))*4+3]>32) {
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    }
  }
  // Feather only the immediate mark clearance; preserve the surrounding glass detail.
  const cx=(minX+maxX)/2+padding,cy=(minY+maxY)/2+padding;
  const rx=(maxX-minX)/2+12,ry=(maxY-minY)/2+10;
  const result=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const radius=Math.hypot((x-cx)/rx,(y-cy)/ry);
    result.set([255,255,255,Math.round(255*(1-smooth((radius-.7)/.32)))],(y*size+x)*4);
  }
  const texture=tracked(new THREE.DataTexture(result,size,size));
  texture.flipY=true;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
}

function createBlur() {
  blurTarget=tracked(new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true}));
  blurTarget.samples=4;
  blurX=tracked(new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:false}));
  blurY=tracked(new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:false}));
  gaussianMaterial=tracked(new THREE.ShaderMaterial({
    uniforms:{source:{value:blurTarget.texture},stepSize:{value:new THREE.Vector2()}},
    depthTest:false,depthWrite:false,blending:THREE.NoBlending,toneMapped:false,
    vertexShader:"varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
    fragmentShader:`uniform sampler2D source;uniform vec2 stepSize;varying vec2 vUv;
      void main(){vec4 colour=texture2D(source,vUv)*0.227027;
        colour+=(texture2D(source,vUv+stepSize*1.384615)+texture2D(source,vUv-stepSize*1.384615))*0.316216;
        colour+=(texture2D(source,vUv+stepSize*3.230769)+texture2D(source,vUv-stepSize*3.230769))*0.070270;
        gl_FragColor=colour;}`
  }));
  gaussianScene=new THREE.Scene();gaussianScene.add(new THREE.Mesh(tracked(new THREE.PlaneGeometry(2,2)),gaussianMaterial));
  blurMaterial=tracked(new THREE.ShaderMaterial({
    uniforms:{background:{value:blurTarget.texture},softBackground:{value:blurY.texture},mask:{value:logoMask},centre:{value:new THREE.Vector2()},extent:{value:new THREE.Vector2(1,1)},amount:{value:0},quiet:{value:.15},recording:{value:0},pageColour:{value:new THREE.Vector3()}},
    depthTest:false,depthWrite:false,blending:THREE.NoBlending,
    vertexShader:"varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
    fragmentShader:`
      uniform sampler2D background;uniform sampler2D softBackground;uniform sampler2D mask;
      uniform vec2 centre;uniform vec2 extent;uniform float amount;uniform float recording;uniform vec3 pageColour;varying vec2 vUv;
      uniform float quiet;
      void main(){
        vec2 local=(vUv-centre)/extent+0.5;
        float inside=step(0.0,local.x)*step(local.x,1.0)*step(0.0,local.y)*step(local.y,1.0);
        float weight=texture2D(mask,clamp(local,0.0,1.0)).a*inside*amount;
        vec4 sharp=texture2D(background,vUv);
        vec4 soft=texture2D(softBackground,vUv);
        vec4 result=mix(sharp,soft,weight);
        result*=1.0-weight*quiet;
        gl_FragColor=vec4(result.rgb/max(result.a,0.00001),result.a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        gl_FragColor.rgb*=gl_FragColor.a;
        if(recording>0.5){gl_FragColor.rgb+=pageColour*(1.0-gl_FragColor.a);gl_FragColor.a=1.0;}
      }`
  }));
  compositeScene=new THREE.Scene();compositeCamera=new THREE.Camera();
  compositeScene.add(new THREE.Mesh(tracked(new THREE.PlaneGeometry(2,2)),blurMaterial));
}

function palette() {
  if(fallback) {renderFallback();return;}
  const dark = theme === "dark", diagnostic = view!=="hero";
  for (const [kind,material] of Object.entries(materialGroups)) {
    const core=kind.startsWith("core-"),faceKind=core ? kind.slice(5) : material.userData.faceKind||kind;
    const coreColours=dark ? {top:0x1a5e90,side:0x0b304f,front:0x124773} : {top:0x12527f,side:0x06152b,front:0x0b2d50};
    if(core){material.color.setHex(coreColours[faceKind]);material.userData.restOpacity=.96;material.envMapIntensity=.08;material.clearcoat=.35;}
    else {setGlass(material,faceKind,dark);material.opacity*=tuning.glassOpacity;material.userData.restOpacity=material.opacity*(diagnostic?.2:1);material.roughness*=tuning.roughness;material.envMapIntensity*=tuning.reflection;const transmission=faceKind==="side"&&material.userData.paneRole!=="backing"?tuning.transmission*.3:0;if((material.transmission>0)!==(transmission>0))material.needsUpdate=true;material.transmission=transmission;material.thickness=.025;}
  }
  keyLight.intensity=dark ? 2 : 3.2;hemisphere.intensity=dark ? .7 : .95;keyLight.position.set(-3+Math.sin(tuning.keyDirection)*4,6,5);
  glassRims.forEach(rim=>rim.material.color.setHex(technology?(dark?0x76b7e3:0x8bbde2):(dark?0x8ac9ed:0xc0e0f4)));
  connectionHighlights.forEach(({line})=>line.material.color.setHex(technology?0x48cfea:dark?0xc5f4ff:0x157ad9));
  edgeFront.color.setHex(dark ? 0x579acb : 0x2468aa);
  edgeRear.color.setHex(dark ? 0x40769d : 0x619bc5);
  nodeFront.color.setHex(dark ? 0x78b0ff : 0x246bd4);
  nodeRear.color.setHex(dark ? 0x3e7caa : 0x45bafa);
  if(technology) {
    coreEdge.material.color.setHex(dark ? 0x66b6e8 : 0x299bdd);
    coreConnection.material.color.setHex(dark ? 0x66b6e8 : 0x299bdd);
  }
  for(const [material,opacity] of [[edgeFront,.5],[edgeRear,.16],[nodeFront,.98],[nodeRear,dark ? .32 : .4]]) material.userData.restOpacity=opacity*((material===edgeFront||material===edgeRear)?tuning.outline:1);
  for(const record of arrivalMaterials) record.material.copy(record.base);
  for(const record of illuminatedMaterials) record.material.copy(record.base);
  applyState(currentTime);
  if(morphState)cleanup.morph(...morphState);
}

function weightedOpacity(opacity,weight) { return 1-Math.pow(1-opacity,Math.max(0,weight)); }

function applyState(seconds) {
  currentTime=seconds;
  const mode=fallback?"static":userPaused?"paused":seconds>=duration?"settled":"playing";if(container.dataset.sceneMode!==mode)container.dataset.sceneMode=mode;
  if(fallback) {canvas.dataset.settled="true";canvas.dataset.animationTime=String(duration);return;}
  const state=stateAt(seconds), dark=theme==="dark",diagnostic=view!=="hero";
  if(entranceWave){entranceWave.material.uniforms.uTime.value=seconds;entranceWave.material.uniforms.uDark.value=dark?1:0;entranceWave.visible=!diagnostic&&!technology&&seconds<6.5;}
  const materials=[...Object.values(materialGroups),edgeFront,edgeRear,nodeFront,nodeRear];
  for(const material of materials) material.opacity=weightedOpacity(material.userData.restOpacity,state.resolve);
  let maximumWave=0;
  const blue=new THREE.Color(dark?0x48cfea:0x32adff);
  const timeline=technology?technologyTimeline:homeTimeline;
  const scanStates=technology?[]:connectionHighlights.map(({index})=>homeTimeline.scanAt(seconds,index));
  const pulseAt=point=>reduceMotion()?0:Math.max(alignmentLight(seconds,point.toArray(),cells,timeline.starts),timeline.latticeWaveAt(seconds,point.distanceTo(logoRegion))*Math.max(.22,1-point.distanceTo(logoRegion)/3),...logoJunctions.map((node,index)=>junctionPulse(seconds,(technology?6.9:5.6)+index*.12,.14,.65)*Math.max(0,1-point.distanceTo(node)/.85)),...(!technology?connectionHighlights.map(({to,index})=>scanStates[index].receiver*Math.max(0,1-point.distanceTo(to)/.24)):[]),activity?.strength(point.toArray())??0);
  for(const {material,base,distance,position,kind} of illuminatedMaterials) {
    const wave=diagnostic ? 0 : pulseAt(position);
    maximumWave=Math.max(maximumWave,wave);
    material.color.copy(base.color).lerp(blue,wave*(kind==="face" ? .2 : .72));
    const resting=base.userData.restOpacity;
    const inner=base===materialGroups["core-top"] || base===materialGroups["core-side"] || base===materialGroups["core-front"];
    const reveal=inner ? (state.core??0) : state.resolve;
    if(inner)material.depthWrite=state.core===1;
    material.opacity=weightedOpacity(kind==="face" ? Math.min(1,resting*(1+wave*.22)) : resting+(1-resting)*wave*.65,reveal);
    if(kind==="face") {
      material.emissive.copy(base.emissive);material.emissiveIntensity=base.emissiveIntensity+wave*(dark ? .5 : .3);
    }
  }
  assembled.visible=state.resolve>0;arrivalRoot.visible=state.resolve<1;
  for(const [index,group] of arrivals.entries()) {
    const arrival=state.arrivals[index],remaining=1-arrival.travel;
    group.visible=arrival.visible;
    group.position.set(...cells[index]).addScaledVector(new THREE.Vector3(...offsets[index]),remaining);
    group.rotation.set(remaining*(index%2 ? -.07 : .08),remaining*(index%2 ? .09 : -.06),remaining*(index%3 ? -.055 : .065));
  }
  for(const {material,base,count,cellIndex,kind,point} of arrivalMaterials) {
    const arrival=state.arrivals[cellIndex],share=1+(count-1)*smooth((arrival.progress-.65)/.35);
    const wave=reduceMotion()?0:junctionPulse(seconds,(technology?technologyTimeline:homeTimeline).starts[cellIndex]+1.5);
    material.opacity=weightedOpacity(Math.min(1,base.userData.restOpacity+wave*(kind==="face"?.025:.18)),(1-state.resolve)/share)*smooth(arrival.progress/.18);
    material.color.copy(base.color).lerp(blue,wave*.3);
  }
  for(const {mesh,highlight,halo,point,front} of nodeAccents){
    const pulse=pulseAt(point);halo.visible=pulse>.001;halo.material.opacity=pulse*(technology?(dark?.55:.38):(dark?.55:.65))*state.resolve*tuning.glow;
    highlight.material.opacity=(front?.7:.25)*state.resolve;
  }
  let scanStrength=0;
  for(const {line,halos,from,to,index} of connectionHighlights){
    const age=seconds-((technology?technologyTimeline:homeTimeline).starts[index]+1.5+.12);
    const scan=technology?null:scanStates[index];
    const progress=scan?scan.head:age/.34;line.visible=!diagnostic&&!reduceMotion() && (scan?scan.visible:progress>0&&progress<1);
    halos.forEach(halo=>halo.visible=line.visible);
    if(line.visible){
      const a=from.clone().lerp(to,scan?scan.tail:Math.max(0,progress-.3)),b=from.clone().lerp(to,progress);
      const strength=scan?scan.strength:Math.sin(progress*Math.PI);scanStrength=Math.max(scanStrength,strength);
      for(const stroke of [line,...halos]){
        stroke.geometry.attributes.instanceStart.setXYZ(0,a.x,a.y,a.z);stroke.geometry.attributes.instanceEnd.setXYZ(0,b.x,b.y,b.z);
        stroke.geometry.attributes.instanceStart.needsUpdate=true;stroke.geometry.attributes.instanceEnd.needsUpdate=true;
        stroke.geometry.computeBoundingSphere();stroke.material.opacity=strength*(stroke===line?(technology?.8:.98):stroke.material.userData.peakOpacity*(dark?.7:1))*tuning.glow;
      }
    }
  }
  logo.material.opacity=state.logo;logo.visible=state.logo>0;
  if(technology) {
    core.visible=state.core>0;
    core.position.copy(coreCentre).addScaledVector(new THREE.Vector3(0,.18,0),1-state.core);
    coreEdge.material.opacity=state.core*(dark ? .9 : .8);
    coreConnection.visible=state.connection>0;
    coreConnection.material.opacity=state.connection*(dark ? .65 : .58);
    const endpoint=coreCentre.clone().lerp(connectionEnd,state.connection);
    const positions=coreConnection.geometry.attributes.position;
    positions.setXYZ(1,endpoint.x,endpoint.y,endpoint.z);positions.needsUpdate=true;
    updateLineDistance(coreConnection.geometry);coreConnection.geometry.computeBoundingSphere();
    canvas.dataset.coreOpacity=state.core.toFixed(3);canvas.dataset.connectionProgress=state.connection.toFixed(3);
  }
  logo.material.depthWrite=state.logo===1;
  hero.style.setProperty("--grid-opacity",String(gridOpacityAt(seconds,dark)));
  let groundReveal=0,groundX=0,groundZ=0;
  for(const shadow of groundObjects){
    const index=shadow.userData.cellIndex,group=arrivals[index];
    const response=contactShadow(state.arrivals[index].progress,group.position.y-.5);
    shadow.position.set(group.position.x,-.018,group.position.z);
    shadow.scale.set(response.scale,response.scale,1);
    shadow.material.opacity=(diagnostic?.07:dark?.24:.48)*response.opacity;
    groundReveal+=response.opacity/groundObjects.length;
    groundX+=group.position.x*response.opacity;groundZ+=group.position.z*response.opacity;
  }
  const groundWeight=groundReveal*groundObjects.length;
  floorReflection.position.set(groundWeight?groundX/groundWeight:0,-.025,groundWeight?groundZ/groundWeight:0);
  groundMaterials.at(-1).opacity=(diagnostic?.07:dark?.24:.48)*groundReveal;
  canvas.dataset.shadowSync=String(groundObjects.every(shadow=>{const group=arrivals[shadow.userData.cellIndex];return shadow.position.x===group.position.x&&shadow.position.z===group.position.z;}));
  canvas.dataset.visibleShadows=String(groundObjects.filter(shadow=>shadow.material.opacity>.001).length);
  canvas.dataset.floorReflection=groundReveal.toFixed(3);
  glassRims.forEach(rim=>{rim.material.opacity=state.resolve*.74*tuning.outline;rim.visible=!diagnostic;});
  homeFloorLights.forEach(pool=>{pool.visible=!diagnostic;pool.material.opacity=state.resolve*(dark?.28:.42);});
  groundEcho?.update(diagnostic?0:groundReveal*(dark?.65:1));
  if(blurMaterial) {
    blurMaterial.uniforms.amount.value=diagnostic ? 0 : state.logo*(technology ? .85 : .98);
    blurMaterial.uniforms.quiet.value=dark ? .055 : .04;
  }
  canvas.dataset.animationTime=seconds.toFixed(3);canvas.dataset.settled=String(state.done);
  canvas.dataset.logoOpacity=state.logo.toFixed(3);canvas.dataset.blurAmount=(diagnostic||!technology ? 0 : state.logo*.85).toFixed(3);
  canvas.dataset.glassTreatment=technology?"legacy":"face-roles";
  canvas.dataset.logoPulse=state.pulse.toFixed(3);canvas.dataset.gridPulse=state.gridPulse.toFixed(3);
  canvas.dataset.logoGlowOpacity="0.000";
  canvas.dataset.latticeWave=maximumWave.toFixed(3);
  canvas.dataset.scanStrength=scanStrength.toFixed(3);
}

function render() {
  if(fallback) {renderFallback();return;}
  if (!renderer) return;
  if(!technology){
    renderer.autoClear=true;renderer.setRenderTarget(null);camera.layers.set(0);camera.layers.enable(1);renderer.render(scene,camera);
    renderer.autoClear=false;renderer.clearDepth();camera.layers.set(2);renderer.render(scene,camera);camera.layers.enableAll();
  }else{
  const centre=logo.position.clone().project(camera),uniforms=blurMaterial.uniforms;
  uniforms.centre.value.set((centre.x+1)/2,(centre.y+1)/2);
  uniforms.pageColour.value.set(...(theme==="dark" ? [4/255,4/255,6/255] : [243/255,245/255,247/255]));
  uniforms.extent.value.set(1.2*logo.scale.x/(camera.right-camera.left),1.2*logo.scale.y/(camera.top-camera.bottom));
  renderer.autoClear=false;
  camera.layers.set(0);renderer.setRenderTarget(blurTarget);renderer.clear();renderer.render(scene,camera);
  if(uniforms.amount.value>.001){
    gaussianMaterial.uniforms.source.value=blurTarget.texture;
    gaussianMaterial.uniforms.stepSize.value.set(1.1*renderer.getPixelRatio()/canvas.width,0);
    renderer.setRenderTarget(blurX);renderer.clear();renderer.render(gaussianScene,compositeCamera);
    gaussianMaterial.uniforms.source.value=blurX.texture;
    gaussianMaterial.uniforms.stepSize.value.set(0,.55*renderer.getPixelRatio()/blurX.height);
    renderer.setRenderTarget(blurY);renderer.clear();renderer.render(gaussianScene,compositeCamera);
  }
  renderer.setRenderTarget(null);renderer.clear();renderer.render(compositeScene,compositeCamera);
  renderer.clearDepth();camera.layers.set(1);renderer.render(scene,camera);
  camera.layers.set(2);renderer.render(scene,camera);camera.layers.enableAll();
  }
  renderedFrames++;canvas.dataset.renderedFrames=String(renderedFrames);
  const checked=canvas.dataset.nonblankSamples&&canvas.dataset.theme===theme;
  canvas.dataset.view=view;canvas.dataset.theme=theme;
  if(!pixelProof||!stateAt(currentTime).done||checked)return;
  const gl = renderer.getContext(), pixels = new Uint8Array(canvas.width*canvas.height*4);
  gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  let visible = 0;
  for (let index=3;index<pixels.length;index+=64) if (pixels[index]>20) visible++;
  canvas.dataset.nonblankSamples = String(visible); canvas.dataset.ready = "true";
  canvas.dataset.view = view; canvas.dataset.theme = theme;
}

function resize() {
  if(morphSurface&&morphState){cleanup.morph(...morphState);return;}
  const {width,height} = container.getBoundingClientRect(), aspect = width/height;
  if(!width || !height || !logo)return;
  const artBounds=container.getBoundingClientRect(),heroBounds=hero.getBoundingClientRect();
  hero.style.setProperty("--art-x",`${artBounds.left-heroBounds.left+width/2}px`);
  hero.style.setProperty("--art-y",`${artBounds.top-heroBounds.top+height/2}px`);
  hero.style.setProperty("--art-clear-x",`${width*.6}px`);
  hero.style.setProperty("--art-clear-y",`${height*.7}px`);
  const framing = technology ? Math.max(4.4,4.48/aspect) : Math.max(3.25,3.4/aspect);
  camera.left=-framing*aspect/2; camera.right=framing*aspect/2; camera.top=framing/2; camera.bottom=-framing/2;
  camera.updateProjectionMatrix();
  const worldPixel=framing/height;
  for(const {mesh,halo,front} of nodeAccents){mesh.scale.setScalar(worldPixel*(front?2.25:1.5)/.029);halo.scale.setScalar(worldPixel*(technology?17:24));}
  camera.updateMatrixWorld();
  container.dataset.pointerTargets=JSON.stringify(nodeAccents.filter(node=>node.front).map(({point})=>{const p=point.clone().project(camera);return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};}));
  if(fallback) {renderFallback();return;}
  sizeHeroSurface(renderer,technology?[blurTarget,blurX,blurY]:[],width,height,quality.ratio,quality.blurScale);render();
}

function stopMotion() {cancelAnimationFrame(raf);raf=0;canvas.dataset.continuousRendering="false";}
function tick(now) {
  if(quality.sample(now))resize();
  if(disposed || !inView || document.hidden) {stopMotion();return;}
  const elapsed=Math.min(duration,(now-startTime)/1000);
  applyState(elapsed);render();
  if(elapsed<duration) raf=requestAnimationFrame(tick);else {stopMotion();/* Finite intro: no idle pulses after settlement. */}
}
function play() {
  morphState=null;morphSurface=null;
  stopMotion();
  activity?.restart();
  if(fallback || reduceMotion() || options.immediate) {applyState(duration);render();/* Finite intro: no idle pulses after settlement. */return;}
  applyState(initialTime);render();
  if(!started||reviewTime!==null&&!manualReplay)return;
  startTime=performance.now()-initialTime*1000;canvas.dataset.continuousRendering="true";raf=requestAnimationFrame(tick);
}

function renderFallback() {
  camera.updateMatrixWorld(true);
  const dark=theme==="dark",width=640,height=520;
  hero.style.setProperty("--grid-opacity",String(gridOpacityAt(duration,dark)));
  const project=point=>{const p=point.clone().project(camera);return `${((p.x+1)*width/2).toFixed(2)},${((1-p.y)*height/2).toFixed(2)}`;};
  const polygons=[];
  const seen=new Set();
  for(const cell of cells) {
    const corners=Array.from({length:8},(_,index)=>new THREE.Vector3(cell[0]+((index&1)?.5:-.5),cell[1]+((index&2)?.5:-.5),cell[2]+((index&4)?.5:-.5)));
    for(const face of faces) {
      if(!technology&&surfaceKind(cell,face)==="internal")continue;
      const points=face.corners.map(index=>corners[index]),key=points.map(pointKey).sort().join("|");
      if(seen.has(key))continue;seen.add(key);
      const centre=points.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).multiplyScalar(.25);
      const core=surfaceKind(cell,face).startsWith("core-");
      const ink=!technology&&homeCellTone(cell)==="dark";
      const fill=!technology?(ink?(face.kind==="top"?"#163149":"#0d263c"):(face.kind==="top"?"#f6fbff":"#d4e6f2")):core ? (dark ? "#1675ae" : "#42b5ed") : dark ? "#15527c" : face.kind==="top" ? "#d8efff" : "#83c4ed";
      const opacity=!technology?(ink?.84:.48):core?.3:face.kind==="side"?.16:.07;
      polygons.push({depth:centre.dot(direction),svg:`<polygon points="${points.map(project).join(" ")}" fill="${fill}" fill-opacity="${opacity}"/>`});
    }
  }
  polygons.sort((a,b)=>a.depth-b.depth);
  let coreLines="",connection="";
  if(technology) {
    const half=technologyTimeline.coreSize/2;
    const corners=Array.from({length:8},(_,index)=>new THREE.Vector3(coreCentre.x+((index&1)?half:-half),coreCentre.y+((index&2)?half:-half),coreCentre.z+((index&4)?half:-half)));
    for(const face of faces) {
      if(new THREE.Vector3(...face.normal).dot(direction)<=0)continue;
      const points=face.corners.map(index=>corners[index]);
      const centre=points.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).multiplyScalar(.25);
      const fill=face.kind==="top" ? (dark ? "#1a5e90" : "#12527f") : face.kind==="side" ? (dark ? "#0b304f" : "#06152b") : (dark ? "#124773" : "#0b2d50");
      polygons.push({depth:centre.dot(direction),svg:`<polygon points="${points.map(project).join(" ")}" fill="${fill}" fill-opacity=".94"/>`});
    }
    polygons.sort((a,b)=>a.depth-b.depth);
    coreLines=cubeEdges.map(([a,b])=>`<polyline points="${[corners[a],corners[b]].map(project).join(" ")}" fill="none" stroke="${dark ? "#66b6e8" : "#299bdd"}" stroke-width="1.2" stroke-opacity=".8"/>`).join("");
    connection=`<polyline points="${[coreCentre,connectionEnd].map(project).join(" ")}" fill="none" stroke="${dark ? "#66b6e8" : "#299bdd"}" stroke-width="1.2" stroke-dasharray="3 3" stroke-opacity=".6"/>`;
  }
  const lines=[...edges.values()].map(points=>`<polyline points="${points.map(project).join(" ")}" fill="none" stroke="${dark ? "#69c2ff" : "#388de0"}" stroke-opacity=".6" stroke-width="1.2"/>`).join("");
  const nodes=[...vertices.values()].map(point=>{const [x,y]=project(point).split(",");return `<circle cx="${x}" cy="${y}" r="2.5" fill="${dark ? "#78b0ff" : "#2384ef"}"/>`;}).join("");
  const p=logo.position.clone().project(camera),w=logo.scale.x/(camera.right-camera.left)*width,h=logo.scale.y/(camera.top-camera.bottom)*height;
  let svg=container.querySelector("svg.fallback");
  if(!svg){svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.classList.add("fallback");svg.setAttribute("aria-hidden","true");container.append(svg);}
  svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.setAttribute("preserveAspectRatio","none");
  svg.innerHTML=`<defs><radialGradient id="floor"><stop stop-color="#397cae" stop-opacity=".2"/><stop offset="1" stop-color="#397cae" stop-opacity="0"/></radialGradient></defs><ellipse cx="320" cy="405" rx="175" ry="42" fill="url(#floor)"/>${polygons.map(p=>p.svg).join("")}${lines}${nodes}${coreLines}${connection}<image href="${markUrl}" x="${(p.x+1)*width/2-w/2}" y="${(1-p.y)*height/2-h/2}" width="${w}" height="${h}"/>`;
  canvas.hidden=true;canvas.dataset.fallback="true";canvas.dataset.ready="true";canvas.dataset.settled="true";
  canvas.dataset.continuousRendering="false";canvas.dataset.theme=theme;canvas.dataset.view=view;
}

function resume() {
  if(disposed || userPaused || !inView || document.hidden || reduceMotion() || fallback) return;
  if(!started||reviewTime!==null&&!manualReplay)return;
  if(currentTime>=duration){/* Finite intro: no idle pulses after settlement. */return;}
  stopMotion(); startTime=performance.now()-currentTime*1000;
  canvas.dataset.continuousRendering="true"; raf=requestAnimationFrame(tick);
}
function onMotion() {
  activity?.setEnabled(!reduceMotion());
  if(reduceMotion()){stopMotion();applyState(duration);render();}
  else resume();
}
function onVisibility() {activity?.setVisible(inView&&!document.hidden);if(document.hidden)stopMotion();else resume();}
function onContextLost(event) {event.preventDefault();stopMotion();fallback=true;activity?.setEnabled(false);renderFallback();}
function heroControl(event){
  if(reduceMotion()||fallback)return;
  if(event.detail.action==="replay"){stopMotion();userPaused=false;manualReplay=true;started=true;applyState(0);render();resume();}
  else if(event.detail.action==="seek"){stopMotion();userPaused=true;manualReplay=true;applyState(THREE.MathUtils.clamp(Number(event.detail.time)||0,0,duration));render();}
  else{userPaused=!userPaused;container.dataset.sceneMode=userPaused?"paused":"playing";if(userPaused)stopMotion();else resume();}
}
function bindControls() {
  tracked(observeArtworkTuning(variant,value=>{tuning=value;palette();render();}));
  container.addEventListener("hero-control",heroControl);
  observer=new ResizeObserver(resize);observer.observe(container);observer.observe(hero);
  themeObserver=new MutationObserver(()=>{
    theme=document.documentElement.dataset.theme==="dark"?"dark":"light";palette();render();
  });
  themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  visibilityObserver=new IntersectionObserver(([entry])=>{
    inView=entry.isIntersecting;activity?.setVisible(inView&&!document.hidden);if(inView)resume();else stopMotion();
  },{threshold:0});
  visibilityObserver.observe(container);
  motionPreference.addEventListener("change",onMotion);
  document.addEventListener("visibilitychange",onVisibility);
  canvas.addEventListener("webglcontextlost",onContextLost);
}
function cleanup() {
  container.removeEventListener("hero-control",heroControl);
  disposed=true;stopMotion();observer?.disconnect();themeObserver?.disconnect();visibilityObserver?.disconnect();
  activity?.dispose();
  motionPreference.removeEventListener("change",onMotion);
  document.removeEventListener("visibilitychange",onVisibility);
  canvas.removeEventListener("webglcontextlost",onContextLost);
  container.querySelector("svg.fallback")?.remove();
  for(const resource of resources)resource.dispose();if(!options.shared)renderer?.dispose();
}
async function init() {
  scene = new THREE.Scene(); camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,40);
  camera.position.copy(frontPosition); camera.lookAt(target);
  try {
    if(options.static || new URLSearchParams(location.search).get("renderer")==="static")throw new Error("Static review requested");
    renderer = options.shared?.renderer ?? new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
    renderer.setClearColor(0x000000,0); renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
    if(options.shared)scene.environment=options.shared.environment;
    else scene.environment=tracked(createArtworkEnvironment(renderer)).texture;
    hemisphere=new THREE.HemisphereLight(0xe7f4ff,0x7192b3,1.8);scene.add(hemisphere);
    keyLight=new THREE.DirectionalLight(0xffffff,2.5);keyLight.position.set(-3,6,5);scene.add(keyLight);
    const fill=new THREE.DirectionalLight(0xb5dfff,.7);fill.position.set(4,3,-2);scene.add(fill);
    addArtworkSoftboxes(scene,target);
    createGeometry();await yieldToBrowser();if(disposed)return;createGround();createArrivals();await yieldToBrowser();if(disposed)return;createCore();
    scene.traverse(object=>{if(object.isLight)object.layers.enableAll();});
    const texture=options.shared?.texture ?? tracked(await new THREE.TextureLoader().loadAsync(markUrl));
    if(disposed)return;
    texture.colorSpace=THREE.SRGBColorSpace; texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
    logo=new THREE.Mesh(tracked(new THREE.PlaneGeometry(1,1)),tracked(new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.025,depthWrite:true,depthTest:true,toneMapped:false,side:THREE.DoubleSide})));
    logo.quaternion.copy(camera.quaternion);logo.layers.set(2);scene.add(logo);measureLogo(texture);
    const bounds=new THREE.LineSegments(tracked(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1,1))),tracked(new THREE.LineBasicMaterial({color:0x2894bc,transparent:true,opacity:.55})));
    bounds.position.copy(logo.position);bounds.quaternion.copy(logo.quaternion);bounds.scale.copy(logo.scale);bounds.layers.set(1);proof.add(bounds);
    if(technology)createBlur();
    if(!technology){
      const positions=[],seeds=[];for(let i=0;i<1100;i++){const r=Math.abs((Math.sin(i*127.1+311.7)*43758.5453)%1);positions.push(-2.7+r*4.4,.3+Math.floor(r*3)*.5,-1.5+(r*37%1)*.8);seeds.push(r);}
      const waveGeometry=tracked(new THREE.BufferGeometry());waveGeometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));waveGeometry.setAttribute("seed",new THREE.Float32BufferAttribute(seeds,1));
      const waveMaterial=tracked(new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uDark:{value:0}},vertexShader:`uniform float uTime;attribute float seed;varying float vAlpha;void main(){vec3 p=position;p.x+=uTime*.2;p.y+=sin(position.x*2.-uTime*1.2)*.14;vAlpha=smoothstep(.4,1.2,uTime)*(1.-smoothstep(4.,6.5,uTime))*(.2+seed*.3);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=1.+seed;}`,fragmentShader:`uniform float uDark;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.13,.40,.7),vec3(.55,.78,.95),uDark),vAlpha*(1.-smoothstep(.15,.5,r)));}`}));entranceWave=new THREE.Points(waveGeometry,waveMaterial);scene.add(entranceWave);
    }
    const nodePoints=[...vertices.values()],nodeKeys=new Map(nodePoints.map((p,index)=>[pointKey(p),index]));
    activity=createLatticeActivity({host:container,points:nodePoints.map(p=>p.toArray()),links:[...edges.values()].map(([a,b])=>[nodeKeys.get(pointKey(a)),nodeKeys.get(pointKey(b))]),
      project:index=>{const p=nodePoints[index].clone().project(camera),bounds=container.getBoundingClientRect();return {x:(p.x+1)*bounds.width/2,y:(1-p.y)*bounds.height/2,visible:nodePoints[index].clone().sub(target).dot(direction)>-.1};},
      onFrame:()=>{if(disposed)return;applyState(currentTime);render();}});
    activity.setEnabled(!reduceMotion());palette();await yieldToBrowser();if(disposed)return;camera.layers.enableAll();await renderer.compileAsync(scene,camera);await yieldToBrowser();if(disposed)return;if(technology){await renderer.compileAsync(compositeScene,compositeCamera);await renderer.compileAsync(gaussianScene,compositeCamera);}if(disposed)return;resize();bindControls();canvas.dataset.ready="true";play();
  } catch(error) {
    if(disposed)return;
    fallback=true;stopMotion();canvas.dataset.fallbackReason=error.message;
    if(!edges.size)createGeometry();
    if(!logo){const texture=tracked(await new THREE.TextureLoader().loadAsync(markUrl));logo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());logo.quaternion.copy(camera.quaternion);measureLogo(texture);}
    resize();bindControls();
  }
}
cleanup.ready=init();
cleanup.pause=()=>{stopMotion();activity?.setEnabled(false);};
cleanup.start=()=>{started=true;resume();};
cleanup.beginMorph=(width,height)=>{
  cleanup.pause();morphSurface={width:Math.ceil(width),height:Math.ceil(height)};
};
cleanup.morph=(mix,width,height)=>{
  if(disposed||fallback||!logo)return;
  morphState=[mix,width,height];
  if(!morphSurface)cleanup.beginMorph(width,height);
  currentTime=duration;
  assembled.visible=false;arrivalRoot.visible=true;proof.visible=false;
  connectionHighlights.forEach(({line,halos})=>{line.visible=false;halos.forEach(halo=>halo.visible=false);});
  const dark=theme==="dark";
  const positions=cellsAt(mix).map(point=>new THREE.Vector3(...point));
  arrivals.forEach((group,index)=>{group.visible=true;group.position.copy(positions[index]);group.rotation.set(0,0,0);});
  const keys=arrivalMaterials.map(({kind,cellIndex,point})=>kind+":"+point.clone().sub(new THREE.Vector3(...cells[cellIndex])).add(positions[cellIndex]).toArray().map(n=>n.toFixed(3)).join(","));
  const shares=new Map();keys.forEach(key=>shares.set(key,(shares.get(key)??0)+1));
  for(const [index,{material,base,kind,cellIndex,point}]of arrivalMaterials.entries()){
    const shared=shares.get(keys[index]);
    material.color.copy(base.color);material.opacity=weightedOpacity(base.userData.restOpacity,1/shared);
    const local=point.clone().sub(new THREE.Vector3(...cells[cellIndex]));
    if(kind==="node"&&(cellIndex===0||cellIndex===2)&&local.x>.4&&local.y>.4&&local.z>.4)material.color.lerp(new THREE.Color(0x48cfea),Math.sin(Math.PI*mix)*.65);
    if(kind==="face"&&base===materialGroups.internal)material.opacity=.02+.13*smooth(mix/.35);
    if(kind==="face"&&shared>1)material.opacity=.02/shared;
  }
  const aim=new THREE.Vector3(0,1+.6*mix,0);
  camera.position.copy(aim).add(frontPosition.clone().sub(target));camera.lookAt(aim);
  const aspect=width/height,homeFrame=Math.max(3.25,3.4/aspect),techFrame=Math.max(4.4,4.48/aspect);
  const framing=homeFrame+(techFrame-homeFrame)*mix;
  camera.left=-framing*aspect/2;camera.right=framing*aspect/2;camera.top=framing/2;camera.bottom=-framing/2;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  arrivals.forEach(group=>group.children.forEach(child=>{if(child.geometry?.type==="SphereGeometry"){const front=child.position.clone().add(group.position).sub(aim).dot(direction)>-.1;child.scale.setScalar(framing/height*(front?2.25:1.5)/.029);}}));
  groundObjects.forEach((mesh,index)=>mesh.position.set(positions[index].x,-.018,positions[index].z));
  floorReflection.position.set(0,-.025,0);
  const bounds=canvas.dataset.logoAlphaBounds.split(",").map(Number),image=logo.material.map.image;
  const alphaWidth=(bounds[2]-bounds[0]+1)/image.width,alphaHeight=(bounds[3]-bounds[1]+1)/image.height;
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
  const corners=positions.flatMap(p=>Array.from({length:8},(_,i)=>p.clone().add(new THREE.Vector3(i&1?.5:-.5,i&2?.5:-.5,i&4?.5:-.5))));
  const projected=corners.map(p=>p.dot(right)),scale=(Math.max(...projected)-Math.min(...projected))*(.43-.03*mix)/alphaWidth;
  const inkCentre=new THREE.Vector3((bounds[0]+bounds[2]+1)/(2*image.width)-.5,.5-(bounds[1]+bounds[3]+1)/(2*image.height),0);
  const anchor=new THREE.Vector3(.5,1.5,.5).lerp(new THREE.Vector3(0,3.28,0),mix).addScaledVector(direction,.3);
  logo.position.copy(anchor).sub(inkCentre.multiplyScalar(scale).applyQuaternion(camera.quaternion));logo.scale.setScalar(scale);logo.material.opacity=1;logo.visible=true;
  const coreReveal=smooth((mix-.22)/.5);core.visible=mix>.001;core.position.copy(coreCentre);
  for(const {material,base}of illuminatedMaterials)if(Object.keys(materialGroups).some(key=>key.startsWith("core-")&&materialGroups[key]===base))material.opacity=coreReveal*.96;
  coreEdge.material.opacity=coreReveal*.8;coreConnection.visible=mix>.25;
  const endpoint=anchor.clone().addScaledVector(up,-alphaHeight*scale/2-.045);
  coreConnection.geometry.setFromPoints([coreCentre,coreCentre.clone().lerp(endpoint,smooth((mix-.3)/.6))]);updateLineDistance(coreConnection.geometry);coreConnection.material.opacity=coreReveal*.6;
  groundMaterials.forEach(material=>material.opacity=dark?.24:.48);
  sizeHeroSurface(renderer,technology?[blurTarget,blurX,blurY]:[],morphSurface.width,morphSurface.height,quality.ratio);
  canvas.dataset.transitionMix=mix.toFixed(4);render();
};
return cleanup;
}
