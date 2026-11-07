"use client";
import {useEntryChoice} from '@/lib/use-entry-choice';
import {useId} from 'react';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {processSlugs} from '@/lib/inquiry-intents';
import {SurfaceSection} from "./SurfaceSection";
import {AlphaLineExperience} from './AlphaLineExperience';

const disciplines=[
 {title:'Process consistency',text:'Connect each operation to its configured route and requirements.',nodes:['Configured route','Operation','Process history'],note:'A consistent route makes actual execution comparable with the intended sequence.'},
 {title:'Traceability',text:'Keep lot identity connected across the journey.',nodes:['Lot identity','Carrier / station','Connected history'],note:'The identity stays the same as equipment, location and process state change.'},
 {title:'Quality discipline',text:'Keep physical completion and authorised release distinct.',nodes:['Process complete','Inspection evidence','Human disposition'],note:'An unloaded part can still have an open inspection or quality disposition.'},
 {title:'Operating economics',text:'Understand duration, waiting and resource relationships.',nodes:['Operation duration','Waiting / resources','Production context'],note:'Connected process records provide a foundation for evaluating constraints; no performance result is claimed here.'},
];
const treatments=[
 {name:'Phosphating',title:'Prepare a consistent foundation.',text:'A conversion layer prepares the surface for subsequent processing.',kind:'Conversion layer',detail:'Surface preparation and route requirements are confirmed for the part.'},
 {name:'ED (CED)',title:'Build a controlled coating.',text:'Electrophoretic deposition applies a coating across the component.',kind:'Deposited coating',detail:'Coverage, coating requirements and readiness are established for the production inquiry.'},
 {name:'Powder coating',title:'Finish for the confirmed requirement.',text:'A separate finishing capability when the confirmed production route calls for it.',kind:'Finishing layer',detail:'Shown separately from the thirteen-tank demonstration; inclusion depends on the confirmed route.'},
];
export function ProductionInquiryLink({children, text=false}:{children:React.ReactNode;text?:boolean}){
 const [choice]=useEntryChoice('treatment',processSlugs.length,-1);
 const query=choice<0?'':'?process='+processSlugs[choice];
 return <Link className={'directional-action '+(text?'text-action':'button')} href={'/partner'+query+'#production'}>{children}<ArrowRight size={16} aria-hidden="true"/></Link>;
}
export function ManufacturingStory(){
 const [discipline,setDiscipline]=useEntryChoice('discipline',disciplines.length),[treatment,setTreatment]=useEntryChoice('treatment',treatments.length),id=useId();const d=disciplines[discipline],t=treatments[treatment];
 return <>
  <section id="explore-alpha" className="alpha-explore alpha-container" aria-label="Explore the Alpha treatment line"><div className="section-intro"><p className="eyebrow">Explore Voltron Alpha</p><h2>One lot. Every operation connected.</h2><p>Follow one lot through loading, thirteen treatment stations and unloading.</p></div><AlphaLineExperience/></section>
  <section className="alpha-container alpha-disciplines" aria-labelledby={`${id}-validation`}><div className="section-intro"><p className="eyebrow">What Alpha validates</p><h2 id={`${id}-validation`}>Production reality sharpens the architecture.</h2><p>Four disciplines being developed and evaluated through connected manufacturing.</p></div>
   <div className="alpha-discipline-layout"><div className="alpha-choice-list" role="group" aria-label="Validation discipline">{disciplines.map((item,i)=><button key={item.title} type="button" aria-pressed={discipline===i} onClick={()=>setDiscipline(i)}><span>0{i+1}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></button>)}</div>
   <div className="alpha-discipline-reading" aria-live="polite"><p className="eyebrow">{d.title}</p><ol key={discipline} className="alpha-proof-flow">{d.nodes.map((node,i)=><li key={node} style={{animationDelay:`${i*.15}s`}}><span>0{i+1}</span><strong>{node}</strong></li>)}</ol><p>{d.note}</p></div></div>
  </section>
  <section className="alpha-container alpha-scope" aria-labelledby={`${id}-scope`}><div className="section-intro"><p className="eyebrow">Process scope</p><h2 id={`${id}-scope`}>Configured around the surface requirement.</h2><p>One component. Different surface requirements. Scope and readiness are confirmed for each inquiry.</p></div>
   <div className="alpha-scope-layout"><div><div className="alpha-scope-selectors" role="group" aria-label="Surface treatment">{treatments.map((item,i)=><button key={item.name} type="button" aria-pressed={treatment===i} onClick={()=>setTreatment(i)}><span className="scope-label-wide">{item.name}</span><span className="scope-label-short">{["Phosphating","ED","Powder"][i]}</span></button>)}</div>
    <div className="alpha-surface-illustration" data-treatment={treatment}><SurfaceSection treatment={treatment}/></div></div>
    <div className="alpha-scope-reading" aria-live="polite"><p className="eyebrow">{t.name} / {t.kind}</p><h3>{t.title}</h3><p>{t.text}</p><p>{t.detail}</p></div></div>
  </section>
 </>;
}
