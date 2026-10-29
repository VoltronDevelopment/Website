import type {MeshPhysicalMaterial} from 'three';
import {glassFace,setGlass,type GlassFace} from '../home/lattice-materials';
import {addHomePaneReflections,type PaneRole} from '../home/home-glass';

export const latticeFaceKinds:GlassFace[]=['side','side','top','bottom','front','rear'];
export const latticeFaceRoles:PaneRole[]=['near','recess','crown','base','near','recess'];
export const latticeFaceNormals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] as const;
/** The approved modularity cube is the optical reference at every scene scale. */
export const latticeBevel=(edge:number)=>edge*(.035/1.65);
export function createLatticeCellMaterials(tone:'light'|'dark',edge:number,dark=false){
 return latticeFaceKinds.map((kind,face)=>{
  const material=glassFace(kind,dark,true,'home',latticeFaceRoles[face]);
  material.userData.homeCellTone=tone;
  addHomePaneReflections(material,kind,1.65/edge);
  setGlass(material,kind,dark);
  return material;
 });
}
/** Palette updates never wrap shader hooks or grow the program-cache key. */
export function updateLatticeCellMaterials(materials:MeshPhysicalMaterial[],dark:boolean,internalFaces:readonly boolean[]=[]){
 materials.forEach((material,face)=>{
  setGlass(material,latticeFaceKinds[face],dark);
  if(internalFaces[face])material.opacity*=.13;
  material.userData.baseEmissive=material.emissiveIntensity;
 });
}
