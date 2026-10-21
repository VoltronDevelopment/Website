import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import {glassFace,setGlass,strokeMaterial,stroke,nodeHaloTexture,type GlassFace} from "./lattice-materials";
import {junctionPulse} from "./lattice-lighting";
import {createLatticeActivity} from "./lattice-activity";

export type CubeKind = "enclosure" | "lot" | "philosophy";
type Options = {kind: CubeKind; active: boolean; sequence?:number};

export function mountCubes(canvas: HTMLCanvasElement, host: HTMLDivElement, options: Options) {
  const pixelProof=new URLSearchParams(location.search).get("diagnostics")==="pixels";
  canvas.hidden=false;
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,40);
  camera.position.set(6,4.8,7);camera.lookAt(0,options.kind==="philosophy" ? .65 : 0,0);
  const resources: {dispose: () => void}[]=[];
  const track=<T extends {dispose: () => void}>(value: T): T => {resources.push(value);return value;};
  const root=new THREE.Group();scene.add(root);
  const materials: {material: THREE.MeshPhongMaterial | THREE.MeshPhysicalMaterial | THREE.LineBasicMaterial | LineMaterial; role: "glass" | "solid" | "edge" | "node";faceKind?:GlassFace;point?:THREE.Vector3}[]=[];
  const cubes: {group: THREE.Group; target: number; delay: number; size:number}[]=[];
  const nodeAccents:{node:THREE.Mesh;halo:THREE.Sprite;point:THREE.Vector3;highlight:THREE.Mesh}[]=[];
  const sequenceDelay=options.kind==="enclosure"?(options.sequence??0)*1.4:0;
  const duration=options.kind==="philosophy"?5:options.kind==="enclosure"?sequenceDelay+6.5:2.4;
  const ease=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
  let renderer: THREE.WebGLRenderer | undefined;
  let prepared=false;
  let activity:ReturnType<typeof createLatticeActivity>|undefined;
  let frame=0, elapsed=0, previous=0, visible=false, disposed=false, fallback=false;
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let active=options.active;
  const dark=() => document.documentElement.dataset.theme==="dark";
  const addCube=(size: number, y: number, solid=false, delay=0) => {
    const group=new THREE.Group();group.position.y=y;root.add(group);cubes.push({group,target:y,delay,size});
    const geometry=track(new THREE.BoxGeometry(size,size,size));
    if(options.kind==="enclosure"){
      const panes:GlassFace[]=["side","rear","top","bottom","front","rear"];
      group.add(new THREE.Mesh(geometry,panes.map(faceKind=>{const material=track(glassFace(faceKind,dark()));materials.push({material,role:"glass",faceKind});return material;})));
      const corners=Array.from({length:8},(_,i)=>new THREE.Vector3((i&1?1:-1)*size/2,(i&2?1:-1)*size/2,(i&4?1:-1)*size/2));
      const pairs=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
      for(const [a,b] of pairs){const point=corners[a].clone().add(corners[b]).multiplyScalar(.5);const material=track(strokeMaterial(true));materials.push({material,role:"edge",point});const line=stroke([corners[a],corners[b]],material);track(line.geometry);group.add(line);}
    }else{
      const face=track(new THREE.MeshPhongMaterial({transparent:true,opacity:solid ? 1 : .12,depthWrite:solid,shininess:90,specular:0xd8efff,side:THREE.DoubleSide}));
      materials.push({material:face,role:solid ? "solid" : "glass"});group.add(new THREE.Mesh(geometry,face));
      const edge=track(new THREE.LineBasicMaterial({transparent:true,opacity:.65,depthWrite:false}));
      materials.push({material:edge,role:"edge"});group.add(new THREE.LineSegments(track(new THREE.EdgesGeometry(geometry)),edge));
    }
    if(!solid){
      const nodeMaterial=track(new THREE.MeshPhongMaterial({transparent:true,opacity:.9}));
      if(options.kind!=="enclosure")materials.push({material:nodeMaterial,role:"node"});
      const nodeGeometry=track(new THREE.SphereGeometry(options.kind==="philosophy" ? .015 : .026,10,6));
      const haloTexture=options.kind==="enclosure"?track(nodeHaloTexture()):null;
      for(let i=0;i<8;i++){
        const point=new THREE.Vector3((i&1?1:-1)*size/2,(i&2?1:-1)*size/2,(i&4?1:-1)*size/2);
        const material=options.kind==="enclosure"?track(nodeMaterial.clone()):nodeMaterial;
        const node=new THREE.Mesh(nodeGeometry,material);node.position.copy(point);group.add(node);
        if(haloTexture){
          materials.push({material,role:"node",point});
          const halo=new THREE.Sprite(track(new THREE.SpriteMaterial({map:haloTexture,transparent:true,opacity:0,depthWrite:false,toneMapped:false})));halo.position.copy(point);group.add(halo);
          const highlight=new THREE.Mesh(track(new THREE.SphereGeometry(.008,8,6)),track(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.65,depthWrite:false,toneMapped:false})));
          highlight.position.set(-.007,.01,.022);node.add(highlight);
          nodeAccents.push({node,halo,point,highlight});
        }
      }
    }
  };
  if(options.kind==="philosophy") {addCube(2.1,0);addCube(.7,0,true,.25);addCube(.36,2.3,true,.55);}
  else {addCube(1.65,0);if(options.kind==="lot"){
    const nodeMaterial=track(new THREE.MeshPhongMaterial({color:0x2894bc}));materials.push({material:nodeMaterial,role:"node"});
    const node=new THREE.Mesh(track(new THREE.SphereGeometry(.065,16,12)),nodeMaterial);node.position.set(0,.87,0);root.add(node);
  }}
  const signalNodes=nodeAccents.map(node=>node.point).sort((a,b)=>b.dot(camera.position)-a.dot(camera.position)).slice(0,3);
  scene.add(new THREE.HemisphereLight(0xeaf6ff,0x314d6b,2));
  const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(-4,6,4);scene.add(key);
  const fill=new THREE.DirectionalLight(0x81c9ff,.65);fill.position.set(4,1,3);scene.add(fill);
  let assetMaterial:THREE.MeshBasicMaterial | undefined;
  let resolveAsset:()=>void=()=>{};
  const assetReady=new Promise<void>(resolve=>{resolveAsset=resolve;});
  const assetImage=options.kind==="enclosure"?host.querySelector("img"):null;
  if(assetImage){
    new THREE.TextureLoader().load(assetImage.currentSrc || assetImage.src,texture=>{
      if(disposed){texture.dispose();resolveAsset();return;}
      track(texture);texture.colorSpace=THREE.SRGBColorSpace;
      assetMaterial=track(new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0,alphaTest:.03,depthWrite:true,depthTest:true,toneMapped:false}));
      const source=document.createElement("canvas");source.width=source.height=256;
      const context=source.getContext("2d",{willReadFrequently:true})!;
      context.drawImage(texture.image,0,0,256,256);
      const pixels=context.getImageData(0,0,256,256).data;
      let minX=256,minY=256,maxX=0,maxY=0;
      for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(pixels[(y*256+x)*4+3]>16){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
      const visibleWidth=Math.max(1,maxX-minX+1),visibleHeight=Math.max(1,maxY-minY+1);
      texture.repeat.set(visibleWidth/256,visibleHeight/256);texture.offset.set(minX/256,1-(maxY+1)/256);
      const aspect=visibleWidth/visibleHeight;
      const artwork=new THREE.Mesh(track(new THREE.PlaneGeometry(1.26*Math.min(aspect,1),1.26/Math.max(aspect,1))),assetMaterial);
      artwork.renderOrder=-1;
      camera.updateMatrixWorld();artwork.quaternion.copy(camera.quaternion);
      // Keep the artwork stationary inside the turning enclosure, with real depth occlusion.
      scene.add(artwork);resolveAsset();
    },undefined,()=>{resolveAsset();});
  }else resolveAsset();

  function palette(){
    for(const {material,role,faceKind} of materials){
      material.color.set(role==="solid" ? dark()?0x73afd0:0x68a5cb : role==="glass" ? dark()?0x22668c:0xadddf9 : role==="node" ? dark()?0x78b0ff:0x168cee : dark()?0x72b3d4:0x397cae);
      if(role==="glass")material.opacity=dark()?.13:.15;
      if(role==="edge")material.opacity=active?.95:.56;
      if(role==="solid")material.opacity=1;
      if(role==="node")material.opacity=.9;
      if(faceKind && material instanceof THREE.MeshPhysicalMaterial)setGlass(material,faceKind,dark());
      if(role==="node" && material instanceof THREE.MeshPhongMaterial){material.emissive.set(active?0x246bd4:0x000000);material.emissiveIntensity=.3;}
      material.userData.baseOpacity=material.opacity;
    }
    state();render();
  }
  function renderFallback(){
    camera.updateMatrixWorld();root.updateMatrixWorld(true);
    const project=(point: THREE.Vector3) => {const p=point.project(camera);return `${(p.x+1)*320},${(1-p.y)*240}`;};
    const faces=[[2,6,7,3],[1,3,7,5],[4,5,7,6]];
    const polygons=cubes.map(({group},index)=>{
      const size=cubes[index].size;
      const corners=Array.from({length:8},(_,i)=>new THREE.Vector3((i&1?1:-1)*size/2,(i&2?1:-1)*size/2,(i&4?1:-1)*size/2).add(new THREE.Vector3(0,cubes[index].target,0)));
      return faces.map((face,j)=>`<polygon points="${face.map(i=>project(corners[i].clone())).join(" ")}" fill="${dark()?"#22668c":"#83c4ed"}" fill-opacity="${index? .6+j*.12:.12}" stroke="${dark()?"#72b3d4":"#397cae"}" stroke-width="1.2"/>`).join("");
    }).join("");
    let svg=host.querySelector("svg");
    if(!svg){svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("aria-hidden","true");host.prepend(svg);}
    svg.setAttribute("viewBox","0 0 640 480");svg.setAttribute("preserveAspectRatio","none");svg.innerHTML=polygons;
    canvas.hidden=true;canvas.dataset.fallback="true";canvas.dataset.settled="true";
    delete host.dataset.assetLayer;
    host.style.setProperty("--asset-reveal","1");
  }
  function render(){
    if(disposed)return;
    if(fallback){renderFallback();return;}
    if(!prepared)return;
    renderer?.render(scene,camera);
    canvas.dataset.ready="true";canvas.dataset.theme=dark()?"dark":"light";
    canvas.dataset.animationTime=elapsed.toFixed(2);
    canvas.dataset.settled=String(elapsed>=duration || motion.matches);
    if(pixelProof && renderer && !canvas.dataset.nonblankSamples && (elapsed>=duration || motion.matches)) {
      const gl=renderer.getContext(),pixels=new Uint8Array(canvas.width*canvas.height*4);
      gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      let count=0;for(let i=3;i<pixels.length;i+=64)if(pixels[i]>20)count++;
      canvas.dataset.nonblankSamples=String(count);
    }
  }
  function stop(){cancelAnimationFrame(frame);frame=0;previous=0;canvas.dataset.continuousRendering="false";}
  function state(){
    if(options.kind==="enclosure"){
      const time=motion.matches?6.5:elapsed-sequenceDelay;
      const asset=ease(time/.8),reveal=ease((time-.9)/1.1);
      const turn=ease((time-2.1)/2.4);
      const glow=motion.matches?0:junctionPulse(time,4.6,.14,.65);
      const lightAt=(point:THREE.Vector3)=>motion.matches?0:Math.max(...signalNodes.map((node,index)=>junctionPulse(time,4.6+index*.12,.14,.65)*Math.max(0,1-point.distanceTo(node)/.85)),activity?.strength(point.toArray())??0);
      host.style.setProperty("--asset-reveal",String(asset));
      if(assetMaterial)assetMaterial.opacity=asset;
      root.rotation.y=turn*Math.PI*2;
      cubes[0].group.visible=reveal>.001;
      cubes[0].group.scale.setScalar(.9+.1*reveal);
      for(const {material,role,point} of materials){
        const front=!point || point.clone().applyAxisAngle(new THREE.Vector3(0,1,0),root.rotation.y).dot(camera.position)>.1;
        const pulse=point?lightAt(point):Math.max(glow,activity?.strength([0,.5,.5])??0)*.2;
        if(material instanceof LineMaterial){material.userData.cssWidth=front?1.4:.8;material.color.setHex(front?(dark()?0x76b5f2:0x3284e8):(dark()?0x40769d:0x619bc5));}
        material.opacity=Math.min(1,(role==="edge"?(front?.8:.3):role==="node"?(front?.98:.35):(material.userData.baseOpacity??1))*reveal*(role==="edge"?1+pulse*.35:1));
        if(material instanceof THREE.MeshPhongMaterial || material instanceof THREE.MeshPhysicalMaterial){
          material.emissive.set(0x246bd4);
          material.emissiveIntensity=pulse*(role==="glass"?.2:.65);
        }
      }
      nodeAccents.forEach(({halo,point,highlight})=>{
        const pulse=lightAt(point);
        halo.visible=pulse>.001;halo.material.opacity=pulse*(dark()?.35:.22)*reveal;
        (highlight.material as THREE.Material).opacity=reveal*.65;
      });
      canvas.dataset.phase=time<.9?"asset":time<2.1?"enclose":time<4.5?"rotate":time<6.5?"glow":"settled";
      return;
    }
    cubes.forEach(({group,target,delay},index)=>{
      if(options.kind!=="philosophy"){
        const t=motion.matches?1:Math.max(0,Math.min(1,(elapsed-delay)/1.5));group.position.y=target+(1-t)**3*.3;group.rotation.y=(1-t)*.06;group.scale.setScalar(.97+.03*t);return;
      }
      const reveal=motion.matches?1:index===0?ease(elapsed/1.05):index===1?ease((elapsed-1.2)/1.6):ease((elapsed-2.9)/.35);
      group.visible=reveal>.001;
      group.position.y=index===2?target*(motion.matches?1:ease((elapsed-3.15)/1.85)):target+(index===0?.14:0)*(1-reveal);
      group.rotation.y=index===0?(1-reveal)*.03:0;group.scale.setScalar(.94+.06*reveal);
      group.traverse(object=>{
        if(object instanceof THREE.Mesh || object instanceof THREE.LineSegments){
          const material=object.material as THREE.Material;
          material.opacity=(material.userData.baseOpacity??1)*reveal;
        }
      });
    });
  }
  function tick(now: number){
    if(!visible || document.hidden || disposed){stop();return;}
    const asset=host.querySelector("img");
    if(options.kind==="enclosure" && asset && !asset.complete){previous=0;frame=requestAnimationFrame(tick);return;}
    elapsed=Math.min(duration,elapsed+(previous ? (now-previous)/1000 : 0));previous=now;state();render();
    if(elapsed<duration)frame=requestAnimationFrame(tick);else {stop();activity?.arm();}
  }
  function resume(){
    stop();if(motion.matches){elapsed=duration;state();render();return;}
    if(prepared && visible && !document.hidden && !fallback){if(elapsed<duration){canvas.dataset.continuousRendering="true";frame=requestAnimationFrame(tick);}else activity?.arm();}
  }
  function resize(){
    const {width,height}=host.getBoundingClientRect();if(!width || !height)return;
    const aspect=width/height;
    const extent=options.kind==="philosophy" ? Math.max(4.8,3.6/aspect) : options.kind==="enclosure"?Math.max(2.55,2.55/aspect):Math.max(2.8,2.8/aspect);
    camera.left=-extent*aspect/2;camera.right=extent*aspect/2;camera.top=extent/2;camera.bottom=-extent/2;camera.updateProjectionMatrix();
    nodeAccents.forEach(({node,halo})=>{node.scale.setScalar(extent/height*2.25/.026);halo.scale.setScalar(extent/height*17);});
    camera.updateMatrixWorld();
    host.dataset.pointerTargets=JSON.stringify(nodeAccents.filter(({point})=>point.dot(camera.position)>.1).map(({point})=>{const p=point.clone().project(camera);return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};}));
    renderer?.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer?.setSize(width,height,false);render();
  }
  function preference(){activity?.setEnabled(!motion.matches);if(motion.matches){elapsed=duration;state();}resume();render();}
  function visibility(){activity?.setVisible(visible&&!document.hidden);if(document.hidden)stop();else resume();}
  function lost(event: Event){event.preventDefault();stop();fallback=true;activity?.setEnabled(false);renderFallback();}
  try {
    if(new URLSearchParams(location.search).get("renderer")==="static")throw new Error("Static illustration requested");
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    if(options.kind==="enclosure"){
      const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
      scene.environment=track(pmrem.fromScene(environment,.12)).texture;environment.dispose();pmrem.dispose();
    }
  }
  catch {fallback=true;}
  if(options.kind==="enclosure" && !fallback){
    const links:[number,number][]=[];
    nodeAccents.forEach(({point},a)=>nodeAccents.forEach(({point:other},b)=>{if(b>a && Math.abs(point.distanceTo(other)-1.65)<.001)links.push([a,b]);}));
    activity=createLatticeActivity({host,points:nodeAccents.map(n=>n.point.toArray()),links,
      project:index=>{root.updateMatrixWorld(true);const point=nodeAccents[index].point.clone().applyMatrix4(root.matrixWorld),p=point.clone().project(camera),bounds=host.getBoundingClientRect();return {x:(p.x+1)*bounds.width/2,y:(1-p.y)*bounds.height/2,visible:point.dot(camera.position)>.1};},
      onFrame:()=>{if(disposed)return;state();render();}});
  }
  const sizing=new ResizeObserver(resize);sizing.observe(host);
  const themes=new MutationObserver(palette);themes.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;activity?.setVisible(visible&&!document.hidden);resume();},{threshold:0});view.observe(host);
  motion.addEventListener("change",preference);document.addEventListener("visibilitychange",visibility);canvas.addEventListener("webglcontextlost",lost);
  canvas.dataset.kind=options.kind;canvas.dataset.cubes=String(cubes.length);state();palette();resize();
  activity?.setEnabled(!motion.matches);
  let cancelPreparation:()=>void=()=>{};
  const cancelled=new Promise<void>(resolve=>{cancelPreparation=resolve;});
  const preparing=(async()=>{
    await assetReady;if(disposed)return;
    if(!fallback&&renderer){
      const visibility=new Map<THREE.Object3D,boolean>();scene.traverse(object=>{visibility.set(object,object.visible);object.visible=true;});
      try{await renderer.compileAsync(scene,camera);}catch{fallback=true;}
      finally{visibility.forEach((value,object)=>{object.visible=value;});}
    }
    if(disposed)return;prepared=true;
    if(assetMaterial&&!fallback)host.dataset.assetLayer="three";
    state();render();resume();
  })();
  const ready=Promise.race([preparing,cancelled]);
  return {
    ready,
    setActive(value: boolean){active=value;palette();},
    dispose(){disposed=true;cancelPreparation();resolveAsset();stop();activity?.dispose();sizing.disconnect();themes.disconnect();view.disconnect();motion.removeEventListener("change",preference);document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("webglcontextlost",lost);host.querySelector("svg")?.remove();resources.forEach(resource=>resource.dispose());renderer?.dispose();},
  };
}
