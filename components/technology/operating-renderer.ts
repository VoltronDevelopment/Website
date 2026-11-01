import * as T from 'three';
import {placeOperatingLabel} from './operating-label-layout';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {alphaLineStations,alphaLinePath} from '../manufacturing/alpha-line-config';
import {createArtworkEnvironment,addArtworkSoftboxes} from '../brand/artwork-studio';
import {operatingEntities,operatingEdges,operatingState,operatingNumericActivity,operatingAnchor,handlingGeometry,type OperatingEntity} from './operating-model';
export async function mountOperatingScene(canvas:HTMLCanvasElement,host:HTMLElement,onPick:(id:OperatingEntity)=>void){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.setClearColor(0,0);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-18,18,13,-13,.1,150),environment=createArtworkEnvironment(renderer);scene.environment=environment.texture;addArtworkSoftboxes(scene);scene.add(new T.HemisphereLight(0xe9f5ff,0x183047,2));const sun=new T.DirectionalLight(0xffffff,3);sun.position.set(-10,18,12);scene.add(sun);
 const resources=new Set<{dispose:()=>void}>(),own=<R extends {dispose:()=>void}>(r:R)=>{resources.add(r);return r;};
 const pearl=own(new T.MeshStandardMaterial({color:0xdbe8f3,roughness:.3,metalness:.35})),navy=own(new T.MeshStandardMaterial({color:0x17354e,roughness:.28,metalness:.5})),metal=own(new T.MeshStandardMaterial({color:0xa0b9ca,roughness:.23,metalness:.8})),glass=own(new T.MeshPhysicalMaterial({color:0xa9d9ef,roughness:.16,metalness:.12,transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide})),cyan=own(new T.MeshStandardMaterial({color:0x2289bd,emissive:0x1278b5,emissiveIntensity:.7,roughness:.3}));
 const root=new T.Group();scene.add(root);const pickables:T.Object3D[]=[];
 function box(parent:T.Object3D,size:number[],pos:number[],mat:T.Material,r=.08){const mesh=new T.Mesh(own(new RoundedBoxGeometry(size[0],size[1],size[2],2,r)),mat);mesh.position.fromArray(pos);parent.add(mesh);return mesh;}
 function line(points:number[][],mat:T.Material,parent:T.Object3D=root){const g=own(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p as [number,number,number]))));const l=new T.Line(g,mat);parent.add(l);return l;}
 const routeMat=own(new T.LineBasicMaterial({color:0x52718a,transparent:true,opacity:.55})),semanticMat=own(new T.LineBasicMaterial({color:0x2e9acb,transparent:true,opacity:.65}));
 box(root,[28,.3,17],[0,-.5,0],glass,.14);box(root,[28,.12,17],[0,-.76,0],navy);
 const pad=(x:number,z:number,w:number,d:number)=>{box(root,[w,.2,d],[x,-.18,z],pearl);box(root,[w,.08,d],[x,-.31,z],navy);};
 pad(-9,3,4,4);pad(.5,-1,11,8);pad(10,1,3.5,4);pad(10,6,4,2.8);
 // A compact Alpha representation retains all fifteen positions and the established square-U layout.
 const tanks=alphaLineStations.map(s=>{const g=new T.Group();g.position.set(s.x*.42-4,0,s.z*.42-1);g.rotation.y=s.yaw;root.add(g);if(s.kind==='tank'){box(g,[1.12,.84,1.12],[0,.4,0],metal);box(g,[.94,.07,.94],[0,.84,0],navy);box(g,[.8,.025,.8],[0,.89,0],glass);box(g,[.13,.13,.13],[.45,.98,.45],cyan,.02);}else{box(g,[1.1,.22,1.1],[0,.1,0],navy);for(let i=0;i<5;i++)box(g,[.12,.1,.95],[-.4+i*.2,.26,0],metal,.03);}return g;});
 const path=alphaLinePath().map(s=>[s.x*.42-4,1.7,s.z*.42-1]);line(path,routeMat);for(const x of [-4,4.7]){box(root,[.09,2,.09],[x,.9,-3.9],metal);box(root,[.09,2,.09],[x,.9,1.9],metal);}
 const carrier=new T.Group();root.add(carrier);box(carrier,[1.05,.15,.85],[0,1.62,0],navy);const hangers=[box(carrier,[.07,.8,.07],[-.3,1.15,0],metal),box(carrier,[.07,.8,.07],[.3,1.15,0],metal)];const fixture=box(carrier,[.65,.08,.2],[0,.65,0],metal);
 function screen(x:number,z:number,w=2.4){const g=new T.Group();g.position.set(x,0,z);root.add(g);box(g,[w,1.9,.14],[0,1.3,0],navy);box(g,[w-.18,1.65,.04],[0,1.3,.1],glass);for(let i=0;i<3;i++)box(g,[w*.55,.045,.03],[-.2,1.7-i*.35,.14],i===0?cyan:metal,.01);box(g,[.12,.6,.12],[0,.2,0],metal);return g;}
 // Product views live in the reserved digital layer, leaving the factory floor clear.
 const attention=own(new T.MeshStandardMaterial({color:0x246bd4,emissive:0x1264bd,emissiveIntensity:.7})),reviewBeacon=box(root,[.2,.2,.2],[3.8,2.2,-5],attention,.03);
 const pallet=new T.Group();root.add(pallet);for(const z of [-.5,0,.5])box(pallet,[1.45,.04,.12],[0,.02,z],metal,.01);box(pallet,[1.5,.08,1.2],[0,.08,0],pearl,.02);
 const scanMaterial=own(new T.MeshBasicMaterial({color:0x39b5ed,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide}));
 const scanner=new T.Group();scanner.position.set(-8,0,3);root.add(scanner);box(scanner,[.13,2,.13],[0,1,0],metal);box(scanner,[1.8,.14,.2],[-.8,2,0],navy);const scan=box(scanner,[1.7,.025,1.4],[-.8,1.6,0],scanMaterial,.01);
 box(root,[1.9,.35,1.7],[10,.25,1.8],navy);box(root,[1.5,.15,3.2],[10,.64,2.5],metal);const inspected=box(root,[.65,.65,.09],[7,.9,1.8],pearl);const partFoot=box(root,[.8,.01,.3],[7,.725,1.8],metal,.005);const qualityGate=box(root,[.15,2,.15],[11.3,1,2.4],cyan);

 function vehicle(){
  const g=new T.Group();root.add(g);const wheels:T.Mesh[]=[],doors:T.Group[]=[];
  box(g,[3.1,.16,1.5],[.2,.4,0],metal);box(g,[2.35,.1,1.35],[-.2,.55,0],navy);
  const roof=box(g,[2.4,.08,1.42],[-.2,1.85,0],pearl);for(const z of [-.69,.69]){box(g,[2.4,1.25,.07],[-.2,1.2,z],pearl);for(let i=0;i<7;i++)box(g,[.025,1.08,.025],[-1.25+i*.33,1.2,z*1.03],metal,.01);}
  box(g,[.07,1.3,1.4],[1,1.2,0],pearl);box(g,[1.05,1.1,1.4],[1.65,1.02,0],navy);box(g,[.06,.5,1.16],[2.2,1.25,0],glass);
  for(const z of [-.71,.71]){box(g,[.7,.48,.035],[1.65,1.28,z],glass);box(g,[.3,.05,.025],[1.55,.93,z],metal,.01);box(g,[.18,.17,.15],[2.02,1.1,z*1.15],navy,.02);}
  box(g,[.12,.18,1.55],[2.24,.65,0],metal);box(g,[.1,.36,.7],[2.25,.91,0],navy,.02);for(const z of [-.52,.52])box(g,[.07,.13,.22],[2.26,.95,z],cyan,.02);
  for(const x of [-.9,.65,1.65])for(const z of [-.73,.73]){const wheel=new T.Mesh(own(new T.CylinderGeometry(.28,.28,.18,18)),navy);wheel.rotation.x=Math.PI/2;wheel.position.set(x,.32,z);g.add(wheel);wheels.push(wheel);const hub=new T.Mesh(own(new T.CylinderGeometry(.13,.13,.19,12)),metal);hub.rotation.x=Math.PI/2;hub.position.copy(wheel.position);g.add(hub);}
  for(const side of [-1,1]){const hinge=new T.Group();hinge.position.set(-1.42,1.2,side*.7);g.add(hinge);box(hinge,[.07,1.25,.69],[0,0,-side*.345],pearl,.025);box(hinge,[.04,.75,.025],[-.055,0,-side*.3],metal,.01);doors.push(hinge);}
  return {g,roof,wheels,doors,update(distance:number,open:number){wheels.forEach(w=>{w.rotation.set(Math.PI/2,0,0);w.rotateY(-distance/.28);});doors.forEach((door,i)=>door.rotation.y=(i===0?-1:1)*open*Math.PI*.62);}};
 }
 const inbound=vehicle(),outbound=vehicle();inbound.g.rotation.y=Math.PI;
 const reversing=box(inbound.g,[.06,.12,.25],[-1.49,.75,.49],own(new T.MeshBasicMaterial({color:0xe9f8ff})),.02);
 const dockBridge=box(root,[1.1,.12,1.4],[-10.025,.54,4.7],metal,.02);box(root,[2.4,.12,2.4],[-9,.1,3],navy);
 const parcel=box(root,[.9,.8,.8],[7,1.02,5.2],glass);box(root,[1.8,.015,1.5],[7,-.02,5.2],navy);

 function handler(){const g=new T.Group();root.add(g);box(g,[1.2,.6,.9],[0,.4,0],navy);box(g,[.15,1.8,.15],[.65,1,0],metal);const forks=new T.Group();g.add(forks);for(const z of [-.3,.3]){box(forks,[.9,handlingGeometry.forkThickness,.09],[1.05,0,z],metal);box(g,[.07,1.6,.07],[.45,1.1,z],metal);}box(g,[.7,.1,.9],[0,1.8,0],pearl);for(const x of [-.4,.4])for(const z of [-.47,.47]){const w=new T.Mesh(own(new T.CylinderGeometry(.2,.2,.12,12)),navy);w.rotation.x=Math.PI/2;w.position.set(x,.2,z);g.add(w);}return {g,forks};}
 const receiver=handler(),loader=handler();
 // Inspection enclosure, locating jaws and two perpendicular scan planes.
 for(const x of [9.05,10.95])for(const z of [.9,2.7])box(root,[.07,2.2,.07],[x,1,z],metal,.02);
 box(root,[2.05,.06,1.9],[10,2.12,1.8],glass);for(const x of [9.02,10.98])box(root,[.045,.06,1.9],[x,2.12,1.8],metal,.01);for(const z of [.87,2.73])box(root,[2.05,.06,.045],[10,2.12,z],metal,.01);box(root,[.035,1.6,1.8],[9.02,1.25,1.8],glass,.01);
 const jaws=[box(root,[.13,.22,.4],[9.4,.85,1.8],metal,.025),box(root,[.13,.22,.4],[10.6,.85,1.8],metal,.025)];
 const qualityBadge=box(root,[.4,.16,.12],[10,1.95,2.8],metal,.025);
 const inspectionVertical=box(root,[.025,1.1,1.4],[10,1.15,1.8],scanMaterial,.01);
 const dispatchScan=box(root,[.12,1.8,.12],[7.9,.9,5.2],metal,.025);
 for(const z of [-7.7,7.5]){line([[-13,-.28,z],[13,-.28,z]],routeMat);for(let x=-12;x<13;x+=2)box(root,[.7,.015,.04],[x,-.26,z],metal,.005);}
 [8.2,11.7].map(x=>box(root,[.12,.7,.12],[x,.2,4.8],metal,.03));
 const transferCart=new T.Group();root.add(transferCart);box(transferCart,[1.5,.12,1.2],[0,.655,0],metal);for(const x of [-.5,.5])for(const z of [-.45,.45])box(transferCart,[.06,.43,.06],[x,.4,z],metal,.01);for(const x of [-.5,.5])for(const z of [-.45,.45])box(transferCart,[.15,.18,.15],[x,.15,z],navy,.04);
 for(const z of [4.1,5.3])box(root,[.08,.62,.08],[-9.5,.23,z],metal,.015);
 const cartForks=new T.Group();transferCart.add(cartForks);for(const x of [-.3,.3])box(cartForks,[.08,.03,.9],[x,.7,-1.05],metal,.01);
 const inspectionPlane=box(root,[1.6,.02,1.2],[10,1.5,1.8],scanMaterial,.01);
 // A quiet relationship foundation activates only around the selected manufacturing identity.
 const links=operatingEdges.map(([a,b])=>{const from=operatingEntities.find(e=>e.id===a)!.position,to=operatingEntities.find(e=>e.id===b)!.position;return {a,b,line:line([[from[0],2.6,from[2]],[12.8,2.6,from[2]],[12.8,2.6,to[2]],[to[0],2.6,to[2]]],semanticMat)};});
 const signalGeometry=own(new T.SphereGeometry(.055,8,6));const signals=links.map(link=>{const bead=new T.Mesh(signalGeometry,cyan);root.add(bead);const positions=link.line.geometry.getAttribute('position');const points=Array.from({length:positions.count},(_,i)=>new T.Vector3().fromBufferAttribute(positions,i));return {bead,curve:new T.CurvePath<T.Vector3>(),points};});signals.forEach(signal=>{for(let i=1;i<signal.points.length;i++)signal.curve.add(new T.LineCurve3(signal.points[i-1],signal.points[i]));});
 operatingEntities.forEach(entity=>{const proxy=box(root,[2.6,2.6,2.6],[entity.position[0],1,entity.position[2]],own(new T.MeshBasicMaterial({visible:false})));proxy.userData.entity=entity.id;pickables.push(proxy);});
 const count=650,positions=new Float32Array(count*3);let seed=17;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*25;positions[i*3+1]=random()*2.5;positions[i*3+2]=(random()-.5)*15;}const pg=own(new T.BufferGeometry());pg.setAttribute('position',new T.BufferAttribute(positions,3));const pm=own(new T.PointsMaterial({color:0x54b9ec,size:.045,transparent:true,opacity:0,depthWrite:false}));const particles=new T.Points(pg,pm);root.add(particles);
 let viewSpan=20;let state=operatingState(0),selected:OperatingEntity|null=null,overview=true,disposed=false;const target=new T.Vector3(),look=new T.Vector3(),ray=new T.Raycaster(),pointer=new T.Vector2();
 function draw(){if(disposed)return;const dark=document.documentElement.dataset.theme==='dark';pearl.color.set(dark?0x7695b2:0xdbe8f3);navy.color.set(dark?0x122b42:0x254760);glass.opacity=dark?.23:.36;root.scale.setScalar(.97+.03*state.formation);pm.opacity=Math.max(0,1-state.formation)*.7;particles.visible=state.formation<1;

  dockBridge.visible=state.bridge>0;dockBridge.scale.x=Math.max(.001,state.bridge);dockBridge.position.x=-9.475-1.1*state.bridge/2;
  pallet.visible=state.time>=6&&state.time<24;pallet.position.set(state.part.x,state.palletY,state.part.z);
  receiver.g.visible=state.time>=11&&state.time<26;receiver.g.rotation.y=state.handlerYaw;receiver.g.position.set(state.part.x-Math.cos(state.handlerYaw)*1.05,0,state.part.z+Math.sin(state.handlerYaw)*1.05);receiver.forks.position.y=state.palletY+handlingGeometry.receiveForkOffset;
  if(state.time>=24){const p=Math.min(1,(state.time-24)/2);receiver.g.position.set(-5-p*3,0,-3.898);receiver.forks.position.y=.2;}
  carrier.position.set(state.carrier.x,0,state.carrier.z);carrier.visible=state.time>=24&&state.time<58;
  inspected.visible=state.time>=6;inspected.position.set(state.part.x,state.part.y,state.part.z);partFoot.visible=inspected.visible;partFoot.position.set(state.part.x,state.part.y-.33,state.part.z);fixture.position.y=state.part.y-.375;
  hangers.forEach(h=>{const bottom=state.part.y-.335,length=1.55-bottom;h.scale.y=length/.8;h.position.y=(1.55+bottom)/2;});
  transferCart.visible=state.time>=58&&state.time<73;transferCart.position.set(state.part.x,Math.min(0,state.part.y-1.055),state.part.z);if(state.time>=58&&state.time<59.4)transferCart.position.z=Math.max(3.1,state.part.z);if(state.time>=60.5&&state.time<68)transferCart.position.z=4.8;cartForks.visible=state.time>=58&&state.time<59.4;
  inspectionPlane.visible=state.scanning;inspectionVertical.visible=state.scanning;inspectionPlane.position.y=1.55-state.scanProgress*.8;inspectionVertical.position.x=9.55+state.scanProgress*.9;
  jaws.forEach((jaw,i)=>jaw.position.x=10+(i===0?-1:1)*(.6-.21*state.clamp));qualityBadge.material=state.released?cyan:state.scanning?attention:metal;qualityGate.material=state.released?cyan:metal;
  parcel.visible=state.time>=70;parcel.scale.setScalar(.01+.99*state.packing);parcel.position.set(state.part.x,1.02,state.part.z);
  inbound.g.position.set(state.incomingX,0,4.7);inbound.g.visible=state.time>=6&&state.time<22;inbound.update(-state.incomingX,state.doorOpen);inbound.roof.material=state.doorOpen>.1?glass:pearl;reversing.visible=state.time>=6&&state.time<10;
  outbound.g.position.set(state.outboundX,0,6);outbound.g.visible=state.time>=67;outbound.update(state.outboundX,state.outboundDoor);outbound.roof.material=state.outboundDoor>.1?glass:pearl;
  loader.g.visible=state.time>=72&&state.time<80;loader.g.rotation.y=0;loader.g.position.set(Math.min(state.part.x-1.05,7.2),0,state.part.z);loader.forks.position.y=handlingGeometry.dispatchForkHeight;loader.forks.scale.x=1+Math.max(0,state.part.x-8.25)/1.05;loader.forks.position.x=.6*(1-loader.forks.scale.x);
  if(state.time>=78){loader.g.position.x=7.2-(state.time-78)*1.3;loader.forks.scale.x=1;loader.forks.position.x=0;}
  scan.position.y=1.4-state.receiving*.8;scan.visible=state.time>=14.7&&state.time<16.5;
  tanks.forEach(tank=>tank.scale.y=1);links.forEach(l=>l.line.visible=selected!==null&&(l.a===selected||l.b===selected));
  reviewBeacon.visible=state.hold;attention.emissiveIntensity=state.scanning?.8:.55;
  // Semantic relations are static on selection; all moving packets now use routed digital channels.
  signals.forEach(signal=>signal.bead.visible=false);
  const followingTransfer=(state.time>=17&&state.time<24)||(state.time>=58&&state.time<61.5)||(state.time>=67&&state.time<70.3);
  const chosen=selected?operatingAnchor(selected,state):followingTransfer?state.part:null;
  const focus=selected==='order'?[0,1,0]:chosen?[chosen.x,chosen.y,chosen.z]:state.chapter===0?[0,1,0]:state.chapter===1?[-10.5,1,4.3]:operatingEntities[[0,1,3,4,5,6][state.chapter]].position;
  const phone=canvas.clientWidth<600,detail=state.time>=58||followingTransfer,focusScale=detail?1:(phone?.9:.65);target.set(overview||state.chapter===0||selected==='order'?0:focus[0]*focusScale,0,overview||state.chapter===0?0:focus[2]*(detail?1:(phone?.9:.6)));look.lerp(target,.09);const aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight),desiredSpan=overview||state.chapter===0?Math.max(19,29/aspect):(state.time>=61.5&&state.time<67?(phone?9:10):state.time>=67?12:phone?(state.chapter===1?19.5:15):state.chapter===1?14:18);viewSpan=T.MathUtils.lerp(viewSpan,desiredSpan,.09);const span=viewSpan;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.position.copy(look).add(new T.Vector3(22,25,30));camera.lookAt(look);camera.updateProjectionMatrix();renderer.render(scene,camera);
  const width=canvas.clientWidth,height=canvas.clientHeight,occupied:{x:number;y:number;width:number;height:number}[]=[];
  const active=selected??(followingTransfer?'lot':null)??operatingEntities[[0,1,3,4,5,6][state.chapter]].id;
  const ordered=[...operatingEntities].sort((a,b)=>Number(b.id===active)-Number(a.id===active));
  ordered.forEach(e=>{const anchor=operatingAnchor(e.id,state);const point=new T.Vector3(anchor.x,anchor.y,anchor.z).project(camera);const label=host.querySelector<HTMLElement>(`[data-entity-label="${e.id}"]`);if(!label)return;
   const relevant=e.id!=='order'&&(e.id===active||(!phone&&state.chain.includes(e.id as never)));const x=(point.x*.5+.5)*width,y=(-point.y*.5+.5)*height;
   label.hidden=!relevant;if(!relevant)return;const rect=placeOperatingLabel(x,y,label.offsetWidth||110,label.offsetHeight||36,{width,height},occupied);
   label.hidden=!rect;if(!rect)return;occupied.push(rect);label.style.left=rect.x+'px';label.style.top=rect.y+'px';label.dataset.active=String(e.id===active);
   const leader=host.querySelector<SVGLineElement>(`[data-entity-leader="${e.id}"]`);if(leader){leader.setAttribute('x1',String(x));leader.setAttribute('y1',String(y));leader.setAttribute('x2',String(rect.x+rect.width/2));leader.setAttribute('y2',String(rect.y+rect.height));leader.style.opacity='1';}
  });
  host.querySelectorAll<SVGLineElement>('[data-entity-leader]').forEach(line=>{const label=host.querySelector<HTMLElement>(`[data-entity-label="${line.dataset.entityLeader}"]`);if(label?.hidden)line.style.opacity='0';});

  const composite=host.querySelector<HTMLElement>('.operating-scene-composite');if(composite){const frame=composite.getBoundingClientRect(),art=canvas.getBoundingClientRect();
   host.querySelectorAll<SVGPathElement>('[data-product-route]').forEach(path=>{const signal=state.signals.find(signal=>signal.product===path.dataset.productRoute),card=host.querySelector<HTMLElement>(`[data-operating-product="${path.dataset.productRoute}"]`);path.style.opacity='0';if(!signal||signal.entity==='order'||!card||!card.getClientRects().length)return;
    const box=card.getBoundingClientRect(),inlet=card.querySelector('[data-digital-inlet]')?.getBoundingClientRect(),entity=operatingEntities.find(e=>e.id===signal.entity)!;const anchor=operatingAnchor(signal.entity,state);const point=new T.Vector3(anchor.x,anchor.y,anchor.z).project(camera);const x=(point.x*.5+.5)*width+art.left-frame.left,y=(-point.y*.5+.5)*height+art.top-frame.top,tx=inlet?inlet.left+inlet.width/2-frame.left:box.left+box.width/2-frame.left,ty=inlet?inlet.top+inlet.height/2-frame.top:box.bottom-frame.top,rail=box.bottom-frame.top+18;const lane=frame.width-(24+['SCADA','V-MES','V-MO','V-Twin','V-AI'].indexOf(signal.product)*8);
    path.setAttribute('d',`M ${x} ${y} H ${lane} V ${rail} H ${tx} V ${ty}`);path.setAttribute('pathLength','100');const arrival=Math.min(1,state.eventProgress/.3);path.style.strokeDashoffset=String(-arrival*97);path.style.opacity=String(Math.sin(arrival*Math.PI)*.7);
   });}
  const partScreen=inspected.position.clone().project(camera);host.dataset.partInFrame=String(Math.abs(partScreen.x)<.95&&Math.abs(partScreen.y)<.9);const numeric=operatingNumericActivity(state);host.querySelectorAll<HTMLElement>('.operating-numeric-column').forEach((column,i)=>{column.style.transform=`translateY(${-((numeric.phase/6+i*.23)%1)*50}%)`;});host.dataset.sceneState='live';host.dataset.carrierPosition=[state.carrier.x,state.carrier.z].map(n=>n.toFixed(4)).join(',');host.dataset.hold=String(state.hold);host.dataset.released=String(state.released);host.dataset.qualityPhase=state.qualityPhase;host.dataset.partPosition=[state.part.x,state.part.y,state.part.z].map(n=>n.toFixed(3)).join(',');
 }
 const resize=()=>{renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);draw();};const observer=new ResizeObserver(resize);observer.observe(canvas);const theme=new MutationObserver(draw);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 const click=(event:MouseEvent)=>{const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables)[0];if(hit)onPick(hit.object.userData.entity);};canvas.addEventListener('click',click);
 await renderer.compileAsync(scene,camera);resize();return {draw(next:ReturnType<typeof operatingState>,selection:OperatingEntity|null,all:boolean){state=next;selected=selection;overview=all;draw();},dispose(){disposed=true;observer.disconnect();theme.disconnect();canvas.removeEventListener('click',click);resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
