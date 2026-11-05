export type LabelRect={x:number;y:number;width:number;height:number};
const overlaps=(a:LabelRect,b:LabelRect)=>a.x<b.x+b.width+8&&a.x+a.width+8>b.x&&a.y<b.y+b.height+8&&a.y+a.height+8>b.y;
/** Candidate positions sit outside the equipment's immediate projected silhouette. */
export function placeOperatingLabel(x:number,y:number,width:number,height:number,bounds:{width:number;height:number},occupied:LabelRect[],previous?:LabelRect):LabelRect|null{
 const safe=(r:LabelRect)=>r.x>=12&&r.y>=16&&r.x+width<=bounds.width-12&&r.y+height<=bounds.height-66&&!occupied.some(other=>overlaps(r,other));
 if(previous&&Math.abs(previous.width-width)<1&&Math.abs(previous.height-height)<1&&Math.hypot(previous.x+width/2-x,previous.y+height/2-y)<210&&safe(previous))return previous;
 const candidates=[[18,-height-52],[-width-18,-height-28],[24,20],[-width-24,20],[0,-height-75],[45,-height-65],[-width-45,-height-65]];
 for(const [dx,dy]of candidates){const r={x:x+dx,y:y+dy,width,height};if(!safe(r))continue;return r;}return null;
}

/** Attach a leader to the nearest label edge, never through its text. */
export function operatingLabelPort(x:number,y:number,r:LabelRect){const cx=r.x+r.width/2,cy=r.y+r.height/2,dx=x-cx,dy=y-cy;const scale=1/Math.max(Math.abs(dx)/(r.width/2),Math.abs(dy)/(r.height/2),.0001);return {x:cx+dx*scale,y:cy+dy*scale};}
