import * as THREE from 'three';
const ramp=(t:number,a:number,b:number)=>THREE.MathUtils.smoothstep(t,a,b);
const envelope=(t:number,a:number,b:number,c:number,d:number)=>ramp(t,a,b)*(1-ramp(t,c,d));
/** Transient, wordless context callouts and two orthogonal inspection passes. */
export function createPartInspectionEffects(index:number){
 const group=new THREE.Group(),callouts=new THREE.Group(),inspection=new THREE.Group();callouts.name='transient-context-callouts';inspection.name='transient-inspection-scans';group.add(callouts,inspection);
 const camera=new THREE.PerspectiveCamera();camera.position.set(12,9.6,14);camera.lookAt(0,0,0);
 const labels=(index===1?[[-.4,.36,.12],[.43,.37,-.16],[-.32,.14,-.32]]:[]).map((position,i)=>{
  const frame=new THREE.Group();frame.position.fromArray(position);frame.quaternion.copy(camera.quaternion);callouts.add(frame);
  const material=new THREE.LineBasicMaterial({color:0x4da9ec,transparent:true,depthTest:false});
  const points=[[-.15,-.055],[-.15,.055],[.15,.055],[.15,-.055],[-.15,-.055]].map(([x,y])=>new THREE.Vector3(x,y,0));
  const outline=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),material);outline.renderOrder=9;frame.add(outline);
  const tick=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.10,0,0),new THREE.Vector3(.04,0,0)]),material);tick.renderOrder=9;frame.add(tick);
  return {frame,material,rest:position[1],delay:i*.28};
 });
 const scanners=(index===2?[0,1]:[]).map(i=>{
  const plane=new THREE.Group(),geometry=new THREE.PlaneGeometry(1.85,i?1.85:1.40);
  const material=new THREE.MeshBasicMaterial({color:0x39bfff,transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=7;plane.add(mesh);
  const edgeMaterial=new THREE.LineBasicMaterial({color:0x8ae1ff,transparent:true,depthWrite:false,toneMapped:false});
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),edgeMaterial);edge.renderOrder=8;plane.add(edge);
  if(i)plane.rotation.y=Math.PI/2;else plane.rotation.x=-Math.PI/2;inspection.add(plane);return {plane,material,edgeMaterial};
 });
 const numbers=(index===2?['40.01','40.03','40.04']:[]).map((text,i)=>{
  const canvas=typeof document==='undefined'?undefined:document.createElement('canvas');if(canvas){canvas.width=200;canvas.height=80;const context=canvas.getContext('2d')!;context.font='500 48px Montserrat, Arial';context.fillStyle='#64c6ff';context.fillText?.(text,10,57);}
  const texture=canvas?new THREE.CanvasTexture(canvas):new THREE.Texture();texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false});const sprite=new THREE.Sprite(material);sprite.name='inspection-numeral';sprite.scale.set(.38,.152,1);sprite.renderOrder=9;inspection.add(sprite);return {sprite,material,index:i};
 });
 return {group,update(time:number){
  callouts.visible=index===1&&time>=3.5&&time<7.8;inspection.visible=index===2&&time>=6&&time<10.7;
  labels.forEach(({frame,material,rest,delay})=>{const strength=envelope(time,3.5+delay,4+delay,6.7,7.7);material.opacity=strength*.85;frame.position.y=rest+(1-strength)*.035;});
  scanners.forEach(({plane,material,edgeMaterial},i)=>{const start=i?8:6.25,end=i?9.8:7.9,p=THREE.MathUtils.clamp((time-start)/(end-start),0,1),strength=Math.sin(Math.PI*p);plane.visible=p>0&&p<1;if(i)plane.position.set(-.95+p*1.90,0,.08);else plane.position.set(0,-.94+p*1.88,.08);material.opacity=strength*.10;edgeMaterial.opacity=strength*.9;});
  numbers.forEach(({sprite,material,index:i})=>{const start=6.5+i*.55,strength=envelope(time,start,start+.35,9.5+i*.12,10.5);sprite.visible=strength>.001;material.opacity=strength*.95;sprite.position.set(-.45+i*.44,.34+Math.max(0,time-start)*.04,.27-i*.08);});
 }};
}
