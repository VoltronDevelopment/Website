/** Outside of a convex cylinder: the centre projects toward the reader. */
export function convexCardPose(delta:number,radius:number){
 const angle=delta*.73;
 return {x:radius*Math.sin(angle),z:radius*(Math.cos(angle)-1),angle:angle*180/Math.PI};
}
