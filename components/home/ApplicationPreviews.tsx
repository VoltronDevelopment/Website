"use client";
import {useEntryChoice} from '@/lib/use-entry-choice';
import {allowPageWheelOverRow} from '../performance/card-row-input';
import {productLabel} from '@/lib/product-names';
import {AgentPreview} from './AgentPreview';
import {useHomeMotion} from './HomeMotion';
import Link from 'next/link';
import {prefersStaticScene} from '../performance/scene-policy';
import {ArrowUpRight} from 'lucide-react';
import {useEffect,useRef,useState} from 'react';
import {isSceneScrollActive} from './scene-preparation';
import {CARD_HOLD,diagramBeat,mesLotPose,twinCoated,twinPartPose} from './application-sequence';
import {convexCardPose} from './application-arc';
import {puzzleLabels,puzzlePiecePath,puzzleRest} from './ontology-puzzle-pieces';

const apps=[
 {id:'mes',name:productLabel['V-MES'],kind:'Production execution',copy:'Connect each operation to the evidence needed for release.',href:'/technology?product=mes#architecture'},
 {id:'twin',name:productLabel['V-Twin'],kind:'Process representation',copy:'A part is lowered through prepare, coat and finish.',href:'/manufacturing#explore-alpha'},
 {id:'ai',name:productLabel['V-AI'],kind:'Agents & skills',copy:'A model, context, skills and tools for one defined task.',href:'/intelligence'},
 {id:'ontology',name:productLabel['V-MO'],kind:'Manufacturing ontology',copy:'Concepts, rules, entities and relationships, one meaning.',href:'/technology?product=ontology#architecture'},
 {id:'scada',name:productLabel.SCADA,kind:'Equipment visibility',copy:'Follow a tank reading from the station to the lot record.',href:'/technology?product=scada#architecture'},
];

const labels:Record<string,string>={
 scada:'Illustrative Tank 06 condition trend crosses the review threshold during lot 042',
 mes:'A work order waits for inspection evidence before its manufacturing lot is released',
 twin:'A part lowers into prepare, then coat, then finish',
 ai:'Model, tools, context and skills connect to one agent',
 ontology:'Concepts, rules, entities and relationships fit together',
};

function Diagram({kind}:{kind:string}){
 return <svg viewBox="0 0 440 220" fontSize="14" role="img" aria-label={labels[kind]}>
  {kind==='mes'?<g className="mes-execution">
   <rect className="mes-order" x="20" y="18" width="222" height="139" rx="5"/>
   <text className="mes-kicker" x="34" y="39">WORK ORDER</text>
   <text className="mes-order-id" x="34" y="65">LOT 042</text>
   <path className="diagram-link" d="M34 78H222"/>
   <text className="mes-stage-copy" x="34" y="101">Identify material</text>
   <g className="mes-record-row"><path className="diagram-link" d="M35 127H219"/>
    {[40,96,152,212].map((x,i)=><g className="mes-record-node" data-record={i} key={x}><circle cx={x} cy="127" r="5"/><path d={`M${x-2} 127L${x} 129L${x+3} 125`}/></g>)}
   </g>
   <rect className="mes-station-panel" x="270" y="18" width="150" height="139" rx="5"/>
   <text className="mes-kicker" x="284" y="39">STATION 03</text>
   <path className="diagram-machine" d="M296 116V62H394V116M309 116V98H381V116M345 62V83"/>
   <path className="mes-operation-tool diagram-machine" d="M338 83H352V91L345 96L338 91Z"/>
   <rect className="diagram-part" x="329" y="107" width="32" height="8" rx="1"/>
   <path className="mes-inspection" d="M313 74H377"/>
   <path className="mes-handoff" pathLength="1" d="M270 91H242"/>
   <circle className="mes-handoff-dot" r="3" cx="270" cy="91"/>
   <rect className="mes-evidence-strip" x="20" y="177" width="400" height="30" rx="4"/>
   <text className="mes-kicker" x="32" y="196">EVIDENCE</text>
   <g className="mes-evidence"><path d="M112 191L116 195L123 187"/><text x="131" y="196">Inspection linked to lot</text></g>
   <g className="mes-release"><path d="M375 187V196M371 192L375 196L379 192"/><text x="307" y="196">Released</text></g>
  </g>:null}
  {kind==='scada'&&<g>
   <text className="mes-kicker" x="28" y="30">TANK 06 / CONDITION TREND</text>
   <text className="diagram-label" x="410" y="30" textAnchor="end">Lot 042</text>
   <path className="scada-chart-grid" d="M32 56V172H405 M32 137H405 M32 102H405"/>
   <path className="diagram-link" strokeDasharray="5 5" d="M32 85H405"/>
   <text className="diagram-label" x="405" y="72" textAnchor="end">Review threshold</text>
   <path className="scada-trace" pathLength="1" d="M34 144L70 143L98 149L128 140L156 143L183 134L210 136L230 127L250 107L267 74L285 58L303 61L321 55L342 66L364 99L384 114L405 118"/>
   <text className="diagram-label" x="32" y="198">Observation window</text>
  </g>}
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
 scada:['Station identified','Trend recorded','Threshold crossed','Observation linked'],
 mes:['Lot identified','Execution recorded','Inspection evidence linked','Release recorded'],
 twin:['Prepare','Coat','Finish','Raised clear'],
 ai:['Model','Tools','Context','Skills'],
 ontology:['Concepts','Rules','Entities','Relationships'],
};
const workingLabels:Record<string,string[]>={scada:phaseLabels.scada,mes:['Identifying material','Recording operation','Awaiting inspection','Recording release'],twin:['Prepare','Coat','Finish','Raising clear'],ai:phaseLabels.ai,ontology:phaseLabels.ontology};

