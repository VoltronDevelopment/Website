export const voltronRoadmap=[
 {years:'Years 1–2',span:[1,2],title:'Prove the process.',detail:'Repeatable quality, traceability and safe practice take hold in Alpha.',gate:'Process and quality discipline are demonstrated.',evidence:['Repeatable results','Measurement discipline','Lot traceability','Safe practice']},
 {years:'Years 3–4',span:[3,4],title:'Connect what works.',detail:'Production, quality and machine records connect across proven methods.',gate:'Methods travel and plants run independently.',evidence:['Connected records','Machine signals','Reusable methods','Independent plants']},
 {years:'Year 5',span:[5,5],title:'Earn quality readiness.',detail:'Proven capability and qualified quality open original product work.',gate:'A customer problem and a credible build path exist.',evidence:['Process repeatability','Inspection evidence','Requirement traceability','Customer qualification']},
 {years:'Years 6–7',span:[6,7],title:'Compete globally.',detail:'Selected products reach markets with dependable quality and support.',gate:'Validation, readiness and service all hold.',evidence:['Customer validation','Product quality','Support readiness','Market readiness']},
 {years:'Years 8–10',span:[8,10],title:'Establish the brand.',detail:'Original products, quality and lifecycle support earn lasting trust.',gate:'Repeat demand and support justify more growth.',evidence:['Repeat demand','Sustained quality','Original capability','Lifecycle support']}
] as const;
export const roadmapYears=Array.from({length:10},(_,i)=>i+1);
export function roadmapPhaseForYear(year:number){return voltronRoadmap.findIndex(m=>year>=m.span[0]&&year<=m.span[1]);}

/** A single two-by-two-by-two capability volume persists inside the future network. */
export function roadmapVisualState(phase:number){
 const index=Math.max(0,Math.min(4,Math.floor(Number.isFinite(phase)?phase:0)));
 const count=[1,4,8,8,8][index];
 return {count,envelope:index>=3,global:index===4,cells:Array.from({length:count},(_,i)=>count===1?[0,0,0]:[(i&1?1:-1)*.41,count===4?-.41:(i&4?1:-1)*.41,(i&2?1:-1)*.41])};
}
