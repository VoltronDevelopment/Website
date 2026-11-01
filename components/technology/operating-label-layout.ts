export type LabelRect={x:number;y:number;width:number;height:number};
const overlaps=(a:LabelRect,b:LabelRect)=>a.x<b.x+b.width+8&&a.x+a.width+8>b.x&&a.y<b.y+b.height+8&&a.y+a.height+8>b.y;
/** Candidate positions sit outside the equipment's immediate projected silhouette. */
export function placeOperatingLabel(x:number,y:number,width:number,height:number,bounds:{width:number;height:number},occupied:LabelRect[]):LabelRect|null{
 const candidates=[[18,-height-28],[-width-18,-height-28],[24,20],[-width-24,20],[0,-height-75],[45,-height-65],[-width-45,-height-65]];
 for(const [dx,dy]of candidates){const r={x:x+dx,y:y+dy,width,height};if(r.x<12||r.y<16||r.x+width>bounds.width-12||r.y+height>bounds.height-66||occupied.some(other=>overlaps(r,other)))continue;return r;}return null;
}
