import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import {addHomePaneReflections,tuneHomeGlass,type PaneRole} from "./home-glass";
export type GlassProfile="home"|"display"|"portrait"|"process"|"commons";

export type GlassFace="top"|"side"|"front"|"rear"|"bottom"|"internal";
const light={top:0xf8fcff,side:0x91c7ec,front:0xc7e8fa,rear:0xc5dcee,bottom:0x9abfdc,internal:0xc4e0f4};
const studioLight={top:0xe9f5ff,side:0x6e9fc5,front:0xd6eafa,rear:0x8ba9c6,bottom:0x628bad,internal:0xc4e0f4};
const night={top:0x6596bd,side:0x23567d,front:0x397da8,rear:0x16364e,bottom:0x123044,internal:0x193e58};
const lightOpacity={top:.3,side:.3,front:.14,rear:.045,bottom:.09,internal:.02};
const darkOpacity={top:.24,side:.24,front:.13,rear:.04,bottom:.075,internal:.02};
const studioLightOpacity={top:.38,side:.46,front:.13,rear:.18,bottom:.17,internal:.014};
const studioDarkOpacity={top:.25,side:.29,front:.10,rear:.12,bottom:.10,internal:.012};

export function setGlass(material:THREE.MeshPhysicalMaterial,kind:GlassFace,dark:boolean){
  const studio=material.userData.artworkStudio===true;
  material.color.setHex((dark?night:studio?studioLight:light)[kind]);
  material.opacity=(studio?(dark?studioDarkOpacity:studioLightOpacity):(dark?darkOpacity:lightOpacity))[kind];
  material.roughness=studio?(kind==="internal"?.3:kind==="top"?.09:.13):(kind==="top"?.23:.34);
  material.ior=studio?1.46:1.5;
  material.clearcoat=studio?.95:dark?.5:.65;
  material.clearcoatRoughness=studio?.08:.2;
  material.envMapIntensity=studio?(kind==="internal"?.15:dark?.85:1.15):(kind==="top"?.55:dark?.32:.38);
  material.emissive.setHex(0x246bd4);material.emissiveIntensity=.012;
  if(material.userData.glassProfile==="home")tuneHomeGlass(material,kind,dark);
  else if(material.userData.glassProfile){
    // The shared Home optics establish the same pearl crown, deep sides and softbox bands.
    tuneHomeGlass(material,kind,dark);
    const portrait=material.userData.glassProfile==="portrait",process=material.userData.glassProfile==="process";
    if(kind==='front')material.opacity=dark?.10:.075;
    if(portrait)material.opacity*=kind==="front"?.22:kind==="rear"?.45:.55;
    if(process)material.opacity*=.65;
  }
  material.userData.faceKind=kind;
  material.userData.restOpacity=material.opacity;
}

export function glassFace(kind:GlassFace,dark=false,studio=false,profile?:GlassProfile,role?:PaneRole){
  const material=new THREE.MeshPhysicalMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,metalness:0});
  material.userData.artworkStudio=studio;
  material.userData.glassProfile=profile;
  material.userData.paneRole=role;
  if(profile)addHomePaneReflections(material,kind);
  setGlass(material,kind,dark);return material;
}

export function strokeMaterial(front=true){
  const material=new LineMaterial({color:front?0x3284e8:0x619bc5,linewidth:front?1.4:.8,transparent:true,opacity:front?.8:.3,depthWrite:false,worldUnits:false,toneMapped:false});
  material.userData.cssWidth=front?1.4:.8;
  return material;
}

export function stroke(points:THREE.Vector3[],material:LineMaterial){
  const geometry=new LineSegmentsGeometry();geometry.setPositions(points.flatMap(p=>p.toArray()));
  const line=new LineSegments2(geometry,material);
  const viewport=new THREE.Vector4();
  line.onBeforeRender=function(renderer){
    // Use the actual target viewport for both the canvas and background render passes.
    renderer.getCurrentViewport(viewport);material.resolution.set(viewport.z,viewport.w);
    material.linewidth=material.userData.cssWidth*renderer.getPixelRatio();
  };
  line.computeLineDistances();return line;
}

export function nodeHaloTexture(){
  const canvas=document.createElement("canvas");canvas.width=canvas.height=64;
  const context=canvas.getContext("2d")!;
  const gradient=context.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,"rgba(72,207,234,.5)");gradient.addColorStop(.25,"rgba(72,207,234,.2)");gradient.addColorStop(1,"rgba(72,207,234,0)");
  context.fillStyle=gradient;context.fillRect(0,0,64,64);return new THREE.CanvasTexture(canvas);
}

/** A view-dependent rim, cheap enough to run on glass without a bloom pass. */
export function addFresnelRim(material:THREE.MeshPhysicalMaterial,strength=.4){
  const previous=material.onBeforeCompile,priorKey=material.customProgramCacheKey?.bind(material);
  material.userData.fresnelRim=strength;
  material.onBeforeCompile=(shader,renderer)=>{previous?.call(material,shader,renderer);
    shader.uniforms.uFresnelRim={value:strength};
    shader.fragmentShader=shader.fragmentShader.replace("#include <opaque_fragment>",`float fresnelRim=pow(1.-abs(dot(normalize(normal),normalize(vViewPosition))),2.4);outgoingLight+=vec3(.62,.86,1.)*fresnelRim*uFresnelRim;\n#include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=>(priorKey?priorKey():"")+`-fresnel-${strength}`;
}
