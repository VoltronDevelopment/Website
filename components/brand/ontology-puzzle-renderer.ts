import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createArtworkEnvironment,addArtworkSoftboxes} from './artwork-studio';
import {createStoryFormation} from './story-formation';
import {createSceneHandoff} from '../performance/scene-handoff';
import {createRenderQuality,prefersStaticScene} from '../performance/scene-policy';
import {ontologyPuzzleDuration,ontologyPuzzleState} from './ontology-puzzle-timeline';
import type {EngineeredController,SceneMode} from './engineered-hero-renderer';

/** One bamboo puzzle: four sticks form from particles, then slide into the locked assembly. */
export async function mountOntologyPuzzle(canvas:HTMLCanvasElement,host:HTMLDivElement,onMode:(mode:SceneMode)=>void,signal:AbortSignal):Promise<EngineeredController>{
 const handoff=createSceneHandoff(host,canvas),query=new URLSearchParams(location.search),capture=query.has('scene-capture');
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:capture});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const quality=createRenderQuality(canvas,1.5);renderer.setPixelRatio(quality.ratio);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-3,3,3,-3,.1,40),target=new T.Vector3(0,.15,0);
 camera.position.set(3.4,2.6,4.6);camera.lookAt(target);
 const environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene,target);
 const key=new T.DirectionalLight(0xffffff,3.2);key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key,new T.HemisphereLight(0xeef7ff,0x314c68,1.2));
 const resources:{dispose():void}[]=[],track=<R extends {dispose():void}>(r:R)=>{resources.push(r);return r;};
 const pearl=track(new T.MeshPhysicalMaterial({color:0xd9eef8,metalness:.22,roughness:.2,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:1.05})),smoked=track(new T.MeshPhysicalMaterial({color:0x314e68,metalness:.38,roughness:.26,clearcoat:.92,clearcoatRoughness:.14,envMapIntensity:.9}));
 const palette=[{material:pearl,light:0xd9eef8,dark:0x8eafc6},{material:smoked,light:0x314e68,dark:0x1a3348}];
 let disposed=false,paused=false,frozen=false,visible=false,lost=false,frame=0,last=0,time=.4,formation:ReturnType<typeof createStoryFormation>|undefined;
 const review=query.get('hero-time');if(review!==null&&Number.isFinite(+review)){time=T.MathUtils.clamp(+review,0,ontologyPuzzleDuration);frozen=true;}
 const gltf=await new GLTFLoader().loadAsync('/bamboo_puzzle_prison_house/scene.gltf');if(signal.aborted||disposed){environment.dispose();renderer.dispose();throw new DOMException('Aborted','AbortError');}
 const unitNames=['SOLIDOS_Bamboo_Puzzle_Prison_House_(assembled_A)','SOLIDOS_Bamboo_Puzzle_Prison_House_(assembled_B)'];
 const units=unitNames.map(name=>gltf.scene.getObjectByName(name)).filter((unit):unit is T.Object3D=>Boolean(unit));if(units.length<2)throw Error('Puzzle assembly unavailable');
 const puzzle=new T.Group();scene.add(puzzle);units.forEach(unit=>puzzle.add(unit));puzzle.updateWorldMatrix(true,true);
 const bounds=new T.Box3().setFromObject(puzzle),center=bounds.getCenter(new T.Vector3()),extent=bounds.getSize(new T.Vector3());
 puzzle.worldToLocal(center);units.forEach(unit=>unit.position.sub(center));
 const pieces=units.flatMap(unit=>unit.children).map((child,index)=>{child.traverse(o=>{if(o instanceof T.Mesh){o.material=index%2?smoked:pearl;o.castShadow=true;o.receiveShadow=true;}});const rest=child.position.clone(),box=new T.Box3().setFromObject(child),mid=box.getCenter(new T.Vector3());const dir=mid.lengthSq()>.0001?mid.normalize():new T.Vector3(index<2?1:-1,0,0);return {child,rest,dir};});
 const span=Math.max(extent.x,extent.y,extent.z);
 pieces.forEach(({child,rest,dir})=>child.position.copy(rest).addScaledVector(dir,span*.2));
 puzzle.scale.setScalar(2.2/span);puzzle.rotation.x=-.62;puzzle.rotation.y=.9;
 formation=createStoryFormation(puzzle,matchMedia('(max-width:767px)').matches?3600:6400,3);scene.add(formation.points);
 const dark=()=>document.documentElement.dataset.theme==='dark';
 function draw(){if(disposed||lost)return;const state=ontologyPuzzleState(time),night=dark();palette.forEach(p=>p.material.color.setHex(night?p.dark:p.light));
  pieces.forEach(({child,rest,dir})=>child.position.copy(rest).addScaledVector(dir,(1-state.fit)*span*.2));
  formation?.update(state.form,time,night,renderer.getPixelRatio());
  renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.theme=night?'dark':'light';canvas.dataset.ready='true';canvas.dataset.settled=String(state.done);host.dataset.phase=state.phase;host.dataset.pieces=String(state.pieces);host.dataset.fit=state.fit.toFixed(3);}
 function size(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);const aspect=r.width/r.height,h=Math.max(2.8,3.2/aspect);camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();draw();}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;quality.reset();}
 function schedule(){if(!disposed&&!lost&&!prefersStaticScene()&&!paused&&!frozen&&visible&&!document.hidden&&!frame&&time<ontologyPuzzleDuration)frame=requestAnimationFrame(tick);}
 function tick(now:number){frame=0;if(disposed||lost||!visible||document.hidden||paused||frozen)return;time=Math.min(ontologyPuzzleDuration,time+(last?Math.min(.08,(now-last)/1000):0));last=now;if(quality.sample(now)){renderer.setPixelRatio(quality.ratio);size();}draw();if(time<ontologyPuzzleDuration)frame=requestAnimationFrame(tick);else{stop();onMode('settled');}}
 const view=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)schedule();else stop();},{threshold:.05});view.observe(host);
 const theme=new MutationObserver(draw);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const sizing=new ResizeObserver(size);sizing.observe(host);
 const lostContext=(e:Event)=>{e.preventDefault();lost=true;stop();handoff.fallback();host.dataset.fallback='true';onMode('settled');};
 canvas.addEventListener('webglcontextlost',lostContext);
 if(prefersStaticScene())time=ontologyPuzzleDuration;
 size();await handoff.reveal();if(disposed){onMode('settled');return {toggle(){},replay(){},seek(){},dispose(){}};}host.dataset.sceneState='live';onMode(time>=ontologyPuzzleDuration?'settled':'playing');schedule();
 return {toggle(){if(time>=ontologyPuzzleDuration)return;paused=!paused;onMode(paused?'paused':'playing');if(paused)stop();else{last=0;schedule();}},replay(){frozen=false;paused=false;time=0;draw();onMode('playing');last=0;schedule();},seek(seconds:number){frozen=true;stop();time=T.MathUtils.clamp(seconds,0,ontologyPuzzleDuration);draw();onMode('settled');},dispose(){disposed=true;stop();view.disconnect();sizing.disconnect();theme.disconnect();canvas.removeEventListener('webglcontextlost',lostContext);formation?.dispose();resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();handoff.dispose();}};
}
