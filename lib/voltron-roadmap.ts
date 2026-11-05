export const voltronRoadmap=[
 {years:'Years 1–2',span:[1,2],title:'Prove the process.',detail:'Repeatable quality, traceability and safe practice take hold in Alpha.',gate:'Process and quality discipline are demonstrated.',evidence:['Repeatable results','Measurement discipline','Lot traceability','Safe practice']},
 {years:'Years 3–4',span:[3,4],title:'Connect what works.',detail:'Production, quality and machine records connect across proven methods.',gate:'Methods travel and plants run independently.',evidence:['Connected records','Machine signals','Reusable methods','Independent plants']},
 {years:'Year 5',span:[5,5],title:'Develop OEM capability.',detail:'Target original product development on a foundation of proven processes, connected intelligence and qualified quality.',gate:'A customer problem and a credible build path exist.',evidence:['Process repeatability','Inspection evidence','Requirement traceability','Customer qualification']},
 {years:'Years 6–7',span:[6,7],title:'Compete globally.',detail:'Selected products reach markets with dependable quality and support.',gate:'Validation, readiness and service all hold.',evidence:['Customer validation','Product quality','Support readiness','Market readiness']},
 {years:'Years 8–10',span:[8,10],title:'Establish the brand.',detail:'Original products, quality and lifecycle support earn lasting trust.',gate:'Repeat demand and support justify more growth.',evidence:['Repeat demand','Sustained quality','Original capability','Lifecycle support']}
] as const;
export const roadmapYears=Array.from({length:10},(_,i)=>i+1);
export const roadmapCellTone=(index:number):'light'|'dark'=>((index&1)^((index>>1)&1)^((index>>2)&1))===0?'light':'dark';
export function roadmapPhaseForYear(year:number){return voltronRoadmap.findIndex(m=>year>=m.span[0]&&year<=m.span[1]);}

/** Qualitative capability growth, not a quantitative business forecast. */
export function roadmapAscentPose(index:number){const i=Math.max(0,Math.min(4,Number.isFinite(index)?index:0));const size=.48+i*.28;return {x:0,y:.08+size/2,size};}
