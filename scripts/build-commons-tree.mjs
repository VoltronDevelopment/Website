import fs from 'node:fs';
import path from 'node:path';
import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';
import sharp from 'sharp';
const source='public/old_tree',out='public/sculptures/commons-tree';fs.mkdirSync(out,{recursive:true});
const json=JSON.parse(fs.readFileSync(source+'/scene.gltf','utf8')),bin=fs.readFileSync(source+'/scene.bin'),parts=[[],[],[]];
function read(index){const a=json.accessors[index],v=json.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],bytes={5126:4,5125:4,5123:2,5121:1}[a.componentType],result=[];for(let i=0;i<a.count;i++)for(let j=0;j<n;j++){const at=(v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||n*bytes)+j*bytes;result.push(a.componentType===5126?bin.readFloatLE(at):a.componentType===5125?bin.readUInt32LE(at):a.componentType===5123?bin.readUInt16LE(at):bin[at]);}return result;}
function node(index,parent){const n=json.nodes[index],local=new T.Matrix4();if(n.matrix)local.fromArray(n.matrix);else local.compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1])));const matrix=parent.clone().multiply(local);if(n.mesh!==undefined)for(const p of json.meshes[n.mesh].primitives){const g=new T.BufferGeometry();for(const [key,name,size]of [['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]])g.setAttribute(name,new T.Float32BufferAttribute(read(p.attributes[key]),size));g.setIndex(read(p.indices));g.applyMatrix4(matrix);parts[p.material].push(g);}for(const child of n.children||[])node(child,matrix);}
for(const i of json.scenes[json.scene||0].nodes)node(i,new T.Matrix4());
const bounds=new T.Box3();for(const group of parts)for(const g of group){g.computeBoundingBox();bounds.union(g.boundingBox);}const size=bounds.getSize(new T.Vector3()),centre=bounds.getCenter(new T.Vector3()),scale=3.4/size.y;
let seed=846293;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const points=[],manifest={version:1,height:3.4,width:size.x*scale,depth:size.z*scale,parts:[],credit:{title:'Old Tree',author:'gelmi.com.br',url:'https://sketchfab.com/3d-models/old-tree-5793911821d04f73926ac4ab1d46727a',license:'CC BY 4.0'}};
for(let k=0;k<parts.length;k++){
 const g=mergeVertices(mergeGeometries(parts[k]),.00001);g.translate(-centre.x,-bounds.min.y,-centre.z);g.scale(scale,scale,scale);const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,vertices=[];for(let i=0;i<p.count;i++)vertices.push(p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i),uv.getX(i),uv.getY(i));const header=new Uint32Array([p.count,g.index.count]);fs.writeFileSync(`${out}/${k}.bin`,Buffer.concat([Buffer.from(header.buffer),Buffer.from(new Float32Array(vertices).buffer),Buffer.from(new Uint32Array(g.index.array).buffer)]));
 const texture=json.images[json.textures[json.materials[k].extensions.KHR_materials_pbrSpecularGlossiness.diffuseTexture.index].source].uri,texturePath=path.join(source,texture);const alpha=await sharp(texturePath).ensureAlpha().extractChannel(3).resize(512,512).raw().toBuffer();
 await sharp(texturePath).resize({width:k===0?1024:512,withoutEnlargement:true}).greyscale().modulate({brightness:1.25}).webp({quality:88,alphaQuality:100}).toFile(`${out}/${k}.webp`);
 const normalImage=json.images[json.textures[json.materials[k].normalTexture.index].source].uri;await sharp(path.join(source,normalImage)).resize({width:512,withoutEnlargement:true}).removeAlpha().webp({quality:92}).toFile(`${out}/${k}-normal.webp`);
 const sampler=new MeshSurfaceSampler(new T.Mesh(g)).setRandomGenerator(random).build(),position=new T.Vector3(),normal=new T.Vector3(),color=new T.Color(),coord=new T.Vector2(),count=k===0?8000:k===1?4000:12000;let accepted=0;
 for(let tries=0;accepted<count&&tries<count*50;tries++){sampler.sample(position,normal,color,coord);const x=Math.min(511,Math.floor(((coord.x%1+1)%1)*512)),y=Math.min(511,Math.floor(((coord.y%1+1)%1)*512));if(k>0&&alpha[y*512+x]<180)continue;points.push(...position.toArray(),...normal.normalize().toArray(),k,random());accepted++;}
 if(accepted<count)throw Error('Insufficient opaque tree samples');manifest.parts.push({file:`${k}.bin`,texture:`${k}.webp`,normal:`${k}-normal.webp`,vertices:p.count,triangles:g.index.count/3,particles:count,cutoff:k===0?0:json.materials[k].alphaCutoff});g.dispose();
}
fs.writeFileSync(out+'/points.bin',Buffer.from(new Float32Array(points).buffer));fs.writeFileSync(out+'/manifest.json',JSON.stringify(manifest,null,2));console.log(manifest);
