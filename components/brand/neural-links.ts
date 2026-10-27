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
