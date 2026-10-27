import * as T from 'three';
import {createArtworkEnvironment,addArtworkSoftboxes} from './artwork-studio';
import {createPhilosophyCubes} from '../home/philosophy-cubes';
import {createSceneHandoff} from '../performance/scene-handoff';
import {createRenderQuality,prefersStaticScene} from '../performance/scene-policy';
import {longParticleWaveGLSL as particleWaveGLSL} from './particle-wave';
import {cultureHelixDuration,cultureHelixState} from './culture-helix-timeline';
import type {SceneMode} from './engineered-hero-renderer';

export async function mountCultureHelix(canvas:HTMLCanvasElement,host:HTMLElement,onMode:(mode:SceneMode)=>void,signal:AbortSignal){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const quality=createRenderQuality(canvas,1.5);renderer.setPixelRatio(quality.ratio);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-2.8,2.8,2.8,-2.8,.1,40);camera.position.set(4,2.2,8);camera.lookAt(0,0,0);
 const environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene);
 scene.add(new T.HemisphereLight(0xe9f7ff,0x183149,1.5));const light=new T.DirectionalLight(0xffffff,2.5);light.position.set(-3,5,6);scene.add(light);
 const cubes=createPhilosophyCubes();scene.add(cubes.root);cubes.root.scale.setScalar(.85);
 const count=matchMedia('(max-width:767px)').matches?2400:4800,positions=new Float32Array(count*3),seeds=new Float32Array(count),strands=new Float32Array(count),targets=new Float32Array(count*3);
 let seed=814;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<count;i++){const t=(i>>1)/(count/2-1),side=i%2;positions.set([t,(random()-.5)*.055,(random()-.5)*.055],i*3);strands[i]=side;seeds[i]=random();const p=[(random()-.5)*.59,(random()-.5)*.59,(random()-.5)*.59];p[Math.floor(i%6/2)]=i%2?.295:-.295;targets.set(p,i*3);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,1));geometry.setAttribute('aStrand',new T.BufferAttribute(strands,1));geometry.setAttribute('aTarget',new T.BufferAttribute(targets,3));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uTime:{value:0},uArrival:{value:0},uTwist:{value:0},uGather:{value:0},uDark:{value:0},uRatio:{value:quality.ratio},uSelected:{value:0}},
  vertexShader:`${particleWaveGLSL}
  attribute float aSeed,aStrand;attribute vec3 aTarget;uniform float uTime,uArrival,uTwist,uGather,uRatio,uSelected;varying float alpha,strand,emphasis;
  void main(){float t=position.x,spin=(aStrand<.5?1.:-1.)*uTwist*uTime*.22,angle=t*(.6+uTwist*1.4)*6.2831853+aStrand*3.14159265+spin;
   vec3 helix=vec3(cos(angle)*.57+position.y,(t-.5)*3.1,sin(angle)*.57+position.z);
   float deposit=smoothstep(aSeed*.28+aStrand*.08,aSeed*.28+aStrand*.08+.55,uArrival);
   float crest=latticeSheetCrest(aSeed,uTime);
   vec3 p=latticeSheetWave(helix,deposit,aSeed,uTime,vec3(aStrand<.5?1.:-1.,.12,.08),3.1,1.05);
   p=mix(p,aTarget,uGather);alpha=sin(clamp(uArrival*2.,0.,1.)*1.5707963)*(1.-smoothstep(.68,1.,uGather))*(.4+.35*aSeed+max(crest,0.)*.4);
   strand=aStrand;emphasis=mix(.56,1.,1.-abs(aStrand-uSelected));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(.8+aSeed*.55+max(crest,0.)*.9)*uRatio;}`,
  fragmentShader:'uniform float uDark;varying float alpha,strand,emphasis;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;vec3 color=mix(mix(vec3(.04,.24,.48),vec3(.025,.31,.41),strand),mix(vec3(.38,.66,1.),vec3(.36,.89,1.),strand),uDark);gl_FragColor=vec4(color,alpha*emphasis*(1.-smoothstep(.12,.5,r)));\n#include <colorspace_fragment>\n}'});
 const points=new T.Points(geometry,material);points.frustumCulled=false;scene.add(points);
 const bridgeGeometry=new T.BufferGeometry(),bridgePositions=new Float32Array(5*3*2*3);bridgeGeometry.setAttribute('position',new T.BufferAttribute(bridgePositions,3));
 const bridgeMaterials=Array.from({length:5},()=>new T.LineBasicMaterial({transparent:true,depthWrite:false,toneMapped:false}));
 bridgeMaterials.forEach((_,i)=>bridgeGeometry.addGroup(i*6,6,i));const bridges=new T.LineSegments(bridgeGeometry,bridgeMaterials);scene.add(bridges);
 const query=new URLSearchParams(location.search),review=query.get('helix-time'),handoff=createSceneHandoff(host,canvas);
 let time=review===null?.6:T.MathUtils.clamp(Number(review)||0,0,cultureHelixDuration),paused=false,frozen=review!==null,visible=false,disposed=false,lost=false,frame=0,last=0;
 function draw(){if(disposed||lost)return;const s=cultureHelixState(time),dark=document.documentElement.dataset.theme==='dark';
  Object.entries({uTime:time,uArrival:s.arrival,uTwist:s.twist,uGather:s.gather,uDark:dark?1:0,uRatio:quality.ratio,uSelected:Number(host.dataset.selected)||0}).forEach(([key,value])=>material.uniforms[key].value=value);
  points.visible=!s.done;cubes.setTheme(dark,time>6);cubes.apply({outer:s.enclosure,core:s.gather,individual:0,height:0});
  for(let i=0;i<5;i++){bridgeMaterials[i].color.setHex(dark?0x9bd6ee:0x247192);bridgeMaterials[i].opacity=s.bridges[i]*(.62+.38*Math.sin(time*3.2-i*.9));
   for(let j=0;j<3;j++){const t=(i+.55)/5+(j-1)*.013,angle=t*(.6+s.twist*1.4)*Math.PI*2,x=Math.cos(angle)*.57,z=Math.sin(angle)*.57,y=(t-.5)*3.1;bridgePositions.set([x,y,z,-x,y,-z],i*18+j*6);}}
  bridgeGeometry.attributes.position.needsUpdate=true;renderer.render(scene,camera);canvas.dataset.animationTime=time.toFixed(3);host.dataset.phase=s.phase;canvas.dataset.particleCount=String(count);
 }
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;quality.reset();host.dataset.running='false';}
 function schedule(){if(!disposed&&!lost&&!prefersStaticScene()&&visible&&!document.hidden&&!paused&&!frozen&&!frame&&time<cultureHelixDuration&&host.dataset.sceneState==='live'){host.dataset.running='true';frame=requestAnimationFrame(tick);}}
 function tick(now:number){frame=0;if(disposed||lost||!visible||document.hidden||paused||frozen)return;time=Math.min(cultureHelixDuration,time+(last?Math.min(.08,(now-last)/1000):0));last=now;if(quality.sample(now)){renderer.setPixelRatio(quality.ratio);size();}draw();if(time<cultureHelixDuration)frame=requestAnimationFrame(tick);else{stop();onMode('settled');}}
 function size(){const b=host.getBoundingClientRect();if(!b.width||!b.height)return;renderer.setSize(b.width,b.height,false);const a=b.width/b.height,h=Math.max(4.2,4.2/a);camera.left=-h*a/2;camera.right=h*a/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();draw();}
 const sizing=new ResizeObserver(size),theme=new MutationObserver(draw),view=new IntersectionObserver(([e])=>{visible=e.isIntersecting&&e.intersectionRatio>=.25;if(visible)schedule();else stop();},{threshold:[0,.25]});
 const visibility=()=>document.hidden?stop():schedule();const contextLost=(e:Event)=>{e.preventDefault();lost=true;stop();handoff.fallback();onMode('static');};
 const restored=()=>{lost=false;size();void handoff.reveal().then(()=>{if(!disposed){onMode(time>=cultureHelixDuration?'settled':paused?'paused':'playing');schedule();}});};
 const controller={toggle(){if(time>=cultureHelixDuration)return;paused=!paused;if(paused)stop();else{frozen=false;schedule();}onMode(paused?'paused':'playing');},replay(){stop();time=0;paused=frozen=false;draw();onMode('playing');schedule();},seek(seconds:number){stop();time=Number.isFinite(seconds)?T.MathUtils.clamp(seconds,0,cultureHelixDuration):0;frozen=true;draw();onMode('settled');},select(index:number){host.dataset.selected=String(index);controller.replay();},dispose(){if(disposed)return;disposed=true;stop();handoff.dispose();sizing.disconnect();theme.disconnect();view.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',restored);signal.removeEventListener('abort',controller.dispose);[geometry,material,bridgeGeometry,...bridgeMaterials].forEach(r=>r.dispose());cubes.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
 signal.addEventListener('abort',controller.dispose,{once:true});if(signal.aborted){controller.dispose();return controller;}
 sizing.observe(host);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});view.observe(host);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',restored);
 size();await renderer.compileAsync(scene,camera);if(disposed)return controller;draw();await handoff.reveal();if(!disposed){onMode(frozen?'settled':'playing');schedule();}return controller;
}
