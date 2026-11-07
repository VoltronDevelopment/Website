import {productLabel} from '@/lib/product-names';
import {alphaLineDemo,alphaLineDeviationId} from '../manufacturing/alpha-line-config';
export const productNames=Object.values(productLabel);
export const scenarioStages=['Identify lot','Record operation','Observe condition','Connect evidence','Prepare review'] as const;
export function productScenario(step:number){
 const stage=Math.max(0,Math.min(4,Math.floor(Number.isFinite(step)?step:0)));
 return {stage,lot:alphaLineDemo.lot,carrier:alphaLineDemo.carrier,part:alphaLineDemo.part,station:alphaLineDeviationId,attention:stage>=2,linked:stage>=3,review:stage>=4,reading:[.42,.53,.86,.86,.86][stage],limit:.75};
}
export const scenarioEvents=['Lot and route identified','Operation started at Tank 06','Condition outside configured window','Measurement linked to lot and requirement','Proposed hold ready for human review'];
export const graphRecords=[
 {id:'lot',label:'Lot',record:alphaLineDemo.lot,x:45,y:45,detail:'One identity carries the production history across systems.'},
 {id:'part',label:'Part',record:alphaLineDemo.part,x:12,y:18,detail:'The same panel remains attached to this lot and its route.'},
 {id:'material',label:'Material',record:'Material record',x:12,y:73,detail:'Material identity and incoming evidence belong to the part record.'},
 {id:'route',label:'Route',record:'Alpha · Tanks 01–13',x:45,y:12,detail:'The configured sequence defines the expected operations.'},
 {id:'operation',label:'Operation',record:'Tank 06',x:76,y:32,detail:'The current operation links the carrier to the selected station.'},
 {id:'equipment',label:'Equipment',record:'Station T06',x:86,y:8,detail:'Station signals have an equipment identity and an operation time window.'},
 {id:'requirement',label:'Requirement',record:'Demonstration window',x:76,y:60,detail:'The illustrative comparison window is attached to this operation.'},
 {id:'evidence',label:'Evidence',record:'Condition event',x:45,y:85,detail:'The observation, its requirement and its lot can be investigated together.'},
] as const;
export const graphLinks=[['lot','part','contains'],['part','material','uses'],['lot','route','follows'],['lot','operation','records'],['operation','equipment','performed on'],['operation','requirement','requires'],['lot','evidence','verified by'],['evidence','requirement','compares with']] as const;
