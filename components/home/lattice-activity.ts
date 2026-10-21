import {junctionPulse} from "./lattice-lighting";
import type {Point} from "./lattice-lighting";

type Projection={x:number;y:number;visible:boolean};
type Options={host:HTMLElement;points:readonly Point[];links:readonly (readonly [number,number])[];project:(index:number)=>Projection;onFrame:()=>void};
const distance=(a:Point,b:Point)=>Math.hypot(...a.map((value,index)=>value-b[index]));

/** One owner for idle and pointer light. Quiet intervals do not request animation frames. */
export function createLatticeActivity({host,points,links,project,onFrame}:Options){
  const neighbours=points.map((_,index)=>links.flatMap(([a,b])=>a===index?[b]:b===index?[a]:[]));
  const values=new Float32Array(points.length),fading=new Float32Array(points.length);
  let armed=false,visible=true,enabled=true,disposed=false,frame=0,timer:ReturnType<typeof setTimeout>|undefined;
  let mode:"rest"|"idle"|"pointer"|"fade"="rest",started=0,hover=-1,cycle=0,path:number[]=[];
  function status(){host.dataset.lightMode=mode;host.dataset.lightRendering=String(frame!==0);}
  function cancel(){cancelAnimationFrame(frame);frame=0;clearTimeout(timer);timer=undefined;}
  function allowed(){return armed&&visible&&enabled&&!disposed;}
  function schedule(){
    if(!allowed()||hover>=0||timer)return;
    timer=setTimeout(()=>{
      timer=undefined;if(!allowed())return;
      const candidates=points.map((_,i)=>i).filter(i=>project(i).visible);
      if(!candidates.length)return;
      const first=candidates[cycle++%candidates.length];path=[first];
      for(let i=0;i<2;i++){const next=neighbours[path[path.length-1]].find(n=>!path.includes(n));if(next===undefined)break;path.push(next);}
      mode="idle";started=performance.now();frame=requestAnimationFrame(tick);status();
    },8000);
  }
  function tick(now:number){
    frame=0;if(!allowed())return;
    const age=(now-started)/1000;values.fill(0);
    let running=false;
    if(mode==="idle"){
      path.forEach((node,index)=>{values[node]=junctionPulse(age,index*.32,.12,.45);});running=age<1.4;
    }else if(mode==="pointer"&&hover>=0){
      values[hover]=Math.min(1,age/.14)*.8;
      neighbours[hover].forEach(index=>{values[index]=values[hover]*.3;});running=age<.14;
    }else if(mode==="fade"){
      const fade=Math.max(0,1-age/.4);values.forEach((_,index)=>{values[index]=fading[index]*fade;});running=fade>0;
    }
    if(!running&&mode!=="pointer"){mode="rest";values.fill(0);}
    if(running)frame=requestAnimationFrame(tick);
    status();onFrame();
    if(!running&&mode==="rest")schedule();
  }
  function move(event:PointerEvent){
    if(!allowed()||event.pointerType==="touch")return;
    const bounds=host.getBoundingClientRect(),x=event.clientX-bounds.left,y=event.clientY-bounds.top;
    let nearest=-1,radius=32;
    points.forEach((_,index)=>{const p=project(index),d=Math.hypot(p.x-x,p.y-y);if(p.visible&&d<radius){nearest=index;radius=d;}});
    if(nearest===hover)return;
    if(nearest<0){leave();return;}
    cancel();hover=nearest;mode="pointer";started=performance.now();frame=requestAnimationFrame(tick);status();
  }
  function leave(){
    if(hover<0)return;
    hover=-1;fading.set(values);cancel();mode="fade";started=performance.now();
    if(allowed())frame=requestAnimationFrame(tick);status();
  }
  function reset(){cancel();hover=-1;mode="rest";values.fill(0);status();}
  host.addEventListener("pointermove",move);host.addEventListener("pointerleave",leave);
  status();
  return {
    arm(){if(armed)return;armed=true;schedule();},
    restart(){armed=false;reset();},
    setVisible(value:boolean){if(value===visible)return;visible=value;if(!value){reset();onFrame();}else schedule();},
    setEnabled(value:boolean){enabled=value;if(!value){reset();onFrame();}else schedule();},
    strength(point:Point){let value=0;points.forEach((p,index)=>{value=Math.max(value,values[index]*Math.max(0,1-distance(point,p)/.85));});return value;},
    nodeStrength(index:number){return values[index]??0;},
    dispose(){disposed=true;reset();host.removeEventListener("pointermove",move);host.removeEventListener("pointerleave",leave);},
  };
}
