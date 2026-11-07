import * as T from 'three';
import {plantFrame} from './plant-framing';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import {sceneEnvironment,addArtworkSoftboxes,releaseStudioLookups} from '../brand/artwork-studio';
import {createRenderQuality} from '../performance/scene-policy';
import {factoryKit} from './factory-kit';
import {constructionArtwork} from './construction-artwork';
import {factoryCubeArtwork} from './factory-cube-artwork';
import {engineeringArtwork} from './authored-scenes';
import {sceneDuration,smooth,type NetworkSceneKind} from './network-story';
import {networkStatus} from './network-simulation';
import {cubeFrame} from './cube-layout';
export function mountAuthoredNetwork(canvas:HTMLCanvasElement,host:HTMLElement,kind:Exclude<NetworkSceneKind,'owned'>,onTime:(t:number)=>void){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:new URLSearchParams(location.search).has('scene-capture')}),quality=createRenderQuality(canvas,2,55);renderer.setClearColor(0,0);renderer.setPixelRatio(quality.ratio);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const resources=new Set<{dispose:()=>void}>(),own=<R extends {dispose:()=>void}>(r:R)=>{resources.add(r);return r;},scene=new T.Scene(),root=new T.Group();scene.add(root);const camera=new T.OrthographicCamera(-12,12,8,-8,.1,150),environment=sceneEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe9f5ff,0x183047,2));const sun=new T.DirectionalLight(0xffffff,3);sun.position.set(-10,18,12);scene.add(sun);
 const kit=factoryKit(own),art=kind==='partnership'?constructionArtwork(root,kit,own):kind==='learning'?factoryCubeArtwork(root,kit,own):engineeringArtwork(root,kit,own);
 const formationPlane=new T.Plane(new T.Vector3(0,-1,0),10);renderer.localClippingEnabled=true;for(const mat of [kit.pearl,kit.navy,kit.steel,kit.glass,kit.reading,kit.active])mat.clippingPlanes=[formationPlane];
 root.userData.phone=host.clientWidth<768;if(kind==='products')art.update(16,document.documentElement.dataset.theme==='dark',0);
 root.updateMatrixWorld(true);const starts:number[]=[],samples:number[]=[];let seed=71;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};root.traverse(o=>{if(!(o instanceof T.Mesh)||o.geometry.type==='PlaneGeometry'||(kind==='partnership'&&!root.children[0].getObjectById(o.id))||kind==='learning')return;const sampler=(new MeshSurfaceSampler(o) as MeshSurfaceSampler & {setRandomGenerator(fn:()=>number):MeshSurfaceSampler}).setRandomGenerator(random).build(),v=new T.Vector3();for(let i=0;i<Math.min(80,Math.max(24,o.geometry.getAttribute('position').count/10));i++){sampler.sample(v);o.localToWorld(v);samples.push(v.x,v.y,v.z);let node:T.Object3D|null=o,start=0;while(node){start=Math.max(start,Number(node.userData.formationStart)||0);node=node.parent;}starts.push(start);}});
 const targets=new Float32Array(samples.slice(0,24000)),positions=new Float32Array(targets),geometry=own(new T.BufferGeometry());geometry.setAttribute('position',new T.BufferAttribute(positions,3));const material=own(new T.PointsMaterial({size:.035,color:0x4ca9da,transparent:true,opacity:.7,depthWrite:false})),particles=new T.Points(geometry,material);scene.add(particles);
 let ambient=0,time=0,paused=false,visible=false,disposed=false,lost=false,previous=0,raf=0,lastReport=-1,lastTheme='';const duration=sceneDuration(kind);
 const target=art.target.clone();function fit(){const width=host.clientWidth,height=host.clientHeight,aspect=width/Math.max(1,height),span=kind==='learning'?(width<768?27:31):kind==='products'&&width<768?10.5:art.span,extent=Math.max(kind==='products'?8:kind==='partnership'?17:kind==='learning'?23:14,span/aspect);renderer.setSize(width,height,false);camera.left=-extent*aspect/2;camera.right=extent*aspect/2;camera.top=extent/2;camera.bottom=-extent/2;camera.updateProjectionMatrix();}
 let preparing=kind==='learning';
 function draw(){if(preparing||disposed||lost)return;const dark=document.documentElement.dataset.theme==='dark';if(String(dark)!==lastTheme){kit.theme(dark);lastTheme=String(dark);}root.userData.phone=host.clientWidth<768;art.update(time,dark,ambient);target.copy(art.target);camera.zoom=1;
  if(kind==='learning'){const aspect=host.clientWidth/Math.max(1,host.clientHeight),framing=cubeFrame(aspect,root.userData.phone);const opening=smooth(time/3.8);framing.height*=.68+.32*opening;target.fromArray(framing.target);target.y*=.62+.38*opening;camera.left=-framing.height*aspect/2;camera.right=-camera.left;camera.top=framing.height/2;camera.bottom=-camera.top;camera.position.fromArray(framing.offset).add(target);host.dataset.framing='factory-cube';}
  if(kind==='products'){
   const aspect=host.clientWidth/Math.max(1,host.clientHeight),phone=root.userData.phone;
   const widen=smooth((time-7.8)/3),sideStudy=phone?smooth((time-6.8)/1.2)*(1-widen):0;
   target.set((phone?0:-2.1)*(1-widen)+sideStudy*.55,(phone?3.6:2.15)*(1-widen)+(phone?2.15:1.8)*widen,(phone?-.65:-.7)*(1-widen));
   const close=Math.max(phone?6.6:6.15,8.25/aspect),wide=Math.max(phone?9.1:7.8,(phone?9.5:14)/aspect);
   camera.top=(close+(wide-close)*widen)/2;camera.bottom=-camera.top;camera.right=camera.top*aspect;camera.left=-camera.right;
  }
  if(kind==='partnership'){
   const aspect=host.clientWidth/Math.max(1,host.clientHeight),frame=plantFrame(kind,time,aspect);
   target.set(frame.x,frame.y,frame.z);
   camera.top=frame.height/2;camera.bottom=-camera.top;
   camera.right=camera.top*aspect;camera.left=-camera.right;
  }
  camera.updateProjectionMatrix();
  if(kind!=='learning')camera.position.copy(target).add(new T.Vector3(kind==='products'?9:18,kind==='products'?7:25,kind==='products'?15:23));camera.lookAt(target);
  const form=kind==='partnership'?smooth(time/2.8):1;formationPlane.constant=form>=1?1000:-1.8+form*9;particles.visible=form<1||(kind==='products'&&time>=8&&time<9.4);material.opacity=.7*(1-smooth((time-(time>=8?8:0))/(time>=8?1.4:2.8)));if(particles.visible){for(let i=0;i<positions.length;i+=3){const start=starts[i/3]||0,local=smooth((time-start)/(start?1.4:2.8)),show=time>=start&&local<1;positions[i]=targets[i]+Math.sin(i)*.25*(1-local);positions[i+1]=show?targets[i+1]+.7*(1-local):1000;positions[i+2]=targets[i+2]+Math.cos(i)*.25*(1-local);}geometry.attributes.position.needsUpdate=true;}
  renderer.render(scene,camera);host.dataset.sceneState='live';host.dataset.storyTime=time.toFixed(2);host.dataset.operation=networkStatus(kind,time);host.dataset.hubPulse=String(root.userData.hubPulse??0);host.dataset.siteCount=String(root.userData.siteCount??0);host.dataset.envelopeEdges=String(root.userData.envelopeEdges??0);host.dataset.complete=String(root.userData.complete??false);host.dataset.completionGlow=String(root.userData.completionGlow??0);host.dataset.buildPhase=String(root.userData.buildPhase??'');host.dataset.artworkConcept=kind==='partnership'?'architectural-development':kind==='learning'?'factory-cube':'engineering-assembly';
 }
 function stop(){cancelAnimationFrame(raf);raf=0;previous=0;host.dataset.running='false';}
 function wake(){if(!preparing&&!disposed&&!lost&&visible&&!document.hidden&&!raf&&!paused){host.dataset.running='true';raf=requestAnimationFrame(tick);}}
 function tick(now:number){raf=0;if(disposed||lost||!visible||document.hidden)return;if(previous&&now-previous<33){wake();return;}const dt=previous?Math.min(.08,(now-previous)/1000):0;previous=now;ambient+=dt;if(!paused)time=Math.min(duration,time+dt);if(time>=duration)paused=true;draw();const report=Math.floor(time*4);if(report!==lastReport){lastReport=report;onTime(time);}if(quality.sample(now))renderer.setPixelRatio(quality.ratio);wake();if(!raf)host.dataset.running='false';}
 function visibility(){if(document.hidden)stop();else wake();}
 const contextLost=(e:Event)=>{e.preventDefault();lost=true;stop();host.dataset.ready='false';host.dataset.sceneState='fallback';};
 const contextRestored=()=>{lost=false;host.dataset.ready='true';quality.reset();draw();wake();};
 canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);document.addEventListener('visibilitychange',visibility);

 const resize=new ResizeObserver(()=>{fit();draw();}),view=new IntersectionObserver(([e])=>{visible=e.isIntersecting&&e.intersectionRatio>=.1;if(visible)wake();else stop();},{threshold:[0,.1]}),theme=new MutationObserver(draw);resize.observe(host);view.observe(host);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});fit();
 const firstFrame=()=>{if(disposed)return;preparing=false;draw();wake();};
 const prepared=preparing?renderer.compileAsync(scene,camera).then(firstFrame,firstFrame):Promise.resolve(firstFrame());
 return {prepared,seek(t:number){time=Math.max(0,Math.min(duration,t));paused=true;stop();draw();onTime(time);wake();},replay(){ambient=0;time=0;paused=false;stop();wake();},dispose(){disposed=true;stop();canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);document.removeEventListener('visibilitychange',visibility);resize.disconnect();view.disconnect();theme.disconnect();releaseStudioLookups(renderer,scene);resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();if(!canvas.isConnected)renderer.forceContextLoss();}};
}
