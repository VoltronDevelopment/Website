import {selectedNeuralLinks} from '../components/brand/neural-links';
import {neuralFaceKinds,neuralNodeIsLight,tuneNeuralGlass} from '../components/brand/neural-optics';
import {describe,it,expect} from 'vitest';
import * as T from 'three';
import layout from '../public/sculptures/neural-network.json';
import {frameNeuralCamera} from '../components/brand/neural-network-framing';
import {neuralState,neuralDuration} from '../components/brand/neural-network-timeline';
describe('Complete source neural-network sculpture',()=>{
 it('uses the Home glass family with readable faces and bounded reflections in both themes',()=>{
  for(const dark of [false,true]){const materials=neuralFaceKinds.map((_,i)=>{const m=new T.MeshPhysicalMaterial();tuneNeuralGlass(m,i,dark);return m;});
   for(const m of materials){expect(m.opacity).toBeGreaterThan(.2);expect(m.opacity).toBeLessThanOrEqual(.8);expect(m.envMapIntensity).toBeLessThan(1);expect(m.roughness).toBeGreaterThanOrEqual(.2);expect(m.color.getHex()).not.toBe(0xffffff);m.dispose();}
   expect(materials[2].color.getHex()).not.toBe(materials[0].color.getHex());
  }
  expect(Array.from({length:7},(_,i)=>neuralNodeIsLight(i)).filter(Boolean)).toHaveLength(3);
 });
 it('reduces displayed links by twenty percent without isolating any node',()=>{const links=selectedNeuralLinks();expect(links.length).toBe(Math.round(layout.edges.length*.8));expect(new Set(links.flatMap(e=>[e.from,e.to])).size).toBe(54);expect(selectedNeuralLinks()).toEqual(links);const visited=new Set<number>([0]),queue=[0];while(queue.length){const id=queue.shift()!;for(const e of links){const next=e.from===id?e.to:e.to===id?e.from:-1;if(next>=0&&!visited.has(next)){visited.add(next);queue.push(next);}}}expect(visited.size).toBe(54);});
 it('retains 54 source nodes and all 433 unique adjacent-layer links',()=>{expect(layout.nodes).toHaveLength(54);expect(layout.edges).toHaveLength(433);expect(layout.sourceConnectionCaps).toBe(866);expect([0,1,2,3].map(i=>layout.nodes.filter(n=>n.layer===i).length)).toEqual([25,9,16,4]);const pairs=new Set();for(const e of layout.edges){expect(layout.nodes[e.to].layer-layout.nodes[e.from].layer).toBe(1);pairs.add(e.from+','+e.to);}expect(pairs.size).toBe(433);});
 it('attaches each link exactly to its corresponding cube face',()=>{for(const e of layout.edges)for(const [id,point] of [[e.from,e.start],[e.to,e.end]] as const){const n=layout.nodes[id],delta=point.map((x,i)=>Math.abs(x-n.position[i]));expect(Math.max(...delta)).toBeCloseTo(n.edge/2,7);expect(delta.every(x=>x<=n.edge/2+1e-7)).toBe(true);}});
 it('preserves every node inside desktop, tablet and mobile frames',()=>{for(const aspect of [1.5,1.15,1,.85,2]){const c=new T.PerspectiveCamera(35,aspect,.1,100);c.position.fromArray(layout.camera.position);c.lookAt(new T.Vector3().fromArray(layout.camera.target));c.updateMatrixWorld();frameNeuralCamera(c,aspect);for(const n of layout.nodes)for(let i=0;i<8;i++){const p=new T.Vector3(...n.position as [number,number,number]).add(new T.Vector3(i&1?n.edge/2:-n.edge/2,i&2?n.edge/2:-n.edge/2,i&4?n.edge/2:-n.edge/2)).project(c);expect(Math.abs(p.x)).toBeLessThan(.9);expect(Math.abs(p.y)).toBeLessThan(.9);expect(p.z).toBeLessThan(1);}}});
 it('establishes every connection before signal propagation and leaves the full graph at rest',()=>{expect(neuralState(4).links.every(x=>x===1)).toBe(true);const end=neuralState(neuralDuration);expect(end.links).toEqual([1,1,1]);expect(end.energy).toBe(0);expect(end.done).toBe(true);for(const n of layout.nodes)expect(end.node(n.id,n.layer)).toBe(1);expect(neuralState(NaN).time).toBe(0);expect(neuralState(99).time).toBe(neuralDuration);});
});
