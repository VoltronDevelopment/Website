import {Box,Layers3,Workflow,Cpu,Factory,Settings2,FileCheck2,Network,Users,Leaf,HandHeart,BookOpen,ScanLine,ShieldCheck,Compass} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
type Diagram={title:string;labels:string[];icons:LucideIcon[];layout:'hub'|'flow'|'stack'};
const diagrams:Record<string,Diagram>={
 'T03-voltron-core':{title:'Common services and shared identity',labels:['Identity','Voltron Core','Services'],icons:[Box,Layers3,Workflow],layout:'hub'},
 'T03-capability-modules':{title:'Connected manufacturing capabilities',labels:['Quality','Maintenance','Traceability'],icons:[ShieldCheck,Settings2,ScanLine],layout:'stack'},
 'T03-process-packs':{title:'Manufacturing logic for each process',labels:['Process','Requirements','Evidence'],icons:[Workflow,FileCheck2,Layers3],layout:'flow'},
 'T03-plant-configuration':{title:'Factory-specific configuration and integration',labels:['Equipment','Plant','Systems'],icons:[Settings2,Factory,Network],layout:'hub'},
 'T03-voltron-ai':{title:'Context-aware manufacturing intelligence',labels:['Context','Intelligence','Human judgment'],icons:[Layers3,Cpu,Users],layout:'hub'},
 'O03-identity-relationships':{title:'Distinct identities in a manufacturing situation',labels:['Part','Lot','Operation'],icons:[Box,Layers3,Workflow],layout:'stack'},
 'O04-manufacturing-relationships':{title:'Relationships connect requirements and evidence',labels:['Requirements','Process','Evidence'],icons:[FileCheck2,Workflow,ShieldCheck],layout:'flow'},
 'I04-point-of-work':{title:'Relevant context at the point of work',labels:['Part + lot','Station','Guidance'],icons:[Box,Factory,FileCheck2],layout:'hub'},
 'M02-phosphating':{title:'Illustrative phosphating surface preparation',labels:['Surface','Preparation','Coating base'],icons:[Box,Workflow,Layers3],layout:'flow'},
 'M02-ced':{title:'Illustrative electrophoretic coating',labels:['Part','Deposition','Coated surface'],icons:[Box,Workflow,ShieldCheck],layout:'flow'},
 'M02-powder-coating':{title:'Illustrative optional powder finishing',labels:['Requirement','Finish','Evidence'],icons:[FileCheck2,Layers3,ShieldCheck],layout:'flow'},
 'N05-industrial-products':{title:'Industrial product development as a future direction',labels:['Industrial need','Engineering','Product direction'],icons:[Compass,Settings2,Box],layout:'flow'},
 'A03-people-lattice':{title:'Connected disciplines and shared purpose',labels:['People','Knowledge','Production'],icons:[Users,BookOpen,Factory],layout:'hub'},
 'A05-people-culture':{title:'People and shared purpose',labels:['Individual','Shared purpose','Growth'],icons:[Users,HandHeart,Leaf],layout:'flow'},
 'A05-voltron-commons':{title:'Access, learning and possibility',labels:['Access','Learning','Possibility'],icons:[HandHeart,BookOpen,Leaf],layout:'flow'},
 'P03-individual-whole':{title:'Individual excellence aligned to the whole',labels:['Individual','Shared purpose','Whole'],icons:[Box,HandHeart,Layers3],layout:'hub'},
 'P04-responsibility':{title:'Judgment grows through responsibility',labels:['Practice','Feedback','Judgment'],icons:[Settings2,Users,Compass],layout:'flow'},
 'P05-perspectives':{title:'Distinct perspectives',labels:['Experience','Perspective','Contribution'],icons:[Users,Compass,Box],layout:'stack'},
 'P05-shared-purpose':{title:'Shared purpose',labels:['Individual','Purpose','Whole'],icons:[Users,HandHeart,Network],layout:'hub'},
 'P05-mutual-growth':{title:'Mutual growth',labels:['Learn','Contribute','Grow'],icons:[BookOpen,Users,Leaf],layout:'flow'},
 'C03-learning-nature':{title:'Learning across disciplines and nature',labels:['Inquiry','Exchange','Reflection'],icons:[Compass,Users,Leaf],layout:'hub'},
 'C04-participation':{title:'From intention to participation',labels:['Intention','Collaboration','Participation'],icons:[HandHeart,Network,Users],layout:'flow'},
};
/** Semantic diagrams complete unfulfilled secondary slots without inventing product/site imagery. */
export function ContextArtwork({family,className=''}:{family:string;className?:string}){
 const spec=diagrams[family];if(!spec)return null;
 return <div className={`brand-art context-art context-art-${spec.layout} ${className}`} data-artwork-family={family} role="img" aria-label={spec.title}><div className="context-art-structure" aria-hidden="true"><svg className="context-art-links" viewBox="0 0 360 150" preserveAspectRatio="none"><path d={spec.layout==='stack'?'M80 112 L180 36 L280 112':spec.layout==='hub'?'M55 90 L180 50 L305 90':'M55 76 H305'}/><circle cx="180" cy={spec.layout==='hub'?50:spec.layout==='stack'?36:76} r="4"/></svg>{spec.labels.map((label,i)=>{const Icon=spec.icons[i];return <div className="context-art-node" key={label}><span className="context-art-symbol"><Icon size={30} strokeWidth={1.25}/></span><span>{label}</span></div>;})}</div></div>;
}
