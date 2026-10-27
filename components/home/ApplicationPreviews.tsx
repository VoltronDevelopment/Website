"use client";
import {useHomeMotion} from './HomeMotion';
import Link from 'next/link';
import {prefersStaticScene} from '../performance/scene-policy';
import {ArrowUpRight} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {subscribeScroll} from '@/lib/scroll-frame';
import {prepareScene,canPrepareHomeScene} from './scene-preparation';
import type {mountApplicationArtwork} from './application-artwork';
import {convexCardPose} from './application-arc';

const apps=[
 {id:'mes',name:'V-MES',kind:'Execution + SCADA',copy:'Coordinate work, machines and production records.',href:'/technology#architecture'},
 {id:'twin',name:'V-Twin',kind:'Process representation',copy:'A part is lowered through prepare, coat and finish.',href:'/manufacturing#explore-alpha'},
 {id:'ai',name:'V-AI',kind:'Agents & skills',copy:'A model, context, skills and tools for one defined task.',href:'/intelligence'},
 {id:'ontology',name:'V-MO',kind:'Manufacturing ontology',copy:'Concepts, rules, entities and relationships, one meaning.',href:'/ontology'},
];

const piecePlain='M14 0H60Q74 0 74 14V46Q74 60 60 60H14Q0 60 0 46V14Q0 0 14 0Z';
const piece='M14 0H60Q74 0 74 14V18C74 18 90 17 90 32C90 47 74 46 74 46V48Q74 60 60 60H14Q0 60 0 46V14Q0 0 14 0Z';
const pieceDown='M14 0H60Q74 0 74 14V46Q74 60 60 60H46C46 60 47 78 33 78C19 78 20 60 20 60H14Q0 60 0 46V14Q0 0 14 0Z';
const pieceJoin='M14 0H60Q74 0 74 14V18C74 18 90 17 90 32C90 47 74 46 74 46V48Q74 60 60 60H46C46 60 47 78 33 78C19 78 20 60 20 60H14Q0 60 0 46V14Q0 0 14 0Z';

