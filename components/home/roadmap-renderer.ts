import {waitForScrollPause} from '../home/scene-preparation';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {matteFaces,tintMatte} from './matte-faces';
import {roadmapAscentPose} from '@/lib/voltron-roadmap';
import {roadmapFrame,roadmapLocations,roadmapYaw,roadmapRise} from './roadmap-framing';
/** Each milestone adds a larger matte cube to the same foundation. */
export async function mountRoadmap(canvas:HTMLCanvasElement,host:HTMLElement,onArrive:()=>void=()=>{}){
 await waitForScrollPause();
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:new URLSearchParams(location.search).has('scene-capture')});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-6,6,4,-3,.1,50);
 const geometry=new RoundedBoxGeometry(1,1,1,2,.012);
 const cubeMaterials=Array.from({length:5},()=>matteFaces());
 const cubes=cubeMaterials.map(materials=>{const cube=new T.Mesh(geometry,materials);cube.rotation.y=roadmapYaw;scene.add(cube);return cube;});
 const locations=roadmapLocations;
 let index=Number(host.dataset.index)||0,amounts=[0,0,0,0,0],fromAmounts=[0,0,0,0,0],progress=1,raf=0,last=0,visible=false,disposed=false,prepared=false;
 let cameraStage=index,fromStage=index;
 function draw(){if(disposed)return;const dark=document.documentElement.dataset.theme==='dark';const easing=(n:number)=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n);},reverse=index<fromStage,p=easing(reverse?progress/.6:(progress-.35)/.65),cameraP=easing(reverse?(progress-.6)/.4:progress/.6);cubes.forEach((cube,i)=>{const goal=i<=index?1:0;amounts[i]=T.MathUtils.lerp(fromAmounts[i],goal,p);const size=roadmapAscentPose(i).size*amounts[i];cube.visible=amounts[i]>.001;cube.scale.setScalar(Math.max(.001,size));cube.position.set(locations[i],.08+size/2,0);const quiet=dark?[0x637e91,0x748b9c,0x697f95,0x7c929e]:[0x8aa0ae,0x96a8b2,0x859baa,0x93a6af];
 tintMatte(cubeMaterials[i],i===index?(dark?0x5f9bca:0x417aa7):quiet[i%quiet.length]);});
 const aspect=host.clientWidth/Math.max(1,host.clientHeight);cameraStage=T.MathUtils.lerp(fromStage,index,cameraP);const lower=Math.floor(cameraStage),fraction=cameraStage-lower,a=roadmapFrame(lower,aspect),b=roadmapFrame(Math.min(4,lower+1),aspect),span=T.MathUtils.lerp(a.spanY,b.spanY,fraction),focus=T.MathUtils.lerp(a.x,b.x,fraction),focusY=T.MathUtils.lerp(a.y,b.y,fraction);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.position.set(focus,focusY+16*roadmapRise,16);camera.lookAt(focus,focusY,0);camera.updateProjectionMatrix();
 if(prepared)renderer.render(scene,camera);host.dataset.roadmapProgress=progress.toFixed(3);host.dataset.roadmapState=String(index);host.dataset.cubeCount=String(amounts.filter(a=>a>.99).length);host.dataset.cubeSizes=amounts.map((a,i)=>(a*roadmapAscentPose(i).size).toFixed(3)).join(',');host.dataset.surface='matte';host.dataset.roadmapDesign='capability-growth';
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}function tick(now:number){raf=0;if(disposed||!visible||document.hidden)return;progress=Math.min(1,progress+(last?Math.min(.06,(now-last)/1000):0)/1.35);last=now;draw();if(progress<1)raf=requestAnimationFrame(tick);else{last=0;onArrive();}}
 function wake(){if(prepared&&!disposed&&visible&&!document.hidden&&!raf&&progress<1)raf=requestAnimationFrame(tick);}
 const lost=(e:Event)=>{e.preventDefault();stop();prepared=false;host.dataset.ready='false';host.dataset.sceneState='fallback';canvas.style.opacity='0';};const restored=()=>{prepared=true;canvas.style.opacity='1';host.dataset.ready='true';host.dataset.sceneState='live';draw();wake();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 const resize=new ResizeObserver(()=>{renderer.setSize(host.clientWidth,host.clientHeight,false);draw();}),view=new IntersectionObserver(([e])=>{visible=e.isIntersecting&&e.intersectionRatio>=.2;if(visible)wake();else stop();},{threshold:[0,.2]}),theme=new MutationObserver(draw);resize.observe(host);view.observe(host);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});const visibility=()=>document.hidden?stop():wake();document.addEventListener('visibilitychange',visibility);renderer.setSize(host.clientWidth,host.clientHeight,false);draw();await renderer.compileAsync(scene,camera);prepared=true;draw();host.dataset.ready='true';
 return {select(next:number){draw();fromAmounts=[...amounts];fromStage=cameraStage;index=Math.max(0,Math.min(4,next));progress=0;stop();wake();},seek(_year:number){},dispose(){disposed=true;stop();resize.disconnect();view.disconnect();theme.disconnect();canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);document.removeEventListener('visibilitychange',visibility);geometry.dispose();cubeMaterials.flat().forEach(m=>m.dispose());renderer.dispose();}};
}
