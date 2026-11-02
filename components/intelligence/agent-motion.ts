export type AgentFormation={amount:number;arrangement:number;resolve:number;label:string};
const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(t*(t*6-15)+10);};
const actions=['Organizing checks','Scanning evidence','Examining history','Comparing streams','Gathering records','Connecting findings'];
/** Six phase offsets keep the strongest formations staggered. Endpoints have zero velocity. */
export function galleryFormation(time:number,agent:number):AgentFormation{
 const t=((time+agent*4)%24+24)%24;
 const amount=ease((t-6)/3)*(1-ease((t-17)/4));
 return {amount,arrangement:ease((t-12)/3),resolve:ease((t-15)/2),label:amount<.025?'Fluid identity':t<9?'Forming from flow':t<15?actions[agent]:t<17?'Resolving evidence':'Returning to flow'};
}
export function taskFormation(activity:number,progress:number,agent:number):AgentFormation{
 if(activity<0)return {amount:.8,arrangement:.3,resolve:0,label:'Waiting for evidence'};
 if(activity===0)return {amount:0,arrangement:1,resolve:1,label:progress>=1?'Complete · fluid identity':'Fluid identity'};
 return {amount:1,arrangement:ease((progress-.35)/.35),resolve:ease((progress-.8)/.2),label:actions[agent]};
}
/** Exact critically damped spring; bounded dt prevents a hidden tab causing a leap. */
export function settleFormation(value:number,velocity:number,target:number,delta:number){
 const dt=Math.max(0,Math.min(.1,delta)),omega=5,offset=value-target,j=velocity+omega*offset,e=Math.exp(-omega*dt);
 return {value:target+(offset+j*dt)*e,velocity:(velocity-omega*j*dt)*e};
}
