import * as THREE from "three";

export type AlphaLampState = "idle" | "active" | "complete" | "attention";

/** A compact two-lens industrial beacon. No scene lights or idle animation needed. */
export function createAlphaStackLight(
  geometry: <T extends THREE.BufferGeometry>(value: T) => T,
  material: <T extends THREE.Material>(value: T) => T,
  housing: THREE.Material,
) {
  const group = new THREE.Group();
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 20));
  function section(radius: number, height: number, y: number, mat: THREE.Material) {
    const mesh = new THREE.Mesh(cylinder, mat);
    mesh.scale.set(radius, height, radius); mesh.position.y = y; group.add(mesh);
    return mesh;
  }
  section(.12, .055, .028, housing);
  section(.045, .16, .12, housing);
  const lenses = [0x286bda, 0x86d5ed].map(color => material(new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0, metalness: .15, roughness: .24,
  })));
  const profile = [new THREE.Vector2(0, -.08), ...Array.from({length:21}, (_, i) => new THREE.Vector2(i % 4 === 0 ? .099 : .095, -.08 + i * .008)), new THREE.Vector2(0, .08)];
  const lensGeometry = geometry(new THREE.LatheGeometry(profile, 20));
  for (let i = 0; i < 2; i++) {
    const y = .46 - i * .19;
    const lens = new THREE.Mesh(lensGeometry, lenses[i]); lens.position.y = y; group.add(lens);
    section(.103, .025, y + .092, housing);
  }
  section(.105, .04, .59, housing);
  const haloMaterial = material(new THREE.MeshBasicMaterial({ color: 0x286bda, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const halo = new THREE.Mesh(geometry(new THREE.SphereGeometry(.16, 12, 8)), haloMaterial);
  halo.scale.y = .8; halo.position.y = .27; group.add(halo);
  let previous: AlphaLampState | undefined;
  return { group, setState(state: AlphaLampState) {
    if (state === previous) return; previous = state;
    const active = state === "active" || state === "attention";
    const color = state === "attention" ? 0xd7a052 : 0x286bda;
    lenses[0].color.setHex(active ? color : 0x344c65);
    lenses[0].emissive.setHex(color); lenses[0].emissiveIntensity = active ? 1.2 : 0;
    lenses[1].color.setHex(state === "complete" ? 0x86d5ed : 0x456171);
    lenses[1].emissiveIntensity = state === "complete" ? .65 : 0;
    haloMaterial.color.setHex(state === "complete" ? 0x86d5ed : color);
    haloMaterial.opacity = active ? .12 : state === "complete" ? .06 : 0;
    halo.position.y = state === "complete" ? .27 : .46;
  } };
}
