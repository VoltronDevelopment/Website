import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {createGlobeEnvelope} from '../components/brand/globe-envelope';
import {envelopeNetwork,networkSites,envelopeCenter,plantBuildState,networkLearningFrame} from '../components/network/network-growth';
describe('Construction and exact globe network',()=>{
 it('establishes the first plant before widening continuously to the exact final shared architecture',()=>{
  for(const aspect of [.75,1,1.8])for(const phone of [false,true]){
   expect(networkLearningFrame(0,aspect,phone).target).toEqual([networkSites[0][0],.9,networkSites[0][2]]);
   const final=networkLearningFrame(24,aspect,phone);final.target.forEach((value,i)=>expect(value).toBeCloseTo([0,5.6,0][i],8));expect(final.height).toBe(Math.max(23,(phone?27:31)/aspect));
   expect(networkLearningFrame(5.2,aspect,phone).target[0]).toBeCloseTo(0,8);let previous=networkLearningFrame(0,aspect,phone);for(let time=.05;time<=24;time+=.05){const next=networkLearningFrame(time,aspect,phone);expect(next.height).toBeGreaterThanOrEqual(previous.height);expect(Math.abs(next.height-previous.height)).toBeLessThan(1);expect(Math.abs(next.target[0]-previous.target[0])).toBeLessThan(.26);previous=next;}
  }
 });
 it('shows both first factories while the second site is still forming',()=>{
  for(const aspect of [.75,1,1.8])for(const phone of [false,true]){
   const frame=networkLearningFrame(4.8,aspect,phone),target=new T.Vector3(...frame.target),camera=new T.OrthographicCamera(-frame.height*aspect/2,frame.height*aspect/2,frame.height/2,-frame.height/2,.1,150);
   camera.position.copy(target).add(new T.Vector3(18,18,18));camera.lookAt(target);camera.updateMatrixWorld(true);
   for(const site of networkSites.slice(0,2))for(const x of [-2,2])for(const y of [-.2,3])for(const z of [-1.5,1.5]){
    const projected=new T.Vector3(site[0]+x,y,site[2]+z).project(camera);expect(Math.abs(projected.x)).toBeLessThan(1);expect(Math.abs(projected.y)).toBeLessThan(1);
   }
  }
 });
 it('only glows after equipment, systems and roof have completed',()=>{expect(plantBuildState(19).complete).toBe(false);expect(plantBuildState(19.9).glow).toBe(0);const s=plantBuildState(22);expect(s.frame).toBe(1);expect(s.envelope).toBe(1);expect(s.equipment).toBe(1);expect(s.systems).toBe(1);expect(s.roofClose).toBe(1);expect(s.glow).toBeGreaterThan(.9);expect(plantBuildState(24).glow).toBeCloseTo(.28);});
 it('preserves every original globe edge and keeps the elevated hub clear of every roof',()=>{const graph=envelopeNetwork(),original=createGlobeEnvelope();expect(graph.edges.length*2).toBe(original.wire.getAttribute('position').count);expect(new Set(graph.anchors).size).toBe(5);for(const [x,y,z] of networkSites)for(const dx of [-2,2])for(const dz of [-1.5,1.5])expect(y+2.5).toBeLessThan(envelopeCenter[1]-graph.radius);original.surface.dispose();original.wire.dispose();});
 it('transfers only across adjacent mesh vertices and returns exact source/receiver anchors',()=>{const g=envelopeNetwork(),edges=new Set(g.edges.flatMap(([a,b])=>[a+':'+b,b+':'+a]));for(const [a,b] of [[0,1],[0,2],[1,3],[3,4]]){const path=g.path(a,b);expect(path[0]).toEqual(g.vertices[g.anchors[a]]);expect(path.at(-1)).toEqual(g.vertices[g.anchors[b]]);for(let i=1;i<path.length;i++)expect(edges.has(g.vertices.indexOf(path[i-1])+':'+g.vertices.indexOf(path[i]))).toBe(true);}});
});
