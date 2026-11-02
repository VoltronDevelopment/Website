import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {orientHeadGeometry} from '../brand/intelligence-hologram';
import {factoryKit} from '../network/factory-kit';
import {glassFace,setGlass,type GlassFace} from '../home/lattice-materials';
import {principleCapabilities} from './capabilities';
import {principleCubePose,principleReveal} from './principles-motion';
type Own=<R extends {dispose:()=>void}>(r:R)=>R;
export async function principlesArtwork(root:T.Group,kit:ReturnType<typeof factoryKit>,own:Own){
 const gltf=await new GLTFLoader().loadAsync('/human_head/scene.gltf');gltf.scene.updateMatrixWorld(true);let source:T.BufferGeometry|undefined;gltf.scene.traverse(o=>{if(o instanceof T.Mesh){if(!source)source=o.geometry.clone().applyMatrix4(o.matrixWorld);o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});if(!source)throw new Error('Head geometry missing');
 const headGeo=own(orientHeadGeometry(source));source.dispose();headGeo.computeBoundingBox();const bounds=headGeo.boundingBox!,height=bounds.max.y-bounds.min.y;headGeo.scale(2.8/height,2.8/height,2.8/height);headGeo.computeBoundingBox();headGeo.translate(0,-headGeo.boundingBox!.min.y,0);
 const crown=2.25,clip=new T.Plane(new T.Vector3(0,-1,0),crown),surface=own(kit.pearl.clone());surface.side=T.DoubleSide;surface.clippingPlanes=[clip];const head=new T.Mesh(headGeo,surface);root.add(head);


 const cubes:T.Group[]=[],details:T.Group[]=[],faces:T.MeshPhysicalMaterial[][]=[],edgeMats:T.LineBasicMaterial[]=[];
 for(let i=0;i<8;i++){const g=new T.Group();root.add(g);const roles:GlassFace[]=['side','side','top','bottom','front','rear'],materials=roles.map(role=>own(glassFace(role,false,true,'display')));faces.push(materials);const geometry=own(new T.BoxGeometry(.55,.55,.55));g.add(new T.Mesh(geometry,materials));const edgeMat=own(new T.LineBasicMaterial({color:0x5683a0,transparent:true,opacity:.4}));g.add(new T.LineSegments(own(new T.EdgesGeometry(geometry)),edgeMat));edgeMats.push(edgeMat);cubes.push(g);const d=new T.Group();g.add(d);details.push(d);}
 // Every detail stays within the cube's clear interior.
 for(const size of [.38,.23,.1])details[0].add(new T.LineSegments(own(new T.EdgesGeometry(own(new T.BoxGeometry(size,size,size)))),own(new T.LineBasicMaterial({color:0x459ccc}))));
 const blocks:T.Mesh[]=[];for(let i=0;i<4;i++)blocks.push(kit.box(details[3],[.1,.1,.1],[(i%2-.5)*.15,(Math.floor(i/2)-.5)*.15,0],kit.active));
 kit.line(details[4],[[-.19,0,.12],[-.05,0,.12]]);kit.line(details[4],[[.06,0,.12],[.19,0,.12]]);
 const alternatives:T.Mesh[]=[];for(let i=0;i<3;i++)alternatives.push(kit.box(details[5],[.08,.08,.08],[(i-1)*.14,0,.1],kit.active));
 const exchange=kit.box(root,[.06,.06,.06],[0,0,0],kit.active);
 return {head,cubes,update(time:number,phase:number,selected:number,dark:boolean,capability:number){surface.color.copy(kit.pearl.color);clip.constant=-.05+principleReveal(time)*2.3;head.scale.setScalar(1);
 cubes.forEach((g,i)=>{g.visible=time>=2.5;g.position.fromArray(principleCubePose(i,time));const turn=Math.max(0,Math.min(1,(time-6)/3.5));g.rotation.set(.12*turn,.35*turn,0);const active=time>=9.5&&(i===capability||principleCapabilities[selected].includes(i));faces[i].forEach(mat=>{setGlass(mat,mat.userData.faceKind,dark);mat.opacity=Math.min(.62,mat.opacity*1.5);if(i%2===0&&mat.userData.faceKind!=='front'){mat.color.multiplyScalar(dark?.75:.68);mat.opacity*=1.3;}});edgeMats[i].color.setHex(dark?(active?0x86d9ff:0x487da2):(active?0x166dba:0x5683a0));edgeMats[i].opacity=active?.9:.38;details[i].visible=active;});
 const p=Math.min(1,phase/2.8);details[0].rotation.y=p*Math.PI/2;blocks.forEach((c,i)=>c.position.z=(1-p)*(.1+i*.025));alternatives.forEach((c,i)=>{c.position.y=Math.sin(p*Math.PI)*(i-1)*.12;c.position.z=.1+Math.sin(p*Math.PI)*.05;});exchange.visible=time>=9.5&&selected===4&&phase<2.8;exchange.position.lerpVectors(cubes[6].position,cubes[7].position,p);root.userData.phase=time<2.5?'head-forming':time<4.5?'emerging':time<6?'dividing':time<9.5?'arranging':'principles';}};
}
