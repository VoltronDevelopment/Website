import {particleWaveGLSL} from '../brand/particle-wave';
import * as THREE from 'three';
import {philosophyDimensions} from './philosophy-cube-timeline';
/** A coherent ribbon forms the exact small cube before its independent descent. */
export function createPhilosophyWave(individual:THREE.Group,options:{direction?:THREE.Vector3;reach?:number}={}){
 const form={value:0},time={value:0},height={value:philosophyDimensions.travel as number},ratio={value:1},dark={value:0};
 individual.traverse(o=>{if(!(o instanceof THREE.Mesh)||!(o.material instanceof THREE.MeshPhongMaterial||o.material instanceof THREE.MeshPhysicalMaterial))return;const mat=o.material,prior=mat.onBeforeCompile,key=mat.customProgramCacheKey();mat.onBeforeCompile=(shader,renderer)=>{prior.call(mat,shader,renderer);shader.uniforms.uIndividualForm=form;shader.vertexShader='varying vec3 vIndividualPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvIndividualPoint=position;');shader.fragmentShader='varying vec3 vIndividualPoint;uniform float uIndividualForm;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=fract(sin(dot(floor(vIndividualPoint*100.),vec3(12.9898,78.233,37.719)))*43758.5453);float field=(vIndividualPoint.y+.18)/.36*.8+grain*.15;if(field>uIndividualForm+.0001)discard;');};mat.customProgramCacheKey=()=>key+'-individual-wave';});
 const count=720,positions=new Float32Array(count*3),seeds=new Float32Array(count);let seed=812;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<count;i++){const p=[(random()-.5)*.36,(random()-.5)*.36,(random()-.5)*.36],face=i%6;p[Math.floor(face/2)]=face%2?.18:-.18;positions.set(p,i*3);seeds[i]=random();}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uForm:form,uTime:time,uHeight:height,uRatio:ratio,uDark:dark,uDirection:{value:options.direction??new THREE.Vector3(1,.1,.1)},uReach:{value:options.reach??1.35}},
  vertexShader:`${particleWaveGLSL}
attribute float aSeed;uniform float uForm,uTime,uHeight,uRatio,uReach;uniform vec3 uDirection;varying float vAlpha;void main(){float grain=fract(sin(dot(floor(position*100.),vec3(12.9898,78.233,37.719)))*43758.5453);float field=(position.y+.18)/.36*.8+grain*.15;float arrived=smoothstep(field-.24,field+.04,uForm);vec3 target=position+vec3(0.,uHeight,0.);vec3 p=latticeWave(target,arrived,aSeed,uTime,uDirection,uReach,.18);vAlpha=(1.-smoothstep(field,field+.23,uForm))*(1.-smoothstep(.86,1.,uForm));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.1+aSeed*.75)*uRatio;}`,
  fragmentShader:'uniform float uDark;varying float vAlpha;void main(){float a=(1.-smoothstep(.1,.5,length(gl_PointCoord-.5)))*vAlpha;if(a<.01)discard;gl_FragColor=vec4(mix(vec3(.025,.25,.52),vec3(.49,.83,1.),uDark),a);\n#include <colorspace_fragment>\n}',
 });
 const points=new THREE.Points(geometry,material);points.frustumCulled=false;
 return {points,update(t:number,formation:number,y:number,isDark:boolean,density:number){form.value=formation;time.value=t;height.value=y;dark.value=isDark?1:0;ratio.value=density;points.visible=t>=2.6&&formation<1;},dispose(){geometry.dispose();material.dispose();}};
}
