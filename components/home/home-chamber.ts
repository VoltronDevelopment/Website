import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
/** Shared diagonal field clips the real glass surfaces and releases their sampled particles. */
export function createHomeChamber(group:THREE.Group,camera:THREE.Camera,track:<T extends {dispose():void}>(v:T)=>T){
 // Cut and identity share the cube's own XY face, retaining its isometric perspective.
 const forward=new THREE.Vector3(0,0,1),right=new THREE.Vector3(1,0,0),axis=forward.clone().negate(),up=new THREE.Vector3(0,1,0);
 const orientation=new THREE.Quaternion();
 const center={value:new THREE.Vector3()},cut={value:-2},progress={value:0},clock={value:0};
 const shell:THREE.MeshPhysicalMaterial[]=[];
 group.traverse(object=>{if(!(object instanceof THREE.Mesh)||!(object.material instanceof THREE.MeshPhysicalMaterial))return;const material=object.material,original=material.onBeforeCompile,programKey=material.customProgramCacheKey();
  shell.push(material);material.onBeforeCompile=(shader,renderer)=>{original.call(material,shader,renderer);shader.uniforms.uChamberCenter=center;shader.uniforms.uChamberAxis={value:axis};shader.uniforms.uChamberCut=cut;
   shader.vertexShader='varying float vChamberField;uniform vec3 uChamberCenter;uniform vec3 uChamberAxis;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvChamberField=dot((modelMatrix*vec4(transformed,1.)).xyz-uChamberCenter,uChamberAxis);');
   shader.fragmentShader='varying float vChamberField;uniform float uChamberCut;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(vChamberField<uChamberCut)discard;diffuseColor.rgb+=vec3(.08,.28,.45)*exp(-abs(vChamberField-uChamberCut)*65.);');
   shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.12,.58,1.)*exp(-abs(vChamberField-uChamberCut)*70.)*2.;');
  };material.customProgramCacheKey=()=>`${programKey}-home-diagonal-chamber`;
 });
 const corners=Array.from({length:8},(_,i)=>new THREE.Vector3(i&1?.5:-.5,i&2?.5:-.5,i&4?.5:-.5)),pairs=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],intersections:THREE.Vector3[]=[];
 for(const [a,b] of pairs){const da=corners[a].dot(axis),db=corners[b].dot(axis);if(da*db<0)intersections.push(corners[a].clone().lerp(corners[b],da/(da-db)));}
 intersections.sort((a,b)=>Math.atan2(a.dot(up),a.dot(right))-Math.atan2(b.dot(up),b.dot(right)));
 const shape=new THREE.Shape(),r=.06;shape.moveTo(-.5+r,-.5);shape.lineTo(.5-r,-.5);shape.quadraticCurveTo(.5,-.5,.5,-.5+r);shape.lineTo(.5,.5-r);shape.quadraticCurveTo(.5,.5,.5-r,.5);shape.lineTo(-.5+r,.5);shape.quadraticCurveTo(-.5,.5,-.5,.5-r);shape.lineTo(-.5,-.5+r);shape.quadraticCurveTo(-.5,-.5,-.5+r,-.5);shape.closePath();
 const capMaterial=track(new THREE.MeshPhysicalMaterial({transparent:true,opacity:0,roughness:.38,metalness:.02,clearcoat:.45,envMapIntensity:.2,depthWrite:true}));
 const cap=new THREE.Mesh(track(new THREE.ShapeGeometry(shape)),capMaterial);cap.name='steady-identity-face';cap.position.copy(forward).multiplyScalar(.006);cap.renderOrder=5;group.add(cap);
 const borderMaterial=track(new THREE.LineBasicMaterial({color:0x64baff,transparent:true,depthWrite:false,toneMapped:false})),border=new THREE.LineSegments(track(new THREE.EdgesGeometry(cap.geometry)),borderMaterial);border.quaternion.copy(cap.quaternion);border.position.copy(cap.position).addScaledVector(forward,.002);border.renderOrder=6;group.add(border);
 const roundedGeometry=track(new RoundedBoxGeometry(1,1,.5,4,r)),roundedMaterials=Array.from({length:6},()=>track(new THREE.MeshPhysicalMaterial({transparent:true,opacity:0,depthWrite:false,roughness:.13,metalness:.06,clearcoat:.95,clearcoatRoughness:.1,envMapIntensity:1.35})));
 const rounded=new THREE.Mesh(roundedGeometry,roundedMaterials);rounded.name='rounded-identity-chamber';rounded.position.z=-.25;group.add(rounded);
 const pulseMaterial=track(new THREE.MeshBasicMaterial({color:0x4a8ffd,transparent:true,opacity:0,side:THREE.BackSide,depthWrite:false,toneMapped:false})),pulseBody=new THREE.Mesh(roundedGeometry,pulseMaterial);pulseBody.position.z=-.25;group.add(pulseBody);
 const count=2600,positions=new Float32Array(count*3),seeds=new Float32Array(count);let seed=119;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<count;i++){const face=i%6,p=[random()-.5,random()-.5,random()-.5];if(i<1600)p[Math.floor(face/2)]=face%2?.5:-.5;positions.set(p,i*3);seeds[i]=random();}
 const geometry=track(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const material=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uCenter:center,uAxis:{value:axis},uUp:{value:up},uCut:cut,uProgress:progress,uTime:clock,uColor:{value:new THREE.Color(0x67c5ff)},uSize:{value:3}},
  vertexShader:`attribute float aSeed;uniform vec3 uCenter,uAxis,uUp;uniform float uCut,uProgress,uTime,uSize;varying float vAlpha;void main(){vec3 p=(modelMatrix*vec4(position,1.)).xyz;float field=dot(p-uCenter,uAxis);float age=(uCut-field)/1.6;float live=step(0.,age)*(1.-smoothstep(.12,.65,age));p-=uAxis*age*(.35+aSeed*.5);p+=uUp*age*(.25+sin(aSeed*21.)*.4);vAlpha=live*smoothstep(5.,5.1,uTime)*(1.-smoothstep(7.3,8.1,uTime));gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);gl_PointSize=uSize*(.55+aSeed*.55);}`,
  fragmentShader:`uniform vec3 uColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.12,.5,d))*vAlpha;if(a<.01)discard;gl_FragColor=vec4(uColor,a);#include <colorspace_fragment>}`.replace(';#include',';\n#include'),
 }));
 const particles=new THREE.Points(geometry,material);particles.frustumCulled=false;particles.renderOrder=8;group.add(particles);
 return {update(time:number,slice:number,dark:boolean,pulse=0,logo=0){group.updateMatrixWorld(true);group.getWorldPosition(center.value);axis.set(0,0,-1).applyQuaternion(group.getWorldQuaternion(orientation));cut.value=-1.6+slice*1.6;progress.value=slice;clock.value=time;particles.visible=time>=5&&time<8.1;material.uniforms.uColor.value.setHex(dark?0x8bd9ff:0x238de1);material.uniforms.uSize.value=Math.min(devicePixelRatio||1,2)*2.7;cap.visible=border.visible=logo>0;capMaterial.color.setHex(dark?0x080f1b:0xf3f5f7);capMaterial.opacity=logo*.97;borderMaterial.opacity=logo*.40;const rounding=THREE.MathUtils.smoothstep(time,7.15,7.65);rounded.visible=pulseBody.visible=rounding>0;roundedMaterials.forEach((m,i)=>{m.opacity=i===4?0:rounding*(i===2?.68:.40);m.color.setHex(i===2?(dark?0x8fb9d4:0xe7f3fc):(dark?0x143755:0x96bdd6));m.emissive.setHex(0x217cdd);m.emissiveIntensity=(.08+pulse*.5)*rounding;});pulseMaterial.opacity=rounding*(.3+.4*pulse)*.35;pulseMaterial.blending=dark?THREE.AdditiveBlending:THREE.NormalBlending;pulseBody.scale.setScalar(1+.06*pulse);for(const m of shell){m.opacity*=1-rounding;const weight=m.userData.faceKind==='rear'?.55:m.userData.faceKind==='top'?.8:1;m.emissive.setHex(0x227ce1);m.emissiveIntensity=.015+logo*(.10+pulse*.62)*weight;}}};
}
