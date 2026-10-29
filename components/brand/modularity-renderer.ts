import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createLotReveal} from '../home/lot-story-particles';
import {createLatticeCellMaterials,updateLatticeCellMaterials,latticeFaceKinds as kinds,latticeFaceNormals as normals,latticeBevel} from './lattice-optics';
import {glassFace,setGlass} from '../home/lattice-materials';
import {createArtworkEnvironment,addArtworkSoftboxes} from './artwork-studio';
import {MODULARITY_DURATION,modularityFrame,modularityCells,configurationPosition} from './modularity-model';

export function mountModularity(canvas:HTMLCanvasElement,host:HTMLElement,onSelect:(index:number)=>void){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-3,3,3,-3,.1,50),environment=createArtworkEnvironment(renderer);
 scene.environment=environment.texture;camera.position.set(7.8,5.5,9.5);camera.lookAt(0,0,0);addArtworkSoftboxes(scene);
 scene.add(new T.HemisphereLight(0xe7f6ff,0x163049,2));const light=new T.DirectionalLight(0xffffff,2.8);light.position.set(-4,6,5);scene.add(light);
 const resources=new Set<{dispose:()=>void}>(),own=<R extends {dispose:()=>void}>(resource:R)=>{resources.add(resource);return resource;};
 const geometry=own(new RoundedBoxGeometry(1.65,1.65,1.65,3,latticeBevel(1.65)));
 const createCell=(position:readonly number[],index:number)=>{
  const root=new T.Group();root.position.fromArray(position);scene.add(root);
  const materials=createLatticeCellMaterials(index===0||index===2||index===5?'dark':'light',1.65).map(own);
  const mesh=new T.Mesh(geometry,materials);mesh.userData.pack=index-1;mesh.frustumCulled=false;root.add(mesh);
  const reveal=createLotReveal(root,geometry,own,own,{componentSamples:0,surfaceSamples:matchMedia('(max-width:767px)').matches?1200:1800});materials.forEach(reveal.bind);
  return {root,mesh,materials,reveal};
 };
 const cells=modularityCells.map(createCell),focusCell=createCell(configurationPosition,6);
 // Thin configuration panes form from their actual sampled surfaces, using the same reveal.
 const panelSources=Array.from({length:3},(_,i)=>new T.PlaneGeometry(1.9-i*.14,1.6-i*.10,1,1).translate(.2*i,.17*i,1.42+i*.21));
 const panelGeometry=own(mergeGeometries(panelSources)!);panelSources.forEach(geometry=>geometry.dispose());
 const configuration=new T.Group();scene.add(configuration);
 const panelMaterial=own(glassFace('front',false,true,'home','near'));panelMaterial.userData.homeCellTone='light';
 const panels=new T.Mesh(panelGeometry,panelMaterial);panels.scale.setScalar(.64);panels.position.set(-.03,-.12,.07);configuration.add(panels);
 const panelReveal=createLotReveal(configuration,panelGeometry,own,own,{surfaceSamples:0,componentSamples:1500});panelReveal.bind(panelMaterial);
 // Local contact shadows ground the assembly without adding an opaque canvas background.
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
 const context=shadowCanvas.getContext('2d')!,gradient=context.createRadialGradient(64,64,5,64,64,62);gradient.addColorStop(0,'rgba(5,27,46,.32)');gradient.addColorStop(1,'rgba(5,27,46,0)');context.fillStyle=gradient;context.fillRect(0,0,128,128);
 const shadowTexture=own(new T.CanvasTexture(shadowCanvas)),shadowMaterial=own(new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.4}));
 const shadow=new T.Mesh(own(new T.PlaneGeometry(6.5,5.5)),shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.71;scene.add(shadow);
 const review=new URLSearchParams(location.search).get('modularity-time'),reviewTime=review===null?null:Number(review);
 let held=reviewTime!==null&&Number.isFinite(reviewTime);
 let frame=0,previous=0,time=held?T.MathUtils.clamp(reviewTime!,0,MODULARITY_DURATION):0,transition=1,manual:number|undefined,visible=false,disposed=false,lastSelection=-1,palette='';
 function draw(){
  const dark=document.documentElement.dataset.theme==='dark',state=modularityFrame(time,manual),formation=[state.core,...state.packs];
  if(palette!==String(dark)){
   palette=String(dark);
   cells.forEach((cell,index)=>{
    const internal=normals.map(normal=>modularityCells.some((other,j)=>j!==index&&other.every((v,axis)=>Math.abs(v-modularityCells[index][axis]-normal[axis]*1.72)<.001)));
    updateLatticeCellMaterials(cell.materials,dark,internal);
   });
   setGlass(panelMaterial,'front',dark);panelMaterial.opacity=dark?.24:.22;panelMaterial.roughness=.16;
  }
  cells.forEach((cell,index)=>{
   cell.reveal.update(formation[index],0,time,dark,renderer.getPixelRatio());
   const active=index===state.selected+1,glow=active?state.configuration*.075:0;
   cell.materials.forEach(material=>material.emissiveIntensity=material.userData.baseEmissive+glow);
  });
  configuration.position.fromArray(configurationPosition);
  const configForm=manual===undefined?state.configuration:transition;
  focusCell.root.visible=configForm>0;focusCell.reveal.update(configForm,0,time,dark,renderer.getPixelRatio());
  focusCell.materials.forEach((material,face)=>{material.userData.homeCellTone=cells[state.selected+1].materials[face].userData.homeCellTone;setGlass(material,kinds[face],dark);material.emissiveIntensity+=configForm*.035;});
  focusCell.mesh.userData.pack=state.selected;
  panelReveal.update(Math.max(0,(configForm-.2)/.8),0,time,dark,renderer.getPixelRatio());configuration.visible=configForm>.2;
  shadowMaterial.opacity=(dark?.35:.5)*state.core;
  renderer.render(scene,camera);
  host.dataset.sceneState='live';host.dataset.particleMotion='surface-particles';host.dataset.stage=String(state.stage);host.dataset.selected=String(state.selected);host.dataset.animationTime=time.toFixed(3);host.dataset.formation=formation.map(n=>n.toFixed(3)).join(',');host.dataset.configuration=configForm.toFixed(3);host.dataset.particles=String(cells.some(cell=>cell.reveal.points.visible)||focusCell.root.visible&&focusCell.reveal.points.visible||configuration.visible&&panelReveal.points.visible);host.dataset.complete=String(state.complete&&transition>=1);
  if(lastSelection!==state.selected){lastSelection=state.selected;onSelect(state.selected);}
 }
 const needsFrame=()=>!held&&(time<MODULARITY_DURATION||transition<1);
 function stop(){cancelAnimationFrame(frame);frame=0;previous=0;}
 function tick(now:number){frame=0;if(disposed||!visible||document.hidden)return;const delta=previous?Math.min((now-previous)/1000,.05):0;previous=now;time=Math.min(MODULARITY_DURATION,time+delta);transition=Math.min(1,transition+delta/1.7);draw();if(needsFrame())frame=requestAnimationFrame(tick);}
 function start(){if(!disposed&&visible&&!document.hidden&&!frame&&needsFrame()){previous=0;frame=requestAnimationFrame(tick);}}
 function resize(){const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height,span=Math.max(6.2,6.4/aspect);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();draw();}
 const resizeObserver=new ResizeObserver(resize),themeObserver=new MutationObserver(draw),view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else stop();});resizeObserver.observe(canvas);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});view.observe(canvas);
 const visibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',visibility);
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();
 const hit=(event:MouseEvent)=>{const bounds=canvas.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);raycaster.setFromCamera(pointer,camera);const target=raycaster.intersectObjects([...cells.map(cell=>cell.mesh),...(focusCell.root.visible?[focusCell.mesh]:[])],false)[0];return target&&target.object.userData.pack>=0?target:undefined;};
 const click=(event:MouseEvent)=>{const target=hit(event);if(target)host.dispatchEvent(new CustomEvent('modularity:select',{detail:target.object.userData.pack}));};
 const hover=(event:MouseEvent)=>{canvas.style.cursor=hit(event)?'pointer':'default';};canvas.addEventListener('click',click);canvas.addEventListener('mousemove',hover);
 resize();
 return {select(index:number){held=false;manual=T.MathUtils.clamp(index,0,4);time=MODULARITY_DURATION;transition=0;stop();draw();start();},dispose(){disposed=true;stop();resizeObserver.disconnect();themeObserver.disconnect();view.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('click',click);canvas.removeEventListener('mousemove',hover);resources.forEach(resource=>resource.dispose());environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
