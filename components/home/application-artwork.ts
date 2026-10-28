import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createArtworkEnvironment,addArtworkSoftboxes} from '../brand/artwork-studio';
import {createQualityScan} from '../brand/quality-scan';
import {createMachiningPartGeometry} from './machining-part';
import {addFresnelRim} from './lattice-materials';
/** Four small physical application views share the approved component and studio optics. */
export function mountApplicationArtwork(canvas:HTMLCanvasElement,kind:string){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
 const resources=new Set<{dispose():void}>(),track=<R extends {dispose():void}>(r:R):R=>{resources.add(r);return r;};
 const scene=new T.Scene(),root=new T.Group(),camera=new T.OrthographicCamera(-4,4,2,-2,.1,40);scene.add(root);const environment=track(createArtworkEnvironment(renderer));scene.environment=environment.texture;addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe6f5ff,0x152b40,1.6));const key=new T.DirectionalLight(0xffffff,2.5);key.position.set(-4,6,7);scene.add(key);
 const unit=track(new RoundedBoxGeometry(1,1,1,2,.035)),partGeometry=track(createMachiningPartGeometry()),edges=track(new T.EdgesGeometry(unit));
 const pearl=track(new T.MeshPhysicalMaterial({color:0xd9e9f3,metalness:.08,roughness:.2,clearcoat:.7})),navy=track(new T.MeshPhysicalMaterial({color:0x102e45,metalness:.25,roughness:.23,clearcoat:.6})),steel=track(new T.MeshPhysicalMaterial({color:0xb6c9d8,metalness:.86,roughness:.2,clearcoat:.45})),glass=track(new T.MeshPhysicalMaterial({color:0x97c5df,transparent:true,opacity:.22,depthWrite:false,metalness:.03,roughness:.14,clearcoat:1,envMapIntensity:.8})),water=track(new T.MeshPhysicalMaterial({color:0x3c91bd,transparent:true,opacity:.55,roughness:.16,metalness:.18})),rim=track(new T.LineBasicMaterial({color:0x80bdeb,transparent:true,opacity:.6}));
 const lamps:T.MeshBasicMaterial[]=[],connections:T.LineBasicMaterial[]=[];
 const box=(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,material:T.Material)=>{const mesh=new T.Mesh(unit,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;};
 const cell=(parent:T.Object3D,x:number,y:number,z:number,size:number)=>{const group=new T.Group();group.position.set(x,y,z);box(group,0,0,0,size,size,size,glass);const edge=new T.LineSegments(edges,rim);edge.scale.setScalar(size);group.add(edge);parent.add(group);return group;};
 const part=(parent:T.Object3D,scale=.58)=>{const mesh=new T.Mesh(partGeometry,steel);mesh.scale.setScalar(scale);parent.add(mesh);return mesh;};
 const lamp=(x:number,y:number,z:number)=>{const m=track(new T.MeshBasicMaterial({color:0x55c5ff,toneMapped:false}));lamps.push(m);return box(root,x,y,z,.075,.055,.075,m);};
 const link=(points:T.Vector3[])=>{const m=track(new T.LineBasicMaterial({color:0x4b9ccb,transparent:true,opacity:.32}));connections.push(m);const line=new T.Line(track(new T.BufferGeometry().setFromPoints(points)),m);root.add(line);return line;};
 let moving:T.Object3D|undefined,ghost:T.Object3D|undefined,inspection:ReturnType<typeof createQualityScan>|undefined,vertical:ReturnType<typeof createQualityScan>|undefined;
 const panels:T.Group[]=[],nodes:T.Group[]=[],pulses:T.Mesh[]=[],curves:T.QuadraticBezierCurve3[]=[];
 let telemetry:T.BufferAttribute|undefined,token:T.Mesh|undefined,gateLight:T.MeshBasicMaterial|undefined,flow:T.Points|undefined,flowMaterial:T.ShaderMaterial|undefined;
 const ease=(v:number)=>v*v*(3-2*v);
 if(kind==='mes'){
  box(root,0,-.48,0,5.7,.18,1.25,navy);box(root,0,-.34,0,5.35,.07,.95,pearl);
  const roller=track(new T.CylinderGeometry(.045,.045,1.05,10));
  for(let i=0;i<14;i++){const mesh=new T.Mesh(roller,steel);mesh.rotation.x=Math.PI/2;mesh.position.set(-2.55+i*.4,-.36,0);root.add(mesh);}
  for(let i=0;i<4;i++){const x=-1.95+i*1.3;box(root,x,-.72,0,.12,.42,.85,steel);cell(root,x,.42,0,.95);lamp(x,.98,.35);}
  const carrier=new T.Group();root.add(carrier);box(carrier,0,0,0,.78,.08,.74,navy);const component=part(carrier,.36);component.position.y=.3;moving=carrier;
  inspection=createQualityScan(1.05,1.05,track);inspection.group.rotation.y=Math.PI/2;inspection.group.position.set(.65,.45,0);root.add(inspection.group);
  const points=Array.from({length:56},(_,i)=>new T.Vector3(-2.45+i*4.9/55,-.72,.62));
  const geometry=track(new T.BufferGeometry().setFromPoints(points));telemetry=geometry.getAttribute('position') as T.BufferAttribute;const ribbon=new T.Line(geometry,track(new T.LineBasicMaterial({color:0x49c6ff,transparent:true,opacity:.85})));ribbon.frustumCulled=false;root.add(ribbon);
 }else if(kind==='twin'){
  box(root,0,-.5,0,5.4,.15,1.45,navy);box(root,0,1.55,-.15,5.3,.10,.14,steel);
  for(let i=0;i<3;i++){const x=-1.65+i*1.65;box(root,x,-.05,0,1.3,.8,1.1,glass);box(root,x,-.18,0,1.12,.44,.96,water);box(root,x,-.45,0,1.4,.12,1.2,pearl);lamp(x,.45,.48);}
  const carrier=new T.Group();root.add(carrier);box(carrier,0,1.42,-.15,.42,.18,.32,navy);box(carrier,0,.95,-.05,.045,.82,.045,steel);const component=part(carrier,.4);component.position.set(0,.48,.08);moving=carrier;
  for(let i=0;i<3;i++){const tank=new T.LineSegments(edges,rim);tank.position.set(-1.65+i*1.65,-.05,-1.65);tank.scale.set(1.3,.8,1.1);root.add(tank);}
  ghost=new T.Group();root.add(ghost);
  const carrierWire=new T.LineSegments(edges,rim);carrierWire.position.set(0,1.42,-.15);carrierWire.scale.set(.42,.18,.32);ghost.add(carrierWire);
  const hanger=new T.LineSegments(edges,rim);hanger.position.set(0,.95,-.05);hanger.scale.set(.045,.82,.045);ghost.add(hanger);
  const partEdges=track(new T.EdgesGeometry(partGeometry)),ghostPart=new T.LineSegments(partEdges,rim);ghostPart.scale.setScalar(.4);ghostPart.position.set(0,.48,.08);ghost.add(ghostPart);
 }else if(kind==='ai'){
  const prismMaterial=track(new T.MeshPhysicalMaterial({color:0x9fd0ea,transparent:true,opacity:.28,roughness:.08,metalness:.04,clearcoat:1,envMapIntensity:1.1,transmission:.2,thickness:.4}));addFresnelRim(prismMaterial,.7);
  const prism=new T.Mesh(track(new T.OctahedronGeometry(.78,0)),prismMaterial);prism.scale.set(.9,1.35,.9);prism.position.set(-.15,.55,0);root.add(prism);
  const count=700,positions=new Float32Array(count*3),seeds=new Float32Array(count);
  for(let i=0;i<count;i++){positions.set([(i%20)/19-.5,(Math.floor(i/20)%7)/6-.5,(Math.floor(i/140)%5)/4-.5],i*3);seeds[i]=(i*47%700)/700;}
  const geometry=track(new T.BufferGeometry());geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,1));
  flowMaterial=track(new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uTime:{value:0},uForm:{value:0},uDark:{value:0},uRatio:{value:1}},vertexShader:`attribute float aSeed;uniform float uForm,uRatio;varying float alpha;void main(){vec3 target=vec3(-.15,.55,0)+position*.35;float deposit=smoothstep(aSeed*.08,aSeed*.08+.72,uForm);float ease=deposit*deposit*(3.-2.*deposit);vec3 jitter=vec3(fract(aSeed*17.13)-.5,fract(aSeed*29.71)-.5,fract(aSeed*43.17)-.5);vec3 p=mix(target+jitter*1.7,target,ease);alpha=(1.-smoothstep(.7,1.,deposit))*(.35+.5*aSeed);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.+aSeed*.8)*uRatio;}`,fragmentShader:'uniform float uDark;varying float alpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.03,.32,.75),vec3(.42,.80,1.),uDark),alpha*(1.-smoothstep(.12,.5,r)));}'}));
  flow=new T.Points(geometry,flowMaterial);flow.frustumCulled=false;root.add(flow);
  for(let i=0;i<3;i++){const panel=new T.Group();panel.position.set(1.05,.15+i*.48,-.25);box(panel,0,0,0,1.15,.32,.05,i===2?navy:glass);box(panel,-.38,0,.04,.12,.1,.02,pearl);box(panel,.12,0,.04,.5,.02,.02,pearl);root.add(panel);panels.push(panel);}
  const gate=new T.Group();gate.position.set(2.15,.55,0);root.add(gate);
  box(gate,0,.62,0,1.15,.06,.06,glass);box(gate,0,-.62,0,1.15,.06,.06,glass);box(gate,-.55,0,0,.06,1.24,.06,glass);box(gate,.55,0,0,.06,1.24,.06,glass);
  gateLight=track(new T.MeshBasicMaterial({color:0x10283c,transparent:true,opacity:.35,toneMapped:false}));box(gate,0,0,-.02,.95,1.08,.02,gateLight);
  token=new T.Mesh(track(new T.SphereGeometry(.11,16,12)),track(new T.MeshBasicMaterial({color:0x8fd4ff,toneMapped:false})));root.add(token);
  inspection=createQualityScan(1.5,1.5,track);inspection.group.position.set(-1.5,.55,0);root.add(inspection.group);
 }else{
  box(root,0,-.7,0,1.8,.12,1.6,navy);cell(root,0,.15,0,1.2);const component=part(root,.5);component.position.y=.12;
  const records:[number[],'plates'|'ring'|'slab'|'scan'][]=[[[-1.85,.7,.15],'plates'],[[1.9,.75,-.15],'ring'],[[1.35,-.2,1.05],'slab'],[[-1.45,-.05,1.15],'scan']];
  records.forEach(([p,shape],i)=>{
   const node=new T.Group();node.position.set(p[0],p[1],p[2]);root.add(node);nodes.push(node);
   if(shape==='plates'){for(let n=0;n<3;n++)box(node,0,-.12+n*.14,0,.62,.06,.48,n===1?navy:pearl);}
   else if(shape==='ring'){const torus=new T.Mesh(track(new T.TorusGeometry(.28,.045,8,20)),navy);torus.rotation.x=Math.PI/2;node.add(torus);}
   else if(shape==='slab'){box(node,0,0,0,.7,.08,.5,pearl);box(node,-.08,.06,0,.38,.02,.28,navy);}
   else{const scan=new T.Mesh(track(new T.TorusGeometry(.3,.03,8,24)),steel);scan.rotation.x=Math.PI/3;node.add(scan);}
   const end=new T.Vector3(p[0],p[1],p[2]),control=new T.Vector3(p[0]*.45,p[1]+.55,p[2]*.4),curve=new T.QuadraticBezierCurve3(new T.Vector3(0,.2,0),control,end);
   curves.push(curve);root.add(new T.Mesh(track(new T.TubeGeometry(curve,18,.02,5,false)),pearl));
   const pulse=new T.Mesh(track(new T.SphereGeometry(.055,10,8)),track(new T.MeshBasicMaterial({color:0x8fd8ff,toneMapped:false})));root.add(pulse);pulses.push(pulse);lamp(p[0],p[1]+.42,p[2]);
   link([new T.Vector3(),control,end]);
  });
 }
 let disposed=false,lastWidth=0,lastHeight=0;
 function update(time:number,smoked:boolean,parallax=0){if(disposed)return;const b={width:canvas.clientWidth,height:canvas.clientHeight};if(!b.width||!b.height)return;if(b.width!==lastWidth||b.height!==lastHeight){lastWidth=b.width;lastHeight=b.height;renderer.setSize(b.width,b.height,false);const aspect=b.width/b.height,h=Math.max(3.65,6.6/aspect);camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();}
  camera.position.set(-6+parallax*1.35,5.0,8);camera.lookAt(0,.3,0);camera.updateMatrixWorld();
  const p=Math.max(0,Math.min(1,(time-3.2)/8.8)),step=Math.min(3,Math.floor(p*4)),cycle=(p*4)%1;
  glass.opacity=smoked?.30:.24;glass.color.setHex(smoked?0xa2d0ee:0x7caccb);rim.color.setHex(smoked?0xb4e4ff:0x377eae);pearl.color.setHex(smoked?0xc4dceb:0xe8f2f8);
  lamps.forEach((m,i)=>m.color.setHex(i===step?0xa4e7ff:smoked?0x28566f:0x527e98));
  if(kind==='mes'&&moving){moving.position.set(-1.95+Math.min(3,Math.max(0,p*3.45))*1.3,.03,0);inspection?.update(step===2?Math.sin(cycle*Math.PI):0,smoked);
   if(telemetry){for(let i=0;i<telemetry.count;i++)telemetry.setY(i,-.72+Math.sin(i*.45-time*3.2)*.08);telemetry.needsUpdate=true;}}
  if(kind==='twin'&&moving&&ghost){const station=Math.min(2,Math.floor(p*3)),local=(p*3)%1;const x=-1.65+station*1.65,y=p===1?0:-Math.sin(local*Math.PI)*.62;moving.position.set(x,y,0);ghost.position.set(x,y,-1.65);}
  if(kind==='ai'&&token&&gateLight&&flowMaterial){
   flowMaterial.uniforms.uForm.value=Math.min(1,time/3.6);flowMaterial.uniforms.uDark.value=smoked?1:0;flowMaterial.uniforms.uRatio.value=renderer.getPixelRatio();if(flow)flow.visible=time<4.2;
   inspection?.update(p>0&&p<.42?Math.sin(p/.42*Math.PI):0,smoked);inspection?.group.position.set(-1.35,.55,0);
   panels.forEach((panel,i)=>{panel.visible=p>.2+i*.16;panel.position.y=.15+i*.48+Math.max(0,.28-p+i*.1)*.6;});
   const approach=ease(Math.min(1,p/.72));token.position.set(-1.35+approach*3.15,.55,0);token.visible=p>.08;
   const approved=p>.82;gateLight.color.setHex(approved?0x9aebff:smoked?0x16344c:0xd5e8f4);gateLight.opacity=approved?.9:.4;
  }
  if(kind==='ontology'){nodes.forEach((node,i)=>{const arrival=ease(Math.max(0,Math.min(1,(p-i*.12)/.35)));node.scale.setScalar(Math.max(.001,arrival));connections[i].opacity=.12+arrival*.6;const pulse=pulses[i];if(pulse){pulse.visible=arrival>.2;pulse.position.copy(curves[i].getPoint((time*.22+i*.17)%1));pulse.scale.setScalar(.6+arrival*.7);}});if(p>.72)root.rotation.y=(p-.72)*1.4+(time*.12);}
  canvas.style.opacity=String(Math.min(1,time/2.5));renderer.render(scene,camera);canvas.dataset.ready='true';canvas.dataset.appTime=time.toFixed(2);canvas.dataset.kind=kind;
 }
 return {update,dispose(){disposed=true;scene.traverse(object=>{if(object instanceof T.Mesh||object instanceof T.Line||object instanceof T.LineSegments||object instanceof T.Points){if(!resources.has(object.geometry))resources.add(object.geometry);const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(m=>resources.add(m));}});resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
