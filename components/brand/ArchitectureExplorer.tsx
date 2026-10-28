"use client";

import Link from 'next/link';
import {useEffect, useId, useRef, useState} from 'react';
import {Activity, ArrowRight, Boxes, Network, ScanLine, BrainCircuit, X} from 'lucide-react';
import {prefersStaticScene} from '../performance/scene-policy';
import {architectureRoute} from './architecture-route';

const systems = [
 {id:'ontology', title:'V-MO', role:'Shared manufacturing meaning', Icon:Network, href:'/ontology', detail:'Plant, part, lot, process, equipment and evidence belong to the same manufacturing situation.', records:['Common identity','Meaningful relationships','Traceable evidence'], relation:'The shared model connects each system without taking over its responsibility.'},
 {id:'mes', title:'V-MES', role:'Production execution', Icon:Boxes, href:'/manufacturing', detail:'The lot, operation and production record remain connected as work progresses.', records:['Part and lot identity','Operation record','Production status'], relation:'Production records use the shared identity of the part, lot and operation.'},
 {id:'scada', title:'SCADA', role:'Machine visibility', Icon:Activity, href:'/manufacturing', detail:'Machine signals become useful evidence when linked to the equipment and operation they describe.', records:['Equipment identity','Signal history','Operating context'], relation:'Equipment signals are associated with the active operation. Physical control remains with the plant systems.'},
 {id:'twin', title:'V-Twin', role:'Process representation', Icon:ScanLine, href:'/manufacturing', detail:'A connected process representation brings state and evidence together for investigation.', records:['Process representation','Connected state','Investigation context'], relation:'The process representation uses the same manufacturing identities and records.'},
 {id:'ai', title:'V-AI', role:'Evidence-led intelligence', Icon:BrainCircuit, href:'/intelligence', detail:'Connected evidence supports investigation and suggestions. People retain authority over consequential decisions.', records:['Relevant evidence','Suggested action','Human review'], relation:'Shared context grounds each suggestion in evidence, with consequential decisions retained by people.'},
] as const;

const dwell = 3200;
type Route = {id:string; d:string};

function ArchitectureDetail({active,headingId}:{active:(typeof systems)[number];headingId:string}) {
 return <div className="architecture-insight-content" key={active.id}>
  <p className="architecture-kicker">Selected system</p>
  <active.Icon className="architecture-selected-icon" size={32} aria-hidden="true"/>
  <h3 id={headingId}>{active.title}<span>{active.role}</span></h3>
  <p className="architecture-detail">{active.detail}</p>
  <ul className="architecture-records" aria-label="Connected context">{active.records.map(record=><li key={record}>{record}</li>)}</ul>
  <p className="architecture-kicker">{active.id==='ontology'?'Foundation for every system':'Relationship to V-MO'}</p>
  <p className="architecture-relation">{active.relation}</p>
  <Link className="architecture-explore" href={active.href}>{active.id==='scada'?'Explore manufacturing':`Explore ${active.title}`}<ArrowRight size={18} aria-hidden="true"/></Link>
 </div>;
}

