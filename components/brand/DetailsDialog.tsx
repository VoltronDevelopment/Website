"use client";
import {useEffect,useRef,type RefObject,type ReactNode} from 'react';
import {X} from 'lucide-react';
import './details-dialog.css';

/** Shared phone detail surface: native top layer, explicit focus wrap and scroll restoration. */
export function DetailsDialog({open,onClose,trigger,id,labelledBy,children,className='',label='Details'}:{open:boolean;onClose:()=>void;trigger:RefObject<HTMLButtonElement|null>;id:string;labelledBy:string;children:ReactNode;className?:string;label?:string}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{
  const element=dialog.current;if(!open||!element)return;
  const overflow=document.body.style.overflow;element.showModal();document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=overflow;if(element.open)element.close();trigger.current?.focus({preventScroll:true});};
 },[open,trigger]);
 useEffect(()=>{const media=matchMedia('(max-width:767px)');const resize=()=>{if(!media.matches&&dialog.current?.open)onClose();};media.addEventListener('change',resize);return()=>media.removeEventListener('change',resize);},[onClose]);
 return <dialog ref={dialog} id={id} className={`details-dialog ${className}`} aria-labelledby={labelledBy} onClose={onClose} onKeyDown={event=>{
  if(event.key!=='Tab')return;
  const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]')].filter(element=>!element.hasAttribute('disabled'));
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 }} onClick={event=>{if(event.target===event.currentTarget){const bounds=event.currentTarget.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)onClose();}}}>
  <div className="details-dialog-toolbar"><span>{label}</span><button type="button" className="icon-button" aria-label={`Close ${label.toLowerCase()}`} onClick={onClose}><X size={20} aria-hidden="true"/></button></div>
  <div className="details-dialog-body">{children}</div>
 </dialog>;
}
