/** The same three cube sizes and camera direction, projected without loading Three.js. */
export function PhilosophyStill() {
  const normal=(p:number[])=>{const length=Math.hypot(...p);return p.map(x=>x/length);};
  const forward=normal([6,4.15,7]),right=normal([7,0,-6]);
  const up=[forward[1]*right[2]-forward[2]*right[1],forward[2]*right[0]-forward[0]*right[2],forward[0]*right[1]-forward[1]*right[0]];
  const project=(p:number[])=>{const v=[p[0],p[1]-.65,p[2]],dot=(a:number[])=>a.reduce((s,n,i)=>s+n*v[i],0);return `${(dot(right)/6.4+.5)*640},${(.5-dot(up)/4.8)*480}`;};
  return <svg className="philosophy-still" viewBox="0 0 640 480" aria-hidden="true">{[[2.1,0],[.7,0],[.36,2.3]].map(([size,y],index)=>{
    const corners=Array.from({length:8},(_,i)=>[(i&1?1:-1)*size/2,(i&2?1:-1)*size/2+y,(i&4?1:-1)*size/2]);
    return [[2,6,7,3],[1,3,7,5],[4,5,7,6]].map((face,j)=><polygon key={`${index}-${j}`} points={face.map(i=>project(corners[i])).join(' ')} fill="var(--blue)" fillOpacity={index?.6+j*.12:.12} stroke="var(--blue)" strokeWidth="1.2"/>);
  })}</svg>;
}
