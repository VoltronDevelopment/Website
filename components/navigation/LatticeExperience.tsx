"use client";

import {createContext,useCallback,useContext,useEffect,useLayoutEffect,useRef,useState,type ReactNode} from "react";
import {prefersStaticScene,yieldToBrowser} from "../performance/scene-policy";
import {ScenePoster} from "../performance/ScenePoster";
import {usePathname,useRouter} from "next/navigation";
import type {HeroController,SharedHeroResources} from "../home/hero-renderer";
import {canMorph,mixForView,transitionMix,viewForPath,type LatticeView} from "./lattice-transition";
import {localRect,placedRect,sceneClip,type SceneRect} from "./lattice-placement";
import "./lattice-experience.css";

type Slot={node:HTMLDivElement;hero:HTMLElement;kind:LatticeView};
type Pending={path:string;rich:boolean;mix:number;rect:SceneRect;keyboard:boolean;copy?:HTMLElement};
const SlotContext=createContext<((node:HTMLDivElement,kind:LatticeView)=>()=>void)|null>(null);

export function LatticeSlot({kind,className,label}:{kind:LatticeView;className:string;label?:string}){
  const node=useRef<HTMLDivElement>(null),register=useContext(SlotContext);
  useLayoutEffect(()=>{if(node.current&&register)return register(node.current,kind);},[kind,register]);
  return <div ref={node} className={className} data-lattice-slot={kind} role={label?"img":undefined} aria-label={label} aria-hidden={label?undefined:true}><ScenePoster kind={kind}/></div>;
}

