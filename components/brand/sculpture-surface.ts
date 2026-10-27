import {particleWaveGLSL} from './particle-wave';
import type {ArtworkTuning} from "./artwork-tuning";
import * as THREE from "three";

export type SculptureAsset="head"|"arm"|"dosti"|"planes";
export async function loadSculptureAsset(kind:SculptureAsset){
 const responses=await Promise.all([fetch(`/sculptures/${kind}-mesh.bin`),fetch(`/sculptures/${kind}-points.bin`)]);
 if(responses.some(r=>!r.ok))throw new Error("Sculpture unavailable: "+kind);
 const mesh=await responses[0].arrayBuffer(),points=new Float32Array(await responses[1].arrayBuffer());
 const header=new Uint32Array(mesh,0,2);
 if(mesh.byteLength!==8+header[0]*32+header[1]*4||points.length%8)throw new Error("Invalid sculpture data");
 return {mesh,points};
}
type AssetData=Awaited<ReturnType<typeof loadSculptureAsset>>;
/** Surface, particles and depth are built from the same asset-local reveal field. */
export function createSculptureSurface(asset:AssetData,kind:SculptureAsset,mobile:boolean,solidReview=false,particleDensity=1){
 const group=new THREE.Group(),header=new Uint32Array(asset.mesh,0,2),vertex=new THREE.InterleavedBuffer(new Float32Array(asset.mesh,8,header[0]*8),8),geometry=new THREE.BufferGeometry();
 geometry.setAttribute("position",new THREE.InterleavedBufferAttribute(vertex,3,0));geometry.setAttribute("normal",new THREE.InterleavedBufferAttribute(vertex,3,3));geometry.setAttribute("aRegion",new THREE.InterleavedBufferAttribute(vertex,1,6));geometry.setAttribute("aPart",new THREE.InterleavedBufferAttribute(vertex,1,7));geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(asset.mesh,8+header[0]*32,header[1]),1));
 const uniforms={uFieldAxis:{value:kind==='arm'?new THREE.Vector3(0,-1,0):kind==='head'||kind==='planes'?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)},uFieldOffset:{value:kind==='arm'?1:kind==='head'||kind==='planes'?0:.5},uParticleScale:{value:1},uWave:{value:1},uSpeed:{value:1},uRear:{value:1},uBuild:{value:0},uRatio:{value:1},uTime:{value:0},uDark:{value:0},uDual:{value:kind==='dosti'?1:0},uFlow:{value:kind==='arm'?new THREE.Vector3(-.18,.9,0):new THREE.Vector3(0,0,0)}};
 const material=new THREE.MeshPhysicalMaterial({color:0x8ca9bd,metalness:.22,roughness:.46,clearcoat:.12,clearcoatRoughness:.24,envMapIntensity:.45,side:THREE.DoubleSide,flatShading:kind==='planes'});
 const inject=(shader:{uniforms:Record<string,unknown>;vertexShader:string;fragmentShader:string})=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float aRegion,aPart;varying vec3 vBuildPosition;varying float vBuildRegion,vBuildPart;').replace('#include <begin_vertex>','#include <begin_vertex>\nvBuildPosition=position;vBuildRegion=aRegion;vBuildPart=aPart;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float uBuild,uFieldOffset;uniform vec3 uFieldAxis;varying vec3 vBuildPosition;varying float vBuildRegion,vBuildPart;float sculptureHash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}');
  shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat cellNoise=sculptureHash(floor(vBuildPosition*95.));float region=clamp(dot(vBuildPosition,uFieldAxis)+uFieldOffset,0.,1.);region=region*region*(3.-2.*region);float field=region*.48+cellNoise*.06;float coverage=smoothstep(field+.15,field+.40,uBuild);if(cellNoise>coverage)discard;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=1.-.055*mod(vBuildPart,2.);');
 };
 material.onBeforeCompile=inject;material.customProgramCacheKey=()=>"voltron-sculpture-surface-2";
 const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});depth.onBeforeCompile=inject;depth.customProgramCacheKey=()=>"voltron-sculpture-depth-2";mesh.customDepthMaterial=depth;
 const values:number[]=[],normals:number[]=[],regions:number[]=[],seeds:number[]=[];
 const sampleCount=asset.points.length/8,stride=mobile?2:1,count=Math.round(sampleCount/stride*THREE.MathUtils.clamp(particleDensity,1,3));
 for(let sample=0;sample<count;sample++){const i=sample*stride%sampleCount*8,pass=Math.floor(sample*stride/sampleCount),seed=pass?(asset.points[i+7]+pass*.381966)%1:asset.points[i+7];
  // Extra fine samples sit immediately above the same surface, with distinct wave phases.
  values.push(...[0,1,2].map(axis=>asset.points[i+axis]+asset.points[i+3+axis]*pass*.0008));normals.push(...asset.points.subarray(i+3,i+6));regions.push(asset.points[i+6]);seeds.push(seed);
 }
 const particles=new THREE.BufferGeometry();particles.setAttribute('position',new THREE.Float32BufferAttribute(values,3));particles.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));particles.setAttribute('aRegion',new THREE.Float32BufferAttribute(regions,1));particles.setAttribute('seed',new THREE.Float32BufferAttribute(seeds,1));
 const particleMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:`${particleWaveGLSL}
attribute float aRegion,seed;uniform float uBuild,uRatio,uTime,uDual,uParticleScale,uWave,uSpeed,uRear;uniform vec3 uFlow,uFieldAxis;uniform float uFieldOffset;varying float vAlpha,vLight;void main(){
 float region=clamp(dot(position,uFieldAxis)+uFieldOffset,0.,1.);region=region*region*(3.-2.*region);float cellNoise=fract(sin(dot(floor(position*95.),vec3(12.9898,78.233,37.719)))*43758.5453);float field=region*.48+cellNoise*.06;float arrival=smoothstep(field,field+.25,uBuild);float surface=smoothstep(field+.15,field+.46,uBuild);
 vec3 direction=mix(uFieldAxis.y<0.?vec3(.20,-1.,.12):vec3(1.,.15,.12),vec3(-sign(position.x),.12,.1),uDual);
 vec3 p=latticeWave(position+normal*.0015,arrival,seed,uTime*uSpeed,direction,.65,.15*uWave);vec3 n=normalize(normalMatrix*normal);vLight=clamp(.18+.72*max(0.,dot(n,normalize(vec3(-.3,.8,1.))))+.12*pow(1.-abs(n.z),3.),0.,1.);
 vAlpha=mix(uRear,1.,smoothstep(-.1,.2,n.z))*smoothstep(0.,.12,uBuild)*mix(.60,.96,arrival)*(1.-surface*.985)*mix(1.,.08,step(.92,surface));
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.05+seed*.75)*uRatio*uParticleScale;
 }`,fragmentShader:`uniform float uDark;varying float vAlpha,vLight;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;vec3 color=mix(mix(vec3(.03,.13,.22),vec3(.18,.42,.66),vLight),mix(vec3(.10,.30,.45),vec3(.8,.94,1.),vLight),uDark);gl_FragColor=vec4(color,vAlpha*(1.-smoothstep(.2,.5,r)));#include <colorspace_fragment>
 }`.replace(';#include',';\n#include')});
 const points=new THREE.Points(particles,particleMaterial);points.renderOrder=2;points.frustumCulled=false;group.add(points);
 return {group,mesh,particleCount:count,tune(value:ArtworkTuning){uniforms.uParticleScale.value=value.particleScale;uniforms.uWave.value=value.waveAmplitude;uniforms.uSpeed.value=value.waveSpeed;uniforms.uRear.value=value.rearVisibility;material.roughness=THREE.MathUtils.clamp(.46*value.roughness,.12,1);material.envMapIntensity=.45*value.reflection;},update(time:number,progress:number,dark:boolean,ratio:number){uniforms.uTime.value=time;uniforms.uBuild.value=solidReview?1:progress;uniforms.uDark.value=dark?1:0;uniforms.uRatio.value=ratio;points.visible=!solidReview&&progress<.999;material.color.setHex(dark?0x8dafc8:0x8ca9bd);},dispose(){geometry.dispose();material.dispose();depth.dispose();particles.dispose();particleMaterial.dispose();}};
}
