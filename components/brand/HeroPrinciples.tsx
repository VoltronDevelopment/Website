import {Box,Layers,Network,ShieldCheck,Users,ChartNoAxesColumnIncreasing} from "lucide-react";
const icons=[Box,Network,ShieldCheck];
export function HeroPrinciples({labels,home=false}:{labels:readonly string[];home?:boolean}){
 const set=home?[Users,Network,ChartNoAxesColumnIncreasing]:labels[0].includes("Surface")?[Layers,ChartNoAxesColumnIncreasing,Network]:icons;
 return <div className="hero-principle-strip"><ul className="container">{labels.map((label,i)=>{const Icon=set[i%set.length];return <li key={label}><Icon size={26} strokeWidth={1.4} aria-hidden="true"/><span>{label}</span></li>;})}</ul></div>;
}
