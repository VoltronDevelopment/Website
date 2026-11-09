import * as T from 'three';
import {createAlphaTankShell,createAlphaTrolleyBody,type AlphaBox} from '../home/alpha-equipment';
import {createAlphaBathSurface} from '../home/alpha-bath-surface';
import {alphaVisualColors} from '../home/alpha-visual-palette';

export function mountCoatingCycle(canvas:HTMLCanvasElement){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setClearColor(0,0);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
 const scene=new T.Scene(),station=new T.Group(),camera=new T.OrthographicCamera();
 scene.add(station,new T.HemisphereLight(0xffffff,0x52697a,2));
 const lamp=new T.DirectionalLight(0xffffff,3);
 lamp.position.set(-3,8,5);scene.add(lamp);
 camera.position.set(6,5.8,8);camera.lookAt(0,2.85,0);
 const material=(color:number)=>new T.MeshStandardMaterial({color,metalness:.28,roughness:.42});
 const metal=material(0x91a2b0),polished=material(0xcbdae5),steelDark=material(0x354955),back=material(0x637689);
 const glass=new T.MeshStandardMaterial({color:0xa3d1ed,transparent:true,opacity:.23,depthWrite:false});
 const box:AlphaBox=(parent,size,position,mat)=>{
  const mesh=new T.Mesh(new T.BoxGeometry(size[0],size[1],size[2]),mat);
  mesh.position.fromArray(position);parent.add(mesh);return mesh;
 };
 const geometry=<G extends T.BufferGeometry>(g:G)=>g;
 createAlphaTankShell(station,box,geometry,{metal,polished,steelDark,back,front:glass,side:glass},true);
 createAlphaTrolleyBody(station,box,geometry,{metal,polished,steelDark});
 for(const z of [-.69,.69]){
  box(station,[3.5,.12,.12],[0,5.27,z],polished);
  box(station,[.11,5.1,.12],[-1.68,2.65,z],steelDark);
 }
 const bath=createAlphaBathSurface(1);
 const surface=new T.Mesh(new T.PlaneGeometry(2.94,2.3,16,12),bath);
 surface.rotation.x=-Math.PI/2;surface.position.y=1.82;surface.renderOrder=3;station.add(surface);
 const liquid=new T.MeshBasicMaterial({color:0x428bb0,transparent:true,opacity:.39,depthWrite:false});
 box(station,[2.93,1.34,2.29],[0,1.15,0],liquid).renderOrder=2;
 const load=new T.Group();station.add(load);
 const shape=new T.Shape();shape.moveTo(-.53,-.63);shape.lineTo(.53,-.63);shape.lineTo(.53,.63);shape.lineTo(-.53,.63);shape.closePath();
 for(const x of [-.39,.39])for(const y of [-.48,0,.48]){const hole=new T.Path();hole.absarc(x,y,.055,0,Math.PI*2,true);shape.holes.push(hole);}
 load.add(new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:false}),metal));
 box(load,[.92,.08,.12],[0,.78,0],steelDark);
 for(const x of [-.39,.39])box(load,[.055,.23,.09],[x,.69,0],polished);
 const cable=box(station,[.045,1,.045],[0,4,0],steelDark);
 function draw(progress:number){
  const dark=document.documentElement.dataset.theme==='dark',palette=alphaVisualColors(dark);
  metal.color.setHex(palette.metal);polished.color.setHex(palette.polished);back.color.setHex(palette.tankBack);
  const lower=T.MathUtils.smoothstep(progress,.035,.31);
  load.position.y=3.56-lower*2.42;
  const end=load.position.y+.82;cable.scale.y=5.13-end;cable.position.y=(5.13+end)/2;
  bath.uniforms.uTime.value=progress*12;bath.uniforms.uDark.value=Number(dark);
  bath.uniforms.uContacts.value.x=(progress-.16)*12;
  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
  if(canvas.width!==Math.floor(w*renderer.getPixelRatio())||canvas.height!==Math.floor(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);
  const half=Math.max(3.35,2.45*h/w);Object.assign(camera,{left:-half*w/h,right:half*w/h,top:half,bottom:-half});camera.updateProjectionMatrix();
  renderer.render(scene,camera);
 }
 return {draw,dispose(){
  const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
  scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);materials.add(o.material);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();
 }};
}
