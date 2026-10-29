import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {optimizedAsset} from '@/lib/optimized-assets';
import {createPartnerActor} from './partner-rig-motion';
import {createPartnerBrief} from './partner-brief';
import {collaborationState} from './collaboration-timeline';
import {partnerPanelInverse} from './partner-stage-space';

export async function createPartnerPresentation(scene:T.Scene,signal:AbortSignal){
 const loader=new GLTFLoader(),result=await Promise.allSettled([loader.loadAsync('/stories/partner-carla.gltf'),loader.loadAsync('/stories/partner-eric.gltf'),new T.TextureLoader().loadAsync(optimizedAsset('/Brand Assets/voltron brand page/voltron-hero-assets/voltron-mark-original.png'))] as const);
 const [carla,eric,mark]=result;
 if(signal.aborted||carla.status==='rejected'||eric.status==='rejected'||mark.status==='rejected'){
  result.forEach(r=>{if(r.status!=='fulfilled')return;if(r.value instanceof T.Texture)r.value.dispose();else r.value.scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});});throw Error('Presentation artwork unavailable');
 }
 const loaded=[carla.value,eric.value],logo=mark.value as T.Texture;
 const bodyMaterials=[0xc7dae5,0x34546b].map(color=>new T.MeshPhysicalMaterial({color,metalness:.17,roughness:.48,clearcoat:.14,clearcoatRoughness:.45,envMapIntensity:.60}));
 const actors=loaded.map((g,i)=>createPartnerActor(g.scene,i,bodyMaterials[i])),brief=createPartnerBrief(scene,logo,matchMedia('(max-width:767px)').matches);actors.forEach(a=>scene.add(a.root));
 const borrowed=new Set<T.Material>();loaded.forEach(g=>g.scene.traverse(o=>{if(o instanceof T.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>borrowed.add(m));}));borrowed.forEach(m=>m.dispose());
 const diagnostics=new URLSearchParams(location.search).has('scene-capture');
 function update(time:number,dark:boolean,ratio:number){const state=collaborationState('partner',time);bodyMaterials.forEach((m,i)=>m.color.setHex(i?(dark?0x34566e:0x34546b):(dark?0xa2c1d3:0xc7dae5)));actors.forEach((a,i)=>a.pose(state.walks[i],state.gesture,time,state.stamp,diagnostics));brief.update(state,dark,ratio);}
 update(0,false,1);
 return {figures:actors.map(a=>a.root),panel:brief.group,update,prepare:brief.prepare,get handPanelGaps(){return actors.map(a=>a.activePalm.getWorldPosition(new T.Vector3()).applyMatrix4(partnerPanelInverse).z);},get footTargets(){return actors.flatMap(a=>a.footTargets.map(v=>v.toArray()));},dispose(){const geometries=new Set<T.BufferGeometry>();loaded.forEach(g=>g.scene.traverse(o=>{if(o instanceof T.Mesh)geometries.add(o.geometry);}));geometries.forEach(g=>g.dispose());bodyMaterials.forEach(m=>m.dispose());brief.dispose();}};
}
