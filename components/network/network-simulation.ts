import {cubeIntroDuration,cubeTransfer} from './cube-layout';
import {smooth} from './network-story';
export type Point=[number,number,number];
/** A complete booth sweep, with zero velocity at both limits and no modulo reset. */
export function inspectionSweep(time:number){
 const progress=Math.max(0,Math.min(1,(time-13)/2));
 return {height:1+.85*(.5-.5*Math.cos(progress*Math.PI*2)),strength:Math.sin(progress*Math.PI)};
}
export function receivingDoorOpen(time:number){return smooth((time-5.15)/.3)*(1-smooth((time-7)/.2));}
/** Withdraw along the bore before lifting; seat the structure before inserting hardware. */
export function engineeringAssembly(time:number){
 const away=(start:number,duration:number,returnStart:number,returnDuration:number)=>smooth((time-start)/duration)*(1-smooth((time-returnStart)/returnDuration));
 return {base:.55*away(5.8,1.2,12,.6),upright:1.7*away(5.2,1.5,12.6,.8),collarLift:1.7*away(5.2,1.5,12.6,.8),collarAxial:2*away(4,.9,13.4,.7),bolts:2.8*away(4,1,14.1,.9)};
}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*smooth(t);
export function routePoint(points:Point[],progress:number):Point{
 const lengths=points.slice(1).map((p,i)=>Math.hypot(...p.map((v,j)=>v-points[i][j]))),total=lengths.reduce((a,b)=>a+b,0);let distance=Math.max(0,Math.min(1,progress))*total;
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const t=lengths[i]?distance/lengths[i]:0;return points[i].map((v,j)=>v+(points[i+1][j]-v)*t) as Point;}distance-=lengths[i];}return points[0];
}
/** Distance along the receiving aisle, eased only at pickup and delivery.
 * The reverse quarter-circle starts after the pallet clears the truck doors. */
export function receivingForkPath(time:number){
 const radius=.96,straight=5-radius,arc=radius*Math.PI/2;
 const distance=(straight+arc+2.1-radius)*smooth((time-5.9)/2.1);
 const angle=Math.max(0,Math.min(Math.PI/2,(distance-straight)/radius));
 return {x:-4.5+radius*(1-Math.cos(angle))+Math.max(0,distance-straight-arc),
  z:3.2-Math.min(distance,straight)-radius*Math.sin(angle),yaw:Math.PI-angle,distance};
}
/** One component position and support owner, evaluated identically for playback and seeks. */
export function productionState(time:number){
 let part:Point=[-4.5,.805,7.2],support='truck',phase='Receiving';const truckZ=8.5-4*smooth((time-4)/1.4)+4*smooth((time-7.2)/1);
 part[2]=truckZ-1.3;
 if(time>=5.5){support='forks';phase='Transfer';part=[-4.5,lerp(.805,1.12,(time-5.5)/.4),3.2];}
 // Pull straight back through the open rear doors before crossing the aisle.
 if(time>=5.9&&time<8){const path=receivingForkPath(time);part[0]=path.x;part[2]=path.z;}
 if(time>=8){support='fixture';phase='Travel';part=[lerp(-2.4,.9,(time-8.35)/.65),lerp(1.12,1.7,(time-8)/.35),-1.8];}
 if(time>=9){phase='Lower';part=[.9,lerp(1.7,.55,(time-9)/.4),-1.8];}
 if(time>=9.4){phase='Dwell';part=[.9,.55,-1.8];}
 if(time>=10){phase='Raise';part=[.9,lerp(.55,1.7,(time-10)/.4),-1.8];}
 if(time>=10.4){phase='Drain';part=[.9,1.7,-1.8];}
 if(time>=10.8){phase='Travel';part=[lerp(.9,4.2,(time-10.8)/.7),1.7,-1.8];}
 if(time>=11.5){phase='Set down';part=[4.2,lerp(1.7,1.175,(time-11.5)/.5),-1.8];}
 if(time>=12){support='rollers';phase='Inspection transfer';part=routePoint([[4.2,1.175,-1.8],[3.4,1.175,-1.8],[3.4,1.175,1]],smooth((time-12)/1));}
 if(time>=13){part=[3.4,1.175,1];phase=time<15?'Inspect':'Inspection recorded';}
 if(time>=15){support='rollers';phase='Finished goods transfer';part=routePoint([[3.4,1.175,1],[4.3,1.175,1],[4.3,1.175,3.2]],smooth((time-15)/.7));}
 if(time>=15.7){support='receiving support';phase='Release pending';part=[4.3,lerp(1.175,.665,(time-15.7)/.3),3.2];}
 return {part,support,phase,truckZ,scan:time>=13&&time<15,record:time>=15,reviewPending:true};
}
export function ownedBathContact(rising:boolean){
 let lo=rising?10:9,hi=lo+.4;
 for(let i=0;i<24;i++){
  const mid=(lo+hi)/2;
  if((productionState(mid).part[1]-.325<.79)===rising)lo=mid;else hi=mid;
 }
 return (lo+hi)/2;
}
export function networkStatus(kind:string,time:number){if(kind==='owned')return productionState(time).phase;if(kind==='learning'){
 if(time<1.65)return 'Individual excellence';
 if(time<4.85)return 'Factories forming';
 if(time<cubeIntroDuration)return 'Glass faces forming';
 const transfer=cubeTransfer(time-cubeIntroDuration);
 if(transfer.arrived)return 'Signal received';
 if(transfer.first===0)return 'Source port active';
 if(transfer.first===1&&transfer.last===0)return 'Relay port active';
 return 'Signal in transit';
 }if(kind==='partnership')return time<4?'Site preparation':time<8?'Structure assembly':time<12?'Building enclosure':time<16?'Equipment installation':time<20?'Systems connection':'Completed facility';return time<4?'Requirement drawing':time<8?'Interface requirements':time<12?'Component comparison':'Connected concept study';}
