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
 const selected=selection??0;
 const configuration=selection!==undefined?1:smooth(8.9,10.3,t);
 const extension=smooth(5.5,6.9,t),descent=smooth(7,8.5,t);
 return {extension,descent,time:t,core:smooth(0,1,t),packs:processPacks.map((_,i)=>smooth(1.2+i*.62,2.7+i*.62,t)),selected,configuration,detailsReady:selection!==undefined||t>=10.3,stage:t<1?0:t<8.9?1:2,complete:t>=MODULARITY_DURATION};
}
/** A direct choice continues from the displayed deposition/docking pose rather than restarting it. */
export function modularitySelectionFrame(from:ReturnType<typeof modularityFrame>,to:ReturnType<typeof modularityFrame>,progress:number){
 const p=smooth(0,1,progress),mix=(a:number,b:number)=>a+(b-a)*p;
 const physical=modularityFrame(mix(from.time,to.time)),configuration=physical.descent>=1?mix(from.configuration,to.configuration):0;
 return {...physical,selected:to.selected,configuration,detailsReady:progress>=1&&to.detailsReady,stage:configuration>0?2:physical.stage,complete:progress>=1&&to.complete};
}
