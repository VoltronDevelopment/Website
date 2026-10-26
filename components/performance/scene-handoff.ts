/** Mix premultiplied frames additively so matching glass does not dim halfway through. */
export function blendSceneFrames(context:CanvasRenderingContext2D,poster:HTMLCanvasElement,live:HTMLCanvasElement,progress:number){
  context.clearRect(0,0,live.width,live.height);
  context.globalCompositeOperation='source-over';context.globalAlpha=1-progress;context.drawImage(poster,0,0);
  context.globalCompositeOperation='lighter';context.globalAlpha=progress;context.drawImage(live,0,0);
  context.globalCompositeOperation='source-over';context.globalAlpha=1;
}

/** One bounded transition of the same pose. Callers hold their clock until it resolves. */
export function createSceneHandoff(host:HTMLElement,canvas:HTMLCanvasElement,immediate=false){
  let disposed=false,frame=0,finish:(()=>void)|undefined;
  let blend:{overlay:HTMLCanvasElement;poster:HTMLCanvasElement;live:HTMLCanvasElement;context:CanvasRenderingContext2D}|undefined;
  const posters=()=>{
    const nodes=[...host.querySelectorAll<HTMLElement>('[data-scene-poster],.scene-poster,.lot-story-posters,.alpha-line-poster,.factory-component-poster')];
    return nodes.filter(node=>!nodes.some(other=>other!==node&&other.contains(node)));
  };
  canvas.style.transition='none';canvas.style.opacity=immediate?'1':'0';host.dataset.sceneState=immediate?'live':'poster';
  function snapshot(){
    if(!canvas.parentElement||!canvas.width||!canvas.height)return;
    const bounds=canvas.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
    const live=document.createElement('canvas'),poster=document.createElement('canvas'),overlay=document.createElement('canvas');
    for(const target of [live,poster,overlay]){target.width=canvas.width;target.height=canvas.height;}
    const liveContext=live.getContext('2d'),posterContext=poster.getContext('2d'),context=overlay.getContext('2d');
    if(!liveContext||!posterContext||!context)return;
    liveContext.drawImage(canvas,0,0);
    posterContext.scale(canvas.width/bounds.width,canvas.height/bounds.height);
    for(const node of posters())for(const image of node.querySelectorAll<HTMLImageElement>('img')){
      let {x,y,width,height}=image.getBoundingClientRect();
      // Ignore inactive themes/poses and images that arrive after this handoff starts.
      if(!image.complete||!image.naturalWidth||!width||!height)continue;
      if(getComputedStyle(image).objectFit==='contain'){
        const scale=Math.min(width/image.naturalWidth,height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
        x+=(width-w)/2;y+=(height-h)/2;width=w;height=h;
      }
      posterContext.drawImage(image,x-bounds.x,y-bounds.y,width,height);
    }
    Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',opacity:'1',visibility:'visible',pointerEvents:'none',zIndex:'1',transition:'none'});
    overlay.dataset.sceneBlend='true';overlay.setAttribute('aria-hidden','true');canvas.parentElement.append(overlay);
    return {overlay,poster,live,context};
  }
  function progress(value:number){
    host.dataset.sceneBlend=String(value);
    canvas.style.opacity=blend&&value<1?'0':String(value);
    for(const poster of posters()){poster.style.opacity=blend?'0':String(1-value);poster.style.visibility=blend||value===1?'hidden':'visible';}
    if(blend)blendSceneFrames(blend.context,blend.poster,blend.live,value);
  }
  function cancel(){cancelAnimationFrame(frame);frame=0;blend?.overlay.remove();blend=undefined;finish?.();finish=undefined;}
  return {
    reveal(){
      if(disposed||host.isConnected===false)return Promise.resolve();
      cancel();
      if(immediate){progress(1);host.dataset.sceneState='live';return Promise.resolve();}
      try{blend=snapshot();}catch{/* A blocked canvas readback can still dissolve safely. */}
      host.dataset.sceneState='handoff';progress(0);
      return new Promise<void>(resolve=>{
        finish=resolve;let elapsed=0,previous=0;
        const tick=(now:number)=>{
          if(disposed||host.isConnected===false){cancel();return;}
          if(!document.hidden)elapsed+=previous?Math.min(40,now-previous):0;previous=now;
          const value=matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).has('scene-capture')?1:Math.min(1,elapsed/240);
          progress(value*value*(3-2*value));
          if(value<1)frame=requestAnimationFrame(tick);
          else {frame=0;blend?.overlay.remove();blend=undefined;host.dataset.sceneState='live';finish=undefined;resolve();}
        };
        frame=requestAnimationFrame(tick);
      });
    },
    fallback(){cancel();host.dataset.sceneState='fallback';host.dataset.scenePose='complete';progress(0);},
    dispose(){disposed=true;cancel();},
  };
}
