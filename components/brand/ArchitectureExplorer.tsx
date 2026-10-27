"use client";
import {useId,useState} from 'react';
import {Activity,Boxes,Network,ScanLine,BrainCircuit} from 'lucide-react';
const systems=[
 {id:'mes',title:'V-MES',role:'Production execution',Icon:Boxes,detail:'The lot, operation and production record remain connected as work progresses.',records:['Part and lot identity','Operation record','Production status'],relation:'Production records acquire the identity of the part and operation.'},
 {id:'scada',title:'SCADA',role:'Machine visibility',Icon:Activity,detail:'Machine signals become useful evidence when they are associated with the equipment and operation they describe.',records:['Equipment identity','Signal history','Operating context'],relation:'Equipment signals are associated with the active operation.'},
 {id:'ontology',title:'V-MO',role:'Shared manufacturing meaning',Icon:Network,detail:'Plant, part, lot, process, equipment and evidence belong to the same manufacturing situation.',records:['Common identity','Meaningful relationships','Traceable evidence'],relation:'The shared model relates the part, process, equipment and evidence.'},
 {id:'twin',title:'V-Twin',role:'Process representation',Icon:ScanLine,detail:'A shared representation supports investigation of a process using its connected state and evidence.',records:['Process representation','Connected state','Investigation context'],relation:'A process representation uses the same identities and records.'},
 {id:'ai',title:'V-AI',role:'Evidence-led intelligence',Icon:BrainCircuit,detail:'Connected evidence supports investigation and suggestions. People retain authority over consequential decisions.',records:['Relevant evidence','Suggested action','Human review'],relation:'Evidence supports a recommendation that remains subject to human review.'},
] as const;
export function ArchitectureExplorer(){
 const [selected,setSelected]=useState(2),id=useId(),active=systems[selected];
 return <div className="technology-architecture" data-selected={active.id}>
  <p className="architecture-instruction">Select a system to explore its role.</p>
  <div className="technology-map" role="group" aria-label="Connected manufacturing systems">
   <svg className="technology-map-lines" viewBox="0 0 1000 340" preserveAspectRatio="none" aria-hidden="true"><path d="M200 85L500 170L800 85M200 255L500 170L800 255"/><path className="architecture-signal" key={selected} d={selected===0?'M200 85L500 170':selected===1?'M200 255L500 170':selected===3?'M500 170L800 85':selected===4?'M500 170L800 255':'M200 85L500 170L800 85M200 255L500 170L800 255'}/></svg>
   {systems.map((s,i)=><button key={s.id} className={`technology-node node-${s.id}`} type="button" aria-pressed={selected===i} aria-controls={id} onClick={()=>setSelected(i)}><s.Icon size={26} aria-hidden="true"/><span>{s.title}</span><small>{s.role}</small></button>)}
  </div>
  <div className="architecture-insight" id={id} aria-live="polite"><div><h3>{active.title} <span>{active.role}</span></h3><p>{active.detail}</p></div><dl className="architecture-records"><dt>Connected context</dt>{active.records.map(r=><dd key={r}>{r}</dd>)}</dl></div>
  <div className="architecture-example"><strong>One manufacturing situation</strong><span>Part + lot</span><i aria-hidden="true">→</i><span>Operation</span><i aria-hidden="true">→</i><span>Evidence</span><p>{active.relation}</p></div>
  <p className="technology-example-note">Illustrative architecture. These views describe responsibilities and relationships, not a live equipment-control interface.</p>
 </div>;
}
