import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createFactoryHousing, createHousingParticles } from "../components/home/factory-housing";
import { factorySystemsStateAt, factorySystemsDuration } from "../components/home/factory-systems-timeline";
import { factorySystemsCanStart } from "../components/home/factory-systems-visibility";

describe("component reveal visibility", () => {
  it("starts at meaningful visibility on a standard desktop", () => {
    expect(factorySystemsCanStart(150, 366, 820)).toBe(false);
    expect(factorySystemsCanStart(165, 366, 820)).toBe(true);
  });
  it("can start when a short landscape viewport cannot fit 45 percent of the scene", () => {
    // 640 x 240 viewport, 72px header, 468px compact vertical scene.
    expect(factorySystemsCanStart(70, 468, 168)).toBe(false);
    expect(factorySystemsCanStart(100, 468, 168)).toBe(true);
    expect(factorySystemsCanStart(168, 468, 168)).toBe(true);
  });
  it("keeps the trigger reachable when enlarged text makes the scene taller", () => {
    expect(factorySystemsCanStart(200, 1080, 688)).toBe(false);
    expect(factorySystemsCanStart(344, 1080, 688)).toBe(true);
    expect(factorySystemsCanStart(108, 1080, 168)).toBe(true);
  });
  it("does not start for an empty, hidden or invalid viewport", () => {
    for (const args of [[0, 468, 688], [5, 468, 0], [5, 0, 688], [NaN, 468, 688], [10, 468, Infinity]]) {
      expect(factorySystemsCanStart(args[0], args[1], args[2])).toBe(false);
    }
  });
});

describe("three-view manufacturing choreography",()=>{
 it("finishes the cut before retracting and exposes context before a recommendation",()=>{
  expect(factorySystemsStateAt(0).cut).toBe(0);
  expect(factorySystemsStateAt(6.5).cut).toBeCloseTo(.5);
  expect(factorySystemsStateAt(8).cut).toBe(1);
  expect(factorySystemsStateAt(8).recommendation).toBe(0);
  expect(factorySystemsStateAt(10.5).context).toBe(1);
  expect(factorySystemsStateAt(13.5).intelligence).toBe(1);
 });
 it("settles all three perspectives at sixteen seconds",()=>{
  const end=factorySystemsStateAt(factorySystemsDuration);
  expect(end.settled).toBe(true);expect(end.cut).toBe(1);expect(end.recommendation).toBe(1);expect(end.cubes).toEqual([1,1,1]);
  expect(factorySystemsStateAt(NaN).time).toBe(0);expect(factorySystemsStateAt(-1).time).toBe(0);expect(factorySystemsStateAt(100).time).toBe(16);
 });
});

describe("machined flange geometry", () => {
  it("leaves the central bore and all four mounting holes physically open", () => {
    const geometry = createFactoryHousing(), material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material); mesh.updateMatrixWorld(true);
    const ray = new THREE.Raycaster();
    for (const [x, y] of [[0, 0], [-.61, -.61], [-.61, .61], [.61, -.61], [.61, .61]]) {
      ray.set(new THREE.Vector3(x, y, 2), new THREE.Vector3(0, 0, -1));
      expect(ray.intersectObject(mesh)).toHaveLength(0);
    }
    ray.set(new THREE.Vector3(.72, 0, 2), new THREE.Vector3(0, 0, -1));
    expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
    geometry.dispose(); material.dispose();
  });
  it("samples the same part deterministically and distributes all groups over its surfaces", () => {
    const housing = createFactoryHousing();
    const first = createHousingParticles(housing, 300), second = createHousingParticles(housing, 300);
    expect(Array.from(first.getAttribute("position").array)).toEqual(Array.from(second.getAttribute("position").array));
    const positions = first.getAttribute("position"), groups = first.getAttribute("aGroup");
    for (const group of [0, 1, 2]) {
      const samples = Array.from({ length: positions.count }, (_, i) => i).filter(i => groups.getX(i) === group);
      expect(samples).toHaveLength(100);
      expect(samples.some(i => positions.getX(i) < -.4)).toBe(true);
      expect(samples.some(i => positions.getX(i) > .4)).toBe(true);
    }
    first.dispose(); second.dispose(); housing.dispose();
  });
});
