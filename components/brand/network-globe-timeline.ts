export const globeDuration=10;
export const globeEase=(v:number)=>{const t=Math.min(1,Math.max(0,v));return Math.min(1,Math.max(0,t*t*t*(t*(t*6-15)+10)));};
export const globeNodes=[
 [20.6,78.9],[1.3,103.8],[35.7,139.7],[50.1,8.7],[25.2,55.3],[-26.2,28],[-23.6,-46.6],[40.7,-74],[37.8,-122.4],[-33.9,151.2],
 [28.6,77.2],[13.1,80.3],[37.6,127],[31.2,121.5],[-6.2,106.8],[13.8,100.5],[21,105.8],[41,29],[48.9,2.4],[51.5,-.1],
 [-1.3,36.8],[6.5,3.4],[30,31.2],[43.7,-79.4],[34.1,-118.2],[19.4,-99.1],[-33.4,-70.7],[-34.6,-58.4],[-36.8,174.8],[-32,115.9],
 [23.8,90.4],[6.9,79.9],[24.9,67.1],[24.7,46.7]
] as const;
// Illustrative geography, not a claim of operating sites. Regional meshes plus
// intercontinental backbones keep the visible hemisphere richly connected.
export const globeLinks=[
 [0,10],[0,11],[0,4],[0,1],[0,30],[0,31],[0,32],[0,3],[0,13],[0,20],[0,9],
 [10,30],[10,32],[10,4],[11,31],[11,1],[11,15],[30,15],[30,16],[31,4],[32,33],
 [1,15],[1,14],[1,16],[1,13],[1,2],[1,29],[1,9],[15,16],[16,13],[13,12],[12,2],[13,2],[2,9],
 [9,29],[9,28],[29,14],[29,5],[4,33],[4,17],[4,22],[4,20],[4,5],[33,22],[22,20],[22,17],
 [20,5],[20,21],[21,5],[21,18],[22,18],[17,3],[17,18],[3,18],[3,19],[18,19],[3,20],
 [3,7],[19,7],[18,23],[7,23],[7,8],[7,24],[8,24],[24,25],[7,25],[7,6],[25,6],[6,27],[6,26],[26,27],
 [2,8],[9,24],[28,26],[5,6],[21,6]
] as const;
const routeStart=(index:number)=>.9+index/(globeLinks.length-1)*6.2;
export function globeState(seconds:number){
 const time=Math.min(globeDuration,Math.max(0,Number.isFinite(seconds)?seconds:0));
 return {time,body:globeEase(time/.7),angle:Math.PI*2*globeEase((time-.7)/8),done:time===globeDuration,
  arc:(index:number)=>globeEase((time-routeStart(index))/1.15),
  response:(index:number)=>{const age=(time-routeStart(index)-1.15)/.65;return age>0&&age<1?Math.sin(Math.PI*age)**2:0;},
  energy:time<9.6?1-globeEase((time-8.5)/1.1):0};
}
export function globeCoordinate(lat:number,lng:number,radius=1){const a=lat*Math.PI/180,b=lng*Math.PI/180;return [radius*Math.cos(a)*Math.sin(b),radius*Math.sin(a),radius*Math.cos(a)*Math.cos(b)] as [number,number,number];}
export function globeArc(a:readonly number[],b:readonly number[],progress:number,radius=1.8){
 const va=globeCoordinate(a[0],a[1]),vb=globeCoordinate(b[0],b[1]),dot=Math.min(.999999,Math.max(-.999999,va.reduce((n,v,i)=>n+v*vb[i],0))),angle=Math.acos(dot),s=Math.sin(angle);
 const t=Math.min(1,Math.max(0,progress)),h=radius*(1+Math.sin(Math.PI*t)*(.09+.14*angle/Math.PI));
 return va.map((v,i)=>(v*Math.sin((1-t)*angle)+vb[i]*Math.sin(t*angle))/s*h) as [number,number,number];
}
