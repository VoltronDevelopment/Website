import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';

/** One bounded, cached planar pilot. The existing floor echo remains the default tier. */
export function createHomeFloorReflection(exclude:()=>T.Object3D[],mobile:boolean){
 const resolution=mobile?256:512,geometry=new T.PlaneGeometry(5.8,4.5);
 const reflector=new Reflector(geometry,{textureWidth:resolution,textureHeight:resolution,multisample:0,clipBias:.002,shader:{name:'VoltronSoftFloor',
  uniforms:{color:{value:new T.Color(0xffffff)},tDiffuse:{value:null},textureMatrix:{value:new T.Matrix4()},uAlpha:{value:0},uTexel:{value:1/resolution}},
  vertexShader:'uniform mat4 textureMatrix;varying vec4 vReflection;varying vec2 vFloor;void main(){vFloor=uv;vReflection=textureMatrix*vec4(position,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;uniform float uAlpha,uTexel;varying vec4 vReflection;varying vec2 vFloor;void main(){vec2 uv=vReflection.xy/vReflection.w;float blur=uTexel*1.4;vec4 reflection=texture2D(tDiffuse,uv)*.4;reflection+=texture2D(tDiffuse,uv+vec2(blur,0.))*.15;reflection+=texture2D(tDiffuse,uv-vec2(blur,0.))*.15;reflection+=texture2D(tDiffuse,uv+vec2(0.,blur))*.15;reflection+=texture2D(tDiffuse,uv-vec2(0.,blur))*.15;float fade=1.-smoothstep(.16,.55,length((vFloor-.5)*vec2(.85,1.)));gl_FragColor=vec4(reflection.rgb,reflection.a*uAlpha*fade);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}});
 reflector.rotation.x=-Math.PI/2;reflector.position.y=-.012;const material=reflector.material as T.ShaderMaterial;material.transparent=true;material.depthWrite=false;
 let dirty=true,time=0,lastBucket=-1,captures=0;
 const capture=reflector.onBeforeRender;
 reflector.onBeforeRender=function(...args){const bucket=Math.floor(time*20);if(!dirty&&bucket===lastBucket)return;const hidden=exclude().map(object=>({object,visible:object.visible}));
  try{hidden.forEach(({object})=>object.visible=false);capture.apply(this,args);dirty=false;lastBucket=bucket;captures++;}
  finally{hidden.forEach(({object,visible})=>object.visible=visible);}
 };
 return {reflector,update(seconds:number,ground:number,dark:boolean){time=seconds;material.uniforms.uAlpha.value=ground*(dark?.23:.18);},invalidate(){dirty=true;},get captures(){return captures;},dispose(){reflector.dispose();geometry.dispose();}};
}
