import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

/** A single machined part: mounting flange, four through-holes and an open annular neck. */
export function createFactoryHousing() {
  const shape = new THREE.Shape();
  const half = .86, radius = .17;
  shape.moveTo(-half + radius, -half);
  shape.lineTo(half - radius, -half);
  shape.quadraticCurveTo(half, -half, half, -half + radius);
  shape.lineTo(half, half - radius);
  shape.quadraticCurveTo(half, half, half - radius, half);
  shape.lineTo(-half + radius, half);
  shape.quadraticCurveTo(-half, half, -half, half - radius);
  shape.lineTo(-half, -half + radius);
  shape.quadraticCurveTo(-half, -half, -half + radius, -half);
  for (const [x, y, r] of [[0, 0, .4], [-.61, -.61, .105], [-.61, .61, .105], [.61, -.61, .105], [.61, .61, .105]]) {
    const hole = new THREE.Path();
    hole.absarc(x, y, r, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const flange = new THREE.ExtrudeGeometry(shape, {
    depth: .16, bevelEnabled: true, bevelThickness: .018, bevelSize: .018,
    bevelSegments: 3, curveSegments: 24, steps: 1,
  });
  const profile = [[.4, .145], [.59, .145], [.59, .2], [.565, .245], [.565, .57], [.54, .605], [.4, .605], [.4, .145]];
  const neck = new THREE.LatheGeometry(profile.map(([r, z]) => new THREE.Vector2(r, z)), 72);
  neck.rotateX(Math.PI / 2);
  // Extruded and lathed surfaces use the same non-indexed representation for sampling.
  const neckTriangles = neck.toNonIndexed();
  const merged = mergeGeometries([flange, neckTriangles]);
  flange.dispose(); neck.dispose(); neckTriangles.dispose();
  if (!merged) throw new Error("Could not construct the factory housing");
  merged.translate(0, 0, -.27);
  return merged;
}

export function factoryRandom(seed = 1701) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
}

/** Groups are interleaved over the entire part, rather than assigned to physical regions. */
export function createHousingParticles(housing: THREE.BufferGeometry, count = 2400) {
  const random = factoryRandom();
  // The installed Three.js runtime supports seeded sampling; its older type package omits this method.
  type SeededSampler = MeshSurfaceSampler & { setRandomGenerator: (random: () => number) => SeededSampler };
  const sampler = (new MeshSurfaceSampler(new THREE.Mesh(housing)) as SeededSampler).setRandomGenerator(random).build();
  const positions = new Float32Array(count * 3), targets = new Float32Array(count * 3);
  const groups = new Float32Array(count), seeds = new Float32Array(count);
  const point = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    sampler.sample(point);
    // Additional samples on the bore and mounting rims preserve the recognisable openings.
    if (i % 5 === 0) {
      const hole = Math.floor(random() * 5), angle = random() * Math.PI * 2;
      const x = hole === 0 ? 0 : hole < 3 ? -.61 : .61;
      const y = hole === 0 ? 0 : hole % 2 ? -.61 : .61;
      const r = hole === 0 ? .4 : .105;
      point.set(x + Math.cos(angle) * r, y + Math.sin(angle) * r, hole === 0 ? .337 : -.092);
    }
    point.toArray(positions, i * 3);
    const group = i % 3;
    groups[i] = group; seeds[i] = random();
    let x: number, y: number, z = (random() - .5) * .28;
    if (group === 0) {
      if (random() < .42) { x = (random() - .5) * 1.3; y = -.43 + random() * .16; }
      else {
        const t = random(), segment = t < .5 ? t * 2 : (t - .5) * 2;
        x = t < .5 ? -.34 + segment * .28 : -.06 + segment * .55;
        y = t < .5 ? -.3 + segment * .85 : .55 - segment * .32;
        x += (random() - .5) * .13; y += (random() - .5) * .13;
      }
    } else if (group === 1) {
      const layer = random() < .5 ? -.1 : .12;
      x = (random() - .5) * 1.15 + layer; y = (random() - .5) * .98 - layer; z = layer;
    } else {
      const angle = random() * Math.PI * 2, vertical = random() * 2 - 1;
      const radial = Math.sqrt(1 - vertical * vertical);
      x = Math.cos(angle) * radial * .59; y = vertical * .52 + .08; z = Math.sin(angle) * radial * .32;
    }
    targets.set([x, y, z], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute("aGroup", new THREE.BufferAttribute(groups, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geometry;
}
