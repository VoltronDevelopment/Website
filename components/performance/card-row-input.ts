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
