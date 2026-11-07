import {afterEach,expect,it,vi} from 'vitest';
import * as T from 'three';
import {bracketSheet} from '../components/network/bracket-sheet';
import {factoryKit} from '../components/network/factory-kit';
import {requirementArtwork} from '../components/network/requirement-artwork';
afterEach(()=>vi.unstubAllGlobals());
it('keeps the reference seated during formation and its handoff on orthogonal segments',()=>{
 // Canvas drawing is tested in the browser; this test inspects actual scene geometry.
 const context=new Proxy({},{get:(_target,key)=>key==='createRadialGradient'?()=>({addColorStop(){}}):()=>{}});
 vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>context})});
 const resources:{dispose():void}[]=[],own=<R extends {dispose():void}>(r:R)=>{resources.push(r);return r;};
 const root=new T.Group(),kit=factoryKit(own),art=requirementArtwork(root,kit,own);
 for(const phone of [false,true])for(const time of [8.1,8.6,9.4,12,16,10,16]){
  root.userData.phone=phone;art.update(time,false);root.updateMatrixWorld(true);
  const reference=root.getObjectByName('requirement-reference')!,support=root.getObjectByName('requirement-support')!;
  const casting=new T.Box3().setFromObject(reference.children[0]),surface=new T.Box3().setFromObject(support.children[0]);
  expect(casting.min.y).toBeCloseTo(surface.max.y,6);
  expect(casting.min.x).toBeGreaterThan(surface.min.x);expect(casting.max.x).toBeLessThan(surface.max.x);
  const positions=(root.getObjectByName('requirement-handoff') as T.Line).geometry.getAttribute('position');
  for(let i=1;i<positions.count;i++){
   const a=new T.Vector3().fromBufferAttribute(positions,i-1),b=new T.Vector3().fromBufferAttribute(positions,i);
   expect([b.x-a.x,b.y-a.y,b.z-a.z].filter(v=>Math.abs(v)>1e-6).length).toBeLessThanOrEqual(1);
  }
 }
 resources.forEach(r=>r.dispose());
});

it('keeps the graphite endpoint under the pencil during contact and retraces a seek exactly',()=>{
 let x=0,y=0,lifts=0,touches=0;
 const ctx={clearRect(){},beginPath(){},moveTo(){},stroke(){},fillText(){},
  lineTo(u:number,v:number){x=u;y=v;}} as unknown as CanvasRenderingContext2D;
 const sheet=bracketSheet(),sample=sheet.draw(ctx,5.75,false);
 for(let t=.3;t<10.65;t+=.073){
  const tip=sheet.draw(ctx,t,false);
  if(tip.lift>0){lifts++;continue;}
  expect(tip.x).toBeCloseTo(x,6);expect(tip.y).toBeCloseTo(y,6);touches++;
 }
 expect(lifts).toBeGreaterThan(5);expect(touches).toBeGreaterThan(30);
 expect(sheet.draw(ctx,5.75,true)).toEqual(sample);
});
