import * as THREE from "three";
import type {GlassFace} from "./lattice-materials";
export type PaneRole="backing"|"crown"|"near"|"recess"|"shared"|"base"|"clear";
/** Two cells enclosing the logo void and the supporting cell directly below it. */
export function homeCellTone(cell:readonly number[]):"dark"|"light"{
  return (cell[1]>1&&(cell[0]>0||cell[2]>0))||(cell[1]<1&&cell[0]>0&&cell[2]>0)?"light":"dark";
}
export function homePaneRole(cell:readonly number[],normal:readonly number[],shared=false):PaneRole{
  if(shared)return "shared";
  if(cell[1]>1&&((cell[0]>.0&&normal[2]===1)||(cell[2]>.0&&normal[0]===1)))return "backing";
  if(normal[1]>0)return "crown";
  if(normal[1]<0)return "base";
  return normal[0]>0||normal[2]>0?"near":"recess";
}

/** Home's optical preset. Other scenes retain their independently reviewed glass. */
export function tuneHomeGlass(material:THREE.MeshPhysicalMaterial,kind:GlassFace,dark:boolean){
  const opacity=dark
    ? {top:.44,side:.49,front:.20,rear:.30,bottom:.24,internal:.012}
    : {top:.34,side:.40,front:.12,rear:.16,bottom:.14,internal:.014};
  const colour=dark
    ? {top:0x8bb9d9,side:0x28577f,front:0x7aafd0,rear:0x1d4567,bottom:0x285376,internal:0x193e58}
    : {top:0xecf6ff,side:0x82aecf,front:0xddecf8,rear:0x88a9c6,bottom:0x739abc,internal:0xc4e0f4};
  material.color.setHex(colour[kind]);material.opacity=opacity[kind];
  material.roughness=kind==="internal"?.3:kind==="top"?.075:.11;
  material.clearcoat=dark?.65:1;material.clearcoatRoughness=dark?.14:.065;
  material.envMapIntensity=kind==="internal"?.15:dark?1.25:1.45;
  material.emissiveIntensity=.012;
  material.userData.homeReflectionGain??={value:1};
  material.userData.homeReflectionGain.value=dark?.32:.8;
  const role=material.userData.paneRole as PaneRole|undefined;
  if(role==="backing"){
    material.color.setHex(dark?0x071828:0xf8fcff);material.opacity=dark?.94:.84;
    material.roughness=dark?.32:.24;material.envMapIntensity=dark?.07:.28;
    material.clearcoat=dark?.12:.38;material.clearcoatRoughness=.28;
    material.emissive.setHex(dark?0x061522:0xc5deed);material.emissiveIntensity=dark?.005:.045;
  }else if(role==="recess"){
    material.color.setHex(dark?0x102e49:0x527d9f);material.opacity=dark?.65:.3;
  }else if(role==="near"){
    material.color.setHex(dark?0x315c7d:0x94bad6);material.opacity=dark?.56:.30;
  }else if(role==="crown"){
    material.color.setHex(dark?0x477b9e:0xe3f1fc);material.opacity=dark?.52:.33;
  }
  // Cell identity is independent of page theme; face roles still provide depth.
  const tone=material.userData.homeCellTone;
  if(tone&&kind!=="internal"){
    const ink=tone==="dark",backing=role==="backing";
    material.color.setHex((ink
      ? {top:0x163149,side:0x0d263c,front:0x102c43,rear:0x081c2e,bottom:0x071725,internal:0x193e58}
      : {top:0xf6fbff,side:0xd4e6f2,front:0xf2f8fc,rear:0xddeaf3,bottom:0xb9d1e3,internal:0xc4e0f4})[kind]);
    material.opacity=ink?(backing?.96:role==="crown"?.86:role==="recess"?.88:kind==="bottom"?.68:.84)
      :backing?.86:role==="crown"?.62:role==="near"?.55:role==="recess"?.46:kind==="bottom"?.3:.38;
    material.roughness=backing?.26:ink?.16:.12;
    material.envMapIntensity=backing?.08:ink?.38:dark?.8:1.2;
    material.clearcoat=backing?.12:ink?.38:.8;material.clearcoatRoughness=backing?.28:.12;
    material.emissive.setHex(ink?0x061522:0xc5deed);material.emissiveIntensity=ink?.005:dark?.035:.015;
    material.userData.homeReflectionGain.value=ink?.14:dark?.55:.75;
  }
}

/** Authored softbox bands give flat orthographic panes a spatial reflection gradient.
 * Physical environment/area-light shading remains underneath; this is not refraction.
 */
export function addHomePaneReflections(material:THREE.MeshPhysicalMaterial,kind:GlassFace){
  if(kind==="internal"||kind==="bottom")return;
  const plane=kind==="top"?"position.xz":kind==="side"?"position.zy":"position.xy";
  const role=material.userData.paneRole as PaneRole|undefined;
  const strength=role==="backing"?.025:kind==="front"?.28:kind==="rear"?.55:kind==="top"?.75:.55;
  material.onBeforeCompile=shader=>{
    shader.uniforms.uHomeReflectionGain=material.userData.homeReflectionGain||{value:1};
    shader.vertexShader=shader.vertexShader.replace("#include <common>","#include <common>\nvarying vec2 vHomePane;")
      .replace("#include <begin_vertex>",`#include <begin_vertex>\nvHomePane = ${plane};`);
    shader.fragmentShader=shader.fragmentShader.replace("#include <common>","#include <common>\nvarying vec2 vHomePane;\nuniform float uHomeReflectionGain;")
      .replace("#include <opaque_fragment>",`
        float homeAxis = vHomePane.x * ${kind==="top"?".28":".65"} + vHomePane.y * ${role==="recess"?"-.35":".12"};
        float homeBroad = exp(-pow((homeAxis + .22) / .34, 2.));
        float homeStrip = exp(-pow((homeAxis - .34) / .09, 2.));
        float homeDarkCard = exp(-pow((homeAxis - .12) / .17, 2.));
        outgoingLight *= 1. - homeDarkCard * ${(.42*strength).toFixed(3)};
        outgoingLight += vec3(.75, .88, 1.) * (homeBroad * .42 + homeStrip * .8) * ${strength.toFixed(3)} * uHomeReflectionGain;
        diffuseColor.a *= .78 + homeBroad * .28 + homeStrip * .38;
        #include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=>`pane-reflections-v3-${kind}-${role||"display"}`;
}

/** Three's Material.clone/copy omits shader hooks; preserve them for lit/arrival copies. */
export function cloneArtworkMaterial<T extends THREE.Material>(base:T):T{
  const material=base.clone();material.onBeforeCompile=base.onBeforeCompile;
  material.customProgramCacheKey=base.customProgramCacheKey;return material;
}
