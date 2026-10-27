"use client";
import {useId,useState} from 'react';
import {Factory,Activity,BookOpen,Workflow} from 'lucide-react';
const stages=[
 {title:'Build',record:'Design and set up the plant',detail:'Bring the process, equipment and manufacturing architecture together.',Icon:Factory},
 {title:'Operate',record:'Run connected production',detail:"Use connected systems within the plant's defined operating responsibilities.",Icon:Activity},
 {title:'Learn',record:'Capture process and quality intelligence',detail:'Identify what the operating evidence teaches about the manufacturing situation.',Icon:BookOpen},
 {title:'Improve',record:'Enhance performance',detail:'Validate improvements before turning learning into reusable capability.',Icon:Workflow},
] as const;
/** One owned-plant learning cycle. The same context remains visible across all stages. */
export function OwnedPlantCycle(){const [selected,setSelected]=useState(0),id=useId(),stage=stages[selected];return <div className="owned-plant-cycle"><p className="network-instruction">Explore how one plant turns operating evidence into reusable capability.</p><ol aria-label="Owned manufacturing environments">{stages.map((s,i)=><li key={s.title}><button type="button" aria-pressed={selected===i} aria-controls={id} onClick={()=>setSelected(i)}><s.Icon size={26} aria-hidden="true"/><span>{s.title}</span><small>{s.record}</small></button></li>)}</ol><div className="plant-cycle-detail" id={id} aria-live="polite"><div><h3>{stage.title}</h3><p>{stage.detail}</p></div><dl><dt>One manufacturing context</dt><dd>Plant and equipment</dd><dd>Process and requirements</dd><dd>Quality and operating evidence</dd></dl></div><div className="plant-learning-return"><span>Validated learning</span><i aria-hidden="true">→</i><strong>Reusable capability</strong><p>Apply reviewed learning within each plant&apos;s own configuration.</p></div></div>;}
