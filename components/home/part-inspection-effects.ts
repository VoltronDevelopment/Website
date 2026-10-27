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
  const canvas=typeof document==='undefined'?undefined:document.createElement('canvas');if(canvas){canvas.width=200;canvas.height=80;const context=canvas.getContext('2d')!;context.font='600 54px Arial';context.fillStyle='#ffffff';context.fillText?.(text,10,57);}
  const texture=canvas?new THREE.CanvasTexture(canvas):new THREE.Texture();texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false});const sprite=new THREE.Sprite(material);sprite.name='inspection-numeral';sprite.scale.set(.52,.208,1);sprite.renderOrder=9;inspection.add(sprite);return {sprite,material,index:i};
 });
 const trails=[...labels.map(l=>({position:l.frame.position,kind:1})),...numbers.map(n=>({position:n.sprite.position,kind:2}))].map((entry,i)=>{
  const count=150,positions=new Float32Array(count*3),seeds=new Float32Array(count);for(let k=0;k<count;k++){seeds[k]=((k*73+i*19)%151)/151;positions[k*3]=((k*31%149)/149-.5)*.36;positions[k*3+1]=((k*53%157)/157-.5)*.13;positions[k*3+2]=((k*37%163)/163-.5)*.025;}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,toneMapped:false,uniforms:{age:{value:0},strength:{value:0},color:{value:new THREE.Color(0x47b8ff)}},vertexShader:'attribute float seed;uniform float age;varying float alpha;void main(){vec3 p=position;p+=vec3(sin(seed*38.)*.24,seed*.45+.12,cos(seed*29.)*.12)*age;alpha=(1.-age)*(.45+seed*.55);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=1.5+seed;}',fragmentShader:'uniform vec3 color;uniform float strength;varying float alpha;void main(){float d=max(abs(gl_PointCoord.x-.5),abs(gl_PointCoord.y-.5));gl_FragColor=vec4(color,alpha*strength*(1.-smoothstep(.2,.5,d)));}'});const points=new THREE.Points(geometry,material);points.renderOrder=10;points.frustumCulled=false;group.add(points);return {...entry,points,material,index:i};
 });
 return {group,update(time:number,dark=false){
  callouts.visible=index===1&&time>=3.5&&time<7.8;inspection.visible=index===2&&time>=6&&time<10.7;
  labels.forEach(({frame,material,rest,delay})=>{const strength=envelope(time,3.5+delay,4+delay,6.7,7.7);material.color.setHex(dark?0xc1f1ff:0x064b7d);material.opacity=strength;frame.position.y=rest+Math.max(0,time-5.5)*.13;});
  scanners.forEach(({plane,material,edgeMaterial},i)=>{const start=i?8:6.25,end=i?9.8:7.9,p=THREE.MathUtils.clamp((time-start)/(end-start),0,1),strength=Math.sin(Math.PI*p);plane.visible=p>0&&p<1;if(i)plane.position.set(-.95+p*1.90,0,.08);else plane.position.set(0,-.94+p*1.88,.08);material.opacity=strength*.10;edgeMaterial.opacity=strength*.9;});
  numbers.forEach(({sprite,material,index:i})=>{const start=6.5+i*.55,strength=envelope(time,start,start+.35,9.5+i*.12,10.5);sprite.visible=strength>.001;material.color.setHex(dark?0xe0f8ff:0x063653);material.opacity=strength;sprite.position.set(-.45+i*.44,.30+Math.max(0,time-start)*.14,.38-i*.08);});
  trails.forEach(t=>{const start=t.kind===1?6.7+t.index*.08:9.5+(t.index-labels.length)*.12,age=ramp(time,start,start+.9);t.points.position.copy(t.position);t.points.visible=time>start&&age<1;t.material.uniforms.age.value=age;t.material.uniforms.strength.value=Math.sin(Math.PI*age);t.material.uniforms.color.value.setHex(dark?0xa4e6ff:0x17649a);});
 }};
}
