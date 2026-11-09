import {factoryLogistics,logisticsLayout} from './factory-logistics';
export const factoryLayout={wetLineZ:-4.998,returnLineZ:2.498,ovenX:2,ovenScale:.74,ovenLengthScale:.83,ovenLoadHeight:1.975,railHeight:4.32} as const;
/** Shared dimensions for the rendered part, oven slot and inspection contacts. */
export const factoryMechanicalGeometry={
 partScale:.52,partWidth:.94,partHeight:1.26,partDepth:.075,partBevel:.016,
 ovenFloorCenter:2.05,ovenFloorThickness:.18,ovenRoofCenter:3.25,ovenRoofThickness:.16,
 ovenDoorX:3.15,ovenDoorThickness:.1,ovenGuideSlot:.36,ovenRoofSlot:.35,
 hangerOffset:.084,hangerThickness:.018,
 jawWidth:.13,jawOpenCenter:.6,jawContactGap:.005,
} as const;
export const inspectionJawClosedCenter=(factoryMechanicalGeometry.partWidth/2+factoryMechanicalGeometry.partBevel)*factoryMechanicalGeometry.partScale+factoryMechanicalGeometry.jawWidth/2+factoryMechanicalGeometry.jawContactGap;
export const OPERATING_DURATION=90;
export const operatingChapters=[
 {title:'Unload',time:0,text:'At Dock 01 the lift collects the incoming pallet for order 042.'},
 {title:'Stage',time:10.8,text:'The rack scanner identifies batch 017. V MES enrols the lot and calls it to the loading bay.'},
 {title:'Execute',time:24,text:'Production, equipment observations and the process view advance together.'},
 {title:'Review',time:41,text:'A station condition pauses this lot. Connected evidence supports human review.'},
 {title:'Inspect',time:58,text:'After the authorised review and curing cycle, the inspection booth records the measurement. V MES releases the lot for packing.'},
 {title:'Dispatch',time:67,text:'The released lot is packed and dispatched against its original customer order.'},
] as const;
export const operatingEntities=[
 {id:'order',title:'Customer order',position:[-9,1,-5],record:'Order / Demo 042',detail:'The order specifies the part revision, requested quantity and required delivery. Business systems retain commercial and planning responsibility.'},
 {id:'material',title:'Material & receiving',position:[logisticsLayout.rack.x,1,logisticsLayout.rack.z],record:'Material batch / Demo 017',detail:'Receiving records material identity and incoming evidence. Allocation connects that batch to the customer order and production lot.'},
 {id:'lot',title:'Production lot',position:[-4,1,2],record:'Production lot / Demo 003',detail:'One lot identity carries the material, carrier, route, execution history, inspection and shipment relationships.'},
 {id:'operation',title:'Treatment & oven',position:[1,1,-1],record:'Factory / Four treatment stations + camelback oven',detail:'V MES records execution. V SCADA supplies station observations. V Twin represents the derived situation. Physical control remains with the defined control systems.'},
 {id:'observation',title:'Condition & review',position:[5,1,-5],record:'CED T04 / Review record',detail:'An observation connects the station, operation, lot and requirement. V AI prepares an investigation and proposed hold; an authorised person records the disposition.'},
 {id:'quality',title:'Quality & release',position:[-4,1,factoryLayout.returnLineZ],record:'Inspection / Release evidence',detail:'Inspection evidence is attached to the same lot. Dispatch is permitted in this story only after the authorised review and quality release are recorded.'},
 {id:'shipment',title:'Packing & dispatch',position:[logisticsLayout.dock.x,1,logisticsLayout.dock.z],record:'Dock 01 / Shipment 042',detail:'Packing and shipment preserve the link to the released lot, quality evidence and original customer order.'},
] as const;
export type OperatingEntity=typeof operatingEntities[number]['id'];
export const operatingEdges=[['order','material'],['order','lot'],['material','lot'],['lot','operation'],['operation','observation'],['observation','quality'],['lot','quality'],['quality','shipment'],['shipment','order']] as const;
export const operatingChains=[['order','lot'],['order','material','lot'],['lot','operation'],['operation','observation','quality'],['observation','quality','lot'],['quality','shipment','order']] as const;

