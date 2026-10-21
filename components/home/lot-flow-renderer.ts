import * as THREE from "three";

export type LotFlowController = ReturnType<typeof mountLotFlow>;
const stageStep=2.8;
const travelTime=1.35;
const cycle=stageStep*5;
const ease=(t:number)=>t*t*(3-2*t);

export function mountLotFlow(canvas:HTMLCanvasElement,host:HTMLDivElement,initialSelected:number){
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,4000);
  camera.position.set(600,480,700);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);
  const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
  const vertical=new THREE.Vector3(0,1,0);
  const beltAxis=right.clone().applyAxisAngle(vertical,-.18);
  const beltDepth=new THREE.Vector3().crossVectors(beltAxis,vertical);
  const pathOrigin=new THREE.Vector3();
  const geometry=new THREE.BoxGeometry(1,1,1);
  const edges=new THREE.EdgesGeometry(geometry);
  const nodeGeometry=new THREE.SphereGeometry(.018,10,6);
  const signalGeometry=new THREE.SphereGeometry(.04,12,8);
  const haloCanvas=document.createElement("canvas");haloCanvas.width=64;haloCanvas.height=64;
  const haloContext=haloCanvas.getContext("2d")!;
  const haloGradient=haloContext.createRadialGradient(32,32,0,32,32,32);
  haloGradient.addColorStop(0,"rgba(255,255,255,.8)");haloGradient.addColorStop(.25,"rgba(255,255,255,.5)");haloGradient.addColorStop(1,"rgba(255,255,255,0)");
  haloContext.fillStyle=haloGradient;haloContext.fillRect(0,0,64,64);
  const haloTexture=new THREE.CanvasTexture(haloCanvas);
  const shadowGeometry=new THREE.CircleGeometry(.5,24);
  const shadowMaterial=new THREE.MeshBasicMaterial({color:0x224d6b,transparent:true,opacity:.16,depthWrite:false});
  // Keep the cube's silhouette clear against the transparent conveyor below it.
  const occluderMaterial=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,depthTest:true});
  const lots=Array.from({length:5},()=>{
    const group=new THREE.Group();scene.add(group);
    const shadow=new THREE.Mesh(shadowGeometry,shadowMaterial);shadow.rotation.x=-Math.PI/2;scene.add(shadow);
    group.add(new THREE.Mesh(geometry,occluderMaterial));
    const face=new THREE.MeshPhongMaterial({transparent:true,depthWrite:true,shininess:90,side:THREE.DoubleSide});
    const edge=new THREE.LineBasicMaterial({transparent:true,depthWrite:false});
    const node=new THREE.MeshPhongMaterial({transparent:true});
    group.add(new THREE.Mesh(geometry,face),new THREE.LineSegments(edges,edge));
    for(let i=0;i<8;i++){
      const junction=new THREE.Mesh(nodeGeometry,node);
      junction.position.set((i&1?1:-1)/2,(i&2?1:-1)/2,(i&4?1:-1)/2);group.add(junction);
    }
    const signalMaterial=new THREE.MeshBasicMaterial({color:0x168cee,transparent:true});
    const signal=new THREE.Mesh(signalGeometry,signalMaterial);signal.position.y=.53;group.add(signal);
    const haloMaterial=new THREE.SpriteMaterial({map:haloTexture,color:0x168cee,transparent:true,depthWrite:false});
    const halo=new THREE.Sprite(haloMaterial);halo.position.copy(signal.position);group.add(halo);
    return {group,face,edge,node,shadow,signalMaterial,haloMaterial,halo,stage:0,dwelling:false};
  });
  const conveyor=new THREE.Group();conveyor.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(beltAxis,vertical,beltDepth));scene.add(conveyor);
  const beltMaterial=new THREE.MeshPhongMaterial({color:0xadddf9,shininess:90,transparent:true,opacity:.1,depthWrite:false});
  const railMaterial=new THREE.MeshPhongMaterial({color:0xadddf9,shininess:100,transparent:true,opacity:.12,depthWrite:false});
  const rollerMaterial=new THREE.MeshPhongMaterial({color:0xc4e7fa,shininess:100,transparent:true,opacity:.14,depthWrite:false});
  const outlineMaterial=new THREE.LineBasicMaterial({color:0x397cae,transparent:true,opacity:.38,depthWrite:false});
  const conveyorParts:THREE.BufferGeometry[]=[];
  const rollers:THREE.Mesh[]=[];
  function buildConveyor(){
    conveyor.clear();conveyorParts.forEach(part=>part.dispose());conveyorParts.length=0;rollers.length=0;
    const box=(w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material)=>{
      const shape=new THREE.BoxGeometry(w,h,d);conveyorParts.push(shape);
      const mesh=new THREE.Mesh(shape,material);mesh.position.set(x,y,z);conveyor.add(mesh);
      const wire=new THREE.EdgesGeometry(shape);conveyorParts.push(wire);const outline=new THREE.LineSegments(wire,outlineMaterial);outline.position.copy(mesh.position);conveyor.add(outline);return mesh;
    };
    const length=width/beltAxis.dot(right);
    box(length,size*.12,size*1.65,0,0,0,beltMaterial);
    for(const z of [-size*.84,size*.84])box(length,size*.045,size*.025,0,size*.08,z,railMaterial);
    for(let x=-length/2+size*.2;x<length/2;x+=size*.4){
      const shape=new THREE.CylinderGeometry(size*.02,size*.02,size*1.6,10);conveyorParts.push(shape);
      const roller=new THREE.Mesh(shape,rollerMaterial);roller.rotation.x=Math.PI/2;roller.position.set(x,size*.065,0);conveyor.add(roller);rollers.push(roller);
      const line=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,size*.085,-size*.8),new THREE.Vector3(x,size*.085,size*.8)]);conveyorParts.push(line);conveyor.add(new THREE.Line(line,outlineMaterial));
    }
    for(const anchor of anchors){
      for(const z of [-size*.72,size*.72]){
        box(size*.035,size*.34,size*.035,(anchor.x-width/2)/beltAxis.dot(right),-size*.23,z,railMaterial);
      }
    }
    pathOrigin.copy(up).multiplyScalar(height/2-anchors[0].y);
    conveyor.position.copy(pathOrigin).addScaledVector(vertical,-size*.585);
  }
  scene.add(new THREE.HemisphereLight(0xeaf6ff,0x314d6b,2));
  const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(-4,6,4);scene.add(key);
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let renderer:THREE.WebGLRenderer|undefined;
  let selected=initialSelected,width=1,height=1,size=1,elapsed=0,previous=0,frame=0;
  let visible=false,disposed=false,fallback=false;
  let anchors:THREE.Vector2[]=[];
  let processStage=-2;
  const stationButtons=Array.from(host.parentElement?.querySelectorAll<HTMLButtonElement>(".home-lot-stages button")??[]);
  function updateStation(value:number){
    if(processStage===value)return;
    processStage=value;
    stationButtons.forEach((button,index)=>{button.dataset.processActive=String(index===value);});
    canvas.dataset.processStage=value<0?"transit":String(value);
  }
  const dark=()=>document.documentElement.dataset.theme==="dark";
  function palette(){
    shadowMaterial.color.set(dark()?0x07141f:0x224d6b);
    beltMaterial.color.set(dark()?0x22668c:0xadddf9);
    railMaterial.color.copy(beltMaterial.color);rollerMaterial.color.copy(beltMaterial.color);
    outlineMaterial.color.set(dark()?0x72b3d4:0x397cae);
    lots.forEach((lot,index)=>{
      const active=lot.stage===selected;
      lot.face.color.set(dark()?0x22668c:0xadddf9);lot.face.opacity=dark()?.13:.15;
      lot.edge.color.set(dark()?0x72b3d4:0x397cae);lot.edge.opacity=active?.95:.56;
      lot.node.color.set(dark()?0x78b0ff:0x168cee);lot.node.opacity=.9;
      lot.node.emissive.set(active?0x246bd4:0);lot.node.emissiveIntensity=.3;
      const pulse=motion.matches || fallback?.5:(Math.sin(elapsed*4-index*.35)+1)/2;
      lot.signalMaterial.color.set(dark()?0x65caff:0x168cee);
      lot.signalMaterial.opacity=lot.dwelling?1:.65;
      lot.haloMaterial.color.copy(lot.signalMaterial.color);
      lot.haloMaterial.blending=dark()?THREE.AdditiveBlending:THREE.NormalBlending;
      lot.haloMaterial.opacity=lot.dwelling?.3+pulse*.35:.08;
      lot.halo.scale.setScalar(lot.dwelling?.2+pulse*.08:.16);
    });
  }
  function place(group:THREE.Group,point:THREE.Vector2){
    group.position.copy(pathOrigin).addScaledVector(beltAxis,(point.x-width/2)/beltAxis.dot(right));
    group.scale.setScalar(size);
  }
  function state(){
    if(anchors.length!==4)return;
    lots.forEach((lot,index)=>{
      if(motion.matches || fallback){lot.group.visible=index<4;lot.stage=index;lot.dwelling=true;place(lot.group,anchors[Math.min(index,3)]);return;}
      const age=elapsed-index*stageStep;
      lot.group.visible=age>=0;
      if(age<0)return;
      const time=age%cycle,segment=Math.min(4,Math.floor(time/stageStep));
      const t=ease(Math.min(1,(time-segment*stageStep)/travelTime));
      lot.dwelling=segment<4 && t===1;
      const from=segment===0?new THREE.Vector2(-size,anchors[0].y):anchors[segment-1];
      const to=segment===4?new THREE.Vector2(width+size,anchors[3].y):anchors[segment];
      const point=from.clone().lerp(to,t);
      lot.stage=Math.min(segment,3);place(lot.group,point);
    });
    const leadTime=elapsed%cycle,leadSegment=Math.floor(leadTime/stageStep),arrived=leadTime%stageStep>=travelTime;
    updateStation(motion.matches || fallback?selected:leadSegment===4?(arrived?-1:3):arrived?leadSegment:leadSegment-1);
    lots.forEach(lot=>{lot.shadow.visible=lot.group.visible;lot.shadow.position.copy(lot.group.position).addScaledVector(vertical,-size*.499);lot.shadow.scale.set(size*1.05,size*1.05,1);});
    const moving=elapsed%stageStep<travelTime;
    rollers.forEach(roller=>{roller.rotation.y=motion.matches?0:Math.floor(elapsed/stageStep)*travelTime*2+Math.min(elapsed%stageStep,travelTime)*2;});
    canvas.dataset.belt=moving && !motion.matches?"moving":"stopped";
    palette();
  }
  function renderFallback(){
    camera.updateMatrixWorld();scene.updateMatrixWorld(true);
    const project=(p:THREE.Vector3)=>{p.project(camera);return `${(p.x+1)*width/2},${(1-p.y)*height/2}`;};
    const polygons=lots.filter(lot=>lot.group.visible).map(lot=>{
      const corners=Array.from({length:8},(_,i)=>new THREE.Vector3((i&1?1:-1)/2,(i&2?1:-1)/2,(i&4?1:-1)/2).applyMatrix4(lot.group.matrixWorld));
      return [[2,6,7,3],[1,3,7,5],[4,5,7,6]].map((face,index)=>`<polygon points="${face.map(i=>project(corners[i].clone())).join(" ")}" fill="${dark()?"#22668c":"#adddf9"}" fill-opacity="${.1+index*.04}" stroke="${dark()?"#72b3d4":"#397cae"}" stroke-width="1.2"/>`).join("");
    }).join("");
    let svg=host.querySelector("svg");
    if(!svg){svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("aria-hidden","true");host.prepend(svg);}
    const belt=conveyor.children.filter((part):part is THREE.Mesh=>part instanceof THREE.Mesh && part.geometry.type==="BoxGeometry").map(part=>{
      part.geometry.computeBoundingBox();const bounds=part.geometry.boundingBox!;
      const corners=Array.from({length:8},(_,i)=>new THREE.Vector3(i&1?bounds.max.x:bounds.min.x,i&2?bounds.max.y:bounds.min.y,i&4?bounds.max.z:bounds.min.z).applyMatrix4(part.matrixWorld));
      return [[2,6,7,3],[0,4,6,2],[4,5,7,6]].map(face=>`<polygon points="${face.map(i=>project(corners[i].clone())).join(" ")}" fill="${dark()?"#22668c":"#adddf9"}" fill-opacity=".08" stroke="${dark()?"#72b3d4":"#397cae"}" stroke-opacity=".38" stroke-width="1"/>`).join("");
    }).join("");
    svg.setAttribute("viewBox",`0 0 ${width} ${height}`);svg.innerHTML=belt+polygons;canvas.hidden=true;
  }
  function render(){
    if(disposed)return;
    if(fallback)renderFallback();else renderer?.render(scene,camera);
    canvas.dataset.ready="true";canvas.dataset.animationTime=elapsed.toFixed(2);
    canvas.dataset.theme=dark()?"dark":"light";canvas.dataset.motion=motion.matches?"reduced":"full";
  }
  function stop(){cancelAnimationFrame(frame);frame=0;previous=0;canvas.dataset.continuousRendering="false";}
  function tick(now:number){
    if(!visible || document.hidden || disposed){stop();return;}
    elapsed+=previous?(now-previous)/1000:0;previous=now;state();render();frame=requestAnimationFrame(tick);
  }
  function resume(){
    stop();state();render();
    if(visible && !document.hidden && !motion.matches && !fallback){canvas.dataset.continuousRendering="true";frame=requestAnimationFrame(tick);}
  }
  function resize(){
    const bounds=host.getBoundingClientRect();width=bounds.width;height=bounds.height;if(!width || !height)return;
    const stages=Array.from(host.parentElement?.querySelectorAll<HTMLElement>("[data-lot-anchor]")??[]);
    anchors=stages.map(stage=>{const r=stage.getBoundingClientRect();return new THREE.Vector2(r.left-bounds.left+r.width/2,r.top-bounds.top+r.height/2);});
    size=(stages[0]?.getBoundingClientRect().height??300)*.29;
    if(anchors.length===4)buildConveyor();
    camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();
    renderer?.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer?.setSize(width,height,false);state();render();
  }
  function theme(){palette();render();}
  function visibility(){if(document.hidden)stop();else resume();}
  function lost(event:Event){event.preventDefault();stop();fallback=true;state();render();}
  try{
    if(new URLSearchParams(location.search).get("renderer")==="static")throw new Error("Static illustration requested");
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  }catch{fallback=true;canvas.dataset.fallback="true";}
  const sizing=new ResizeObserver(resize);sizing.observe(host);
  const themes=new MutationObserver(theme);themes.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();},{threshold:.1});view.observe(host);
  motion.addEventListener("change",resume);document.addEventListener("visibilitychange",visibility);canvas.addEventListener("webglcontextlost",lost);
  canvas.dataset.kind="lot-flow";canvas.dataset.cubes="5";resize();
  return {
    setSelected(value:number){selected=value;if(motion.matches || fallback)updateStation(value);palette();render();},
    dispose(){disposed=true;stop();sizing.disconnect();themes.disconnect();view.disconnect();motion.removeEventListener("change",resume);document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("webglcontextlost",lost);host.querySelector("svg")?.remove();stationButtons.forEach(button=>delete button.dataset.processActive);lots.forEach(lot=>{lot.face.dispose();lot.edge.dispose();lot.node.dispose();lot.signalMaterial.dispose();lot.haloMaterial.dispose();});haloTexture.dispose();shadowGeometry.dispose();shadowMaterial.dispose();occluderMaterial.dispose();conveyorParts.forEach(part=>part.dispose());beltMaterial.dispose();railMaterial.dispose();rollerMaterial.dispose();outlineMaterial.dispose();geometry.dispose();edges.dispose();nodeGeometry.dispose();signalGeometry.dispose();renderer?.dispose();},
  };
}
