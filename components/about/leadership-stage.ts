export const leadershipStage={side:2.64,floorY:-1.24,turnEnd:3.15,duration:4.3} as const;

export function leadershipTurn(time:number){
 const u=Math.min(1,Math.max(0,(time-.18)/2.97));
 return Math.PI/9+(Math.PI/4-Math.PI/9)*u*u*(3-2*u);
}

export const leadershipElevation=Math.atan(1/Math.sqrt(2));

/** The subject grows from its seated footprint before travelling toward the glass. */
export function leadershipPose(time:number){
 const smooth=(start:number,end:number)=>{
  const u=Math.max(0,Math.min(1,(time-start)/(end-start)));
  return u*u*(3-2*u);
 };
 const formed=smooth(.22,leadershipStage.turnEnd);
 const advance=smooth(leadershipStage.turnEnd,leadershipStage.duration);
 return {formed,advance,scale:.8+.2*formed,depth:.22*advance};
}

export function leadershipFrame(aspect:number){
 const width=leadershipStage.side*Math.SQRT2;
 const projectedHeight=leadershipStage.side*Math.cos(leadershipElevation)+width*Math.sin(leadershipElevation);
 const height=Math.max(projectedHeight+.25,(width+.22)/Math.max(.1,aspect));
 return {width:height*aspect,height};
}
