import {createGlobeEnvelope,createGlobeEnvelopeMaterial,updateGlobeEnvelopeMaterial,globeEnvelopeView} from '../brand/globe-envelope';
import {roadmapVisualState,roadmapCellTone} from '@/lib/voltron-roadmap';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createArtworkEnvironment,addArtworkSoftboxes} from '../brand/artwork-studio';
import {createLatticeCellMaterials,updateLatticeCellMaterials,latticeFaceNormals,latticeBevel} from '../brand/lattice-optics';
/** One structure accumulates capability; a selected milestone changes its complete state. */
export async function mountRoadmap(canvas:HTMLCanvasElement,host:HTMLElement){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-3,3,2,-2,.1,40),environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;camera.position.set(6.4,4.6,8.4);camera.lookAt(.1,.2,0);addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe7f6ff,0x163049,2));const key=new T.DirectionalLight(0xffffff,2.8);key.position.set(-4,6,5);scene.add(key);
 const geometry=new RoundedBoxGeometry(.80,.80,.80,3,latticeBevel(.80)),edgeGeometry=new T.EdgesGeometry(geometry,30),edgeMaterial=new T.LineBasicMaterial({color:0x6e92ab,transparent:true,opacity:.06,depthWrite:false});
 const cellMaterials=Array.from({length:8},(_,i)=>createLatticeCellMaterials(roadmapCellTone(i),.80));
 const cellMeshes=cellMaterials.map(materials=>{const mesh=new T.Mesh(geometry,materials);mesh.frustumCulled=false;mesh.scale.setScalar(.001);const edge=new T.LineSegments(edgeGeometry,edgeMaterial);edge.frustumCulled=false;mesh.add(edge);return mesh;});
 let year=Number(host.dataset.year)||1;
 const envelope=createGlobeEnvelope(),globeGeometry=envelope.surface,wireGeometry=envelope.wire,wireMaterial=createGlobeEnvelopeMaterial(),globe=new T.LineSegments(wireGeometry,wireMaterial);globe.name='connected-polygon-envelope';
 const pg=new T.BufferGeometry(),points=new Float32Array(4200*3),envelopePoints=wireGeometry.attributes.position;for(let i=0;i<4200;i++){const index=i%envelopePoints.count;points.set([envelopePoints.getX(index),envelopePoints.getY(index),envelopePoints.getZ(index)],i*3);}pg.setAttribute('position',new T.BufferAttribute(points,3));pg.setAttribute('aIndex',new T.Float32BufferAttribute(Array.from({length:4200},(_,i)=>i),1));const pm=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uProgress:{value:0},uCount:{value:1},uEnvelope:{value:0},uDark:{value:0},uRatio:{value:renderer.getPixelRatio()}},vertexShader:`attribute float aIndex;uniform float uProgress,uCount,uRatio,uEnvelope;varying float alpha;void main(){float seed=mod(aIndex*73.,4199.)/4199.,n=mod(aIndex,uCount);vec3 center=uCount<2.?vec3(0.):vec3((mod(n,2.)-.5)*.82,uCount<5.?-.41:(floor(n/4.)-.5)*.82,(mod(floor(n/2.),2.)-.5)*.82);vec3 target=center+vec3(seed-.5,mod(aIndex*37.,4199.)/4199.-.5,mod(aIndex*131.,4199.)/4199.-.5)*.80;if(uEnvelope>.5)target=position;float deposit=smoothstep(seed*.1,seed*.1+.7,uProgress);float ease=deposit*deposit*(3.-2.*deposit);vec3 jitter=vec3(fract(seed*17.13)-.5,fract(seed*29.71)-.5,fract(seed*43.17)-.5);vec3 p=mix(target+jitter*2.6,target,ease);alpha=(1.-smoothstep(.72,1.,deposit))*(.42+.48*seed);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.05+seed*.9)*uRatio;}`,fragmentShader:'uniform float uDark;varying float alpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.03,.32,.75),vec3(.42,.80,1.),uDark),alpha*(1.-smoothstep(.12,.5,r)));\n#include <colorspace_fragment>\n}'}),particles=new T.Points(pg,pm);scene.add(particles);
 const capability=new T.Group();capability.position.set(.1,.28,0);capability.scale.setScalar(.92);globe.frustumCulled=false;cellMeshes.forEach(mesh=>capability.add(mesh));[globe,particles].forEach(object=>capability.add(object));scene.add(capability);
 let preparing=true;
 let phase=Number(host.dataset.index)||0,fromPhase=phase,progress=1,frame=0,last=0,visible=true,disposed=false;
 let paletteKey='';
 function draw(){const dark=document.documentElement.dataset.theme==='dark',state=roadmapVisualState(phase),p=1-(1-progress)**3;
  const key=dark+':'+phase;if(key!==paletteKey){paletteKey=key;
   cellMaterials.forEach((materials,i)=>{
    const point=state.cells[i];
    const internal=latticeFaceNormals.map(normal=>!!point&&state.cells.some((other,j)=>j!==i&&other.every((v,axis)=>Math.abs(v-point[axis]-normal[axis]*.82)<.001)));
    updateLatticeCellMaterials(materials,dark,internal);
   });
  }
  edgeMaterial.color.setHex(dark?0x6d93ad:0x7f9eb4);edgeMaterial.opacity=dark?.08:.05;
  const previous=roadmapVisualState(fromPhase);
  for(let i=0;i<8;i++){const point=state.cells[i]||[0,0,0],old=previous.cells[i],born=old?1:Math.max(.001,Math.min(1,(p-.38)/.62)),scale=i<state.count?born:.001,mesh=cellMeshes[i];mesh.scale.setScalar(scale);mesh.position.set(old?old[0]+(point[0]-old[0])*p:point[0],old?old[1]+(point[1]-old[1])*p:point[1]+(1-p)*.28,old?old[2]+(point[2]-old[2])*p:point[2]);mesh.visible=scale>.02;}
  globe.visible=state.envelope;wireGeometry.setDrawRange(0,Math.floor(wireGeometry.attributes.position.count*(phase===3?p:1)/2)*2);
  updateGlobeEnvelopeMaterial(wireMaterial,dark,state.global);if(phase===3)wireMaterial.opacity*=Math.max(p,.12);
  cellMaterials.forEach(materials=>materials.forEach(m=>m.emissiveIntensity=m.userData.baseEmissive));
  // Match the Network shell's view-relative orientation while the cubes stay isometric.
  globe.quaternion.copy(camera.quaternion);globe.rotateX(Math.atan2(globeEnvelopeView.cameraY,globeEnvelopeView.cameraZ));globe.rotateZ(globeEnvelopeView.tiltZ);
  host.dataset.glow=state.global?'true':'false';host.dataset.envelopeTopology='network-icosahedron-2';host.dataset.envelopeCopies='1';host.dataset.extraConnections='0';
  if(phase===3)particles.quaternion.copy(globe.quaternion);else particles.quaternion.identity();
  particles.visible=progress<1&&phase<4;pm.uniforms.uEnvelope.value=phase===3?1:0;pm.uniforms.uProgress.value=progress;pm.uniforms.uCount.value=state.count;pm.uniforms.uDark.value=dark?1:0;if(preparing)return;renderer.render(scene,camera);host.dataset.glassTreatment='voltron-face-optics';host.dataset.roadmapState=String(phase);host.dataset.roadmapCells=String(state.count);host.dataset.roadmapProgress=progress.toFixed(3);}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;}function tick(t:number){frame=0;if(!visible||document.hidden||disposed)return;progress=Math.min(1,progress+(last?Math.min(.05,(t-last)/1000):0)/3.6);last=t;draw();if(progress<1)frame=requestAnimationFrame(tick);}
 function start(){if(!disposed&&visible&&!document.hidden&&!frame&&progress<1){last=0;frame=requestAnimationFrame(tick);}}
 function resize(){const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);const a=width/height,h=Math.max(4.8,5.4/a);camera.left=-h*a/2;camera.right=h*a/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();draw();}
 const sizing=new ResizeObserver(resize),theme=new MutationObserver(draw),view=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)start();else stop();});sizing.observe(host);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});view.observe(host);const visibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',visibility);resize();await renderer.compileAsync(scene,camera);preparing=false;draw();start();host.dataset.ready='true';
 return {select(index:number){fromPhase=phase;phase=T.MathUtils.clamp(index,0,4);progress=0;stop();draw();start();},seek(next:number){year=Number.isFinite(next)?next:1;host.dataset.year=Math.max(1,Math.min(10,year)).toFixed(2);draw();},dispose(){disposed=true;stop();sizing.disconnect();theme.disconnect();view.disconnect();document.removeEventListener('visibilitychange',visibility);[...cellMaterials.flat(),geometry,edgeGeometry,edgeMaterial,globeGeometry,wireGeometry,wireMaterial,pg,pm].forEach(r=>r.dispose());environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
