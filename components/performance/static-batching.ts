import * as THREE from 'three';

/** Batch only explicitly static, opaque meshes. Picking proxies and moving groups stay intact. */
export function batchStaticMeshes(root:THREE.Object3D, excluded:ReadonlySet<THREE.Object3D>) {
  root.updateWorldMatrix(true,true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map<string,THREE.Mesh[]>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh || Array.isArray(object.material) || object.material.transparent || !object.visible) return;
    for(let parent:THREE.Object3D|null=object;parent&&parent!==root;parent=parent.parent) if(excluded.has(parent)||!parent.visible)return;
    const key = `${object.geometry.uuid}|${object.material.uuid}|${object.castShadow}|${object.receiveShadow}`;
    const group=groups.get(key)??[];group.push(object);groups.set(key,group);
  });
  const batches:THREE.InstancedMesh[]=[];
  for(const meshes of groups.values()) {
    if(meshes.length<2)continue;
    const first=meshes[0],batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);
    batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
    meshes.forEach((mesh,i)=>batch.setMatrixAt(i,new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld)));
    batch.computeBoundingBox();batch.computeBoundingSphere();
    meshes.forEach(mesh=>mesh.removeFromParent());root.add(batch);batches.push(batch);
  }
  return ()=>batches.forEach(batch=>{batch.removeFromParent();batch.dispose();});
}
