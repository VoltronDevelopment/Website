import * as T from 'three';
import {particleWaveGLSL} from './particle-wave';
import layout from '../../public/sculptures/neural-network.json';
/** Fine surface samples share the node formation clock and settle into the original cube positions. */
export function createNeuralFormation(track:<R extends {dispose():void}>(r:R)=>R){
 const count=54*48,positions=new Float32Array(count*3),nodes=new Float32Array(count),layers=new Float32Array(count),seeds=new Float32Array(count);let seed=211;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<count;i++){const node=layout.nodes[i%54],p=[(random()-.5)*.3,(random()-.5)*.3,(random()-.5)*.3],face=i%6;p[Math.floor(face/2)]=face%2?.15:-.15;positions.set(p.map((v,j)=>v+node.position[j]),i*3);nodes[i]=node.id;layers[i]=node.layer;seeds[i]=random();}
 const geometry=track(new T.BufferGeometry());geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('nodeId',new T.BufferAttribute(nodes,1));geometry.setAttribute('layer',new T.BufferAttribute(layers,1));geometry.setAttribute('seed',new T.BufferAttribute(seeds,1));
 const material=track(new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{time:{value:0},ratio:{value:1},night:{value:0}},vertexShader:particleWaveGLSL+'attribute float nodeId,layer,seed;uniform float time,ratio;varying float alpha;void main(){float t=clamp((time-.15-layer*.3-mod(nodeId,25.)*.016)/.95,0.,1.);float p=t*t*t*(t*(t*6.-15.)+10.);vec3 target=position;vec3 v=latticeWave(target,p,seed,time,vec3(1.,0.,-.15),1.35,.30);alpha=sin(3.14159265*t)*(.3+seed*.7);gl_Position=projectionMatrix*modelViewMatrix*vec4(v,1.);gl_PointSize=(.8+seed)*ratio;}',fragmentShader:'uniform float night;varying float alpha;void main(){float d=max(abs(gl_PointCoord.x-.5),abs(gl_PointCoord.y-.5));gl_FragColor=vec4(mix(vec3(.03,.28,.48),vec3(.48,.84,1.),night),alpha*(1.-smoothstep(.2,.5,d)));}'})),points=new T.Points(geometry,material);points.frustumCulled=false;
 return {points,update(t:number,dark:boolean,ratio:number){points.visible=t>0&&t<2.5;material.uniforms.time.value=t;material.uniforms.night.value=dark?1:0;material.uniforms.ratio.value=ratio;}};
}
