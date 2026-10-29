import * as THREE from 'three';

/** The Network globe and roadmap use the identical envelope topology. */
export const globeEnvelopeRadius=1.8*1.16;
export const globeEnvelopeView={tiltZ:-.12,cameraY:.3,cameraZ:9.1} as const;
export function createGlobeEnvelope(radius=globeEnvelopeRadius){
 const surface=new THREE.IcosahedronGeometry(radius,2);
 return {surface,wire:new THREE.WireframeGeometry(surface)};
}
export function globeEnvelopePalette(dark:boolean,bright=false){
 return {color:bright?(dark?0xa8e9ff:0x347eac):(dark?0x7ba6ba:0x315c77),opacity:bright?(dark?.39:.33):(dark?.15:.17)};
}
export function createGlobeEnvelopeMaterial(dark=false){
 const palette=globeEnvelopePalette(dark);
 return new THREE.LineBasicMaterial({...palette,transparent:true,depthWrite:false});
}
export function updateGlobeEnvelopeMaterial(material:THREE.LineBasicMaterial,dark:boolean,bright=false){
 const palette=globeEnvelopePalette(dark,bright);
 material.color.setHex(palette.color);material.opacity=palette.opacity;
}
