import type {KeyboardEvent,MouseEvent} from 'react';

/** Padding belongs to the sheet; only clicks beyond its bounds dismiss the top layer. */
export function isDialogBackdropClick(event:MouseEvent<HTMLDialogElement>){
 if(event.target!==event.currentTarget)return false;
 const r=event.currentTarget.getBoundingClientRect();
 return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;
}

/** Keep keyboard focus inside the native top layer, including the last-to-first boundary. */
export function containDialogFocus(event:KeyboardEvent<HTMLDialogElement>){
 if(event.key!=='Tab')return;
 const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,summary,[tabindex]')].filter(element=>!element.hasAttribute('disabled')&&element.tabIndex>=0&&element.getClientRects().length>0&&getComputedStyle(element).visibility!=='hidden');
 const first=controls[0],last=controls.at(-1);
 if(!first){event.preventDefault();event.currentTarget.focus();return;}
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
