import * as T from 'three';
import {updateSupportingGlass} from '../brand/supporting-materials';
import {sampleWorldSurface} from '../brand/surface-samples';
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
 const glazing=own(kit.glass.clone());glazing.emissive.setHex(0x1c8ebc);
 kit.box(skin,[3.4,2.4,.12],[-4.2,1.25,2.9],glazing);for(const x of [-5.9,-4.2,-2.5])kit.box(skin,[.065,2.5,.16],[x,1.25,2.9],kit.steel);
 for(const x of [.2,4.1]){for(const side of [-1,1])kit.box(skin,[.12,2.5,.16],[x+side*1.3,1.25,2.9],kit.steel);kit.box(skin,[2.7,.15,.2],[x,2.5,2.9],kit.navy);kit.box(skin,[2.5,2.2,.09],[x,1.1,2.88],kit.navy);for(let i=0;i<7;i++)kit.box(skin,[2.4,.025,.04],[x,.3+i*.27,2.95],kit.steel);kit.box(site,[2.8,.2,1.4],[x,.05,3.6],kit.steel);}
 const machines:T.Group[]=[];for(let i=0;i<3;i++){const machine=new T.Group();machine.position.x=-3.8+i*3.8;equipment.add(machine);kit.box(machine,[2.4,.2,2],[0,.15,-.7],kit.navy);for(const x of [-.9,.9])kit.box(machine,[.2,1.5,1.5],[x,1,-.7],kit.pearl);kit.box(machine,[2, .2,1.6],[0,1.8,-.7],kit.pearl);kit.box(machine,[1.7,1,.05],[0,1,.1],kit.glass);kit.box(machine,[.65,.4,.6],[0,.55,-.6],kit.steel);for(const x of [-.85,.85])for(const z of [-1.4,0])kit.box(machine,[.3,.08,.3],[x,.04,z],kit.steel);
 for(const x of [-.62,.62])kit.box(machine,[.09,.16,1.2],[x,.33,-.7],kit.steel);
 kit.box(machine,[.4,.32,.15],[1.1,1.32,.14],kit.navy);
 kit.box(machine,[.28,.18,.025],[1.1,1.34,.23],kit.reading);
 machines.push(machine);}
 kit.panel(systems,-4.2,.7,1);for(const x of [-6.9,6.9]){kit.box(systems,[.65,1.5,1.1],[x,.75,-2],kit.navy);for(let i=0;i<4;i++)kit.box(systems,[.7,.04,1.15],[x,.25+i*.3,-2],kit.steel);}
 const paths:Point[][]=[[[-6.9,1.6,-2],[-6.9,2.6,-2],[-3.8,2.6,-2],[-3.8,2.6,-.7],[-3.8,1.8,-.7]],[[6.9,1.6,-2],[6.9,2.6,-2],[3.8,2.6,-2],[3.8,2.6,-.7],[3.8,1.8,-.7]]];const signals=paths.map(path=>{kit.line(systems,path);return kit.box(systems,[.09,.09,.09],path[0],kit.active);});
 for(const x of [-4,0,4])for(const side of [-1,1]){const panel=kit.box(roof,[2.06,.12,7.2],[x+side,3.65,-.5],kit.navy);panel.rotation.z=-side*.15;for(let j=0;j<3;j++)kit.box(roof,[1.55,.05,.25],[x+side,3.85,-2.4+j*1.8],kit.glass);}
 const glow=new T.Group();root.add(glow);const rims=[.06,.14,.28].map((width,i)=>{const mat=own(new T.MeshBasicMaterial({color:0x48c9ff,transparent:true,opacity:0,depthWrite:false}));for(const z of [-4.2,3.2])kit.box(glow,[12.6,.025,width],[0,.08,z],mat);for(const x of [-6.3,6.3])kit.box(glow,[width,.025,7.4],[x,.08,-.5],mat);return {mat,peak:[.8,.24,.08][i]};});
 // Local build fronts reveal components at their final supported positions.
 function revealGroup(group:T.Group,min:number,max:number){
  let seed=group.id+71;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const samples=sampleWorldSurface(group,400,random),geometry=own(new T.BufferGeometry());geometry.setAttribute('position',new T.BufferAttribute(samples,3));
  const uniforms={front:{value:min},tint:{value:new T.Color(0x4ca9da)}};
  const depositMaterial=own(new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:'uniform float front;varying float alpha;void main(){alpha=1.-smoothstep(.03,.32,abs(position.y-front));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=2.;}',fragmentShader:'uniform vec3 tint;varying float alpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(tint,alpha*(1.-smoothstep(.12,.5,r))*.8);\n#include <colorspace_fragment>'}));
  const deposition=new T.Points(geometry,depositMaterial);deposition.frustumCulled=false;root.add(deposition);
  const plane=new T.Plane(new T.Vector3(0,-1,0),min),copies:{base:T.MeshStandardMaterial;copy:T.MeshStandardMaterial}[]=[],cache=new Map<T.Material,T.Material>();group.traverse(o=>{if(!(o instanceof T.Mesh))return;const source=Array.isArray(o.material)?o.material:[o.material];const mapped=source.map(base=>{let copy=cache.get(base);if(!copy){const made=own(base.clone()) as T.Material;made.clippingPlanes=[plane];copy=made;cache.set(base,made);if(base instanceof T.MeshStandardMaterial&&copy instanceof T.MeshStandardMaterial)copies.push({base,copy});}return copy;});o.material=Array.isArray(o.material)?mapped:mapped[0];});return (progress:number)=>{group.visible=progress>0;plane.constant=progress>=1?1000:min+(max-min)*progress;uniforms.front.value=plane.constant;uniforms.tint.value.copy(kit.active.color);deposition.visible=progress>0&&progress<1;copies.forEach(({base,copy})=>{copy.color.copy(base.color);copy.emissive.copy(base.emissive);copy.emissiveIntensity=base.emissiveIntensity;copy.opacity=base.opacity;});};}
 const revealSkin=revealGroup(skin,-.02,2.85),revealTrusses=revealGroup(trusses,3.05,3.85),revealSystems=revealGroup(systems,-.02,2.7),revealRoof=revealGroup(roof,3.2,4.1),machineReveals=machines.map(m=>revealGroup(m,0,2));
 return {groups:[frame,skin,equipment,systems,roof],span:24,target:new T.Vector3(0,1,0),update(time:number,dark:boolean){const state=plantBuildState(time);updateSupportingGlass(glazing,dark);site.visible=true;columns.forEach((column,i)=>{const p=smooth((time-3-i*.10)/1.5);column.visible=p>0;column.scale.y=Math.max(.001,p);column.position.y=1.6*p;});revealTrusses(smooth((time-5.3)/1.5));trusses.position.y=0;revealSkin(state.envelope);skin.scale.setScalar(1);equipment.visible=time>=11;machines.forEach((machine,i)=>{machine.position.y=0;machineReveals[i](smooth((time-11-i*.4)/1.6));});revealSystems(state.systems);signals.forEach((signal,i)=>{signal.visible=time>=18&&time<19.8;signal.position.fromArray(routePoint(paths[i],smooth((time-18)/1.8)));});roof.position.set(0,0,0);revealRoof(state.roofClose);rims.forEach(({mat,peak})=>{mat.color.setHex(dark?0x57cfff:0x178abd);mat.opacity=peak*state.glow;});glazing.emissiveIntensity=.06+.55*state.glow;root.userData.complete=state.complete;root.userData.completionGlow=state.glow;root.userData.buildPhase=time<3?'foundation':time<7?'structure':time<11?'enclosure':time<16?'equipment':time<18?'connections':time<20?'roof':'complete';}};
}