function Diagram({kind}:{kind:string}){
 const label=kind==='mes'?'A lot moves across receive, process, verify and release':kind==='twin'?'A part lowers into prepare, then coat, then finish':kind==='ai'?'Model, tools, context and skills connect to one agent':'Concepts, rules, entities and relationships lock around the ontology';
 return <svg viewBox="0 0 440 220" role="img" aria-label={label}>
  {kind==='mes'?<g>
   <path className="diagram-link" d="M28 124H412"/>
   {['Receive','Process','Verify','Release'].map((name,i)=><g className="diagram-stage" data-step={i} key={name} transform={`translate(${18+i*104},28)`}><rect className="diagram-surface" width="84" height="58" rx="10"/><path className="diagram-machine" d="M22 40V24H62V40M30 24V16H54V24"/><text x="42" y="112" textAnchor="middle">{name}</text></g>)}
   <g className="mes-lot"><rect className="diagram-part" x="0" y="112" width="24" height="14" rx="3"/></g>
  </g>:null}
  {kind==='twin'?<g>
   <path className="diagram-link" d="M24 36H416"/>
   {[['Prepare',46,0],['Coat',180,1],['Finish',314,2]].map(([name,x,step])=><g className="diagram-stage" data-step={step} key={name} transform={`translate(${x},84)`}><path className="tank-body" d="M8 6H72V52Q72 66 58 66H22Q8 66 8 52Z"/><path className="tank-rim diagram-machine" d="M0 6H80"/><path className="tank-liquid" d="M14 28H66V50Q66 60 56 60H24Q14 60 14 50Z"/><text x="40" y="88" textAnchor="middle">{name}</text></g>)}
   <g className="twin-hoist"><rect className="diagram-node" x="-16" y="28" width="32" height="12" rx="3"/><line className="twin-cable diagram-machine" x1="0" y1="40" x2="0" y2="52"/><g className="twin-part"><rect className="diagram-part" x="-9" y="52" width="18" height="20" rx="3"/></g></g>
  </g>:null}
  {kind==='ai'?<g>
   <line className="agent-link agent-beat" data-step="0" x1="220" y1="70" x2="220" y2="100"/>
   <line className="agent-link agent-beat" data-step="1" x1="112" y1="114" x2="184" y2="114"/>
   <line className="agent-link agent-beat" data-step="2" x1="256" y1="114" x2="328" y2="114"/>
   <line className="agent-link agent-beat" data-step="3" x1="220" y1="128" x2="220" y2="154"/>
   <g className="agent-beat" data-step="0" transform="translate(220 48)"><path className="agent-face agent-top" d="M0-18L20-8L0 2L-20-8Z"/><path className="agent-face agent-left" d="M-20-8L-20 12L0 22L0 2Z"/><path className="agent-face agent-right" d="M20-8L20 12L0 22L0 2Z"/><text className="agent-label" y="-26" textAnchor="middle">Model</text></g>
   <g className="agent-beat" data-step="1" transform="translate(90 114)"><path className="agent-face agent-top" d="M0-18L20-8L0 2L-20-8Z"/><path className="agent-face agent-left" d="M-20-8L-20 12L0 22L0 2Z"/><path className="agent-face agent-right" d="M20-8L20 12L0 22L0 2Z"/><text className="agent-label" x="-30" y="5" textAnchor="end">Tools</text></g>
   <g className="agent-beat" data-step="2" transform="translate(350 114)"><path className="agent-face agent-top" d="M0-18L20-8L0 2L-20-8Z"/><path className="agent-face agent-left" d="M-20-8L-20 12L0 22L0 2Z"/><path className="agent-face agent-right" d="M20-8L20 12L0 22L0 2Z"/><text className="agent-label" x="30" y="5" textAnchor="start">Context</text></g>
   <g className="agent-beat" data-step="3" transform="translate(220 174)"><path className="agent-face agent-top" d="M0-18L20-8L0 2L-20-8Z"/><path className="agent-face agent-left" d="M-20-8L-20 12L0 22L0 2Z"/><path className="agent-face agent-right" d="M20-8L20 12L0 22L0 2Z"/><text className="agent-label" y="36" textAnchor="middle">Skills</text></g>
   <text className="agent-name" x="220" y="118" textAnchor="middle">AGENT</text>
  </g>:null}
  {kind==='ontology'?<g>
   <defs><linearGradient id="ontology-pearl" x2="1" y2="1"><stop stopColor="#f5fbff"/><stop offset=".45" stopColor="#a5c8df"/><stop offset=".53" stopColor="#dcecf7"/><stop offset="1" stopColor="#6d9aba"/></linearGradient><linearGradient id="ontology-navy" x2="1" y2="1"><stop stopColor="#376c91"/><stop offset=".46" stopColor="#173e5b"/><stop offset=".53" stopColor="#315f80"/><stop offset="1" stopColor="#0c263d"/></linearGradient><linearGradient id="ontology-cobalt" x2="1" y2="1"><stop stopColor="#b6def5"/><stop offset=".5" stopColor="#4b8ebd"/><stop offset="1" stopColor="#1e567d"/></linearGradient></defs><rect width="440" height="220" rx="16" fill="var(--diagram-wash)" opacity=".24"/>
   <g stroke="var(--diagram-line)" strokeWidth="0.6">{Array.from({length:14},(_,i)=><path key={`v${i}`} d={`M${16+i*30} 8V212`}/>)}{Array.from({length:7},(_,i)=><path key={`h${i}`} d={`M8 ${18+i*30}H432`}/>)}</g>
   <g className="onto-beat" data-step="0"><path className="onto-dash" d="M112 28C140 28 150 40 168 46" stroke="var(--diagram-ink)"/></g>
   <g className="onto-beat" data-step="1"><path className="onto-dash" d="M346 28C310 28 280 40 250 46" stroke="var(--diagram-line)"/></g>
   <g className="onto-beat" data-step="2"><path className="onto-dash" d="M108 196C140 196 150 184 168 176" stroke="var(--diagram-ink)"/></g>
   <g className="onto-beat" data-step="3"><path className="onto-dash" d="M300 196C270 196 260 184 244 176" stroke="var(--diagram-line)"/></g>
   <g transform="translate(206 112)"><g className="onto-beat" data-step="3"><path d={piecePlain} fill="url(#ontology-navy)" stroke="#fff" strokeWidth="3"/></g></g>
   <g transform="translate(124 112)"><g className="onto-beat" data-step="2"><path d={piece} fill="url(#ontology-pearl)" stroke="#fff" strokeWidth="3"/></g></g>
   <g transform="translate(206 46)"><g className="onto-beat" data-step="1"><path d={pieceDown} fill="url(#ontology-cobalt)" stroke="#fff" strokeWidth="3"/></g></g>
   <g transform="translate(124 46)"><g className="onto-beat" data-step="0"><path d={pieceJoin} fill="url(#ontology-pearl)" stroke="#fff" strokeWidth="3"/></g></g>
   <g className="onto-core"><circle cx="202" cy="108" r="34" fill="url(#ontology-navy)" stroke="#fff" strokeWidth="4"/><text x="202" y="104" textAnchor="middle">Shared</text><text x="202" y="118" textAnchor="middle">meaning</text></g>
   <g transform="translate(10 12)"><g className="onto-chip chip-concepts onto-beat" data-step="0"><rect width="100" height="22" rx="11" fill="var(--diagram-surface)"/><circle cx="14" cy="11" r="3.2" fill="#fff"/><text x="24" y="15">Concepts</text></g></g>
   <g transform="translate(346 12)"><g className="onto-chip chip-rules onto-beat" data-step="1"><rect width="84" height="22" rx="11" fill="var(--diagram-surface)"/><circle cx="14" cy="11" r="3.2" fill="#fff"/><text x="24" y="15">Rules</text></g></g>
   <g transform="translate(10 186)"><g className="onto-chip chip-entities onto-beat" data-step="2"><rect width="96" height="22" rx="11" fill="var(--diagram-surface)"/><circle cx="14" cy="11" r="3.2" fill="#fff"/><text x="24" y="15">Entities</text></g></g>
   <g transform="translate(298 186)"><g className="onto-chip chip-relationships onto-beat" data-step="3"><rect width="132" height="22" rx="11" fill="var(--diagram-surface)"/><circle cx="14" cy="11" r="3.2" fill="#fff"/><text x="24" y="15">Relationships</text></g></g>
  </g>:null}
 </svg>;
}

