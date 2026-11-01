"use client";
import {useId,useState,type CSSProperties} from 'react';
import {operatingNumericActivity,operatingProducts,type OperatingProduct,operatingState} from './operating-model';
import {alphaLineStations} from '../manufacturing/alpha-line-config';
import {twinPoint,digitalGraphState,graphEase,scadaTraceValue} from './digital-graph-model';
const labels:Record<OperatingProduct,string>={'V-MO':'Shared manufacturing context','V-MES':'Execution history','SCADA':'Equipment observations','V-Twin':'Derived process state','V-AI':'Evidence and review'};
const vmoNodes=[{x:24,y:20,name:'Part',at:2},{x:78,y:58,name:'Lot',at:2},{x:136,y:20,name:'Operation',at:24},{x:158,y:60,name:'Equipment',at:29},{x:24,y:98,name:'Requirement',at:41},{x:136,y:98,name:'Evidence',at:44}];
const vmoEdges=[{d:'M34 20 H50 V58 H68',at:2},{d:'M88 58 H108 V20 H126',at:20},{d:'M146 20 H158 V52',at:25},{d:'M78 66 V98 H126',at:40},{d:'M34 98 H50 V66 H78',at:37}];
export function OperatingDigitalLayer({state,onInspect}:{state:ReturnType<typeof operatingState>;onInspect:(product:OperatingProduct,trigger:HTMLElement)=>void}){
 const graphId=useId(),numeric=operatingNumericActivity(state);
 const [manual,setManual]=useState<OperatingProduct|null>(null);
 // Chapter ownership is stable; brief parallel signals never cause mobile product switching.
 const active=manual??(['V-MO','V-MO','V-MES','V-AI','V-Twin','V-MO'] as OperatingProduct[])[state.chapter];
 return <div className="operating-digital-layer" aria-label="Digital platform layer">
  <div className="digital-mobile-tabs" role="group" aria-label="Digital product view">{operatingProducts.map(product=><button key={product} aria-pressed={active===product} onClick={()=>setManual(product)}>{product}</button>)}</div>
  <div className="operating-digital-screens">{operatingProducts.map(product=>{
   const graph=digitalGraphState(state,product),signaling=graph.age>=.48&&graph.age<1.95;
   const edge=graph.eventTime===2||graph.eventTime===15?0:graph.eventTime===24?1:graph.eventTime===29?2:graph.eventTime===41||graph.eventTime===50?4:3;
   const twin=twinPoint(state.carrier.x,state.carrier.z),twinX=twin.x,twinY=twin.y;
   const routeStep=Math.min(4,Math.floor(graph.mesProgress*4+1e-7));
   return <button key={product} className="operating-digital-screen" data-operating-product={product} data-mobile-active={active===product} data-signaling={signaling} data-online={manual===product||state.time>=(product==='V-MO'?0:product==='V-MES'?.5:product==='SCADA'?1:product==='V-Twin'?1.5:2)} onClick={e=>onInspect(product,e.currentTarget)} aria-label={'Inspect '+product} style={{'--graph-response':graph.response} as CSSProperties}>
    <span className="digital-screen-heading">{product}<i data-active={state.products[product]}/></span>
    <svg viewBox="0 0 180 116" aria-hidden="true" className="digital-refined-graph">
     {product==='V-MO'&&<>
      {vmoEdges.map((item,i)=>{const formed=graphEase((state.time-item.at-.65)/.55);return <g key={item.d}><path className="graph-structure" d={item.d}/><path className="graph-recorded" d={item.d} pathLength={100} strokeDasharray="100" strokeDashoffset={100-formed*100}/>{edge===i&&graph.packetVisible&&<path className="graph-packet" d={item.d} pathLength={100} strokeDasharray="3 97" strokeDashoffset={-graph.packet*97}/>}</g>;})}
      {vmoNodes.map((n,i)=><g key={n.name} opacity={.3+.7*graphEase((state.time-n.at-.48)/.22)}><rect className={i===1?'graph-core':'graph-node'} x={n.x-10} y={n.y-8} width="20" height="16" rx="2"/>{i===1&&<text x={n.x} y={n.y+2.5} textAnchor="middle">Lot</text>}</g>)}
      <circle data-digital-inlet r="2.5" cx="24" cy="20" className="graph-inlet" opacity={.3+.7*graph.arrival}/>
     </>}
     {product==='V-MES'&&<>
      <path className="graph-structure" d="M16 63 H164"/><path className="graph-recorded" d="M16 63 H164" pathLength={100} strokeDasharray="100" strokeDashoffset={100-graph.mesProgress*100}/>
      {[0,1,2,3,4].map(i=><g key={i}><rect className={(i<routeStep||graph.mesProgress===1)?'graph-node graph-complete':'graph-node'} x={10+i*36} y="56" width="14" height="14" rx="2"/>{(i<routeStep||graph.mesProgress===1)&&<path className="graph-check" d={`M${13+i*36} 63 l2 2 l4 -5`}/>}</g>)}
      <g className="graph-traveller" transform={`translate(${17+graph.mesProgress*144} 39)`}><rect x="-7" y="-6" width="14" height="12" rx="2"/><path d="M0 7 V12"/></g><text x="16" y="90">Load</text><text x="164" y="90" textAnchor="end">Unload</text><circle data-digital-inlet cx="17" cy="63" r="2.5" className="graph-inlet"/>
     </>}
     {product==='SCADA'&&<>
      <rect className="graph-comparison-band" x="13" y="36" width="152" height="42" rx="2"/><path className="graph-structure" d="M13 22 V78 H165 M13 36 H165"/>
      <defs><clipPath id={`${graphId}-trace`}><rect x="13" y="0" width={Math.max(0,Math.min(1,(state.time-24)/34))*152} height="116" className="graph-trace-window"/></clipPath></defs><polyline className="graph-trace" clipPath={`url(#${graphId}-trace)`} points={Array.from({length:90},(_,i)=>`${13+i/89*152},${scadaTraceValue(24+i/89*34)}`).join(' ')}/>
      {state.time>=41&&<circle cx={13+17/34*152} cy={scadaTraceValue(41)} r="2.5" className="graph-observation"/>}<text x="13" y="97">T06 / Observation history</text><circle data-digital-inlet cx="13" cy="78" r="2.5" className="graph-inlet"/>
     </>}
     {product==='V-Twin'&&<>
      <path className="graph-structure" d="M25 18 H150 V96 H25"/>{alphaLineStations.map(station=><rect key={station.id} data-twin-station={station.id} className="graph-node" x={twinPoint(station.x*.42-4,station.z*.42-1).x-5} y={twinPoint(station.x*.42-4,station.z*.42-1).y-5} width="10" height="10" rx="1.5"/>)}
      <circle className="graph-station-focus" cx={twinX} cy={twinY} r="8"/><circle className="graph-twin-carrier" cx={twinX} cy={twinY} r="3"/><circle data-digital-inlet className="graph-inlet" cx="25" cy="18" r="2.5"/>
     </>}
     {product==='V-AI'&&<>
      {[0,1,2].map(i=><g key={i}><path className="graph-structure" d={`M28 58 H49 V${22+i*34} H65 M95 ${22+i*34} H117 V58 H140`}/><path className="graph-recorded" d={`M28 58 H49 V${22+i*34} H65`} pathLength={100} strokeDasharray="100" strokeDashoffset={100-graph.evidence[i]*100}/><rect className="graph-node" x="65" y={14+i*34} width="30" height="16" rx="2" opacity={.25+.75*graph.evidence[i]}/></g>)}
      <rect className="graph-node" x="8" y="48" width="20" height="20" rx="2" opacity={.3+.7*graphEase((state.time-41)/.4)}/><path className="graph-recorded" d="M95 56 H117 V58 H140" pathLength={100} strokeDasharray="100" strokeDashoffset={100-graph.proposal*100}/><rect className="graph-core" x="140" y="44" width="28" height="28" rx="3" opacity={.25+.75*graph.proposal}/><path className="graph-review-symbol" d={state.reviewed?'M147 58 l5 5 l9 -12':'M150 51 V61 M158 51 V61'} opacity={graph.proposal}/><text x="154" y="93" textAnchor="middle" opacity={graph.proposal}>{state.reviewed?'Recorded':'Review'}</text><circle data-digital-inlet className="graph-inlet" cx="18" cy="58" r="2.5"/>
     </>}
    </svg>
    <small>{labels[product]}</small><span className="digital-screen-status">{product==='V-AI'?(state.hold?'Preparing review':state.reviewed?'Review recorded':'Awaiting evidence'):product==='V-Twin'?(state.hold?'Carrier held at T06':state.time>=58?'Process complete':state.time>=24?'Tracking the operation':'Route prepared'):product==='V-MES'?state.lotStatus:product==='SCADA'?(state.hold?'Condition observed':state.time>=58?'History preserved':state.time>=24?'Station data linked':'Equipment ready'):state.eventText}</span>
   </button>;
  })}</div>
  <div className="operating-numeric-layer" aria-hidden="true" data-numeric-active={numeric.opacity>0} style={{opacity:numeric.opacity}}>{numeric.columns.map((digits,column)=><div key={column} className="operating-numeric-column">{digits.repeat(2).split('').map((digit,i)=><span key={i} data-head={i%6===4}>{digit}</span>)}</div>)}</div>
 </div>;
}
