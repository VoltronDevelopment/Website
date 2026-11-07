import * as T from 'three';
import type {factoryKit} from '../network/factory-kit';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;
const ease=(n:number)=>T.MathUtils.smoothstep(n,0,1);
export function courtyardStudy(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own,bindFinish:(color:T.Color,light:number,dark:number)=>void){
 const finish=(color:number)=>own(new T.MeshStandardMaterial({color,roughness:.8}));
 const earth=kit.navy,wood=kit.steel,skin=kit.pearl,green=finish(0x2894bc),coat=finish(0x246bd4);
 bindFinish(green.color,0x2894bc,0x8ed9ec);
 bindFinish(coat.color,0x246bd4,0x79aaff);
 const ball=own(new T.SphereGeometry(1,18,12)),unit=own(new T.CylinderGeometry(1,1,1,12));
 function oval(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material){
  const m=new T.Mesh(ball,mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
 }
 function bar(parent:T.Object3D,r:number,mat:T.Material){
  const m=new T.Mesh(unit,mat);parent.add(m);
  return (a:T.Vector3,b:T.Vector3)=>{const delta=b.clone().sub(a);m.scale.set(r,delta.length(),r);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());m.position.copy(a).lerp(b,.5);};
 }
 const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
 kit.box(root,[5.6,.15,3.45],[0,-.13,0],kit.steel);
 kit.box(root,[2.25,.22,1.65],[0,.045,0],wood);kit.box(root,[2.12,.11,1.53],[0,.13,0],earth);
 for(const x of [-2.15,1.87])for(const z of [-1,0,1])kit.box(root,[.89,.075,.91],[x,-.025,z],kit.pearl);
 const sapling=new T.Group();root.add(sapling);
 bar(sapling,.041,wood)(v(0,0,0),v(.05,1.62,0));
 for(let i=0;i<9;i++){
  const y=.49+i*.124,side=i%2?1:-1,tip=v(side*(.26+(i%3)*.065),y+.19,Math.sin(i*1.7)*.2);
  bar(sapling,.015,wood)(v(.03,y,0),tip);oval(sapling,tip.x,tip.y,tip.z,.19,.067,.10,green).rotation.z=side*.43;
 }
 const stake=new T.Group();root.add(stake);bar(stake,.034,wood)(v(-.21,0,0),v(-.21,1.23,0));
 const tie=kit.box(root,[.27,.04,.07],[-.09,1.18,.01],kit.navy);
 function person(x:number,short:boolean){
  const y=short?1.04:1.46,side=Math.sign(x),z=short?-.03:.28;
  oval(root,x,y,z,.29,.44,.24,short?coat:kit.navy);
  oval(root,x-side*.055,y+.55,z,.19,.235,.18,skin);
  oval(root,x-side*.055,y+.71,z-.035,.2,.095,.19,kit.navy);
  for(const dz of [-.14,.14]){
   const knee=v(x-side*(short?.42:.09),short?.29:.56,z+dz),ankle=v(x+side*(short?.15:.12),.14,z+dz);
   bar(root,.105,kit.navy)(v(x,y-.28,z+dz),knee);bar(root,.09,kit.navy)(knee,ankle);
   oval(root,ankle.x-side*.09,.088,ankle.z,.21,.08,.11,kit.navy);
  }
  return [-1,1].map((sign)=>{
   const shoulder=v(x,y+.23,z+sign*.19),upper=bar(root,.085,short?coat:kit.navy),fore=bar(root,.062,skin);
   const hand=oval(root,0,0,0,.082,.077,.072,skin);
   return (target:T.Vector3)=>{const elbow=shoulder.clone().lerp(target,.48);elbow.y-=.21;elbow.z+=sign*.11;
    upper(shoulder,elbow);fore(elbow,target);hand.position.copy(target);};
  });
 }
 const gardener=person(-1.18,true),helper=person(1.49,false);
 const can=new T.Group();root.add(can);oval(can,0,0,0,.27,.24,.23,coat);
 bar(can,.061,coat)(v(-.21,-.08,0),v(-.59,.20,0));
 const handle=new T.Mesh(own(new T.TorusGeometry(.16,.029,8,20)),kit.steel);handle.position.set(.11,.24,0);can.add(handle);
 const drops=Array.from({length:11},()=>oval(root,0,0,0,.022,.038,.022,kit.active));
 kit.box(root,[.64,.055,.43],[-1.82,.058,.79],kit.navy);
 kit.box(root,[.58,.019,.36],[-1.82,.096,.79],kit.pearl);
 for(let i=0;i<3;i++)kit.box(root,[.34-i*.05,.008,.014],[-1.84,.109,.69+i*.075],kit.steel);
 return (time:number)=>{
  sapling.position.y=.18+.5*(1-ease((time-.3)/2));stake.position.y=.17+.6*(1-ease((time-2.4)/1.4));
  stake.visible=time>=2.25;tie.visible=time>=4.1;
  gardener[0](v(-.06,.84+sapling.position.y,-.04));gardener[1](v(-.21,1+stake.position.y,.025));
  const pour=ease((time-4.1)/1.1)*(1-ease((time-7.1)/1.15));
  can.position.set(.99-.19*pour,1.04+.20*pour,.29);can.rotation.z=.89*pour;can.updateMatrixWorld();
  helper[0](can.localToWorld(v(.17,.33,0)));helper[1](can.localToWorld(v(-.09,-.15,.17)));
  const nozzle=can.localToWorld(v(-.59,.2,0));
  drops.forEach((d,i)=>{const u=((time*1.85+i/11)%1);d.visible=pour>.56;
   d.position.set(nozzle.x-(.38+.03*Math.sin(i))*u,nozzle.y+(.19-nozzle.y)*u*u,nozzle.z-.18*u);});
 };
}
