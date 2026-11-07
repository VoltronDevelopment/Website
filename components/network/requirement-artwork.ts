import * as T from 'three';
import {factoryKit} from './factory-kit';
import {bracketStudyGeometry} from './bracket-study';
import {bracketSheet,draftingPaper,sheetBore} from './bracket-sheet';
import {smooth} from './network-story';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;

/** A requirement drawing is the subject; the same casting remains its physical reference. */
export function requirementArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const drawing=new T.Group();root.add(drawing);
 const paper=own(new T.MeshStandardMaterial({color:0xecf4fa,roughness:.55,metalness:.05}));
 kit.box(drawing,[6.2,4.15,.12],[0,0,0],kit.glass);
 kit.box(drawing,[5.98,3.93,.035],[0,0,.075],paper);
 const canvas=document.createElement('canvas');canvas.width=960;canvas.height=640;
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
 const sheet=bracketSheet(),pencil=new T.Group();drawing.add(pencil);
 const wood=own(new T.MeshStandardMaterial({color:0xc39464})),lead=own(new T.MeshStandardMaterial({color:0x333b41}));
 const nib=(r:number,top:number,h:number,y:number,material:T.Material)=>{
  const m=new T.Mesh(own(new T.CylinderGeometry(top,r,h,8)),material);m.position.y=y;pencil.add(m);
 };
 nib(0,.021,.065,.0325,lead);nib(.021,.067,.19,.16,wood);nib(.067,.067,1.08,.795,kit.navy);
 pencil.rotation.set(.4,0,-.55);
 function draw(time:number,dark:boolean){
  const frame=Math.min(320,Math.floor(time*30)),next=dark+':'+frame;
  if(next!==key){key=next;const tip=sheet.draw(ctx,frame/30,dark);
   pencil.position.set((tip.x/960-.5)*5.86,(.5-tip.y/640)*3.82,.103+tip.lift);
   texture.needsUpdate=true;
  }
  pencil.visible=time<10.7;
 }
 return {groups:[reference],span:14,target:new T.Vector3(0,1.6,0),update(time:number,dark:boolean){
  const phone=Boolean(root.userData.phone),reveal=smooth(time/2.8);draw(time,dark);paper.color.set(dark?draftingPaper.dark:draftingPaper.light);
  drawing.position.set(phone?0:-2.1,phone?3.6:2.15,phone?-.65:-.7);drawing.rotation.y=phone?.35:.48;
  reference.position.set(phone?0:3.2,phone?-.05:-.08,phone?1.2:.6);reference.scale.setScalar((phone?.78:.82)*Math.max(.001,smooth((time-8)/1.4)));plinth.position.copy(reference.position);plinth.scale.copy(reference.scale);
  datum.visible=time>=8;reference.visible=time>=8;plinth.visible=time>=8;drawing.scale.setScalar((phone?1.2:1.13)*(.96+.04*reveal));reference.rotation.y=.48*(1-smooth((time-9)/3));
  // One measurement is handed to its corresponding drawing, not a decorative orbit.
  reference.updateMatrixWorld(true);drawing.updateMatrixWorld(true);
  paths[0].copy(reference.localToWorld(new T.Vector3(.46,1.75,.3)));paths[5].copy(drawing.localToWorld(new T.Vector3((sheetBore.x/960-.5)*5.86,(.5-sheetBore.y/640)*3.82,.12)));
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
