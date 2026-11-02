'use client';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {Pause,Play,RotateCcw,SkipForward,FileText} from 'lucide-react';
import {specialists,investigation} from './investigation-model';
import {advanceScenario,scenarioDuration,scenarioEvents,tasks,taskState} from './scenario';
import {prefersStaticScene} from '../performance/scene-policy';

function useScenarioState(){
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(true),[speed,setSpeed]=useState(1),[delayed,setDelayed]=useState(false),[supplied,setSupplied]=useState(false),[reviewed,setReviewed]=useState(false),[selected,setSelected]=useState<number|null>(null);
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{let visible=false,frame=0,last=0,published=0;
  const stop=()=>{cancelAnimationFrame(frame);last=0;};
  const tick=(now:number)=>{if(!visible||document.hidden||!playing)return;if(now-published>=80){const delta=last?Math.min((now-last)/1000,.2)*speed:0;last=now;published=now;setTime(t=>advanceScenario(t,delta,delayed,supplied));}frame=requestAnimationFrame(tick);};
  const resume=()=>{stop();if(prefersStaticScene()){setPlaying(false);return;}if(visible&&!document.hidden&&playing)frame=requestAnimationFrame(tick);};
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;resume();},{threshold:.1});if(host.current)observer.observe(host.current);
  const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',resume);document.addEventListener('visibilitychange',resume);window.addEventListener('voltron:motion',resume);resume();
  return()=>{stop();observer.disconnect();media.removeEventListener('change',resume);document.removeEventListener('visibilitychange',resume);window.removeEventListener('voltron:motion',resume);};
 },[playing,speed,delayed,supplied]);
 const waiting=delayed&&!supplied&&time>=18,complete=time>=scenarioDuration;
 useEffect(()=>{if(waiting||complete)setPlaying(false);},[waiting,complete]);
 const reset=()=>{setTime(0);setSupplied(false);setReviewed(false);setSelected(null);setPlaying(!prefersStaticScene());};
 return {time,setTime,playing,setPlaying,speed,setSpeed,delayed,setDelayed,supplied,setSupplied,reviewed,setReviewed,selected,setSelected,host,waiting,complete,reset};
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
export function InvestigationSimulation(){
 const [stageWidth,setStageWidth]=useState(900),[sheet,setSheet]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(sheet&&!dialog.current?.open)dialog.current?.showModal();else if(!sheet&&dialog.current?.open)dialog.current.close();},[sheet]);
 const s=useInvestigation(),canvas=useRef<HTMLCanvasElement>(null),stage=useRef<HTMLDivElement>(null),controller=useRef<ReturnType<typeof import('./orb-renderer').mountOrbs>|null>(null),[live,setLive]=useState(false);
 const routes=routeTemplates.map(r=>{const from=locations[r.from],to=locations[r.to],port=52*900/stageWidth,x1=Math.round(from.x*9+port),x2=Math.round(to.x*9-port),y1=Math.round(from.y*4.6),y2=Math.round(to.y*4.6),bend=Math.round((x1+x2)/2);return {...r,d:y1===y2?`M${x1} ${y1}H${x2}`:`M${x1} ${y1}H${bend}V${y2}H${x2}`};});
 useEffect(()=>{const observer=new ResizeObserver(([e])=>setStageWidth(e.contentRect.width||900));if(stage.current)observer.observe(stage.current);return()=>observer.disconnect();},[]);
 const active=tasks.findIndex((_,i)=>taskState(i,s.time,s.delayed,s.supplied).active),chosen=s.selected??(active<0?s.waiting?1:5:active),state=taskState(chosen,s.time,s.delayed,s.supplied),events=[...scenarioEvents.filter(e=>e.at<=s.time),...(s.time>=18&&s.delayed?[{at:18,text:s.supplied?'Calibration record supplied; quality check resumed':'Quality waits for the calibration record',from:-1,to:1}]:[])].sort((a,b)=>a.at-b.at);
 useEffect(()=>{let disposed=false,loading=false;const saveData=!!(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;const observer=new IntersectionObserver(async([e])=>{if(saveData||!e.isIntersecting||loading||controller.current)return;loading=true;try{const {mountOrbs}=await import('./orb-renderer');if(!disposed&&canvas.current&&stage.current){controller.current=mountOrbs(canvas.current,stage.current);setLive(true);}}catch{setLive(false);}} ,{rootMargin:'160px'});if(stage.current)observer.observe(stage.current);return()=>{disposed=true;observer.disconnect();controller.current?.dispose();controller.current=null;};},[]);
 useEffect(()=>controller.current?.select(chosen),[chosen,live]);
 const detail=<article className="scenario-detail" aria-live="polite"><p className="eyebrow">{specialists[chosen].name} / {specialists[chosen].role}</p><h3>{specialists[chosen].question}</h3><p>{specialists[chosen].action}</p><div className="scenario-records">{specialists[chosen].records.map((r,i)=><span key={r}><FileText size={14}/>{r}<small>{state.progress===1?'Associated':Math.floor(state.progress*2)>i?'Received':'Pending'}</small></span>)}</div><p className="scenario-status">{state.status} · {Math.floor(state.progress*2)} of 2 records associated</p>{state.progress===1&&<p>{tasks[chosen].result}.</p>}<button type="button" className="story-replay" onClick={()=>s.setSelected(null)}>Follow active specialist</button></article>;
 return <div ref={s.host} className="scenario" data-time={s.time.toFixed(2)}><div className="scenario-lot"><span className="eyebrow">Illustrative investigation</span><span>{investigation.lot} / {investigation.station}</span><span>Recorded condition needs review</span></div>
 <div className="scenario-controls"><button type="button" disabled={s.waiting||s.complete} onClick={()=>s.setPlaying(!s.playing)}>{s.playing?<Pause size={15}/>:<Play size={15}/>} {s.playing?'Pause':'Play'}</button><button type="button" disabled={s.waiting||s.complete} onClick={()=>{s.setPlaying(false);s.setTime(advanceScenario(s.time,1,s.delayed,s.supplied));}}><SkipForward size={15}/> Step</button><label>Speed <select value={s.speed} onChange={e=>s.setSpeed(+e.target.value)}><option value={1}>1×</option><option value={2}>2×</option><option value={.5}>0.5×</option></select></label><button type="button" onClick={s.reset}><RotateCcw size={15}/> Reset</button><span>{Math.floor(s.time)} / {scenarioDuration}s</span></div>
 <div className="scenario-layout"><div ref={stage} className="scenario-stage agent-observatory" data-live={live} data-selected={chosen}><canvas ref={canvas} aria-hidden="true"/><svg viewBox="0 0 900 460" preserveAspectRatio="none" aria-hidden="true">{routes.map(r=>{const event=scenarioEvents.find(e=>e.from===r.from&&e.to===r.to),age=event?s.time-event.at:-1,p=age>=0&&age<1.5?pulsePoint(r.d,age/1.5):null;return <g key={r.d}><path d={r.d} fill="none" stroke="var(--int-structure)" opacity=".3" strokeWidth="1.5"/>{p&&<circle cx={p[0]} cy={p[1]} r="4" fill="var(--int-accent)"/>}</g>;})}</svg>
 {specialists.map((a,i)=>{const task=taskState(i,s.time,s.delayed,s.supplied);return <button type="button" className="scenario-agent" key={a.name} style={{left:`${locations[i].x}%`,top:`${locations[i].y}%`}} aria-pressed={chosen===i} onClick={()=>{s.setSelected(i);if(matchMedia('(max-width:767px)').matches){s.setPlaying(false);setSheet(true);}}}><span className={`orb-window fluid-cube-fallback fluid-${i}`} data-orb={i} data-progress={task.progress.toFixed(3)} data-activity={task.active?1:task.status.startsWith('Waiting')?-1:0} aria-hidden="true"><i/></span><strong>{a.name}</strong><span>{a.role}</span><span className="task-track" data-waiting={task.status.startsWith('Waiting')} aria-hidden="true">{[0,1,2,3,4,5].map(n=><i key={n} data-filled={task.progress>n/6}/>)}</span><small>{task.status}</small></button>;})}<span className="scenario-parallel">Process + equipment / parallel checks</span></div>
 {detail}</div>
 <dialog ref={dialog} className="intelligence-sheet scenario-sheet" aria-label="Specialist investigation details" onCancel={()=>setSheet(false)} onClose={()=>setSheet(false)} onClick={e=>{if(e.target===dialog.current)setSheet(false);}}><header><h3>Specialist evidence</h3><button type="button" aria-label="Close specialist details" onClick={()=>setSheet(false)}>×</button></header>{sheet&&detail}</dialog>
 <div className="scenario-bottom"><details className="scenario-variation"><summary>Scenario options</summary><label><input type="checkbox" checked={s.delayed} onChange={e=>{s.setDelayed(e.target.checked);s.reset();}}/> Delay calibration evidence</label><p>Quality waits for the instrument record. Independent process and equipment checks continue.</p>{s.waiting&&<button type="button" onClick={()=>{s.setSupplied(true);s.setPlaying(!prefersStaticScene());}}>Provide calibration record</button>}<small>Changing this option restarts the investigation.</small></details><details className="scenario-log"><summary>Investigation events · {events.length}</summary><ol>{events.slice(-3).map((e,i)=><li key={`${e.at}-${i}`}><time>{String(e.at).padStart(2,'0')}s</time>{e.text}</li>)}</ol></details></div>
 <div className="scenario-review" role="status"><span className="status-dot"/><span>{s.complete?'Suggested check ready. Human review pending.':s.waiting?'Calibration evidence missing. The investigation retains an open question.':'Evidence is being examined. Findings will appear at the point of work.'}</span>{!s.complete&&<button type="button" onClick={()=>{s.setTime(s.delayed&&!s.supplied?18:28);s.setPlaying(false);}}>Advance to outcome</button>}</div></div>;
}