export function ApplicationPreviews(){
 const [savedApp,saveApp]=useEntryChoice('application',apps.length,-1);
 const motionRevision=useHomeMotion(),host=useRef<HTMLDivElement>(null),[focus,setFocus]=useState(0),choose=useRef<(i:number)=>void>(()=>{});
 useEffect(()=>{
  const root=host.current;if(!root)return;
  const cards=[...root.querySelectorAll<HTMLElement>('.application-screen')];
  const stage=root.querySelector<HTMLElement>('.application-stage')!;
  const grid=root.querySelector<HTMLElement>('.application-grid')!;
  const calm=prefersStaticScene();
  const phone=matchMedia("(max-width:767px)");
  const singleCard=()=>calm&&!phone.matches;
  const states=cards.map(card=>({card,time:calm?CARD_HOLD:0}));
  let frame=0,previous=0,progress=0,target=0,current=0,visible=false,disposed=false;
  let settling=false,settleTimer=0;
  const paint=({card,time}:typeof states[number])=>{
   const beat=diagramBeat(time, CARD_HOLD * .66),lotPose=mesLotPose(beat.step,beat.within);
   card.dataset.step=String(beat.step);card.dataset.complete=String(beat.travel>=1);card.dataset.recorded=String(lotPose.recorded);
   card.style.setProperty('--diagram-travel',String(beat.travel));card.style.setProperty('--diagram-form','1');
   const work=Math.max(0,Math.min(1,(beat.within-.32)/.4));
   card.style.setProperty('--mes-work',String(work));
   const status=card.querySelector('.preview-status-copy'),kind=card.dataset.kind!;
   const text=(lotPose.recorded?phaseLabels:workingLabels)[kind][beat.step];if(status&&status.textContent!==text)status.textContent=text;
   const order=card.querySelector('.mes-stage-copy');
   const orderText=(lotPose.recorded?['Material identified','Operation recorded','Inspection accepted','Lot released']:['Identifying material','Operation in progress','Awaiting inspection','Authorising release'])[beat.step];
   if(order&&order.textContent!==orderText)order.textContent=orderText;
   const dot=card.querySelector('.mes-handoff-dot');if(dot)dot.setAttribute('cx',String(270-work*28));
   const pose=twinPartPose(beat.step,beat.within),hoist=card.querySelector('.twin-hoist'),part=card.querySelector('.twin-part'),rope=card.querySelector('.twin-rope');
   hoist?.setAttribute('transform',`translate(${pose.x} 0)`);part?.setAttribute('transform',`translate(0 ${pose.y})`);rope?.setAttribute('y2',String(pose.rope));
   card.dataset.coated=String(kind==='twin'&&twinCoated(beat.step,beat.within));
  };
  const place=()=>{
   const flat=singleCard(),index=Math.round(progress);
   root.dataset.compact=String(flat);
   root.dataset.arc=flat?'off':'on';
   cards.forEach((card,i)=>{
    const active=i===index,delta=i-progress,pose=convexCardPose(delta,1);
    card.hidden=flat&&!active;card.inert=!active;card.toggleAttribute('data-focused',active);
    card.style.transform=calm?'':`perspective(1100px) rotateY(${pose.angle*.55}deg) scale(${1-Math.min(.1,Math.abs(delta)*.08)})`;
    card.style.opacity=calm?'1':String(Math.max(.2,1-Math.abs(delta)*.32));card.style.zIndex=String(20-Math.round(Math.abs(delta)*3));
   });
   if(current!==index){current=index;setFocus(index);}root.dataset.focus=String(index);
  };
  const stop=()=>{cancelAnimationFrame(frame);frame=0;previous=0;};
  const tick=(now:number)=>{
   frame=0;if(disposed||!visible||document.hidden)return;
   const delta=previous?Math.min(.06,(now-previous)/1000):0;previous=now;
   if(progress!==target){progress=target;place();}
   const index=Math.round(progress),settled=!settling;
   if(settled && !isSceneScrollActive(now) && states[index].time<CARD_HOLD){
    states[index].time=Math.min(CARD_HOLD,states[index].time+delta);
    paint(states[index]);
   }
   if(progress!==target||(settled&&states[index].time<CARD_HOLD))frame=requestAnimationFrame(tick);else previous=0;
  };
  const start=()=>{if(!calm&&visible&&!document.hidden&&!frame&&!disposed){previous=0;frame=requestAnimationFrame(tick);}};
  const measureStride=()=>cards[1].offsetLeft-cards[0].offsetLeft;
  let stride=measureStride();
  let pendingChoice:number|null=null;
  const scroll=()=>{
   if(singleCard()||pendingChoice!==null)return;
   const step=stride;
   if(step>0)target=Math.max(0,Math.min(cards.length-1,grid.scrollLeft/step));
   if(calm){progress=target;place();return;}
   settling=true;clearTimeout(settleTimer);settleTimer=window.setTimeout(()=>{settling=false;start();},100);
   start();
  };
  const alignChoice=()=>{
   if(pendingChoice===null||!visible)return;
   stride=measureStride();
   if(stride<=0||grid.scrollWidth<=grid.clientWidth)return;
   const index=pendingChoice;
   pendingChoice=null;
   grid.scrollTo({left:index*stride,behavior:calm?'instant':'smooth'});
  };
  choose.current=i=>{
   if(singleCard()){progress=target=i;place();paint(states[i]);start();return;}
   pendingChoice=i;
   if(!visible){progress=target=i;place();}
   alignChoice();
  };
  states.forEach(paint);place();root.dataset.galleryReady='true';
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.3;if(visible){alignChoice();scroll();start();}else stop();},{threshold:[0,.3]});observer.observe(grid);
  const resize=new ResizeObserver(()=>{place();stride=measureStride();alignChoice();scroll();});resize.observe(stage);resize.observe(cards[0]);
  const visibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',visibility);
  const releaseWheel=allowPageWheelOverRow(grid);
  grid.addEventListener('scroll',scroll,{passive:true});
  return()=>{releaseWheel();disposed=true;clearTimeout(settleTimer);stop();observer.disconnect();resize.disconnect();document.removeEventListener('visibilitychange',visibility);grid.removeEventListener('scroll',scroll);cards.forEach(card=>{card.inert=false;card.hidden=false;});};
 },[motionRevision]);
 useEffect(()=>{if(savedApp>=0)choose.current(savedApp);},[savedApp,motionRevision]);
 useEffect(()=>{
  const restore=()=>{
   const entry=history.state?.voltronPreviewLink;
   if(!entry||entry.path!==location.pathname)return;
   const link=host.current?.querySelector<HTMLAnchorElement>('#preview-'+CSS.escape(entry.id)+' a');
   if(!link)return;
   const {voltronPreviewLink,...remaining}=history.state;
   history.replaceState(remaining,'');
   link.focus({preventScroll:true});
  };
  const frame=requestAnimationFrame(restore);
  window.addEventListener('pageshow',restore);
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('pageshow',restore);};
 },[]);
 return <div className="application-previews" ref={host} data-focus={focus} data-arc="on"><div className="application-stage"><div className="application-pin"><div className="application-tabs" role="group" aria-label="Choose an application preview">{apps.map((app,i)=><button type="button" aria-pressed={focus===i} key={app.id} onClick={()=>{if(savedApp===i)choose.current(i);else saveApp(i);}}>{app.name}</button>)}</div><div className="application-grid">{apps.map((app,i)=><article className="application-screen" data-focused={focus===i?true:undefined} data-kind={app.id} data-tone={i%2?'smoked':'pearl'} key={app.id} id={`preview-${app.id}`}><header><div><h3>{app.name}</h3><span>{app.kind}</span></div></header><div className="application-diagram">{app.id==='ai'?<AgentPreview/>:<Diagram kind={app.id}/>}</div><div className="preview-state"><span className="preview-status-light"/><span className="preview-status-copy">{workingLabels[app.id][0]}</span><span className="preview-progress"><i/></span></div><div className="application-caption"><p>{app.copy}</p><Link href={app.href} onClick={event=>{
 if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 saveApp(i);history.replaceState({...history.state,voltronPreviewLink:{id:app.id,path:location.pathname}},'');
 }} aria-label={`Explore ${app.name}`}><ArrowUpRight size={20}/></Link></div></article>)}</div><div className="application-dots" aria-hidden="true">{apps.map((app,i)=><span data-on={focus===i} key={app.id}/>)}</div></div></div></div>;
}