export const operatingProducts=['SCADA','V-MES','V-MO','V-Twin','V-AI'] as const;
export type OperatingProduct=typeof operatingProducts[number];

export const operatingEvents:[number,OperatingEntity,OperatingProduct[],string][]=[
 [2,'order',['V-MO'],'Order and route linked'],[12,'material',['SCADA','V-MO'],'Rack scan linked to batch 017'],[15,'material',['V-MO','V-MES'],'Lot enrolled in V MES'],[16,'lot',['V-MES'],'Production call sent to the loading bay'],[24,'lot',['V-MES','V-Twin','V-MO'],'Fixture loaded; operation started'],[29,'operation',['SCADA','V-Twin','V-MO'],'Station observation recorded'],[41,'observation',['SCADA','V-MO','V-AI'],'Condition requires investigation'],[44,'observation',['V-AI','V-MO'],'Supporting evidence connected'],[50,'observation',['V-MO','V-MES'],'Authorised review recorded'],[65,'quality',['V-MO','V-MES'],'Stationary inspection completed'],[66,'quality',['V-MO','V-MES'],'Quality release recorded'],[72,'shipment',['V-MES','V-MO'],'Package identified for shipment'],[87,'shipment',['V-MO','V-MES'],'Shipment linked to customer order'],
];
export const operatingTimes={load:24,hold:41,review:50,inspection:58,scan:62,result:65,release:66,packing:67,depart:82,dispatched:87} as const;
export const handlingGeometry={forkThickness:.02,receiveForkOffset:.03,dispatchForkHeight:.61,cargoFloor:.6,palletDeckUnderside:.04} as const;
export const mesMilestones=[0,3,6,10,14] as const;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};
export type OperatingPoint={x:number;y:number;z:number};
/** Only authored through-points blend velocity; operation/turn/axis-change stops stay explicit. */
function travel(time:number,points:readonly (readonly [number,number,number,number])[],through:readonly number[]=[]):OperatingPoint{
 const tangent=(i:number,axis:number)=>{
  if(i===0||i===points.length-1||!through.includes(points[i][0]))return 0;
  const a=points[i-1],b=points[i],c=points[i+1],u=(b[axis]-a[axis])/(b[0]-a[0]),v=(c[axis]-b[axis])/(c[0]-b[0]);
  return u*v>0?2*u*v/(u+v):0;
 };
 let a=points[0];for(let i=1;i<points.length;i++){const b=points[i];if(time<=b[0]){
  const t=clamp((time-a[0])/(b[0]-a[0])),dt=b[0]-a[0],t2=t*t,t3=t2*t;
  const coordinate=(axis:number)=>a[axis]===b[axis]?a[axis]:t===0?a[axis]:t===1?b[axis]:(2*t3-3*t2+1)*a[axis]+(t3-2*t2+t)*dt*tangent(i-1,axis)+(-2*t3+3*t2)*b[axis]+(t3-t2)*dt*tangent(i,axis);
  return {x:coordinate(1),y:coordinate(2),z:coordinate(3)};
 }a=b;}return {x:a[1],y:a[2],z:a[3]};
}
export const factoryThroughPoints=[53.05,57.05] as const;
export function factoryProcessPosition(time:number){return travel(time,FACTORY_PROCESS_PATH,factoryThroughPoints);}
/** Independent overview route; the detailed Alpha line retains its own thirteen tanks. */
export const factoryStations=[
 {id:'LOAD',x:-4,z:factoryLayout.wetLineZ,kind:'load'},
 {id:'T01',x:-1,z:factoryLayout.wetLineZ,kind:'tank'},
 {id:'T02',x:2,z:factoryLayout.wetLineZ,kind:'tank'},
 {id:'T03',x:5,z:factoryLayout.wetLineZ,kind:'tank'},
 {id:'T04',x:8,z:-1.25,kind:'tank'},
 {id:'OVEN',x:factoryLayout.ovenX,z:factoryLayout.returnLineZ,kind:'oven'},
 {id:'OUT',x:-4,z:factoryLayout.returnLineZ,kind:'unload'},
] as const;
export const FACTORY_PROCESS_PATH:readonly (readonly [number,number,number,number])[]=[
 [24,-4,1.055,factoryLayout.wetLineZ],[25,-4,2.3,factoryLayout.wetLineZ],[26,-1,2.3,factoryLayout.wetLineZ],
 [27,-1,.9,factoryLayout.wetLineZ],[28.5,-1,.9,factoryLayout.wetLineZ],[29.7,-1,2.3,factoryLayout.wetLineZ],[30,-1,2.3,factoryLayout.wetLineZ],
 [31,2,2.3,factoryLayout.wetLineZ],[32,2,.9,factoryLayout.wetLineZ],[34,2,.9,factoryLayout.wetLineZ],[35.6,2,2.3,factoryLayout.wetLineZ],[36,2,2.3,factoryLayout.wetLineZ],
 [37,5,2.3,factoryLayout.wetLineZ],[37.45,5,.9,factoryLayout.wetLineZ],[38,5,.9,factoryLayout.wetLineZ],[38.55,5,2.3,factoryLayout.wetLineZ],[38.65,5,2.3,factoryLayout.wetLineZ],[39.4,8,2.3,factoryLayout.wetLineZ],[39.9,8,2.3,factoryLayout.wetLineZ],
 [40.6,8,2.3,-1.25],[41,8,.9,-1.25],[50,8,.9,-1.25],[50.9,8,2.3,-1.25],[51.2,8,2.3,-1.25],[52.3,8,2.3,factoryLayout.returnLineZ],[52.8,8,2.3,factoryLayout.returnLineZ],[53.05,5.8,1.94,factoryLayout.returnLineZ],[53.5,factoryLayout.ovenX,factoryLayout.ovenLoadHeight,factoryLayout.returnLineZ],
 [56.5,factoryLayout.ovenX,factoryLayout.ovenLoadHeight,factoryLayout.returnLineZ],[57.05,-1.8,factoryLayout.ovenLoadHeight,factoryLayout.returnLineZ],[57.36,-4,factoryLayout.ovenLoadHeight,factoryLayout.returnLineZ],[57.48,-4,factoryLayout.ovenLoadHeight,factoryLayout.returnLineZ],[58,-4,1.055,factoryLayout.returnLineZ],
];
/** Horizontal running distance excludes hoisting and stationary indexing; reversible on seek. */
export function factoryRunningDistance(time:number){
 let distance=0;
 for(let i=1;i<FACTORY_PROCESS_PATH.length;i++){
  const a=FACTORY_PROCESS_PATH[i-1],b=FACTORY_PROCESS_PATH[i];
  
  const p=factoryProcessPosition(Math.min(b[0],Math.max(a[0],time)));
  distance+=Math.hypot(p.x-a[1],p.z-a[3]);
 }
 return distance;
}
export function operatingState(input:number){
 const time=Math.max(0,Math.min(OPERATING_DURATION,Number.isFinite(input)?input:0));
 const chapter=operatingChapters.reduce((found,c,i)=>time>=c.time?i:found,0);
 const hold=time>=41&&time<50,reviewed=time>=50,released=time>=66;
 const routeIndex=travel(time,[[24,0,0,0],[25,0,0,0],[26,3,0,0],[30,3,0,0],[31,6,0,0],[36,6,0,0],[37,10,0,0],[51,10,0,0],[53.5,12,0,0],[56.5,12,0,0],[58,14,0,0]]).x;
 // Authored transfers separate lifting, horizontal travel and immersion.
 const process=factoryProcessPosition(time);
 const carrierX=process.x,carrierZ=process.z;
 const ovenDoor=1-smooth((time-53.5)/.5)+smooth((time-56)/.5);
 const ovenActive=time>=54&&time<56;
 const ovenEntryOpen=smooth((time-52.5)/.3)-smooth((time-53.5)/.4),ovenExitOpen=smooth((time-56)/.4)-smooth((time-57.5)/.4);
 const logistics=factoryLogistics(time);
 const depart=smooth((time-82)/5);
 const part=time<24?logistics.receiving:time<58?process:logistics.outgoing;
 const event=operatingEvents.filter(e=>e[0]<=time).at(-1),eventProgress=event?clamp((time-event[0])/2):1;
 const signals=event&&time<event[0]+2?event[2].map(product=>({product,entity:event[1],progress:eventProgress})):[];
 const qualityPhase=time<58?'Waiting for lot':time<61.5?'Positioning':time<62?'Fixture clamping':time<65?'Inspection in progress':time<66?'Evidence recorded':time<67?'Released':'Ready for next lot';
 const scanning=time>=62&&time<65;
 return {time,chapter,hold,reviewed,released,dispatched:time>=87,routeIndex,carrier:{x:carrierX,z:carrierZ},railProgress:routeIndex,carrierYaw:-Math.PI/2*smooth((time-39.4)/.5)-Math.PI/2*smooth((time-52.3)/.5),ovenDoor,ovenEntryOpen,ovenExitOpen,ovenActive,processStage:time<3?'Dock 01':time<11.45?'Dock to rack':time<16?'Receiving rack':time<24?'Rack to loading bay':time<30?'Tank 01':time<36?'Tank 02':time<38.65?'Tank 03':time<40.6?'Transfer to CED':time<51.2?'CED · T04':time<53.5?'Oven infeed':time<56.5?'Curing oven':time<58?'Transfer to quality':time<67?'Inspection':'Dispatch',part,logistics,
  palletY:part.y-.455,depart,
  chain:operatingChains[chapter],receiving:clamp((time-12)/2),dispatch:depart,signals,eventText:event?.[3]??'Preparing manufacturing context',eventProgress,qualityPhase,scanning,scanProgress:clamp((time-62)/3),clamp:smooth((time-61.5)/.5)-smooth((time-66.5)/.5),
  lotStatus:time<3?'Order linked':time<11.45?'Unloading':time<15?'Staged in rack':time<16?'Enrolled in MES':time<24?'Called to line':hold?'Awaiting review':time<58?'In production':!released?qualityPhase:time<67?'Released':time<87?'Packing & loading':'Dispatched',
  products:{'V-MO':true,'V-MES':time>=15&&time<87,'SCADA':time>=24&&time<58,'V-Twin':time>=24&&time<58,'V-AI':time>=41&&time<50},
 };
}
/** Actual event emitters: scanners, current fixture and quality booth, never abstract label positions. */
export function operatingAnchor(id:OperatingEntity,state:ReturnType<typeof operatingState>):OperatingPoint{
 if(id==='material')return {...logisticsLayout.rack,y:1.65};
 if(id==='lot')return {x:state.part.x,y:state.part.y+.5,z:state.part.z};
 if(id==='operation')return {...state.carrier,y:1.7};
 if(id==='observation')return {x:8,y:2.1,z:-1.25};
 if(id==='quality')return {x:-4,y:2.25,z:factoryLayout.returnLineZ+1};
 if(id==='shipment')return {...logisticsLayout.dock,y:1.4};
 return {x:-9,y:2,z:-5};
}
/** Scene time stays canonical; only tank travel is compressed during automatic playback. */
export function operatingPlaybackRate(time:number){
 if(time>=17.6&&time<24)return .55;
 if(time>=71&&time<79)return .72;
 if(time>=41&&time<50)return 2.25;
 if(time>=38&&time<41)return .6;
 if(time>=50&&time<58)return time>=53.5&&time<56.5?1:.48;
 return time>=24&&time<38?2:1;
}
export function advanceOperatingClock(time:number,delta:number){
 let current=Math.max(0,Math.min(OPERATING_DURATION,time)),remaining=Math.max(0,Math.min(.1,delta));
 for(const boundary of [17.6,24,38,41,50,53.5,56.5,58,71,79,OPERATING_DURATION]){if(current>=boundary)continue;const rate=operatingPlaybackRate(current),needed=(boundary-current)/rate;if(remaining<needed)return current+remaining*rate;current=boundary;remaining-=needed;if(remaining<=0)break;}
 return Math.min(OPERATING_DURATION,current);
}
