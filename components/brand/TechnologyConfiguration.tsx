"use client";
import Link from 'next/link';
import {useEffect,useId,useRef,useState} from 'react';
import {ArrowRight,Box,Boxes,Settings2} from 'lucide-react';
import {DetailsDialog} from './DetailsDialog';
import {processPacks,modularityCells,configurationPosition} from './modularity-model';
import {prefersStaticScene} from '../performance/scene-policy';
import {useHomeMotion} from '../home/HomeMotion';
import './modularity.css';

function StaticLattice({selected}:{selected:number}){
 const point=(x:number,y:number,z:number)=>`${280+(x-z)*57},${230+(x+z)*27-y*65}`;
 const path=(vertices:number[][])=>vertices.map((p,i)=>(i?'L':'M')+point(...p as [number,number,number])).join('')+'Z';
 return <svg className="modularity-fallback" viewBox="0 0 560 460" aria-hidden="true"><defs><linearGradient id="modularity-pearl" x2="1" y2="1"><stop stopColor="var(--module-pearl-hi)"/><stop offset="1" stopColor="var(--module-pearl-lo)"/></linearGradient><linearGradient id="modularity-smoked" x2="1" y2="1"><stop stopColor="var(--module-smoke-hi)"/><stop offset="1" stopColor="var(--module-smoke-lo)"/></linearGradient></defs>
  {[...modularityCells,configurationPosition].map((p,index)=>({p,index})).sort((a,b)=>(a.p[0]+a.p[2]+a.p[1]*.3)-(b.p[0]+b.p[2]+b.p[1]*.3)).map(({p:[x,y,z],index})=>{const h=.825,a=[x-h,y+h,z-h],b=[x+h,y+h,z-h],c=[x+h,y+h,z+h],d=[x-h,y+h,z+h],e=[x+h,y-h,z-h],f=[x+h,y-h,z+h],g=[x-h,y-h,z+h];return <g key={index} className={index===selected+1||index===6?'module-static-active':''} fill={(index===6?[0,2,5].includes(selected+1):[0,2,5].includes(index))?'url(#modularity-smoked)':'url(#modularity-pearl)'} stroke="var(--module-edge)" strokeWidth="1"><path d={path([d,c,f,g])} opacity=".86"/><path d={path([b,e,f,c])} opacity=".72"/><path d={path([a,b,c,d])}/></g>;})}
 </svg>;
}
function ProcessDetail({index,titleId}:{index:number;titleId:string}){
 const pack=processPacks[index];
 return <div className="module-detail-content" key={pack.id}>
  <p className="module-kicker">Illustrative process pack</p><Box size={30} aria-hidden="true"/>
  <h3 id={titleId}>{pack.title}</h3><p className="module-summary">{pack.summary}</p>
  <dl className="module-records"><div><dt>Operations</dt><dd>{pack.operations}</dd></div><div><dt>Equipment context</dt><dd>{pack.equipment}</dd></div><div><dt>Evidence</dt><dd>{pack.evidence}</dd></div></dl>
  <p className="module-common-core"><Boxes size={18} aria-hidden="true"/><span>The shared core remains the same.</span></p>
 </div>;
}
export function TechnologyConfiguration(){
 const id=useId(),motion=useHomeMotion(),host=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null),trigger=useRef<HTMLButtonElement|null>(null);
 const controller=useRef<ReturnType<typeof import('./modularity-renderer').mountModularity>|null>(null),pending=useRef<number|undefined>(undefined),chooseRef=useRef<(index:number)=>void>(()=>{});
 const [selected,setSelected]=useState(0),[stage,setStage]=useState(0),[popup,setPopup]=useState(false),[phone,setPhone]=useState(false);
 useEffect(()=>{const media=matchMedia('(max-width:767px)'),update=()=>setPhone(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 const choose=(index:number,button?:HTMLButtonElement)=>{
  pending.current=index;setSelected(index);setStage(2);controller.current?.select(index);
  if(phone){trigger.current=button??host.current?.querySelector<HTMLButtonElement>(`[data-pack="${index}"]`)??null;setPopup(true);}
 };
 chooseRef.current=index=>choose(index);
 useEffect(()=>{
  const element=host.current,view=canvas.current;if(!element||!view)return;
  let disposed=false,loading=false;const setFallback=()=>{element.dataset.sceneState='fallback';setStage(2);};
  const select=(event:Event)=>chooseRef.current((event as CustomEvent<number>).detail);element.addEventListener('modularity:select',select);
  const state=new MutationObserver(()=>setStage(Number(element.dataset.stage)||0));state.observe(element,{attributes:true,attributeFilter:['data-stage']});
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting||loading||disposed)return;loading=true;
   if(prefersStaticScene()||new URLSearchParams(location.search).get('renderer')==='static'){setFallback();return;}
   import('./modularity-renderer').then(({mountModularity})=>{if(disposed)return;try{controller.current=mountModularity(view,element,setSelected);if(pending.current!==undefined)controller.current.select(pending.current);}catch{setFallback();}}).catch(()=>{if(!disposed)setFallback();});
  },{rootMargin:'180px'});
  element.dataset.sceneState='poster';observer.observe(element);
  const lost=(event:Event)=>{event.preventDefault();const current=controller.current;controller.current=null;current?.dispose();setFallback();};view.addEventListener('webglcontextlost',lost);
  return()=>{disposed=true;observer.disconnect();state.disconnect();element.removeEventListener('modularity:select',select);view.removeEventListener('webglcontextlost',lost);controller.current?.dispose();controller.current=null;};
 },[motion]);
 return <div ref={host} className="technology-configuration modularity-section" data-selected-pack={processPacks[selected].id}>
  <div className="modularity-workspace">
   <div className="modularity-demonstration">
    <div className="modularity-art" role="img" aria-label="A shared glass core and five process cells form from surface particles. A selected configuration cube forms above them with glass panels.">
     <StaticLattice selected={selected}/><canvas ref={canvas} aria-hidden="true"/>
     <p className="modularity-art-status"><span aria-hidden="true"/>{['Shared foundation','Process packs','Factory configuration'][stage]}</p>
    </div>
    <div className="module-choices" role="group" aria-label="Illustrative process packs">{processPacks.map((pack,index)=><button type="button" data-pack={index} key={pack.id} aria-pressed={selected===index} aria-controls={phone?`${id}-dialog`:`${id}-detail`} aria-haspopup={phone?'dialog':undefined} onClick={event=>choose(index,event.currentTarget)}><Box size={17} aria-hidden="true"/><span>{pack.title}</span></button>)}</div>
    <p className="module-hint">{phone?'Tap a process to view its details.':'Select a cube or process to explore its configuration.'}</p>
   </div>
   <aside className="module-insight" id={`${id}-detail`} aria-label="Selected process pack" aria-live={pending.current===undefined?'off':'polite'} aria-atomic="true"><ProcessDetail index={selected} titleId={`${id}-title`}/></aside>
  </div>
  <ol className="modularity-layers" aria-label="Three layers of modularity">{[
   {title:'Shared core',text:'Common identities, relationships, traceability and governance.',Icon:Boxes},
   {title:'Process pack',text:'Operations, resource context, parameters and quality requirements.',Icon:Box},
   {title:'Factory configuration',text:'Local equipment, integrations, roles and workflows.',Icon:Settings2},
  ].map(({title,text,Icon},index)=><li key={title} data-active={stage===index}><Icon size={23} aria-hidden="true"/><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
  <div className="modularity-support"><p><strong>Capabilities across processes</strong>Quality, maintenance and traceability connect through the same foundation.</p><p><strong>Context for intelligence</strong>AI assistance uses connected evidence, with people retaining decision authority.</p></div>
  <div className="modularity-footnote"><p>Process families shown are illustrative. Coverage and configuration are defined for each implementation.</p><Link href="/manufacturing">See a manufacturing example<ArrowRight size={16} aria-hidden="true"/></Link></div>
  <DetailsDialog open={popup} onClose={()=>setPopup(false)} trigger={trigger} id={`${id}-dialog`} labelledBy={`${id}-popup-title`} label="Process details" className="modularity-dialog"><ProcessDetail index={selected} titleId={`${id}-popup-title`}/></DetailsDialog>
 </div>;
}
