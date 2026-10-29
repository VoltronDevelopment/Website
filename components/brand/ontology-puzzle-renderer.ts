import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createArtworkEnvironment,addArtworkSoftboxes} from './artwork-studio';
import {createStoryFormation} from './story-formation';
import {createSceneHandoff} from '../performance/scene-handoff';
import {createRenderQuality,prefersStaticScene} from '../performance/scene-policy';
import {ontologyPuzzleDuration,ontologyPuzzleState} from './ontology-puzzle-timeline';
import type {EngineeredController,SceneMode} from './engineered-hero-renderer';

/** The whole bamboo house: 48 sticks form from particles, then slide into the locked assembly. */
export async function mountOntologyPuzzle(canvas:HTMLCanvasElement,host:HTMLDivElement,onMode:(mode:SceneMode)=>void,signal:AbortSignal):Promise<EngineeredController>{
 const handoff=createSceneHandoff(host,canvas),query=new URLSearchParams(location.search),capture=query.has('scene-capture');
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:capture});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const quality=createRenderQuality(canvas,1.5);renderer.setPixelRatio(quality.ratio);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-3,3,3,-3,.1,40),target=new T.Vector3(0,0,0);
 const elevation=Math.asin(1/Math.sqrt(3)),orbit=9;
 camera.position.set(orbit*Math.cos(elevation)*Math.SQRT1_2,orbit*Math.sin(elevation),orbit*Math.cos(elevation)*Math.SQRT1_2);camera.lookAt(target);
 const environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene,target);
 const key=new T.DirectionalLight(0xffffff,3.2);key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key,new T.HemisphereLight(0xeef7ff,0x314c68,1.2));
 const resources:{dispose():void}[]=[],track=<R extends {dispose():void}>(r:R)=>{resources.push(r);return r;};
 const pearl=track(new T.MeshPhysicalMaterial({color:0xd9eef8,metalness:.22,roughness:.2,clearcoat:1,clearcoatRoughness:.1,envMapIntensity:1.05})),smoked=track(new T.MeshPhysicalMaterial({color:0x314e68,metalness:.38,roughness:.26,clearcoat:.92,clearcoatRoughness:.14,envMapIntensity:.9}));
 const palette=[{material:pearl,light:0xd9eef8,dark:0x8eafc6},{material:smoked,light:0x314e68,dark:0x1a3348}];
 let disposed=false,paused=false,frozen=false,visible=false,lost=false,frame=0,last=0,time=.4,formation:ReturnType<typeof createStoryFormation>|undefined;
 const review=query.get('hero-time');if(review!==null&&Number.isFinite(+review)){time=T.MathUtils.clamp(+review,0,ontologyPuzzleDuration);frozen=true;}
 const gltf=await new GLTFLoader().loadAsync('/bamboo_puzzle_prison_house/scene.gltf');if(signal.aborted||disposed){environment.dispose();renderer.dispose();throw new DOMException('Aborted','AbortError');}
 const assembly=gltf.scene.getObjectByName('SOLIDOS_Bamboo_Puzzle_Prison_House_(assembly)');if(!assembly)throw Error('Puzzle assembly unavailable');
 gltf.scene.updateMatrixWorld(true);
 const pivot=new T.Group();scene.add(pivot);const puzzle=new T.Group();pivot.add(puzzle);puzzle.attach(assembly);
 const center=new T.Box3().setFromObject(puzzle).getCenter(new T.Vector3());puzzle.position.sub(center);
 const span=Math.max(...new T.Box3().setFromObject(puzzle).getSize(new T.Vector3()).toArray());
 pivot.scale.setScalar(2.35/Math.max(span,.001));pivot.updateMatrixWorld(true);
 const cells=assembly.children.filter(child=>child.name.includes('assembled_'));
 const pieces=cells.flatMap(cell=>cell.children).map((child,index)=>{child.traverse(o=>{if(o instanceof T.Mesh){o.material=index%2?smoked:pearl;o.castShadow=true;o.receiveShadow=true;}});const rest=child.position.clone();const mid=new T.Box3().setFromObject(child).getCenter(new T.Vector3());const outward=mid.lengthSq()>1e-8?mid.normalize():new T.Vector3(index%2?1:-1,0,0);const shifted=child.getWorldPosition(new T.Vector3()).addScaledVector(outward,.42);child.parent!.worldToLocal(shifted);return {child,rest,offset:shifted.sub(rest)};});
 if(pieces.length!==48)throw Error('Puzzle assembly unavailable');
 pieces.forEach(({child,rest,offset})=>child.position.copy(rest).add(offset));
 formation=createStoryFormation(pivot,matchMedia('(max-width:767px)').matches?4800:9600,3);scene.add(formation.points);
 const dark=()=>document.documentElement.dataset.theme==='dark';
 function draw(){if(disposed||lost)return;const state=ontologyPuzzleState(time),night=dark();palette.forEach(p=>p.material.color.setHex(night?p.dark:p.light));
  pieces.forEach(({child,rest,offset})=>child.position.copy(rest).addScaledVector(offset,1-state.fit));
  formation?.update(state.form,time,night,renderer.getPixelRatio());
  renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.theme=night?'dark':'light';canvas.dataset.ready='true';canvas.dataset.settled=String(state.done);host.dataset.phase=state.phase;host.dataset.pieces=String(state.pieces);host.dataset.fit=state.fit.toFixed(3);}
 function size(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);const aspect=r.width/r.height;pivot.updateWorldMatrix(true,true);const fit=new T.Box3().setFromObject(pivot).getBoundingSphere(new T.Sphere()).radius*2.45;const h=Math.max(fit,3.1/aspect);camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;camera.lookAt(target);camera.updateProjectionMatrix();draw();}
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
