import {useEffect, useRef} from "react";

/** The particle front follows the same left-to-right sweep as the page mask. */
export const entryExitMs = 2700;
export function EntryDissolve(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas?.getContext("2d");
    if(!canvas||!ctx)return;
    const root=canvas.parentElement!;
    const width=root.clientWidth,height=root.clientHeight,ratio=Math.min(2,devicePixelRatio);
    canvas.width=width*ratio;canvas.height=height*ratio;ctx.scale(ratio,ratio);
    const bounds=root.getBoundingClientRect();
    const nodes=Array.from(root.querySelectorAll<HTMLElement>(".entry-flip-card,.entry-letter,.launch-details,.entry-controls"));
    const areas=nodes.map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height);
    const particles=Array.from({length:Math.min(1600,Math.round(width*1.8))},(_,i)=>{
      const r=i%4?areas[i%areas.length]:null;
      const edge=i%4;
      const x=r?r.left-bounds.left+(edge===1?0:edge===2?1:Math.random())*r.width:Math.random()*width;
      const y=r?r.top-bounds.top+Math.random()*r.height:Math.random()*height;
      return {x,y,delay:x/width*.76,dy:(Math.random()-.53)*90,dx:16+Math.random()*82,size:.65+Math.random()*1.35};
    });
    const dark=document.documentElement.dataset.theme==="dark";
    ctx.fillStyle=dark?"#96dbff":"#24689a";
    let frame=0;const start=performance.now();
    function draw(now:number){
      const t=Math.min(1,(now-start)/entryExitMs);
      ctx!.clearRect(0,0,width,height);
      const tileTime=Math.min(1,t*4);
      root.style.setProperty("--entry-wipe",String(tileTime*150-25)+"%");
      const departing=t>.56;
      const cube=departing?root.querySelector(".entry-home-frame")?.getBoundingClientRect():null;
      for(const p of particles){
        const u=cube?((t-.56)/.44-(1-p.x/width)*.7)/.3:(tileTime-p.delay)/.24;if(u<=0||u>=1)continue;
        ctx!.globalAlpha=.8*Math.sin(Math.PI*u);
        const x=cube?cube.left-bounds.left+cube.width*(.32+.36*p.x/width):p.x;
        const y=cube?cube.top-bounds.top+cube.height*(.25+.5*p.y/height):p.y;
        ctx!.fillRect(x+p.dx*u,y+p.dy*u*u,p.size,p.size);
      }
      if(t<1)frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);return ()=>cancelAnimationFrame(frame);
  },[]);
  return <canvas className="entry-dissolve" ref={ref} aria-hidden="true"/>;
}
