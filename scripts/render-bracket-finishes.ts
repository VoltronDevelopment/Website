import * as T from 'three';
import {bracketStudyGeometry} from '../components/network/bracket-study';
import {addArtworkSoftboxes,prepareArtworkEnvironment,sceneEnvironment} from '../components/brand/artwork-studio';

// Bake the actual hero casting. Switching finish on the page only swaps a still.
export async function bracketFinish(canvas:HTMLCanvasElement, index:number, dark:boolean) {
  await prepareArtworkEnvironment();
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(1120,580,false);
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(),environment=sceneEnvironment(renderer);
  scene.environment=environment.texture;
  addArtworkSoftboxes(scene);
  const key=new T.DirectionalLight(0xf5faff, dark?2.4:2);
  key.position.set(-3,8,5);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.012;scene.add(key);
  const finishes=[
    {color:0x68777f,roughness:.87,metalness:.38,clearcoat:0},
    {color:0x3d4b56,roughness:.39,metalness:.23,clearcoat:.30},
    {color:0x536875,roughness:.48,metalness:.14,clearcoat:.16},
  ];
  const material=new T.MeshPhysicalMaterial(finishes[index]);
  const {baseGeo,uprightGeo}=bracketStudyGeometry();
  for(const geometry of [baseGeo,uprightGeo]){
    const piece=new T.Mesh(geometry,material);piece.castShadow=piece.receiveShadow=true;scene.add(piece);
  }
  const ground=new T.Mesh(new T.PlaneGeometry(20,20),new T.ShadowMaterial({opacity:dark?.42:.17}));
  ground.position.y=-.061;ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const h=1.65,w=h*1120/580,camera=new T.OrthographicCamera(-w,w,h,-h,.1,40);
  camera.position.set(4,3.3,7.8);camera.lookAt(0,1.05,0);
  renderer.render(scene,camera);
  const image=canvas.toDataURL().split(',')[1];
  baseGeo.dispose();uprightGeo.dispose();material.dispose();ground.geometry.dispose();ground.material.dispose();
  key.shadow.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();
  return image;
}
