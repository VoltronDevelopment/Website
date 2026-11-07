"use client";
import {productLabel} from '@/lib/product-names';
import {allowPageWheelOverRow} from '../performance/card-row-input';
import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {operatingProducts,type OperatingProduct,operatingState} from './operating-model';
import {factoryStations} from './operating-model';
import {twinPoint,digitalGraphState,graphEase,scadaTraceValue} from './digital-graph-model';
const labels:Record<OperatingProduct,string>={'V-MO':'Shared manufacturing context','V-MES':'Execution history','SCADA':'Equipment observations','V-Twin':'Derived process state','V-AI':'Evidence and review'};
import {meaningBlocks as vmoNodes,meaningConnections as vmoEdges,evidenceRows,incomingEvidence,outgoingEvidence,investigationPorts as ports} from './screen-diagrams';
function centerProduct(row:HTMLElement,product:OperatingProduct){
 const card=row.querySelector<HTMLElement>('[data-operating-product="'+product+'"]');
 if(!card)return;
 row.scrollTo({
  left:card.offsetLeft+(card.offsetWidth-row.clientWidth)/2,
  behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'
 });
}
export function OperatingDigitalLayer({state,onInspect}:{state:ReturnType<typeof operatingState>;onInspect:(product:OperatingProduct,trigger:HTMLElement)=>void}){
 const graphId=useId(),track=useRef<HTMLDivElement>(null);
 const [manual,setManual]=useState<OperatingProduct|null>(null);
 // Chapter ownership is stable; brief parallel signals never cause mobile product switching.
 const active=manual??(['V-MO','V-MO','V-MES','V-AI','V-Twin','V-MO'] as OperatingProduct[])[state.chapter];
 const browsing=useRef(false);
 useEffect(()=>{
  const row=track.current;
  if(!row)return;
  const center=()=>{if(!browsing.current)centerProduct(row,active);};
  center();
  let width=row.clientWidth;
  const resize=new ResizeObserver(([entry])=>{
   if(entry.contentRect.width!==width){width=entry.contentRect.width;center();}
  });
  resize.observe(row);
  return ()=>resize.disconnect();
 },[active]);
 useEffect(()=>{
  const row=track.current;
  if(!row)return;
  const begin=()=>{browsing.current=true;};
  const wheel=(event:WheelEvent)=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.shiftKey)begin();};
  const selectCentered=()=>{
   if(!browsing.current)return;
   const middle=row.scrollLeft+row.clientWidth/2;
   const cards=Array.from(row.querySelectorAll<HTMLElement>('[data-operating-product]'));
   const distance=(card:HTMLElement)=>Math.abs(card.offsetLeft+card.offsetWidth/2-middle);
   const centered=cards.reduce<HTMLElement|null>((best,card)=>!best||distance(card)<distance(best)?card:best,null);
   if(centered)setManual(centered.dataset.operatingProduct as OperatingProduct);
  };
  const releaseWheel=allowPageWheelOverRow(row);
  row.addEventListener('wheel',wheel,{passive:true});
  let touchX=0,touchY=0;
  const down=(event:TouchEvent)=>{touchX=event.touches[0].clientX;touchY=event.touches[0].clientY;};
  const move=(event:TouchEvent)=>{if(Math.abs(event.touches[0].clientX-touchX)>Math.max(8,Math.abs(event.touches[0].clientY-touchY)))begin();};
  row.addEventListener('touchstart',down,{passive:true});
  row.addEventListener('touchmove',move,{passive:true});
  row.addEventListener('scrollend',selectCentered);
  return ()=>{
   releaseWheel();
   row.removeEventListener('wheel',wheel);
   row.removeEventListener('touchstart',down);
   row.removeEventListener('touchmove',move);
   row.removeEventListener('scrollend',selectCentered);
  };
 },[]);
 function selectProduct(product:OperatingProduct){
  browsing.current=false;
  setManual(product);
  if(product===active && track.current)centerProduct(track.current,product);
 }
 return <div className="operating-digital-layer" aria-label="Digital platform layer">
  <div className="digital-mobile-tabs" role="group" aria-label="Digital product view">{operatingProducts.map(product=><button key={product} aria-pressed={active===product} onClick={()=>selectProduct(product)}>{productLabel[product]}</button>)}</div>
  <div className="operating-digital-screens" ref={track}>{operatingProducts.map(product=>{
   const graph=digitalGraphState(state,product),signaling=graph.age>=.48&&graph.age<1.95;
   const edge=graph.eventTime===2||graph.eventTime===15?0:graph.eventTime===24?1:graph.eventTime===29?2:graph.eventTime===41||graph.eventTime===50?4:5;
   const twin=twinPoint(state.carrier.x,state.carrier.z),twinX=twin.x,twinY=twin.y;
   const routeStep=Math.min(4,Math.floor(graph.mesProgress*4+1e-7));
   return <button key={product} className="operating-digital-screen" data-operating-product={product} data-mobile-active={active===product} data-signaling={signaling} data-online={manual===product||state.time>=(product==='V-MO'?0:product==='V-MES'?.5:product==='SCADA'?1:product==='V-Twin'?1.5:2)} onClick={e=>onInspect(product,e.currentTarget)} aria-label={'Inspect '+productLabel[product]} style={{'--graph-response':graph.response} as CSSProperties}>
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
     {product==='SCADA'&&<>
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
    <small>{labels[product]}</small><span className="digital-screen-status">{product==='V-AI'?(state.reviewed?'Review recorded':graph.proposal===1?'Ready for review':state.hold?'Evidence gathering':'Awaiting evidence'):product==='V-Twin'?(state.hold?'Carrier held at CED':state.time>=58?'Process complete':state.time>=24?'Tracking the operation':'Route prepared'):product==='V-MES'?state.lotStatus:product==='SCADA'?(state.hold?'Condition observed':state.time>=58?'History preserved':state.time>=24?'Station data linked':'Equipment ready'):state.time>=2?'Context linked':'Preparing context'}</span>
   </button>;
  })}</div>
 </div>;
}
