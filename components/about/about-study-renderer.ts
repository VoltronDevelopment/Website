import {capabilityFrame,capabilityLabel} from './capability-layout';
import {capabilityHeadCrown} from './principles-motion';
import * as T from 'three';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import {factoryKit} from '../network/factory-kit';
import {disciplinesArtwork} from './disciplines-artwork';
import {disciplineDuration} from './discipline-motion';
import {createArtworkEnvironment,addArtworkSoftboxes} from '../brand/artwork-studio';
import {createRenderQuality} from '../performance/scene-policy';
import {principleCapabilities} from './capabilities';
import {principlesArtwork} from './principles-artwork';
import {smooth} from '../network/network-story';
export async function mountAboutStudy(canvas:HTMLCanvasElement,host:HTMLElement,kind:'disciplines'|'principles'){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:new URLSearchParams(location.search).has('about-capture')}),quality=createRenderQuality(canvas,2,55);renderer.localClippingEnabled=true;renderer.setPixelRatio(quality.ratio);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const resources=new Set<{dispose:()=>void}>(),own=<R extends {dispose:()=>void}>(r:R)=>{resources.add(r);return r;},kit=factoryKit(own),scene=new T.Scene(),root=new T.Group();scene.add(root);const environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe9f5ff,0x183047,2));const light=new T.DirectionalLight(0xffffff,3);light.position.set(-6,12,9);scene.add(light);const camera=new T.OrthographicCamera(-9,9,5,-5,.1,100);
 const principle=kind==='principles'?await principlesArtwork(root,kit,own):null;
 const discipline=principle?null:disciplinesArtwork(root,kit,own);
 const parts:T.Object3D[]=[principle?principle.head:discipline!.part];
 root.updateMatrixWorld(true);let seed=23;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const targets:number[]=[];parts.forEach(part=>part.traverse(o=>{if(!(o instanceof T.Mesh))return;const sampler=(new MeshSurfaceSampler(o) as MeshSurfaceSampler&{setRandomGenerator(fn:()=>number):MeshSurfaceSampler}).setRandomGenerator(random).build(),v=new T.Vector3();for(let i=0;i<(principle?6000:1600);i++){sampler.sample(v);o.localToWorld(v);if(principle&&v.y>capabilityHeadCrown)continue;targets.push(v.x,v.y,v.z);}}));const positions=new Float32Array(targets),geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.BufferAttribute(positions,3));const pm=own(new T.PointsMaterial({size:.027,transparent:true,opacity:.7,depthWrite:false,color:0x278fc3})),points=new T.Points(geo,pm);scene.add(points);
 const capture=new URLSearchParams(location.search).get('about-capture')==='1';
 const phaseLimit=principle?2.8:disciplineDuration;
 const capturedPhase=principle?2.8:Math.max(0,Math.min(phaseLimit,Number(new URLSearchParams(location.search).get('discipline-phase')||phaseLimit)));
 let selected=0,capability=0,phase=capture?capturedPhase:0,time=capture?12.5:0,inspecting=false,visible=false,disposed=false,lost=false,last=0,raf=0,dirty=true,settled=capture,lastTheme='';
 function fit(){const w=host.clientWidth,h=host.clientHeight,aspect=w/Math.max(h,1),extent=Math.max(principle?(innerWidth<768?6.6:7.8):4.6,(principle?(innerWidth<768?6.6:9):7.8)/aspect);const frame=principle?capabilityFrame(w,h,innerWidth<768):null;renderer.setSize(w,h,false);camera.left=-(frame?.width??extent*aspect)/2;camera.right=(frame?.width??extent*aspect)/2;camera.top=(frame?.height??extent)/2;camera.bottom=-(frame?.height??extent)/2;camera.updateProjectionMatrix();camera.position.set(principle?0:4.5,principle?1.4:4.5,16);camera.lookAt(principle?0:.45,principle?1.4:1.1,0);dirty=true;}
 function draw(){const dark=document.documentElement.dataset.theme==='dark';kit.theme(dark);lastTheme=String(dark);const form=smooth(time/2.5);
 if(principle)principle.update(time,phase,selected,dark,capability);else {const state=discipline!.update(time,phase,selected,dark);host.dataset.disciplinePhase=state.phase;host.dataset.disciplineToolZ=state.toolZ.toFixed(3);host.dataset.disciplineGaugeZ=state.gaugeZ.toFixed(3);const label=host.querySelector<HTMLElement>(".discipline-stage");if(label)label.textContent=state.phase;}
 points.visible=form<1;pm.opacity=.75*(1-form);if(points.visible){const scatter=1-form;for(let i=0;i<positions.length;i+=3){positions[i]=targets[i]+Math.sin(i)*scatter*.6;positions[i+1]=targets[i+1]+scatter*.5;positions[i+2]=targets[i+2]+Math.cos(i)*scatter*.5;}geo.attributes.position.needsUpdate=true;}
 if(principle){host.dataset.labels='true';for(let i=0;i<8;i++){
 const cube=principle.cubes[i].position.clone().project(camera),button=host.querySelector<HTMLElement>('[data-capability="'+i+'"]'),path=host.querySelector<SVGPathElement>('[data-cap-link="'+i+'"]');
 const revealed=time>=8.1+i*.14;if(button)button.hidden=!revealed;if(path)path.style.display=revealed?'':'none';
 const w=host.clientWidth,h=host.clientHeight,bw=button?.offsetWidth||108;
 const label=capabilityLabel(i,w,h,bw,button?.offsetHeight||44),{x:lx,y:ly,right}=label;
 button?.style.setProperty('--cap-x',lx+'px');button?.style.setProperty('--cap-y',ly+'px');
 const cx=(cube.x+1)*50,cy=(1-cube.y)*50,ex=(right?lx-bw/2:lx+bw/2)/w*100,ey=ly/h*100;
 const target=host.querySelector<HTMLElement>('[data-cap-cube="'+i+'"]');
 if(target){target.hidden=time<9.5;target.style.setProperty('--cube-x',cx*w/100+'px');target.style.setProperty('--cube-y',cy*h/100+'px');}
 path?.setAttribute('d','M'+cx+','+cy+'H'+ex+'V'+ey);
 }}
 renderer.render(scene,camera);host.dataset.sceneState='live';host.dataset.settled=String(time>=12.5&&phase>=phaseLimit);host.dataset.storyTime=time.toFixed(2);host.dataset.selected=String(selected);dirty=false;}
 function tick(now:number){raf=0;if(disposed||lost||!visible||document.hidden||inspecting){last=0;return;}const dt=last?Math.min(.08,(now-last)/1000):0;last=now;if(!settled){time=Math.min(12.5,time+dt);phase=time<(principle?9.5:2.5)?0:Math.min(phaseLimit,phase+dt);settled=time>=12.5&&phase>=phaseLimit;dirty=true;}if(dirty){draw();if(quality.sample(now))renderer.setPixelRatio(quality.ratio);}if(!settled)raf=requestAnimationFrame(tick);else last=0;}
 function wake(){if(inspecting){if(dirty&&!disposed&&!lost)draw();return;}if(!disposed&&!lost&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);}
 const view=new IntersectionObserver(([e])=>{visible=e.isIntersecting;last=0;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;quality.reset();}},{threshold:.1}),resize=new ResizeObserver(()=>{fit();dirty=true;wake();}),theme=new MutationObserver(()=>{dirty=true;wake();});view.observe(host);resize.observe(host);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();};document.addEventListener('visibilitychange',visibility);const contextLost=(e:Event)=>{e.preventDefault();lost=true;host.dataset.ready='false';cancelAnimationFrame(raf);raf=0;};const contextRestored=()=>{lost=false;dirty=true;host.dataset.ready='true';wake();};canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);fit();draw();

 return {setInspecting(value:boolean){inspecting=value;host.dataset.inspecting=String(value);cancelAnimationFrame(raf);raf=0;last=0;wake();},select(i:number){selected=i;capability=principleCapabilities[i]?.[0]??0;phase=capture?capturedPhase:0;settled=capture;dirty=true;wake();},selectCapability(i:number){capability=i;phase=capture?capturedPhase:0;settled=capture;dirty=true;wake();},dispose(){disposed=true;cancelAnimationFrame(raf);view.disconnect();resize.disconnect();theme.disconnect();canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);document.removeEventListener('visibilitychange',visibility);resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();}};
}
