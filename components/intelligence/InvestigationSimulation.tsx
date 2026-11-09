'use client';
import {usePresentationClock} from '../technology/use-presentation-clock';
import {useInspectorSheet} from './use-inspector-sheet';
import {useAgentArtwork} from './use-agent-artwork';
import {containDialogFocus,isDialogBackdropClick} from '../brand/dialog-focus';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {FileText} from 'lucide-react';
import {specialists,investigation} from './investigation-model';
import {scenarioDuration,scenarioEvents,tasks,taskState} from './scenario';
import {AgentCloudPoster} from './AgentCloudPoster';


function useScenarioState(){
 const [delayed,setDelayed]=useState(false),[reviewed,setReviewed]=useState(false);
 const [selected,setSelected]=useState<number|null>(null),[inspecting,setInspecting]=useState(false);
 const {host,progress,staticMode}=usePresentationClock(Number(delayed),10,inspecting);
 // Reserve a second for the missing instrument record. Both variants finish at ten seconds.
 const elapsed=progress*10;
 const time=delayed ? elapsed<6 ? elapsed*3 : elapsed<7 ? 18 : 18+(elapsed-7)*10/3 : progress*scenarioDuration;
 const supplied=delayed&&elapsed>=7,waiting=delayed&&elapsed>=6&&!supplied,complete=progress===1;
 function chooseScenario(next:boolean){
  if(next===delayed)return;
  setSelected(null);setReviewed(false);setDelayed(next);
 }
 return {host,staticMode,inspecting,setInspecting,time,delayed,chooseScenario,supplied,waiting,complete,reviewed,setReviewed,selected,setSelected};
}
const ScenarioContext=createContext<ReturnType<typeof useScenarioState>|null>(null);
export function InvestigationProvider({children}:{children:React.ReactNode}){const value=useScenarioState();return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;}
export function useInvestigation(){const value=useContext(ScenarioContext);if(!value)throw new Error('Investigation provider missing');return value;}
const locations=[{x:9,y:50},{x:73,y:50},{x:50,y:77},{x:50,y:23},{x:29,y:50},{x:93,y:50}];
const routeTemplates=[{from:0,to:4,d:'M133 230H209'}, {from:4,to:3,d:'M313 230H350V106H398'},{from:4,to:2,d:'M313 230H350V354H398'},{from:3,to:1,d:'M502 106H570V230H605'},{from:2,to:1,d:'M502 354H570V230H605'},{from:1,to:5,d:'M709 230H785'}];
export function pulsePoint(d:string,progress:number){
 const points=d.match(/M(\d+) (\d+)H(\d+)(?:V(\d+)H(\d+))?/);if(!points)return [0,0];
 const x=+points[1],y=+points[2],x2=+points[3],y2=points[4]?+points[4]:y,x3=points[5]?+points[5]:x2;
 const a=Math.abs(x2-x),b=Math.abs(y2-y),c=Math.abs(x3-x2),dist=(a+b+c)*progress;
 return dist<=a?[x+Math.sign(x2-x)*dist,y]:dist<=a+b?[x2,y+Math.sign(y2-y)*(dist-a)]:[x2+Math.sign(x3-x2)*(dist-a-b),y2];
}
function MobileInvestigationMap({time,chosen}:{time:number;chosen:number}){
 const last=scenarioEvents.filter(e=>e.at<=time).at(-1);
 return <div className="scenario-mobile-map"><svg viewBox="0 0 900 460" role="img" aria-label="Investigation handoffs: operator to evidence, parallel process and equipment checks, quality, then fault investigation">
 {routeTemplates.map(r=>{const event=scenarioEvents.find(e=>e.from===r.from&&e.to===r.to),age=event?time-event.at:-1,point=age>=0&&age<1.5?pulsePoint(r.d,age/1.5):null;return <g key={r.d}><path d={r.d} fill="none" stroke="var(--int-structure)" strokeWidth="3" opacity={age>=0?.7:.25}/>{point&&<circle data-handoff-packet cx={point[0]} cy={point[1]} r="8" fill="var(--int-accent)"/>}</g>;})}
 {locations.map((p,i)=><g key={specialists[i].name} transform={`translate(${p.x*9} ${p.y*4.6})`}><rect x="-52" y="-27" width="104" height="54" rx="5" fill={chosen===i?'var(--int-selected)':'var(--int-fill)'} stroke={chosen===i?'var(--int-accent)':'var(--int-structure)'} strokeWidth={chosen===i?3:1}/><text textAnchor="middle" y="9" fill="var(--ink)" fontSize="27">{specialists[i].name}</text></g>)}
 </svg><p className="scenario-handoff-note">{last?.text}</p></div>;
}
export function InvestigationSimulation(){
 const [stageWidth,setStageWidth]=useState(900);
 const s=useInvestigation(),{inspecting:sheet,setInspecting:setSheet}=s;
 const dialog=useInspectorSheet(sheet);
 const stage=useRef<HTMLDivElement>(null);
 const routes=routeTemplates.map(r=>{const from=locations[r.from],to=locations[r.to],port=52*900/stageWidth,x1=Math.round(from.x*9+port),x2=Math.round(to.x*9-port),y1=Math.round(from.y*4.6),y2=Math.round(to.y*4.6),bend=Math.round((x1+x2)/2);return {...r,d:y1===y2?`M${x1} ${y1}H${x2}`:`M${x1} ${y1}H${bend}V${y2}H${x2}`};});
 useEffect(()=>{const observer=new ResizeObserver(([e])=>setStageWidth(e.contentRect.width||900));if(stage.current)observer.observe(stage.current);return()=>observer.disconnect();},[]);
 const active=tasks.findIndex((_,i)=>taskState(i,s.time,s.delayed,s.supplied).active),chosen=s.selected??(active<0?s.waiting?1:5:active),state=taskState(chosen,s.time,s.delayed,s.supplied),events=[...scenarioEvents.filter(e=>e.at<=s.time),...(s.time>=18&&s.delayed?[{at:18,text:s.supplied?'Calibration record supplied; quality check resumed':'Quality waits for the calibration record',from:-1,to:1}]:[])].sort((a,b)=>a.at-b.at);
 const canvas=useAgentArtwork(stage,chosen,'160px');
 const detail=<article className="scenario-detail" aria-live="polite"><p className="eyebrow">{specialists[chosen].name} / {specialists[chosen].role}</p><h3>{specialists[chosen].question}</h3><p>{specialists[chosen].action}</p><div className="scenario-records">{specialists[chosen].records.map((r,i)=><span key={r}><FileText size={14}/>{r}<small>{state.progress===1?'Associated':Math.floor(state.progress*2)>i?'Received':'Pending'}</small></span>)}</div><p className="scenario-status">{state.status} · {Math.floor(state.progress*2)} of 2 records associated</p>{state.progress===1&&<p>{tasks[chosen].result}.</p>}<button type="button" className="story-replay" onClick={()=>s.setSelected(null)}>Follow active specialist</button></article>;
 return <div ref={s.host} className="scenario" data-time={s.time.toFixed(2)}><div className="investigation-choice" role="group" aria-label="Investigation scenario">{[false,true].map(delay=><button key={String(delay)} type="button" aria-pressed={s.delayed===delay} onClick={()=>s.chooseScenario(delay)}>{delay?'Delayed calibration':'Standard investigation'}</button>)}</div><div className="scenario-lot"><span className="eyebrow">Illustrative investigation</span><span>{investigation.lot} / {investigation.station}</span><span>Recorded condition needs review</span></div>
 <div className="scenario-current-question"><strong>{specialists[chosen].name}</strong><button type="button" aria-haspopup="dialog" onClick={()=>setSheet(true)}>{specialists[chosen].question}</button></div>
  <MobileInvestigationMap time={s.time} chosen={chosen}/><div className="scenario-layout"><div ref={stage} className="scenario-stage agent-observatory" data-live="false" data-selected={chosen}><canvas ref={canvas} aria-hidden="true"/><svg viewBox="0 0 900 460" preserveAspectRatio="none" aria-hidden="true">{routes.map(r=>{const event=scenarioEvents.find(e=>e.from===r.from&&e.to===r.to),age=event?s.time-event.at:-1,p=age>=0&&age<1.5?pulsePoint(r.d,age/1.5):null;return <g key={r.d}><path d={r.d} fill="none" stroke="var(--int-structure)" opacity=".3" strokeWidth="1.5"/>{p&&<circle cx={p[0]} cy={p[1]} r="4" fill="var(--int-accent)"/>}</g>;})}</svg>
 {specialists.map((a,i)=>{const task=taskState(i,s.time,s.delayed,s.supplied);return <button type="button" className="scenario-agent" key={a.name} style={{left:`${locations[i].x}%`,top:`${locations[i].y}%`}} aria-pressed={chosen===i} onClick={()=>{s.setSelected(i);if(matchMedia('(max-width:767px)').matches){setSheet(true);}}}><span className={`orb-window fluid-cube-fallback fluid-${i}`} data-orb={i} data-progress={task.progress.toFixed(3)} data-activity={task.active?1:task.status.startsWith('Waiting')?-1:0} aria-hidden="true"><AgentCloudPoster agent={i}/></span><strong>{a.name}</strong><span>{a.role}</span><span className="task-track" data-waiting={task.status.startsWith('Waiting')} aria-hidden="true">{[0,1,2,3,4,5].map(n=><i key={n} data-filled={task.progress>n/6}/>)}</span><small>{task.status}</small></button>;})}<span className="scenario-parallel">Process + equipment / parallel checks</span></div>
 {detail}</div>
 <dialog onKeyDown={containDialogFocus} ref={dialog} className="intelligence-sheet scenario-sheet" aria-label="Specialist investigation details" onCancel={()=>setSheet(false)} onClose={e=>{if(!e.currentTarget.open)setSheet(false);}} onClick={e=>{if(isDialogBackdropClick(e))setSheet(false);}}><header><h3>Specialist evidence</h3><button type="button" aria-label="Close specialist details" onClick={()=>setSheet(false)}>×</button></header>{sheet&&detail}</dialog>
 <div className="scenario-bottom"><details className="scenario-log"><summary>Investigation events · {events.length}</summary><ol>{events.slice(-3).map((e,i)=><li key={`${e.at}-${i}`}><time>{Math.round(s.delayed?(e.at<=18?e.at/3:7+(e.at-18)*.3):e.at/scenarioDuration*10)}s</time>{e.text}</li>)}</ol></details></div>
 <div className="scenario-review" role="status"><span className="status-dot"/><span>{s.complete?'Suggested check ready. Human review pending.':s.waiting?'Calibration evidence missing. The investigation retains an open question.':'Evidence is being examined. Findings will appear at the point of work.'}</span></div></div>;
}
