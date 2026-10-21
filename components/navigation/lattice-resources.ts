import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type {SharedHeroResources} from "../home/hero-renderer";

export async function createLatticeResources(canvas:HTMLCanvasElement):Promise<SharedHeroResources|undefined>{
  let renderer:THREE.WebGLRenderer|undefined;
  let environment:THREE.WebGLRenderTarget|undefined;
  try{
    if(new URLSearchParams(location.search).get("renderer")==="static")return undefined;
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
    const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
    environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
    const texture=await new THREE.TextureLoader().loadAsync("/Brand%20Assets/voltron%20brand%20page/voltron-hero-assets/voltron-mark-original.png");
    texture.colorSpace=THREE.SRGBColorSpace;
    const activeRenderer=renderer,activeEnvironment=environment;
    return {renderer,environment:environment.texture,texture,dispose(){texture.dispose();activeEnvironment.dispose();activeRenderer.dispose();}};
  }catch{environment?.dispose();renderer?.dispose();return undefined;}
}
