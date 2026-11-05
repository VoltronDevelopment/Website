import layout from '../../public/sculptures/neural-network.json';
/** A deterministic spanning tree preserves one connected graph before extra links are filled. */
export function selectedNeuralLinks(){
 const target=Math.round(layout.edges.length*.8),selected=new Set<number>(),parent=layout.nodes.map((_,i)=>i);
 const root=(n:number):number=>{while(parent[n]!==n){parent[n]=parent[parent[n]];n=parent[n];}return n;};
 layout.edges.forEach((edge,i)=>{const a=root(edge.from),b=root(edge.to);if(a!==b){selected.add(i);parent[a]=b;}});
 const ranked=layout.edges.map((_,i)=>i).filter(i=>!selected.has(i)).sort((a,b)=>(Math.imul(a+1,2654435761)>>>0)-(Math.imul(b+1,2654435761)>>>0));
 for(const i of ranked){if(selected.size>=target)break;selected.add(i);}
 return layout.edges.filter((_,i)=>selected.has(i));
}
/** Three complete, fixed routes carry the signals; the rest remains relationship context. */
export function neuralSignalPaths(links=selectedNeuralLinks()){
 const used=new Set<number>(),paths:number[][]=[];
 for(const start of [6,12,18]){
  let current=start;const path:number[]=[];
  for(let layer=0;layer<3;layer++){
   const candidates=links.map((edge,index)=>({edge,index})).filter(({edge})=>edge.layer===layer&&edge.from===current).sort((a,b)=>Number(used.has(a.edge.to))-Number(used.has(b.edge.to))||a.edge.length-b.edge.length||a.index-b.index);
   if(!candidates.length)break;const next=candidates[0];path.push(next.index);current=next.edge.to;used.add(current);
  }
  if(path.length===3)paths.push(path);
 }
 return paths;
}
export const neuralSignalTiming={start:4,speed:.8,stagger:.14} as const;
export function neuralSignals(links=selectedNeuralLinks()){
 const paths=neuralSignalPaths(links),seeds=new Map<number,number>(),arrivals=new Map<number,number[]>();
 const add=(node:number,time:number)=>arrivals.set(node,[...(arrivals.get(node)||[]),time]);
 paths.forEach((path,channel)=>path.forEach((index,layer)=>{
  const seed=channel/paths.length;seeds.set(index,seed);
  const edge=links[index],start=neuralSignalTiming.start+(layer+seed*neuralSignalTiming.stagger)/neuralSignalTiming.speed;
  add(edge.from,start);add(edge.to,start+1/neuralSignalTiming.speed);
 }));
 return {paths,seeds,arrivals};
}