export function LatticeExperience({children}:{children:ReactNode}){
  const pathname=usePathname(),router=useRouter();
  const previousPath=useRef(pathname);
  const currentPath=useRef(pathname),initialPath=useRef(pathname),firstHome=useRef(false);
  currentPath.current=pathname;
  const canvas=useRef<HTMLCanvasElement>(null),layer=useRef<HTMLDivElement>(null);
  const slot=useRef<Slot|null>(null),controller=useRef<HeroController|null>(null);
  const resources=useRef<Promise<SharedHeroResources|undefined>|null>(null),shared=useRef<SharedHeroResources|undefined>(undefined);
  const pending=useRef<Pending|null>(null),mix=useRef(0),generation=useRef(0),animation=useRef(0),positionFrame=useRef(0);
  const loadingTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),settleTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const [loading,setLoading]=useState("");
  const lifetime=useRef(0);
  const outgoingCopy=useRef<HTMLElement|null>(null);
  const unavailable=useRef(false);
  const activateRef=useRef<(value:Slot,request?:Pending)=>void>(()=>{});

  const position=useCallback((rect?:SceneRect)=>{
    const presentation=slot.current?.node.dataset.renderer;
    if(prefersStaticScene()||presentation!=="live"&&presentation!=="morph"){if(layer.current)layer.current.style.visibility="hidden";return;}
    const target=rect??slot.current?.node.getBoundingClientRect();if(!target||!layer.current)return;
    const panel=slot.current?.node.closest(".site-presentation")?.getBoundingClientRect();
    const header=document.querySelector(".site-header")?.getBoundingClientRect();
    const clip=sceneClip(target,panel??target,header?.bottom??0);
    const {top,left,right,bottom}=clip;
    let clipPath=`inset(${top}px ${right}px ${bottom}px ${left}px)`;
    if(CSS.supports("clip-path","path(evenodd, 'M0 0 H1 V1 H0 Z')")){
      let path=`M${left} ${top} H${target.width-right} V${target.height-bottom} H${left} Z`,holes=0;
      for(const panel of document.querySelectorAll(".about-links,.site-nav.is-open")){
        const bounds=panel.getBoundingClientRect(),holeLeft=Math.max(left,bounds.left-target.x),holeRight=Math.min(target.width-right,bounds.right-target.x),upper=Math.max(top,bounds.top-target.y),lower=Math.min(target.height-bottom,bounds.bottom-target.y);
        if(holeRight>holeLeft&&lower>upper){path+=` M${holeLeft} ${upper} H${holeRight} V${lower} H${holeLeft} Z`;holes++;}
      }
      if(holes)clipPath=`path(evenodd, '${path}')`;
    }
    Object.assign(layer.current.style,{left:`${target.x}px`,top:`${target.y}px`,width:`${target.width}px`,height:`${target.height}px`,visibility:target.y+target.height>0&&target.y<innerHeight?"visible":"hidden",clipPath});
  },[]);
  const clearState=useCallback(()=>{
    clearTimeout(loadingTimer.current);clearTimeout(settleTimer.current);setLoading("");
    outgoingCopy.current?.remove();outgoingCopy.current=null;
    delete document.documentElement.dataset.routeState;delete document.documentElement.dataset.routePending;
    document.querySelector("main#main-content")?.removeAttribute("aria-busy");
  },[]);
  const finish=useCallback((request?:Pending)=>{
    if(request&&pending.current!==request)return;
    pending.current=null;clearState();
    if(layer.current)layer.current.dataset.transition="settled";
    if(request?.keyboard){const heading=document.querySelector<HTMLElement>("main h1");heading?.setAttribute("tabindex","-1");heading?.focus({preventScroll:true});}
  },[clearState]);

  const mount=useCallback(async(value:Slot,immediate:boolean,token:number)=>{
    if(!canvas.current)return;
    if(prefersStaticScene()){controller.current?.pause();value.node.dataset.live="false";value.node.dataset.renderer="poster";position();return;}
    await yieldToBrowser();if(token!==generation.current)return;
    resources.current??=import("./lattice-resources").then(module=>module.createLatticeResources(canvas.current!));
    const prepared=await Promise.all([resources.current,import("../home/hero-renderer")]).catch(()=>null);
    if(!prepared){unavailable.current=true;value.node.dataset.live="false";value.node.dataset.renderer="poster";position();return;}
    const [common,module]=prepared;
    if(token!==generation.current||!value.node.isConnected)return;
    shared.current=common;controller.current?.();
    const next=module.mountHero(canvas.current,value.node,value.hero,value.kind,{shared:unavailable.current?undefined:common,immediate:immediate||performance.now()>2000,static:unavailable.current});controller.current=next;
    canvas.current.dataset.persistentLattice="true";
    await next.ready;if(token!==generation.current)return;
    if(prefersStaticScene()){next.pause();value.node.dataset.live="false";value.node.dataset.renderer="poster";position();return;}
    value.node.dataset.live="true";value.node.dataset.renderer=canvas.current.hidden?"fallback":"live";mix.current=mixForView(value.kind);position();
  },[position]);

  const activate=useCallback(async(value:Slot,request?:Pending)=>{
    const token=++generation.current;cancelAnimationFrame(animation.current);
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rich=request?.rich&&controller.current&&shared.current&&!prefersStaticScene();
    if(request){
      if(request.copy){outgoingCopy.current?.remove();outgoingCopy.current=request.copy;value.node.closest(".site-presentation")?.append(request.copy);setTimeout(()=>request.copy?.remove(),160);}
      document.documentElement.dataset.routeState="incoming";clearTimeout(loadingTimer.current);setLoading("");
    }
    if(rich&&request){
      controller.current!.pause();
      await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
      if(token!==generation.current)return;
      const from=request.rect,start=performance.now();
      const bounds=value.node.getBoundingClientRect();
      controller.current!.beginMorph(Math.max(from.width,bounds.width),Math.max(from.height,bounds.height));
      layer.current!.dataset.transition="morph";
      const tick=(now:number)=>{
        if(token!==generation.current)return;
        const progress=Math.min(1,(now-start)/800),eased=transitionMix(0,1,progress);
        mix.current=transitionMix(request.mix,mixForView(value.kind),progress);
        const panel=value.node.closest(".site-presentation")!.getBoundingClientRect();
        const destination=localRect(value.node.getBoundingClientRect(),panel);
        const rect=placedRect(from,destination,panel,eased);
        position(rect);controller.current!.morph(mix.current,rect.width,rect.height);
        if(progress<1)animation.current=requestAnimationFrame(tick);
        else {animation.current=0;void mount(value,true,token).then(()=>{if(token===generation.current){layer.current!.dataset.transition="settled";finish(request);}});}
      };
      animation.current=requestAnimationFrame(tick);
    }else{
      const first=value.kind==="home"&&!firstHome.current&&(initialPath.current==="/"||initialPath.current==="/enter")&&!request;
      const navigating=!!request||initialPath.current!==(value.kind==="home"?"/":"/technology")||firstHome.current;
      if(navigating&&!reduced)document.documentElement.dataset.routeState="incoming";
      if(layer.current)layer.current.dataset.transition=navigating&&!reduced?"fade":"settled";
      position();await mount(value,!first,token);if(token!==generation.current)return;
      if(value.kind==="home")firstHome.current=true;
      if(navigating&&!reduced)settleTimer.current=setTimeout(()=>finish(request),innerWidth<768?220:450);else finish(request);
    }
  },[finish,mount,position]);
  activateRef.current=activate;

  const register=useCallback((node:HTMLDivElement,kind:LatticeView)=>{
    const value={node,kind,hero:node.closest<HTMLElement>(".hero")!};slot.current=value;
    const request=pending.current;
    // A route owns either its poster or the shared canvas, including the morph frames.
    node.dataset.renderer=request?.rich&&controller.current&&shared.current&&!prefersStaticScene()&&!canvas.current?.hidden?"morph":"poster";
    node.dataset.live="false";
    position();
    queueMicrotask(()=>{if(slot.current===value&&node.isConnected)void activateRef.current(value,request?.path===(kind==="home"?"/":"/technology")?request:undefined);});
    return ()=>{if(slot.current?.node===node){slot.current=null;controller.current?.pause();if(!pending.current&&layer.current)layer.current.style.visibility="hidden";}};
  },[position]);

  useEffect(()=>{
    const move=()=>{if(animation.current||positionFrame.current)return;positionFrame.current=requestAnimationFrame(()=>{positionFrame.current=0;position();});};
    const click=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const link=(event.target as Element)?.closest<HTMLAnchorElement>("a[href]");
      if(!link||link.hasAttribute("download")||link.target&&link.target!=="_self")return;
      const url=new URL(link.href,location.href),from=viewForPath(currentPath.current),to=viewForPath(url.pathname);
      if(url.origin!==location.origin||url.hash||url.search)return;
      if(!from||!to){if(pending.current){generation.current++;cancelAnimationFrame(animation.current);animation.current=0;pending.current=null;clearState();}return;}
      if(url.pathname===currentPath.current&&!pending.current)return;
      event.preventDefault();
      const bounds=slot.current?.node.getBoundingClientRect()??new DOMRect(),current=layer.current?.getBoundingClientRect()??bounds;
      const panel=slot.current?.node.closest(".site-presentation")?.getBoundingClientRect()??new DOMRect();
      const visible=Math.max(0,Math.min(bounds.bottom,innerHeight)-Math.max(bounds.top,0))/Math.max(1,bounds.height);
      const request:Pending={path:url.pathname,mix:mix.current,rect:localRect(current,panel),keyboard:event.detail===0,rich:canMorph({width:innerWidth,reduced:matchMedia("(prefers-reduced-motion: reduce)").matches,saveData:!!(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData,visible,settled:!!pending.current||canvas.current?.dataset.settled==="true",fallback:canvas.current?.dataset.fallback==="true"})};
      const copy=document.querySelector<HTMLElement>(".hero-copy"),copyRect=copy?.getBoundingClientRect();
      if(copy&&copyRect&&copyRect.top>=(document.querySelector(".site-header")?.getBoundingClientRect().bottom??0)&&copyRect.bottom<=innerHeight&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
        const clone=copy.cloneNode(true) as HTMLElement;clone.classList.add("route-copy-snapshot");clone.inert=true;clone.setAttribute("aria-hidden","true");
        const source=[copy,...copy.querySelectorAll<HTMLElement>("*")],cloned=[clone,...clone.querySelectorAll<HTMLElement>("*")];
        source.forEach((node,i)=>{const css=getComputedStyle(node);Object.assign(cloned[i].style,{font:css.font,color:css.color,margin:css.margin,letterSpacing:css.letterSpacing});cloned[i].removeAttribute("id");});
        Object.assign(clone.style,{position:"absolute",left:`${copyRect.x-panel.x-1}px`,top:`${copyRect.y-panel.y-1}px`,width:`${copyRect.width}px`,height:`${copyRect.height}px`,padding:getComputedStyle(copy).padding});request.copy=clone;
      }
      generation.current++;cancelAnimationFrame(animation.current);animation.current=0;if(request.rich)controller.current?.pause();
      pending.current=request;clearState();document.documentElement.dataset.routePending=to;
      document.querySelector("main#main-content")?.setAttribute("aria-busy","true");
      loadingTimer.current=setTimeout(()=>setLoading(to==="home"?"Opening Home":"Opening Technology"),350);
      router.prefetch(url.pathname);router.push(url.pathname);
      if(url.pathname===currentPath.current&&slot.current)void activateRef.current(slot.current,request);
    };
    const pop=()=>{generation.current++;cancelAnimationFrame(animation.current);animation.current=0;pending.current=null;clearState();};
    const simplify=()=>{if(prefersStaticScene()){generation.current++;cancelAnimationFrame(animation.current);animation.current=0;pending.current=null;controller.current?.pause();if(slot.current){slot.current.node.dataset.live="false";slot.current.node.dataset.renderer="poster";}if(layer.current)layer.current.style.visibility="hidden";clearState();return;}if(slot.current&&!pending.current&&slot.current.node.dataset.renderer==="poster"){void activateRef.current(slot.current);return;}if(pending.current&&slot.current){pending.current.rich=false;slot.current.node.dataset.renderer="poster";position();void activateRef.current(slot.current,pending.current);}else move();};
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    const lost=()=>{unavailable.current=true;};const surface=canvas.current;surface?.addEventListener("webglcontextlost",lost);
    const panels=new MutationObserver(()=>position(animation.current&&layer.current?layer.current.getBoundingClientRect():undefined));panels.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-expanded"]});
    document.addEventListener("click",click,true);window.addEventListener("scroll",move,{passive:true});window.addEventListener("resize",simplify);window.addEventListener("popstate",pop);motion.addEventListener("change",simplify);
    return ()=>{document.removeEventListener("click",click,true);window.removeEventListener("scroll",move);window.removeEventListener("resize",simplify);window.removeEventListener("popstate",pop);motion.removeEventListener("change",simplify);surface?.removeEventListener("webglcontextlost",lost);panels.disconnect();cancelAnimationFrame(positionFrame.current);};
  },[clearState,position,router]);

  useEffect(()=>{
    const changed=previousPath.current!==pathname;previousPath.current=pathname;
    if(!viewForPath(pathname)){
      generation.current++;cancelAnimationFrame(animation.current);animation.current=0;controller.current?.();controller.current=null;pending.current=null;clearState();if(layer.current)layer.current.style.visibility="hidden";
      if(changed&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.routeState="incoming";settleTimer.current=setTimeout(clearState,450);}
    }
  },[pathname,clearState]);
  useEffect(()=>{
    const token=++lifetime.current;
    return ()=>{generation.current++;cancelAnimationFrame(animation.current);clearTimeout(loadingTimer.current);clearTimeout(settleTimer.current);
      queueMicrotask(()=>{if(lifetime.current!==token)return;controller.current?.();void resources.current?.then(value=>value?.dispose());});
    };
  },[]);
  return <SlotContext.Provider value={register}>{children}<div ref={layer} className="persistent-lattice-stage" data-persistent-stage aria-hidden="true"><canvas ref={canvas}/></div><div className="route-loading" role="status" aria-live="polite">{loading&&<><span aria-hidden="true"/><span className="sr-only">{loading}</span></>}</div></SlotContext.Provider>;
}
