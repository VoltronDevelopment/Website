import type {MeshPhysicalMaterial} from 'three';
import {tuneHomeGlass} from '../home/home-glass';
import type {GlassFace} from '../home/lattice-materials';
/** Match Home's pearl and smoked optical family without miniature white hot faces. */
export const neuralFaceKinds:readonly GlassFace[]=['side','rear','top','bottom','front','rear'];
export const neuralNodeIsLight=(id:number)=>[0,3,6].includes(id%7);
export const neuralNodeTint=(id:number,dark:boolean)=>neuralNodeIsLight(id)?0xd8e3eb:dark?0x8ea4b6:0x35546c;
export function tuneNeuralGlass(material:MeshPhysicalMaterial,index:number,dark:boolean,reflection=1,roughness=1){
 const kind=neuralFaceKinds[index];tuneHomeGlass(material,kind,dark);
 material.opacity=Math.min(.8,material.opacity+(kind==='top'||kind==='side'?.25:kind==='front'?.35:.1));
 material.roughness=Math.min(1,(kind==='top'?.20:.24)*roughness);
 material.envMapIntensity*=.55*reflection;material.clearcoat*=.65;material.clearcoatRoughness=.2;
 material.userData.homeReflectionGain.value=dark?.13:.25;
}
