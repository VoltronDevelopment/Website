/** Fixed anchors shared by character motion and artwork; mobile changes only the camera fit. */
export const partnerStage={start:1.76,stop:.90,width:4.35,height:2.95,panel:{width:1.12,height:1.28,depth:.045,center:[0,1.20,.15] as const,yaw:.16}};
const ease=(input:number)=>{const p=Math.max(0,Math.min(1,input));return p*p*p*(p*(p*6-15)+10);};
/** The lens holds for footfalls, then closes gently around the shared brief. */
export function partnerFrame(time:number,aspect:number){const blend=ease((time-5.8)/2.6),height=Math.max(2.95-.62*blend,(4.35-1.48*blend)/Math.max(.1,aspect));return {height,width:height*aspect};}
/** Complementary presentation beats preserve the same anatomical end pose. */
export function partnerActing(time:number,index:number){
 const reach=ease((time-(index?6.9:6.1))/(index?1.7:1.4));
 const explain=index?ease((time-9.05)/.65)*(1-ease((time-10.3)/.9)):0;
 return {reach,explain,acknowledge:Math.sin(Math.PI*Math.max(0,Math.min(1,(time-(index?10.55:10.8))/.85)))};
}
