import {particleWaveGLSL} from './particle-wave';
import * as THREE from 'three';
import {createArtworkEnvironment,addArtworkSoftboxes} from './artwork-studio';
import {nodeHaloTexture} from '../home/lattice-materials';
import {createRenderQuality} from '../performance/scene-policy';
import {createSceneHandoff} from '../performance/scene-handoff';
import {globeCoordinate,globeDuration,globeLinks,globeNodes,globeState,globeTextureYaw} from './network-globe-timeline';
import type {EngineeredController,SceneMode} from './engineered-hero-renderer';
import {observeArtworkTuning,artworkDefaults} from './artwork-tuning';
import {createGlobeEnvelope} from './globe-envelope';

export async function mountNetworkGlobe(canvas:HTMLCanvasElement,host:HTMLDivElement,onMode:(mode:SceneMode)=>void,signal:AbortSignal):Promise<EngineeredController>{
 const responses=await Promise.all(['/globe/land-points.json','/globe/coastlines.bin'].map(url=>fetch(url,{signal})));if(responses.some(r=>!r.ok))throw Error('Globe geography unavailable');const land:number[]=await responses[0].json(),coast=new Float32Array(await responses[1].arrayBuffer());
 if(signal.aborted)throw new DOMException('Aborted','AbortError');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'}),quality=createRenderQuality(canvas,1.5);
 renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setPixelRatio(quality.ratio);
 const resources=new Set<{dispose():void}>(),track=<T extends {dispose():void}>(x:T):T=>{resources.add(x);return x;};
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(31,1,.1,40);camera.position.set(0,.3,9.1);camera.lookAt(0,0,0);
 const environment=track(createArtworkEnvironment(renderer));scene.environment=environment.texture;
 const key=new THREE.DirectionalLight(0xf6fbff,3.5);key.position.set(-4,5,6);const fill=new THREE.HemisphereLight(0xc4e6ff,0x122b48,1.2);scene.add(key,fill);addArtworkSoftboxes(scene);
 const tilt=new THREE.Group(),geography=new THREE.Group();tilt.rotation.z=-.12;tilt.add(geography);scene.add(tilt);
 const radius=1.8,bodyMaterial=track(new THREE.MeshPhysicalMaterial({color:0xc2deed,metalness:.2,roughness:.38,clearcoat:.45,clearcoatRoughness:.32,envMapIntensity:.75,transparent:true,depthWrite:true}));
 bodyMaterial.metalness=.03;bodyMaterial.roughness=.72;bodyMaterial.clearcoat=.12;
 const envelope=createGlobeEnvelope(radius*1.16),shellGeometry=track(envelope.surface);
 const shellMaterial=track(new THREE.LineBasicMaterial({color:0x397ba6,transparent:true,opacity:.17,depthWrite:false}));
 const shell=new THREE.LineSegments(track(envelope.wire),shellMaterial);shell.name='connected-polygon-envelope';tilt.add(shell);
 // A quiet deposition front precedes the fixed polygon edges; no route arcs return.
 const wavePositions=[],waveSeeds=[];const shellPoints=shell.geometry.attributes.position;
 for(let i=0;i<shellPoints.count;i+=2){const a=new THREE.Vector3().fromBufferAttribute(shellPoints,i),b=new THREE.Vector3().fromBufferAttribute(shellPoints,i+1);for(let j=0;j<3;j++){wavePositions.push(...a.clone().lerp(b,j/3).toArray());waveSeeds.push(((i*73+j*37)%997)/997);}}
 const envelopeGeometry=track(new THREE.BufferGeometry());envelopeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(wavePositions,3));envelopeGeometry.setAttribute('aSeed',new THREE.Float32BufferAttribute(waveSeeds,1));
 const envelopeMaterial=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uProgress:{value:0},uTime:{value:0},uDark:{value:0},uRatio:{value:quality.ratio}},vertexShader:`${particleWaveGLSL}
attribute float aSeed;uniform float uProgress,uTime,uRatio;varying float alpha;void main(){float field=clamp((position.y+2.1)/4.2,0.,1.)*.75+aSeed*.10;float p=smoothstep(field-.15,field+.05,uProgress);vec3 target=latticeWave(position,p,aSeed,uTime,vec3(0.,1.,.15),.32,.08);alpha=smoothstep(field-.22,field-.05,uProgress)*(1.-smoothstep(field+.06,field+.25,uProgress));gl_Position=projectionMatrix*modelViewMatrix*vec4(target,1.);gl_PointSize=(.8+aSeed*.55)*uRatio;}`,fragmentShader:'uniform float uDark;varying float alpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.03,.28,.46),vec3(.38,.75,.95),uDark),alpha*.65*(1.-smoothstep(.12,.5,r)));\n#include <colorspace_fragment>\n}'}));
 const envelopePoints=new THREE.Points(envelopeGeometry,envelopeMaterial);envelopePoints.frustumCulled=false;tilt.add(envelopePoints);
 const landCanvas=document.createElement('canvas');landCanvas.width=2048;landCanvas.height=1024;const landCtx=landCanvas.getContext('2d')!;
 const landMap=track(new THREE.CanvasTexture(landCanvas));landMap.colorSpace=THREE.SRGBColorSpace;landMap.anisotropy=8;bodyMaterial.map=landMap;bodyMaterial.color.setHex(0xffffff);
 function paintLand(night:boolean){landCtx.fillStyle=night?'#061423':'#d6e3ec';landCtx.fillRect(0,0,2048,1024);landCtx.fillStyle=night?'#769aaf':'#12334c';for(let i=0;i<land.length;i+=2){const x=(land[i+1]+180)/360*2048,y=(90-land[i])/180*1024;landCtx.beginPath();landCtx.arc(x,y,5.2,0,Math.PI*2);landCtx.fill();}landMap.needsUpdate=true;}
 const body=new THREE.Mesh(track(new THREE.SphereGeometry(radius,64,40)),bodyMaterial);body.rotation.y=globeTextureYaw;body.renderOrder=-1;geography.add(body);
 const positions:number[]=[];for(let i=0;i<land.length;i+=2)positions.push(...globeCoordinate(land[i],land[i+1],radius*1.006));
 const geo=track(new THREE.BufferGeometry());geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const landMaterial=track(new THREE.PointsMaterial({color:0x306b95,size:.01,sizeAttenuation:true,transparent:true,opacity:.18,depthWrite:false}));geography.add(new THREE.Points(geo,landMaterial));
 landMaterial.toneMapped=false;
 const coastGeometry=track(new THREE.BufferGeometry());coastGeometry.setAttribute('position',new THREE.BufferAttribute(coast,3));
 const coastMaterial=track(new THREE.LineBasicMaterial({color:0x215e7b,transparent:true,opacity:.85,depthWrite:false,toneMapped:false}));
 const coastlines=new THREE.LineSegments(coastGeometry,coastMaterial);coastlines.scale.setScalar(radius*1.009);geography.add(coastlines);
 const rimMaterial=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,uniforms:{uColor:{value:new THREE.Color(0x4baaf0)},uAlpha:{value:.18}},vertexShader:'varying vec3 vNormal,vView;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vNormal=normalize(normalMatrix*normal);vView=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 vNormal,vView;uniform vec3 uColor;uniform float uAlpha;void main(){float edge=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.);gl_FragColor=vec4(uColor,edge*uAlpha);#include <colorspace_fragment>}'.replace(';#include',';\n#include')}));
 tilt.add(new THREE.Mesh(track(new THREE.SphereGeometry(radius*1.025,48,32)),rimMaterial));
 const haloMap=track(nodeHaloTexture()),nodes=globeNodes.map(([lat,lng])=>{
  const point=new THREE.Vector3(...globeCoordinate(lat,lng,radius*1.015)),normal=point.clone().normalize();
  const material=track(new THREE.MeshBasicMaterial({color:0x2185ed,toneMapped:false})),core=new THREE.Mesh(track(new THREE.SphereGeometry(.021,10,8)),material);core.position.copy(point);geography.add(core);
  const haloMaterial=track(new THREE.MeshBasicMaterial({map:haloMap,transparent:true,depthWrite:false,color:0xa9e8ff,opacity:.6,toneMapped:false}));
  const halo=new THREE.Mesh(track(new THREE.PlaneGeometry(.22,.22)),haloMaterial);halo.position.copy(point).addScaledVector(normal,.006);halo.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);geography.add(halo);return {core,halo,material};
 });
 const incidentLinks=globeNodes.map((_,index)=>globeLinks.flatMap(([a,b],i)=>a===index||b===index?[i]:[]));
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const ctx=shadowCanvas.getContext('2d')!,g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(34,86,130,.22)');g.addColorStop(1,'rgba(34,86,130,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
 const shadow=new THREE.Mesh(track(new THREE.PlaneGeometry(4.3,1)),track(new THREE.MeshBasicMaterial({map:track(new THREE.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false})));shadow.position.set(0,-2.15,-.4);scene.add(shadow);
 const query=new URLSearchParams(location.search),review=query.get('hero-time');let time=review===null?.65:Math.min(globeDuration,Math.max(0,Number(review)||0)),paused=false,frozen=review!==null,visible=false,disposed=false,lost=false,frame=0,last=0,frames=0;
 const handoff=createSceneHandoff(host,canvas),dark=()=>document.documentElement.dataset.theme==='dark';let tuning={...artworkDefaults};
 function draw(){if(disposed||lost)return;const state=globeState(time);tilt.scale.setScalar(.97+.03*state.body);bodyMaterial.opacity=state.body;geography.rotation.y=-78.9*Math.PI/180+state.angle;tilt.visible=state.body>0;
  envelopePoints.visible=time>.5&&time<2.5;envelopeMaterial.uniforms.uProgress.value=state.envelope;envelopeMaterial.uniforms.uTime.value=time;envelopeMaterial.uniforms.uDark.value=dark()?1:0;envelopeMaterial.uniforms.uRatio.value=quality.ratio;
  shell.geometry.setDrawRange(0,Math.floor(shell.geometry.attributes.position.count*state.envelope/2)*2);
  nodes.forEach((node,index)=>{const energy=Math.max(0,...incidentLinks[index].map(i=>state.response(i)));node.core.scale.setScalar(1+energy*.45);node.halo.material.opacity=((dark()?.10:.06)+energy*.45)*tuning.glow;});
  renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);canvas.dataset.rotationAngle=state.angle.toFixed(6);canvas.dataset.connectionCount='0';canvas.dataset.connectionStyle='polygon-envelope';canvas.dataset.polygonShell='true';canvas.dataset.landStyle='coherent-surface';canvas.dataset.nodeCount=String(nodes.length);canvas.dataset.connectionsComplete=String(state.done);canvas.dataset.renderedFrames=String(++frames);canvas.dataset.envelopeFormation=state.envelope.toFixed(3);host.dataset.phase=state.done?'settled':time<.7?'establishing':time<2.5?'envelope':'rotating';
 }
 function size(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;const fit=Math.max(1,(960/760)/camera.aspect);camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(31)/2)*fit));camera.updateProjectionMatrix();draw();}
 function theme(){const night=dark();shellMaterial.color.setHex(night?0x7ba6ba:0x315c77);shellMaterial.opacity=night?.15:.17;paintLand(night);key.intensity=night?2.1:2.4;fill.intensity=night?.85:1;bodyMaterial.envMapIntensity=night?.35:.4;landMaterial.color.setHex(night?0xa4d9e8:0x1c5d7e);landMaterial.opacity=.12;coastMaterial.color.setHex(night?0xb6cfdd:0x153b55);rimMaterial.uniforms.uAlpha.value=night?.28:.16;nodes.forEach(n=>n.material.color.setHex(night?0xc9f4ff:0x167be0));draw();}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;host.dataset.running='false';}
 function tick(now:number){frame=0;if(disposed||lost||!visible||document.hidden||paused||frozen)return;time=Math.min(globeDuration,time+(last?Math.min(.1,(now-last)/1000):0));last=now;if(quality.sample(now)){renderer.setPixelRatio(quality.ratio);size();}draw();if(time<globeDuration)frame=requestAnimationFrame(tick);else{stop();onMode('settled');}}
 function schedule(){if(!disposed&&!lost&&!frame&&visible&&!document.hidden&&!paused&&!frozen&&time<globeDuration&&host.dataset.sceneState==='live'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){last=0;host.dataset.running='true';frame=requestAnimationFrame(tick);}}
 const resize=new ResizeObserver(size),themes=new MutationObserver(theme),view=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.25;if(visible)schedule();else stop();},{threshold:[0,.25]});
 function visibility(){if(document.hidden)stop();else schedule();}
 function contextLost(event:Event){event.preventDefault();lost=true;stop();handoff.fallback();onMode('static');}
 function restored(){lost=false;theme();size();void handoff.reveal().then(()=>{if(!disposed){onMode(time>=globeDuration?'settled':paused?'paused':'playing');schedule();}});}
 const controller:EngineeredController={toggle(){paused=!paused;onMode(paused?'paused':'playing');if(paused)stop();else schedule();},replay(){stop();time=0;paused=frozen=false;draw();onMode('playing');schedule();},seek(value){stop();time=Math.min(globeDuration,Math.max(0,Number.isFinite(value)?value:0));frozen=true;draw();onMode(time===globeDuration?'settled':'paused');},dispose(){if(disposed)return;disposed=true;stop();handoff.dispose();resize.disconnect();themes.disconnect();view.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',restored);signal.removeEventListener('abort',controller.dispose);resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();}};
 track(observeArtworkTuning('network',value=>{tuning=value;key.position.set(-4+Math.sin(value.keyDirection)*5,5,6);theme();}));
 signal.addEventListener('abort',controller.dispose,{once:true});if(signal.aborted){controller.dispose();return controller;}resize.observe(host);themes.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});view.observe(host);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',restored);theme();size();await handoff.reveal();if(!disposed){onMode(frozen?'settled':'playing');schedule();}return controller;
}
