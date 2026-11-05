import * as T from 'three';
export type SupportingGlassRole='clear-enclosure'|'frosted-reading';
/** Cheaper supporting optics use the shared studio environment, never another scene pass. */
export function supportingGlassSettings(role:SupportingGlassRole,dark:boolean){
 const reading=role==='frosted-reading';
 return {color:reading?(dark?0x41627d:0xd4e5ef):(dark?0x6e9bb8:0xc1dce9),opacity:reading?(dark?.62:.74):(dark?.25:.32),roughness:reading?.34:.14,clearcoat:reading?.3:.8,clearcoatRoughness:reading?.26:.12,envMapIntensity:reading?.42:.95,metalness:0,ior:1.46,transmission:0};
}
export function createSupportingGlass(role:SupportingGlassRole){
 const material=new T.MeshPhysicalMaterial({...supportingGlassSettings(role,false),transparent:true,depthWrite:false,side:T.DoubleSide});material.userData.opticalRole=role;return material;
}
export function updateSupportingGlass(material:T.MeshPhysicalMaterial,dark:boolean){
 const {color,...settings}=supportingGlassSettings(material.userData.opticalRole as SupportingGlassRole,dark);material.color.setHex(color);Object.assign(material,settings);
}
