import {yieldToBrowser} from "../performance/scene-policy";
import * as THREE from "three";
import {createArtworkEnvironment} from "../brand/artwork-studio";
import type {SharedHeroResources} from "../home/hero-renderer";

export async function createLatticeResources(canvas:HTMLCanvasElement):Promise<SharedHeroResources|undefined>{
  let renderer:THREE.WebGLRenderer|undefined;
  let environment:THREE.WebGLRenderTarget|undefined;
  try{
    if(new URLSearchParams(location.search).get("renderer")==="static")return undefined;
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
    await yieldToBrowser();
    environment=createArtworkEnvironment(renderer);
    await yieldToBrowser();
    const texture=await new THREE.TextureLoader().loadAsync("/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png");
    texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    const activeRenderer=renderer,activeEnvironment=environment;
    return {renderer,environment:environment.texture,texture,dispose(){texture.dispose();activeEnvironment.dispose();activeRenderer.dispose();}};
  }catch{environment?.dispose();renderer?.dispose();return undefined;}
}
