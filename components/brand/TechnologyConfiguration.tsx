"use client";
import {useId,useState} from 'react';
const packs={
 'Phosphating':{operation:'Phosphating',evidence:'Surface-treatment evidence',context:'A surface-treatment process pack links its operation, equipment context and quality requirements.'},
 'CED':{operation:'Electrodeposition',evidence:'Coating evidence',context:'A CED process pack connects coating operations with their production and quality records.'},
 'Powder coating':{operation:'Powder application',evidence:'Coating evidence',context:'A powder-coating process pack adapts operation and evidence relationships while retaining the common core.'},
} as const;
export function TechnologyConfiguration(){
 const [pack,setPack]=useState<keyof typeof packs>('Phosphating'),id=useId(),current=packs[pack];
 return <div className="technology-configuration"><div className="configuration-toolbar"><div><h3>Process configuration</h3><p>A common core. A process-specific view.</p></div><label htmlFor={id}><span>Process pack</span><select aria-label="Process pack" id={id} value={pack} onChange={e=>setPack(e.target.value as keyof typeof packs)}>{Object.keys(packs).map(p=><option key={p}>{p}</option>)}</select></label></div>
  <div className="configuration-workspace"><div className="configuration-core"><span className="configuration-core-mark" aria-hidden="true"><i/><i/><i/></span><h4>Voltron Core</h4><p>Common data model, services and runtime.</p><ul><li>Shared identity</li><li>Traceability</li><li>Access and versions</li></ul></div><div className="configuration-process" aria-live="polite"><p className="configuration-pack-name">{pack} Process Pack</p><div className="configuration-flow" key={pack}><div><span>Process input</span><strong>Preparation context</strong></div><i aria-hidden="true">→</i><div className="configuration-operation"><span>Operation</span><strong>{current.operation}</strong></div><i aria-hidden="true">→</i><div><span>Quality record</span><strong>{current.evidence}</strong></div></div><p className="configuration-description">{current.context}</p><div className="configuration-plant"><strong>Plant Configuration</strong><span>Equipment mapping</span><span>Local integration</span><span>Plant-specific requirements</span></div></div></div>
  <div className="configuration-capabilities"><p><strong>Capability Modules</strong>Quality, maintenance and traceability support the process.</p><p><strong>Voltron AI</strong>Context-aware assistance uses connected evidence and retains human review.</p></div><p className="technology-example-note">Illustrative configuration, not an operating recipe. Process parameters and control responsibilities remain specific to the plant.</p>
 </div>;
}
