/** Absolute scenario time makes pause, stepping and replay reproducible. */
export const scenarioDuration=28;
export const tasks=[
 {start:0,end:4,result:'Operation and work instruction identified'},
 {start:17,end:23,result:'Inspection and calibration associated'},
 {start:8,end:17,result:'Station history compared; cause remains unconfirmed'},
 {start:8,end:15,result:'Process event located in the operation window'},
 {start:4,end:8,result:'Process, inspection and equipment records gathered'},
 {start:23,end:28,result:'Suggested check assembled for human review'},
] as const;
export const scenarioEvents=[
 {at:0,text:'Lot observation received',from:-1,to:0},
 {at:4,text:'KAVO requests attributable evidence',from:0,to:4},
 {at:8,text:'SARO shares process and equipment records',from:4,to:3},
 {at:8,text:'Equipment comparison starts in parallel',from:4,to:2},
 {at:15,text:'ZILO attaches the process comparison',from:3,to:1},
 {at:17,text:'MEKO attaches the station history',from:2,to:1},
 {at:23,text:'RIXA supplies inspection context to TEYO',from:1,to:5},
 {at:28,text:'Suggested check ready; human review pending',from:5,to:-1},
] as const;
export function advanceScenario(time:number,delta:number,delayed:boolean,supplied:boolean){
 const limit=delayed&&!supplied?18:scenarioDuration;
 return Math.min(limit,Math.max(0,time+Math.max(0,Number.isFinite(delta)?delta:0)));
}
export function taskState(index:number,time:number,delayed=false,supplied=false){
 const task=tasks[index],progress=Math.min(1,Math.max(0,(time-task.start)/(task.end-task.start)));
 const waiting=index===1&&delayed&&!supplied&&time>=18;
 return {progress,status:waiting?'Waiting for calibration':progress===1?'Complete':time>=task.start?'Examining evidence':'Queued',active:time>=task.start&&progress<1&&!waiting};
}
