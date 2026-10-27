import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
/** The approved flange supplies the source, all part targets and enclosure particles. */
export function createFactoryFormation(master:THREE.Object3D,source:THREE.Vector3,destinations:THREE.Vector3[],up:THREE.Vector3){
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],group=new THREE.Group();
 const pieces:THREE.BufferGeometry[]=[];master.traverse(o=>{if(o instanceof THREE.Mesh)pieces.push(o.geometry);});
 const geometry=mergeGeometries(pieces)!;geometries.push(geometry);
 const cut={value:-2},metal=new THREE.MeshPhysicalMaterial({color:0xb9cddd,metalness:.8,roughness:.25,clearcoat:.4});materials.push(metal);
 metal.onBeforeCompile=shader=>{shader.uniforms.uFormationCut=cut;shader.vertexShader='varying float vFormationField;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFormationField=dot(position,vec3(.6,.2,.5));');shader.fragmentShader='varying float vFormationField;uniform float uFormationCut;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(vFormationField<uFormationCut)discard;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.05,.3,.6)*exp(-abs(vFormationField-uFormationCut)*40.);');};
 const sample=new THREE.Mesh(geometry,metal);sample.name='single-master-sample';sample.scale.setScalar(1.1);group.add(sample);
 let seed=431;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const sampler=new MeshSurfaceSampler(new THREE.Mesh(geometry)) as MeshSurfaceSampler&{setRandomGenerator:(r:()=>number)=>MeshSurfaceSampler};sampler.setRandomGenerator(random);sampler.build();
 const count=7200,positions=new Float32Array(count*3),targets=new Float32Array(count*3),groups=new Float32Array(count),seeds=new Float32Array(count),p=new THREE.Vector3();
 for(let i=0;i<count;i++){
  sampler.sample(p);p.toArray(positions,i*3);const view=i%3;groups[i]=view;seeds[i]=random();
  if(i%4===0){p.set(random()*1.65-.825,random()*1.65-.825,random()*1.65-.825);const face=Math.floor(random()*6),axis=Math.floor(face/2);p.setComponent(axis,face%2?.825:-.825);if(i%8===0)p.setComponent((axis+1)%3,random()>.5?.825:-.825);}
  else p.multiplyScalar(.78);
  p.toArray(targets,i*3);
 }
 const particlesGeometry=new THREE.BufferGeometry();geometries.push(particlesGeometry);particlesGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));particlesGeometry.setAttribute('aTarget',new THREE.BufferAttribute(targets,3));particlesGeometry.setAttribute('aGroup',new THREE.BufferAttribute(groups,1));particlesGeometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uSource:{value:source},uDest0:{value:destinations[0]},uDest1:{value:destinations[1]},uDest2:{value:destinations[2]},uUp:{value:up},uCut:cut,uSeparate:{value:0},uAura:{value:1},uTime:{value:0},uOpacity:{value:1},uColor:{value:new THREE.Color(0x2589d7)},uSize:{value:3}},
  vertexShader:`attribute vec3 aTarget;attribute float aGroup,aSeed;uniform vec3 uSource,uDest0,uDest1,uDest2,uUp;uniform float uCut,uSeparate,uAura,uTime,uOpacity,uSize;varying float vAlpha;void main(){vec3 dest=aGroup<.5?uDest0:aGroup<1.5?uDest1:uDest2;vec3 aura=vec3(sin(aSeed*31.+uTime),cos(aSeed*23.+uTime),sin(aSeed*17.-uTime))*(.035+aSeed*.06)*uAura;vec3 p=mix(uSource+position*1.1+aura,dest+aTarget,uSeparate);p+=uUp*sin(uSeparate*3.14159265)*(.15+aSeed*.35);float digitized=1.-smoothstep(uCut-.03,uCut+.03,dot(position,vec3(.6,.2,.5)));vAlpha=max(digitized,uAura*step(.35,aSeed)*(.35+aSeed*.45))*uOpacity;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);gl_PointSize=uSize*(.6+aSeed*.6);}`,
  fragmentShader:'uniform vec3 uColor;varying float vAlpha;void main(){float d=max(abs(gl_PointCoord.x-.5),abs(gl_PointCoord.y-.5));float a=(1.-smoothstep(.20,.5,d))*vAlpha;if(a<.01)discard;gl_FragColor=vec4(uColor,a);\n#include <colorspace_fragment>\n}',

 });materials.push(material);const particles=new THREE.Points(particlesGeometry,material);particles.frustumCulled=false;particles.renderOrder=8;group.add(particles);
 return {group,update(time:number,dissolve:number,separate:number,opacity:number,dark:boolean,density:number){sample.position.copy(source);sample.visible=dissolve<1;cut.value=-2+dissolve*4;particles.visible=opacity>0;material.uniforms.uAura.value=(1-THREE.MathUtils.smoothstep(time,.8,2.3))*.85;material.uniforms.uTime.value=time;material.uniforms.uSeparate.value=separate;material.uniforms.uOpacity.value=opacity;material.uniforms.uColor.value.setHex(dark?0x8bcfff:0x237fc8);material.uniforms.uSize.value=1.55*density;},dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
