import * as T from 'three';
import {releaseStudioLookups} from '../brand/artwork-studio';
import {prefersStaticScene} from '../performance/scene-policy';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {galleryFormation,taskFormation,visibleAgentDelta} from './agent-motion';
import {agentSelectionResponse} from './agent-presets';
import {createFluidCube} from './fluid-cube-materials';

/** All gallery and detail views share one WebGL context and one studio environment. */
export function mountOrbs(canvas:HTMLCanvasElement,host:HTMLElement){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:new URLSearchParams(location.search).has('scene-capture')});renderer.setPixelRatio(new URLSearchParams(location.search).has('scene-capture')?2:Math.min(devicePixelRatio,1.25));renderer.toneMapping=T.ACESFilmicToneMapping;
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
 const cubes=Array.from({length:6},(_,i)=>{const scene=new T.Scene();scene.environment=env.texture;scene.add(new T.HemisphereLight('#e9faff','#204269',2));const key=new T.DirectionalLight('#ffffff',3);key.position.set(-3,5,3);scene.add(key);const cube=createFluidCube(i);scene.add(cube.group);return {scene,cube,localTime:0,lastSample:null as number|null,label:'Ready to investigate'};});
 const camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(3,2.1,4.6);camera.lookAt(0,0,0);
 let frame=0,visible=false,disposed=false,contextLost=false,last=0,time=0,published=0,width=0,height=0,selected=0,selectionTime=-10;
 const reduced=prefersStaticScene;
 let preparing=true;
 function draw(){
  if(preparing||disposed||contextLost)return;const rect=host.getBoundingClientRect();if(!rect.width)return;if(width!==rect.width||height!==rect.height){width=rect.width;height=rect.height;renderer.setSize(width,height,false);}
  const dark=document.documentElement.dataset.theme==='dark';renderer.setScissorTest(false);renderer.setClearColor(0,0);renderer.clear();renderer.setScissorTest(true);
  host.querySelectorAll<HTMLElement>('[data-orb]').forEach(slot=>{const r=slot.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return;
   const i=Number(slot.dataset.orb),state=cubes[i],age=time-selectionTime,activity=slot.dataset.activity,response=activity!==undefined?(Number(activity)>0?1:0):i===selected?agentSelectionResponse(age,reduced()):0;
   if(state.lastSample!==time){state.localTime+=visibleAgentDelta(state.lastSample,time);state.lastSample=time;}
   const pose=activity===undefined?galleryFormation(reduced()?11:state.localTime,i):taskFormation(Number(activity),Number(slot.dataset.progress??0),i);
   const achieved=state.cube.update((reduced()?7:state.localTime),dark,camera.position,response,activity===undefined?1:Number(activity)<0?0:Number(activity)>0?1.4:.55,pose,reduced());
   if(reduced()||Math.max(Math.abs(achieved.amount-pose.amount),Math.abs(achieved.arrangement-pose.arrangement),Math.abs(achieved.resolve-pose.resolve))<.16)state.label=pose.label;
   slot.dataset.stage=state.label;
   const label=slot.parentElement?.querySelector<HTMLElement>('[data-agent-state-label]');if(label&&label.textContent!==state.label)label.textContent=state.label;
   camera.aspect=r.width/r.height;camera.updateProjectionMatrix();const x=r.left-rect.left,y=rect.bottom-r.bottom;renderer.setViewport(x,y,r.width,r.height);renderer.setScissor(x,y,r.width,r.height);renderer.render(state.scene,camera);
   if (!renderer.getContext().isContextLost()) {
    slot.dataset.formation = achieved.amount.toFixed(2);
    if (host.dataset.live !== 'true') host.dataset.live = 'true';
   }
  });renderer.setScissorTest(false);
 }
 function tick(now:number){frame=0;if(disposed||contextLost||!visible||document.hidden)return;if(document.querySelector('.intelligence-sheet[open]')){last=0;return;}if(now-published<33){frame=requestAnimationFrame(tick);return;}time+=last?Math.min((now-last)/1000,.1):0;last=now;published=now;draw();canvas.dataset.time=time.toFixed(2);if(!reduced())frame=requestAnimationFrame(tick);}
 function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(document.querySelector('.intelligence-sheet[open]'))return;if(!preparing&&visible&&!contextLost&&!document.hidden){draw();if(!reduced())frame=requestAnimationFrame(tick);}}
 const inspection=new MutationObserver(resume);inspection.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume();},{threshold:.01});observer.observe(host);
 const resize=new ResizeObserver(()=>{if(visible)draw();});resize.observe(host);const theme=new MutationObserver(resume);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-scene-motion','data-artwork-motion']});const taskObserver=new MutationObserver(()=>{if(visible&&reduced())draw();});taskObserver.observe(host,{subtree:true,attributes:true,attributeFilter:['data-activity','data-progress']});const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',resume);document.addEventListener('visibilitychange',resume);window.addEventListener('voltron:motion',resume);const scroll=()=>{if(visible&&(reduced()||!frame))draw();};window.addEventListener('scroll',scroll,{passive:true});
 const showPosters=()=>{
  host.dataset.live='false';
  host.querySelectorAll<HTMLElement>('[data-formation]').forEach(slot=>delete slot.dataset.formation);
 };
 const lost=(e:Event)=>{e.preventDefault();contextLost=true;showPosters();cancelAnimationFrame(frame);frame=0;last=0;};const restored=()=>{contextLost=false;resume();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 const finish=()=>{if(disposed)return;preparing=false;resume();};
 const prepared=Promise.all(cubes.map(({scene})=>renderer.compileAsync(scene,camera))).then(finish);
 return {prepared,select(index:number){if(index!==selected){selected=index;selectionTime=time;}draw();},dispose(){disposed=true;showPosters();cancelAnimationFrame(frame);observer.disconnect();inspection.disconnect();resize.disconnect();theme.disconnect();taskObserver.disconnect();media.removeEventListener('change',resume);document.removeEventListener('visibilitychange',resume);window.removeEventListener('voltron:motion',resume);window.removeEventListener('scroll',scroll);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);cubes.forEach(c=>{releaseStudioLookups(renderer,c.scene);c.cube.dispose();});env.dispose();renderer.dispose();}};
}
