export const configurationPosition=[.86,.86,.86] as const;
export const modularityCells=[[-.86,-.86,.86],[.86,-.86,.86],[-.86,-.86,-.86],[.86,-.86,-.86],[-.86,.86,-.86],[.86,.86,-.86]] as const;
export const processPacks = [
 {id:'machining',title:'Machining',summary:'Connect the part, operation and dimensional evidence.',operations:'Operation sequence, tools and setup context.',equipment:'Machine identity, tooling and workholding.',evidence:'Dimensional checks and operation records.'},
 {id:'forming',title:'Forming',summary:'Carry material and tooling context through each forming operation.',operations:'Forming stages and material requirements.',equipment:'Press, die and tooling relationships.',evidence:'Material, process and inspection records.'},
 {id:'casting',title:'Casting',summary:'Relate material batches, moulds and process evidence.',operations:'Casting stages and batch relationships.',equipment:'Mould, tooling and equipment context.',evidence:'Batch traceability and quality checks.'},
 {id:'additive',title:'Additive manufacturing',summary:'Keep the build, machine and inspection context together.',operations:'Build preparation and process steps.',equipment:'Build platform, machine and material context.',evidence:'Build records and inspection evidence.'},
 {id:'surface',title:'Surface treatment',summary:'Connect preparation, treatment and verification for each lot.',operations:'Preparation, treatment and verification stages.',equipment:'Line, station and process-resource mapping.',evidence:'Treatment records and quality evidence.'},
] as const;
export const MODULARITY_DURATION=11.5;
const smooth=(a:number,b:number,t:number)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*(3-2*p);};
/** The same surface deposition as Connected Lot; no travelling particle-wave field. */
export function modularityFrame(time:number,selection?:number){
 const t=Math.max(0,Math.min(MODULARITY_DURATION,Number.isFinite(time)?time:0));
 const selected=selection??(t>=8.5?1:0);
 const configuration=selection!==undefined?1:t<8.5?smooth(5.2,6.8,t)*(1-smooth(7.7,8.5,t)):smooth(8.5,10.3,t);
 return {time:t,core:smooth(0,1.6,t),packs:processPacks.map((_,i)=>smooth(1.2+i*.62,2.7+i*.62,t)),selected,configuration,stage:t<1.6?0:t<5.2?1:2,complete:t>=MODULARITY_DURATION};
}
