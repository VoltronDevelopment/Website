import {afterEach,describe,expect,it,vi} from 'vitest';
import * as THREE from 'three';
import {updateLineDistance} from '../components/performance/line-distance';
import {batchStaticMeshes} from '../components/performance/static-batching';
import {createRenderQuality} from '../components/performance/scene-policy';

afterEach(()=>vi.unstubAllGlobals());
describe('persistent GPU resources',()=>{
  it('updates dashed line distances without replacing an uploaded attribute',()=>{
    const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(1,0,0)]);
    updateLineDistance(geometry);const attribute=geometry.getAttribute('lineDistance');
    for(let i=1;i<=100;i++){geometry.getAttribute('position').setXYZ(1,i,0,0);updateLineDistance(geometry);expect(geometry.getAttribute('lineDistance')).toBe(attribute);}
    expect(attribute.getX(1)).toBe(100);geometry.dispose();
  });
  it('batches static opaque meshes and preserves moving objects and bounds',()=>{
    const root=new THREE.Group(),geometry=new THREE.BoxGeometry(),material=new THREE.MeshStandardMaterial();
    for(const x of [-5,5]){const mesh=new THREE.Mesh(geometry,material);mesh.position.x=x;root.add(mesh);}
    const moving=new THREE.Mesh(geometry,material);moving.position.y=10;root.add(moving);
    const dispose=batchStaticMeshes(root,new Set([moving]));
    const instance=root.children.find(x=>x instanceof THREE.InstancedMesh) as THREE.InstancedMesh;
    expect(instance.count).toBe(2);expect(root.children).toContain(moving);
    expect(instance.boundingBox!.min.x).toBe(-5.5);expect(instance.boundingBox!.max.x).toBe(5.5);
    dispose();expect(root.children).toEqual([moving]);geometry.dispose();material.dispose();
  });
});
describe('adaptive rendering',()=>{
  it('reduces density only after sustained slow frames and ignores hidden intervals',()=>{
    vi.stubGlobal('devicePixelRatio',3);vi.stubGlobal('document',{hidden:false});
    const canvas={dataset:{}} as HTMLCanvasElement,q=createRenderQuality(canvas);
    for(let i=1;i<=80;i++)q.sample(i*34);expect(q.ratio).toBe(1.5);
    for(let i=81;i<=95;i++)q.sample(i*34);expect(q.ratio).toBe(1.25);
    q.reset();q.sample(100000);expect(q.ratio).toBe(1.25);
  });
});
