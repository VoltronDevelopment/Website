import * as THREE from "three";
import { glassFace, setGlass, stroke, strokeMaterial, type GlassFace } from "../home/lattice-materials";
import { intelligenceHeroDuration, intelligenceHeroState } from "./intelligence-hero-timeline";
export type IntelligenceHeroController = { toggle(): void; replay(): void; dispose(): void };
type Mode = "static" | "playing" | "paused" | "settled";

export async function mountIntelligenceHero(canvas: HTMLCanvasElement, host: HTMLDivElement, onMode: (mode: Mode) => void): Promise<IntelligenceHeroController> {
  const [response,depthResponse] = await Promise.all([fetch("/intelligence/head-points.bin"),fetch("/intelligence/head-depth.bin")]);
  if (!response.ok || !depthResponse.ok) throw new Error("Portrait unavailable");
  const samples = new Float32Array(await response.arrayBuffer());
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true, powerPreference:"low-power" });
  renderer.setClearColor(0,0); renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const depthData=await depthResponse.arrayBuffer();const header=new Uint32Array(depthData,0,2);
  const depthGeometry=new THREE.BufferGeometry();depthGeometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(depthData,8,header[0]*3),3));depthGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(depthData,8+header[0]*12,header[1]),1));
  const depthMaterial=new THREE.ShaderMaterial({colorWrite:false,depthWrite:true,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2,side:THREE.DoubleSide,uniforms:{uCoverage:{value:0}},vertexShader:`void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float uCoverage;void main(){float noise=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(noise>=uCoverage)discard;gl_FragColor=vec4(0.);}`});
  const depthSurface=new THREE.Mesh(depthGeometry,depthMaterial);depthSurface.renderOrder=0;scene.add(depthSurface);
  const camera = new THREE.OrthographicCamera(-3.2,3.2,2.4,-2.4,.1,50);
  camera.position.set(12,8.2,14); camera.lookAt(0,0,0);
  const cube = new THREE.Group(); scene.add(cube);
  const faces: { material:THREE.MeshPhysicalMaterial; kind:GlassFace }[] = [];
  const planes: [GlassFace,number[],number[]][] = [["front",[0,0,1.6],[0,0,0]],["rear",[0,0,-1.6],[0,Math.PI,0]],["side",[1.6,0,0],[0,Math.PI/2,0]],["side",[-1.6,0,0],[0,-Math.PI/2,0]],["top",[0,1.6,0],[-Math.PI/2,0,0]],["bottom",[0,-1.6,0],[Math.PI/2,0,0]]];
  planes.forEach(([kind,position,rotation])=>{
    const material = glassFace(kind); material.opacity *= .16; faces.push({material,kind});
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),material); mesh.position.fromArray(position); mesh.rotation.set(rotation[0],rotation[1],rotation[2]); mesh.renderOrder=3; cube.add(mesh);
  });
  scene.add(new THREE.HemisphereLight(0xf0f8ff,0x54718b,2));
  const light = new THREE.DirectionalLight(0xffffff,2); light.position.set(-3,6,5); scene.add(light);
  const box = new THREE.BoxGeometry(3.2,3.2,3.2), edges = new THREE.EdgesGeometry(box);
  const edgePositions = edges.getAttribute("position");
  const points = Array.from({length:edgePositions.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(edgePositions,i));
  const edgeMat = strokeMaterial(true); edgeMat.userData.cssWidth = 1; edgeMat.opacity = .55;
  cube.add(stroke(points,edgeMat));
  const lowerMat=strokeMaterial(true);lowerMat.userData.cssWidth=1.1;lowerMat.opacity=.65;
  cube.add(stroke([new THREE.Vector3(-1.6,-1.6,1.6),new THREE.Vector3(1.6,-1.6,1.6),new THREE.Vector3(1.6,-1.6,1.6),new THREE.Vector3(1.6,-1.6,-1.6)],lowerMat)); box.dispose(); edges.dispose();
  const positions:number[]=[], normals:number[]=[], seeds:number[]=[], regions:number[]=[], cloud:number[]=[];
  const mobile=matchMedia("(max-width: 767px)").matches;
  for(let i=0;i<samples.length;i+=8*(mobile?3:1)) {
    positions.push(samples[i],samples[i+1],samples[i+2]);normals.push(samples[i+3],samples[i+4],samples[i+5]);seeds.push(samples[i+6]);regions.push(samples[i+7]);
    const seed=samples[i+6];cloud.push(Math.sin(seed*319.)*1.2,Math.sin(seed*173.)*1.25,Math.cos(seed*231.)*1.2);
  }
  const geometry=new THREE.BufferGeometry();
  for(const [name,values,itemSize] of [["position",positions,3],["normal",normals,3],["aCloud",cloud,3],["aSeed",seeds,1],["aRear",regions,1]] as [string,number[],number][])geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,itemSize));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uPixelRatio:{value:renderer.getPixelRatio()},uDark:{value:0}},
    vertexShader:`attribute vec3 aCloud;attribute float aSeed,aRear;uniform float uTime,uPixelRatio;varying float vLight,vAlpha;
    void main(){float delay=.4+aSeed*.65+max(0.,aRear)*.3;
      float t=clamp((uTime-delay)/3.8,0.,1.);float progress=t*t*t*(t*(t*6.-15.)+10.);
      vec3 flow=vec3(sin(aSeed*31.+uTime*1.3),cos(aSeed*19.+uTime),sin(aSeed*43.-uTime*1.1))*.11;
      vec3 p=mix(aCloud,position+normal*.009,progress)+flow*(1.-progress);
      vec3 litNormal=normalize(normalMatrix*normal);
      vLight=.1+.8*max(0.,dot(litNormal,normalize(vec3(.75,.65,1.))))+.1*aSeed;
      vAlpha=mix(.18,.95,progress)*mix(1.,.25,max(0.,aRear))*mix(1.,smoothstep(-.05,.3,litNormal.z),progress);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
      gl_PointSize=(1.+aSeed*.55+max(0.,-aRear)*.65+pow(vLight,5.)*.35)*uPixelRatio;
    }`,
    fragmentShader:`varying float vLight,vAlpha;uniform float uDark;
    void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;
      vec3 dark=mix(vec3(.10,.22,.34),vec3(.83,.94,1.),pow(vLight,2.6));
      vec3 light=mix(vec3(.025,.08,.13),vec3(.35,.49,.58),pow(vLight,2.));
      gl_FragColor=vec4(mix(light,dark,uDark),vAlpha*(1.-smoothstep(.22,.5,r)));
      #include <colorspace_fragment>
    }`});
  const portrait=new THREE.Points(geometry,material);portrait.renderOrder=2;scene.add(portrait);
  // Localized, precomputed relationships; no pairwise work in the render loop.
  const lattice=new THREE.Group();scene.add(lattice);
  const nodes=Array.from({length:34},(_,i)=>new THREE.Vector3(-1.32+(i%6)*.19+Math.sin(i*13.7)*.08,-1.36+Math.floor(i/6)*.17+Math.cos(i*7.9)*.06,.78+Math.sin(i*7.3)*.29));
  const links:THREE.Vector3[]=[];
  nodes.forEach((node,i)=>{for(let j=i+1;j<nodes.length;j++){if(node.distanceTo(nodes[j])<.39&&(i+j)%3!==0)links.push(node,nodes[j]);}});
  const latticeMat=strokeMaterial(true);latticeMat.userData.cssWidth=.7;latticeMat.color.setHex(0x63bdeb);lattice.add(stroke(links,latticeMat));
  const nodeGeometry=new THREE.BufferGeometry().setFromPoints(nodes);
  const nodeMat=new THREE.PointsMaterial({color:0x9bdcff,size:.018,transparent:true,depthWrite:false});lattice.add(new THREE.Points(nodeGeometry,nodeMat));
  const dustPositions:number[]=[],dustSeeds:number[]=[];
  for(let i=0;i<(mobile?70:180);i++){const r=(n:number)=>{const x=Math.sin((i+1)*n)*43758.5453;return x-Math.floor(x);};dustPositions.push((r(12.98)-.5)*4.3,(r(78.23)-.5)*3.7,-1.7-r(39.42)*.7);dustSeeds.push(r(9.13));}
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute("position",new THREE.Float32BufferAttribute(dustPositions,3));dustGeo.setAttribute("seed",new THREE.Float32BufferAttribute(dustSeeds,1));
  const dustMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uDark:{value:1},uRatio:{value:renderer.getPixelRatio()}},vertexShader:`attribute float seed;uniform float uRatio;varying float vSeed;void main(){vSeed=seed;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=(1.+seed*3.)*uRatio;}`,fragmentShader:`uniform float uDark;varying float vSeed;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(mix(vec3(.15,.36,.5),vec3(.3,.65,.9),uDark),(.08+vSeed*.12)*(1.-smoothstep(0.,.5,d)));}`});scene.add(new THREE.Points(dustGeo,dustMat));
  let disposed=false, frame=0, visible=false, paused=false, time=0,last=0;
  let frozen:number|null=null;
  const query=new URLSearchParams(location.search), review=query.get("intelligence-time");
  if(review!==null&&Number.isFinite(Number(review))) { frozen=Math.max(0,Math.min(intelligenceHeroDuration,Number(review)));time=frozen; }
  function draw(){
    if(disposed)return;
    const state=intelligenceHeroState(time);
    material.uniforms.uTime.value=time;
    depthSurface.visible=time>4.1;depthMaterial.uniforms.uCoverage.value=THREE.MathUtils.smoothstep(time,4.1,5.2);
    latticeMat.opacity=state.connections*.38;nodeMat.opacity=state.connections*.8;
    host.dataset.phase=state.settled?"formed":"forming";
    renderer.render(scene,camera);
  }
  function tick(now:number){frame=0;if(disposed||!visible||document.hidden||paused||frozen!==null)return;
    const delta=last?(now-last)/1000:0;last=now;
    time=Math.min(intelligenceHeroDuration,time+delta);draw();
    if(time<intelligenceHeroDuration)frame=requestAnimationFrame(tick);else {last=0;onMode("settled");}
  }
  function schedule(){last=0;if(!disposed&&visible&&!document.hidden&&!paused&&frozen===null&&!frame&&(time<intelligenceHeroDuration))frame=requestAnimationFrame(tick);}
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function size(){const {width,height}=host.getBoundingClientRect(); if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height;const half=aspect<1?2.55/aspect:2.55;camera.top=half;camera.bottom=-half;camera.left=-half*aspect;camera.right=half*aspect;camera.updateProjectionMatrix();draw();}
  function theme(){const dark=document.documentElement.dataset.theme==="dark";material.uniforms.uDark.value=dark?1:0;dustMat.uniforms.uDark.value=dark?1:0;faces.forEach(({material,kind})=>{setGlass(material,kind,dark);material.opacity*=.16;});edgeMat.color.setHex(dark?0x78b0ff:0x246bd4);lowerMat.color.setHex(dark?0xb0def4:0x307ca6);draw();}
  function visibility(){if(document.hidden)stop();else schedule();}
  function lost(event:Event){event.preventDefault();stop();host.dataset.live="false";onMode("static");}
  function restored(){theme();size();host.dataset.live="true";onMode(time>=intelligenceHeroDuration?"settled":paused?"paused":"playing");schedule();}
  const resize=new ResizeObserver(size);resize.observe(host);
  const themes=new MutationObserver(theme);themes.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  const view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else stop();},{threshold:.1});view.observe(host);
  document.addEventListener("visibilitychange",visibility);canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restored);
  theme();size();host.dataset.live="true";onMode(frozen!==null?"settled":"playing");
  return {replay(){time=0;frozen=null;paused=false;onMode("playing");draw();schedule();},toggle(){if(time>=intelligenceHeroDuration||frozen!==null){time=0;frozen=null;paused=false;}else paused=!paused;onMode(paused?"paused":"playing");if(paused)stop();else schedule();},
    dispose(){disposed=true;stop();resize.disconnect();themes.disconnect();view.disconnect();document.removeEventListener("visibilitychange",visibility);canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restored);host.dataset.live="false";
      scene.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(item=>item.dispose());}});renderer.dispose();renderer.forceContextLoss();} };
}
