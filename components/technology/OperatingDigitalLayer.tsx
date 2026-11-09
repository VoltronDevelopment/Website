"use client";
import {ArrowUpRight,ChevronDown} from 'lucide-react';
import {productLabel} from '@/lib/product-names';
import {lastFactoryEvent,operatingEntities,operatingProducts,type OperatingEntity,type OperatingProduct,type operatingState} from './operating-model';

type CardProps={
 state:ReturnType<typeof operatingState>;
 manual:OperatingProduct|null;
 onSelect:(product:OperatingProduct)=>void;
 onInspect:(entity:OperatingEntity,trigger:HTMLElement,event:string)=>void;
};
const appSequence:readonly [number,OperatingProduct][]=[
 [0,'V-MO'],[12,'SCADA'],[15,'V-MES'],[29,'SCADA'],[36,'V-Twin'],[41,'V-AI'],
 [50,'V-MES'],[53,'V-Twin'],[62,'SCADA'],[65,'V-MES'],[87,'V-MO'],
];

export function OperatingDigitalLayer({state,manual,onSelect,onInspect}:CardProps){
 const [,owner]=appSequence.reduce((active,entry)=>entry[0]<=state.time?entry:active,appSequence[0]);
 const product=manual??owner;
 const record=lastFactoryEvent(state.time,product);
 const entity=operatingEntities.find(item=>item.id===record?.[1]);
 const exchange=state.exchange;
 const route=exchange?.[4];
 const progress=exchange?Math.min(1,(state.time-exchange[0])/1.4):1;
 return <aside className="factory-console" aria-label="Factory app record">
  <article className="factory-moment" data-operating-product={product}>
   <header><label className="factory-app-choice">
    <select aria-label="Choose factory app" value={product} onChange={e=>onSelect(e.target.value as OperatingProduct)}>
     {operatingProducts.map(app=><option key={app} value={app}>{productLabel[app]}</option>)}
    </select><ChevronDown aria-hidden="true" size={14}/>
   </label></header>
   <h3>{record?.[3]??'Preparing order'}</h3>
   {entity&&record&&<button className="factory-record-link" onClick={e=>onInspect(entity.id,e.currentTarget,record[3])} aria-label={'Inspect '+entity.record}>
    {entity.record}<ArrowUpRight size={14} aria-hidden="true"/>
   </button>}
   <footer aria-label="Last confirmed Edge exchange">
    {route&&<span className="factory-route">{route.from} → V Edge → {route.to}</span>}
    <div className="factory-digits" aria-hidden="true"><div style={{transform:`translateX(-${(state.time%8)/8*50}%)`}}>
     {[0,1].map(copy=><span key={copy}>{'042  003  0110  071  018  1010  024  001  '.repeat(4)}</span>)}
    </div></div>
    {route&&progress<1&&<small className="factory-record-pulse">{route.record}</small>}
   </footer>
  </article>
 </aside>;
}
