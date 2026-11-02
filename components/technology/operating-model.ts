import {alphaLineDemo,alphaLineStations} from '../manufacturing/alpha-line-config';
export const OPERATING_DURATION=90;
export const operatingChapters=[
 {title:'Order',time:0,text:'Customer demand connects to the part, revision and planned route.'},
 {title:'Receive',time:6,text:'Incoming material is identified and allocated to the same manufacturing lot.'},
 {title:'Execute',time:24,text:'Production, equipment observations and the process view advance together.'},
 {title:'Review',time:41,text:'A station condition pauses this lot. Connected evidence supports human review.'},
 {title:'Release',time:50,text:'An authorised review resolves the hold. Processing and inspection complete before release.'},
 {title:'Dispatch',time:67,text:'The released lot is packed and dispatched against its original customer order.'},
] as const;
export const operatingEntities=[
 {id:'order',title:'Customer order',position:[-9,1,-5],record:'Order / Demo 042',detail:'The order specifies the part revision, requested quantity and required delivery. Business systems retain commercial and planning responsibility.'},
 {id:'material',title:'Material & receiving',position:[-9,1,3],record:'Material batch / Demo 017',detail:'Receiving records material identity and incoming evidence. Allocation connects that batch to the customer order and production lot.'},
 {id:'lot',title:'Production lot',position:[-4,1,2],record:alphaLineDemo.lot,detail:'One lot identity carries the material, carrier, route, execution history, inspection and shipment relationships.'},
 {id:'operation',title:'Alpha operation',position:[1,1,-1],record:'Alpha / Tanks 01–13',detail:'V-MES records execution. SCADA supplies station observations. V-Twin represents the derived situation. Physical control remains with the defined control systems.'},
 {id:'observation',title:'Condition & review',position:[5,1,-5],record:'Station T06 / Review record',detail:'An observation connects the station, operation, lot and requirement. V-AI prepares an investigation and proposed hold; an authorised person records the disposition.'},
 {id:'quality',title:'Quality & release',position:[10,1,1.8],record:'Inspection / Release evidence',detail:'Inspection evidence is attached to the same lot. Dispatch is permitted in this story only after the authorised review and quality release are recorded.'},
 {id:'shipment',title:'Packing & dispatch',position:[7,1,5.2],record:'Shipment / Demo 042',detail:'Packing and shipment preserve the link to the released lot, quality evidence and original customer order.'},
] as const;
export type OperatingEntity=typeof operatingEntities[number]['id'];
export const operatingEdges=[['order','material'],['order','lot'],['material','lot'],['lot','operation'],['operation','observation'],['observation','quality'],['lot','quality'],['quality','shipment'],['shipment','order']] as const;
export const operatingChains=[['order','lot'],['order','material','lot'],['lot','operation'],['operation','observation','quality'],['observation','quality','lot'],['quality','shipment','order']] as const;

export const operatingProducts=['SCADA','V-MES','V-MO','V-Twin','V-AI'] as const;
export type OperatingProduct=typeof operatingProducts[number];

