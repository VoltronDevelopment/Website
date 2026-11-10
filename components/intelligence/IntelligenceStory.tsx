'use client';
import {useEntryChoice} from '@/lib/use-entry-choice';
import {containDialogFocus,isDialogBackdropClick} from '../brand/dialog-focus';
import {useId,useState} from 'react';
import {ArrowRight,Check,Clock3,FileText,RotateCcw,X} from 'lucide-react';
import {usePresentationClock} from '../technology/use-presentation-clock';
import {useInspectorSheet} from './use-inspector-sheet';
import {CoatingCycle} from './CoatingCycle';
import {FluidCubeStudy} from './FluidCubeStudy';
import {AgentOrbs} from './AgentOrbs';
import {InvestigationSimulation,useInvestigation} from './InvestigationSimulation';
import {evidenceSources,investigation,specialists} from './investigation-model';

function RecordSheet({title,children,open,onClose}:{title:string;children:React.ReactNode;open:boolean;onClose:()=>void}){
 const ref=useInspectorSheet(open),id=useId();
 return <dialog onKeyDown={containDialogFocus} ref={ref} className="intelligence-sheet" aria-labelledby={id} onCancel={onClose} onClose={e=>{if(!e.currentTarget.open)onClose();}} onClick={e=>{if(isDialogBackdropClick(e))onClose();}}><header><h3 id={id}>{title}</h3><button type="button" aria-label="Close details" onClick={onClose}><X size={20}/></button></header>{children}</dialog>;
}
function LotBadge(){return <div className="investigation-identity"><span>{investigation.lot}</span><span>{investigation.station}</span><span>Illustrative investigation</span></div>;}
const sourceChecks=[
 'Match the channel and reading time to this operation.',
 'Match the inspected feature and inspection method to the requirement.',
 'Check the instrument identity and calibration validity on the measurement date.',
 'Link the nonconformance to the affected lot and its corrective action.',
 'Confirm the document owner and the revision used for the operation.',
 'Match the sample identity and test method to the lot.',
 'Verify the issuer and the material or lot covered by the certificate.',
 'Check who made the observation, when, and at which station.',
] as const;
function RecordDetail({selected}:{selected:number}){return <><p className="eyebrow">Connected evidence</p><h3>{evidenceSources[selected][0]}</h3><p>{evidenceSources[selected][1]}</p><dl className="record-provenance"><div><dt>Identity</dt><dd>{investigation.lot}</dd></div><div><dt>Operation</dt><dd>{investigation.station}</dd></div></dl><div className="evidence-check"><strong>Check before review</strong><p>{sourceChecks[selected]}</p></div></>;}
const evidenceStages = [
  { agent: 0, title: 'Record the observation', text: 'Match the reported condition to the coating station’s check.' },
  { agent: 3, title: 'Compare the process history', text: 'Compare this lot’s recorded conditions with the coating window.' },
  { agent: 4, title: 'Gather the source records', text: 'Link the source record to this lot and operation for review.' },
] as const;

