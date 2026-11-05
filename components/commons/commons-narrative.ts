import * as T from 'three';
import type {factoryKit} from '../network/factory-kit';
import type {CommonsKind} from './commons-content';
type Tools={kit:ReturnType<typeof factoryKit>;box:(parent:T.Object3D,size:number[],p:number[],material?:T.Material|T.Material[])=>T.Mesh;faces:T.MeshPhysicalMaterial[];part:(parent:T.Object3D,p:number[],scale?:number)=>{g:T.Group;up:T.Mesh}};
const ease=(v:number)=>{const t=T.MathUtils.clamp(v,0,1);return t*t*(3-2*t);};
/** Subject-specific gestures share the site's physical materials, without another bench/cube tableau. */
export function createCommonsNarrative(kind:CommonsKind,index:number,g:T.Group,{kit,box,faces,part}:Tools):((t:number)=>void)|null{
 const page=(parent:T.Object3D,x:number,y:number,w=1.3,h=1.7)=>{const p=new T.Group();p.position.set(x,y,0);parent.add(p);box(p,[w,h,.06],[0,0,0],faces);for(let i=0;i<4;i++)kit.line(p,[[-w*.32,h*.28-i*h*.16,.045],[w*(i%2?.18:.32),h*.28-i*h*.16,.045]]);return p;};
 const book=(parent:T.Object3D,x:number)=>{box(parent,[1.95,.625,1.6],[x,.2375,0],kit.glass);const b=new T.Group();b.position.set(x,.65,0);parent.add(b);box(b,[.12,.1,1.4],[0,-.05,0],kit.navy);const halves=[-1,1].map(side=>{const hinge=new T.Group();b.add(hinge);box(hinge,[.9,.035,1.35],[side*.45,0,0],kit.navy);box(hinge,[.84,.055,1.27],[side*.46,.045,0],kit.pearl);for(let i=0;i<5;i++)kit.line(hinge,[[side*.15,.078,-.45+i*.2],[side*.74,.078,-.45+i*.2]]);return hinge;});return (progress:number)=>halves.forEach((h,i)=>h.rotation.z=(i?1:-1)*1.22*(1-progress));};
 if(kind==='programs'&&index===0){
  box(g,[4.7,.15,2.8],[0,-.15,0],kit.navy);const open=book(g,-.7),catalog=page(g,1.5,1.35,1.2,1.8);catalog.position.z=-.8;
  const resource=page(g,-.7,1.1,.7,.9),tray=box(g,[1.3,.07,1.2],[1.5,.2,.35],kit.steel);
  return t=>{const access=ease((t-2.5)/2),share=ease((t-4.5)/2.5);open(access);resource.visible=access>.4;resource.position.set(-.7+share*2.2,1.1+Math.sin(share*Math.PI)*.5,.35*share);resource.rotation.x=-share*.4;catalog.scale.setScalar(.85+.15*share);tray.visible=true;};
 }
 if(kind==='learning'&&index===0){
  box(g,[2.6,.12,2.3],[0,-.08,0],kit.navy);const study=part(g,[0,.02,0],.6);
  const views=[-1,1].map(side=>{const pane=page(g,side*1.9,1.35,1.3,1.9);pane.position.z=-.8;const model=part(pane,[0,-.6,.12],.23);model.g.rotation.y=side*.45;return pane;});
  const gauges=[-1,1].map(side=>{const group=new T.Group();group.position.set(side*1.9,1.35,-.6);g.add(group);kit.line(group,[[-.48,-.5,0],[-.48,.5,0],[.48,.5,0]]);return group;});
  return t=>{const first=ease((t-2.5)/1.5),second=ease((t-4.2)/1.5),compare=ease((t-6)/1.5);views.forEach((v,i)=>{const p=i?second:first;v.position.y=1.35+(1-p)*.5;v.rotation.y=(i?-1:1)*(.35-.25*compare);gauges[i].visible=p>.9;});study.g.rotation.y=.3*compare;};
 }
 if(kind==='participation'&&index===0){
  const open=book(g,-1.8);box(g,[2.3,.1,2],[-1.8,-.05,0],kit.navy);
  const records=[0,1,2].map(i=>{const p=page(g,1.7,1.25,1.25,1.7);p.position.z=-.65+i*.22;p.position.x=1.7+i*.13;return p;});
  const shared=page(g,-1.8,1.05,.75,1.05);const route=[new T.Vector3(-1.8,1.05,0),new T.Vector3(-1.8,1.05,.9),new T.Vector3(1.7,1.05,.9),new T.Vector3(1.7,1.25,-.2)];
  const path=new T.CurvePath<T.Vector3>();for(let i=1;i<route.length;i++)path.add(new T.LineCurve3(route[i-1],route[i]));kit.line(g,route.map(p=>p.toArray()));
  const received=new T.Group();received.position.set(1.7,1.25,.02);g.add(received);kit.line(received,[[-.23,0,0],[-.06,-.16,0],[.27,.25,0]]);
  return t=>{const transfer=ease((t-3.5)/3);open(ease((t-2)/1.5));shared.visible=t>3&&transfer<1;shared.position.copy(path.getPoint(transfer));records.forEach((p,i)=>p.visible=t>2+i*.5);received.visible=transfer>=1;};
 }
 if(kind==='partner-process'){
  const brief=page(g,0,1.4,1.9,2.3);box(g,[2.2,.12,1.4],[0,-.12,0],kit.navy);
  const requirements=page(g,-2.1,1.3,1.1,1.6),capability=page(g,2.1,1.3,1.1,1.6);
  requirements.rotation.y=.2;capability.rotation.y=-.2;
  const sample=part(g,[-2,.05,.6],.32);
  const links=[-1,1].map(side=>{const q=new T.Group();g.add(q);kit.line(q,[[side*1.55,1.3,.1],[side*1.25,1.3,.1],[side*1.25,.9,.1],[side*.95,.9,.1]]);return q;});
  const matches=[0,1,2].map(i=>{const check=new T.Group();check.position.set(.45,1.95-i*.43,.08);g.add(check);kit.line(check,[[-.13,0,0],[-.025,-.09,0],[.17,.12,0]]);return check;});
  const next=page(g,2.05,1.3,1.15,1.6);next.position.z=.2;
  return t=>{const context=ease((t-2)/2),fit=ease((t-4)/2),agree=ease((t-6)/2);
   sample.g.visible=index===0;requirements.visible=index<2;capability.visible=index===1;next.visible=index===2;
   requirements.position.x=-2.1-(1-context)*.7;capability.position.x=2.1+(1-context)*.7;
   brief.rotation.y=-.1*(1-context);links.forEach((l,i)=>l.visible=index===1?fit>.3:index===2&&i===1&&agree>.1);
   matches.forEach((m,i)=>m.visible=index>0&&t>4+i*.55);
   next.position.x=2.05+(1-agree)*.7;next.rotation.y=-.18*agree;
  };
 }
 return null;
}
