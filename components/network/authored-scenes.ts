import * as T from 'three';
import {factoryKit} from './factory-kit';
import {smooth} from './network-story';
import {routePoint,type Point} from './network-simulation';
import {requirementArtwork} from './requirement-artwork';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;
type Kit=ReturnType<typeof factoryKit>;
export function operatingFacility(factory:ReturnType<Kit['factory']>,kit:Kit,own:Own){
 const g=factory.g,cover=new T.Group();g.add(cover);const roofMaterial=own(kit.navy.clone());roofMaterial.transparent=true;const lightMaterial=own(kit.glass.clone());
 for(const x of [-3.9,0,3.9]){const sheet=kit.box(cover,[3.75,.13,4.5],[x,3.25,-.15],roofMaterial);sheet.rotation.z=-.07;for(const z of [-1.2,.8]){kit.box(cover,[2.7,.06,.38],[x,3.38,z],lightMaterial);for(let i=0;i<5;i++)kit.box(cover,[.04,.07,.38],[x-1.2+i*.6,3.42,z],kit.steel);}}
 for(const x of [-4,4]){kit.box(g,[1.4,.5,.9],[x,3.55,-3.2],kit.steel);for(let i=0;i<6;i++)kit.box(g,[1.2,.025,.04],[x,3.82,-3.5+i*.12],kit.navy);}
 kit.box(g,[2.3,.2,4.4],[-7.2,-.13,-.5],kit.steel);kit.box(g,[2,2,3.8],[-7.2,1,-.5],kit.glass);kit.box(g,[2.2,.12,4],[-7.2,2.1,-.5],kit.navy);for(const z of [-2.3,-1.1,.1,1.3])kit.box(g,[.07,2,.07],[-8.2,1,z],kit.steel);
 for(let i=0;i<3;i++)kit.box(g,[1.6,.12,.35],[-7.2,.08+i*.12,2.2-i*.3],kit.pearl);
 for(const x of [-7.5,-6.5]){kit.box(g,[.55,1.45,1],[x,.72,-3.5],kit.navy);for(let i=0;i<4;i++)kit.box(g,[.59,.05,1.05],[x,.25+i*.32,-3.5],kit.steel);}
 for(const x of [-4.5,4.5]){for(const side of [-1,1])kit.box(g,[.08,2.2,.1],[x+side*1.05,1.1,2.5],kit.steel);kit.box(g,[2.2,.12,.12],[x,2.2,2.5],kit.navy);}
 kit.line(g,[[-4.5,.035,3.6],[-2.4,.035,3.6],[-2.4,.035,-.6]],0x638ba5);kit.line(g,[[3.4,.035,1],[4.5,.035,1],[4.5,.035,4.5]],0x638ba5);
 return {update(time:number,dark:boolean){roofMaterial.color.copy(kit.navy.color);const cut=smooth((time-2.8)/1.5);cover.position.y=cut*.5;cover.position.z=-cut*2;roofMaterial.opacity=1-cut;lightMaterial.opacity=(dark?.28:.38)*(1-cut);cover.visible=cut<1;}};
}
export function partnershipArtwork(root:T.Group,kit:Kit,own:Own){
 const plan=new T.Group(),structure=new T.Group(),equipment=new T.Group(),services=new T.Group();root.add(plan,structure,equipment,services);
 kit.box(plan,[17,.22,11],[0,-.25,0],kit.glass);kit.box(plan,[14,.08,7],[0,-.08,-.6],kit.pearl);
 // Persistent architectural plan, access road and orthogonal service corridors.
 for(const x of [-6,-2,2,6])kit.line(plan,[[x,.02,-4],[x,.02,2.8]],0x4284b0);for(const z of [-4,-.6,2.8])kit.line(plan,[[-6,.02,z],[6,.02,z]],0x4284b0);
 kit.line(plan,[[-8,0,4.1],[8,0,4.1],[8,0,-4.8]]);for(let i=0;i<10;i++)kit.box(plan,[.55,.015,.035],[-6.5+i*1.4,.02,4.1],kit.steel);
 const columns:T.Mesh[]=[];for(const x of [-6,-2,2,6])for(const z of [-4,2.8])columns.push(kit.box(structure,[.16,3.4,.16],[x,1.7,z],kit.steel));
 const roof=new T.Group();structure.add(roof);for(const x of [-4,0,4])for(const side of [-1,1]){const sheet=kit.box(roof,[2.04,.12,7.1],[x+side,3.55,-.6],kit.navy);sheet.rotation.z=-side*.15;}for(const x of [-6,-2,2,6])kit.box(roof,[.15,.14,7],[x,3.3,-.6],kit.steel);
 // Architecture frontage and service annex differ from the operating plant.
 kit.box(structure,[12,2.7,.15],[0,1.35,-4],kit.pearl);kit.box(structure,[.12,2.6,3],[-6,1.3,-2.5],kit.glass);for(let i=0;i<7;i++)kit.box(structure,[.06,2.7,.12],[-5.5+i*1.8,1.35,-3.85],kit.steel);
 for(let i=0;i<3;i++){const x=-3.7+i*3.7;kit.box(equipment,[2.6,.25,2.2],[x,.16,-.8],kit.navy);kit.box(equipment,[1.8,1.3,1.5],[x,.95,-.8],kit.pearl);kit.box(equipment,[1.5,.8,.05],[x,1.1,0],kit.glass);kit.box(equipment,[.15,.65,.15],[x,1.3,-.7],kit.steel);}
 for(const x of [-6.8,6.8]){kit.box(services,[.7,1.6,1.4],[x,.8,-2],kit.navy);for(let i=0;i<4;i++)kit.box(services,[.73,.06,1.45],[x,.3+i*.35,-2],kit.steel);}
 const paths:Point[][]=[[[-6.8,1.7,-2],[-6.8,3,-2],[0,3,-2],[0,3,-.8],[0,1.8,-.8]],[[6.8,1.7,-2],[6.8,3,-2],[3.7,3,-2],[3.7,1.8,-2]]];const dots=paths.map(path=>{kit.line(services,path);return kit.box(services,[.09,.09,.09],path[0],kit.active);});
 return {groups:[structure,equipment,services],update(time:number){structure.visible=time>=1.5;const build=smooth((time-1.5)/3.5);columns.forEach(c=>{c.scale.y=Math.max(.001,build);c.position.y=1.7*build;});roof.position.y=2*(1-smooth((time-4)/2));roof.visible=time>=3;equipment.visible=time>=5;equipment.position.y=1.7*(1-smooth((time-5)/2));services.visible=time>=9;dots.forEach((dot,i)=>{dot.visible=time>=9&&time<13;dot.position.fromArray(routePoint(paths[i],smooth((time-9)/4)));});if(time>=12)roof.position.z=-2.3*smooth((time-12)/2);},span:23,target:new T.Vector3(0,1,0)};
}
export function capabilityArtwork(root:T.Group,kit:Kit,own:Own){
 const cells:T.Group[]=[];const centers:Point[]=[[-7,0,2],[7,0,2],[0,0,-7]];
 centers.forEach(p=>{const g=new T.Group();g.position.fromArray(p);root.add(g);kit.box(g,[6,.18,4.5],[0,-.1,0],kit.glass);cells.push(g);});
 // Treatment, CNC inspection and assembly are intentionally different physical environments.
 for(const x of [-1.4,1.4]){kit.box(cells[0],[2,.9,2],[x,.5,0],kit.steel);kit.box(cells[0],[1.7,.035,1.7],[x,.98,0],kit.navy);}kit.box(cells[0],[5,.12,.15],[0,2.6,0],kit.steel);for(const x of [-2.4,2.4])kit.box(cells[0],[.1,2.6,.1],[x,1.3,0],kit.steel);
 const cnc=cells[1];for(const x of [-1.55,1.55])kit.box(cnc,[.3,2.8,2.7],[x,1.4,0],kit.pearl);kit.box(cnc,[3.4,.25,2.7],[0,2.75,0],kit.pearl);kit.box(cnc,[3.4,2.8,.15],[0,1.4,-1.3],kit.navy);kit.box(cnc,[2.5,1.8,.1],[0,1.6,1.38],kit.glass);kit.box(cnc,[2.6,.18,2],[0,.65,0],kit.navy);const cutter=kit.box(cnc,[.3,.7,.3],[0,1.8,.4],kit.steel);kit.box(cnc,[.8,.5,.7],[0,.98,.4],kit.steel);kit.panel(cnc,2.3,.5,.5);
 const assembly=cells[2];for(const x of [-2,2])kit.box(assembly,[.15,2.9,.15],[x,1.45,0],kit.steel);kit.box(assembly,[4.2,.2,1],[0,2.9,0],kit.navy);kit.box(assembly,[.8,.35,.8],[0,1,.7],kit.steel);const press=kit.box(assembly,[1.4,.4,1],[0,2,0],kit.steel);kit.box(assembly,[4.8,.25,1.7],[0,.6,.7],kit.pearl);for(let i=0;i<11;i++)kit.box(assembly,[.18,.07,1.5],[-2.1+i*.42,.77,.7],kit.steel);
 const board=new T.Group();board.position.set(0,3.8,1);root.add(board);kit.box(board,[6.8,3.4,.12],[0,0,0],kit.navy);const canvas=document.createElement('canvas');canvas.width=1360;canvas.height=680;const context=canvas.getContext('2d')!,texture=own(new T.CanvasTexture(canvas)),face=new T.Mesh(own(new T.PlaneGeometry(6.5,3.15)),own(new T.MeshBasicMaterial({map:texture,toneMapped:false})));texture.colorSpace=T.SRGBColorSpace;face.position.z=.08;board.add(face);
 const ports=centers.map(p=>new T.Vector3(p[0],3,p[2])),paths:Point[][]=ports.map((p,i)=>[p.toArray() as Point,[p.x,6,p.z],[i===0?-3.4:3.4,6,p.z],[i===0?-3.4:3.4,6,1],[i===0?-3.4:3.4,3.8,1]]);const dots=paths.map(path=>{kit.line(root,path);return kit.box(root,[.12,.12,.12],path[0],kit.active);});
 let key='';function draw(time:number,dark:boolean){const stage=Math.min(5,Math.floor(time/4)),next=stage+String(dark)+String(root.userData.phone)+(time>=8&&time<10?Math.floor(time*15):'');if(key===next)return;key=next;context.fillStyle=dark?'#11283c':'#ecf5fb';context.fillRect(0,0,1360,680);context.fillStyle=dark?'#b6ddf4':'#19374f';context.font='500 39px Montserrat, sans-serif';context.fillText('SHARED QUALITY WORKFLOW',60,75);const labels=['Part identity','Requirement','Observation','Inspection','Disposition'];const arrange=smooth((time-8)/2),positions=[[75,150],[485,150],[895,150],[75+205*arrange,420],[895-135*arrange,420]];for(let i=0;i<5;i++){const [x,y]=positions[i];context.fillStyle=i<=stage?(dark?'#205578':'#d3e9f6'):(dark?'#1b344a':'#dfe9f0');context.fillRect(x,y,330,130);context.strokeStyle=dark?'#60bce9':'#2676a7';context.lineWidth=3;context.strokeRect(x,y,330,130);context.fillStyle=dark?'#e0f2ff':'#19374f';context.font=root.userData.phone?'500 48px Montserrat, sans-serif':'500 30px Montserrat, sans-serif';context.fillText(labels[i],x+20,y+70);}context.strokeStyle=dark?'#60bce9':'#2676a7';context.lineWidth=3;context.beginPath();context.moveTo(405,215);context.lineTo(485,215);context.moveTo(815,215);context.lineTo(895,215);context.moveTo(1060,280);context.lineTo(1060,350);context.lineTo(positions[3][0]+165,350);context.lineTo(positions[3][0]+165,420);context.moveTo(positions[3][0]+330,485);context.lineTo(positions[4][0],485);context.stroke();texture.needsUpdate=true;}
 return {groups:cells,update(time:number,dark:boolean){draw(time,dark);const windows=[[3,7],[12,16],[20,24]];dots.forEach((dot,i)=>{const [a,b]=windows[i];dot.visible=time>=a&&time<b;dot.position.fromArray(routePoint(paths[i],i===0?smooth((time-a)/(b-a)):1-smooth((time-a)/(b-a))));});cutter.position.y=1.8-.3*Math.sin(Math.PI*smooth((time-16)/3));press.position.y=2-.6*Math.sin(Math.PI*smooth((time-21)/2));},span:28,target:new T.Vector3(0,1,0),board};
}
export function engineeringArtwork(root:T.Group,kit:Kit,own:Own){
 return requirementArtwork(root,kit,own);
}
