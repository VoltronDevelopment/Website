import * as T from 'three';
import {updateSupportingGlass} from '../brand/supporting-materials';
import {stroke,strokeMaterial} from '../home/lattice-materials';
import {factoryKit} from './factory-kit';
import {createGlobeEnvelope,createGlobeEnvelopeMaterial,updateGlobeEnvelopeMaterial,globeEnvelopeView} from '../brand/globe-envelope';
import {networkSites,envelopeNetwork,envelopeCenter,envelopeScale} from './network-growth';
import {smooth} from './network-story';
import {routePoint,type Point} from './network-simulation';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;
export function factoryEnvelopeArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const network=envelopeNetwork(),{surface,wire}=createGlobeEnvelope();own(surface);own(wire);const shellMaterial=own(createGlobeEnvelopeMaterial()),shell=new T.LineSegments(wire,shellMaterial);shell.position.fromArray(envelopeCenter);shell.scale.setScalar(envelopeScale);shell.rotation.z=globeEnvelopeView.tiltZ;root.add(shell);
 const wirePoints=Array.from({length:wire.getAttribute('position').count},(_,i)=>new T.Vector3().fromBufferAttribute(wire.getAttribute('position'),i));
 const glowLayers=[{width:3.2,peak:.055},{width:.9,peak:.48}].map(spec=>{const mat=own(strokeMaterial(true));mat.userData.cssWidth=spec.width;const line=stroke(wirePoints,mat);own(line.geometry);shell.add(line);return {line,mat,...spec};});
 const ringPoints=Array.from({length:96},(_,i)=>new T.Vector3(Math.cos(i/96*Math.PI*2)*network.radius/envelopeScale,0,Math.sin(i/96*Math.PI*2)*network.radius/envelopeScale));const ringMaterial=own(new T.LineBasicMaterial({color:0x43b7e2,transparent:true,opacity:.45,depthWrite:false})),collar=new T.LineLoop(own(new T.BufferGeometry().setFromPoints(ringPoints)),ringMaterial);shell.add(collar);
 const sites=networkSites.map(([x,y,z],index)=>{const g=new T.Group();g.position.set(x,y,z);root.add(g);kit.box(g,[4,.15,3],[0,-.1,0],kit.glass);kit.box(g,[3.25,.1,2.4],[0,.02,0],kit.steel);kit.box(g,[3,1.4,.12],[0,.75,-1.1],kit.pearl);kit.box(g,[.12,1.4,2.2],[-1.5,.75,0],kit.pearl);
  const glazing=own(kit.glass.clone());glazing.emissive.setHex(0x1596c5);kit.box(g,[1.1,1.1,.07],[-.9,.7,1.1],glazing);for(const fx of [-1.45,-.9,-.35])kit.box(g,[.035,1.1,.09],[fx,.7,1.12],kit.steel);
  kit.box(g,[1.2,1.1,.1],[.7,.62,1.05],kit.navy);for(let i=0;i<4;i++)kit.box(g,[1.1,.025,.04],[.7,.25+i*.22,1.12],kit.steel);kit.box(g,[1.35,.15,.65],[.7,.08,1.5],kit.steel);
  const roof=new T.Group();g.add(roof);const bays=index%2?2:3;for(let bay=0;bay<bays;bay++)for(const side of [-1,1]){const width=3.3/bays/2,panel=kit.box(roof,[width+.025,.07,2.5],[-1.65+(bay+.5)*3.3/bays+side*width/2,1.6,0],kit.navy);panel.rotation.z=-side*.22;}kit.box(roof,[.7,.18,.45],[.7,1.8,-.5],kit.steel);
  for(const fx of [-1.1,1.1])kit.box(g,[.06,1.5,.06],[fx,.75,.4],kit.steel);kit.box(g,[.7,.1,1],[1,.25,-.3],kit.steel);kit.box(g,[.45,.5,.55],[1,.55,-.3],kit.pearl);
  const beacon=kit.box(g,[.12,.12,.12],[0,2.05,0],kit.navy),part=kit.box(g,[.25,.18,.2],[.7,.4,1.4],kit.pearl);const record=kit.panel(g,-.9,2.2,.2);record.scale.setScalar(.65);const reveal=new T.Plane(new T.Vector3(0,-1,0),10),copies:{base:T.MeshStandardMaterial;copy:T.MeshStandardMaterial}[]=[],cache=new Map<T.Material,T.Material>();g.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;if(o.material===glazing){glazing.clippingPlanes=[reveal];return;}const base=o.material;let copy=cache.get(base);if(!copy){const made=own(base.clone()) as T.Material;made.clippingPlanes=[reveal];cache.set(base,made);copy=made;if(base instanceof T.MeshStandardMaterial&&made instanceof T.MeshStandardMaterial)copies.push({base,copy:made});}o.material=copy!;});return {g,glazing,roof,beacon,part,record,reveal,copies};});
 const ports:Point[]=networkSites.map(([x,,z])=>[x,2.05,z]);
 const feeders=ports.map((port,i)=>{const node=network.vertices[network.anchors[i]],path:Point[]=[port,[port[0],4.6,port[2]],[node[0],4.6,port[2]],[node[0],4.6,node[2]],[node[0],envelopeCenter[1],node[2]],node];const line=kit.line(root,path);(line.material as T.LineBasicMaterial).opacity=.35;return {path,line};});
 const groundPorts:Point[]=networkSites.map(([x,,z])=>[x,.035,z+1.8]);
 const busZ=networkSites[0][2]+3,westX=networkSites[0][0]-2.8,eastX=networkSites[1][0]+2.8;
 const groundPaths:Point[][]=[[groundPorts[0],[groundPorts[0][0],.035,busZ],[groundPorts[1][0],.035,busZ],groundPorts[1]],[groundPorts[2],[westX,.035,groundPorts[2][2]],[westX,.035,groundPorts[0][2]],groundPorts[0]],[groundPorts[3],[eastX,.035,groundPorts[3][2]],[eastX,.035,groundPorts[1][2]],groundPorts[1]],[groundPorts[4],[0,.035,busZ],[groundPorts[1][0],.035,busZ],groundPorts[1]]];

 const groundLines=groundPaths.map(path=>kit.line(root,path,0x4c9bc2));const groundSignals=groundPaths.map(()=>{const point=new T.Mesh(own(new T.SphereGeometry(.075,10,10)),kit.active);root.add(point);return point;});
 const shellRoutes=[network.path(0,1),network.path(0,2),network.path(1,3),network.path(3,4)];
 const highlighted=shellRoutes.map(path=>{const line=kit.line(root,path,0x4cc5f3);const point=new T.Mesh(own(new T.SphereGeometry(.085,10,10)),kit.active);root.add(point);return {line,point,path};});
 const feederSignals=feeders.map(()=>{const point=new T.Mesh(own(new T.SphereGeometry(.065,10,10)),kit.active);root.add(point);return point;});
 const nodes=network.anchors.map(id=>{const point=new T.Mesh(own(new T.SphereGeometry(.1,12,12)),kit.active);point.position.fromArray(network.vertices[id]);root.add(point);return point;});
 return {groups:sites.map(s=>s.g),span:34,target:new T.Vector3(0,5.6,0),update(time:number,dark:boolean,ambient=0){
  const meshForm=smooth((time-12.5)/2);shell.visible=time>=12.5;updateGlobeEnvelopeMaterial(shellMaterial,dark);shellMaterial.opacity=meshForm*((dark?.24:.25)+.16*(.5+.5*Math.sin(ambient*2.1)));shellMaterial.color.setHex(dark?0x74d5fa:0x1679ae);const pulse=.5+.5*Math.sin(ambient*2.1);glowLayers.forEach(({line,mat,peak,width})=>{mat.userData.cssWidth=root.userData.phone?width*.6:width;line.visible=time>=14.5;mat.color.setHex(dark?0x4db8df:0x1688bc);mat.opacity=peak*(.35+.65*pulse);});collar.visible=time>=17;ringMaterial.opacity=.25+.35*pulse;wire.setDrawRange(0,Math.floor(wire.getAttribute('position').count*meshForm/2)*2);
  const arrivals=[0,4,7,10,13],activity=[time<4,time>=16&&time<19,time>=19&&time<21,time>=21&&time<23,time>=23];
  sites.forEach((site,i)=>{site.g.visible=time>=arrivals[i];site.g.position.y=0;site.reveal.constant=-.2+3.5*smooth((time-arrivals[i])/1.2);site.copies.forEach(({base,copy})=>{copy.color.copy(base.color);copy.opacity=base.opacity;});updateSupportingGlass(site.glazing,dark);site.beacon.material=activity[i]?kit.active:kit.navy;site.glazing.emissiveIntensity=activity[i]?.35:.07;site.roof.position.y=0;site.part.position.z=1.4-.7*smooth((time-(i===0?1:16))/2);site.record.visible=(i===0&&time>=3&&time<8)||(i===1&&time>=15&&time<18);feeders[i].line.visible=time>=Math.max(17,arrivals[i]+1.4);nodes[i].visible=time>=17;feederSignals[i].visible=false;});
  groundLines.forEach((line,i)=>{line.visible=time>=[5,8,11,14][i];const mat=line.material as T.LineBasicMaterial;mat.color.setHex(dark?0x45a9d2:0x287da9);mat.opacity=.45;const start=[5,8,11,14][i];groundSignals[i].visible=time>=start&&time<start+2;groundSignals[i].position.fromArray(routePoint(groundPaths[i],smooth((time-start)/2)));});
  const windows=[[18,20],[20,21.5],[21.5,23],[23,24]];highlighted.forEach(({line,point,path},i)=>{const [a,b]=windows[i],active=time>=a&&time<b;line.visible=time>=a;const mat=line.material as T.LineBasicMaterial;mat.color.setHex(dark?0x6ad6ff:0x1582bb);mat.opacity=active?.85:.24;point.visible=active;if(active)point.position.fromArray(routePoint(path,smooth((time-a)/(b-a))));});
  if(time>=17&&time<18){feederSignals[0].visible=true;feederSignals[0].position.fromArray(routePoint(feeders[0].path,smooth(time-17)));}
  if(time>=20&&time<21){feederSignals[1].visible=true;feederSignals[1].position.fromArray(routePoint(feeders[1].path,1-smooth(time-20)));}
  root.userData.hubPulse=.5+.5*Math.sin(ambient*2.1);root.userData.envelopeEdges=network.edges.length;root.userData.siteCount=sites.filter(s=>s.g.visible).length;root.userData.activeSite=time<8?0:time<14?-1:time<20?1:time<22?3:4;
 }};
}
