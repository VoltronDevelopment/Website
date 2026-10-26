import {it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {createHomeChamber} from '../components/home/home-chamber';
it('pulses the three-dimensional body while keeping the isometric identity face steady',()=>{
 vi.stubGlobal('devicePixelRatio',1);const resources:{dispose():void}[]=[],track=<T extends {dispose():void}>(v:T)=>{resources.push(v);return v;};
 const group=new THREE.Group(),body=new THREE.MeshPhysicalMaterial();group.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),body));
 const camera=new THREE.PerspectiveCamera();camera.position.set(6,5.25,8);camera.lookAt(0,1,0);
 const chamber=createHomeChamber(group,camera,track),face=group.getObjectByName('steady-identity-face') as THREE.Mesh<THREE.ShapeGeometry,THREE.MeshPhysicalMaterial>;
 chamber.update(9,1,true,0,1);const resting=body.emissiveIntensity,opacity=face.material.opacity,colour=face.material.color.getHex();
 chamber.update(10,1,true,1,1);expect(body.emissiveIntensity).toBeGreaterThan(resting);expect(face.material.opacity).toBe(opacity);expect(face.material.color.getHex()).toBe(colour);expect(face.material.emissiveIntensity).toBe(1);expect(face.material.emissive.getHex()).toBe(0);
 expect(face.quaternion.equals(new THREE.Quaternion())).toBe(true);expect(face.quaternion.equals(camera.quaternion)).toBe(false);
 resources.forEach(r=>r.dispose());body.dispose();vi.unstubAllGlobals();
});
