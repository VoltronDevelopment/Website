import * as T from 'three';
import {particleWaveGLSL} from './particle-wave';

/** Capture the actual initial pose once; walking begins after formation ends. */
export function createStoryFormation(root:T.Object3D,count:number,seedOffset=0,direct=false){
 root.updateWorldMatrix(true,true);
 const meshes:T.Mesh[]=[];root.traverse(o=>{if((o as T.Mesh).isMesh)meshes.push(o as T.Mesh);});
 const bounds=new T.Box3().setFromObject(root),height=Math.max(.1,bounds.max.y-bounds.min.y),uniforms={uBuild:{value:0},uMin:{value:bounds.min.y},uHeight:{value:height}};
 const random=(n:number)=>{const x=Math.sin((n+seedOffset)*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 const positions:number[]=[],seeds:number[]=[],p=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 const weighted=meshes.map(m=>({mesh:m,count:m.geometry.index?.count||m.geometry.attributes.position.count})),total=weighted.reduce((n,m)=>n+m.count,0);
 for(let i=0;i<count;i++){let pick=random(i*5)*total,mesh=weighted.at(-1)!.mesh;for(const item of weighted){pick-=item.count;if(pick<=0){mesh=item.mesh;break;}}
  const g=mesh.geometry,indices=g.index,tri=Math.floor(random(i*5+1)*(indices?indices.count:g.attributes.position.count)/3)*3;
  mesh.getVertexPosition(indices?indices.getX(tri):tri,a);mesh.getVertexPosition(indices?indices.getX(tri+1):tri+1,b);mesh.getVertexPosition(indices?indices.getX(tri+2):tri+2,c);
  const u=Math.sqrt(random(i*5+2)),v=random(i*5+3);p.copy(a).multiplyScalar(1-u).addScaledVector(b,u*(1-v)).addScaledVector(c,u*v).applyMatrix4(mesh.matrixWorld);positions.push(...p.toArray());seeds.push(random(i*5+4));
 }
 const materials:T.Material[]=[];
 for(const mesh of meshes){const list=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const material of list){if(materials.includes(material))continue;materials.push(material);
  const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey();
  material.onBeforeCompile=(shader,renderer)=>{previous.call(material,shader,renderer);Object.assign(shader.uniforms,uniforms);shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStoryWorld;').replace('#include <project_vertex>','#include <project_vertex>\nvStoryWorld=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vStoryWorld;uniform float uBuild,uMin,uHeight;').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat storyNoise=fract(sin(dot(floor(vStoryWorld*75.),vec3(12.9898,78.233,37.719)))*43758.5453);float storyField=clamp((vStoryWorld.y-uMin)/uHeight,0.,1.)*.72+storyNoise*.16;if(uBuild<storyField+.035)discard;');};material.customProgramCacheKey=()=>`voltron-story-formation-${seedOffset}`;
  const formationKey=material.customProgramCacheKey();material.customProgramCacheKey=()=>previousKey+'-'+formationKey;
  material.needsUpdate=true;
 }}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('seed',new T.Float32BufferAttribute(seeds,1));
 const particleUniforms={...uniforms,uTime:{value:0},uRatio:{value:1},uDark:{value:0},uDirect:{value:direct?1:0}};
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:particleUniforms,
  vertexShader:`${particleWaveGLSL}\nattribute float seed;uniform float uBuild,uMin,uHeight,uTime,uRatio,uDirect;varying float vAlpha,vSeed;void main(){float field=clamp((position.y-uMin)/uHeight,0.,1.)*.72+seed*.16;float arrival=smoothstep(field-.10,field+.08,uBuild);float deposited=smoothstep(field+.035,field+.18,uBuild);vec3 jitter=vec3(fract(seed*17.1)-.5,fract(seed*31.7)-.5,fract(seed*43.3)-.5);vec3 p=uDirect>.5?position+jitter*(1.-arrival)*.18:latticeWave(position,arrival,seed,uTime,vec3(.65,.7,-.15),1.3,.16);vAlpha=smoothstep(0.,.08,uBuild)*(1.-deposited)*(.55+.45*arrival);vSeed=seed;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);gl_PointSize=(1.15+seed*.85)*uRatio;}`,
  fragmentShader:`uniform float uDark;varying float vAlpha,vSeed;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;vec3 color=mix(mix(vec3(.025,.16,.28),vec3(.12,.43,.64),vSeed),mix(vec3(.16,.52,.76),vec3(.75,.95,1.),vSeed),uDark);gl_FragColor=vec4(color,vAlpha*(1.-smoothstep(.18,.5,r)));\n#include <colorspace_fragment>}`});
 const points=new T.Points(geometry,material);points.frustumCulled=false;
 return {points,update(progress:number,time:number,dark:boolean,ratio:number){uniforms.uBuild.value=progress;particleUniforms.uTime.value=time;particleUniforms.uDark.value=+dark;particleUniforms.uRatio.value=ratio;points.visible=progress>0&&progress<1;root.visible=progress>0;},dispose(){geometry.dispose();material.dispose();}};
}
