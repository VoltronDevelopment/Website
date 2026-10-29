import fs from 'node:fs';
const out='public/stories/',models=[['carla','public/carla_rigged_001_-_rigged_3d_business_women/'],['eric','public/eric_rigged_001_-_rigged_3d_business_man/']];
const sizes={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},bytes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
for(const[name,dir]of models){
 const g=JSON.parse(fs.readFileSync(dir+'scene.gltf','utf8')),source=fs.readFileSync(dir+'scene.bin');
 if(g.skins?.length!==1||g.skins[0].joints.length!==89)throw Error('Unexpected '+name+' rig');
 const used=new Set();for(const mesh of g.meshes)for(const p of mesh.primitives){delete p.attributes.TEXCOORD_0;delete p.attributes.TANGENT;Object.values(p.attributes).forEach(i=>used.add(i));if(p.indices!==undefined)used.add(p.indices);}g.skins.forEach(s=>used.add(s.inverseBindMatrices));
 const ids=[...used].sort((a,b)=>a-b),map=new Map(ids.map((id,i)=>[id,i])),chunks=[],views=[],accessors=[];let offset=0;
 for(const id of ids){const a=g.accessors[id],v=g.bufferViews[a.bufferView];if(a.sparse)throw Error('Sparse partner accessor');const unit=sizes[a.type]*bytes[a.componentType],data=Buffer.alloc(a.count*unit);for(let row=0;row<a.count;row++){const start=(v.byteOffset||0)+(a.byteOffset||0)+row*(v.byteStride||unit);source.copy(data,row*unit,start,start+unit);}const pad=(4-offset%4)%4;if(pad){chunks.push(Buffer.alloc(pad));offset+=pad;}views.push({buffer:0,byteOffset:offset,byteLength:data.length});accessors.push({...a,bufferView:views.length-1,byteOffset:0});chunks.push(data);offset+=data.length;}
 for(const mesh of g.meshes)for(const p of mesh.primitives){for(const key of Object.keys(p.attributes))p.attributes[key]=map.get(p.attributes[key]);if(p.indices!==undefined)p.indices=map.get(p.indices);p.material=0;}
 g.skins.forEach(s=>s.inverseBindMatrices=map.get(s.inverseBindMatrices));g.accessors=accessors;g.bufferViews=views;g.buffers=[{uri:`partner-${name}.bin`,byteLength:offset}];g.materials=[{name:'Voltron satin finish',pbrMetallicRoughness:{baseColorFactor:[.7,.8,.9,1],metallicFactor:.17,roughnessFactor:.48}}];delete g.images;delete g.textures;delete g.samplers;delete g.animations;
 g.asset.copyright=`${name==='eric'?'Eric':'Carla'} Rigged 001, Renderpeople, CC BY 4.0. Adapted geometry packaging, Voltron materials and authored motion.`;
 fs.writeFileSync(`${out}partner-${name}.gltf`,JSON.stringify(g)+'\n');fs.writeFileSync(`${out}partner-${name}.bin`,Buffer.concat(chunks));fs.copyFileSync(dir+'license.txt',`${out}partner-${name}-license.txt`);console.log(name,offset,'bytes; 89 joints; no texture dependency');
}
