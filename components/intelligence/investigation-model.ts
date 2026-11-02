import {alphaLineDemo} from '../manufacturing/alpha-line-config';
export const investigation = {lot:alphaLineDemo.lot,part:alphaLineDemo.part,station:'Tank 06',observation:'Condition outside the configured window',status:'Awaiting human review'};
export const specialists = [
 {name:'KAVO',role:'Operator',character:'Broad, steady folds',question:'Which checks apply before the next operation?',action:'Locate the applicable work instruction and station checks.',records:['Current operation','Work instruction'],shape:'bands'},
 {name:'RIXA',role:'Quality',character:'Fine, converging contours',question:'Which inspection records support this lot?',action:'Compare inspection evidence with the applicable requirement.',records:['Inspection record','Calibration record'],shape:'scan'},
 {name:'MEKO',role:'Maintenance',character:'Deep, weighted circulation',question:'What equipment history is relevant?',action:'Bring the station history beside the condition event.',records:['Equipment history','Condition event'],shape:'rings'},
 {name:'ZILO',role:'Process',character:'Long, coordinated streams',question:'What changed between these process histories?',action:'Compare the recorded conditions around the affected operation.',records:['Process history','Operation window'],shape:'ribbons'},
 {name:'SARO',role:'Evidence',character:'An inward gathering current',question:'Which records belong to this manufacturing situation?',action:'Gather attributable records around the same lot and operation.',records:['Source + revision','Part + lot identity'],shape:'vortex'},
 {name:'TEYO',role:'Fault Investigation',character:'Interacting, reconnecting eddies',question:'What evidence distinguishes the possible causes?',action:'Organise supported possibilities and the next checks to review.',records:['Supported possibility','Open question'],shape:'branches'},
] as const;
export const investigationChapters = [
 {title:'Identify',agents:[0],description:'KAVO establishes the current operation and applicable checks.',result:'Operation + work instruction'},
 {title:'Gather',agents:[4],description:'SARO gathers the records associated with the same lot.',result:'Attributable evidence bundle'},
 {title:'Compare',agents:[3,2],description:'ZILO compares process history while MEKO examines equipment history.',result:'Two perspectives, shared evidence'},
 {title:'Assess',agents:[1],description:'RIXA relates inspection evidence to its requirement and calibration record.',result:'Inspection context retained'},
 {title:'Investigate',agents:[5],description:'TEYO organises supported possibilities and unanswered questions.',result:'Proposed next check'},
 {title:'Human review',agents:[],description:'The responsible person reviews the proposed check and its supporting records.',result:'Awaiting human review'},
];
export const evidenceSources = [
 ['SCADA evidence','Process readings retain their equipment identity and operation time window.'],
 ['Inspection','Inspection results stay connected to their method and applicable requirement.'],
 ['Calibration','The instrument record stays beside the measurement it supports.'],
 ['NCR & CAPA','Affected lots retain their nonconformance and corrective-action relationships.'],
 ['PDF & Excel','Existing documents retain their source and revision in the evidence bundle.'],
 ['Lab report','Findings remain linked to the sample, part and lot they describe.'],
 ['Certificate','Issuer, scope and relevant lot remain attributable.'],
 ['Manual input','Human observations retain their author, time and manufacturing context.'],
] as const;
export function investigationChapter(progress:number){return Math.min(5,Math.max(0,Math.floor((Number.isFinite(progress)?progress:0)*6)));}