export const operatingEvents:[number,OperatingEntity,OperatingProduct[],string][]=[
 [2,'order',['V-MO'],'Order and route linked'],[15,'material',['V-MO','V-MES'],'Material identified and allocated'],[24,'lot',['V-MES','V-Twin','V-MO'],'Fixture loaded; operation started'],[29,'operation',['SCADA','V-Twin','V-MO'],'Station observation recorded'],[41,'observation',['SCADA','V-MO','V-AI'],'Condition requires investigation'],[44,'observation',['V-AI','V-MO'],'Supporting evidence connected'],[50,'observation',['V-MO','V-MES'],'Authorised review recorded'],[65,'quality',['V-MO','V-MES'],'Stationary inspection completed'],[66,'quality',['V-MO','V-MES'],'Quality release recorded'],[72,'shipment',['V-MES','V-MO'],'Package identified for shipment'],[87,'shipment',['V-MO','V-MES'],'Shipment linked to customer order'],
];
export const operatingTimes={load:24,hold:41,review:50,inspection:58,scan:62,result:65,release:66,packing:67,depart:82,dispatched:87} as const;
export const handlingGeometry={forkThickness:.02,receiveForkOffset:.03,dispatchForkHeight:.61,cargoFloor:.6,palletDeckUnderside:.04} as const;
export const receivingBridgeBounds={minX:-10.575,maxX:-9.475,top:.6,cargoRear:-10.625};
export const mesMilestones=[0,3,6,10,14] as const;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};
export type OperatingPoint={x:number;y:number;z:number};
function travel(time:number,points:readonly (readonly [number,number,number,number])[]):OperatingPoint{
 let a=points[0];for(let i=1;i<points.length;i++){const b=points[i];if(time<=b[0]){const f=smooth((time-a[0])/(b[0]-a[0]));return {x:a[1]+(b[1]-a[1])*f,y:a[2]+(b[2]-a[2])*f,z:a[3]+(b[3]-a[3])*f};}a=b;}return {x:a[1],y:a[2],z:a[3]};
}
export function operatingState(input:number){
 const time=Math.max(0,Math.min(OPERATING_DURATION,Number.isFinite(input)?input:0));
 const chapter=operatingChapters.reduce((found,c,i)=>time>=c.time?i:found,0);
 const hold=time>=41&&time<50,reviewed=time>=50,released=time>=66;
 const routeIndex=time<24?0:time<41?(time-24)/17*6:time<50?6:6+clamp((time-50)/8)*8;
 const left=Math.floor(routeIndex),right=Math.min(14,left+1),f=routeIndex-left,a=alphaLineStations[left],b=alphaLineStations[right];
 const moving=smooth((f-.35)/.6),bend=a.x!==b.x&&a.z!==b.z;
 // Follow the actual outer rail: X then Z at the far corner, Z then X on return.
 const first=smooth(moving/.3),second=smooth((moving-.7)/.3),xFirst=b.x>a.x;
 const xTravel=bend?(xFirst?first:second):moving,zTravel=bend?(xFirst?second:first):moving;
 const carrierX=(a.x+(b.x-a.x)*xTravel)*.42-4,carrierZ=(a.z+(b.z-a.z)*zTravel)*.42-1;
 const incomingX=-19+smooth((time-6)/4)*7-smooth((time-18)/4)*8;
 const depart=smooth((time-82)/5),outboundX=16-smooth((time-67)/3)*6+depart*7;
 const receiving=travel(time,[[10,-10.6,1.055,4.7],[11,-10.6,1.055,4.7],[14,-9,1.055,3],[14.7,-9,.475,3],[16.5,-9,.475,3],[17.3,-9,1.055,3],[18,-9,1.055,3],[20,-6,1.055,3],[22,-6,1.055,-3.898],[24,-4,1.055,-3.898]]);
 const postProcess=travel(time,[[58,-4,1.055,1.898],[59,-4,1.055,3.5],[60,8,1.055,3.5],[60.4,8,1.055,4.8],[60.8,10,1.055,4.8],[61.5,10,1.055,1.8],[67,10,1.055,1.8],[68,10,1.055,4.8],[69,7,1.055,4.8],[69.6,7,1.055,5.2],[70.3,7,.955,5.2],[73,7,.955,5.2],[75,7,.955,6],[78,9.6,.955,6],[82,9.6,.955,6],[87,16.6,.955,6]]);
 const part=time<10?{x:incomingX+1.4,y:1.055,z:4.7}:time<24?receiving:time<58?{x:carrierX,y:1.055-(hold?0:Math.sin(Math.PI*clamp(f/.35))*.3),z:carrierZ}:postProcess;
 const event=operatingEvents.filter(e=>e[0]<=time).at(-1),eventProgress=event?clamp((time-event[0])/2):1;
 const signals=event&&time<event[0]+2?event[2].map(product=>({product,entity:event[1],progress:eventProgress})):[];
 const handlerYaw=Math.PI*(1-smooth((time-17.3)/.7))+Math.PI/2*smooth((time-19.7)/.6)-Math.PI/2*smooth((time-21.7)/.6);
 const qualityPhase=time<58?'Waiting for lot':time<61.5?'Positioning':time<62?'Fixture clamping':time<65?'Inspection in progress':time<66?'Evidence recorded':time<67?'Released':'Ready for next lot';
 const scanning=time>=62&&time<65;
 return {time,chapter,hold,reviewed,released,dispatched:time>=87,routeIndex,carrier:{x:carrierX,z:carrierZ},railProgress:left+(bend?(first+second)/2:moving),part,incomingX,handlerYaw,outboundX,
  palletY:part.y-.455,bridge:smooth(time-10)-smooth(time-16),doorOpen:smooth(time-10)-smooth(time-17),outboundDoor:smooth(time-70)-smooth(time-80),depart,
  chain:operatingChains[chapter],receiving:clamp((time-14.7)/1.8),packing:smooth((time-70.3)/1.7),dispatch:depart,formation:clamp(time/3),signals,eventText:event?.[3]??'Preparing manufacturing context',eventProgress,qualityPhase,scanning,scanProgress:clamp((time-62)/3),clamp:smooth((time-61.5)/.5)-smooth((time-66.5)/.5),
  lotStatus:time<6?'Order linked':time<15?'Receiving material':time<24?'Material allocated':hold?'Awaiting review':time<58?'In production':!released?qualityPhase:time<67?'Released':time<87?'Packing & loading':'Dispatched',
  products:{'V-MO':true,'V-MES':time>=15&&time<87,'SCADA':time>=24&&time<58,'V-Twin':time>=24&&time<58,'V-AI':time>=41&&time<50},
 };
}
/** Actual event emitters: scanners, current fixture and quality booth, never abstract label positions. */
export function operatingAnchor(id:OperatingEntity,state:ReturnType<typeof operatingState>):OperatingPoint{
 if(id==='material')return {x:-8.8,y:1.9,z:3};
 if(id==='lot')return {x:state.part.x,y:state.part.y+.5,z:state.part.z};
 if(id==='operation')return {...state.carrier,y:1.7};
 if(id==='observation')return {x:4.694,y:1.2,z:-2.449};
 if(id==='quality')return {x:10,y:2.25,z:2.8};
 if(id==='shipment')return {x:7,y:1.6,z:5.2};
 return {x:-9,y:2,z:-5};
}
/** Scene time stays canonical; only tank travel is compressed during automatic playback. */
export function operatingPlaybackRate(time:number){return (time>=24&&time<41)||(time>=50&&time<58)?2:1;}
export function advanceOperatingClock(time:number,delta:number){
 let current=Math.max(0,Math.min(OPERATING_DURATION,time)),remaining=Math.max(0,Math.min(.1,delta));
 for(const boundary of [24,41,50,58,OPERATING_DURATION]){if(current>=boundary)continue;const rate=operatingPlaybackRate(current),needed=(boundary-current)/rate;if(remaining<needed)return current+remaining*rate;current=boundary;remaining-=needed;if(remaining<=0)break;}
 return Math.min(OPERATING_DURATION,current);
}
/** Short, illustrative record digits; never a fabricated process measurement. */
export function operatingNumericActivity(state:ReturnType<typeof operatingState>){
 const time=state.time;
 if(time<2||time>=89)return {opacity:0,columns:['','',''],phase:0};
 const fade=Math.max(0,Math.min(1,(time-2)/.6,(89-time)/.6));
 const columns=time<6?['042001','001010','010042']:time<24?['017042','003017','042003']:state.hold?['060301','000003','010010']:time<58?['013003','042006','003013']:time<67?['130301','000003','010101']:['042003','017042','010101'];
 return {opacity:fade*.8,columns,phase:time-2};
}
