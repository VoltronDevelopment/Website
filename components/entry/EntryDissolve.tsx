/** Keep the outgoing surface and its particle clock alive across the route change. */
export function startEntryDissolve(root:HTMLElement,navigate:()=>void){
  const presentation=root.querySelector<HTMLElement>(".entry-presentation")!;
  const bounds=presentation.getBoundingClientRect();
  const width=innerWidth,height=innerHeight,ratio=Math.min(2,devicePixelRatio);
  const overlay=document.createElement("div");
  overlay.inert=true;
  overlay.dataset.entrySweep="";
  overlay.setAttribute("aria-hidden","true");
  Object.assign(overlay.style,{position:"fixed",inset:"0",zIndex:"1000",pointerEvents:"none"});
  const surface=document.createElement("div");
  Object.assign(surface.style,{position:"absolute",inset:"0",background:getComputedStyle(document.body).backgroundColor});
  const copy=presentation.cloneNode(true) as HTMLElement;
  const originals=[presentation,...presentation.querySelectorAll<HTMLElement>("*")];
  const copies=[copy,...copy.querySelectorAll<HTMLElement>("*")];
  originals.forEach((node,i)=>{
    const style=getComputedStyle(node),target=copies[i];
    for(const key of style)target.style.setProperty(key,style.getPropertyValue(key));
    target.removeAttribute("id");target.style.animation="none";target.style.transition="none";
  });
  Object.assign(copy.style,{position:"absolute",left:bounds.left+"px",top:bounds.top+"px",width:bounds.width+"px",height:bounds.height+"px",margin:"0"});
  surface.append(copy);
  const canvas=document.createElement("canvas");
  canvas.className="entry-dissolve";canvas.width=width*ratio;canvas.height=height*ratio;
  Object.assign(canvas.style,{position:"absolute",inset:"0",width:"100%",height:"100%",pointerEvents:"none"});
  overlay.append(surface,canvas);document.body.append(overlay);
  presentation.style.visibility="hidden";
  // The wordmark sits outside the outgoing surface. Reveal it through both layers.
  const name=root.querySelector<HTMLElement>(".entry-wordmark");
  const wordCopy=name?.cloneNode(true) as HTMLElement|undefined;
  if(name&&wordCopy){
    const r=name.getBoundingClientRect();
    for(const [i,node] of [name,...name.querySelectorAll<HTMLElement>("*")].entries()){
      const target=i===0?wordCopy:wordCopy.querySelectorAll<HTMLElement>("*")[i-1];
      const style=getComputedStyle(node);for(const key of style)target.style.setProperty(key,style.getPropertyValue(key));
    }
    Object.assign(wordCopy.style,{position:"absolute",left:r.left+"px",top:r.top+"px",width:r.width+"px",margin:"0"});
    surface.append(wordCopy);
  }
  const ctx=canvas.getContext("2d");
  ctx?.scale(ratio,ratio);
    const nodes=Array.from(root.querySelectorAll<HTMLElement>(".entry-flip-card,.entry-letter,.launch-details,.entry-controls"));
    const areas=nodes.map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height);
    const particles=Array.from({length:Math.min(1600,Math.round(width*1.8))},(_,i)=>{
      const r=i%2?areas[i%areas.length]:null;
      const edge=i%4;
      const x=r?r.left+(edge===1?0:edge===2?1:Math.random())*r.width:Math.random()*width;
      const y=r?r.top+Math.random()*r.height:Math.random()*height;
      return {x,y,delay:x/width*.76,dy:(Math.random()-.53)*90,dx:16+Math.random()*82,size:.65+Math.random()*1.35};
    });
    const dark=document.documentElement.dataset.theme==="dark";
    if(ctx)ctx.fillStyle=dark?"#96dbff":"#24689a";
  let frame=0,elapsed=0,last=performance.now(),submitted=false;
  const started=last;
  const cleanup=()=>{cancelAnimationFrame(frame);overlay.remove();window.dispatchEvent(new Event("voltron:entry-sweep-finished"));presentation.style.visibility="";};
  function draw(now:number){
    const waiting=submitted&&!document.querySelector("#home-title")&&elapsed>2000&&now-started<8000;
    if(!waiting)elapsed+=Math.min(now-last,32);
    last=now;
    const t=Math.min(1,elapsed/4400);
    const front=-14+128*t;
    surface.style.maskImage=`linear-gradient(90deg,transparent ${front-10}%,black ${front+10}%)`;
    ctx?.clearRect(0,0,width,height);
    if(ctx)for(const p of particles){
      const u=(front/100-p.x/width+.09)/.18;
      if(u<=0||u>=1)continue;
      ctx.globalAlpha=.85*Math.sin(Math.PI*u);
      ctx.fillRect(p.x+p.dx*u,p.y+p.dy*u*u,p.size,p.size);
    }
    if(!submitted&&t>=.43){submitted=true;navigate();}
    if(t<1)frame=requestAnimationFrame(draw);else cleanup();
  }
  frame=requestAnimationFrame(draw);
  return cleanup;
}
