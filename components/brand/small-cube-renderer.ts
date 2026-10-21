import * as THREE from "three";
import {glassFace,setGlass,type GlassFace} from "../home/lattice-materials";

// Small diagrams share one offscreen renderer to avoid exhausting browser WebGL contexts.
let shared:THREE.WebGLRenderer|undefined,users=0;
export type SmallCubeController=ReturnType<typeof mountSmallCube>;
export function mountSmallCube(canvas:HTMLCanvasElement,host:HTMLElement,initialActive:boolean){
  let renderer:THREE.WebGLRenderer;
  try {
    shared??=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
    renderer=shared;renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;users++;
  }catch{return {setActive(){},dispose(){}};}
  const context=canvas.getContext("2d");
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.25,1.25,1.4,-1.4,.1,30);
  camera.position.set(6,4.8,7);camera.lookAt(0,0,0);
  const geometry=new THREE.BoxGeometry(1.5,1.5,1.5);
  const kinds:GlassFace[]=["side","rear","top","bottom","front","rear"];
  const panes=kinds.map(kind=>glassFace(kind));
  const group=new THREE.Group();scene.add(group);group.add(new THREE.Mesh(geometry,panes));
  const edgeGeometry=new THREE.EdgesGeometry(geometry);
  const edgeMaterial=new THREE.LineBasicMaterial({transparent:true,opacity:.8,toneMapped:false});
  group.add(new THREE.LineSegments(edgeGeometry,edgeMaterial));
  const signalGeometry=new THREE.SphereGeometry(.065,12,8);
  const signalMaterial=new THREE.MeshBasicMaterial({toneMapped:false});
  const signal=new THREE.Mesh(signalGeometry,signalMaterial);signal.position.set(0,.8,0);group.add(signal);
  scene.add(new THREE.HemisphereLight(0xeaf6ff,0x314d6b,2));
  const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(-4,6,4);scene.add(light);
  let active=initialActive,visible=false,disposed=false,available=true,frame=0,start=0,progress=0;
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  function draw(){
    if(disposed||!available||!context)return;
    const dark=document.documentElement.dataset.theme==="dark";
    panes.forEach((material,i)=>{setGlass(material,kinds[i],dark);material.opacity=Math.min(.65,material.opacity*1.7);});
    edgeMaterial.color.set(dark?0x78b0ff:0x3284e8);
    signalMaterial.color.set(active?0x246bd4:0x2894bc);
    const t=motion.matches?1:progress;
    group.position.y=(1-t)*.12;group.rotation.y=(1-t)*.06;
    const ratio=Math.min(devicePixelRatio,1.5),w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    renderer.setPixelRatio(1);renderer.setSize(canvas.width,canvas.height,false);
    camera.left=-1.4*w/h;camera.right=1.4*w/h;camera.updateProjectionMatrix();
    renderer.render(scene,camera);
    context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(renderer.domElement,0,0);
    host.dataset.rendered="true";canvas.dataset.ready="true";
  }
  function stop(){cancelAnimationFrame(frame);frame=0;start=0;}
  function tick(now:number){
    if(!visible||document.hidden||!available){stop();return;}
    start||=now;progress=Math.min(1,(now-start)/650);
    progress=1-(1-progress)**3;draw();
    if(progress<1)frame=requestAnimationFrame(tick);else stop();
  }
  function resume(){
    stop();if(!visible||document.hidden)return;
    if(motion.matches||progress>=1){progress=1;draw();}else frame=requestAnimationFrame(tick);
  }
  const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();});view.observe(host);
  const size=new ResizeObserver(()=>{if(visible)draw();});size.observe(host);
  const theme=new MutationObserver(()=>{if(visible)draw();});theme.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  const lost=(event:Event)=>{event.preventDefault();available=false;stop();delete host.dataset.rendered;};
  const restored=()=>{available=true;resume();};
  renderer.domElement.addEventListener("webglcontextlost",lost);renderer.domElement.addEventListener("webglcontextrestored",restored);
  motion.addEventListener("change",resume);document.addEventListener("visibilitychange",resume);
  return {setActive(value:boolean){active=value;if(visible)draw();},dispose(){
    disposed=true;stop();view.disconnect();size.disconnect();theme.disconnect();motion.removeEventListener("change",resume);document.removeEventListener("visibilitychange",resume);
    renderer.domElement.removeEventListener("webglcontextlost",lost);renderer.domElement.removeEventListener("webglcontextrestored",restored);
    geometry.dispose();edgeGeometry.dispose();edgeMaterial.dispose();panes.forEach(m=>m.dispose());signalGeometry.dispose();signalMaterial.dispose();
    if(--users===0)shared?.renderLists.dispose();
  }};
}
