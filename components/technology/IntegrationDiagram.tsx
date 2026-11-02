"use client";
import {useState,type CSSProperties} from 'react';
import {Boxes,Factory,FileCheck2,ChartNoAxesColumnIncreasing,RotateCcw} from 'lucide-react';
import {usePresentationClock} from './use-presentation-clock';
import './product-showcase.css';
import './integration-diagram.css';
const systems=[{title:'Business & planning',caption:'Orders and production intent',Icon:ChartNoAxesColumnIncreasing},{title:'Production execution',caption:'Operations and recorded progress',Icon:Boxes},{title:'Quality & evidence',caption:'Inspection and traceability',Icon:FileCheck2},{title:'Equipment & control',caption:'Signals and defined control responsibilities',Icon:Factory}];
export function IntegrationDiagram(){
 const [revision,setRevision]=useState(0);const {host,progress,running}=usePresentationClock(revision,12);const stage=Math.min(4,Math.floor(progress*5));
 return <div ref={host} className="product-showcase integration-demo" data-running={running} data-stage={stage} style={{'--integration-progress':progress} as CSSProperties}>
  <div className="integration-canvas"><svg viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true">{['M250 95 H340 V230 H405','M595 230 H660 V95 H750','M250 365 H340 V230 H405','M595 230 H660 V365 H750'].map((d,i)=><g key={d} data-reached={stage>=(i===0?0:i)}><path d={d}/><path className="integration-packet" pathLength="100" d={d}/></g>)}</svg>
   <div className="integration-core"><Boxes size={38}/><span>Voltron</span><strong>Manufacturing context</strong><small>Shared identities · Connected records</small></div>
   {systems.map(({title,caption,Icon},i)=><div key={title} className={`integration-system integration-system-${i}`} data-reached={stage>=(i===0?0:i)}><Icon size={25}/><h3>{title}</h3><p>{caption}</p></div>)}
  </div><div className="integration-caption"><p>{['An order establishes the manufacturing intent.','Execution records the operation against the same identity.','Quality evidence attaches to the manufacturing record.','Equipment observations complete the operational context.','Connected information. Clear system responsibilities.'][stage]}</p><button onClick={()=>setRevision(r=>r+1)}><RotateCcw size={15}/>Replay</button></div>
 </div>;
}
