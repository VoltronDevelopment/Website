import {it,expect,vi} from 'vitest';
import {ScenePreparationObserver} from '../components/performance/scene-preparation-observer';
it('queues the visible supporting scene first and cancels preparation when a target leaves',async()=>{
 vi.useFakeTimers();let receive:(entries:IntersectionObserverEntry[])=>void=()=>{};
 vi.stubGlobal('window',{setTimeout,requestIdleCallback:undefined});vi.stubGlobal('document',{hidden:false});vi.stubGlobal('innerHeight',800);
 vi.stubGlobal('IntersectionObserver',class{constructor(cb:typeof receive){receive=cb;}observe(){}unobserve(){}disconnect(){}});
 const target=(top:number)=>({getBoundingClientRect:()=>({top,bottom:top+200})}) as Element;
 const near=target(1000),visible=target(100),run=vi.fn(),observer=new ScenePreparationObserver(run,{});
 try{observer.observe(near);observer.observe(visible);receive([{target:near,isIntersecting:true},{target:visible,isIntersecting:true}] as IntersectionObserverEntry[]);observer.unobserve(near);await vi.runAllTimersAsync();expect(run).toHaveBeenCalledTimes(1);expect(run.mock.calls[0][0][0].target).toBe(visible);}
 finally{observer.disconnect();vi.useRealTimers();vi.unstubAllGlobals();}
});
