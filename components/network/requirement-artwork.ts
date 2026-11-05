import * as T from 'three';
import {factoryKit} from './factory-kit';
import {bracketStudyGeometry} from './bracket-study';
import {smooth} from './network-story';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;

/** A requirement drawing is the subject; the same casting remains its physical reference. */
export function requirementArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const drawing=new T.Group();root.add(drawing);
 const paper=own(new T.MeshStandardMaterial({color:0xecf4fa,roughness:.55,metalness:.05}));
 kit.box(drawing,[6.2,4.15,.12],[0,0,0],kit.glass);
 kit.box(drawing,[5.98,3.93,.035],[0,0,.075],paper);
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
 const ctx=canvas.getContext('2d')!,texture=own(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const face=new T.Mesh(own(new T.PlaneGeometry(5.86,3.82)),own(new T.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false,depthWrite:false})));face.position.z=.102;drawing.add(face);
 const reference=new T.Group();reference.name='requirement-reference';reference.userData.formationStart=8;root.add(reference);const {baseGeo,uprightGeo}=bracketStudyGeometry();
 reference.add(new T.Mesh(own(baseGeo),kit.steel),new T.Mesh(own(uprightGeo),kit.pearl));
 const plinth=new T.Group();plinth.name='requirement-support';plinth.userData.formationStart=8;root.add(plinth);kit.box(plinth,[4.8,.2,2.5],[0,-.16,0],kit.glass);kit.box(plinth,[3.4,.16,1.7],[0,-.34,0],kit.navy);
 const datum=new T.Group();reference.add(datum);
 kit.line(datum,[[-1.45,.03,.8],[1.45,.03,.8]]);for(const x of [-1.45,1.45])kit.line(datum,[[x,-.06,.8],[x,.15,.8]]);
 const bore=new T.LineLoop(own(new T.BufferGeometry().setFromPoints(Array.from({length:96},(_,i)=>new T.Vector3(.46*Math.cos(i/96*Math.PI*2),1.75+.46*Math.sin(i/96*Math.PI*2),.29)))),own(new T.LineBasicMaterial({color:0x278fc3,transparent:true,opacity:.8})));datum.add(bore);
 const link=new T.Group();root.add(link);const packet=kit.box(link,[.09,.09,.09],[0,0,0],kit.active);
 const linkGeometry=own(new T.BufferGeometry()),linkMaterial=own(new T.LineBasicMaterial({color:0x278fc3,transparent:true,opacity:.6})),route=new T.Line(linkGeometry,linkMaterial);route.name='requirement-handoff';link.add(route);
 const paths=Array.from({length:6},()=>new T.Vector3());let key='';
 function draw(time:number,dark:boolean){
  const comparison=smooth((time-12)/2.4),next=dark+':'+Math.round(comparison*48)+':'+(time>=4)+':'+(time>=8);if(key===next)return;key=next;
  ctx.clearRect(0,0,1536,1024);const ink=dark?'#cce2f3':'#294d68',muted=dark?'#8fb5cf':'#52728b',signal=dark?'#67c9f5':'#156b9d';
  ctx.fillStyle=muted;ctx.font='500 38px Montserrat, sans-serif';ctx.fillText('INTERFACE STUDY',90,92);
  ctx.strokeStyle=ink;ctx.lineWidth=5;ctx.lineJoin='round';
  const X=(x:number)=>725+x*180,Y=(y:number)=>735-y*180;
  ctx.beginPath();ctx.moveTo(X(-1.25),Y(.2));ctx.bezierCurveTo(X(-.83),Y(.35),X(-.76),Y(1.15),X(-.69),Y(1.75));
  ctx.ellipse(X(0),Y(1.75),.7*180,.7*180,0,Math.PI,Math.PI*2);ctx.bezierCurveTo(X(.76),Y(1.15),X(.83),Y(.35),X(1.25),Y(.2));ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.arc(X(0),Y(1.75),.46*180,0,Math.PI*2);ctx.stroke();ctx.strokeRect(X(-2.03),Y(.2),4.06*180,.22*180);
  ctx.lineWidth=3;ctx.setLineDash([12,12]);ctx.beginPath();ctx.moveTo(X(0),Y(2.75));ctx.lineTo(X(0),Y(-.4));ctx.moveTo(X(-1),Y(1.75));ctx.lineTo(X(1),Y(1.75));ctx.stroke();ctx.setLineDash([]);
  if(time>=4){
   ctx.strokeStyle=signal;ctx.beginPath();ctx.moveTo(X(-1.45),Y(-.25));ctx.lineTo(X(1.45),Y(-.25));for(const x of [-1.45,1.45]){ctx.moveTo(X(x),Y(-.12));ctx.lineTo(X(x),Y(-.4));}ctx.moveTo(X(.34),Y(1.43));ctx.lineTo(1090,590);ctx.lineTo(1370,590);ctx.stroke();
   ctx.fillStyle=ink;ctx.font='500 35px Montserrat, sans-serif';ctx.fillText('Mounting span',X(-1.45),Y(-.65));ctx.fillText('Bore / fit',1120,567);
  }
  if(time>=8){ctx.fillStyle=signal;ctx.beginPath();ctx.arc(X(.46),Y(1.75),9,0,Math.PI*2);ctx.fill();}
  if(comparison>0){ctx.globalAlpha=comparison;ctx.strokeStyle=signal;ctx.lineWidth=8;ctx.beginPath();ctx.arc(X(0),Y(1.75),.46*180,0,Math.PI*2);ctx.stroke();ctx.fillStyle=signal;ctx.font='500 34px Montserrat, sans-serif';ctx.fillText('REFERENCE CONNECTED',90,970);ctx.globalAlpha=1;}
  texture.needsUpdate=true;
 }
 return {groups:[reference],span:14,target:new T.Vector3(0,1.6,0),update(time:number,dark:boolean){
  const phone=Boolean(root.userData.phone),reveal=smooth(time/2.8);draw(time,dark);paper.color.set(dark?0x173047:0xeaf3fa);
  drawing.position.set(phone?0:-2.1,phone?3.6:2.15,phone?-.65:-.7);drawing.rotation.y=phone?.35:.48;
  reference.position.set(phone?0:3.2,phone?-.05:-.08,phone?1.2:.6);reference.scale.setScalar((phone?.78:.82)*Math.max(.001,smooth((time-8)/1.4)));plinth.position.copy(reference.position);plinth.scale.copy(reference.scale);
  datum.visible=time>=8;reference.visible=time>=8;plinth.visible=time>=8;drawing.scale.setScalar(.96+.04*reveal);
  // One measurement is handed to its corresponding drawing, not a decorative orbit.
  reference.updateMatrixWorld(true);drawing.updateMatrixWorld(true);
  paths[0].copy(reference.localToWorld(new T.Vector3(.46,1.75,.3)));paths[5].copy(drawing.localToWorld(new T.Vector3(.152,.343,.12)));
  paths[1].set(paths[0].x,paths[0].y+.55,paths[0].z);
  paths[2].set(paths[5].x,paths[1].y,paths[0].z);
  paths[3].set(paths[5].x,paths[1].y,paths[5].z);
  paths[4].set(paths[5].x,paths[5].y,paths[5].z);
  linkGeometry.setFromPoints(paths);link.visible=time>=10;
  const progress=smooth((time-10)/2.3),lengths=paths.slice(1).map((p,i)=>p.distanceTo(paths[i])),total=lengths.reduce((a,b)=>a+b,0);let distance=progress*total,index=0;
  while(index<lengths.length-1&&distance>lengths[index])distance-=lengths[index++];
  packet.position.copy(paths[index]).lerp(paths[index+1],lengths[index]?distance/lengths[index]:0);packet.visible=progress>0&&progress<1;linkMaterial.opacity=.6-.3*progress;
 }};
}