function CoatingEvidence({stage, source,progress}: {stage: number; source: number;progress:number}) {
  const step = evidenceStages[stage];
  const specialist = specialists[step.agent];
  return <div className="coating-evidence">
    <figure className="coating-tank">
      <CoatingCycle progress={progress}/>
      <figcaption>Coating tank · {investigation.lot}</figcaption>
    </figure>
    <article className="coating-agent">
      <FluidCubeStudy agent={step.agent} compact/>
      <div><p className="eyebrow">{specialist.name} / {specialist.role}</p><h3>{step.title}</h3>
        <p>{step.text}</p>{stage===2 && <p className="agent-basis">{evidenceSources[source][0]} · Awaiting human review</p>}
      </div>
    </article>
  </div>;
}
export function EvidenceStory(){
 const [savedChapter,setChapter]=useEntryChoice('evidence-chapter',3,-1),[source,setSource]=useEntryChoice('source',evidenceSources.length),[sheet,setSheet]=useState(false);
 const chapter=savedChapter<0?null:savedChapter;
 const {host,progress}=usePresentationClock(0,12,sheet||chapter!==null),stage=chapter??Math.min(2,Math.floor(progress*3));
 return <div ref={host} className="evidence-story"><ol className="evidence-progression" aria-label="Evidence assembly">{['Observation','Context','Evidence'].map((label,i)=><li key={label} aria-current={stage===i?'step':undefined}><button type="button" aria-pressed={stage===i} onClick={()=>setChapter(i)}><span>0{i+1}</span>{label}</button></li>)}</ol><CoatingEvidence stage={stage} source={source} progress={chapter===null?progress:[.25,.55,1][chapter]}/><div className="source-choice"><label><span>Evidence source</span><select value={source} onChange={e=>{setSource(Number(e.target.value));setChapter(2);}}>{evidenceSources.map(([name],i)=><option key={name} value={i}>{name}</option>)}</select></label><button type="button" onClick={()=>{setChapter(2);setSheet(true);}}><FileText size={16}/>Inspect source</button></div><div className="source-selector" role="group" aria-label="Evidence sources">{evidenceSources.map(([name],i)=><button type="button" key={name} aria-pressed={source===i} onClick={()=>{setSource(i);setChapter(2);if(matchMedia('(max-width:767px)').matches)setSheet(true);}}><FileText size={15}/>{name}</button>)}</div><p className="story-caption">Illustrative lot and source records.</p><RecordSheet title={evidenceSources[source][0]} open={sheet} onClose={()=>setSheet(false)}><RecordDetail selected={source}/></RecordSheet></div>;
}
export function SpecialistStory(){
 const [selected,setSelected]=useEntryChoice('specialist',specialists.length),[sheet,setSheet]=useState(false);
 return <div className="specialist-story"><p className="story-caption">Select a specialist to explore its question and evidence.</p><AgentOrbs selected={selected} onSelect={i=>{setSelected(i);if(matchMedia('(max-width:767px)').matches)setSheet(true);}}/><RecordSheet title={`${specialists[selected].name} / ${specialists[selected].role}`} open={sheet} onClose={()=>setSheet(false)}>{sheet&&<FluidCubeStudy agent={selected} compact/>}<p className="eyebrow">Specialist assistance</p><h3>{specialists[selected].question}</h3><p>{specialists[selected].action}</p><ul>{specialists[selected].records.map(r=><li key={r}>{r}</li>)}</ul><p>Suggested checks remain subject to appropriate human review.</p></RecordSheet></div>;
}
export function CollaborationStory(){return <InvestigationSimulation/>;}
export function WorkAndReview(){
 const scenario=useInvestigation(),{reviewed,setReviewed}=scenario;
 const [view,setView]=useEntryChoice('review-view',3,-1),[record,setRecord]=useEntryChoice('review-record',3);
 const reviewId=useId(),progress=scenario.time/28;
 const manual=view>=0;
 const stage=manual?view:scenario.complete?2:scenario.time>=8?1:0;
 return <div className="work-review"><div className="vai-screen"><header><strong>V AI <span>Point of work</span></strong><span>{investigation.lot} / T06</span></header><div className="vai-screen-body"><nav aria-label="V AI investigation view">{['Situation','Evidence','Suggested check'].map((s,i)=><button type="button" key={s} aria-pressed={stage===i} onClick={()=>{setView(i);}}>{s}</button>)}</nav><div className="vai-observation"><p className="eyebrow">Observed condition / Tank 06</p><h3>Condition outside the configured window.</h3><svg viewBox="0 0 460 160" role="img" aria-label="Illustrative process history with a marked condition event">{stage===1&&<rect x={record===0?210:record===1?310:170} y="16" width="65" height="125" rx="4" fill="var(--int-selected)"/>}<path d="M15 130H445M15 80H445M15 30H445" stroke="var(--int-structure)" opacity=".16"/><path d="M15 55H445" stroke="var(--int-structure)" strokeDasharray="4 5" opacity=".6"/><path d="M15 113 60 109 105 114 150 105 195 99 240 42 285 47 330 91 375 103 445 99" fill="none" stroke="var(--int-accent)" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={manual||scenario.staticMode!==false?0:1-Math.min(1,progress*2)}/><circle cx="240" cy="42" r={stage>0?8:4} fill="var(--int-selected)" stroke="var(--int-accent)"/><text x="255" y="28" fill="var(--ink)" fontSize="12">Condition event</text></svg>{stage===1&&<div className="selected-screen-record" role="status">{["Process history · Tank 06 condition event","Inspection · Associated lot result","Equipment history · Station T06"][record]}</div>}<div className="screen-legend"><span>Recorded history</span><span>Configured window</span></div></div><aside className="vai-guidance" aria-label="Selected investigation view">
  {stage===0&&<section><h4>Tank 06 observation</h4><p>Compare the recorded condition with the configured window for this lot.</p></section>}
  {stage===1&&<section data-current="true"><h4>Connected records</h4><div className="screen-records">
   {['Process history','Inspection record','Equipment history'].map((name,i)=>
    <button type="button" key={name} aria-pressed={record===i} onClick={()=>{setRecord(i);setView(1);}}><FileText size={15}/>{name}<ArrowRight size={14}/></button>
   )}
  </div></section>}
  {stage===2&&<section data-current="true"><h4>Compare inspection with station history.</h4><p>{scenario.complete?'Evidence assembled for human review.':scenario.waiting?'Waiting for the calibration record.':'The investigation is assembling the evidence for this check.'}</p></section>}
 </aside></div></div><div className="human-decision"><div><p className="eyebrow">Human authority</p><h3>AI investigates. Evidence supports. Humans decide.</h3><p id={reviewId} role="status">{reviewed?'Review recorded in this illustration. No plant command or production approval has been issued.':scenario.complete?'The proposed check remains pending until the responsible person reviews it.':scenario.waiting?'Calibration record missing. The quality check will resume when it arrives.':'Review opens after the investigation is complete.'}</p></div><button type="button" className="button button-outline" disabled={!scenario.complete} aria-describedby={reviewId} onClick={()=>setReviewed(!reviewed)}>{reviewed?<RotateCcw size={17}/>:scenario.complete?<Check size={17}/>:<Clock3 size={17}/>} {reviewed?'Reset illustration':scenario.complete?'Record illustrative review':scenario.waiting?'Awaiting calibration':'Investigation in progress'}</button></div></div>;
}
