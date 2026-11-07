import * as THREE from "three";
import {RectAreaLightUniformsLib} from "three/addons/lights/RectAreaLightUniformsLib.js";

let areaLightsReady=false;
/** Finite softboxes produce a highlight gradient across a flat glass pane. */
export function addArtworkSoftboxes(scene:THREE.Scene,target=new THREE.Vector3()){
  if(!areaLightsReady){RectAreaLightUniformsLib.init();areaLightsReady=true;}
  const key=new THREE.RectAreaLight(0xf5faff,5,4,3);key.position.copy(target).add(new THREE.Vector3(-2.5,4,4));key.lookAt(target);
  const strip=new THREE.RectAreaLight(0xc5e5ff,3,1,4);strip.position.copy(target).add(new THREE.Vector3(4,1.5,2));strip.lookAt(target);
  scene.add(key,strip);
}

/** Three r186 caches the DFG and area-light lookup textures at module scope.
 * Their dispose listeners close over GL contexts. Release uploads before renderer
 * teardown; another live renderer can upload the same immutable pixels again. */
export function releaseStudioLookups(renderer:THREE.WebGLRenderer,scene:THREE.Scene){
  let dfg:THREE.Texture|undefined;
  scene.traverse(object=>{
    if(dfg||!(object instanceof THREE.Mesh))return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials){
      const texture=(renderer.properties.get(material) as {uniforms?:{dfgLUT?:{value:unknown}}}).uniforms?.dfgLUT?.value;
      if(texture instanceof THREE.Texture&&texture.name==='DFG_LUT'){dfg=texture;break;}
    }
  });
  dfg?.dispose();
  const library=THREE.UniformsLib as unknown as Record<string,THREE.Texture|undefined>;
  for(const key of ['LTC_FLOAT_1','LTC_FLOAT_2','LTC_HALF_1','LTC_HALF_2'])library[key]?.dispose();
}

/** A small, locally authored studio: reflections have shape even without bloom. */
export function createArtworkEnvironment(renderer:THREE.WebGLRenderer){
  const studio=new THREE.Scene();studio.background=new THREE.Color(0x60768d);
  const geometry=new THREE.PlaneGeometry(1,1),materials:THREE.MeshBasicMaterial[]=[];
  const card=(color:number,intensity:number,size:number[],position:number[])=>{
    const material=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide});materials.push(material);
    const panel=new THREE.Mesh(geometry,material);panel.scale.set(size[0],size[1],1);panel.position.fromArray(position);panel.lookAt(0,0,0);studio.add(panel);
  };
  card(0xf3f8ff,4.5,[7,4],[-4,7,3]);
  card(0xffffff,3,[1.2,7],[5,2,4]);
  card(0xe8f2ff,1.8,[6,4],[0,3,7]);
  card(0x98c9ed,1.5,[5,2],[1,3,-6]);
  card(0x040b16,1,[4,7],[-6,0,-2]);
  card(0x101c2a,1,[6,4],[0,-4,2]);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const target=pmrem.fromScene(studio,.025,.1,30);
  pmrem.dispose();geometry.dispose();materials.forEach(material=>material.dispose());
  return target;
}

// All scenes use the same studio. Share the pixels while each renderer owns its GPU texture.
let studioPixels:{width:number;height:number;pixels:Uint16Array}|undefined;
let preparingStudio:Promise<void>|undefined;
export function prepareArtworkEnvironment(){
  if(!preparingStudio)preparingStudio=(async()=>{
    const response=await fetch('/studio-lighting.bin.gz');
    if(!response.ok)throw new Error('Studio lighting unavailable');
    const blob=await response.blob();
    const signature=new Uint8Array(await blob.slice(0,2).arrayBuffer());
    const buffer=signature[0]===31&&signature[1]===139
      ?await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
      :await blob.arrayBuffer();
    const [width,height]=new Uint32Array(buffer,0,2);
    if(width!==768||height!==1024||buffer.byteLength!==8+width*height*8)throw new Error('Invalid studio lighting');
    studioPixels={width,height,pixels:new Uint16Array(buffer,8)};
  })().catch(()=>{preparingStudio=undefined;});
  return preparingStudio;
}
export function sceneEnvironment(renderer:THREE.WebGLRenderer){
  if(!studioPixels)return createArtworkEnvironment(renderer);
  const {pixels,width,height}=studioPixels;
  const texture=new THREE.DataTexture(pixels,width,height,THREE.RGBAFormat,THREE.HalfFloatType);
  texture.mapping=THREE.CubeUVReflectionMapping;
  texture.minFilter=texture.magFilter=THREE.LinearFilter;
  texture.colorSpace=THREE.LinearSRGBColorSpace;
  texture.needsUpdate=true;
  return {texture,dispose:()=>texture.dispose()};
}

/** Geometric edge thickness, separate from the thin graphic connection strokes. */
export function edgePrism(from:THREE.Vector3,to:THREE.Vector3,radius=.008){
  const direction=to.clone().sub(from),geometry=new THREE.CylinderGeometry(radius,radius,direction.length(),6,1);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()));
  geometry.translate(...from.clone().lerp(to,.5).toArray());
  return geometry;
}

/** A bounded, faded virtual image below the floor; no extra scene render pass. */
export function createFloorEcho(roots:THREE.Object3D[],floorY:number){
  const group=new THREE.Group(),records:{source:THREE.Mesh;image:THREE.Mesh;material:THREE.ShaderMaterial}[]=[];
  const mirror=new THREE.Matrix4().makeScale(1,-1,1);mirror.setPosition(0,2*floorY-.008,0);
  roots.forEach(root=>root.traverse(object=>{
    const source=object as THREE.Mesh;
    if(!source.isMesh||!source.geometry?.getAttribute("position")||(source as THREE.Mesh&{isLine2?:boolean;isLineSegments2?:boolean}).isLine2||(source as THREE.Mesh&{isLineSegments2?:boolean}).isLineSegments2||Array.isArray(source.material))return;
    const original=source.material as THREE.MeshStandardMaterial;
    if(!original.color)return;
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
      uniforms:{uColor:{value:original.color.clone()},uStrength:{value:0},uFloor:{value:floorY}},
      vertexShader:`varying float vHeight;uniform float uFloor;void main(){vec4 world=modelMatrix*vec4(position,1.);vHeight=max(0.,uFloor-world.y);gl_Position=projectionMatrix*viewMatrix*world;}`,
      fragmentShader:`uniform vec3 uColor;uniform float uStrength;varying float vHeight;void main(){float fade=exp(-vHeight*3.2);gl_FragColor=vec4(uColor,uStrength*fade);#include <colorspace_fragment>}`.replace(";#include",";\n#include")});
    const image=new THREE.Mesh(source.geometry,material);image.matrixAutoUpdate=false;image.renderOrder=-3;group.add(image);records.push({source,image,material});
  }));
  return {group,update(strength:number){
    roots.forEach(root=>root.updateWorldMatrix(true,true));
    records.forEach(({source,image,material})=>{
      let visible=source.visible;for(let parent=source.parent;parent;parent=parent.parent)visible=visible&&parent.visible;
      image.visible=visible;image.matrix.multiplyMatrices(mirror,source.matrixWorld);
      const original=source.material as THREE.MeshStandardMaterial;
      material.uniforms.uColor.value.copy(original.color);
      material.uniforms.uStrength.value=strength*(original.transparent?Math.min(.32,original.opacity)*.35:.14);
    });
  },dispose(){records.forEach(record=>record.material.dispose());}};
}
