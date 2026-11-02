import {describe,it,expect} from 'vitest';
import * as T from 'three';
import {createGlobeEnvelope} from '../components/brand/globe-envelope';
import {envelopeNetwork,networkSites,envelopeCenter,plantBuildState} from '../components/network/network-growth';
describe('Construction and exact globe network',()=>{
 it('only glows after equipment, systems and roof have completed',()=>{expect(plantBuildState(19).complete).toBe(false);expect(plantBuildState(19.9).glow).toBe(0);const s=plantBuildState(22);expect(s.frame).toBe(1);expect(s.envelope).toBe(1);expect(s.equipment).toBe(1);expect(s.systems).toBe(1);expect(s.roofClose).toBe(1);expect(s.glow).toBeGreaterThan(.9);expect(plantBuildState(24).glow).toBeCloseTo(.28);});
 it('preserves every original globe edge and keeps the elevated hub clear of every roof',()=>{const graph=envelopeNetwork(),original=createGlobeEnvelope();expect(graph.edges.length*2).toBe(original.wire.getAttribute('position').count);expect(new Set(graph.anchors).size).toBe(5);for(const [x,y,z] of networkSites)for(const dx of [-2,2])for(const dz of [-1.5,1.5])expect(y+2.5).toBeLessThan(envelopeCenter[1]-graph.radius);original.surface.dispose();original.wire.dispose();});
 it('transfers only across adjacent mesh vertices and returns exact source/receiver anchors',()=>{const g=envelopeNetwork(),edges=new Set(g.edges.flatMap(([a,b])=>[a+':'+b,b+':'+a]));for(const [a,b] of [[0,1],[0,2],[1,3],[3,4]]){const path=g.path(a,b);expect(path[0]).toEqual(g.vertices[g.anchors[a]]);expect(path.at(-1)).toEqual(g.vertices[g.anchors[b]]);for(let i=1;i<path.length;i++)expect(edges.has(g.vertices.indexOf(path[i-1])+':'+g.vertices.indexOf(path[i]))).toBe(true);}});
});
