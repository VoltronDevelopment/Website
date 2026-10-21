import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {createLatticeActivity} from "../components/home/lattice-activity";
import {alignmentLight,junctionPulse} from "../components/home/lattice-lighting";

describe("selective lattice lighting",()=>{
  it("lights aligned junctions briefly and leaves distant cubes quiet",()=>{
    expect(alignmentLight(1.62,[.5,.5,.5],[[0,0,0]],[0])).toBeCloseTo(1);
    expect(alignmentLight(1.62,[3,.5,.5],[[0,0,0]],[0])).toBe(0);
    expect(alignmentLight(2.2,[.5,.5,.5],[[0,0,0]],[0])).toBe(0);
    expect(junctionPulse(0,1)).toBe(0);
  });
});

describe("shared idle and pointer controller",()=>{
  beforeEach(()=>{
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>setTimeout(()=>callback(performance.now()),16));
    vi.stubGlobal("cancelAnimationFrame",(id:ReturnType<typeof setTimeout>)=>clearTimeout(id));
  });
  afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
  function setup(){
    const host=Object.assign(new EventTarget(),{dataset:{} as Record<string,string>,getBoundingClientRect:()=>({left:0,top:0})}) as unknown as HTMLElement;
    const onFrame=vi.fn();
    const activity=createLatticeActivity({host,points:[[0,0,0],[1,0,0],[2,0,0]],links:[[0,1],[1,2]],project:index=>({x:20+index*80,y:20,visible:true}),onFrame});
    const move=()=>host.dispatchEvent(Object.assign(new Event("pointermove"),{clientX:20,clientY:20,pointerType:"mouse"}));
    return {host,activity,onFrame,move};
  }
  it("sleeps between finite idle paths rather than rendering continuously",()=>{
    const {host,activity,onFrame}=setup();activity.arm();vi.advanceTimersByTime(7900);
    expect(onFrame).not.toHaveBeenCalled();expect(host.dataset.lightRendering).toBe("false");
    vi.advanceTimersByTime(350);expect(host.dataset.lightMode).toBe("idle");expect(activity.nodeStrength(0)).toBeGreaterThan(0);
    vi.advanceTimersByTime(1500);expect(host.dataset.lightMode).toBe("rest");expect(host.dataset.lightRendering).toBe("false");activity.dispose();
  });
  it("lets a nearby pointer take priority and fades before resetting the idle delay",()=>{
    const {host,activity,move}=setup();activity.arm();vi.advanceTimersByTime(8200);move();vi.advanceTimersByTime(200);
    expect(host.dataset.lightMode).toBe("pointer");expect(activity.nodeStrength(0)).toBeCloseTo(.8);
    expect(activity.nodeStrength(2)).toBe(0);expect(host.dataset.lightRendering).toBe("false");
    host.dispatchEvent(new Event("pointerleave"));vi.advanceTimersByTime(500);
    expect(host.dataset.lightMode).toBe("rest");expect(activity.nodeStrength(0)).toBe(0);
    vi.advanceTimersByTime(7000);expect(host.dataset.lightMode).toBe("rest");activity.dispose();
  });
  it("cancels work while offscreen, disabled, or disposed",()=>{
    const {activity,host,move,onFrame}=setup();activity.arm();activity.setVisible(false);onFrame.mockClear();
    vi.advanceTimersByTime(15000);move();expect(onFrame).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
    activity.setVisible(true);activity.setEnabled(false);vi.advanceTimersByTime(10000);expect(host.dataset.lightMode).toBe("rest");
    expect(vi.getTimerCount()).toBe(0);activity.setEnabled(true);activity.dispose();expect(vi.getTimerCount()).toBe(0);
  });
  it("does not redraw or restart timers when the enabled state is unchanged",()=>{
    const {activity,onFrame}=setup();activity.arm();activity.setEnabled(false);
    onFrame.mockClear();activity.setEnabled(false);activity.setEnabled(false);
    expect(onFrame).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
    activity.setEnabled(true);vi.advanceTimersByTime(7000);activity.setEnabled(true);
    vi.advanceTimersByTime(1200);expect(onFrame).toHaveBeenCalled();activity.dispose();
  });
});
