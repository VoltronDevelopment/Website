/** Finite Canvas 2D fireworks, shared by the tile reveal and launch-day celebration. */
export function createFireworks(canvas:HTMLCanvasElement,variant:"intro"|"launch"="launch"){
 const ctx=canvas.getContext("2d");
 if(!ctx)return {paint:(_seconds:number)=>{},dispose:()=>{}};
 const intro=variant==="intro";
 let width=0,height=0,disposed=false;
 const ratio=Math.min(devicePixelRatio||1,1.25);
 function resize(){
  const bounds=canvas.getBoundingClientRect();width=bounds.width;height=bounds.height;
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  ctx!.setTransform(ratio,0,0,ratio,0,0);
 }
 resize();
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const mobile=width<768;
 const count=intro?(mobile?52:80):(mobile?64:100);
 // Fixed trajectories let the entry's clock pause/resume without particle jumps.
 const particles=Array.from({length:count},(_,i)=>({
  angle:i/count*Math.PI*2,
  speed:(intro?34:45)+Math.random()*(intro?65:95),
  life:(intro?1.8:2.3)+Math.random()*.65,
  color:i%3
 }));
 function paint(seconds:number){
  if(disposed)return;
  ctx!.clearRect(0,0,width,height);
  const dark=document.documentElement.dataset.theme==="dark";
  const colors=dark?["#78b0ff","#fff1c5","#d0eaff"]:["#246bd4","#946919","#3e7d9a"];
  const origins=intro?
   [[width*(mobile?.14:.22),height*.24,.05],
    [width*(mobile?.86:.78),height*.34,.7],
    [width*(mobile?.18:.32),height*.16,1.8],
    [width*(mobile?.84:.86),height*.22,3],
    [width*(mobile?.12:.16),height*.36,4.1],
    [width*(mobile?.82:.7),height*.18,5.25]]:
   (mobile?[[width*.3,height*.24,.5],[width*.74,height*.37,1.9]]:[[width*.2,height*.27,.5],[width*.8,height*.25,1.9],[width*.53,height*.16,3.3]]);
  ctx!.save();
  for(const [x,y,start] of origins){
   const age=seconds-start;if(age<0)continue;
   for(const p of particles){
    if(age>=p.life)continue;
    const vx=Math.cos(p.angle)*p.speed,vy=Math.sin(p.angle)*p.speed;
    const previous=Math.max(0,age-.045);
    ctx!.globalAlpha=Math.min(1,(p.life-age)/.9);
    ctx!.strokeStyle=colors[p.color];ctx!.lineWidth=intro?1.6:1.4;
    ctx!.beginPath();ctx!.moveTo(x+vx*previous,y+vy*previous+14*previous*previous);
    ctx!.lineTo(x+vx*age,y+vy*age+14*age*age);ctx!.stroke();
   }
  }
  ctx!.restore();
 }
 return {paint,dispose:()=>{disposed=true;observer.disconnect();ctx.clearRect(0,0,width,height);}};
}

/** Launch-day playback owns its clock; the entry uses createFireworks with its shared clock. */
export function playFireworks(canvas:HTMLCanvasElement){
 const fireworks=createFireworks(canvas),start=performance.now();let frame=0,disposed=false;
 function tick(now:number){
  if(disposed||document.hidden||now-start>7500){fireworks.dispose();return;}
  fireworks.paint((now-start)/1000);frame=requestAnimationFrame(tick);
 }
 frame=requestAnimationFrame(tick);
 return()=>{disposed=true;cancelAnimationFrame(frame);fireworks.dispose();};
}
