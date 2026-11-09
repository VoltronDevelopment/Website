import {createRenderQuality} from '../performance/scene-policy';
import {logisticsLayout} from './factory-logistics';
import {createAlphaTankShell,createAlphaTrolleyBody} from '../home/alpha-equipment';
import {createAlphaBathSurface} from '../home/alpha-bath-surface';
import {alphaVisualColors} from '../home/alpha-visual-palette';
import {createAlphaStackLight} from '../home/alpha-stack-light';
import * as T from 'three';
import {placeOperatingLabel,operatingLabelPort,type LabelRect} from './operating-label-layout';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {factoryLayout,factoryStations,factoryRunningDistance,factoryMechanicalGeometry,inspectionJawClosedCenter} from './operating-model';
import {factoryCameraOffset,factoryCameraShot,factoryOverviewSpan} from './factory-camera';
import {factoryBathGeometry,factoryBathState} from './factory-bath-model';
import {factoryProcessPosition} from './operating-model';
import {createArtworkEnvironment,addArtworkSoftboxes} from '../brand/artwork-studio';
import {operatingEntities,operatingEdges,operatingState,operatingAnchor,handlingGeometry,type OperatingEntity} from './operating-model';
export async function mountOperatingScene(canvas:HTMLCanvasElement,host:HTMLElement,onPick:(id:OperatingEntity)=>void){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:new URLSearchParams(location.search).has('scene-capture')});const quality=createRenderQuality(canvas,1.6);renderer.setPixelRatio(quality.ratio);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-18,18,13,-13,.1,150),environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe9f5ff,0x183047,2));const sun=new T.DirectionalLight(0xffffff,3);sun.position.set(-10,18,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:14,bottom:-14});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);const rim=new T.DirectionalLight(0xa4ddff,2);rim.position.set(6,6,-5);scene.add(rim);
 const resources=new Set<{dispose:()=>void}>(),own=<R extends {dispose:()=>void}>(r:R)=>{resources.add(r);return r;};
 const pearl=own(new T.MeshStandardMaterial({color:0xdbe8f3,roughness:.3,metalness:.35})),navy=own(new T.MeshStandardMaterial({color:0x17354e,roughness:.28,metalness:.5})),metal=own(new T.MeshStandardMaterial({color:0xa0b9ca,roughness:.23,metalness:.8})),glass=own(new T.MeshPhysicalMaterial({color:0xa9d9ef,roughness:.16,metalness:.12,transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide})),cyan=own(new T.MeshStandardMaterial({color:0x2289bd,emissive:0x1278b5,emissiveIntensity:.7,roughness:.3}));
 const root=new T.Group();scene.add(root);const pickables:T.Object3D[]=[];
 const sharedBoxes=new Map<string,T.BufferGeometry>();
 function box(parent:T.Object3D,size:number[],pos:number[],mat:T.Material,r=.08){const key=size.join(',')+','+r;
  let geometry=sharedBoxes.get(key);
  if(!geometry){geometry=own(r<=.005?new T.BoxGeometry(size[0],size[1],size[2]):new RoundedBoxGeometry(size[0],size[1],size[2],r<.04?1:2,r));sharedBoxes.set(key,geometry);}
  const mesh=new T.Mesh(geometry,mat);mesh.position.fromArray(pos);mesh.castShadow=!mat.transparent;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function line(points:number[][],mat:T.Material,parent:T.Object3D=root){const g=own(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p as [number,number,number]))));const l=new T.Line(g,mat);parent.add(l);return l;}
 const semanticMat=own(new T.LineBasicMaterial({color:0x2e9acb,transparent:true,opacity:.65}));
 const foundation=own(new T.MeshStandardMaterial({roughness:.38,metalness:.32}));box(root,[22.6,.1,13.9],[-1.3,-.05,-.25],foundation,.035);
 const shadowMat=own(new T.ShadowMaterial({color:0x254962,opacity:.14}));const shadowFloor=new T.Mesh(own(new T.PlaneGeometry(58,23)),shadowMat);shadowFloor.rotation.x=-Math.PI/2;shadowFloor.position.y=-.012;shadowFloor.receiveShadow=true;root.add(shadowFloor);
 const pad=(x:number,z:number,w:number,d:number)=>{box(root,[w,.06,d],[x,.028,z],pearl,.018);};
 // Separate equipment islands preserve the service aisle and both dock approaches.
 pad(2,factoryLayout.wetLineZ,9.8,2.7);pad(factoryLayout.ovenX,factoryLayout.returnLineZ,5.6,2.7);pad(-4,factoryLayout.returnLineZ,2.6,2.6);
 // Exterior bay markings share the ground datum with the single interior slab.
 for(const x of [-8.09,-10.12])for(const z of [.9,2.5,4.1])
  box(root,[.045,.008,.72],[x,.007,z],pearl,.002);
 for(const z of [-1.03,1.03])box(root,[4.6,.01,.045],[logisticsLayout.truckX-.85,.007,z],pearl,.002);
 for(const x of [logisticsLayout.rack.x-1.06,logisticsLayout.rack.x+1.06])box(root,[.045,.012,2.1],[x,.008,logisticsLayout.rack.z],pearl,.002);
 // A low services spine leaves the tank openings and suspended load visible.
 box(root,[8.8,.22,.38],[2,1.48,-6.55],pearl,.025);
 for(const x of [-1,5])box(root,[.07,1.62,.07],[x,.63,-6.55],metal,.01);
 box(root,[.65,1.05,.4],[-3.2,.43,-6.3],navy,.025);
 box(root,[.44,.3,.025],[-3.2,.65,-6.08],glass,.01);
 // An edge cabinet terminates the sensor trunk along the back of the line.
 const edgeLamp=box(root,[.06,.06,.025],[-3.02,.87,-6.08],cyan,.005);
 for(const x of [-3.37,-3.27,-3.17])box(root,[.05,.13,.03],[x,.32,-6.08],metal,.003);
 const conduit=own(new T.LineBasicMaterial({color:0x547b92}));
 line([[-3.2,.22,-6.48],[-3.2,.22,-6.72],[8.88,.22,-6.72],[8.88,.22,-1.25]],conduit);
 const qualityRoot=new T.Group();qualityRoot.position.set(-14,0,factoryLayout.returnLineZ-1.8);root.add(qualityRoot);
 // The approved Alpha shell, shader and stack light share their original dimensions at one uniform scale.
 const polished=own(new T.MeshStandardMaterial({metalness:.86,roughness:.2})),steelDark=own(new T.MeshStandardMaterial({metalness:.7,roughness:.36})),tankBack=own(new T.MeshStandardMaterial({metalness:.38,roughness:.31}));
 const tankFront=own(new T.MeshPhysicalMaterial({metalness:.05,roughness:.16,transparent:true,opacity:.2,depthWrite:false,clearcoat:1,envMapIntensity:.9,side:T.DoubleSide})),tankSide=own(tankFront.clone());
 const equipmentBox=(parent:T.Group,size:number[],pos:number[],mat:T.Material,soft=false)=>box(parent,size,pos,mat,soft?.035:.002);
 const tanks=factoryStations.filter(s=>s.kind==='tank').map((station,index)=>{
  const g=new T.Group();g.position.set(station.x,0,station.z);g.scale.set(.7,.7,index===3?1.35:.7);root.add(g);
  createAlphaTankShell(g,equipmentBox,own,{metal,polished,steelDark,back:tankBack,front:tankFront,side:tankSide},true);
  const lamp=createAlphaStackLight(own,own,polished);lamp.group.position.set(-1.39,2.12,1.12);g.add(lamp.group);
  const volume=own(new T.MeshBasicMaterial({transparent:true,opacity:index===1?.64:.48,depthWrite:false}));const liquid=box(g,[2.93,1.34,2.29],[0,1.15,0],volume,.002);liquid.renderOrder=2;
  const water=own(createAlphaBathSurface(index));const surface=new T.Mesh(own(new T.PlaneGeometry(2.94,2.3,16,12)),water);surface.rotation.x=-Math.PI/2;surface.position.y=1.82;surface.renderOrder=3;g.add(surface);
  return {g,lamp,water,volume,index};
 });
 // Fixed square-U rails and two indexed corner tables, matching the detailed Alpha line.
 const railY=factoryLayout.railHeight;
 for(const z of [factoryLayout.wetLineZ,factoryLayout.returnLineZ])for(const side of [-.504,.504])box(root,[11.265,.12,.1],[1.6325,railY,z+side],metal,.018);
 for(const side of [-.504,.504])box(root,[.1,.12,6.026],[8+side,railY,-1.25],metal,.018);
 for(const x of [-4.8,8.6])for(const z of [-6.15,4.05]){box(root,[.14,railY+.2,.14],[x,(railY-.3)/2,z],metal,.008);for(const edge of [-.085,.085])box(root,[.035,railY+.2,.22],[x+edge,(railY-.3)/2,z],steelDark,.004);box(root,[.12,.12,2.75],[x,railY-.05,z+(z<0?.7:-.9)],navy,.02);}
 const turntables=[factoryLayout.wetLineZ,factoryLayout.returnLineZ].map(z=>{const g=new T.Group();g.position.set(8,0,z);root.add(g);box(g,[1.47,.12,1.47],[0,railY-.15,0],navy,.02);const bearing=new T.Mesh(own(new T.CylinderGeometry(.735,.735,.063,40)),polished);bearing.position.y=railY-.045;g.add(bearing);for(const x of [-.714,.714])for(const bz of [-.714,.714])box(g,[.084,.056,.084],[x,railY-.05,bz],polished,.01);const turn=new T.Group();g.add(turn);for(const side of [-.504,.504]){box(turn,[1.435,.084,.077],[0,railY,side],metal,.01);box(turn,[1.435,.0315,.14],[0,railY+.056,side],polished,.008);}return turn;});
 // Polished running surfaces, bolted station joints and load-bearing brackets.
 for(const z of [factoryLayout.wetLineZ,factoryLayout.returnLineZ])for(const side of [-.504,.504])box(root,[11.265,.032,.14],[1.6325,railY+.056,z+side],polished,.008);
 for(const side of [-.504,.504])box(root,[.14,.032,6.026],[8+side,railY+.056,-1.25],polished,.008);
 for(const x of [-4,-1,2,5])for(const side of [-.504,.504]){box(root,[.196,.021,.224],[x,railY+.077,factoryLayout.wetLineZ+side],steelDark,.005);for(const dx of [-.056,.056])box(root,[.032,.025,.032],[x+dx,railY+.098,factoryLayout.wetLineZ+side],polished,.004);}
 function brace(a:number[],b:number[]){const start=new T.Vector3(...a as [number,number,number]),end=new T.Vector3(...b as [number,number,number]),delta=end.clone().sub(start);const rod=new T.Mesh(own(new T.CylinderGeometry(.032,.032,delta.length(),10)),polished);rod.position.copy(start).add(end).multiplyScalar(.5);rod.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());rod.castShadow=true;root.add(rod);}
 for(const x of [-4.8,8.6])for(const z of [-6.15,4.05]){box(root,[.42,.08,.42],[x,-.18,z],steelDark,.025);brace([x,2.9,z],[x,railY,z+(z<0?.75:-.75)]);}
 const coatColor=new T.Color(0x406996);
 const carrier=new T.Group();root.add(carrier);
 const trolley=new T.Group();trolley.scale.setScalar(.7);trolley.position.y=railY-3.67;carrier.add(trolley);const trolleyWheels=createAlphaTrolleyBody(trolley,equipmentBox,own,{metal,steelDark,polished});
 const hangers=[box(carrier,[.018,.8,.018],[0,2.8,-.084],steelDark,.002),box(carrier,[.018,.8,.018],[0,2.8,.084],steelDark,.002)];
 const fixture=new T.Group();carrier.add(fixture);box(fixture,[.68,.05,.08],[0,0,0],polished,.015);
 const hookGeometry=own(new T.TorusGeometry(.06,.013,6,20,Math.PI*1.75));const topHook=new T.Mesh(hookGeometry,metal);topHook.position.y=.07;fixture.add(topHook);
 const gripJaws=[-.24,.24].map(x=>{const jaw=new T.Group();jaw.position.set(x,-.014,0);fixture.add(jaw);box(jaw,[.018,.126,.018],[0,-.063,0],metal,.002);const hook=new T.Mesh(hookGeometry,polished);hook.scale.setScalar(.55);hook.position.y=-.105;jaw.add(hook);return jaw;});
 // Raised camelback chamber on the return leg; the same suspended fixture passes through its roof slot.
 const oven=new T.Group();oven.position.set(factoryLayout.ovenX,0,factoryLayout.returnLineZ);oven.scale.set(factoryLayout.ovenLengthScale,factoryLayout.ovenScale,1);root.add(oven);
 box(oven,[6.3,.25,2.55],[0,.05,0],navy,.035);
 box(oven,[3.15,2.05,.14],[0,1.15,-1.16],pearl,.035);
 box(oven,[3.15,1.95,.14],[0,1.1,1.16],pearl,.035);
 box(oven,[3.2,factoryMechanicalGeometry.ovenFloorThickness,2.5],[0,factoryMechanicalGeometry.ovenFloorCenter,0],navy,.035);
 box(oven,[3.15,1.12,.14],[0,2.65,-1.16],pearl,.045);
 box(oven,[3.15,.2,.14],[0,2.18,1.16],pearl,.025);box(oven,[3.15,.2,.14],[0,3.13,1.16],pearl,.025);
 for(const x of [-1.23,1.23])box(oven,[.68,.85,.14],[x,2.65,1.16],pearl,.025);
 box(oven,[1.8,.85,.025],[0,2.65,1.16],glass,.025);
 for(const z of [-.7,.7])box(oven,[3.3,factoryMechanicalGeometry.ovenRoofThickness,1.05],[0,factoryMechanicalGeometry.ovenRoofCenter,z],navy,.035);
 const ovenLight=own(new T.MeshStandardMaterial({color:0x378eb8,emissive:0x167fb9,emissiveIntensity:.12,roughness:.3}));
 box(oven,[2.6,.04,.04],[0,3.05,1.25],ovenLight,.01);
 // Sloping entrance/exit hoods give the chamber its camelback profile.
 for(const side of [-1,1]){const hood=new T.Group();hood.position.set(side*2.35,2.47,0);hood.rotation.z=side*-.105;oven.add(hood);
  for(const z of [-1.16,1.16]){box(hood,[1.5,1.05,.12],[0,0,z],pearl,.035);box(oven,[1.5,2.05,.12],[side*2.35,1.15,z],pearl,.035);}
  for(const z of [-.7,.7])box(hood,[1.5,.12,1.05],[0,.84,z],navy,.025);
 }
 const ovenDoors=[-3.15,3.15].map(x=>[-1,1].map(side=>{const door=box(oven,[.1,2.9,1.13],[x,1.8,side*.565],metal,.025);box(door,[.018,.7,.14],[x<0?-.06:.06,0,-side*.25],navy,.01);return door;}));
 // Sliding doors have visible guides and their own clearance beyond the chamber sides.
 for(const x of [-3.15,3.15]){
  // Independent leaf guides leave the same open suspension slot as the roof.
  const guideLength=(5.4-factoryMechanicalGeometry.ovenGuideSlot)/2;
  for(const side of [-1,1])box(oven,[.16,.12,guideLength],[x,3.4,side*(factoryMechanicalGeometry.ovenGuideSlot/2+guideLength/2)],steelDark,.015);
  // Door guides cantilever from the chamber, leaving the inspection aisle clear.
  for(const side of [-1,1]){
   const start=new T.Vector3(x,2.8,side*1.15),end=new T.Vector3(x,3.4,side*2.25);
   const delta=end.clone().sub(start);
   const gusset=new T.Mesh(own(new T.BoxGeometry(.09,.09,delta.length())),metal);
   gusset.position.copy(start).add(end).multiplyScalar(.5);
   gusset.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.normalize());oven.add(gusset);
   box(oven,[.19,.19,.08],[x,3.4,side*2.65],steelDark,.012);
  }
 }
 box(oven,[.7,1.25,.4],[.8,.75,-1.5],navy,.025);
 box(oven,[.45,.35,.035],[.8,1.02,-1.72],glass,.01);
 box(oven,[.32,.25,.32],[-.6,3.38,-.7],metal,.015);
 box(oven,[.56,.1,.56],[-.6,3.55,-.7],navy,.015);
 // Product views live in the reserved digital layer, leaving the factory floor clear.
 const attention=own(new T.MeshStandardMaterial({color:0x246bd4,emissive:0x1264bd,emissiveIntensity:.7})),reviewBeacon=box(root,[.2,.2,.2],[5,2.2,factoryLayout.wetLineZ],attention,.03);
 const pallet=new T.Group();root.add(pallet);for(const z of [-.5,0,.5])box(pallet,[1.45,.04,.12],[0,.02,z],metal,.01);box(pallet,[1.5,.08,1.2],[0,.08,0],pearl,.02);
 const scanMaterial=own(new T.MeshBasicMaterial({color:0x39b5ed,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide}));
 const {rack,loadX,loadZ,outfeedZ}=logisticsLayout;
 const receivingScanMaterial=own(scanMaterial.clone());
 const scanner=new T.Group();scanner.position.set(rack.x,0,rack.z);root.add(scanner);
 for(const x of [-.88,.88]){
  for(const z of [-.8,.8]) {
   box(scanner,[.09,2.25,.1],[x,1.125,z],steelDark,.012);
   box(scanner,[.24,.05,.24],[x,.025,z],metal,.008);
  }
  for(const y of [.44,2.16])box(scanner,[.12,.12,1.72],[x,y,0],navy,.012);
 }
 for(const z of [-.63,.63])box(scanner,[1.84,.12,.13],[0,.32,z],metal,.012);
 for(const x of [-.53,.53])box(scanner,[.14,.12,1.6],[x,.44,0],metal,.012);
 box(scanner,[1.86,.16,.12],[0,2.16,.8],pearl,.015);
 const scan=box(scanner,[1.55,.02,1.3],[0,1.6,0],receivingScanMaterial,.005);
 // Side rails support the inbound pallet while leaving both fork pockets clear.
 for(const z of [-.49,.49]){
  box(root,[1.55,.1,.15],[loadX,.55,loadZ+z],metal,.01);
  for(const x of [-.57,.57])box(root,[.12,.55,.15],[loadX+x,.275,loadZ+z],navy,.01);
 }
 box(qualityRoot,[1.9,.35,1.7],[10,.25,1.8],navy);box(qualityRoot,[1.5,.15,1.45],[10,.525,1.8],metal);const panelShape=new T.Shape();const halfPartWidth=factoryMechanicalGeometry.partWidth/2,halfPartHeight=factoryMechanicalGeometry.partHeight/2;panelShape.moveTo(-halfPartWidth,-halfPartHeight);panelShape.lineTo(halfPartWidth,-halfPartHeight);panelShape.lineTo(halfPartWidth,halfPartHeight);panelShape.lineTo(-halfPartWidth,halfPartHeight);panelShape.closePath();for(const x of [-.34,.34])for(const y of [-.48,0,.48]){const hole=new T.Path();hole.absarc(x,y,.033,0,Math.PI*2,true);panelShape.holes.push(hole);}const panelGeometry=own(new T.ExtrudeGeometry(panelShape,{depth:factoryMechanicalGeometry.partDepth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:factoryMechanicalGeometry.partBevel,bevelThickness:.012,curveSegments:10}));panelGeometry.translate(0,0,-.0375);const wetPart=own(polished.clone());const inspected=new T.Mesh(panelGeometry,wetPart);inspected.scale.setScalar(factoryMechanicalGeometry.partScale);root.add(inspected);const qualityGate=box(qualityRoot,[.15,2,.15],[11.3,1,2.4],cyan);

 const mark=own(new T.TextureLoader().load('/optimized/voltron-mark-original-e705f2836b1c0976.webp',()=>{if(!disposed)draw();}));
 mark.colorSpace=T.SRGBColorSpace;
 const fleetMark=own(new T.MeshBasicMaterial({map:mark,transparent:true,depthWrite:false,toneMapped:false}));
 const decalGeometry=own(new T.PlaneGeometry(.88,.88));
 const rubber=own(new T.MeshStandardMaterial({color:0x192835,roughness:.88}));
 const glazing=own(new T.MeshStandardMaterial({color:0x517c94,metalness:.52,roughness:.19}));
 function vehicle(){
  const g=new T.Group();root.add(g);const wheels:T.Mesh[]=[],doors:T.Group[]=[];
  box(g,[3.1,.16,1.5],[.2,.4,0],metal);box(g,[2.35,.1,1.35],[-.2,.55,0],navy);
  const roof=box(g,[2.4,.08,1.42],[-.2,1.85,0],pearl);for(const z of [-.69,.69]){box(g,[2.4,1.25,.07],[-.2,1.2,z],pearl);for(const x of [-1.28,-1.14,.72,.88])box(g,[.025,1.08,.025],[x,1.2,z*1.03],metal,.008);
   const decal=new T.Mesh(decalGeometry,fleetMark);decal.position.set(-.2,1.26,Math.sign(z)*.736);decal.rotation.y=z>0?0:Math.PI;g.add(decal);
   box(g,[2.25,.065,.025],[-.2,.72,Math.sign(z)*.735],navy,.006);}
  box(g,[.07,1.3,1.4],[1,1.2,0],pearl);box(g,[1.05,1.1,1.4],[1.65,1.02,0],navy);box(g,[.06,.5,1.16],[2.2,1.25,0],glazing);
  for(const z of [-.71,.71]){box(g,[.7,.48,.035],[1.65,1.28,z],glazing);box(g,[.3,.05,.025],[1.55,.93,z],metal,.01);box(g,[.18,.17,.15],[2.02,1.1,z*1.15],navy,.02);}
  for(const side of [-1,1]){
   for(const x of [-1.18,-.62,.39])box(g,[.13,.065,.025],[x,.59,side*.745],pearl,.009);
   box(g,[.85,.08,.18],[1.6,.46,side*.72],metal,.012);
  }
  for(const y of [.78,.86,.94])box(g,[.045,.025,.53],[2.31,y,0],metal,.004);
  box(g,[.12,.18,1.55],[2.24,.65,0],metal);box(g,[.1,.36,.7],[2.25,.91,0],navy,.02);for(const z of [-.52,.52])box(g,[.07,.13,.22],[2.26,.95,z],cyan,.02);
  for(const x of [-.9,.65,1.65])for(const z of [-.73,.73]){const wheel=new T.Mesh(own(new T.CylinderGeometry(.28,.28,.18,18)),rubber);wheel.rotation.x=Math.PI/2;wheel.position.set(x,.28,z);g.add(wheel);wheels.push(wheel);const hub=new T.Mesh(own(new T.CylinderGeometry(.13,.13,.19,12)),metal);hub.rotation.x=Math.PI/2;hub.position.copy(wheel.position);g.add(hub);}
  for(const side of [-1,1]){const hinge=new T.Group();hinge.position.set(-1.42,1.2,side*.7);g.add(hinge);box(hinge,[.07,1.25,.69],[0,0,-side*.345],pearl,.025);box(hinge,[.04,.75,.025],[-.055,0,-side*.3],metal,.01);doors.push(hinge);}
  return {g,roof,wheels,doors,update(distance:number,open:number){wheels.forEach(w=>{w.rotation.set(Math.PI/2,0,0);w.rotateY(-distance/.28);});doors.forEach((door,i)=>door.rotation.y=(i===0?-1:1)*open*Math.PI*1.47);}};
 }
 const truck=vehicle();truck.g.rotation.y=Math.PI;
 const parcel=box(root,[.88,.75,.78],[0,1,0],pearl,.035);
 for(const x of [-.27,.27])box(parcel,[.045,.76,.79],[x,0,0],navy,.006);
 const outboundPallet=pallet.clone();root.add(outboundPallet);
 function handler(){const wheels:{steering:T.Group; axle:T.Group; rear:boolean}[]=[];const g=new T.Group();root.add(g);box(g,[1.2,.6,.9],[0,.4,0],navy);box(g,[.15,1.8,.15],[.65,1,0],metal);const forks=new T.Group();g.add(forks);for(const z of [-.3,.3]){box(forks,[1.65,handlingGeometry.forkThickness,.09],[1.45,0,z],metal);box(g,[.07,1.6,.07],[.45,1.1,z],metal);}box(g,[.7,.1,.9],[0,1.8,0],pearl);
 for(const z of [-.4,.4]){box(g,[.045,1.1,.045],[-.32,1.2,z],metal,.01);box(g,[.045,1.1,.045],[.31,1.2,z],metal,.01);}
 box(g,[.32,.45,.48],[-.22,.75,0],steelDark,.035);box(g,[.4,.09,.5],[0,.55,0],steelDark,.02);box(g,[.16,.6,.5],[.31,.75,0],navy,.025);
 box(g,[.2,.4,.76],[-.52,.44,0],polished,.035);for(const x of [-.4,.4])for(const z of [-.47,.47]){const w=new T.Mesh(own(new T.CylinderGeometry(.2,.2,.12,12)),rubber);w.rotation.x=Math.PI/2;const axle=new T.Group();axle.position.set(x,.2,z);const steering=new T.Group();steering.position.copy(axle.position);axle.position.set(0,0,0);g.add(steering);steering.add(axle);axle.add(w);
 box(axle,[.20,.035,.016],[0,0,Math.sign(z)*.067],metal,.005);wheels.push({steering,axle,rear:x<0});}
 return {g,forks,wheels};}
 const lift=handler();
 // Inspection enclosure, locating jaws and two perpendicular scan planes.
 for(const x of [9.05,10.95])for(const z of [.9,2.7])box(qualityRoot,[.07,2.2,.07],[x,1,z],metal,.02);
 for(const z of [1.25,2.35])box(qualityRoot,[2.05,.06,.8],[10,2.12,z],glass);for(const x of [9.02,10.98])for(const z of [1.25,2.35])box(qualityRoot,[.045,.06,.8],[x,2.12,z],metal,.01);for(const z of [.87,2.73])box(qualityRoot,[2.05,.06,.045],[10,2.12,z],metal,.01);box(qualityRoot,[.035,1.6,1.8],[9.02,1.25,1.8],glass,.01);
 const jaws=[box(qualityRoot,[.13,.22,.4],[9.4,.85,1.8],metal,.025),box(qualityRoot,[.13,.22,.4],[10.6,.85,1.8],metal,.025)];
 const qualityBadge=box(qualityRoot,[.4,.16,.12],[10,1.95,2.8],metal,.025);
 const inspectionVertical=box(qualityRoot,[.025,1.1,1.4],[10,1.15,1.8],scanMaterial,.01);
 // The released lot advances on a supported outfeed until the fork pockets clear the frame.
 for(const x of [-.69,.69]){
  box(root,[.12,.15,2.5],[loadX+x,.475,outfeedZ-.65],navy,.015);
  for(const z of [-1.65,.4])box(root,[.12,.42,.14],[loadX+x,.21,outfeedZ+z],metal,.012);
 }
 const rollerGeometry=own(new T.CylinderGeometry(.05,.05,1.39,12));
 for(let i=0;i<12;i++){const roller=new T.Mesh(rollerGeometry,metal);roller.rotation.z=Math.PI/2;roller.position.set(loadX,.55,outfeedZ-1.72+i*.2);root.add(roller);}
 const scanCoreMaterial=own(new T.MeshBasicMaterial({color:0x37b9ed,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));
 const horizontalCore=box(qualityRoot,[.72,.025,.03],[10,1.2,1.86],scanCoreMaterial,.003),verticalCore=box(qualityRoot,[.025,.72,.03],[10,1.055,1.86],scanCoreMaterial,.003);
 const inspectionPlane=box(qualityRoot,[1.6,.02,1.2],[10,1.5,1.8],scanMaterial,.01);
 // A quiet relationship foundation activates only around the selected manufacturing identity.
 const links=operatingEdges.map(([a,b])=>{const from=operatingEntities.find(e=>e.id===a)!.position,to=operatingEntities.find(e=>e.id===b)!.position;return {a,b,line:line([[from[0],2.6,from[2]],[12.8,2.6,from[2]],[12.8,2.6,to[2]],[to[0],2.6,to[2]]],semanticMat)};});
 operatingEntities.forEach(entity=>{const proxy=box(root,[2.6,2.6,2.6],[entity.position[0],1,entity.position[2]],own(new T.MeshBasicMaterial({visible:false})));proxy.userData.entity=entity.id;pickables.push(proxy);});
 const drainGeometry=own(new T.BufferGeometry()),drainPositions=new Float32Array(48*3);drainGeometry.setAttribute('position',new T.BufferAttribute(drainPositions,3));
 const drainMaterial=own(new T.PointsMaterial({color:0x50b9dc,size:.027,transparent:true,opacity:0,depthWrite:false}));const drainage=new T.Points(drainGeometry,drainMaterial);root.add(drainage);
 const labelPositions=new Map<string,LabelRect>();
 let cameraStamp=0,cameraSnap=true;
 const overviewOffset=new T.Vector3(...factoryCameraOffset()),cameraOffset=overviewOffset.clone(),shotOffset=new T.Vector3();let viewSpan=20;let state=operatingState(0),selected:OperatingEntity|null=null,overview=false,disposed=false;const target=new T.Vector3(),look=new T.Vector3(),ray=new T.Raycaster(),pointer=new T.Vector2();
 function draw(){if(disposed)return;const stamp=performance.now(),dt=cameraStamp?Math.min(.08,Math.max(0,(stamp-cameraStamp)/1000)):0;cameraStamp=stamp;
  if(quality.sample(stamp)){renderer.setPixelRatio(quality.ratio);renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.shadowMap.enabled=quality.shadows;}
  const follow=cameraSnap?1:1-Math.exp(-5.66*dt);cameraSnap=false;const dark=document.documentElement.dataset.theme==='dark',palette=alphaVisualColors(dark);metal.color.setHex(palette.metal);polished.color.setHex(palette.polished);steelDark.color.setHex(palette.steelDark);tankBack.color.setHex(palette.tankBack);tankFront.color.setHex(palette.glass);tankFront.opacity=palette.glassOpacity;tankSide.color.setHex(palette.glass);tankSide.opacity=dark?.25:.27;scene.environmentIntensity=palette.environment;sun.intensity=palette.key;foundation.color.setHex(palette.foundation);shadowMat.color.setHex(palette.shadowColor);shadowMat.opacity=palette.shadowOpacity;rim.intensity=palette.rim;pearl.color.set(dark?0x7695b2:0xdbe8f3);navy.color.set(dark?0x122b42:0x254760);glass.opacity=dark?.23:.36;
  const {logistics}=state;
  const beforeLoad=state.time<24;
  pallet.position.set(beforeLoad?state.part.x:loadX,beforeLoad?state.palletY:.6,beforeLoad?state.part.z:loadZ);
  pallet.rotation.y=beforeLoad?logistics.inboundYaw:0;
  edgeLamp.material=state.exchange&&state.time-state.exchange[0]<1.4?cyan:steelDark;
  const {pose}=logistics;
  lift.g.position.set(pose.x,0,pose.z);lift.g.rotation.y=-pose.heading;lift.forks.position.y=logistics.forkY;
  for(const wheel of lift.wheels){wheel.steering.rotation.y=wheel.rear?-logistics.steer:0;wheel.axle.rotation.z=-pose.distance/.2;}
  truck.g.position.set(logistics.truckX,0,logisticsLayout.dock.z);
  truck.update(-logistics.truckX,logistics.door);
  outboundPallet.position.set(logistics.outgoing.x,logistics.outgoing.y-.455,logistics.outgoing.z);
  outboundPallet.rotation.y=logistics.outboundYaw;
  outboundPallet.visible=true;
  carrier.position.set(state.time>=58?-4:state.carrier.x,0,state.time>=58?factoryLayout.returnLineZ:state.carrier.z);carrier.rotation.y=state.carrierYaw;turntables[0].rotation.y=-Math.PI/2*T.MathUtils.smoothstep(state.time,39.4,39.9);turntables[1].rotation.y=-Math.PI/2-Math.PI/2*T.MathUtils.smoothstep(state.time,52.3,52.8);carrier.visible=true;
  trolley.position.z=0;
  const attach=T.MathUtils.smoothstep(state.time,23,24)*(1-T.MathUtils.smoothstep(state.time,58,59));
  const fixtureBottom=T.MathUtils.lerp(3.05,(state.time>=58?1.055:state.part.y)+.47,attach);
  fixture.visible=true;fixture.position.z=trolley.position.z;
  ovenDoors.forEach((pair,i)=>pair.forEach((door,j)=>door.position.z=(j===0?-1:1)*(.565+1.2*(i===0?state.ovenExitOpen:state.ovenEntryOpen))));ovenLight.emissiveIntensity=state.ovenActive?1.25:.12;
  inspected.visible=state.time<70.95;inspected.position.set(state.part.x,state.part.y,state.part.z);inspected.rotation.y=state.time<24?logistics.inboundYaw:state.time<67?state.carrierYaw:logistics.outboundYaw-Math.PI;fixture.position.y=fixtureBottom;
  hangers.forEach(h=>{const bottom=fixtureBottom,length=railY-.3-bottom;h.scale.y=length/.8;h.position.y=(railY-.3+bottom)/2;});
  const horizontalScan=state.scanning&&state.scanProgress<.5,scanLocal=horizontalScan?state.scanProgress*2:(state.scanProgress-.5)*2;
  inspectionPlane.visible=horizontalScan;inspectionVertical.visible=state.scanning&&!horizontalScan;inspectionPlane.position.y=1.55-scanLocal*.8;inspectionVertical.position.x=9.55+scanLocal*.9;
  const scanEnvelope=state.scanning?Math.sin(Math.PI*scanLocal):0;scanMaterial.opacity=(dark?.26:.22)*scanEnvelope;scanCoreMaterial.color.setHex(dark?0x8be2ff:0x087cb5);scanCoreMaterial.opacity=scanEnvelope*(dark?.95:.85);horizontalCore.visible=horizontalScan;verticalCore.visible=state.scanning&&!horizontalScan;horizontalCore.position.y=1.36-scanLocal*.61;verticalCore.position.x=9.68+scanLocal*.64;
  jaws.forEach((jaw,i)=>jaw.position.x=10+(i===0?-1:1)*T.MathUtils.lerp(factoryMechanicalGeometry.jawOpenCenter,inspectionJawClosedCenter,state.clamp));qualityBadge.material=state.released?cyan:state.scanning?attention:metal;qualityGate.material=state.released?cyan:metal;
  parcel.visible=state.time>=70;parcel.scale.setScalar(.01+.99*T.MathUtils.smoothstep(state.time,70,70.95));
  parcel.position.set(state.part.x,state.part.y+.04,state.part.z);parcel.rotation.y=logistics.outboundYaw-Math.PI;
  scan.visible=state.time>=12&&state.time<14;scan.position.y=1.55-state.receiving*.78;receivingScanMaterial.opacity=scan.visible?.24*Math.sin(state.receiving*Math.PI):0;
  const baths=tanks.map(tank=>factoryBathState(state.time,tank.index));
  const draining=baths.find(bath=>bath.draining);
  drainage.visible=!!draining;drainMaterial.opacity=dark?.7:.65;
  if(draining){for(let i=0;i<48;i++){
   const emission=draining.exit+i*.035,age=state.time-emission;
   const origin=factoryProcessPosition(emission);
   const y=origin.y-factoryBathGeometry.partHalfHeight-.12*age-2.8*age*age;
   const visible=age>=0&&age<.55&&emission<draining.emissionEnd&&y>factoryBathGeometry.surface;
   drainPositions[i*3]=origin.x+((i*17%47)/47-.5)*.44;
   drainPositions[i*3+1]=visible?y:-100;
   drainPositions[i*3+2]=origin.z+((i*7%43)/43-.5)*.025;
  }drainGeometry.attributes.position.needsUpdate=true;}
  wetPart.color.copy(polished.color).lerp(coatColor,T.MathUtils.smoothstep(state.time,41,50));wetPart.roughness=.2-Math.max(...baths.map(bath=>bath.wetness))*.11;
  gripJaws.forEach((jaw,i)=>jaw.position.x=(i===0?-1:1)*(.24+.07*(1-attach)));
  const wheelAngle=-factoryRunningDistance(state.time)/(.13*.7);
  trolleyWheels.forEach(wheel=>{wheel.rotation.set(Math.PI/2,0,0);wheel.rotateY(wheelAngle);});
  tanks.forEach(tank=>{const active=Math.abs(state.carrier.x-tank.g.position.x)<.05&&state.time>=24&&Math.abs(state.carrier.z-tank.g.position.z)<.05&&state.time<53;const bath=baths[tank.index];tank.water.uniforms.uTime.value=state.time;tank.water.uniforms.uDark.value=dark?1:0;tank.water.uniforms.uImpact.value=0;tank.water.uniforms.uContacts.value.fromArray(bath.ages);tank.volume.color.setHex(tank.index===3?0x4273ae:tank.index===1?palette.liquidCoat:palette.liquid);tank.lamp.setState(active?'active':state.carrier.x>tank.g.position.x||state.time>=51?'complete':'idle');});links.forEach(l=>l.line.visible=selected!==null&&(l.a===selected||l.b===selected));
  reviewBeacon.visible=state.hold;attention.emissiveIntensity=state.scanning?.8:.55;
  // Semantic relations are static on selection; all moving packets now use routed digital channels.
  const followingTransfer=(state.time>=17&&state.time<24)||(state.time>=58&&state.time<61.5)||(state.time>=67&&state.time<70.3);
  const processing=state.time>=24&&state.time<58;
  const chosen=selected?operatingAnchor(selected,state):(followingTransfer||processing)?state.part:null;
  const focus=selected==='order'?[0,1,0]:chosen?[chosen.x,chosen.y,chosen.z]:state.chapter===0?[0,1,0]:state.chapter===1?[-10.5,1,4.3]:operatingEntities[[0,1,3,4,5,6][state.chapter]].position;
  const phone=canvas.clientWidth<600;
  const aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight),shot=factoryCameraShot(state,phone,aspect);
  const directed=!overview&&!selected;
  if(directed)target.fromArray(shot.target);
  else if(overview||selected==='order')target.set(-5,1.1,0);
  else target.set(focus[0],1,focus[2]);
  look.lerp(target,follow);
  const desiredSpan=overview?factoryOverviewSpan(aspect):directed?shot.span:selected==='quality'?6.2:15;
  viewSpan=T.MathUtils.lerp(viewSpan,desiredSpan,follow);
  camera.left=-viewSpan*aspect/2;camera.right=viewSpan*aspect/2;camera.top=viewSpan/2;camera.bottom=-viewSpan/2;
  cameraOffset.lerp(directed?shotOffset.fromArray(shot.offset):overviewOffset,follow);
  camera.position.copy(look).add(cameraOffset);camera.lookAt(look);camera.updateProjectionMatrix();renderer.render(scene,camera);
  host.dataset.cameraShot=directed?shot.phase:overview?'overview':'selected';
  host.dataset.cameraTarget=look.toArray().map(n=>n.toFixed(4)).join(',');
  host.dataset.cameraOffset=cameraOffset.toArray().map(n=>n.toFixed(4)).join(',');
  const width=canvas.clientWidth,height=canvas.clientHeight,occupied:{x:number;y:number;width:number;height:number}[]=[];
  const artBox=canvas.getBoundingClientRect();host.querySelectorAll<HTMLElement>('.operating-overview').forEach(control=>{const b=control.getBoundingClientRect();occupied.push({x:b.left-artBox.left-8,y:b.top-artBox.top-8,width:b.width+16,height:b.height+16});});
  const partBox=new T.Box3().setFromObject(inspected),corners=[] as T.Vector3[];for(let i=0;i<8;i++)corners.push(new T.Vector3(i&1?partBox.max.x:partBox.min.x,i&2?partBox.max.y:partBox.min.y,i&4?partBox.max.z:partBox.min.z).project(camera));const xs=corners.map(v=>(v.x*.5+.5)*width),ys=corners.map(v=>(-v.y*.5+.5)*height);if(inspected.visible)occupied.push({x:Math.min(...xs)-16,y:Math.min(...ys)-16,width:Math.max(...xs)-Math.min(...xs)+32,height:Math.max(...ys)-Math.min(...ys)+32});
  if(state.time>=51.2&&state.time<54){
   const crown=new T.Vector3(state.carrier.x,factoryLayout.railHeight+.45,state.carrier.z).project(camera);
   const cx=(crown.x*.5+.5)*width,cy=(.5-crown.y*.5)*height;
   const bottom=Math.max(...ys);
   occupied.push({x:Math.min(cx,...xs)-18,y:Math.min(cy,bottom)-12,width:Math.max(cx,...xs)-Math.min(cx,...xs)+36,height:Math.abs(bottom-cy)+24});
  }
  const active=selected??(processing?(state.hold?'observation':'operation'):followingTransfer?'lot':null)??operatingEntities[[0,1,3,4,5,6][state.chapter]].id;
  const ordered=[...operatingEntities].sort((a,b)=>Number(b.id===active)-Number(a.id===active));
  ordered.forEach(e=>{const anchor=operatingAnchor(e.id,state);const point=new T.Vector3(anchor.x,anchor.y,anchor.z).project(camera);const label=host.querySelector<HTMLElement>(`[data-entity-label="${e.id}"]`);if(!label)return;
   const relevant=e.id!=='order'&&state.time>=6&&(e.id===active||(overview&&!phone&&state.chain.includes(e.id as never)));const x=(point.x*.5+.5)*width,y=(-point.y*.5+.5)*height;
   label.hidden=!relevant;if(!relevant)return;const rect=placeOperatingLabel(x,y,label.offsetWidth||110,label.offsetHeight||36,{width,height},occupied,labelPositions.get(e.id));
   label.hidden=!rect;if(!rect)return;occupied.push(rect);labelPositions.set(e.id,rect);label.style.left=rect.x+'px';label.style.top=rect.y+'px';label.dataset.active=String(e.id===active);
   const leader=host.querySelector<SVGLineElement>(`[data-entity-leader="${e.id}"]`);if(leader){leader.setAttribute('x1',String(x));leader.setAttribute('y1',String(y));const port=operatingLabelPort(x,y,rect);leader.setAttribute('x2',String(port.x));leader.setAttribute('y2',String(port.y));leader.style.opacity='1';}
  });
  host.querySelectorAll<SVGLineElement>('[data-entity-leader]').forEach(line=>{const label=host.querySelector<HTMLElement>(`[data-entity-label="${line.dataset.entityLeader}"]`);if(label?.hidden)line.style.opacity='0';});

  const partScreen=inspected.position.clone().project(camera);
  host.dataset.partInFrame=String(Math.abs(partScreen.x)<.95&&Math.abs(partScreen.y)<.9);
  host.dataset.sceneState='live';host.dataset.carrierPosition=[state.carrier.x,state.carrier.z].map(n=>n.toFixed(4)).join(',');host.dataset.hold=String(state.hold);host.dataset.released=String(state.released);host.dataset.qualityPhase=state.qualityPhase;host.dataset.processStage=state.processStage;host.dataset.ovenActive=String(state.ovenActive);host.dataset.partPosition=[state.part.x,state.part.y,state.part.z].map(n=>n.toFixed(3)).join(',');
 }
 const resize=()=>{cameraSnap=true;renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);draw();};const observer=new ResizeObserver(resize);observer.observe(canvas);const theme=new MutationObserver(draw);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const click=(event:MouseEvent)=>{const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables)[0];if(hit)onPick(hit.object.userData.entity);};canvas.addEventListener('click',click);
 await renderer.compileAsync(scene,camera);resize();return {draw(next:ReturnType<typeof operatingState>,selection:OperatingEntity|null,all:boolean){if(Math.abs(next.time-state.time)>.35){cameraSnap=true;labelPositions.clear();}state=next;selected=selection;overview=all;draw();},dispose(){disposed=true;observer.disconnect();theme.disconnect();canvas.removeEventListener('click',click);resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
