/** Stable, bounded connectivity from structural roots into sampled head anatomy. */
export function buildPortraitNetwork(samples: Float32Array) {
  type Node = {position:[number,number,number];blend:number;anchor:boolean};
  const nodes:Node[]=[];
  const random=(i:number,k:number)=>{const v=Math.sin((i+1)*k)*43758.5453;return v-Math.floor(v);};
  const candidates: {position:[number,number,number];score:number}[]=[];
  for(let i=0;i<samples.length;i+=8){const [x,y,z]=[samples[i],samples[i+1],samples[i+2]];const screenX=(x-z)*Math.SQRT1_2;if(screenX<-.15&&y> -1.25&&y<.95&&samples[i+7]>=-.1)candidates.push({position:[x,y,z],score:screenX});}
  candidates.sort((a,b)=>a.position[1]-b.position[1]);
  for(let i=0;i<20&&candidates.length;i++){const index=Math.min(candidates.length-1,Math.floor((i+.5)/20*candidates.length));nodes.push({position:candidates[index].position,blend:1,anchor:true});}
  for(let i=0;i<224;i++){
    const t=i<20?.82+random(i,12.9898)*.08:i<150?random(i,12.9898)*.06:.15+random(i,12.9898)*.6;
    const target=nodes[i%20]?.position??[0,0,0];
    // Fill the projected left half, with three real depth strata inside the cube.
    const screenX=-2.04+random(i,78.233)*1.88;
    const limit=Math.min(1.1,2.1-Math.abs(screenX));
    const depth=((i%3)-1)*limit*.88+(random(i,9.13)-.5)*limit*.14;
    const root:[number,number,number]=[(screenX+depth)*Math.SQRT1_2,-1.5+random(i,39.425)*2.92,(depth-screenX)*Math.SQRT1_2];
    nodes.push({position:root.map((v,j)=>v*(1-t)+target[j]*t) as [number,number,number],blend:t,anchor:false});
  }
  const degree=nodes.map(()=>0),edges:{a:number;b:number;blend:number}[]=[];
  const distance=(a:Node,b:Node)=>Math.hypot(...a.position.map((v,j)=>v-b.position[j]));
  const pairs=[];
  for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){if(nodes[a].anchor&&nodes[b].anchor)continue;const d=distance(nodes[a],nodes[b]);if(d<1.1)pairs.push({a,b,d});}
  pairs.sort((a,b)=>a.d-b.d);
  for(let a=0;a<20;a++){const b=20+a;edges.push({a,b,blend:(nodes[a].blend+nodes[b].blend)/2});degree[a]++;degree[b]++;}
  // Join local regions before filling degrees, retaining long cross-volume bridges.
  const parent=nodes.map((_,i)=>i);const find=(i:number):number=>parent[i]===i?i:(parent[i]=find(parent[i]));
  edges.forEach(({a,b})=>{parent[find(a)]=find(b);});
  for(const {a,b} of pairs){if(degree[a]>=4||degree[b]>=4||find(a)===find(b))continue;edges.push({a,b,blend:(nodes[a].blend+nodes[b].blend)/2});degree[a]++;degree[b]++;parent[find(a)]=find(b);}
  // Give each endpoint a neighbour before filling the remaining short links.
  for(const fill of [false,true])for(const {a,b} of pairs){if(degree[a]>=4||degree[b]>=4||(!fill&&degree[a]>0&&degree[b]>0)||edges.some(e=>e.a===a&&e.b===b))continue;edges.push({a,b,blend:(nodes[a].blend+nodes[b].blend)/2});degree[a]++;degree[b]++;}
  return {nodes,edges};
}
