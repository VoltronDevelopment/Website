import * as T from 'three';
import {prefersStaticScene} from '../performance/scene-policy';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {galleryFormation,taskFormation} from './agent-motion';
import {agentSelectionResponse} from './agent-presets';
import {createFluidCube} from './fluid-cube-materials';

/** All gallery and detail views share one WebGL context and one studio environment. */
export function mountOrbs(canvas:HTMLCanvasElement,host:HTMLElement){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.toneMapping=T.ACESFilmicToneMapping;
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
 const cubes=Array.from({length:6},(_,i)=>{const scene=new T.Scene();scene.environment=env.texture;scene.add(new T.HemisphereLight('#e9faff','#204269',2));const key=new T.DirectionalLight('#ffffff',3);key.position.set(-3,5,3);scene.add(key);const cube=createFluidCube(i);scene.add(cube.group);return {scene,cube};});
 const camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(3,2.1,4.6);camera.lookAt(0,0,0);
 let frame=0,visible=false,disposed=false,last=0,time=0,published=0,width=0,height=0,selected=0,selectionTime=-10;
 const reduced=prefersStaticScene;
 function draw(){
  const rect=host.getBoundingClientRect();if(!rect.width)return;if(width!==rect.width||height!==rect.height){width=rect.width;height=rect.height;renderer.setSize(width,height,false);}
  const dark=document.documentElement.dataset.theme==='dark';renderer.setScissorTest(false);renderer.setClearColor(0,0);renderer.clear();renderer.setScissorTest(true);
  host.querySelectorAll<HTMLElement>('[data-orb]').forEach(slot=>{const r=slot.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return;
   const i=Number(slot.dataset.orb),state=cubes[i],age=time-selectionTime,activity=slot.dataset.activity,response=activity!==undefined?(Number(activity)>0?1:0):i===selected?agentSelectionResponse(age,reduced()):0;
   const pose=activity===undefined?galleryFormation(reduced()?11:time,i):taskFormation(Number(activity),Number(slot.dataset.progress??0),i);
   state.cube.update((reduced()?7:time),dark,camera.position,response,activity===undefined?1:Number(activity)<0?0:Number(activity)>0?1.4:.55,pose,reduced());
   slot.dataset.formation=pose.amount.toFixed(2);slot.dataset.stage=pose.label;
   const label=slot.parentElement?.querySelector<HTMLElement>('[data-agent-state-label]');if(label&&label.textContent!==pose.label)label.textContent=pose.label;
   camera.aspect=r.width/r.height;camera.updateProjectionMatrix();const x=r.left-rect.left,y=rect.bottom-r.bottom;renderer.setViewport(x,y,r.width,r.height);renderer.setScissor(x,y,r.width,r.height);renderer.render(state.scene,camera);
  });renderer.setScissorTest(false);
 }
 function tick(now:number){frame=0;if(disposed||!visible||document.hidden)return;if(document.querySelector('.intelligence-sheet[open]')){last=0;frame=requestAnimationFrame(tick);return;}if(now-published<33){frame=requestAnimationFrame(tick);return;}time+=last?Math.min((now-last)/1000,.1):0;last=now;published=now;draw();canvas.dataset.time=time.toFixed(2);if(!reduced())frame=requestAnimationFrame(tick);}
 function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!document.hidden){draw();if(!reduced())frame=requestAnimationFrame(tick);}}
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume();},{threshold:.01});observer.observe(host);
 const resize=new ResizeObserver(()=>{if(visible)draw();});resize.observe(host);const theme=new MutationObserver(resume);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-scene-motion','data-artwork-motion']});const taskObserver=new MutationObserver(()=>{if(visible&&reduced())draw();});taskObserver.observe(host,{subtree:true,attributes:true,attributeFilter:['data-activity','data-progress']});const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',resume);document.addEventListener('visibilitychange',resume);window.addEventListener('voltron:motion',resume);const scroll=()=>{if(visible&&(reduced()||!frame))draw();};window.addEventListener('scroll',scroll,{passive:true});
 const lost=(e:Event)=>{e.preventDefault();host.dataset.live='false';cancelAnimationFrame(frame);};const restored=()=>{host.dataset.live='true';resume();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 draw();return {select(index:number){if(index!==selected){selected=index;selectionTime=time;}draw();},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();theme.disconnect();taskObserver.disconnect();media.removeEventListener('change',resume);document.removeEventListener('visibilitychange',resume);window.removeEventListener('voltron:motion',resume);window.removeEventListener('scroll',scroll);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);cubes.forEach(c=>c.cube.dispose());env.dispose();renderer.dispose();}};
}
