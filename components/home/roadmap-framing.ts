/** Shared camera and projection for the live and motion-free five-cube story. */
export const roadmapLocations=[-3.7,-2.6,-1.12,.75,3.02] as const;
export const roadmapYaw=.52;
export function roadmapFrame(index:number,aspect:number){
 const i=Math.max(0,Math.min(4,Math.floor(index))),spanX=[4.1,5.8,7.4,9,10.5][i];
 const spanY=Math.max(1.4+i*.29,spanX/Math.max(.1,aspect));
 return {x:[-3.3,-2.1,-1.3,-.5,0][i],y:.35+i*.0625,spanY,spanX:spanY*aspect};
}
export function roadmapProject(point:[number,number,number],frame:ReturnType<typeof roadmapFrame>,width:number,height:number){
 const upY=16/Math.hypot(2,16),upZ=-2/Math.hypot(2,16);
 return [(point[0]-frame.x)/frame.spanX*width+width/2,height/2-((point[1]-frame.y)*upY+point[2]*upZ)/frame.spanY*height];
}
