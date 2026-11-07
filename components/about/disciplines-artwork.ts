import * as T from 'three';
import {factoryKit} from '../network/factory-kit';
import {bracketStudyGeometry} from '../network/bracket-study';

import {smooth} from '../network/network-story';
import {disciplineBore as bore,disciplineMotion} from './discipline-motion';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;

/** One bore stays the reference for physical work, measurement and related evidence. */
export function disciplinesArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const {baseGeo,uprightGeo}=bracketStudyGeometry(),part=new T.Group();part.position.y=-.1;
 part.add(new T.Mesh(own(baseGeo),kit.steel),new T.Mesh(own(uprightGeo),kit.pearl));root.add(part);
 const support=new T.Group();root.add(support);kit.box(support,[4.8,.18,2.1],[0,-.25,0],kit.glass);
 for(const x of [-1.6,1.6]){kit.box(support,[.7,.22,1.5],[x,-.45,0],kit.navy);kit.box(support,[.12,.26,.2],[x,.1,.65],kit.steel);}
 // A fixture, bench and drawing stay in the same coordinates across discipline choices.
 kit.box(support,[6.3,.13,2.7],[.45,-.64,.02],kit.pearl);
 for(const x of [-2.35,3.1])for(const z of [-1,.99])kit.box(support,[.13,.57,.13],[x,-.99,z],kit.steel);
 const board=new T.Group();root.add(board);board.position.set(-2.55,1.75,-.52);board.rotation.y=.40;board.scale.setScalar(1.17);
 kit.box(board,[1.72,1.19,.08],[0,0,0],kit.navy);
 const boardPost=(board.position.y+.57)/board.scale.y;
 kit.box(board,[.1,boardPost,.1],[0,-boardPost/2,-.09],kit.steel);
 const page=document.createElement('canvas');page.width=960;page.height=640;
 const ink=page.getContext('2d')!;
 let printed='';
 function printSheet(dark:boolean,selected:number,complete:boolean){
  const key=[dark,selected,complete].join('/');
  if(printed===key)return;
  printed=key;
  ink.fillStyle=dark?'#122737':'#edf4f7';ink.fillRect(0,0,960,640);
  ink.fillStyle=dark?'#8cdef2':'#225676';ink.font='500 62px sans-serif';ink.fillText('MOUNTING BORE',58,105);
  ink.strokeStyle=dark?'#5a92af':'#7497aa';ink.lineWidth=8;
  ink.beginPath();ink.arc(194,360,99,0,Math.PI*2);ink.moveTo(68,360);ink.lineTo(320,360);ink.moveTo(194,234);ink.lineTo(194,486);ink.stroke();
  ink.fillStyle=dark?'#f2f7fb':'#153345';ink.font='600 81px sans-serif';
  ink.fillText(['Finish','Measure','Review'][selected],364,341);
  ink.font='500 55px sans-serif';
  ink.fillText((complete?['Bore finished','Gauge seated','Record linked']:['Cutting pass','Gauge check','Observation'])[selected],364,434,555);
  texture.needsUpdate=true;
 }
 const texture=own(new T.CanvasTexture(page));texture.colorSpace=T.SRGBColorSpace;
 const print=new T.Mesh(own(new T.PlaneGeometry(1.59,1.06)),own(new T.MeshBasicMaterial({map:texture})));print.position.z=.05;board.add(print);
 const finishMaterial=own(new T.MeshStandardMaterial({color:0xa8c3d5,metalness:.8,roughness:.35,side:T.DoubleSide}));
 const finishSurface=new T.Mesh(own(new T.CylinderGeometry(bore.radius-.001,bore.radius-.001,.38,80,1,true)),finishMaterial);finishSurface.rotation.x=Math.PI/2;finishSurface.position.set(0,1.75,0);part.add(finishSurface);
 const cylinder=(parent:T.Object3D,r:number,length:number,z:number,mat:T.Material)=>{const m=new T.Mesh(own(new T.CylinderGeometry(r,r,length,32)),mat);m.rotation.x=Math.PI/2;m.position.z=z;parent.add(m);return m;};
 const machining=new T.Group();root.add(machining);
 kit.box(machining,[1.4,.12,bore.toolBaseRear-bore.toolBaseFront],[0,-.10,(bore.toolBaseRear+bore.toolBaseFront)/2],kit.glass);
 for(const x of [-.43,.43]){kit.box(machining,[.065,.07,2.1],[x,1.3,1.85],kit.steel);for(const z of [.95,2.65]){kit.box(machining,[.14,1.305,.22],[x,.6125,z],kit.navy);kit.box(machining,[.3,.38,.35],[x,-.35,z],kit.navy);}}
 const tool=new T.Group();tool.position.y=bore.y;machining.add(tool);
 cylinder(tool,.32,.54,.90,kit.navy);cylinder(tool,.235,.27,.52,kit.steel);cylinder(tool,.115,.75,.07,kit.steel);
 for(let i=0;i<6;i++)cylinder(tool,.335,.022,.69+i*.077,kit.steel);
 cylinder(tool,.29,.035,1.185,kit.steel);cylinder(tool,.105,.05,1.21,kit.navy);
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,bolt=cylinder(tool,.023,.032,1.215,kit.navy);bolt.position.x=Math.cos(a)*.21;bolt.position.y=Math.sin(a)*.21;}
 kit.box(tool,[.025,.09,.18],[.325,.04,.91],kit.active);
 const cutting=new T.Group();tool.add(cutting);cylinder(cutting,.16,.12,-.38,kit.steel);
 for(let i=0;i<3;i++){const holder=kit.box(cutting,[bore.holderLength,.045,.065],[bore.holderCenter,0,-.40],kit.navy);holder.rotation.z=i*Math.PI*2/3;holder.position.set(Math.cos(i*Math.PI*2/3)*bore.holderCenter,Math.sin(i*Math.PI*2/3)*bore.holderCenter,-.4);const tip=kit.box(cutting,[.035,.045,.055],[Math.cos(i*Math.PI*2/3)*(bore.toolRadius-.0175),Math.sin(i*Math.PI*2/3)*(bore.toolRadius-.0175),-.40],kit.active);tip.rotation.z=i*Math.PI*2/3;}
 kit.box(tool,[.85,.10,.4],[0,-.265,.9],kit.steel);
 const measurement=new T.Group();root.add(measurement);
 const gauge=new T.Group();gauge.position.y=bore.y;measurement.add(gauge);cylinder(gauge,.04,1.05,.42,kit.steel);cylinder(gauge,.13,.24,.91,kit.navy);
 kit.box(gauge,[.32,.23,.16],[.21,.12,.85],kit.navy);kit.box(gauge,[.22,.12,.018],[.21,.12,.943],kit.reading);
 const fingers=[-1,1].map(side=>kit.box(gauge,[.07,.12,.10],[0,side*.15,-.15],kit.steel));
 const datum=new T.Group();datum.position.set(0,bore.y,.31);measurement.add(datum);
 const ring=new T.LineLoop(own(new T.BufferGeometry().setFromPoints(Array.from({length:96},(_,i)=>new T.Vector3(Math.cos(i*Math.PI/48)*.49,Math.sin(i*Math.PI/48)*.49,0)))),own(new T.LineBasicMaterial({color:0x278fc3,transparent:true,opacity:.7})));datum.add(ring);
 kit.line(datum,[[0,-.46,0],[0,.46,0]]);for(const y of [-.46,.46])kit.line(datum,[[-.10,y,0],[.10,y,0]]);
 const evidence=new T.Group();root.add(evidence);
 const pending=own(new T.MeshStandardMaterial({color:0xb38146}));
 const records=Array.from({length:3},(_,i)=>{const group=new T.Group();group.position.set(3.18,2.38-i*.62,.25);evidence.add(group);kit.box(group,[1.6,.43,.06],[0,0,0],kit.reading);kit.box(group,[.07,.22,.025],[-.62,0,.05],kit.active);for(let j=0;j<2;j++)kit.box(group,[j?.64:.95,.035,.018],[-.02,j?-.07:.07,.05],j?kit.steel:kit.navy);return group;});
 const route=new T.Group();evidence.add(route);
 const path=[[bore.faceRadius,bore.y,.31],[1.35,bore.y,.31],[1.35,2.38,.31],[2.36,2.38,.31]];
 const trace=kit.line(route,path),packet=kit.box(route,[.07,.07,.07],path[0],kit.active);
 const curve=new T.CurvePath<T.Vector3>();for(let i=1;i<path.length;i++)curve.add(new T.LineCurve3(new T.Vector3(...path[i-1] as [number,number,number]),new T.Vector3(...path[i] as [number,number,number])));
 const featureRing=ring.clone();featureRing.geometry=ring.geometry;featureRing.material=ring.material;featureRing.position.set(0,bore.y,.31);evidence.add(featureRing);
 const recordLinks=[0,1].map(i=>kit.line(evidence,[[2.56,2.16-i*.62,.31],[2.56,1.98-i*.62,.31]]));
 return {part,update(time:number,phase:number,selected:number,dark:boolean){
  printSheet(dark,selected,phase>=3.85);
  const state=disciplineMotion(phase,selected),review=selected===2,formed=time>=2.5;
  part.scale.setScalar(1);part.position.y=-.1+.38*(1-smooth(time/2.2));
  machining.visible=selected===0&&formed;measurement.visible=(selected===1||review)&&formed;evidence.visible=selected===2&&formed;
  tool.position.z=state.toolZ;cutting.rotation.z=state.spindleAngle;
  gauge.position.z=state.gaugeZ;fingers.forEach((finger,i)=>finger.position.y=(i===0?-1:1)*(.15+(bore.gaugeContact-.06-.15)*state.contact));
  datum.visible=state.contact>.02;
  finishMaterial.color.copy(kit.steel.color);finishMaterial.roughness=selected===0?.4-.2*state.finish:.2;
  records.forEach((record,i)=>{record.visible=review;record.scale.y=1;const verified=i<2||phase>=3.85;(record.children[1] as T.Mesh).material=verified?kit.active:pending;record.children.slice(2).forEach(mark=>mark.visible=verified);});
  const travel=smooth((phase-2.65)/1.2);packet.position.copy(curve.getPointAt(travel));packet.visible=travel>0&&travel<1;trace.visible=phase>=2.65;
  featureRing.visible=phase>.4;recordLinks.forEach((link,i)=>link.visible=i===0||phase>=3.85);
  return review?{...state,phase:phase<1.8?'Review held - observation missing':phase<2.65?'Checking the bore':phase<3.85?'Linking the observation':'Evidence connected'}:state;
 }};
}
