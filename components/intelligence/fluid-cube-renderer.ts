import * as T from 'three';
import {prefersStaticScene} from '../performance/scene-policy';
import {galleryFormation} from './agent-motion';
import {createFluidCube} from './fluid-cube-materials';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

export function mountFluidCube(canvas:HTMLCanvasElement,host:HTMLElement,agent=0,hero=false){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,30);camera.position.set(3,2.1,4.6);camera.lookAt(0,0,0);
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight('#e9faff','#204269',2));const key=new T.DirectionalLight('#ffffff',3);key.position.set(-3,5,3);scene.add(key);
 const cube=createFluidCube(agent);scene.add(cube.group);
 let frame=0,visible=false,last=0,time=0,disposed=false,contextLost=false,width=0,height=0,front=false,currentAgent=agent;
 const reduced=prefersStaticScene;
 const aura=hero?host.querySelector<HTMLElement>('.agent-cube-aura'):null;
 function draw(){if(disposed||contextLost)return;const r=host.getBoundingClientRect();if(!r.width||!r.height)return;if(width!==r.width||height!==r.height){width=r.width;height=r.height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}const dark=document.documentElement.dataset.theme==='dark';camera.position.set(front?0:3,front?.15:2.1,front?5.8:4.6);camera.lookAt(0,0,0);cube.update(reduced()?7:time,dark,camera.position,0,1,galleryFormation(reduced()?11:time,currentAgent),reduced());if(hero){
   const shell=T.MathUtils.smoothstep(time,0,1.4);
   const gathering=T.MathUtils.smoothstep(time,1.4,4.2);
   cube.enclosure.scale.set(1,Math.max(.012,shell),1);
   cube.current.scale.setScalar(Math.max(.001,gathering));
   cube.current.visible=gathering>.001;
   aura?.style.setProperty('--intensity',String(gathering*(1.35+.45*Math.sin(time*.85))));
  }
  renderer.setClearColor(0,0);renderer.render(scene,camera);host.dataset.live='true';canvas.dataset.time=time.toFixed(2);}
 function tick(now:number){frame=0;if(disposed||contextLost||!visible||document.hidden)return;time+=last?Math.min((now-last)/1000,.05):0;last=now;draw();if(!reduced())frame=requestAnimationFrame(tick);}
 function resume(){cancelAnimationFrame(frame);frame=0;last=0;if(visible&&!contextLost&&!document.hidden){draw();if(!reduced())frame=requestAnimationFrame(tick);}}
 const lost=(e:Event)=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;last=0;host.dataset.live='false';};const restored=()=>{contextLost=false;resume();};canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();},{threshold:.1});observer.observe(host);
 const resize=new ResizeObserver(()=>{if(visible)draw();});resize.observe(host);const theme=new MutationObserver(()=>{if(visible)resume();});theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-scene-motion','data-artwork-motion']});const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',resume);document.addEventListener('visibilitychange',resume);window.addEventListener('voltron:motion',resume);draw();
 return {agent(index:number){currentAgent=index;cube.setAgent(index);draw();},view(value:boolean){front=value;draw();},dispose(){disposed=true;host.dataset.live='false';cancelAnimationFrame(frame);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);observer.disconnect();resize.disconnect();theme.disconnect();media.removeEventListener('change',resume);document.removeEventListener('visibilitychange',resume);window.removeEventListener('voltron:motion',resume);cube.dispose();env.dispose();renderer.dispose();}};
}
