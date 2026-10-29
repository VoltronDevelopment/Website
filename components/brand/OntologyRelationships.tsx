"use client";
import { useId, useState, useRef, useEffect } from "react";
import { ontologyConnections as connections, ontologyNodes as nodes, ontologySubject, type OntologyNodeId } from "@/lib/manufacturing-ontology";
import "./ontology-relationships.css";
export function OntologyRelationships() {
  const [selected, setSelected] = useState<OntologyNodeId>("lot");
  const map=useRef<HTMLDivElement>(null),[routes,setRoutes]=useState<Record<string,string>>({});
  const id = useId(), focus = nodes.find(node => node.id === selected)!;
  const activeNodes = new Set<string>(connections.filter(([a, b]) => a === selected || b === selected).flat());
  const related = nodes.filter(node => node.id !== selected && activeNodes.has(node.id));
  useEffect(()=>{const root=map.current;if(!root)return;let frame=0;
   const update=()=>{frame=0;const box=root.getBoundingClientRect();if(!box.width||!box.height)return;const result:Record<string,string>={};
    for(const [a,b]of connections){const start=root.querySelector<HTMLElement>(`[data-ontology-node="${a}"]`)?.getBoundingClientRect(),end=root.querySelector<HTMLElement>(`[data-ontology-node="${b}"]`)?.getBoundingClientRect();if(!start||!end)continue;
     const point=(x:number,y:number)=>`${(x-box.left)/box.width*100} ${(y-box.top)/box.height*100}`;
     if(innerWidth<768&&Math.abs(start.top+start.height/2-end.top-end.height/2)>3){const target=end,hub=start,left=target.left+target.width/2<=box.left+box.width/2,rail=left?box.left+2:box.right-2;result[`${a}-${b}`]=`M ${point(left?hub.left:hub.right,hub.top+hub.height/2)} H ${(rail-box.left)/box.width*100} V ${(target.top+target.height/2-box.top)/box.height*100} H ${((left?target.left:target.right)-box.left)/box.width*100}`;}
     else{const dx=end.left+end.width/2-start.left-start.width/2,dy=end.top+end.height/2-start.top-start.height/2;const edge=(r:DOMRect,x:number,y:number)=>{const k=1/Math.max(Math.abs(x)/(r.width/2),Math.abs(y)/(r.height/2));return point(r.left+r.width/2+x*k,r.top+r.height/2+y*k);};result[`${a}-${b}`]=`M ${edge(start,dx,dy)} L ${edge(end,-dx,-dy)}`;}
    }setRoutes(result);
   };const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};const observer=new ResizeObserver(schedule);observer.observe(root);root.querySelectorAll('button').forEach(e=>observer.observe(e));schedule();return()=>{cancelAnimationFrame(frame);observer.disconnect();};
  },[]);
  return <div className="ontology-relationships">
    <div className="ontology-record"><p className="eyebrow">Illustrative manufacturing record</p><h3>{ontologySubject.part}</h3><p>Lot {ontologySubject.lot} <span aria-hidden="true">/</span> {ontologySubject.operation}</p></div>
    <p className="ontology-instruction">Choose a record to follow its relationships.</p>
    <div ref={map} className="ontology-map" role="group" aria-label="Manufacturing relationship focus">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ontology-connections" aria-hidden="true">{connections.map(([a,b]) => {
        const start = nodes.find(node => node.id === a)!, end = nodes.find(node => node.id === b)!;
        const path = routes[`${a}-${b}`]??`M ${start.x} ${start.y} L ${end.x} ${end.y}`;
        return <g key={`${a}-${b}`} data-active={a === selected || b === selected}><path d={path}/>{(a === selected || b === selected) && <path key={selected} d={path} pathLength="1" className="ontology-trace"/>}</g>;
      })}</svg>
      {nodes.map(node => <button type="button" key={node.id} className="ontology-node" data-ontology-node={node.id} data-active={activeNodes.has(node.id)} aria-pressed={selected === node.id} aria-controls={id} onClick={() => setSelected(node.id)} style={{ left: `${node.x}%`, top: `${node.y}%` }}><strong>{node.label}</strong><span>{node.record}</span></button>)}
    </div>
    <div id={id} className="ontology-explanation" aria-live="polite" aria-atomic="true"><div><h3>{focus.label}</h3><p>{focus.detail}</p><p className="ontology-evidence">{focus.evidence}</p></div><div className="ontology-relation-summary"><strong>Connected to</strong><ul>{related.map(node => <li key={node.id}>{node.label}</li>)}</ul></div></div>
  </div>;
}