export function ArchitectureExplorer() {
 const [selected,setSelected] = useState(0);
 const [revealed,setRevealed] = useState(0);
 const [manual,setManual] = useState(false);
 const [staticMotion,setStaticMotion] = useState(false);
 const [popup,setPopup] = useState(false);
 const [phone,setPhone] = useState(false);
 const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement|null>(null);
 const [routes,setRoutes] = useState<Route[]>([]);
 const host = useRef<HTMLDivElement>(null), map = useRef<HTMLDivElement>(null);
 const id = useId(), active = systems[selected];

 useEffect(()=>{
  const media=matchMedia('(max-width: 767px)');
  const update=()=>{setPhone(media.matches);if(!media.matches)setPopup(false);};
  update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const element=dialog.current;
  if(!popup||!element)return;
  const overflow=document.body.style.overflow;
  element.showModal();document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=overflow;if(element.open)element.close();trigger.current?.focus({preventScroll:true});};
 },[popup]);

 // Connect real tile edges, including after font loading, zoom or a responsive reflow.
 useEffect(()=>{
  const element=map.current;
  if(!element)return;
  const measure=()=>{
   const bounds=element.getBoundingClientRect();
   const nodes=systems.map(s=>element.querySelector<HTMLElement>(`.node-${s.id}`)!.getBoundingClientRect());
   setRoutes(systems.slice(1).map((s,i)=>({id:s.id,d:architectureRoute(nodes[0],nodes[i+1],bounds)})));
  };
  const observer=new ResizeObserver(measure);
  observer.observe(element);
  element.querySelectorAll('button').forEach(node=>observer.observe(node));
  measure();
  return()=>observer.disconnect();
 },[]);

 // A single introduction: visible-time only, no loop, and direct selection takes ownership.
 useEffect(()=>{
  const element=host.current;
  if(!element||manual)return;
  let frame=0, previous=0, elapsed=0, visible=false, stage=0, stopped=false;
  const tick=(now:number)=>{
   if(stopped)return;
   if(visible&&!document.hidden){
    if(previous)elapsed+=Math.min(now-previous,100);
    if(elapsed>=dwell){
     elapsed=0;stage++;
     setSelected(stage);setRevealed(stage);
     if(stage===systems.length-1){stopped=true;return;}
    }
   }
   previous=now;
   if(visible&&!document.hidden)frame=requestAnimationFrame(tick);
  };
  const resume=()=>{cancelAnimationFrame(frame);previous=0;if(visible&&!document.hidden&&!stopped)frame=requestAnimationFrame(tick);};
  const staticMode=()=>{
   if(prefersStaticScene()){stopped=true;cancelAnimationFrame(frame);setRevealed(4);setStaticMotion(true);}
  };
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{threshold:.2});
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  observer.observe(element);staticMode();
  document.addEventListener('visibilitychange',resume);
  window.addEventListener('voltron:motion',staticMode);motion.addEventListener('change',staticMode);
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',resume);window.removeEventListener('voltron:motion',staticMode);motion.removeEventListener('change',staticMode);};
 },[manual]);

 const choose=(index:number,button:HTMLButtonElement)=>{
  setManual(true);setRevealed(4);setSelected(index);
  if(phone){trigger.current=button;setPopup(true);}
 };
 return <div ref={host} className="technology-architecture" onFocusCapture={()=>{setManual(true);setRevealed(4);}} data-motion={staticMotion?'static':'animated'} data-selected={active.id} data-revealed={revealed} data-introduction={manual?'selected':'automatic'}>
  <div className="architecture-workspace">
   <div className="architecture-diagram">
    <p className="architecture-instruction">One shared model. Five distinct responsibilities.</p>
    <div ref={map} className="technology-map" role="group" aria-label="Connected manufacturing systems">
     <svg className="technology-map-lines" aria-hidden="true">
      <defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9"/></marker></defs>
      {routes.map((route,i)=><g key={route.id} data-reached={revealed>=i+1} data-active={active.id===route.id}>
       <path className="architecture-track" d={route.d} markerEnd={`url(#${id}-arrow)`}/>
       {active.id===route.id&&<path key={selected} className="architecture-signal" d={route.d} pathLength="1"/>}
      </g>)}
     </svg>
     {systems.map((system,index)=><button key={system.id} className={`technology-node node-${system.id}`} type="button" data-reached={revealed>=index} aria-pressed={selected===index} aria-controls={phone?`${id}-dialog`:id} aria-haspopup={phone?"dialog":undefined} onClick={event=>choose(index,event.currentTarget)}>
      <system.Icon size={26} aria-hidden="true"/>
      <span>{system.title}</span><small>{system.role}</small>
     </button>)}
    </div>
    <p className="architecture-instruction architecture-selection-hint"><span className="architecture-desktop-hint">Select any system to explore its role.</span><span className="architecture-phone-hint">Tap a tile to view its details.</span></p>
   </div>
   <aside className="architecture-insight" id={id} aria-label="Selected system" aria-live={manual?'polite':'off'} aria-atomic="true">
    <ArchitectureDetail active={active} headingId={`${id}-title`}/>
   </aside>
  </div>
  <dialog ref={dialog} id={`${id}-dialog`} className="architecture-dialog" aria-labelledby={`${id}-popup-title`} onClose={()=>setPopup(false)} onKeyDown={event=>{
   if(event.key!=='Tab')return;
   const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]')];
   const first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }} onClick={event=>{if(event.target===event.currentTarget){const bounds=event.currentTarget.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)setPopup(false);}}}>
   <div className="architecture-dialog-toolbar"><span>System details</span><button type="button" className="icon-button" aria-label="Close system details" onClick={()=>setPopup(false)}><X size={20} aria-hidden="true"/></button></div>
   <div className="architecture-dialog-body"><ArchitectureDetail active={active} headingId={`${id}-popup-title`}/></div>
  </dialog>
  <p className="technology-example-note">Illustrative architecture. Connections represent shared identities and relationships, not a live equipment-control interface.</p>
 </div>;
}
