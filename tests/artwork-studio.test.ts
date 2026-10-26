import {describe,expect,it,vi} from "vitest";
import * as THREE from "three";
import {createFloorEcho} from "../components/brand/artwork-studio";

describe("Artwork floor reflection",()=>{
 it("reflects nested moving geometry across the floor without changing the source",()=>{
  const root=new THREE.Group();root.position.set(2,3,0);
  const material=new THREE.MeshStandardMaterial({color:0x246bd4});
  const geometry=new THREE.BoxGeometry(1,1,1),source=new THREE.Mesh(geometry,material);source.position.y=.5;root.add(source);
  const echo=createFloorEcho([root],1);echo.update(1);
  const image=echo.group.children[0] as THREE.Mesh;
  expect(new THREE.Vector3().setFromMatrixPosition(image.matrix).y).toBeCloseTo(2-3.5-.008);
  expect(source.position.y).toBe(.5);expect(image.geometry).toBe(geometry);
  root.position.y=4;echo.update(.5);
  expect(new THREE.Vector3().setFromMatrixPosition(image.matrix).y).toBeCloseTo(2-4.5-.008);
  root.visible=false;echo.update(1);expect(image.visible).toBe(false);
  const dispose=vi.spyOn(geometry,"dispose");echo.dispose();expect(dispose).not.toHaveBeenCalled();
  geometry.dispose();material.dispose();
 });
 it("keeps reflection colour current while leaving source materials owned by the scene",()=>{
  const source=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({color:0xffffff}));
  const echo=createFloorEcho([source],0);source.material.color.setHex(0x102030);echo.update(1);
  const image=echo.group.children[0] as THREE.Mesh<THREE.BufferGeometry,THREE.ShaderMaterial>;
  expect(image.material.uniforms.uColor.value.equals(source.material.color)).toBe(true);
  const dispose=vi.spyOn(source.material,"dispose");echo.dispose();expect(dispose).not.toHaveBeenCalled();source.material.dispose();source.geometry.dispose();
 });
});
