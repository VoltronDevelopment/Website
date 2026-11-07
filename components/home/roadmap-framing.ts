import {philosophyCamera} from './philosophy-cube-timeline';
import {roadmapAscentPose} from '@/lib/voltron-roadmap';
/** Shared camera and projection for the live and motion-free five-cube story. */
export const roadmapLocations=[-3.7,-2.6,-1.12,.75,3.02] as const;
const [x,y,z]=philosophyCamera.position;
export const roadmapYaw=-Math.atan2(x,z);
export const roadmapRise=(y-philosophyCamera.target[1])/Math.hypot(x,z);
export function roadmapFrame(index:number,aspect:number){
 const i=Math.max(0,Math.min(4,Math.floor(index))),size=roadmapAscentPose(i).size;
 const halfWidth=(Math.cos(roadmapYaw)-Math.sin(roadmapYaw))/2;
 const left=roadmapLocations[0]-roadmapAscentPose(0).size*halfWidth,right=roadmapLocations[i]+size*halfWidth;
 const spanY=Math.max(size*1.85,1.25,(right-left)*1.1/Math.max(.1,aspect));
 return {x:(left+right)/2,y:.08+size/2,spanY,spanX:spanY*aspect};
}
export function roadmapProject(point:[number,number,number],frame:ReturnType<typeof roadmapFrame>,width:number,height:number){
 const upY=1/Math.hypot(roadmapRise,1),upZ=-roadmapRise*upY;
 return [(point[0]-frame.x)/frame.spanX*width+width/2,height/2-((point[1]-frame.y)*upY+point[2]*upZ)/frame.spanY*height];
}
