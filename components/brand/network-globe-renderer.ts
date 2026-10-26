import * as THREE from 'three';
import {createArtworkEnvironment,addArtworkSoftboxes} from './artwork-studio';
import {stroke,strokeMaterial,nodeHaloTexture} from '../home/lattice-materials';
import {createRenderQuality} from '../performance/scene-policy';
import {createSceneHandoff} from '../performance/scene-handoff';
import {globeArc,globeCoordinate,globeDuration,globeLinks,globeNodes,globeState} from './network-globe-timeline';
import type {EngineeredController,SceneMode} from './engineered-hero-renderer';
import {observeArtworkTuning,artworkDefaults} from './artwork-tuning';

export async function mountNetworkGlobe(canvas:HTMLCanvasElement,host:HTMLDivElement,onMode:(mode:SceneMode)=>void,signal:AbortSignal):Promise<EngineeredController>{
 const response=await fetch('/globe/land-points.json',{signal});if(!response.ok)throw Error('Globe geography unavailable');const land:number[]=await response.json();
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'}),quality=createRenderQuality(canvas,1.5);
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setPixelRatio(quality.ratio);
 const resources=new Set<{dispose():void}>(),track=<T extends {dispose():void}>(x:T):T=>{resources.add(x);return x;};
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(31,1,.1,40);camera.position.set(0,.3,9.1);camera.lookAt(0,0,0);
 const environment=track(createArtworkEnvironment(renderer));scene.environment=environment.texture;
 const key=new THREE.DirectionalLight(0xf6fbff,3.5);key.position.set(-4,5,6);const fill=new THREE.HemisphereLight(0xc4e6ff,0x122b48,1.2);scene.add(key,fill);addArtworkSoftboxes(scene);
 const tilt=new THREE.Group(),geography=new THREE.Group();tilt.rotation.z=-.12;tilt.add(geography);scene.add(tilt);
 const radius=1.8,bodyMaterial=track(new THREE.MeshPhysicalMaterial({color:0xc2deed,metalness:.2,roughness:.38,clearcoat:.45,clearcoatRoughness:.32,envMapIntensity:.75,transparent:true,depthWrite:true}));
 const body=new THREE.Mesh(track(new THREE.SphereGeometry(radius,64,40)),bodyMaterial);body.renderOrder=-1;geography.add(body);
 const positions:number[]=[];for(let i=0;i<land.length;i+=2)positions.push(...globeCoordinate(land[i],land[i+1],radius*1.004));
 const geo=track(new THREE.BufferGeometry());geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const landMaterial=track(new THREE.PointsMaterial({color:0x306b95,size:.023,sizeAttenuation:true,transparent:true,opacity:.9,depthWrite:false}));geography.add(new THREE.Points(geo,landMaterial));
 const rimMaterial=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,uniforms:{uColor:{value:new THREE.Color(0x4baaf0)},uAlpha:{value:.18}},vertexShader:'varying vec3 vNormal,vView;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 vNormal,vView;uniform vec3 uColor;uniform float uAlpha;void main(){float edge=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.);gl_FragColor=vec4(uColor,edge*uAlpha);#include <colorspace_fragment>}'.replace(';#include',';\n#include')}));
 tilt.add(new THREE.Mesh(track(new THREE.SphereGeometry(radius*1.025,48,32)),rimMaterial));
 const haloMap=track(nodeHaloTexture()),nodes=globeNodes.map(([lat,lng])=>{
  const point=new THREE.Vector3(...globeCoordinate(lat,lng,radius*1.015)),normal=point.clone().normalize();
  const material=track(new THREE.MeshBasicMaterial({color:0x2185ed,toneMapped:false})),core=new THREE.Mesh(track(new THREE.SphereGeometry(.021,10,8)),material);core.position.copy(point);geography.add(core);
  const haloMaterial=track(new THREE.MeshBasicMaterial({map:haloMap,transparent:true,depthWrite:false,color:0xa9e8ff,opacity:.6,toneMapped:false}));
  const halo=new THREE.Mesh(track(new THREE.PlaneGeometry(.22,.22)),haloMaterial);halo.position.copy(point).addScaledVector(normal,.006);halo.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);geography.add(halo);return {core,halo,material};
 });
 const routes=globeLinks.map(([a,b])=>{
  const samples=Array.from({length:81},(_,i)=>new THREE.Vector3(...globeArc(globeNodes[a],globeNodes[b],i/80,radius*1.014)));
  const pairs=samples.slice(1).flatMap((point,i)=>[samples[i],point]);
  const coreMaterial=track(strokeMaterial(true));coreMaterial.userData.cssWidth=1.05;const core=stroke(pairs,coreMaterial);track(core.geometry);geography.add(core);
  const haloMaterial=track(strokeMaterial(true));haloMaterial.userData.cssWidth=3.4;haloMaterial.opacity=.1;const halo=stroke(pairs,haloMaterial);track(halo.geometry);geography.add(halo);
  const tipMaterial=track(strokeMaterial(true));tipMaterial.userData.cssWidth=2.2;tipMaterial.depthWrite=false;const tip=stroke(samples.slice(0,2),tipMaterial);track(tip.geometry);geography.add(tip);
  return {core,halo,tip,samples,coreMaterial,haloMaterial,tipMaterial,count:80};
 });
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const ctx=shadowCanvas.getContext('2d')!,g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(34,86,130,.22)');g.addColorStop(1,'rgba(34,86,130,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
 const shadow=new THREE.Mesh(track(new THREE.PlaneGeometry(4.3,1)),track(new THREE.MeshBasicMaterial({map:track(new THREE.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false})));shadow.position.set(0,-2.15,-.4);scene.add(shadow);
 const query=new URLSearchParams(location.search),review=query.get('hero-time');let time=review===null?.65:Math.min(globeDuration,Math.max(0,Number(review)||0)),paused=false,frozen=review!==null,visible=false,disposed=false,lost=false,frame=0,last=0,frames=0;
 const handoff=createSceneHandoff(host,canvas),dark=()=>document.documentElement.dataset.theme==='dark';let tuning={...artworkDefaults};
 function draw(){if(disposed||lost)return;const state=globeState(time);tilt.scale.setScalar(.97+.03*state.body);bodyMaterial.opacity=state.body;geography.rotation.y=-78.9*Math.PI/180+state.angle;tilt.visible=state.body>0;
  routes.forEach((route,index)=>{const progress=state.arc(index),count=Math.round(route.count*progress);route.core.geometry.instanceCount=count;route.halo.geometry.instanceCount=count;
   route.tip.visible=progress>0&&progress<1;route.tipMaterial.opacity=state.energy*.9;
   if(route.tip.visible){const a=route.samples[Math.max(0,count-5)],b=route.samples[count];route.tip.geometry.attributes.instanceStart.setXYZ(0,a.x,a.y,a.z);route.tip.geometry.attributes.instanceEnd.setXYZ(0,b.x,b.y,b.z);route.tip.geometry.attributes.instanceStart.needsUpdate=true;route.tip.geometry.attributes.instanceEnd.needsUpdate=true;route.tip.geometry.computeBoundingSphere();}
   route.coreMaterial.opacity=(dark()?.75:.68)+.12*state.response(index);route.haloMaterial.opacity=((dark()?.1:.12)+state.response(index)*.1)*tuning.glow;route.tipMaterial.opacity*=tuning.glow;
  });
  nodes.forEach((node,index)=>{const energy=Math.max(0,...globeLinks.map(([a,b],i)=>a===index||b===index?state.response(i):0));node.core.scale.setScalar(1+energy*.45);node.halo.material.opacity=(.22+energy*.65)*tuning.glow;});
  renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.rotationAngle=state.angle.toFixed(6);canvas.dataset.connectionCount=String(routes.length);canvas.dataset.nodeCount=String(nodes.length);canvas.dataset.connectionsComplete=String(routes.every((_,i)=>state.arc(i)===1));canvas.dataset.renderedFrames=String(++frames);host.dataset.phase=state.done?'settled':time<.7?'establishing':'connecting';
 }
 function size(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;const fit=Math.max(1,(960/760)/camera.aspect);camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(31)/2)*fit));camera.updateProjectionMatrix();draw();}
 function theme(){const night=dark();bodyMaterial.color.setHex(night?0x16374f:0xc2deed);bodyMaterial.envMapIntensity=night?1.1:.8;landMaterial.color.setHex(night?0x80b9da:0x306b95);rimMaterial.uniforms.uAlpha.value=night?.28:.16;routes.forEach(r=>{r.coreMaterial.color.setHex(night?0x79bfff:0x246bd4);r.haloMaterial.color.setHex(0x45b8ff);r.tipMaterial.color.setHex(night?0xe0f7ff:0x2a9deb);});nodes.forEach(n=>n.material.color.setHex(night?0xc9f4ff:0x167be0));draw();}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;host.dataset.running='false';}
 function tick(now:number){frame=0;if(disposed||lost||!visible||document.hidden||paused||frozen)return;time=Math.min(globeDuration,time+(last?Math.min(.1,(now-last)/1000):0));last=now;if(quality.sample(now)){renderer.setPixelRatio(quality.ratio);size();}draw();if(time<globeDuration)frame=requestAnimationFrame(tick);else{stop();onMode('settled');}}
 function schedule(){if(!disposed&&!lost&&!frame&&visible&&!document.hidden&&!paused&&!frozen&&time<globeDuration&&host.dataset.sceneState==='live'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){last=0;host.dataset.running='true';frame=requestAnimationFrame(tick);}}
 const resize=new ResizeObserver(size),themes=new MutationObserver(theme),view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else stop();},{threshold:.05});
 function visibility(){if(document.hidden)stop();else schedule();}
 function contextLost(event:Event){event.preventDefault();lost=true;stop();handoff.fallback();onMode('static');}
 function restored(){lost=false;theme();size();void handoff.reveal().then(()=>{if(!disposed){onMode(time>=globeDuration?'settled':paused?'paused':'playing');schedule();}});}
 const controller:EngineeredController={toggle(){paused=!paused;onMode(paused?'paused':'playing');if(paused)stop();else schedule();},replay(){stop();time=0;paused=frozen=false;draw();onMode('playing');schedule();},seek(value){stop();time=Math.min(globeDuration,Math.max(0,Number.isFinite(value)?value:0));frozen=true;draw();onMode(time===globeDuration?'settled':'paused');},dispose(){if(disposed)return;disposed=true;stop();handoff.dispose();resize.disconnect();themes.disconnect();view.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',restored);signal.removeEventListener('abort',controller.dispose);resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();}};
 track(observeArtworkTuning('network',value=>{tuning=value;key.position.set(-4+Math.sin(value.keyDirection)*5,5,6);theme();}));
 signal.addEventListener('abort',controller.dispose,{once:true});if(signal.aborted){controller.dispose();return controller;}resize.observe(host);themes.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});view.observe(host);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',restored);theme();size();await handoff.reveal();if(!disposed){onMode(frozen?'settled':'playing');schedule();}return controller;
}
