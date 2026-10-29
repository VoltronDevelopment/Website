type Job={run:()=>void|Promise<unknown>;cancelled:boolean;canPrepare:()=>boolean;priority:()=>number};

/** Prepare one nearby scene at a time, yielding to input between jobs. */
export function createScenePreparationQueue(){
  const jobs:Job[]=[];
  let scheduled:{id:number;idle:boolean}|undefined,busy=false;
  const idle=()=>typeof window.requestIdleCallback==="function";
  function schedule(){
    if(busy||scheduled!==undefined||!jobs.length)return;
    const next=()=>{scheduled=undefined;void drain();};
    if(!jobs.some(job=>!job.cancelled&&job.canPrepare()))scheduled={id:window.setTimeout(next,120),idle:false};
    else if(idle())scheduled={id:window.requestIdleCallback(next,{timeout:1000}),idle:true};
    else scheduled={id:window.setTimeout(next,32),idle:false};
  }
  async function drain(){
    let index=-1,priority=-Infinity;
    jobs.forEach((job,i)=>{if(job.cancelled||!job.canPrepare())return;const rank=job.priority();if(index<0||rank>priority){index=i;priority=rank;}});
    if(index<0){schedule();return;}
    const [job]=jobs.splice(index,1);if(!job){schedule();return;}
    busy=true;
    try{if(!job.cancelled)await job.run();}
    catch{/* Optional scene failures must not prevent later illustrations from preparing. */}
    finally{busy=false;schedule();}
  }
  return (run:Job["run"],canPrepare:Job["canPrepare"]=()=>true,priority:Job["priority"]=()=>0)=>{
    const job={run,cancelled:false,canPrepare,priority};jobs.push(job);schedule();
    return ()=>{
      job.cancelled=true;
      const index=jobs.indexOf(job);if(index>=0)jobs.splice(index,1);
      if(!jobs.length&&scheduled!==undefined){
        if(scheduled.idle)window.cancelIdleCallback(scheduled.id);else clearTimeout(scheduled.id);
        scheduled=undefined;
      }
    };
  };
}

export const prepareScene=createScenePreparationQueue();

export function canPrepareHomeScene(){
  if(document.hidden)return false;
  const stage=document.querySelector<HTMLElement>("[data-persistent-stage]");
  if(stage?.querySelector<HTMLCanvasElement>("canvas")?.dataset.continuousRendering!=="true")return true;
  if(stage?.querySelector<HTMLCanvasElement>('canvas')?.dataset.settled==='true')return true;
  const rect=stage.getBoundingClientRect();
  const visible=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0));
  return visible/Math.max(1,rect.height)<.6;
}

/** Re-evaluated when a slot becomes free, so a fast scroll promotes the newly visible scene. */
export function scenePreparationPriority(host:Element|null){
 if(!host)return -Infinity;
 const r=host.getBoundingClientRect(),visible=r.bottom>0&&r.top<innerHeight;
 const distance=Math.max(0,r.top-innerHeight,-r.bottom);
 return (visible?10000:0)-distance;
}
