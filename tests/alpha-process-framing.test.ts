import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { alphaStationPosition, alphaViewBounds, fitAlphaCamera } from "../components/home/alpha-process-framing";
import { alphaDuration, alphaStateAt } from "../components/home/alpha-process-timeline";

function setup() {
  const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, .1, 100);
  camera.position.set(-8, 8.2, 16); camera.lookAt(0, 2.2, 0); camera.updateMatrixWorld();
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const add = (size: number[], position: number[]) => {
    const mesh = new THREE.Mesh(geometry); mesh.scale.set(...size as [number, number, number]); mesh.position.set(...position as [number, number, number]); group.add(mesh);
  };
  add([17.2, .16, 3.5], [0, .15, 0]);
  for (const x of [-8.05, 8.05]) add([.18, .16, 3.02], [x, 5.28, 0]);
  for (const z of [-.67, .67]) add([16.65, .055, .24], [0, 5.37, z]);
  for (const x of [-6.9, 6.9]) add([.64, .16, 1.65], [x, 5.48, 0]);
  return { camera, bounds: alphaViewBounds([group], camera) };
}

describe("Alpha camera framing regression", () => {
  it.each([[1120, 509], [917, 417], [620, 282], [343, 185], [273, 147]])("keeps the upper-right joint, base and moving trolley inside %s × %s", (width, height) => {
    const { camera, bounds } = setup();
    const padding = fitAlphaCamera(camera, bounds, width, height);
    const fixed = [[8.14, 5.36, -1.51], [-8.14, 5.36, -1.51], [-8.6, .07, 1.75], [8.6, .07, 1.75]];
    const points = fixed.map(point => new THREE.Vector3(...point));
    for (let time = 0; time < alphaDuration; time += .05) {
      const state = alphaStateAt(time);
      points.push(new THREE.Vector3(state.x + .32, 5.56, -.825));
      points.push(new THREE.Vector3(state.x - .32, 5.56, .825));
      points.push(new THREE.Vector3(state.x, state.y - 1.476, 0));
    }
    for (const point of points) {
      point.project(camera);
      const x = (point.x + 1) * width / 2, y = (1 - point.y) * height / 2;
      expect(x).toBeGreaterThanOrEqual(padding - .01); expect(x).toBeLessThanOrEqual(width - padding + .01);
      expect(y).toBeGreaterThanOrEqual(padding - .01); expect(y).toBeLessThanOrEqual(height - padding + .01);
    }
  });
  it("preserves camera orientation and aspect while recentering the frame", () => {
    const { camera, bounds } = setup();
    const position = camera.position.clone(), rotation = camera.quaternion.clone();
    fitAlphaCamera(camera, bounds, 1120, 509);
    expect(camera.position.equals(position)).toBe(true); expect(camera.quaternion.equals(rotation)).toBe(true);
    expect((camera.right - camera.left) / (camera.top - camera.bottom)).toBeCloseTo(1120 / 509);
  });
  it("projects station labels under the same station centres as the artwork", () => {
    const { camera, bounds } = setup(); fitAlphaCamera(camera, bounds, 1120, 509);
    const positions = [-6.9, -3.45, 0, 3.45, 6.9].map(x => alphaStationPosition(camera, x));
    expect(positions[0]).toBeGreaterThan(.1); expect(positions[4]).toBeLessThan(.9);
    expect(positions[2]).toBeCloseTo(.5);
    expect(positions.every((p, i) => i === 0 || p > positions[i - 1])).toBe(true);
  });
});
