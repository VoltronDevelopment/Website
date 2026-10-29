import {prepareScene,scenePreparationPriority} from '../home/scene-preparation';
/** Serialize nearby WebGL preparation; playback observers remain owned by each renderer. */
export class ScenePreparationObserver {
 private observer:IntersectionObserver;
 private pending=new Map<Element,()=>void>();
 constructor(callback:(entries:IntersectionObserverEntry[])=>void|Promise<void>,options:IntersectionObserverInit){
  this.observer=new IntersectionObserver(entries=>{for(const entry of entries){
   this.pending.get(entry.target)?.();this.pending.delete(entry.target);
   if(!entry.isIntersecting)continue;
   const cancel=prepareScene(async()=>{this.pending.delete(entry.target);await callback([entry]);},()=>!document.hidden,()=>scenePreparationPriority(entry.target));
   this.pending.set(entry.target,cancel);
  }},options);
 }
 observe(target:Element){this.observer.observe(target);}
 unobserve(target:Element){this.pending.get(target)?.();this.pending.delete(target);this.observer.unobserve(target);}
 disconnect(){this.observer.disconnect();this.pending.forEach(cancel=>cancel());this.pending.clear();}
}
