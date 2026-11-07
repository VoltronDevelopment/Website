import * as T from 'three';
import {factoryKit} from './factory-kit';
import {createPhilosophyCubes} from '../home/philosophy-cubes';
import {buildCubePlant} from './cube-plant';
import {smooth} from './network-story';
import {cubeIntroDuration,cubeEdges,cubeSites,cubeTransfer} from './cube-layout';

type Own=<R extends {dispose:()=>void}>(resource:R)=>R;
export function factoryCubeArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const ports=cubeSites.map(point=>new T.Vector3(...point));
 const dim=own(new T.MeshBasicMaterial()),rear=own(new T.MeshBasicMaterial());
 const live=own(new T.MeshBasicMaterial()),track=own(new T.MeshBasicMaterial());
 const rod=own(new T.CylinderGeometry(1,1,1,10)),up=new T.Vector3(0,1,0);
 function link(material:T.Material){
  const mesh=new T.Mesh(rod,material);root.add(mesh);return mesh;
 }
 function place(mesh:T.Mesh,a:T.Vector3,b:T.Vector3,radius:number){
  const direction=new T.Vector3().subVectors(b,a),length=direction.length();
  mesh.visible=length>.001;if(!mesh.visible)return;
  mesh.position.copy(a).lerp(b,.5);mesh.quaternion.setFromUnitVectors(up,direction.normalize());
  mesh.scale.set(radius,length,radius);
 }
 const edges=cubeEdges.map(([a,b])=>{
  const edge=link((a&4)||(b&4)?dim:rear);place(edge,ports[a],ports[b],.033);return edge;
 });
 const center=own(createPhilosophyCubes());center.root.position.y=4.6;root.add(center.root);
 let lastTheme:boolean|undefined;
 const pane=own(new T.PlaneGeometry(9.2,9.2));
 const faces=Array.from({length:6},(_,i)=>{
  const material=own(new T.ShaderMaterial({
   uniforms:{formation:{value:0},tint:{value:new T.Color()},density:{value:0}},
   transparent:true,depthWrite:false,side:T.DoubleSide,
   vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
   fragmentShader:`varying vec2 vUv;uniform float formation;uniform float density;uniform vec3 tint;
    void main(){
     float diagonal=(vUv.x+vUv.y)*.5;
     float front=formation*1.1-.04-diagonal;
     float coverage=smoothstep(-.018,.018,front);
     float sweep=exp(-90.*abs(front));
     float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));
     float sheen=exp(-12.*abs(diagonal-.72));
     gl_FragColor=vec4(tint,coverage*(density*(.65+.65*sheen)+.12*exp(-130.*edge))+.28*sweep);
     #include <colorspace_fragment>
    }`
  }));
  const face=new T.Mesh(pane,material);face.position.y=4.6;
  const side=i%2===0?-1:1;
  if(i<2){face.position.z=side*4.6;}
  else if(i<4){face.position.x=side*4.6;face.rotation.y=Math.PI/2;}
  else{face.position.y+=side*4.6;face.rotation.x=-Math.PI/2;}
  root.add(face);return face;
 });
 const rim=own(new T.TorusGeometry(.42,.05,8,32));
 const factories=cubeSites.map(([x,y,z],id)=>{
  const g=new T.Group();g.position.set(x,y,z);root.add(g);
  buildCubePlant(g,id,kit,own);
  const port=new T.Mesh(rim,dim);port.rotation.x=-Math.PI/2;port.position.y=.035;g.add(port);
  return {g,port};
 });
 const traces=[link(track),link(track)],trail=link(live);
 const head=new T.Mesh(own(new T.SphereGeometry(.16,16,10)),live);root.add(head);
 const halo=new T.Mesh(rim,live);halo.rotation.x=-Math.PI/2;root.add(halo);
 const end=new T.Vector3(),tail=new T.Vector3();
 return {groups:factories.map(site=>site.g),span:17.2,target:new T.Vector3(0,5.1,-.6),
  update(time:number,dark:boolean,_ambient=0){
   if(lastTheme!==dark){center.setTheme(dark);lastTheme=dark;}
   const seed=smooth(time/1.15);
   center.root.scale.setScalar(.7+.36*seed-.21*smooth((time-4)/3));
   center.apply({individual:seed,core:smooth((time-.22)/.8),outer:smooth((time-.48)/.85),height:0});
   let count=0;
   factories.forEach(({g},i)=>{
    const rise=smooth((time-1.65-i*.32)/.78);g.visible=rise>0;g.scale.setScalar(.55+.45*rise);
    g.position.y=cubeSites[i][1]-.36*(1-rise);if(g.visible)count++;
   });
   faces.forEach((face,i)=>{
    const form=smooth((time-4.85-i*.22)/1.65);face.visible=form>0;
    face.material.uniforms.formation.value=form;
    face.material.uniforms.tint.value.setHex(dark?0x83ddff:0x387fac);
    face.material.uniforms.density.value=dark?.053:.045;
   });
   edges.forEach(edge=>edge.visible=time>=4.85);
   const {route,leg,progress,first,last,arrived}=cubeTransfer(Math.max(0,time-cubeIntroDuration));
   dim.color.setHex(dark?0x57778c:0x7894a6);rear.color.setHex(dark?0x344c60:0xa8bbc5);
   track.color.setHex(dark?0x18a4be:0x00778e);live.color.setHex(dark?0xb5ffff:0x005d75);
   const phone=Boolean(root.userData.phone),radius=phone?.095:.074;
   traces.forEach((mesh,i)=>{
    const a=ports[route[i]],b=ports[route[i+1]];
    place(mesh,a,end.copy(a).lerp(b,i===0?first:last),radius);
   });
   const a=ports[route[leg]],b=ports[route[leg+1]];
   head.position.copy(a).lerp(b,progress);
   place(trail,tail.copy(a).lerp(b,Math.max(0,progress-.19)),head.position,radius*1.45);
   const atPort=progress===0||progress===1;
   head.visible=time>=cubeIntroDuration;halo.visible=head.visible&&atPort;halo.position.copy(head.position);halo.position.y+=.07;
   halo.scale.setScalar(1.25+.25*Math.sin(time*4));
   head.scale.setScalar(phone?1.6:1.32);
   factories.forEach(({port},i)=>{port.material=head.visible&&(i===route[0]||arrived&&i===route[2])?live:dim;});
   root.userData.siteCount=count;root.userData.envelopeEdges=12;
  }};
}
