'use client';
import {useRef} from 'react';
import {useAgentArtwork} from './use-agent-artwork';
import {specialists} from './investigation-model';
import {AgentCloudPoster} from './AgentCloudPoster';
export function AgentOrbs({selected,onSelect}:{selected:number;onSelect:(index:number)=>void}){
 const host=useRef<HTMLDivElement>(null);
 const canvas=useAgentArtwork(host,selected,'200px');
 return <div ref={host} className="agent-observatory fluid-agent-gallery" data-live="false"><canvas ref={canvas} aria-hidden="true"/><div className="specialist-gallery">{specialists.map((a,i)=><button type="button" key={a.name} aria-pressed={selected===i} aria-label={`${a.name}, ${a.role}. Explore specialist`} onClick={()=>onSelect(i)}><span className={`orb-window fluid-cube-fallback fluid-${i}`} data-orb={i} aria-hidden="true"><AgentCloudPoster agent={i}/></span><strong>{a.name}</strong><span>{a.role}</span><small data-agent-state-label>Ready to investigate</small></button>)}</div><div className="agent-feature" id="selected-agent-detail"><div className={`orb-window orb-feature fluid-cube-fallback fluid-${selected}`} data-orb={selected} aria-hidden="true"><AgentCloudPoster agent={selected} featured/></div><div aria-live="polite"><p className="eyebrow">{specialists[selected].name} / {specialists[selected].role}</p><h3>{specialists[selected].question}</h3><p>{specialists[selected].action}</p><div className="agent-records" key={selected}>{specialists[selected].records.map(r=><span key={r}>{r}</span>)}</div><p className="agent-basis">Context → Relevant records → Suggested check</p></div></div></div>;
}
