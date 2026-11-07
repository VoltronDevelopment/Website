export const disciplineDuration=6.4;
export const disciplineBore={y:1.65,radius:.395,faceRadius:.46,front:.28,rear:-.28,toolRadius:.394,holderLength:.25,holderCenter:.25,gaugeContact:.387,toolBaseFront:.8,toolBaseRear:3.1} as const;
const smooth=(t:number)=>{const p=Math.max(0,Math.min(1,t));return p*p*(3-2*p);};
/** Axial approach, working hold and withdrawal remain separate, reversible phases. */
export function disciplineMotion(input:number,selected:number){
 const t=Math.max(0,Math.min(disciplineDuration,input));
 const approach=smooth((t-.4)/1.4),withdraw=smooth((t-4.4)/1.6);
 const feed=smooth((t-1.8)/2.2);
 const toolZ=1.7+( .24-1.7)*approach-.19*feed+(1.65)*withdraw;
 const gaugeZ=1.55+( .16-1.55)*approach+1.39*withdraw;
 const contact=smooth((t-2)/.6)*(1-smooth((t-3.9)/.45));
 const records=[0,1,2].map(i=>smooth((t-(.6+i*1.35))/.8));
 const rampIntegral=(value:number,duration:number)=>{const p=Math.max(0,Math.min(1,value/duration));return duration*(p*p*p-p*p*p*p/2)+Math.max(0,value-duration);};
 const spindleAngle=9.5*(rampIntegral(t-1.2,.6)-rampIntegral(t-4,.4));
 const phase=selected===0?(t<.4?'Fixture ready':t<1.8?'Tool approach':t<4.4?'Finishing the bore':t<6?'Tool withdrawal':'Bore finish complete'):
 selected===1?(t<.4?'Bore reference':t<1.8?'Gauge approach':t<4.4?'Measure internal diameter':t<6?'Gauge withdrawal':'Feature measured'):
 t<1.4?'Feature identified':t<2.75?'Operation linked':t<4.1?'Observation attached':'Evidence connected';
 return{time:t,toolZ,gaugeZ,spindleAngle,contact,finish:smooth((t-1.8)/2.6),records,phase,working:t>=1.8&&t<4.4,done:t>=disciplineDuration};
}
