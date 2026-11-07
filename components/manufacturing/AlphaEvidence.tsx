"use client";
import {alphaLineDemo} from './alpha-line-config';
import type {AlphaLineState} from './alpha-line-timeline';
import {alphaEvidenceFocus} from './alpha-evidence-model';

/** Every record is derived from the visible plant clock, including backward seeks. */
export function AlphaEvidence({state}:{state:AlphaLineState}){
 const started=state.chapter!=='route'&&state.phase!=='overview';
 const records=[
  {title:'Lot',value:alphaLineDemo.lot,text:'One identity connects the component, carrier and configured production route.'},
  {title:'Operation',value:started?state.stationId:'Route assigned',text:'The current physical operation stays linked to the same lot as it travels through the plant.'},
  {title:'Process record',value:state.processingComplete?'History connected':started?'History accumulating':'Awaiting operations',text:'The route history accumulates with each operation. This illustration does not contain live plant measurements.'},
  {title:'Quality evidence',value:'Review pending',text:'Process completion does not release the lot. Inspection evidence and an authorised disposition remain separate.'},
 ];
 const active=alphaEvidenceFocus(state);
 return <ol className="alpha-record-list" aria-label="Connected lot evidence">
  {records.map((record,index)=>
   <li key={record.title} aria-current={active===index?'step':undefined}>
    <details>
     <summary><strong>{record.title}</strong><span>{record.value}</span></summary>
     <p>{record.text}</p>
    </details>
   </li>
  )}
 </ol>;
}
