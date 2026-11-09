// Chromium can latch a diagonal wheel gesture to a horizontal row even when most
// of the movement is vertical. Only route that case; touch retains native inertia.
export function allowPageWheelOverRow(row:HTMLElement){
  const wheel=(event:WheelEvent)=>{
    if(event.defaultPrevented||!event.cancelable||event.ctrlKey||event.shiftKey)return;
    if(!event.deltaX||Math.abs(event.deltaY)<2*Math.abs(event.deltaX))return;
    const unit=event.deltaMode===1?parseFloat(getComputedStyle(row).lineHeight)||16:
      event.deltaMode===2?innerHeight:1;
    event.preventDefault();
    window.scrollBy({top:event.deltaY*unit,behavior:'instant'});
  };
  row.addEventListener('wheel',wheel,{passive:false});
  return ()=>row.removeEventListener('wheel',wheel);
}

/** Touch and trackpads scroll natively. A mouse drag carries its release speed into the row. */
export function enableCardDrag(row:HTMLElement,reduced:boolean){
 let pointer:number|null=null,startX=0,startY=0,lastX=0,sample=0,speed=0,dragged=false,frame=0;
 const stop=()=>{cancelAnimationFrame(frame);frame=0;};
 const down=(e:PointerEvent)=>{
  stop();dragged=false;
  if(e.pointerType!=='mouse'||e.button!==0||row.scrollWidth<=row.clientWidth)return;
  pointer=e.pointerId;startX=lastX=e.clientX;startY=e.clientY;sample=e.timeStamp;speed=0;
 };
 const move=(e:PointerEvent)=>{
  if(e.pointerId!==pointer)return;
  if(!dragged){
   if(Math.abs(e.clientY-startY)>Math.abs(e.clientX-startX)+5){pointer=null;return;}
   if(Math.abs(e.clientX-startX)<6)return;
   dragged=true;row.setPointerCapture(e.pointerId);row.dataset.dragging='true';
  }
  const dx=lastX-e.clientX,dt=Math.max(1,e.timeStamp-sample);
  speed=.35*speed+.65*Math.max(-2.5,Math.min(2.5,dx/dt));
  row.scrollLeft+=dx;lastX=e.clientX;sample=e.timeStamp;e.preventDefault();
 };
 const end=(e:PointerEvent)=>{
  if(e.pointerId!==pointer)return;
  pointer=null;delete row.dataset.dragging;
  if(row.hasPointerCapture(e.pointerId))row.releasePointerCapture(e.pointerId);
  if(!dragged||reduced||e.type!=='pointerup'||e.timeStamp-sample>90)return;
  let last=performance.now(),position=row.scrollLeft;
  const glide=(now:number)=>{
   const dt=Math.min(40,now-last);last=now;speed*=Math.exp(-dt/150);
   position+=speed*dt;row.scrollLeft=position;
   if(Math.abs(speed)>.015&&position>0&&position<row.scrollWidth-row.clientWidth)frame=requestAnimationFrame(glide);
  };frame=requestAnimationFrame(glide);
 };
 const click=(e:MouseEvent)=>{if(dragged&&e.detail){e.preventDefault();e.stopPropagation();dragged=false;}};
 const nativeDrag=(e:DragEvent)=>{if(pointer!==null)e.preventDefault();};
 row.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
 row.addEventListener('click',click,true);row.addEventListener('dragstart',nativeDrag);row.addEventListener('wheel',stop,{passive:true});row.addEventListener('keydown',stop);
 return ()=>{stop();delete row.dataset.dragging;row.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',end);row.removeEventListener('click',click,true);row.removeEventListener('dragstart',nativeDrag);row.removeEventListener('wheel',stop);row.removeEventListener('keydown',stop);};
}
