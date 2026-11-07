type RGB=readonly [number,number,number];
export type AgentVisualPreset={name:string;family:'folds'|'fine'|'clouds';motion:'directional'|'circulating';seed:number;scale:RGB;contours:number;warp:number;speed:number;density:number;smoke:number;gather:number;particles:number;low:string;mid:string;high:string;aura:string};
/** Identity stays fixed while a separate activity envelope changes emphasis. */
export const agentPresets:readonly AgentVisualPreset[]=[
 {name:'KAVO',family:'folds',motion:'directional',seed:11,scale:[1.1,1.6,1.3],contours:8,warp:2.5,speed:1.5,density:1.25,smoke:.04,gather:0,particles:.08,low:'#102B61',mid:'#75B7EC',high:'#E4F4FF',aura:'#9DD9FF'},
 {name:'RIXA',family:'fine',motion:'directional',seed:27,scale:[2.2,2.4,2.1],contours:23,warp:2.1,speed:1.9,density:1.1,smoke:0,gather:0,particles:.2,low:'#07152D',mid:'#265DE8',high:'#D9F6FF',aura:'#77DFFF'},
 {name:'MEKO',family:'clouds',motion:'circulating',seed:43,scale:[1.5,1.2,1.5],contours:6,warp:3.1,speed:1,density:1.5,smoke:.32,gather:.2,particles:0,low:'#071523',mid:'#17394F',high:'#2E7888',aura:'#438A9B'},
 {name:'ZILO',family:'folds',motion:'directional',seed:61,scale:[.65,3,1.3],contours:11,warp:2.4,speed:3.3,density:1.05,smoke:0,gather:0,particles:.12,low:'#071B4F',mid:'#174FFF',high:'#19D6F2',aura:'#12BFF3'},
 {name:'SARO',family:'fine',motion:'circulating',seed:79,scale:[2.1,1.4,2.1],contours:14,warp:2.2,speed:2.3,density:.6,smoke:0,gather:1,particles:.75,low:'#0A3344',mid:'#16A8C7',high:'#D0FAF5',aura:'#69E6E8'},
 {name:'TEYO',family:'clouds',motion:'directional',seed:97,scale:[1.9,1.7,2],contours:10,warp:3.4,speed:2,density:1.15,smoke:.1,gather:.45,particles:0,low:'#101735',mid:'#34468D',high:'#409EE8',aura:'#739BF4'},
];
export function agentSelectionResponse(age:number,reduced=false){return reduced||age<0||!Number.isFinite(age)?0:Math.min(1,age*2)*Math.exp(-age*.6);}
