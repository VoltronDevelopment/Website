'use client';
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';
const Cube=dynamic(()=>import('../intelligence/FluidCubeStudy').then(m=>m.FluidCubeStudy),{loading:()=> <span className="preview-agent-loading">Specialist intelligence</span>});
/** The Home preview uses the same material and formation choreography as Intelligence. */
export function AgentPreview(){const host=useRef<HTMLDivElement>(null),[ready,setReady]=useState(false);useEffect(()=>{const observer=new IntersectionObserver(([e])=>{if(e.isIntersecting){setReady(true);observer.disconnect();}},{rootMargin:'120px'});if(host.current)observer.observe(host.current);return()=>observer.disconnect();},[]);return <div ref={host} className="home-agent-preview" aria-label="TEYO specialist: fluid organizes into evidence particles">{ready?<Cube agent={5} compact/>:<span className="preview-agent-loading">Specialist intelligence</span>}</div>;}
