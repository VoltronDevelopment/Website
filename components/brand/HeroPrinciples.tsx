import {Box,Layers,Network,ShieldCheck,Users,ChartNoAxesColumnIncreasing,BookOpen,Lightbulb,Factory,Brain,Leaf} from "lucide-react";
const icons=[Box,Network,ShieldCheck];
function principleIcon(label:string){
 if(/learn|knowledge|access/i.test(label))return BookOpen;
 if(/possibility|imagination/i.test(label))return Lightbulb;
 if(/human|people|partnership|shared progress/i.test(label))return Users;
 if(/plant|production|industrial/i.test(label))return Factory;
 if(/judgment|reasoning|intelligence/i.test(label))return Brain;
 if(/nature|regeneration/i.test(label))return Leaf;
 if(/quality|authority|govern/i.test(label))return ShieldCheck;
 return null;
}
export function HeroPrinciples({labels,home=false}:{labels:readonly string[];home?:boolean}){
 const set=home?[Users,Network,ChartNoAxesColumnIncreasing]:labels[0].includes("Surface")?[Layers,ChartNoAxesColumnIncreasing,Network]:icons;
 return <div className="hero-principle-strip"><ul className="container">{labels.map((label,i)=>{const Icon=home?set[i%set.length]:principleIcon(label)||set[i%set.length];return <li key={label}><Icon size={26} strokeWidth={1.4} aria-hidden="true"/><span>{label}</span></li>;})}</ul></div>;
}
