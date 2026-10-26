import * as THREE from 'three';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';

/** The enclosure and supplied component share one local formation/dissolve field. */
export function createLotReveal(root:THREE.Group,housing:THREE.BufferGeometry,geometry:<T extends THREE.BufferGeometry>(v:T)=>T,material:<T extends THREE.Material>(v:T)=>T){
 const uniforms={uLotForm:{value:0},uLotExit:{value:0},uLotCenter:{value:new THREE.Vector3()},uTime:{value:0},uRatio:{value:1},uDark:{value:0}};
 const seen=new Set<THREE.Material>();
 function bind(mat:THREE.Material){if(seen.has(mat))return;seen.add(mat);const prior=mat.onBeforeCompile,key=mat.customProgramCacheKey();
  mat.onBeforeCompile=(shader,renderer)=>{prior.call(mat,shader,renderer);Object.assign(shader.uniforms,uniforms);
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform vec3 uLotCenter;varying vec3 vLotPoint;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLotPoint=(modelMatrix*vec4(transformed,1.)).xyz-uLotCenter;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uLotForm,uLotExit;varying vec3 vLotPoint;').replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
    float grain=fract(sin(dot(floor(vLotPoint*65.),vec3(12.9898,78.233,37.719)))*43758.5453);
    float field=clamp((vLotPoint.x+.84)/1.68+sin(vLotPoint.z*4.+vLotPoint.y*2.)*.04,0.,1.)*.72+grain*.10;
    float exitField=clamp((vLotPoint.x+.84)/1.68,0.,1.)*.72+grain*.10;
    float coverage=smoothstep(field,field+.16,uLotForm)*(1.-smoothstep(exitField,exitField+.16,uLotExit));if(uLotForm<=0.||uLotExit>=1.||grain>coverage)discard;`);
  };mat.customProgramCacheKey=()=>key+'-lot-reveal-1';
 }
 const positions:number[]=[],seeds:number[]=[];let n=0;const random=()=>{const x=Math.sin(++n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 for(let i=0;i<1200;i++){const face=i%6,p=[(random()-.5)*1.65,(random()-.5)*1.65,(random()-.5)*1.65];p[Math.floor(face/2)]=(face%2?1:-1)*.826;positions.push(...p);seeds.push(random());}
 const sampler=(new MeshSurfaceSampler(new THREE.Mesh(housing)) as MeshSurfaceSampler&{setRandomGenerator(fn:()=>number):MeshSurfaceSampler}).setRandomGenerator(random).build(),point=new THREE.Vector3();
 for(let i=0;i<900;i++){sampler.sample(point);positions.push(point.x*.64-.03,point.y*.64-.12,point.z*.64+.07);seeds.push(random());}
 const geo=geometry(new THREE.BufferGeometry());geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('aSeed',new THREE.Float32BufferAttribute(seeds,1));
 const mat=material(new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:`attribute float aSeed;uniform float uLotForm,uLotExit,uTime,uRatio;varying float vAlpha,vSeed;void main(){
  float grain=fract(sin(dot(floor(position*65.),vec3(12.9898,78.233,37.719)))*43758.5453);
  float field=clamp((position.x+.84)/1.68+sin(position.z*4.+position.y*2.)*.04,0.,1.)*.72+grain*.10,exitField=clamp((position.x+.84)/1.68,0.,1.)*.72+grain*.10;
  float arrived=smoothstep(field-.10,field+.06,uLotForm),covered=smoothstep(field,field+.16,uLotForm),departed=smoothstep(exitField-.05,exitField+.12,uLotExit);
  vec3 origin=vec3(-1.5+aSeed*.28,position.y*.65+sin(position.z*4.+uTime*2.)*.12,position.z*1.18);vec3 p=mix(origin,position,arrived);
  p+=vec3(.65+aSeed*.35,sin(position.z*4.+uTime*2.)*.14,position.z*.15)*departed;
  vAlpha=((1.-covered)*(.22+.65*arrived)*(1.-uLotExit)+departed*(1.-smoothstep(.62,1.,uLotExit)))*.85;vSeed=aSeed;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.+aSeed*1.2)*uRatio;
 }`,fragmentShader:`uniform float uDark;varying float vAlpha,vSeed;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(mix(vec3(.03,.32,.75),vec3(.42,.80,1.),uDark),vAlpha*(1.-smoothstep(.12,.5,r)));#include <colorspace_fragment>\n}`.replace(';#include',';\n#include')}));
 const points=new THREE.Points(geo,mat);points.frustumCulled=false;points.renderOrder=4;root.add(points);
 return {bind,update(form:number,exit:number,time:number,dark:boolean,ratio:number){uniforms.uLotForm.value=form;uniforms.uLotExit.value=exit;uniforms.uTime.value=time;uniforms.uRatio.value=ratio;uniforms.uDark.value=dark?1:0;uniforms.uLotCenter.value.copy(root.position);points.visible=form<1||exit>0&&exit<1;},points};
}
