"use client";
import {useHomeMotion} from './HomeMotion';
import Link from 'next/link';
import {prefersStaticScene} from '../performance/scene-policy';
import {ArrowUpRight} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {CARD_HOLD,applicationFrame,diagramBeat,mesLotX,twinCoated,twinPartPose} from './application-sequence';
import {convexCardPose} from './application-arc';
import {puzzleLabels,puzzlePiecePath,puzzleRest} from './ontology-puzzle-pieces';

const apps=[
 {id:'mes',name:'V-MES',kind:'Execution + SCADA',copy:'Coordinate work, machines and production records.',href:'/technology#architecture'},
 {id:'twin',name:'V-Twin',kind:'Process representation',copy:'A part is lowered through prepare, coat and finish.',href:'/manufacturing#explore-alpha'},
 {id:'ai',name:'V-AI',kind:'Agents & skills',copy:'A model, context, skills and tools for one defined task.',href:'/intelligence'},
 {id:'ontology',name:'V-MO',kind:'Manufacturing ontology',copy:'Concepts, rules, entities and relationships, one meaning.',href:'/ontology'},
];

const labels:Record<string,string>={
 mes:'A lot moves across receive, process, verify and release',
 twin:'A part lowers into prepare, then coat, then finish',
 ai:'Model, tools, context and skills connect to one agent',
 ontology:'Concepts, rules, entities and relationships fit together',
};

