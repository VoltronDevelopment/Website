import * as T from 'three';
import {createGlobeEnvelope,globeEnvelopeRadius,globeEnvelopeView} from '../brand/globe-envelope';
import {smooth} from './network-story';
import type {Point} from './network-simulation';
export const networkSites:Point[]=[[-8.16,0,5.27],[8.16,0,5.27],[-6.8,0,-6.46],[6.8,0,-6.46],[0,0,-.34]];
export const envelopeScale=1.2,envelopeCenter:Point=[0,15,0];
export function plantBuildState(time:number){
 return {foundation:smooth(time/2.5),frame:smooth((time-3)/3),envelope:smooth((time-7)/3),equipment:smooth((time-11)/3),systems:smooth((time-16)/2),roofClose:smooth((time-18)/2),complete:time>=20,glow:time<20?0:smooth((time-20)/.4)*(.28+.72*Math.sin(Math.PI*smooth((time-20)/4)))};
}
/** Vertices and adjacency come directly from the exact globe wire, without new triangulation. */
export function envelopeNetwork(){
 const {surface,wire}=createGlobeEnvelope(),a=wire.getAttribute('position'),vertices:Point[]=[],localVertices:Point[]=[],edges:[number,number][]=[],lookup=new Map<string,number>();
 const transform=new T.Matrix4().compose(new T.Vector3(...envelopeCenter),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),globeEnvelopeView.tiltZ),new T.Vector3(envelopeScale,envelopeScale,envelopeScale));
 const index=(i:number)=>{const v=new T.Vector3().fromBufferAttribute(a,i),key=v.toArray().map(n=>n.toFixed(5)).join(',');if(!lookup.has(key)){lookup.set(key,vertices.length);localVertices.push(v.toArray() as Point);vertices.push(v.applyMatrix4(transform).toArray() as Point);}return lookup.get(key)!;};
 for(let i=0;i<a.count;i+=2)edges.push([index(i),index(i+1)]);
 const adjacency=vertices.map(()=>[] as number[]);edges.forEach(([a,b])=>{adjacency[a].push(b);adjacency[b].push(a);});
 const used=new Set<number>();const anchors=networkSites.map(([x,,z])=>{const angle=Math.atan2(z,x);let best=-1,distance=Infinity;localVertices.forEach(([lx,ly,lz],i)=>{if(used.has(i)||Math.abs(ly)>globeEnvelopeRadius*.22)return;const delta=Math.atan2(Math.sin(Math.atan2(lz,lx)-angle),Math.cos(Math.atan2(lz,lx)-angle));const score=delta*delta+20*(ly/globeEnvelopeRadius)**2;if(score<distance){distance=score;best=i;}});if(best<0)throw Error('No distinct equatorial mesh port');used.add(best);return best;});

 function path(from:number,to:number):Point[]{const start=anchors[from],end=anchors[to],cost=vertices.map(()=>Infinity),parent=vertices.map(()=>-1),pending=new Set(vertices.map((_,i)=>i));cost[start]=0;while(pending.size){let u=-1;for(const i of pending)if(u<0||cost[i]<cost[u])u=i;if(u===end||!Number.isFinite(cost[u]))break;pending.delete(u);for(const v of adjacency[u]){const d=cost[u]+new T.Vector3(...vertices[u]).distanceTo(new T.Vector3(...vertices[v]));if(d<cost[v]){cost[v]=d;parent[v]=u;}}}const ids=[end];while(ids[0]!==start){const p=parent[ids[0]];if(p<0)throw Error('Disconnected globe envelope');ids.unshift(p);}return ids.map(i=>vertices[i]);}
 surface.dispose();wire.dispose();return {vertices,localVertices,edges,anchors,path,radius:globeEnvelopeRadius*envelopeScale};
}
