/** Surface-distance weights keep separate fingers from sharing bones across air. */
export function buildHandGeodesics(position,indices,landmarks){
 const lookup=new Map(),map=new Uint32Array(position.length/3),points=[];
 for(let i=0;i<position.length;i+=3){const key=[position[i],position[i+1],position[i+2]].map(v=>Math.round(v*10000)).join(',');let n=lookup.get(key);if(n===undefined){n=points.length/3;lookup.set(key,n);points.push(position[i],position[i+1],position[i+2]);}map[i/3]=n;}
 const count=points.length/3,unique=new Set(),edges=[];
 for(let i=0;i<indices.length;i+=3)for(let k=0;k<3;k++){
  const a=map[indices[i+k]],b=map[indices[i+(k+1)%3]];if(a===b)continue;
  const lo=Math.min(a,b),hi=Math.max(a,b),key=lo*count+hi;if(unique.has(key))continue;unique.add(key);edges.push(a,b);
 }
 const degree=new Uint32Array(count);for(const node of edges)degree[node]++;
 const offsets=new Uint32Array(count+1);for(let i=0;i<count;i++)offsets[i+1]=offsets[i]+degree[i];
 const cursor=offsets.slice(),neighbours=new Uint32Array(edges.length),lengths=new Float32Array(edges.length);
 for(let i=0;i<edges.length;i+=2){const a=edges[i],b=edges[i+1],distance=Math.hypot(points[a*3]-points[b*3],points[a*3+1]-points[b*3+1],points[a*3+2]-points[b*3+2]);const x=cursor[a]++,y=cursor[b]++;neighbours[x]=b;lengths[x]=distance;neighbours[y]=a;lengths[y]=distance;}
 const fields={};
 for(const [name,target]of Object.entries(landmarks)){
  const distances=new Float32Array(count);distances.fill(Infinity);const heap=[];
  const push=(node,distance)=>{let i=heap.length;heap.push([node,distance]);while(i){const parent=(i-1)>>1;if(heap[parent][1]<=distance)break;heap[i]=heap[parent];i=parent;}heap[i]=[node,distance];};
  const pop=()=>{const first=heap[0],tail=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1][1]<heap[child][1])child++;if(heap[child][1]>=tail[1])break;heap[i]=heap[child];i=child;}heap[i]=tail;}return first;};
  let closest=0,best=Infinity;for(let i=0;i<count;i++){const d=Math.hypot(points[i*3]-target[0],points[i*3+1]-target[1],points[i*3+2]-target[2]);if(d<best){best=d;closest=i;}}
  distances[closest]=0;push(closest,0);
  while(heap.length){const [node,distance]=pop();if(distance>distances[node]+1e-6)continue;for(let j=offsets[node];j<offsets[node+1];j++){const next=neighbours[j],candidate=distance+lengths[j];if(candidate<distances[next]){distances[next]=candidate;push(next,distances[next]);}}}
  fields[name]=distances;
 }
 return {map,fields,nodes:count};
}
