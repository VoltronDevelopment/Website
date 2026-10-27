import * as T from 'three';
import {stroke,strokeMaterial} from '../home/lattice-materials';
/** One inspection sheet: a lit surface, central beam and three screen-space glow rims. */
export function createQualityScan(width:number,height:number,track:<R extends {dispose():void}>(r:R)=>R=r=>r){
 const group=new T.Group(),geometry=track(new T.PlaneGeometry(width,height));
 const material=track(new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false,uniforms:{strength:{value:0},color:{value:new T.Color()}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float strength;uniform vec3 color;void main(){
  float edge=1.-smoothstep(.01,.04,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
  float beam=1.-smoothstep(.015,.075,abs(vUv.x-.5));
  float falloff=smoothstep(0.,.12,vUv.y)*smoothstep(0.,.12,1.-vUv.y);
  gl_FragColor=vec4(color,strength*(.045+beam*.48*falloff+edge*.65));
  #include <colorspace_fragment>
 }`}));
 const mesh=new T.Mesh(geometry,material);mesh.renderOrder=4;group.add(mesh);
 const corners=[[-width/2,-height/2,0],[width/2,-height/2,0],[width/2,height/2,0],[-width/2,height/2,0]].map(p=>new T.Vector3(...p as [number,number,number]));
 const rims=[{width:8,peak:.12},{width:4,peak:.28},{width:1.8,peak:.95}].map(spec=>{const mat=track(strokeMaterial(true));mat.userData.cssWidth=spec.width;const line=stroke(corners.flatMap((p,i)=>[p,corners[(i+1)%4]]),mat);track(line.geometry);line.renderOrder=5;group.add(line);return {mat,...spec};});
 return {group,update(strength:number,dark:boolean,glow=1){const energy=T.MathUtils.clamp(strength,0,1);group.visible=energy>.001;material.uniforms.strength.value=energy*.85*glow;material.uniforms.color.value.setHex(dark?0x54caff:0x1676cf);rims.forEach(({mat,peak})=>{mat.opacity=peak*energy*glow;mat.color.setHex(peak===.95?(dark?0xd6f7ff:0x1264ad):0x2eabff);});}};
}
