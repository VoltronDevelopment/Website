import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {blendSceneFrames,createSceneHandoff} from '../components/performance/scene-handoff';

describe('one-clock scene handoff',()=>{
  let frames:Map<number,FrameRequestCallback>,id:number;
  const fixture=()=>{
    const poster={style:{opacity:'',visibility:''},querySelectorAll:()=>[{complete:true,naturalWidth:10,getBoundingClientRect:()=>({width:10})}]};
    const host={dataset:{} as Record<string,string>,querySelectorAll:()=>[poster]};
    const canvas={style:{opacity:'',transition:''}};
    return {poster,host,canvas,handoff:createSceneHandoff(host as unknown as HTMLElement,canvas as unknown as HTMLCanvasElement)};
  };
  function step(time:number){const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(time));}
  beforeEach(()=>{
    frames=new Map();id=0;
    vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{frames.set(++id,callback);return id;});
    vi.stubGlobal('cancelAnimationFrame',(key:number)=>frames.delete(key));
    vi.stubGlobal('document',{hidden:false});vi.stubGlobal('location',{search:''});
    vi.stubGlobal('matchMedia',()=>({matches:false}));
  });
  afterEach(()=>vi.unstubAllGlobals());
  it('keeps matching translucent glass at the same colour and opacity throughout the dissolve',()=>{
    let output=[0,0,0,0];
    const context={globalAlpha:1,globalCompositeOperation:'source-over',
      clearRect(){output=[0,0,0,0];},
      drawImage(image:{pixel:number[]}){
        const alpha=image.pixel[3]*context.globalAlpha;
        const source=[...image.pixel.slice(0,3).map(value=>value*alpha),alpha];
        output=source.map((value,index)=>value+output[index]*(context.globalCompositeOperation==='lighter'?1:1-alpha));
      },
    };
    const image={width:1,height:1,pixel:[.1,.4,.8,.4]} as unknown as HTMLCanvasElement;
    for(const progress of [0,.25,.5,.75,1]){
      blendSceneFrames(context as unknown as CanvasRenderingContext2D,image,image,progress);
      [.04,.16,.32,.4].forEach((expected,index)=>expect(output[index]).toBeCloseTo(expected));
    }
  });
  it('holds the opening frame until its single dissolve finishes',async()=>{
    const {canvas,poster,host,handoff}=fixture();let playing=false;
    const ready=handoff.reveal().then(()=>{playing=true;});
    step(10);step(130);expect(playing).toBe(false);expect(+canvas.style.opacity).toBeGreaterThan(0);
    expect(+canvas.style.opacity + +poster.style.opacity).toBeCloseTo(1);
    for(let time=170;time<=370;time+=40)step(time);
    await ready;expect(playing).toBe(true);expect(host.dataset.sceneState).toBe('live');
    expect(poster.style.visibility).toBe('hidden');expect(canvas.style.opacity).toBe('1');expect(frames.size).toBe(0);
  });
  it('cancels pending work on unmount without leaving a waiting caller',async()=>{
    const {canvas,handoff}=fixture();const ready=handoff.reveal();step(10);handoff.dispose();
    const opacity=canvas.style.opacity;step(500);await ready;
    expect(canvas.style.opacity).toBe(opacity);expect(frames.size).toBe(0);
  });
  it('returns to one completed fallback after a renderer failure',async()=>{
    const {canvas,poster,host,handoff}=fixture();const ready=handoff.reveal();step(10);handoff.fallback();await ready;
    expect(host.dataset.scenePose).toBe('complete');expect(host.dataset.sceneState).toBe('fallback');
    expect(canvas.style.opacity).toBe('0');expect(poster.style.visibility).toBe('visible');expect(frames.size).toBe(0);
  });
});
