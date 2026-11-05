"use client";
import {useId,useRef,useState} from 'react';
import {DetailsDialog} from '../brand/DetailsDialog';
import {alphaLineDemo} from './alpha-line-config';
import type {AlphaLineState} from './alpha-line-timeline';
import {alphaEvidenceFocus} from './alpha-evidence-model';

/** Every record is derived from the visible plant clock, including backward seeks. */
export function AlphaEvidence({state}:{state:AlphaLineState}){
 const [selected,setSelected]=useState<number|null>(null),trigger=useRef<HTMLButtonElement|null>(null),id=useId();
 const started=state.chapter!=='route'&&state.phase!=='overview';
 const records=[
  {title:'Lot',value:alphaLineDemo.lot,ready:started,text:'One identity connects the component, carrier and configured production route.'},
  {title:'Operation',value:started?state.stationId:'Route assigned',ready:started&&state.stationId!=='LOAD',text:'The current physical operation stays linked to the same lot as it travels through the plant.'},
  {title:'Process record',value:state.processingComplete?'History connected':started?'History accumulating':'Awaiting operations',ready:state.processingComplete||started&&state.stationId.startsWith('T'),text:'The route history accumulates with each operation. This illustration does not contain live plant measurements.'},
  {title:'Quality evidence',value:'Review pending',ready:state.processingComplete,text:'Process completion does not release the lot. Inspection evidence and an authorised disposition remain separate.'},
 ];
 const active=alphaEvidenceFocus(state),record=selected===null?null:records[selected];
 return <section className="alpha-evidence-story" aria-labelledby={`${id}-title`}>
  <div className="section-intro"><p className="eyebrow">Connected evidence</p><h2 id={`${id}-title`}>The part moves. Its context stays connected.</h2><p>Inspect the records belonging to the lot above.</p></div>
  <ol className="alpha-record-chain">{records.map((r,i)=><li key={r.title} data-ready={r.ready} data-active={active===i}><button type="button" aria-haspopup="dialog" aria-current={active===i?'step':undefined} onClick={e=>{trigger.current=e.currentTarget;setSelected(i);}}><span className="alpha-record-index">0{i+1}</span><strong>{r.title}</strong><span>{r.value}</span><small>{i===3?'Release pending':r.ready?'Connected':'Pending'}</small></button></li>)}</ol>
  <DetailsDialog open={record!==null} onClose={()=>setSelected(null)} trigger={trigger} id={`${id}-dialog`} labelledBy={`${id}-record`} label="Lot record"><h2 id={`${id}-record`}>{record?.title}</h2><p>{record?.value}</p><p>{record?.text}</p></DetailsDialog>
 </section>;
}
