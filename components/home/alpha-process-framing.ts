import * as THREE from "three";

/** Bounds in the fixed camera's X/Y axes, independent of its current frustum. */
export function alphaViewBounds(objects: readonly THREE.Object3D[], camera: THREE.OrthographicCamera) {
  camera.updateMatrixWorld();
  const bounds = new THREE.Box2();
  const point = new THREE.Vector3();
  const transform = new THREE.Matrix4();
  for (const object of objects) {
    object.updateWorldMatrix(true, true);
    object.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      if(child instanceof THREE.InstancedMesh)child.computeBoundingBox();
      const box = child instanceof THREE.InstancedMesh ? child.boundingBox : geometry.boundingBox;
      if (!box) return;
      transform.multiplyMatrices(camera.matrixWorldInverse, child.matrixWorld);
      for (let corner = 0; corner < 8; corner++) {
        point.set(corner & 1 ? box.max.x : box.min.x, corner & 2 ? box.max.y : box.min.y, corner & 4 ? box.max.z : box.min.z).applyMatrix4(transform);
        bounds.expandByPoint(new THREE.Vector2(point.x, point.y));
      }
    });
  }
  return bounds;
}

/** Fit once per resize to the whole motion envelope; never follow the moving trolley. */
export function fitAlphaCamera(camera: THREE.OrthographicCamera, bounds: THREE.Box2, width: number, height: number) {
  const padding = Math.max(12, Math.min(28, width * .025));
  const size = bounds.getSize(new THREE.Vector2());
  const centre = bounds.getCenter(new THREE.Vector2());
  const unitsPerPixel = Math.max(size.x / Math.max(1, width - padding * 2), size.y / Math.max(1, height - padding * 2));
  camera.left = centre.x - width * unitsPerPixel / 2;
  camera.right = centre.x + width * unitsPerPixel / 2;
  camera.top = centre.y + height * unitsPerPixel / 2;
  camera.bottom = centre.y - height * unitsPerPixel / 2;
  camera.updateProjectionMatrix();
  return padding;
}

export function alphaStationPosition(camera: THREE.OrthographicCamera, x: number) {
  return (new THREE.Vector3(x, .3, 0).project(camera).x + 1) / 2;
}
