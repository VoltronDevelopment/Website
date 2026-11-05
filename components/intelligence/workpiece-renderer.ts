import * as T from 'three';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import {createArtworkEnvironment,addArtworkSoftboxes} from '../brand/artwork-studio';
import {createAlphaPanelGeometry,alphaPanelReturn} from '../manufacturing/alpha-panel-geometry';
import {evidencePanelCenter,evidenceSuspensionCurve,evidenceScanY} from './evidence-panel-model';
export function mountWorkpiece(canvas:HTMLCanvasElement,host:HTMLElement,onReady:(ready:boolean)=>void=()=>{}){
 const capture=new URLSearchParams(location.search).get('workpiece-capture')==='1';
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:capture});renderer.setPixelRatio(Math.min(devicePixelRatio||1,capture?2:1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.outputColorSpace=T.SRGBColorSpace;
 const environment=createArtworkEnvironment(renderer),scene=new T.Scene();scene.environment=environment.texture;addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe9f5ff,0x183047,1.8));const key=new T.DirectionalLight(0xffffff,2.7);key.position.set(-6,12,9);scene.add(key);
 const resources:{dispose():void}[]=[],own=<R extends {dispose():void}>(r:R)=>{resources.push(r);return r;};
 const metal=own(new T.MeshPhysicalMaterial({color:0xc9d4db,metalness:.8,roughness:.27,clearcoat:.35,transparent:true})),carrier=own(new T.MeshStandardMaterial({color:0x315878,metalness:.65,roughness:.3,transparent:true}));
 const root=new T.Group();scene.add(root);const part=new T.Mesh(own(createAlphaPanelGeometry()),metal);part.name='alpha-evidence-panel';part.position.y=evidencePanelCenter;root.add(part);
 function box(parent:T.Object3D,size:readonly number[],position:readonly number[],material:T.Material){const mesh=new T.Mesh(own(new T.BoxGeometry(size[0],size[1],size[2])),material);mesh.position.fromArray(position);parent.add(mesh);return mesh;}
 box(part,alphaPanelReturn.size,alphaPanelReturn.position,metal);
 box(root,[.97,.07,.11],[0,1.83,0],carrier);box(root,[.06,.14,.06],[0,1.93,0],carrier);box(root,[.38,.1,.22],[0,2.05,0],carrier);
 // Front straps bend through the two real upper holes, then return behind the sheet.
 for(const x of [-.36,.36]){
  const path=evidenceSuspensionCurve(x);
  const strap=new T.Mesh(own(new T.TubeGeometry(path,40,.008,8,false)),carrier);root.add(strap);
  box(root,[.045,.06,.18],[x,1.83,.035],carrier);
 }
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const ctx=shadowCanvas.getContext('2d')!,gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(12,35,53,.32)');gradient.addColorStop(1,'rgba(12,35,53,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const shadowTexture=own(new T.CanvasTexture(shadowCanvas)),shadowMaterial=own(new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.45})),shadow=new T.Mesh(own(new T.PlaneGeometry(1.6,1)),shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=.06;scene.add(shadow);
 let seed=71;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;},sampler=(new MeshSurfaceSampler(part) as MeshSurfaceSampler&{setRandomGenerator(fn:()=>number):MeshSurfaceSampler}).setRandomGenerator(random).build(),data=new Float32Array(1200*3),origins=new Float32Array(1200*3),v=new T.Vector3();
 for(let i=0;i<1200;i++){sampler.sample(v);data.set([v.x,v.y+.9,v.z],i*3);origins.set([v.x+(random()-.5)*.9,v.y+.9+(random()-.5)*.6,v.z+(random()-.5)*.6],i*3);}
 const geometry=own(new T.BufferGeometry());geometry.setAttribute('position',new T.BufferAttribute(data,3));geometry.setAttribute('origin',new T.BufferAttribute(origins,3));
 const particleMaterial=own(new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{form:{value:0},dpr:{value:renderer.getPixelRatio()},color:{value:new T.Color(0x1c84c5)}},vertexShader:'attribute vec3 origin;uniform float form,dpr;void main(){vec3 p=mix(origin,position,smoothstep(0.,1.,form));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=1.4*dpr;}',fragmentShader:'uniform float form;uniform vec3 color;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(color,(1.-smoothstep(.18,.5,d))*(1.-smoothstep(.7,1.,form)));}'}));const particles=new T.Points(geometry,particleMaterial);scene.add(particles);
 const scanMaterial=own(new T.MeshBasicMaterial({color:0x279bc8,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false})),coreMaterial=own(new T.MeshBasicMaterial({color:0x1676b9,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false}));
 const scan=new T.Group();scan.position.z=.16;scan.add(new T.Mesh(own(new T.PlaneGeometry(1.12,.1)),scanMaterial),new T.Mesh(own(new T.PlaneGeometry(1.12,.008)),coreMaterial));scene.add(scan);
 const camera=new T.OrthographicCamera(-1.2,1.2,1.2,-1.2,.1,30);camera.position.set(2.6,2.15,7);camera.lookAt(0,1.13,0);
 let width=0,height=0,disposed=false,lost=false,ready=false,frames=0,latestForm=1,latestScan=-1;
 function draw(form:number,scanProgress:number){
  latestForm=form;latestScan=scanProgress;if(disposed||lost)return;const r=host.getBoundingClientRect();if(!r.width||!r.height)return;
  if(width!==r.width||height!==r.height){width=r.width;height=r.height;renderer.setSize(width,height,false);const span=Math.max(2.3,1.65/(width/height));camera.left=-span*width/height/2;camera.right=-camera.left;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();}
  if(capture){form=1;scanProgress=-1;}const dark=document.documentElement.dataset.theme==='dark';metal.color.setHex(dark?0xb5c9d8:0xc9d4db);carrier.color.setHex(dark?0x42657f:0x254760);metal.opacity=T.MathUtils.smoothstep(form,.55,.98);carrier.opacity=metal.opacity;metal.depthWrite=carrier.depthWrite=form>=.98;shadowMaterial.opacity=metal.opacity*(dark?.23:.38);
  particleMaterial.uniforms.form.value=form;particleMaterial.uniforms.color.value.setHex(dark?0x63d1ff:0x176cb0);particles.visible=form<1;
  scan.visible=scanProgress>=0&&scanProgress<=1;scan.position.y=evidenceScanY(scanProgress);scanMaterial.color.setHex(dark?0x3bbff1:0x1676b9);coreMaterial.color.setHex(dark?0xb6edff:0x12639a);scanMaterial.opacity=.16+.16*Math.sin(Math.PI*Math.max(0,scanProgress));
  renderer.setClearColor(0,0);renderer.render(scene,camera);host.dataset.panelIdentity='alpha-six-hole-panel';host.dataset.form=form.toFixed(3);host.dataset.scan=scan.visible?scanProgress.toFixed(3):'off';host.dataset.ready='true';host.dataset.renderedFrames=String(++frames);if(!ready){ready=true;onReady(true);}
 }
 const contextLost=(e:Event)=>{e.preventDefault();lost=true;ready=false;host.dataset.ready='false';onReady(false);},contextRestored=()=>{lost=false;draw(latestForm,latestScan);};canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
 return {draw,dispose(){disposed=true;canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();}};
}
