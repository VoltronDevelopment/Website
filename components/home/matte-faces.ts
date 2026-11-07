import {MeshBasicMaterial} from 'three';

// Fixed face values keep the illustrations readable without specular highlights.
const values=[.78,.78,1.18,.66,1,1];
export function matteFaces(){
 return values.map(()=>new MeshBasicMaterial({toneMapped:false}));
}
export function tintMatte(faces:MeshBasicMaterial[],color:number){
 faces.forEach((face,i)=>face.color.setHex(color).multiplyScalar(values[i]));
}
