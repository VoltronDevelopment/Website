"use client";
import {Fragment, useState, type ReactNode} from "react";
import {RotateCcw} from "lucide-react";

export function ReplayableStudy({children,label}:{children:ReactNode;label:string}){
  const [revision,setRevision]=useState(0);
  return <div className="replayable-study">
    <Fragment key={revision}>{children}</Fragment>
    <button className="study-replay" aria-label={`Replay ${label}`} title={`Replay ${label}`} type="button" onClick={()=>setRevision(value=>value+1)}><RotateCcw size={15} aria-hidden="true"/></button>
  </div>;
}
