import {describe,expect,it} from 'vitest';
import {architectureRoute} from '../components/brand/architecture-route';
const bounds=(left:number,top:number,width:number,height:number)=>({left,top,width,height,right:left+width,bottom:top+height});
describe('orthogonal architecture connections',()=>{
 it('joins the centre hub to desktop tile boundaries with right-angle segments',()=>{
  expect(architectureRoute(bounds(400,160,200,180),bounds(100,100,180,150),{left:100,top:100})).toBe('M300 117.6H240V75H180');
  expect(architectureRoute(bounds(400,160,200,180),bounds(720,300,180,150),{left:100,top:100})).toBe('M500 182.4H560V275H620');
 });
 it('routes lower phone tiles around the outside of the upper cards',()=>{
  const hub=bounds(16,12,300,126), origin={left:0,top:0};
  expect(architectureRoute(hub,bounds(16,332,138,138),origin)).toBe('M16 75H4V401H16');
  expect(architectureRoute(hub,bounds(178,332,138,138),origin)).toBe('M316 75H328V401H316');
 });
 it('keeps routes local to the diagram when the document scrolls',()=>{
  const hub=bounds(400,1160,200,180),tile=bounds(720,1300,180,150);
  expect(architectureRoute(hub,tile,{left:100,top:1100})).toBe('M500 182.4H560V275H620');
 });
});
