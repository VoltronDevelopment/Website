import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {canPrepareHomeScene,createScenePreparationQueue} from "../components/home/scene-preparation";

describe("nearby scene preparation",()=>{
  beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal("window",{setTimeout,requestIdleCallback:undefined});});
  afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
  it("prepares one scene at a time and yields between them",async()=>{
    const enqueue=createScenePreparationQueue(),calls:string[]=[];
    let finish:()=>void=()=>{};
    enqueue(async()=>{calls.push("first");await new Promise<void>(resolve=>{finish=resolve;});});
    enqueue(()=>{calls.push("second");});
    await vi.advanceTimersByTimeAsync(32);expect(calls).toEqual(["first"]);
    await vi.advanceTimersByTimeAsync(200);expect(calls).toEqual(["first"]);
    finish();await vi.advanceTimersByTimeAsync(0);expect(calls).toEqual(["first"]);
    await vi.advanceTimersByTimeAsync(32);expect(calls).toEqual(["first","second"]);
  });
  it("does not mount a queued scene that has unmounted",async()=>{
    const enqueue=createScenePreparationQueue(),run=vi.fn();
    const cancel=enqueue(run);cancel();await vi.runAllTimersAsync();
    expect(run).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
  });
  it("continues after an optional scene fails",async()=>{
    const enqueue=createScenePreparationQueue(),next=vi.fn();
    enqueue(()=>Promise.reject(new Error("Chunk unavailable")));enqueue(next);
    await vi.runAllTimersAsync();expect(next).toHaveBeenCalledTimes(1);
  });
  it("yields to a foreground animation and still permits cancellation",async()=>{
    const enqueue=createScenePreparationQueue(),run=vi.fn();let allowed=false;
    const cancel=enqueue(run,()=>allowed);await vi.advanceTimersByTimeAsync(500);
    expect(run).not.toHaveBeenCalled();allowed=true;await vi.advanceTimersByTimeAsync(120);
    expect(run).toHaveBeenCalledTimes(1);cancel();
    allowed=false;const cancelPending=enqueue(run,()=>allowed);cancelPending();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("uses cancellable browser idle scheduling when available",async()=>{
    const callback=vi.fn((run:()=>void)=>setTimeout(run,1));
    const cancelIdle=vi.fn(clearTimeout);
    vi.stubGlobal("window",{requestIdleCallback:callback,cancelIdleCallback:cancelIdle,setTimeout});
    const enqueue=createScenePreparationQueue(),run=vi.fn();const cancel=enqueue(run);
    expect(callback).toHaveBeenCalledWith(expect.any(Function),{timeout:1000});cancel();
    expect(cancelIdle).toHaveBeenCalled();await vi.runAllTimersAsync();expect(run).not.toHaveBeenCalled();
  });
});

describe("foreground hero preparation guard",()=>{
  afterEach(()=>vi.unstubAllGlobals());
  function page(top:number,bottom:number,running=true,hidden=false){
    vi.stubGlobal("innerHeight",900);
    vi.stubGlobal("document",{hidden,querySelector:()=>({
      querySelector:()=>({dataset:{continuousRendering:String(running)}}),
      getBoundingClientRect:()=>({top,bottom,height:bottom-top}),
    })});
  }
  it("waits while the opening hero is mostly visible and animating",()=>{
    page(100,800);expect(canPrepareHomeScene()).toBe(false);
    page(-280,420);expect(canPrepareHomeScene()).toBe(false);
  });
  it("permits nearby work after scrolling past the foreground hero",()=>{
    page(-300,400);expect(canPrepareHomeScene()).toBe(true);
  });
  it("permits preparation once the hero settles or is absent",()=>{
    page(100,800,false);expect(canPrepareHomeScene()).toBe(true);
    vi.stubGlobal("document",{hidden:false,querySelector:()=>null});
    expect(canPrepareHomeScene()).toBe(true);
  });
  it("does not prepare optional scenes in a hidden tab",()=>{
    page(100,800,false,true);expect(canPrepareHomeScene()).toBe(false);
  });
});
