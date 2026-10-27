export const voltronRoadmap=[
 {years:'Years 1–2',span:[1,2],title:'Prove the process.',detail:'Establish repeatable process quality, traceability and safe operating practice in Alpha.',gate:'Demonstrated process and quality discipline.',evidence:['Repeatable process results','Measurement discipline','Traceability of the lot','Safe operating practice']},
 {years:'Years 3–4',span:[3,4],title:'Connect what works.',detail:'Connect production, quality and machine records. Carry proven methods into more processes and plants.',gate:'Reusable methods and independently operable deployments.',evidence:['Connected production and quality records','Machine signals beside the work','Reusable methods','Independently operable deployments']},
 {years:'Year 5',span:[5,5],title:'Earn quality readiness. Begin OEM development.',detail:'Consolidate repeatable process capability, connected intelligence and customer-qualified quality. Begin an original product engineering programme.',gate:'A validated customer problem and a credible design, test and manufacturing path.',evidence:['Repeatability of the process','Measurement and inspection evidence','Traceability from requirement to lot','Customer qualification of the work']},
 {years:'Years 6–7',span:[6,7],title:'Compete globally.',detail:'Bring selected original products towards global markets with dependable quality and customer support.',gate:'Customer validation, product readiness and reliable service.',evidence:['Customer validation','Reliable product quality','Support capability','Selected market readiness']},
 {years:'Years 8–10',span:[8,10],title:'Establish a global brand.',detail:'Earn lasting trust through original capability, sustained product quality and lifecycle support.',gate:'Repeat demand and dependable support justify further growth.',evidence:['Repeat demand','Sustained product quality','Original capability','Dependable lifecycle support']}
] as const;
export const roadmapYears=Array.from({length:10},(_,i)=>i+1);
export function roadmapPhaseForYear(year:number){return voltronRoadmap.findIndex(m=>year>=m.span[0]&&year<=m.span[1]);}

/** A single two-by-two-by-two capability volume persists inside the future network. */
export function roadmapVisualState(phase:number){
 const index=Math.max(0,Math.min(4,Math.floor(Number.isFinite(phase)?phase:0)));
 const count=[1,4,8,8,8][index];
 return {count,envelope:index>=3,global:index===4,cells:Array.from({length:count},(_,i)=>count===1?[0,0,0]:[(i&1?1:-1)*.41,count===4?-.41:(i&4?1:-1)*.41,(i&2?1:-1)*.41])};
}
