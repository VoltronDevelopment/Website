import {describe,expect,it,vi} from "vitest";
import type {WebGLRenderer,WebGLRenderTarget} from "three";
import {sizeHeroSurface} from "../components/home/hero-surface";

function setup(){
  let ratio=1;
  const renderer={domElement:{width:300,height:150},getPixelRatio:()=>ratio,setDrawingBufferSize:vi.fn((w:number,h:number,r:number)=>{ratio=r;renderer.domElement.width=Math.floor(w*r);renderer.domElement.height=Math.floor(h*r);})};
  const targets=Array.from({length:3},()=>{const target={width:1,height:1,setSize:vi.fn((w:number,h:number)=>{target.width=w;target.height=h;})};return target;});
  const size=(w:number,h:number,r=1)=>sizeHeroSurface(renderer as unknown as WebGLRenderer,targets as unknown as WebGLRenderTarget[],w,h,r);
  return {renderer,targets,size};
}
describe("stable hero drawing buffers",()=>{
  it("does not reset unchanged drawing buffers or render targets",()=>{
    const {renderer,targets,size}=setup();size(536,480);size(536,480);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(1);
    targets.forEach(target=>expect(target.setSize).toHaveBeenCalledTimes(1));
    expect(targets[1]).toMatchObject({width:268,height:240});
  });
  it("ignores subpixel changes that do not change the backing pixel dimensions",()=>{
    const {renderer,size}=setup();size(536.1,480.1);size(536.2,480.2);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(1);
  });
  it("updates all buffers when display density changes",()=>{
    const {renderer,targets,size}=setup();size(536,480);size(536,480,1.75);
    expect(renderer.setDrawingBufferSize).toHaveBeenCalledTimes(2);
    expect(targets[0]).toMatchObject({width:938,height:840});
    expect(targets[1]).toMatchObject({width:469,height:420});
  });
});
