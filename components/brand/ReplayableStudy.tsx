"use client";
import {createContext,Fragment,useContext,useLayoutEffect,useRef,useState,type ReactNode} from "react";
import {Undo2} from "lucide-react";

const StudyContext=createContext<{label:string;restart:()=>void}|null>(null);

export function StudyReplay(){
  const study=useContext(StudyContext);
  if(!study)return null;
  const label="Replay "+study.label;
  return <button className="study-replay" aria-label={label} title={label} type="button" onClick={study.restart}><Undo2 className="replay-arrow" size={15} aria-hidden="true"/></button>;
}

export function ReplayableStudy({children,label,inline=false}:{children:ReactNode;label:string;inline?:boolean}){
  const [revision,setRevision]=useState(0);
  const root=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    if(revision)root.current?.querySelector<HTMLButtonElement>(".study-replay")?.focus({preventScroll:true});
  },[revision]);
  return <StudyContext.Provider value={{label,restart:()=>setRevision(value=>value+1)}}>
    <div ref={root} className="replayable-study"><Fragment key={revision}>{children}</Fragment>{!inline&&<StudyReplay/>}</div>
  </StudyContext.Provider>;
}
