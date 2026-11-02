import * as T from 'three';
import {factoryKit} from './factory-kit';
import {plantBuildState} from './network-growth';
import {smooth} from './network-story';
import {routePoint,type Point} from './network-simulation';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;
export function constructionArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const site=new T.Group(),frame=new T.Group(),skin=new T.Group(),equipment=new T.Group(),systems=new T.Group(),roof=new T.Group();root.add(site,frame,skin,equipment,systems,roof);
 kit.box(site,[17,.2,11],[0,-.23,0],kit.glass);kit.box(site,[13,.12,7.2],[0,-.07,-.5],kit.pearl);
 for(const x of [-6,-2,2,6]){kit.line(site,[[x,.01,-4],[x,.01,3]]);for(const z of [-3.9,2.9])kit.box(site,[.65,.15,.65],[x,.05,z],kit.steel);}
 for(const z of [-4,-.5,3])kit.line(site,[[-6,.01,z],[6,.01,z]]);kit.line(site,[[-8,.01,4.8],[8,.01,4.8],[8,.01,-5]]);
 for(let i=0;i<10;i++)kit.box(site,[.6,.015,.035],[-6.5+i*1.4,.02,4.8],kit.steel);
 const columns:T.Mesh[]=[];for(const x of [-6,-2,2,6])for(const z of [-3.9,2.9])columns.push(kit.box(frame,[.16,3.2,.16],[x,1.6,z],kit.steel));
 const trusses=new T.Group();frame.add(trusses);for(const x of [-6,-2,2,6]){kit.box(trusses,[.14,.15,7],[x,3.2,-.5],kit.steel);for(const side of [-1,1]){const beam=kit.box(trusses,[.12,.12,3.6],[x,3.45,-.5+side*1.7],kit.steel);beam.rotation.x=side*.12;}}
 kit.box(skin,[12,2.7,.16],[0,1.35,-3.95],kit.pearl);kit.box(skin,[.16,2.7,6.8],[-6,1.35,-.5],kit.pearl);
 const glazing=own(kit.glass.clone());glazing.opacity=.48;glazing.emissive.setHex(0x1c8ebc);
 kit.box(skin,[3.4,2.4,.12],[-4.2,1.25,2.9],glazing);for(const x of [-5.9,-4.2,-2.5])kit.box(skin,[.065,2.5,.16],[x,1.25,2.9],kit.steel);
 for(const x of [.2,4.1]){for(const side of [-1,1])kit.box(skin,[.12,2.5,.16],[x+side*1.3,1.25,2.9],kit.steel);kit.box(skin,[2.7,.15,.2],[x,2.5,2.9],kit.navy);kit.box(skin,[2.5,2.2,.09],[x,1.1,2.88],kit.navy);for(let i=0;i<7;i++)kit.box(skin,[2.4,.025,.04],[x,.3+i*.27,2.95],kit.steel);kit.box(site,[2.8,.2,1.4],[x,.05,3.6],kit.steel);}
 const machines:T.Group[]=[];for(let i=0;i<3;i++){const machine=new T.Group();machine.position.x=-3.8+i*3.8;equipment.add(machine);kit.box(machine,[2.4,.2,2],[0,.15,-.7],kit.navy);for(const x of [-.9,.9])kit.box(machine,[.2,1.5,1.5],[x,1,-.7],kit.pearl);kit.box(machine,[2, .2,1.6],[0,1.8,-.7],kit.pearl);kit.box(machine,[1.7,1,.05],[0,1,.1],kit.glass);kit.box(machine,[.65,.4,.6],[0,.55,-.6],kit.steel);machines.push(machine);}
 kit.panel(systems,-4.2,.7,1);for(const x of [-6.9,6.9]){kit.box(systems,[.65,1.5,1.1],[x,.75,-2],kit.navy);for(let i=0;i<4;i++)kit.box(systems,[.7,.04,1.15],[x,.25+i*.3,-2],kit.steel);}
 const paths:Point[][]=[[[-6.9,1.6,-2],[-6.9,2.6,-2],[-3.8,2.6,-2],[-3.8,2.6,-.7],[-3.8,1.8,-.7]],[[6.9,1.6,-2],[6.9,2.6,-2],[3.8,2.6,-2],[3.8,2.6,-.7],[3.8,1.8,-.7]]];const signals=paths.map(path=>{kit.line(systems,path);return kit.box(systems,[.09,.09,.09],path[0],kit.active);});
 for(const x of [-4,0,4])for(const side of [-1,1]){const panel=kit.box(roof,[2.06,.12,7.2],[x+side,3.65,-.5],kit.navy);panel.rotation.z=-side*.15;for(let j=0;j<3;j++)kit.box(roof,[1.55,.05,.25],[x+side,3.85,-2.4+j*1.8],kit.glass);}
 const glow=new T.Group();root.add(glow);const rims=[.06,.14,.28].map((width,i)=>{const mat=own(new T.MeshBasicMaterial({color:0x48c9ff,transparent:true,opacity:0,depthWrite:false}));for(const z of [-4.2,3.2])kit.box(glow,[12.6,.025,width],[0,.08,z],mat);for(const x of [-6.3,6.3])kit.box(glow,[width,.025,7.4],[x,.08,-.5],mat);return {mat,peak:[.8,.24,.08][i]};});
 return {groups:[frame,skin,equipment,systems,roof],span:24,target:new T.Vector3(0,1,0),update(time:number,dark:boolean){const state=plantBuildState(time);site.visible=true;columns.forEach((column,i)=>{const p=smooth((time-3-i*.12)/1.8);column.scale.y=Math.max(.001,p);column.position.y=1.6*p;});trusses.visible=time>=5.5;trusses.position.y=1.7*(1-smooth((time-5.5)/1.2));skin.visible=time>=7;skin.scale.y=Math.max(.001,state.envelope);equipment.visible=time>=11;machines.forEach((machine,i)=>machine.position.y=1.4*(1-smooth((time-11-i*.35)/1.5)));systems.visible=time>=16;signals.forEach((signal,i)=>{signal.visible=time>=16&&time<18.5;signal.position.fromArray(routePoint(paths[i],smooth((time-16)/2.5)));});roof.visible=time>=9;roof.position.set(0,2*(1-state.roofClose),-4*(1-state.roofClose));rims.forEach(({mat,peak})=>{mat.color.setHex(dark?0x57cfff:0x178abd);mat.opacity=peak*state.glow;});glazing.emissiveIntensity=.06+.55*state.glow;root.userData.complete=state.complete;root.userData.completionGlow=state.glow;}};
}