function Diagram({kind}:{kind:string}){
 return <svg viewBox="0 0 440 220" fontSize="14" role="img" aria-label={labels[kind]}>
  {kind==='mes'?<g>
   <path className="diagram-link" d="M40 112H400"/>
   {['Receive','Process','Verify','Release'].map((name,i)=>{const x=[78,166,254,342][i];return <g key={name}><path className="diagram-machine" d={`M${x} 104V120`}/><text className="diagram-label" x={x} y="156" textAnchor="middle">{name}</text>{i===2?<circle className="mes-verify" cx={x} cy="92" r="3.5"/>:null}</g>;})}
   <g className="mes-lot"><rect className="diagram-part" y="96" width="28" height="16" rx="3"/></g>
  </g>:null}
  {kind==='twin'?<g>
   <path className="diagram-link" d="M40 28H400"/>
   {([['Prepare',76],['Coat',184],['Finish',292]] as const).map(([name,x])=><g key={name} transform={`translate(${x} 108)`}><path className="tank-body" d="M4 8H68V34Q68 46 56 46H16Q4 46 4 34Z"/><path className="diagram-machine" d="M0 8H72"/>{name==='Coat'?<path className="tank-liquid" d="M12 26H60"/>:null}<text className="diagram-label" x="36" y="68" textAnchor="middle">{name}</text></g>)}
   <g className="twin-hoist"><rect className="twin-gantry" x="-20" y="20" width="40" height="16" rx="2"/><line className="twin-rope" x1="0" y1="36" x2="0" y2="58"/><g className="twin-part"><rect className="diagram-part" x="-8" y="58" width="16" height="14" rx="2"/></g></g>
  </g>:null}
  {kind==='ai'?<g>
   <path className="agent-link" data-step="0" pathLength="1" d="M220 30V74"/>
   <path className="agent-link" data-step="1" pathLength="1" d="M158 96H200"/>
   <path className="agent-link" data-step="2" pathLength="1" d="M240 96H302"/>
   <path className="agent-link" data-step="3" pathLength="1" d="M220 160V180"/>
   <g className="agent-cube" transform="translate(220 92)"><path className="agent-face agent-top" d="M0-16L18-7L0 2L-18-7Z"/><path className="agent-face agent-left" d="M-18-7L-18 11L0 20L0 2Z"/><path className="agent-face agent-right" d="M18-7L18 11L0 20L0 2Z"/></g>
   <text className="diagram-label" x="220" y="22" textAnchor="middle">Model</text>
   <text className="diagram-label" x="148" y="100" textAnchor="end">Tools</text>
   <text className="diagram-label" x="312" y="100" textAnchor="start">Context</text>
   <text className="diagram-label" x="220" y="146" textAnchor="middle">Agent</text>
   <text className="diagram-label" x="220" y="202" textAnchor="middle">Skills</text>
  </g>:null}
  {kind==='ontology'?<g>
   {puzzleLabels.map((name,id)=>{const rest=puzzleRest(id),checker=(id%2+(id>>1))%2===0;return <g className="puzzle-piece" data-piece={id} key={name} style={{['--rest-x' as string]:`${rest.x}px`,['--rest-y' as string]:`${rest.y}px`}}><path d={puzzlePiecePath(id)} fill={checker?'var(--diagram-surface)':'var(--diagram-glass)'} stroke="var(--diagram-ink)" strokeWidth="1.75" strokeLinejoin="round"/></g>;})}
   <text className="diagram-label" x="16" y="36">Concepts</text>
   <text className="diagram-label" x="424" y="36" textAnchor="end">Rules</text>
   <text className="diagram-label" x="16" y="200">Entities</text>
   <text className="diagram-label" x="424" y="200" textAnchor="end">Relationships</text>
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
  const cards=[...root.querySelectorAll<HTMLElement>('.application-screen')],stage=root.querySelector<HTMLElement>('.application-stage')!;
  const calm=prefersStaticScene(),states=cards.map(card=>({card,time:calm?CARD_HOLD:0}));
  let frame=0,previous=0,disposed=false,elapsed=0,progress=0,playing=-1,away=false,seen=false,seekFrom=0,seekTo=0,seekU=0;
  let mode:'auto'|'seek'|'held'='auto',direction:'forward'|'return'='forward';
  const paint=(state:typeof states[number])=>{
   const beat=diagramBeat(state.time),{card}=state;
   card.dataset.step=String(beat.step);card.dataset.complete=String(beat.travel>=1);card.style.setProperty('--diagram-travel',beat.travel.toFixed(3));card.style.setProperty('--diagram-form','1');
   const lot=card.querySelector<SVGElement>('.mes-lot');if(lot)lot.style.transform=`translate(${mesLotX(beat.step)}px,0)`;
   const pose=twinPartPose(beat.step,beat.within),hoist=card.querySelector<SVGElement>('.twin-hoist'),part=card.querySelector<SVGElement>('.twin-part'),rope=card.querySelector<SVGLineElement>('.twin-rope');
   if(hoist)hoist.style.transform=`translate(${pose.x}px,0)`;if(part)part.style.transform=`translate(0,${pose.y.toFixed(2)}px)`;if(rope)rope.setAttribute('y2',pose.rope.toFixed(2));card.dataset.coated=String(card.dataset.kind==='twin'&&twinCoated(beat.step,beat.within));
  };
  const stop=()=>{cancelAnimationFrame(frame);frame=0;previous=0;};
  const place=()=>{
   if(calm){cards.forEach(card=>{card.style.transform='';card.style.opacity='1';card.inert=false;});return;}
   const index=Math.round(progress),narrow=stage.clientWidth<520,radius=Math.min(730,Math.max(narrow?560:350,stage.clientWidth*(narrow?1.7:.63)));
   cards.forEach((card,i)=>{
    const delta=i-progress,pose=convexCardPose(delta,radius),active=i===index;
    card.style.transform=calm?'':`translate(-50%,-50%) translate3d(${pose.x.toFixed(2)}px,${(Math.abs(delta)*8).toFixed(2)}px,${pose.z.toFixed(2)}px) rotateY(${pose.angle.toFixed(2)}deg)`;
    card.style.opacity=calm?'1':String(Math.max(.25,1-Math.abs(delta)*.26));card.style.zIndex=String(20-Math.round(Math.abs(delta)*3));card.toggleAttribute('data-focused',active);card.inert=!calm&&!active;
   });
   if(root.dataset.focus!==String(index)){root.dataset.focus=String(index);setFocus(index);}
  };
  const tick=(now:number)=>{
   frame=0;if(document.hidden||disposed)return;const delta=previous?Math.min(.05,(now-previous)/1000):0;previous=now;
   if(mode==='seek'){seekU=Math.min(1,seekU+delta/.4);const eased=1-(1-seekU)**3;progress=seekFrom+(seekTo-seekFrom)*eased;direction='forward';if(seekU>=1){progress=seekTo;mode='held';}}
   else if(mode==='auto'){elapsed+=delta;const next=applicationFrame(elapsed);progress=next.progress;direction=next.direction;const index=Math.round(progress);if(direction==='forward'&&progress===index&&playing!==index){playing=index;states[index].time=0;}if(direction==='return')playing=-1;}
   const index=mode==='seek'?seekTo:Math.round(progress);
   const playingDiagram=(mode==='auto'&&direction==='forward'&&progress===index)||mode==='seek'||mode==='held';
   if(playingDiagram&&states[index].time<CARD_HOLD)states[index].time=Math.min(CARD_HOLD,states[index].time+delta);
   states.forEach(paint);place();
   if(mode==='auto'||mode==='seek'||states[index].time<CARD_HOLD)frame=requestAnimationFrame(tick);else previous=0;
  };
  const start=()=>{if(!calm&&!document.hidden&&!frame&&!disposed){previous=0;frame=requestAnimationFrame(tick);}};
  choose.current=i=>{
   if(calm){root.dataset.focus=String(i);setFocus(i);cards.forEach((card,n)=>card.toggleAttribute('data-focused',n===i));return;}
   seekFrom=progress;seekTo=i;seekU=0;mode='seek';playing=i;states[i].time=0;direction='forward';start();
  };
  root.dataset.arc=calm?'off':'on';states.forEach(paint);place();
  const observer=new IntersectionObserver(([entry])=>{
   const on=entry.isIntersecting&&entry.intersectionRatio>.2;
   if(!on){away=seen;stop();return;}seen=true;
   if(away&&!calm){away=false;elapsed=0;progress=0;playing=-1;mode='auto';direction='forward';states.forEach(state=>{state.time=0;});}
   place();start();
  },{threshold:[0,.2,.45]});
  observer.observe(stage);
  const sizing=new ResizeObserver(()=>place());sizing.observe(stage);
  const visibility=()=>{if(document.hidden)stop();else start();};document.addEventListener('visibilitychange',visibility);
  return()=>{disposed=true;stop();observer.disconnect();sizing.disconnect();document.removeEventListener('visibilitychange',visibility);cards.forEach(card=>{card.inert=false;});};
 },[motionRevision]);
 return <div className="application-previews" ref={host} data-focus={focus}><div className="application-stage"><div className="application-pin"><div className="application-tabs" role="group" aria-label="Choose an application preview">{apps.map((app,i)=><button type="button" aria-pressed={focus===i} key={app.id} onClick={()=>choose.current(i)}>{app.name}</button>)}</div><div className="application-grid">{apps.map(app=><article className="application-screen" data-kind={app.id} data-tone={app.id==='twin'||app.id==='ai'?'smoked':'pearl'} key={app.id} id={`preview-${app.id}`}><header><div><h3>{app.name}</h3><span>{app.kind}</span></div><span className="preview-demo">Concept view</span></header><div className="application-diagram"><Diagram kind={app.id}/></div><div className="preview-state" aria-hidden="true"><span className="preview-status-light"/>{phaseLabels[app.id].map((label,step)=><span data-step={step} key={label}>{label}</span>)}<span className="preview-progress"><i/></span></div><div className="application-caption"><p>{app.copy}</p><Link href={app.href} aria-label={`Explore ${app.name}`}><ArrowUpRight size={20}/></Link></div></article>)}</div><div className="application-dots" aria-hidden="true">{apps.map((app,i)=><span data-on={focus===i} key={app.id}/>)}</div></div></div><p className="application-disclaimer">Illustrative interfaces and sample process data.</p></div>;
}
