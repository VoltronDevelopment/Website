import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {homeCells} from '../navigation/lattice-transition';
import {duration,offsets,stateAt,fragmentAt,revealCells,retainedCells,chamberCell,smooth,scanAt} from './hero-timeline';
import {createHomeChamber} from './home-chamber';
import {createVoltronMark} from './voltron-mark';
import {glassFace,setGlass,stroke,strokeMaterial,type GlassFace} from './lattice-materials';
import {homeCellTone} from './home-glass';
import {createArtworkEnvironment,addArtworkSoftboxes,edgePrism,createFloorEcho} from '../brand/artwork-studio';
import {observeArtworkTuning,artworkDefaults} from '../brand/artwork-tuning';
import {createRenderQuality,yieldToBrowser} from '../performance/scene-policy';
import {sizeHeroSurface} from './hero-surface';
import {sceneOpeningTime} from '@/lib/scene-continuity';
import type {HeroController,SharedHeroResources} from './hero-renderer';

type Options={immediate?:boolean;deferStart?:boolean;shared?:SharedHeroResources;static?:boolean};
const faceDefs:[GlassFace,number[],number[]][]=[['side',[1,0,0],[0,Math.PI/2,0]],['side',[-1,0,0],[0,-Math.PI/2,0]],['top',[0,1,0],[-Math.PI/2,0,0]],['bottom',[0,-1,0],[Math.PI/2,0,0]],['front',[0,0,1],[0,0,0]],['rear',[0,0,-1],[0,Math.PI,0]]];
const edgePairs=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
export function mountHomeReveal(canvas:HTMLCanvasElement,host:HTMLDivElement,hero:HTMLElement,options:Options={}):HeroController{
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,40);
 const target=new THREE.Vector3(0,1,0);camera.position.set(6,5.25,8);camera.lookAt(target);camera.updateMatrixWorld();
 const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1),forward=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,2);
 const board=(x:number,y:number,z=0)=>target.clone().addScaledVector(right,x).addScaledVector(up,y).addScaledVector(forward,z);
 const resources=new Set<{dispose():void}>(),track=<T extends {dispose():void}>(v:T):T=>{resources.add(v);return v;};
 const quality=createRenderQuality(canvas,2),query=new URLSearchParams(location.search),review=query.get('hero-time'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let renderer:THREE.WebGLRenderer,logo:THREE.Mesh<THREE.ExtrudeGeometry,THREE.Material[]>,inkWidth=.94,inkHeight=1.0,logoY=1.4,ambient=0;
 let disposed=false,started=!options.deferStart,paused=review!==null,frozen=review!==null,visible=true,lost=false,frame=0,last=0,time=review===null?(options.immediate?duration:sceneOpeningTime.home):Math.min(duration,Math.max(0,Number(review)||0)),frames=0,tuning={...artworkDefaults};
 const key=new THREE.DirectionalLight(0xffffff,2.5),fill=new THREE.HemisphereLight(0xddefff,0x243c56,.85);key.position.set(-3,6,5);scene.add(key,fill);addArtworkSoftboxes(scene,target);
 const corners=Array.from({length:8},(_,i)=>new THREE.Vector3(i&1?.5:-.5,i&2?.5:-.5,i&4?.5:-.5));
 const railGeometry=(size:number)=>{const parts=edgePairs.map(([a,b])=>edgePrism(corners[a].clone().multiplyScalar(size),corners[b].clone().multiplyScalar(size),size===1?.006:.0035));const g=track(mergeGeometries(parts)!);parts.forEach(v=>v.dispose());return g;};
 const rails=railGeometry(1),smallRails=railGeometry(.5),plane=track(new THREE.PlaneGeometry(1,1));
 const faceGeometries=faceDefs.map(([, ,rotation])=>{const geometry=track(plane.clone());geometry.rotateX(rotation[0]);geometry.rotateY(rotation[1]);geometry.rotateZ(rotation[2]);return geometry;});
 function cell(size:number,index:number,fragment=false,child=0){
  const group=new THREE.Group(),panes=faceDefs.map(([kind,normal],faceIndex)=>{
   const material=track(glassFace(kind,false,true,'home',kind==='top'?'crown':normal[0]<0||kind==='rear'?'recess':'clear'));material.userData.homeCellTone=homeCellTone(homeCells[index]);
   const mesh=new THREE.Mesh(faceGeometries[faceIndex],material);mesh.scale.setScalar(size);mesh.position.fromArray(normal).multiplyScalar(size/2);group.add(mesh);
   const neighbor=homeCells.findIndex(c=>c.every((v,i)=>v===homeCells[index][i]+normal[i]));
   const internal=fragment&&normal.some((v,i)=>v!==0&&((child>>i)&1)===(v<0?1:0));
   return {material,kind,normal,neighbor,internal};
  });
  const rimMaterial=track(new THREE.MeshPhysicalMaterial({color:0xabcfe8,metalness:.45,roughness:.12,clearcoat:1,transparent:true,depthWrite:false,envMapIntensity:1.3}));
  group.add(new THREE.Mesh(fragment?smallRails:rails,rimMaterial));
  const edgeMaterial=track(strokeMaterial(true));edgeMaterial.userData.cssWidth=fragment?.65:.8;
  const edge=stroke(edgePairs.flatMap(([a,b])=>[corners[a].clone().multiplyScalar(size),corners[b].clone().multiplyScalar(size)]),edgeMaterial);track(edge.geometry);group.add(edge);scene.add(group);
  return {group,panes,rimMaterial,edgeMaterial,index,fragment,child};
 }
 const parents=homeCells.map((_,i)=>cell(1,i)),children=revealCells.flatMap((index,p)=>Array.from({length:8},(_,child)=>({...cell(.5,index,true,child),parent:p})));
 const chamber=createHomeChamber(parents[chamberCell].group,camera,track);
 const divisionMat=track(new THREE.LineBasicMaterial({color:0x8edbff,transparent:true,opacity:0,depthWrite:false}));
 const divisions=revealCells.map(i=>{const lines:number[]=[];for(let axis=0;axis<3;axis++)for(let side=-1;side<=1;side+=2){const other=(axis+1)%3,last=(axis+2)%3;for(const dir of [other,last]){const a=[0,0,0],b=[0,0,0];a[axis]=b[axis]=side*.502;a[dir]=-.5;b[dir]=.5;lines.push(...a,...b);}}const g=track(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));const line=new THREE.LineSegments(g,divisionMat);line.position.fromArray(homeCells[i]);scene.add(line);return line;});
 const scanLines=homeCells.map((c,index)=>{const from=new THREE.Vector3(c[0]-.5,c[1]+.5,c[2]+.5),to=from.clone().add(new THREE.Vector3(1,0,0)),material=track(strokeMaterial(true));material.userData.cssWidth=1.7;const line=stroke([from,to],material);track(line.geometry);scene.add(line);return {from,to,line,material,index};});
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const ctx=glowCanvas.getContext('2d')!,gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(75,174,245,.35)');gradient.addColorStop(.3,'rgba(46,124,211,.13)');gradient.addColorStop(1,'rgba(46,124,211,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const glowTexture=track(new THREE.CanvasTexture(glowCanvas));
 const floorMat=track(new THREE.MeshBasicMaterial({map:glowTexture,transparent:true,opacity:.5,depthWrite:false,toneMapped:false})),floor=new THREE.Mesh(track(new THREE.PlaneGeometry(4.4,3.5)),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.018;scene.add(floor);
 const shadows=homeCells.slice(0,4).map(()=>{const m=track(new THREE.MeshBasicMaterial({map:glowTexture,color:0x020811,transparent:true,opacity:0,depthWrite:false,toneMapped:false})),shadow=new THREE.Mesh(plane,m);shadow.rotation.x=-Math.PI/2;shadow.scale.setScalar(1.5);shadow.position.y=-.005;scene.add(shadow);return shadow;});
 const junctionMat=track(new THREE.SpriteMaterial({map:glowTexture,transparent:true,opacity:0,depthWrite:false,toneMapped:false})),junction=new THREE.Sprite(junctionMat);junction.position.set(0,1.015,0);junction.scale.setScalar(.45);scene.add(junction);
 const logoLightMaterial=track(new THREE.SpriteMaterial({map:glowTexture,color:0x2596e5,transparent:true,depthWrite:false,opacity:0,toneMapped:false})),logoLight=new THREE.Sprite(logoLightMaterial);logoLight.position.copy(board(0,logoY,.25));logoLight.scale.set(2.3,2.6,1);scene.add(logoLight);
 const echo=track(createFloorEcho(parents.map(c=>c.group),0));scene.add(echo.group);
 const dark=()=>document.documentElement.dataset.theme==='dark';
 function theme(){
  for(const c of [...parents,...children]){for(const pane of c.panes){setGlass(pane.material,pane.kind,dark());pane.material.opacity*=pane.kind==='front'?.48:homeCellTone(homeCells[c.index])==='dark'?.65:.82;pane.material.userData.restOpacity=pane.material.opacity*tuning.glassOpacity;pane.material.roughness=(pane.kind==='front'?.18:.10)*tuning.roughness;pane.material.envMapIntensity=(pane.kind==='front'?.3:1.05)*tuning.reflection;pane.material.clearcoat=.85;pane.material.userData.homeReflectionGain.value=homeCellTone(homeCells[c.index])==='dark'?.4:.85;
   const transmission=!c.fragment&&pane.kind==='side'&&pane.normal[0]>0?tuning.transmission*.25:0;if((pane.material.transmission>0)!==(transmission>0))pane.material.needsUpdate=true;pane.material.transmission=transmission;pane.material.thickness=.025;}
   c.rimMaterial.color.setHex(dark()?0x99c7e6:0xc5e1f1);c.edgeMaterial.color.setHex(dark()?0xb2ddf4:0x5594c4);}
  key.intensity=dark()?2.2:3;key.position.x=-3+Math.sin(tuning.keyDirection)*4;draw();
 }
 // The protected rectangle is in fixed camera-board units, identical at every viewport.
 function clearance(group:THREE.Group,size:number){group.updateMatrixWorld(true);const points=corners.map(p=>p.clone().multiplyScalar(size).applyMatrix4(group.matrixWorld).sub(target));const xs=points.map(p=>p.dot(right)),ys=points.map(p=>p.dot(up));const l=0-inkWidth*.5-inkWidth*.225,r=0+inkWidth*.5+inkWidth*.225,b=logoY-inkHeight*.5-inkWidth*.14,t=logoY+inkHeight*.5+inkWidth*.225;return Math.max(l-Math.max(...xs),Math.min(...xs)-r,b-Math.max(...ys),Math.min(...ys)-t);}
 function draw(){if(disposed||!renderer||!logo||lost)return;const state=stateAt(time+ambient);let fragmentCount=0,violations=0;
  parents.forEach((c,i)=>{const a=state.arrivals[i],remaining=1-a.travel;c.group.visible=a.visible&&state.parent(i)>0;c.group.position.fromArray(homeCells[i]).addScaledVector(new THREE.Vector3(...offsets[i]),remaining);c.group.rotation.set(remaining*.035,remaining*(i%2?.04:-.04),remaining*.025);
   if(i===chamberCell){c.group.position.lerp(board(0,logoY,.05),state.chamberLift);c.group.scale.setScalar(1+state.chamberLift*.22);}
   for(const pane of c.panes){const neighborPresent=!(i===chamberCell&&state.chamberLift>.01)&&pane.neighbor>=0&&state.parent(pane.neighbor)>0&&!(pane.neighbor===chamberCell&&state.chamberLift>.01);const alpha=smooth(a.progress/.2);pane.material.opacity=neighborPresent?.008:pane.material.userData.restOpacity*alpha;pane.material.emissiveIntensity=.008+(revealCells.some(n=>n===i)?state.activation*.09:state.response*.025)*tuning.glow;}
   c.rimMaterial.opacity=(.36+(revealCells.some(n=>n===i)?state.activation*.24:state.response*.12))*smooth(a.progress/.2)*tuning.outline;
   c.edgeMaterial.opacity=(.46+state.activation*(revealCells.some(n=>n===i)?.2:0))*smooth(a.progress/.2)*tuning.outline;
   if(c.group.visible&&i!==chamberCell&&state.logo>.01&&clearance(c.group,1)<-.001)violations++;
   if(i===chamberCell&&time>=5)c.edgeMaterial.opacity=0;
  });
  children.forEach(c=>{const f=fragmentAt(time,c.parent,c.child);c.group.position.fromArray(homeCells[c.index]).add(new THREE.Vector3(...f.offset)).add(new THREE.Vector3(...f.separation)).addScaledVector(right,f.shift[0]).addScaledVector(up,f.shift[1]).addScaledVector(forward,f.shift[2]);c.group.scale.setScalar(f.scale);c.group.rotation.set(...f.rotation);
   // A soft, deterministic early fade prevents any fragment crossing the clear logo zone.
   const gap=clearance(c.group,.5),protection=time<3.8?1:1-smooth((time-3.8)/.35)*(1-smooth(gap/.18));const opacity=f.opacity*protection;c.group.visible=state.children&&opacity>.002;
   if(c.group.visible){fragmentCount++;if(state.logo>0&&gap<0)violations++;}
   c.panes.forEach(p=>p.material.opacity=p.material.userData.restOpacity*opacity*(p.internal?smooth(f.travel/.2)*.32:p.neighbor>=0?smooth(f.travel/.12):1));c.rimMaterial.opacity=.5*opacity*tuning.outline;c.edgeMaterial.opacity=.6*opacity*tuning.outline;
  });
  divisions.forEach(d=>d.visible=state.activation>0);divisionMat.opacity=state.activation*.24;
  shadows.forEach((shadow,i)=>{shadow.position.x=parents[i].group.position.x;shadow.position.z=parents[i].group.position.z;shadow.material.opacity=smooth(state.arrivals[i].progress/.3)*(dark()?.4:.7);shadow.scale.setScalar(1.3+.3*(1-state.arrivals[i].travel));});
  scanLines.forEach(({from,to,line,material,index})=>{const scan=scanAt(time,index);line.visible=scan.visible;const a=from.clone().lerp(to,scan.tail),b=from.clone().lerp(to,scan.head);line.geometry.attributes.instanceStart.setXYZ(0,a.x,a.y,a.z);line.geometry.attributes.instanceEnd.setXYZ(0,b.x,b.y,b.z);line.geometry.attributes.instanceStart.needsUpdate=true;line.geometry.attributes.instanceEnd.needsUpdate=true;line.geometry.computeBoundingSphere();material.opacity=scan.strength*.75*tuning.glow;material.color.setHex(dark()?0xc4efff:0x238cea);});
  chamber.update(time,state.slice,dark(),state.pulse,state.logo);
  logo.material.forEach(m=>m.opacity=state.logo);logo.visible=state.logo>0;
  const glow=0; // The identity face stays steady; the retained physical shell owns the pulse.
  logoLightMaterial.opacity=glow;junctionMat.opacity=state.logo*(.12+state.pulse*.12)*tuning.glow;
  floorMat.opacity=state.ground*(dark()?.7:.4)+state.pulse*.035;echo.update(state.ground*(dark()?.65:.8));
  canvas.dataset.logoConnection='0';canvas.dataset.logoTexture='extruded-original-alpha';canvas.dataset.diagonalSlice=state.slice.toFixed(3);canvas.dataset.ambientTime=ambient.toFixed(3);
  renderer.autoClear=true;renderer.setRenderTarget(null);renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.settled=String(state.done);canvas.dataset.renderedFrames=String(++frames);canvas.dataset.theme=dark()?'dark':'light';canvas.dataset.cells='7';canvas.dataset.remainingCells=String(parents.filter(c=>c.group.visible).length);canvas.dataset.fragments=String(fragmentCount);canvas.dataset.fragmentTotal=String(children.length);canvas.dataset.logoClearanceViolations=String(violations);canvas.dataset.logoOpacity=state.logo.toFixed(3);canvas.dataset.blurAmount='0.000';canvas.dataset.glassTreatment='diagonal-particle-reveal';canvas.dataset.logoGlowOpacity=glow.toFixed(3);canvas.dataset.scanStrength=String(Math.max(0,...scanLines.map(s=>scanAt(time,s.index).strength)));canvas.dataset.continuousRendering=String(!!frame);canvas.dataset.upperFrontEmpty='true';canvas.dataset.composition='home';
  host.dataset.sceneMode=paused||frozen?'paused':state.done&&!motion.matches?'ambient':state.done?'settled':'playing';host.dataset.phase=state.done?'settled':time<2.4?'assembling':time<2.95?'subdividing':time<4.7?'withdrawing':time<6.8?'diagonal-slice':time<8?'revealing':'settling';hero.style.setProperty('--grid-opacity',dark()?'.035':'.03');
 }
 function size(){if(!renderer||!logo||disposed)return;const {width,height}=host.getBoundingClientRect();if(!width||!height)return;const extent=Math.max(4.8,4.8/(width/height));camera.left=-extent*width/height/2;camera.right=extent*width/height/2;camera.top=extent/2;camera.bottom=-extent/2;camera.updateProjectionMatrix();sizeHeroSurface(renderer,[],width,height,quality.ratio);draw();}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;canvas.dataset.continuousRendering='false';}
 function tick(now:number){frame=0;if(disposed||lost||paused||frozen||!visible||document.hidden)return;const delta=last?Math.max(0,Math.min(.1,(now-last)/1000)):0;ambient+=time>=duration?delta:0;time=Math.min(duration,time+delta);last=now;if(quality.sample(now))size();draw();if(!motion.matches){frame=requestAnimationFrame(tick);canvas.dataset.continuousRendering='true';}else stop();}
 function schedule(){if(!disposed&&!lost&&started&&!paused&&!frozen&&visible&&!document.hidden&&!motion.matches&&!frame){last=0;frame=requestAnimationFrame(tick);}}
 function controls(e:Event){const detail=(e as CustomEvent).detail;if(detail?.action==='seek'){stop();time=THREE.MathUtils.clamp(Number(detail.time)||0,0,duration);frozen=true;paused=true;draw();}else if(detail?.action==='replay'){stop();time=0;ambient=0;frozen=paused=false;started=true;draw();schedule();}else{paused=!paused;if(paused)stop();else{frozen=false;schedule();}draw();}}
 function visibility(){if(document.hidden)stop();else schedule();}
 function preference(){if(motion.matches){stop();time=duration;ambient=0;draw();}else schedule();}
 function contextLost(event:Event){event.preventDefault();lost=true;stop();canvas.hidden=true;host.dataset.scenePose='complete';host.dataset.sceneState='fallback';host.dataset.sceneMode='static';}
 function restored(){lost=false;canvas.hidden=false;theme();size();host.dataset.sceneState='live';schedule();}
 const resize=new ResizeObserver(size),themes=new MutationObserver(theme),view=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)schedule();else stop();});
 const cleanup=Object.assign(()=>{disposed=true;stop();resize.disconnect();themes.disconnect();view.disconnect();host.removeEventListener('hero-control',controls);document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',preference);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',restored);resources.forEach(r=>r.dispose());if(!options.shared)renderer?.dispose();},{ready:Promise.resolve(),pause(){stop();started=false;},start(){started=true;schedule();},beginMorph(){stop();},morph(){size();}}) as HeroController;
 cleanup.ready=(async()=>{try{
  canvas.hidden=false;if(options.static)throw Error('Static artwork requested');renderer=options.shared?.renderer??new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;scene.environment=options.shared?.environment??track(createArtworkEnvironment(renderer)).texture;
  const texture=options.shared?.texture??track(await new THREE.TextureLoader().loadAsync('/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png'));if(disposed){if(!options.shared?.texture)texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const source=document.createElement('canvas'),image=texture.image as HTMLImageElement;source.width=image.width;source.height=image.height;const c=source.getContext('2d')!;c.drawImage(image,0,0);const pixels=c.getImageData(0,0,source.width,source.height).data;let x0=source.width,y0=source.height,x1=0,y1=0;for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixels[(y*source.width+x)*4+3]>32){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const scale=inkWidth/((x1-x0+1)/source.width);inkHeight=(y1-y0+1)/source.height*scale;const baseTop=Math.max(...retainedCells.flatMap(i=>corners.map(p=>p.clone().add(new THREE.Vector3(...homeCells[i])).sub(target).dot(up))));const halfBottom=Math.min(...[...corners.filter(p=>p.z<0),...corners.filter(p=>p.z>0).map(p=>new THREE.Vector3(p.x,p.y,0))].map(p=>p.dot(up)))*1.22;logoY=baseTop-halfBottom+.10;logoLight.position.copy(board(0,logoY,.25));
  logo=await createVoltronMark(pixels,source.width,source.height,[x0,y0,x1,y1],inkWidth);
  if(disposed){logo.geometry.dispose();logo.material.forEach(m=>m.dispose());return;}track(logo.geometry);logo.material.forEach(track);
  logo.quaternion.identity();logo.position.copy(board(0,logoY,.05)).add(new THREE.Vector3(0,0,.025));scene.add(logo);
  if(options.immediate||motion.matches)time=duration;track(observeArtworkTuning('home',value=>{tuning=value;theme();}));theme();await yieldToBrowser();if(disposed)return;await renderer.compileAsync(scene,camera);if(disposed)return;size();resize.observe(host);themes.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});view.observe(host);host.addEventListener('hero-control',controls);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',preference);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',restored);canvas.dataset.ready='true';schedule();
 }catch(error){if(disposed)return;stop();canvas.hidden=true;canvas.dataset.fallbackReason=error instanceof Error?error.message:String(error);host.dataset.sceneMode='static';host.dataset.scenePose='complete';}})();
 return cleanup;
}