const phaseLabels:Record<string,string[]>={
 mes:['Lot identified','Process recorded','Quality verified','Release recorded'],
 twin:['Prepare','Coat','Finish','Raised clear'],
 ai:['Model','Tools','Context','Skills'],
 ontology:['Concepts','Rules','Entities','Relationships'],
};

export function ApplicationPreviews(){
 const motionRevision=useHomeMotion(),host=useRef<HTMLDivElement>(null),[focus,setFocus]=useState(0),choose=useRef<(i:number)=>void>(()=>{});
 useEffect(()=>{
  const root=host.current;if(!root)return;
  const cards=[...root.querySelectorAll<HTMLElement>('.application-screen')],stage=root.querySelector<HTMLElement>('.application-stage')!,pin=root.querySelector<HTMLElement>('.application-pin')!;
  const calm=prefersStaticScene(),states=cards.map(card=>({card,time:calm?12:0,visible:false,scheduled:false,artwork:null as ReturnType<typeof mountApplicationArtwork>|null,cancel:undefined as (()=>void)|undefined}));
  let frame=0,previous=0,disposed=false,selected=-1,progress=0;
  const paint=(state:typeof states[number])=>{
   const {card,time}=state,step=Math.min(3,Math.max(0,Math.floor((time-2.4)/2.4))),local=Math.max(0,Math.min(1,(time-2.4)/9.6));card.dataset.step=String(step);card.dataset.complete=String(time>=12);card.style.setProperty('--diagram-form',String(calm?1:.72+.28*Math.min(1,time/3)));card.style.setProperty('--diagram-travel',String(local));
   const lot=card.querySelector<SVGGraphicsElement>('.mes-lot');lot?.setAttribute('transform',`translate(${[48,152,256,360][step]} 0)`);
   const hop=(Math.max(0,time-2.4)%2.4)/2.4,dip=step<3?Math.sin(hop*Math.PI)*64:0;
   card.querySelector<SVGGraphicsElement>('.twin-hoist')?.setAttribute('transform',`translate(${[86,220,354,354][step]} 0)`);card.querySelector('.twin-cable')?.setAttribute('y2',String(52+dip));card.querySelector('.twin-part')?.setAttribute('transform',`translate(0 ${dip})`);
   state.artwork?.update(time,card.dataset.tone==='smoked',progress-cards.indexOf(card));
  };
  const stop=()=>{cancelAnimationFrame(frame);frame=0;previous=0;};
  const tick=(now:number)=>{frame=0;if(document.hidden||disposed)return;const delta=previous?Math.min(.06,(now-previous)/1000):0;previous=now;let active=false;for(const state of states)if(state.visible&&state.time<12){state.time=Math.min(12,state.time+delta);paint(state);active=true;}if(active)frame=requestAnimationFrame(tick);else previous=0;};
  const start=()=>{if(!calm&&!document.hidden&&!frame&&!disposed){previous=0;frame=requestAnimationFrame(tick);}};
  const layout=()=>{
   const sticky=innerWidth<768?72:96,travel=(cards.length-1)*Math.max(260,innerHeight*.55);root.style.setProperty('--app-travel',travel+'px');root.dataset.arc=calm?'off':'on';
   const bounds=stage.getBoundingClientRect(),visible=bounds.top<innerHeight-sticky&&bounds.bottom>sticky;
   progress=calm?0:Math.max(0,Math.min(cards.length-1,(sticky-bounds.top)/travel*(cards.length-1)));
   const index=calm?0:Math.round(progress);if(selected!==index){selected=index;setFocus(index);root.dataset.focus=String(index);}
   cards.forEach((card,i)=>{
    const delta=i-progress,radius=Math.min(730,Math.max(350,pin.clientWidth*.63)),pose=convexCardPose(delta,radius),active=Math.abs(delta)<.65;
    card.style.transform=calm?'':`translate(-50%,-50%) translate3d(${pose.x.toFixed(2)}px,${(Math.abs(delta)*8).toFixed(2)}px,${pose.z.toFixed(2)}px) rotateY(${pose.angle.toFixed(2)}deg)`;
    card.style.opacity=calm?'1':String(Math.max(.25,1-Math.abs(delta)*.26));card.style.zIndex=String(20-Math.round(Math.abs(delta)*3));card.style.setProperty('--layer-art',`${(-delta*10).toFixed(2)}px`);card.toggleAttribute('data-focused',active);card.inert=!calm&&!active;states[i].visible=visible&&(calm||active);card.dataset.visible=String(states[i].visible);
    if(states[i].visible&&!calm&&!states[i].scheduled&&['mes','twin'].includes(card.dataset.kind!)){
     states[i].scheduled=true;states[i].cancel=prepareScene(async()=>{try{const {mountApplicationArtwork}=await import('./application-artwork');if(disposed)return;states[i].artwork=mountApplicationArtwork(card.querySelector<HTMLCanvasElement>('[data-app-art]')!,card.dataset.kind!);paint(states[i]);card.querySelector<HTMLElement>('.application-diagram')!.dataset.artReady='true';}catch{card.dataset.artFallback='true';}},canPrepareHomeScene);
    }
    if(states[i].artwork&&states[i].visible)paint(states[i]);
   });start();
  };
  choose.current=i=>{if(calm){cards[i]?.scrollIntoView({block:'center',behavior:'auto'});setFocus(i);return;}const sticky=innerWidth<768?72:96,travel=(cards.length-1)*Math.max(260,innerHeight*.55);window.scrollTo({top:stage.getBoundingClientRect().top+scrollY-sticky+travel*i/(cards.length-1),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
  states.forEach(paint);const unsubscribe=subscribeScroll(layout),sizing=new ResizeObserver(layout);sizing.observe(pin);layout();
  const visibility=()=>{if(document.hidden)stop();else{layout();start();}};document.addEventListener('visibilitychange',visibility);
  return()=>{disposed=true;stop();unsubscribe();sizing.disconnect();document.removeEventListener('visibilitychange',visibility);states.forEach(state=>{state.cancel?.();state.artwork?.dispose();const canvas=state.card.querySelector<HTMLCanvasElement>('[data-app-art]');if(canvas){canvas.style.opacity='0';delete canvas.parentElement!.dataset.artReady;}state.card.inert=false;});};
 },[motionRevision]);
 return <div className="application-previews" ref={host} data-focus={focus}><div className="application-stage"><div className="application-pin"><div className="application-tabs" role="group" aria-label="Choose an application preview">{apps.map((app,i)=><button type="button" aria-pressed={focus===i} key={app.id} onClick={()=>choose.current(i)}>{app.name}</button>)}</div><div className="application-grid">{apps.map(app=><article className="application-screen" data-kind={app.id} data-tone={app.id==='twin'||app.id==='ai'?'smoked':'pearl'} key={app.id} id={`preview-${app.id}`}><header><div><h3>{app.name}</h3><span>{app.kind}</span></div><span className="preview-demo">Concept view</span></header><div className="application-diagram"><Diagram kind={app.id}/>{['mes','twin'].includes(app.id)&&<canvas data-app-art aria-hidden="true"/>}</div><div className="preview-state" aria-hidden="true"><span className="preview-status-light"/>{phaseLabels[app.id].map((label,step)=><span data-step={step} key={label}>{label}</span>)}<span className="preview-progress"><i/></span></div><div className="application-caption"><p>{app.copy}</p><Link href={app.href} aria-label={`Explore ${app.name}`}><ArrowUpRight size={20}/></Link></div></article>)}</div><div className="application-dots" aria-hidden="true">{apps.map((app,i)=><span data-on={focus===i} key={app.id}/>)}</div></div></div><p className="application-disclaimer">Illustrative interfaces and sample process data.</p></div>;
}
