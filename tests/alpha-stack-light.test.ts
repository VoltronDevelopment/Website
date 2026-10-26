import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createAlphaStackLight } from "../components/home/alpha-stack-light";

describe("Alpha stack light", () => {
  it("switches independent lenses and clears emission on reverse seek", () => {
    const light = createAlphaStackLight(value => value, value => value, new THREE.MeshBasicMaterial());
    const lenses = light.group.children.filter(object => object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[];
    light.setState("active");
    expect(lenses[0].material.emissiveIntensity).toBeGreaterThan(1);
    expect(lenses[1].material.emissiveIntensity).toBe(0);
    light.setState("complete");
    expect(lenses[0].material.emissiveIntensity).toBe(0);
    expect(lenses[1].material.emissiveIntensity).toBeGreaterThan(.5);
    light.setState("idle");
    expect(lenses.every(mesh => mesh.material.emissiveIntensity === 0)).toBe(true);
  });
  it("isolates each tank and uses amber only for attention", () => {
    const housing = new THREE.MeshBasicMaterial();
    const a = createAlphaStackLight(value => value, value => value, housing);
    const b = createAlphaStackLight(value => value, value => value, housing);
    a.setState("attention"); b.setState("idle");
    const lens = (light: typeof a) => (light.group.children[2] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material;
    expect(lens(a).emissive.getHex()).toBe(0xd7a052);
    expect(lens(b).emissiveIntensity).toBe(0);
    a.setState("active");
    expect(lens(a).emissive.getHex()).toBe(0x286bda);
  });
});
