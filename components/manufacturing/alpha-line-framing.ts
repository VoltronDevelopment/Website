import * as THREE from "three";
import { alphaLineStations } from "./alpha-line-config";

export const alphaLineOrbitLimits = {
  azimuth: 28 * Math.PI / 180,
  polar: 8 * Math.PI / 180,
  zoomMin: 0.85,
  zoomMax: 1.35,
};

export function clampAlphaLineOrbit(azimuth: number, polar: number, zoom: number) {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  return {
    azimuth: clamp(azimuth, -alphaLineOrbitLimits.azimuth, alphaLineOrbitLimits.azimuth),
    polar: clamp(polar, -alphaLineOrbitLimits.polar, alphaLineOrbitLimits.polar),
    zoom: clamp(zoom, alphaLineOrbitLimits.zoomMin, alphaLineOrbitLimits.zoomMax),
  };
}

const baseOffset = { x: -8, y: 8.2, z: 16 };

export function alphaLineLookTarget() {
  const xs = alphaLineStations.map(station => station.x);
  const zs = alphaLineStations.map(station => station.z);
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: 2.2,
    z: (Math.min(...zs) + Math.max(...zs)) / 2,
  };
}

/** Camera offset from the line centre. Azimuth turns the homepage isometric view; it does not leave that family of angles. */
export function alphaLineCameraOffset(azimuth: number, polar: number) {
  const orbit = clampAlphaLineOrbit(azimuth, polar, 1);
  const cos = Math.cos(orbit.azimuth);
  const sin = Math.sin(orbit.azimuth);
  return {
    x: baseOffset.x * cos - baseOffset.z * sin,
    y: baseOffset.y + Math.sin(orbit.polar) * 4,
    z: baseOffset.x * sin + baseOffset.z * cos,
  };
}

/** Centre a station in the current orthographic frame and tighten it once. Call this from the fitted full-line frustum, not repeatedly. */
export function frameAlphaLineStation(camera: THREE.OrthographicCamera, world: THREE.Vector3, zoom: number) {
  camera.updateMatrixWorld();
  const view = world.clone().applyMatrix4(camera.matrixWorldInverse);
  const width = (camera.right - camera.left) / zoom;
  const height = (camera.top - camera.bottom) / zoom;
  camera.left = view.x - width / 2;
  camera.right = view.x + width / 2;
  camera.top = view.y + height / 2;
  camera.bottom = view.y - height / 2;
  camera.updateProjectionMatrix();
}

export type AlphaLineLabel = { x: number; y: number; width: number; height: number };
/** Keep overview numbers readable where the short leg compresses in projection. */
export function spaceAlphaLineLabels(labels: readonly AlphaLineLabel[], width: number, height: number) {
  const placed: AlphaLineLabel[] = [];
  for (const label of labels) {
    const next = { ...label, x: Math.min(width - label.width / 2 - 4, Math.max(label.width / 2 + 4, label.x)) };
    for (let pass = 0; pass < labels.length; pass++) {
      const collision = placed.find(p => Math.abs(p.x - next.x) < (p.width + next.width) / 2 + 2 && Math.abs(p.y - next.y) < (p.height + next.height) / 2 + 2);
      if (!collision) break;
      next.y = collision.y + (collision.height + next.height) / 2 + 2;
    }
    next.y = Math.min(height - next.height / 2 - 4, Math.max(next.height / 2 + 4, next.y));
    placed.push(next);
  }
  return placed;
}
