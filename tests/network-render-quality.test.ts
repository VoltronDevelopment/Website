import {afterEach,describe,expect,it,vi} from 'vitest';
import {createRenderQuality} from '../components/performance/scene-policy';
afterEach(()=>vi.unstubAllGlobals());
describe('Network intentional 30fps quality policy',()=>{
 it('retains high definition at its intended pace, but adapts to sustained slow rendering',()=>{
  vi.stubGlobal('devicePixelRatio',2);vi.stubGlobal('document',{hidden:false});
  const canvas={dataset:{}} as HTMLCanvasElement,quality=createRenderQuality(canvas,2,55);
  let now=1;for(let i=0;i<200;i++){now+=1000/30;quality.sample(now);}
  expect(quality.ratio).toBe(2);expect(canvas.dataset.renderQuality).toBe('full');
  for(let i=0;i<200;i++){now+=80;quality.sample(now);}
  expect(quality.ratio).toBeLessThan(2);
 });
});
