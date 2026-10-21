import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export type GlassFace="top"|"side"|"front"|"rear"|"bottom"|"internal";
const light={top:0xf8fcff,side:0x91c7ec,front:0xc7e8fa,rear:0xc5dcee,bottom:0x9abfdc,internal:0xc4e0f4};
const night={top:0x6596bd,side:0x23567d,front:0x397da8,rear:0x16364e,bottom:0x123044,internal:0x193e58};
const lightOpacity={top:.3,side:.3,front:.14,rear:.045,bottom:.09,internal:.02};
const darkOpacity={top:.24,side:.24,front:.13,rear:.04,bottom:.075,internal:.02};

export function setGlass(material:THREE.MeshPhysicalMaterial,kind:GlassFace,dark:boolean){
  material.color.setHex((dark?night:light)[kind]);
  material.opacity=(dark?darkOpacity:lightOpacity)[kind];
  material.roughness=kind==="top"?.23:.34;
  material.clearcoat=dark?.5:.65;
  material.clearcoatRoughness=.2;
  material.envMapIntensity=kind==="top"?.55:dark?.32:.38;
  material.emissive.setHex(0x246bd4);material.emissiveIntensity=.012;
  material.userData.restOpacity=material.opacity;
}

export function glassFace(kind:GlassFace,dark=false){
  const material=new THREE.MeshPhysicalMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,metalness:0});
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
