"use client";
import {productLabel} from '@/lib/product-names';
import {useId,useState,type CSSProperties} from 'react';
import {operatingProducts,type OperatingProduct,operatingState} from './operating-model';
import {factoryStations} from './operating-model';
import {twinPoint,digitalGraphState,graphEase,scadaTraceValue} from './digital-graph-model';
const labels:Record<OperatingProduct,string>={'V-MO':'Shared manufacturing context','V-MES':'Execution history','SCADA':'Equipment observations','V-Twin':'Derived process state','V-AI':'Evidence and review'};
import {meaningBlocks as vmoNodes,meaningConnections as vmoEdges,evidenceRows,incomingEvidence,outgoingEvidence,investigationPorts as ports} from './screen-diagrams';
type ConsoleProps={state:ReturnType<typeof operatingState>;onInspect:(product:OperatingProduct,trigger:HTMLElement)=>void};
const appSequence:readonly [number,OperatingProduct][]=[
 [0,'V-MO'],[12,'SCADA'],[15,'V-MES'],[29,'SCADA'],[36,'V-Twin'],[41,'V-AI'],
 [50,'V-MES'],[53,'V-Twin'],[62,'SCADA'],[65,'V-MES'],[87,'V-MO'],
];
export function OperatingDigitalLayer(props:ConsoleProps){
 const [start,owner]=appSequence.reduce((active,entry)=>entry[0]<=props.state.time?entry:active,appSequence[0]);
 return <FactoryConsole key={start} {...props} owner={owner}/>;
}
function FactoryConsole({state,onInspect,owner}:ConsoleProps&{owner:OperatingProduct}){
 const graphId=useId(),t=state.time;
 const [product,setProduct]=useState<OperatingProduct>(owner);
 const outbound=t>=16&&t<18||t>=66&&t<68;
 const endpoint=t<11.45?'Dock 01':t<16?'Rack scanner':t<24?'Loading bay':t<58?'Line PLC':t<67?'Inspection':'Dock scanner';
 const packet=state.signals.some(signal=>signal.product===product)&&t>=12;
 const id=t<16?'017':t<67?'003':'042';
   const graph=digitalGraphState(state,product),signaling=graph.age>=.48&&graph.age<1.95;
   const edge=graph.eventTime===2||graph.eventTime===15?0:graph.eventTime===24?1:graph.eventTime===29?2:graph.eventTime===41||graph.eventTime===50?4:5;
   const twin=twinPoint(state.carrier.x,state.carrier.z),twinX=twin.x,twinY=twin.y;
   const routeStep=Math.min(4,Math.floor(graph.mesProgress*4+1e-7));
 return <div className="factory-console" aria-label="Connected factory apps">
  <div className="factory-app-switch" role="group" aria-label="Digital product view">{operatingProducts.map(app=><button key={app} aria-pressed={product===app} onClick={()=>setProduct(app)}>{productLabel[app]}</button>)}</div>
  <div className="factory-app-view"><button key={product} className="operating-digital-screen" data-operating-product={product} data-mobile-active="true" data-signaling={signaling} data-online={true} onClick={e=>onInspect(product,e.currentTarget)} aria-label={'Inspect '+productLabel[product]} style={{'--graph-response':graph.response} as CSSProperties}>
    <span className="digital-screen-heading">{productLabel[product]}<i data-active={state.products[product]}/></span>
    <svg viewBox="0 0 180 116" aria-hidden="true" className="digital-refined-graph">
     {product==='V-MO'&&<>
      {vmoEdges.map((item,i)=>{const formed=graphEase((state.time-item.at-.65)/.55);return <g key={item.d}><path className="graph-structure" d={item.d}/><path className="graph-recorded" d={item.d} pathLength={100} strokeDasharray="100" strokeDashoffset={100-formed*100}/>{edge===i&&graph.packetVisible&&<path className="graph-packet" d={item.d} pathLength={100} strokeDasharray="3 97" strokeDashoffset={-graph.packet*97}/>}</g>;})}
      {vmoNodes.map((n,i)=><g key={n.name} opacity={.3+.7*graphEase((state.time-n.at-.48)/.22)}><rect className={n.name==='Lot'?'graph-core':'graph-node'} x={n.x-14} y={n.y-9} width="28" height="18" rx="2"/>{n.name==='Lot'&&<text x={n.x} y={n.y+2.5} textAnchor="middle">Lot</text>}</g>)}
      <circle data-digital-inlet r="2.5" cx="32" cy="22" className="graph-inlet" opacity={.3+.7*graph.arrival}/>
     </>}
     {product==='V-MES'&&<>
      <path className="graph-structure" d="M16 63 H164"/><path className="graph-recorded" d="M16 63 H164" pathLength={100} strokeDasharray="100" strokeDashoffset={100-graph.mesProgress*100}/>
      {[0,1,2,3,4].map(i=><g key={i}><rect className={(i<routeStep||graph.mesProgress===1)?'graph-node graph-complete':'graph-node'} x={10+i*36} y="56" width="14" height="14" rx="2"/>{(i<routeStep||graph.mesProgress===1)&&<path className="graph-check" d={`M${13+i*36} 63 l2 2 l4 -5`}/>}</g>)}
      <g className="graph-traveller" transform={`translate(${17+graph.mesProgress*144} 39)`}><rect x="-7" y="-6" width="14" height="12" rx="2"/><path d="M0 7 V12"/></g><text x="16" y="90">Load</text><text x="164" y="90" textAnchor="end">Unload</text><circle data-digital-inlet cx="17" cy="63" r="2.5" className="graph-inlet"/>
     </>}
     {product==='SCADA'&&t<24&&<>
      <path className="graph-structure" d="M20 27 V18 H35 M145 18 H160 V27 M20 68 V76 H35 M145 76 H160 V68"/>
      {[3,1,2,4,1,3,2,1,4,2,1,3,1,2,4,1,3,2,1,3].map((width,i)=><rect key={i} x={32+i*6} y="30" width={width} height="34" className="factory-barcode"/>)}
      {t>=12&&t<14&&<path className="graph-packet" d={`M${30+119*state.receiving} 23 v47`}/>}
      <text x="90" y="99" textAnchor="middle">Batch 017</text>
     </>}
     {product==='SCADA'&&t>=24&&<>
      <rect className="graph-comparison-band" x="13" y="36" width="152" height="42" rx="2"/><path className="graph-structure" d="M13 22 V78 H165 M13 36 H165"/>
      <defs><clipPath id={`${graphId}-trace`}><rect x="13" y="0" width={Math.max(0,Math.min(1,(state.time-24)/34))*152} height="116" className="graph-trace-window"/></clipPath></defs><polyline className="graph-trace" clipPath={`url(#${graphId}-trace)`} points={Array.from({length:90},(_,i)=>`${13+i/89*152},${scadaTraceValue(24+i/89*34)}`).join(' ')}/>
      {state.time>=41&&<circle cx={13+17/34*152} cy={scadaTraceValue(41)} r="2.5" className="graph-observation"/>}<text x="13" y="97">CED / Observation history</text><circle data-digital-inlet cx="13" cy="78" r="2.5" className="graph-inlet"/>
     </>}
     {product==='V-Twin'&&<>
      <path className="graph-structure" d="M25 18 H150 V96 H25"/>{factoryStations.map(station=><rect key={station.id} data-twin-station={station.id} className="graph-node" x={twinPoint(station.x,station.z).x-5} y={twinPoint(station.x,station.z).y-5} width="10" height="10" rx="1.5"/>)}
      <circle className="graph-station-focus" cx={twinX} cy={twinY} r="8"/><circle className="graph-twin-carrier" cx={twinX} cy={twinY} r="3"/><circle data-digital-inlet className="graph-inlet" cx="25" cy="18" r="2.5"/>
     </>}
     {product==='V-AI'&&<>
      <path className="graph-structure" d="M44 58 H58 M122 58 H136"/>
      <path className="graph-recorded" d="M44 58 H58" pathLength={100} strokeDasharray="100" strokeDashoffset={100-graphEase((state.time-41)/.55)*100}/>
      {evidenceRows.map((y,i)=><g key={y}>
       <path className="graph-structure" d={incomingEvidence(y)}/><path className="graph-structure" d={outgoingEvidence(y)}/>
       <path className="graph-recorded" d={incomingEvidence(y)} pathLength={100} strokeDasharray="100" strokeDashoffset={100-graph.evidence[i]*100}/>
       <path className="graph-recorded" d={outgoingEvidence(y)} pathLength={100} strokeDasharray="100" strokeDashoffset={100-graphEase((state.time-45-i*.15)/.5)*100}/>
       <rect className="graph-node" x={ports.evidenceX} y={y-9} width={ports.evidenceWidth} height="18" rx="2" opacity={.25+.75*graph.evidence[i]}/>
      </g>)}
      <rect className="graph-node" {...ports.source} rx="2" opacity={.3+.7*graphEase((state.time-41)/.4)}/>
      <path className="graph-recorded" d="M122 58 H136" pathLength={100} strokeDasharray="100" strokeDashoffset={100-graph.proposal*100}/>
      <rect className="graph-core" {...ports.response} rx="2" opacity={.25+.75*graph.proposal}/>
      <path className="graph-review-symbol" d={state.reviewed?'M143 58 l4 4 l9 -10':'M146 52 V64 M154 52 V64'} opacity={graph.proposal}/>
      <text x="150" y="84" textAnchor="middle" opacity={graph.proposal}>{state.reviewed?'Recorded':'Review'}</text>
      <circle data-digital-inlet className="graph-inlet" cx="16" cy="58" r="2.5"/>
     </>}
    </svg>
    <small>{labels[product]}</small><span className="digital-screen-status">{product==='V-AI'?(state.reviewed?'Review recorded':graph.proposal===1?'Ready for review':state.hold?'Evidence gathering':'Awaiting evidence'):product==='V-Twin'?(state.hold?'Carrier held at CED':state.time>=58?'Process complete':state.time>=24?'Tracking the operation':'Route prepared'):product==='V-MES'?state.lotStatus:product==='SCADA'?(t<12?'Awaiting rack scan':t<24?'Batch 017 identified':state.hold?'Condition observed':state.time>=58?'History preserved':state.time>=24?'Station data linked':'Equipment ready'):state.time>=2?'Context linked':'Preparing context'}</span>
   </button></div>
  <div className="factory-edge-bus" aria-label={outbound?`${productLabel[product]} via V Edge to ${endpoint}`:`${endpoint} via V Edge to ${productLabel[product]}`}>
   <span>{endpoint}</span><b>V Edge</b><span>{productLabel[product]}</span>
   {packet&&<i aria-hidden="true" style={{left:`${4+92*(outbound?1-state.eventProgress:state.eventProgress)}%`}}>{id}</i>}
  </div>
 </div>;
}
