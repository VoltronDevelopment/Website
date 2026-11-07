import {identityMark} from '@/lib/identity-assets';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {addArtworkSoftboxes,releaseStudioLookups,sceneEnvironment,prepareArtworkEnvironment} from '../brand/artwork-studio';
import {glassFace,setGlass,type GlassFace} from '../home/lattice-materials';
import {createProjectionBeam,hologramCubeSize} from '../brand/intelligence-hologram';
import {rollingChassis} from './rolling-chassis';
import {isSceneScrollActive} from '../home/scene-preparation';
import {leadershipPose,leadershipStage,leadershipTurn} from './leadership-stage';

export type LeadershipKind='portrait'|'automotive'|'search';
/** Finite cube reveals. Identity text remains outside the renderer. */
export async function mountLeadership(canvas:HTMLCanvasElement,host:HTMLDivElement,kind:LeadershipKind){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:location.search.includes('scene-capture')});
 renderer.setPixelRatio(location.search.includes('scene-capture')?4:Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.localClippingEnabled=true;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-3,3,3,-3,.1,40),resources:{dispose():void}[]=[];
 const track=<V extends {dispose():void}>(v:V)=>{resources.push(v);return v;};
 await prepareArtworkEnvironment();
 const environment=track(sceneEnvironment(renderer));scene.environment=environment.texture;addArtworkSoftboxes(scene,new T.Vector3(0,1.5,0));
 scene.add(new T.HemisphereLight(0xf4fbff,0x42627e,2));
 const key=new T.DirectionalLight(0xffffff,2);key.position.set(-3,5,5);scene.add(key);
 const cube=new T.Group();scene.add(cube);
 const side=leadershipStage.side,half=side/2;
 const faceKinds:GlassFace[]=['side','side','top','bottom','front','rear'];
 const glass=faceKinds.map(face=>track(glassFace(face,false,true,face==='front'?'portrait':'home',
  face==='top'?'crown':face==='bottom'?'base':face==='side'?'near':'clear')));
 const shell=new T.Mesh(track(new T.BoxGeometry(side,side,side)),glass);shell.renderOrder=5;cube.add(shell);
 const edge=track(new T.LineBasicMaterial({transparent:true,opacity:.62}));
 const rim=new T.LineSegments(track(new T.EdgesGeometry(shell.geometry)),edge);rim.renderOrder=6;cube.add(rim);
 const backing=track(new T.MeshStandardMaterial({roughness:.68,metalness:.08}));
 const recess=new T.Mesh(track(new RoundedBoxGeometry(side-.12,side-.12,.12,2,.05)),backing);
 recess.position.z=-half+.09;cube.add(recess);
 const portrait=kind==='portrait';
 const emitterSide=.48,ground=-1.76;
 const portraitWidth=2.84,portraitBottom=-.65;
 const beam=createProjectionBeam(track,1.8,1.05);
 const spill=portrait?track(new T.ShaderMaterial({
  transparent:true,depthWrite:false,toneMapped:false,
  uniforms:{amount:{value:0},dark:{value:0},join:{value:0}},
  vertexShader:'varying vec2 field;void main(){field=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 field;uniform float join,amount,dark;
   void main(){
    float spread=mix(.025,1.,smoothstep(0.,join,field.y));
    float across=abs(2.*field.x-1.)/spread;
    float feather=1.-smoothstep(.65,1.,across);
    float shoulder=1.-smoothstep(join*.88,1.,field.y);
    vec3 tint=mix(vec3(.055,.39,.62),vec3(.19,.66,.92),dark);
    gl_FragColor=vec4(tint,amount*feather*shoulder*(.75+.25*(1.-min(across,1.))));
    #include <colorspace_fragment>
   }`
 })):null;
 let mantle:T.Mesh|undefined;
 if(spill){
  mantle=new T.Mesh(track(new T.PlaneGeometry(1,1)),spill);
  mantle.renderOrder=1;scene.add(mantle);
 }
 {
  cube.scale.setScalar(emitterSide/side);
  cube.position.y=ground+emitterSide/2;
  beam.group.scale.setScalar(emitterSide/hologramCubeSize);
  beam.group.position.y=ground;
  scene.add(beam.group);
 }
 const content=new T.Group();scene.add(content);
 const subject=new T.Group();content.add(subject);
 const floorMaterial=track(new T.MeshStandardMaterial({roughness:.34,metalness:.21}));
 const floor=new T.Mesh(track(new RoundedBoxGeometry(side-.08,.06,side-.08,2,.023)),floorMaterial);
 floor.position.y=leadershipStage.floorY-.03;cube.add(floor);
 const mask=new T.Plane(new T.Vector3(0,-1,0),-half);
 const material=(color:number)=>track(new T.MeshStandardMaterial({color,roughness:.53,clippingPlanes:[mask]}));
 const box=(parent:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material)=>{
  const mesh=new T.Mesh(track(new T.BoxGeometry(w,h,d)),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 };
 let updateBrief:((time:number)=>void)|undefined;
 
 let updatePrint:((progress:number,dark:boolean)=>void)|undefined;
 let updateChassis:((time:number)=>void)|undefined;
 if(kind==='automotive'){
  updateChassis=rollingChassis(subject,track,mask);
 }else if(kind==='search'){
  const paper=material(0xe4ebf0),ink=material(0x28445e);
  const width=1.82,height=2.42;
  const folio=box(subject,width+.08,height+.07,.075,-.09,.01,.065,ink);
  folio.rotation.z=-.036;
  box(subject,width,height,.048,-.12,0,.14,paper);
  const sheet=document.createElement('canvas');sheet.width=1200;sheet.height=1600;
  const ctx=sheet.getContext('2d')!;
  ctx.scale(2,2);
  const emblem=await new T.ImageLoader().loadAsync(identityMark);
  let printedStage=-1;
  const drawBrief=(time:number)=>{
   const stage=Number(time>=1.3)+Number(time>=2.25)+Number(time>=3.45);
   if(stage===printedStage)return;
   printedStage=stage;
   const wash=ctx.createLinearGradient(0,0,600,800);wash.addColorStop(0,'#f2fafe');wash.addColorStop(.58,'#dcebf1');wash.addColorStop(1,'#b9d3de');ctx.fillStyle=wash;ctx.fillRect(0,0,600,800);
   ctx.fillStyle='#172f45';ctx.fillRect(0,0,600,210);
   ctx.fillStyle='#b2dae9';ctx.font='500 28px sans-serif';ctx.fillText('VOLTRON LATTICE',44,66);
   ctx.fillStyle='#fff';ctx.font='600 54px sans-serif';ctx.fillText('Technology leadership',44,158,512);
   for(const [i,label] of ['Role','Status'].entries()){
    if(stage<=i)continue;
    const y=296+i*168;
    ctx.fillStyle='#48627a';ctx.font='28px sans-serif';ctx.fillText(label,44,y);
    ctx.fillStyle='#102c42';ctx.font='500 48px sans-serif';ctx.fillText(i?'Search underway':'Chief Technology Officer',44,y+70,510);
    ctx.fillStyle='#b4cbd9';ctx.fillRect(44,y+100,512,2);
   }
   if(stage===3)ctx.drawImage(emblem,430,630,125,125);
   map.needsUpdate=true;
  };
  const map=track(new T.CanvasTexture(sheet));map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const printed=track(new T.MeshPhysicalMaterial({map,roughness:.38,clearcoat:.55,clearcoatRoughness:.22,clippingPlanes:[mask]}));
  const face=new T.Mesh(track(new T.PlaneGeometry(width,height)),printed);face.position.set(-.12,0,.168);subject.add(face);
  subject.position.set(0,height/2,-.13);
  updateBrief=drawBrief;
 }else{
  const url='omkar-todkar';
  let texture:T.Texture;
  try{texture=track(await new T.TextureLoader().loadAsync('/leadership/'+url+'.webp'));}
  catch(error){releaseStudioLookups(renderer,scene);resources.forEach(r=>r.dispose());renderer.dispose();if(!canvas.isConnected)renderer.forceContextLoss();throw error;}
  texture.colorSpace=T.SRGBColorSpace;
  const printSize=portraitWidth,height=printSize;
  const face=track(new T.PlaneGeometry(printSize,height,72,72));
  subject.position.y=height/2;
  const image=track(new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:texture},reveal:{value:0}},
   vertexShader:`varying vec2 uvImage;
    float relief(vec2 center,vec2 width){vec2 q=(uv-center)/width;return exp(-dot(q,q));}
    void main(){uvImage=uv;vec3 p=position;
     p.z+=.19*relief(vec2(.50,.68),vec2(.23,.24))
          +.08*relief(vec2(.31,.62),vec2(.075,.12))
          +.10*relief(vec2(.66,.18),vec2(.34,.23));
     gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
   fragmentShader:`varying vec2 uvImage;uniform sampler2D map;uniform float reveal;
    void main(){vec4 texel=texture2D(map,uvImage);float grey=dot(texel.rgb,vec3(.2126,.7152,.0722));
    float delta=reveal-uvImage.y;float light=.065*exp(-abs(delta)*80.);
    gl_FragColor=vec4(mix(vec3(.012,.031,.063),vec3(.91,.97,1.),grey)+vec3(.01,.06,.085)*sin(grey*3.14159)+light*vec3(.4,.7,1.),texel.a*smoothstep(0.,.19,uvImage.y)*smoothstep(-.02,.02,delta));
    #include <colorspace_fragment>
    }`}));
  const photo=new T.Mesh(face,image);photo.renderOrder=3;subject.add(photo);
  updatePrint=progress=>{image.uniforms.reveal.value=-.03+progress*1.06;};
 }
 const contactCanvas=document.createElement('canvas');contactCanvas.width=128;contactCanvas.height=128;
 const ctx=contactCanvas.getContext('2d')!,fade=ctx.createRadialGradient(64,64,3,64,64,64);
 fade.addColorStop(0,'rgba(10,30,46,.32)');fade.addColorStop(1,'rgba(10,30,46,0)');
 ctx.fillStyle=fade;ctx.fillRect(0,0,128,128);
 const contact=new T.Mesh(track(new T.PlaneGeometry(side*1.34,side*1.34)),track(new T.MeshBasicMaterial({map:track(new T.CanvasTexture(contactCanvas)),transparent:true,depthWrite:false})));
 contact.rotation.x=-Math.PI/2;contact.position.y=ground-.015;contact.scale.setScalar(.38);scene.add(contact);
 const footprint=new T.Mesh(track(new T.PlaneGeometry(kind==='search'?1.58:2.2,.43)),contact.material);
 footprint.rotation.x=-Math.PI/2;footprint.position.y=leadershipStage.floorY+.002;cube.add(footprint);
 const captureTime=location.search.includes('scene-capture')?Number(new URLSearchParams(location.search).get('leadership-time')||0):0;
 let time=Math.max(0,Math.min(leadershipStage.duration,captureTime)),last=0,raf=0,visible=false,disposed=false;
 const duration=leadershipStage.duration;
 let lastDark:boolean|undefined;
 const context=renderer.getContext();
 const render=()=>{
  if(disposed||context.isContextLost())return;
  const dark=document.documentElement.dataset.theme==='dark';
  const {formed,scale,depth}=leadershipPose(time);
  content.position.set(0,leadershipStage.floorY,kind==='automotive' ? -.12+.25*depth : depth);
  updateChassis?.(time);
  content.scale.setScalar(scale);
  footprint.position.z=depth;
  footprint.scale.setScalar(scale);
  cube.rotation.y=leadershipTurn(time);
  if(kind!=='automotive')content.rotation.set(-.19,-cube.rotation.y*.82,0,'YXZ');
  if(portrait){
   content.position.set(0,portraitBottom,.08+.09*depth);
   content.rotation.set(-.07,-.15+.17*formed,0,'YXZ');
   beam.set(.65*formed,dark,time,camera);
   if(mantle&&spill){
    const origin=ground+emitterSide,overlap=portraitWidth*scale*.22;
    const height=portraitBottom-origin+overlap;
    // The shoulders span roughly 86% of the source image; the rest is transparent.
    mantle.scale.set(portraitWidth*scale*.86,height,1);
    mantle.position.set(.04,origin+height/2,0);
    spill.uniforms.join.value=(portraitBottom-origin)/height;
    spill.uniforms.amount.value=formed*(dark?.42:.30);
    spill.uniforms.dark.value=Number(dark);
   }
  }
  mask.constant=-half+(side+.08)*formed;
  updatePrint?.(formed,dark);
  if(!portrait){
   const automotive=kind==='automotive';
   content.position.y=automotive?-.26:-.63;
   content.rotation.set(automotive?.14:0,automotive?.77:.13*(1-formed),0);
   content.scale.setScalar(scale*(automotive?1.82:1));
   mask.constant=kind==='search'?2.6:-.65+3*T.MathUtils.smoothstep(time,0,1.2);
   beam.set(.68*formed,dark,time,camera);
   updateBrief?.(time);
  }
  if(lastDark!==dark){
   glass.forEach((mat,i)=>{
    setGlass(mat,faceKinds[i],dark);
    if(i===1||i===2||i===4)mat.opacity*=.18;
   });
   floorMaterial.color.setHex(dark?0x263d51:0xb3c5d3);
   backing.color.setHex(dark?0x34495c:0xbecdd9);
   edge.color.setHex(dark?0x78a7cb:0x476783);
   lastDark=dark;
  }
  renderer.render(scene,camera);host.dataset.live=String(!context.isContextLost());host.dataset.progress=time.toFixed(2);
 };
 const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);
  const chassis=kind==='automotive',aspect=width/height;
  // Leave room for both wheel sets while they are still outside their hubs.
  const span=Math.max(4.35,(chassis?5.10:3.25)/aspect);
  camera.top=span/2;camera.bottom=-camera.top;camera.right=camera.top*aspect;camera.left=-camera.right;
  camera.position.set(0,3.6,10);
  camera.lookAt(0,0,0);camera.updateProjectionMatrix();render();};
 const tick=(now:number)=>{
  raf=0;
  if(disposed||!visible||document.hidden)return;
  if(isSceneScrollActive(now)){
   last=0;
  }else{
   if(last)time=Math.min(duration,time+Math.min((now-last)/1000,.08));
   last=now;
   render();
  }
  if(time<duration)raf=requestAnimationFrame(tick);
 };
 const start=()=>{last=0;if(!context.isContextLost()&&!raf&&visible&&!document.hidden&&time<duration)raf=requestAnimationFrame(tick);};
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0;last=0;}},{threshold:.12});observer.observe(host);
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else start();};document.addEventListener('visibilitychange',visibility);
 const theme=new MutationObserver(render);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const size=new ResizeObserver(resize);size.observe(host);
 const contextLost=(event:Event)=>{
  event.preventDefault();
  host.dataset.live='false';
  cancelAnimationFrame(raf);raf=0;last=0;
 };
 const contextRestored=()=>{resize();start();};
 canvas.addEventListener('webglcontextlost',contextLost);
 canvas.addEventListener('webglcontextrestored',contextRestored);
 resize();
 return{dispose(){disposed=true;canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);cancelAnimationFrame(raf);observer.disconnect();size.disconnect();theme.disconnect();document.removeEventListener('visibilitychange',visibility);releaseStudioLookups(renderer,scene);resources.forEach(r=>r.dispose());renderer.dispose();if(!canvas.isConnected)renderer.forceContextLoss();delete host.dataset.live;}};
}
