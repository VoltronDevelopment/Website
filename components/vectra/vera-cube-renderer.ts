import * as T from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createFluidCube } from "../intelligence/fluid-cube-materials";
import type { AgentVisualPreset } from "../intelligence/agent-presets";
const veraIdentity: AgentVisualPreset = { name: "VERA", family: "clouds", motion: "circulating", seed: 137, scale: [1.3, 1.8, 1.45], contours: 9, warp: 2.8, speed: 1.15, density: 1.18, smoke: .045, gather: .28, particles: .05, low: "#17257A", mid: "#3970E6", high: "#45E5E0", aura: "#6574E9" };
import { prefersStaticScene } from "../performance/scene-policy";

type Slot = { canvas: HTMLCanvasElement; host: HTMLElement; preset: number };
const slots = new Set<Slot>();
const surfaceSize = 256;
const cardSize = 96;
let stop: (() => void) | undefined;
let refresh: (() => void) | undefined;

function fitCamera(camera: T.PerspectiveCamera) {
  camera.position.set(3, 2.1, 4.6);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  camera.zoom = 1.1;
  camera.updateProjectionMatrix();

  // Center the projected enclosure rather than its world-space origin.
  const bounds = new T.Box2();
  for (const x of [-.92, .92]) for (const y of [-.92, .92]) for (const z of [-.92, .92]) {
    const corner = new T.Vector3(x, y, z).project(camera);
    bounds.expandByPoint(new T.Vector2(corner.x, corner.y));
  }
  const center = bounds.getCenter(new T.Vector2());
  camera.projectionMatrix.elements[8] += center.x;
  camera.projectionMatrix.elements[9] += center.y;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

function isVisible(host: HTMLElement) {
  const box = host.getBoundingClientRect();
  if (!box.width || !box.height || box.bottom <= 0 || box.top >= innerHeight) return false;
  const transcript = host.closest(".vectra-transcript")?.getBoundingClientRect();
  return !transcript || (box.bottom > transcript.top && box.top < transcript.bottom);
}

/** One WebGL context supplies the identity and the three question illustrations. */
function start() {
  const source = document.createElement("canvas");
  const renderer = new T.WebGLRenderer({ canvas: source, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setSize(surfaceSize, surfaceSize, false);
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34, 1, .1, 30);
  fitCamera(camera);
  const room = new RoomEnvironment();
  const pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.add(new T.HemisphereLight("#e9faff", "#204269", 2));
  const key = new T.DirectionalLight("#ffffff", 3);
  key.position.set(-3, 5, 3);
  scene.add(key);

  const cubes = new Map<number, { cube: ReturnType<typeof createFluidCube>; last: number }>();
  let frame = 0;
  let last = 0;
  let time = 7;
  let lost = false;

  function draw(now: number) {
    frame = 0;
    if (document.hidden || lost) return;
    const visible = [...slots].filter(({ host }) => isVisible(host));
    if (!visible.length) { last = 0; return; }
    if (last && now - last < 32) { frame = requestAnimationFrame(draw); return; }
    time += last ? Math.min((now - last) / 1000, .1) : 0;
    last = now;
    const still = prefersStaticScene() || document.documentElement.dataset.veraMotion === "still";
    const dark = document.documentElement.dataset.theme === "dark";

    for (const preset of new Set(visible.map(slot => slot.preset))) {
      let item = cubes.get(preset);
      if (!item) {
        item = { cube: createFluidCube(preset, veraIdentity), last: 0 };
        cubes.set(preset, item);
      }
      const matching = visible.filter(slot => slot.preset === preset);
      const identity = preset === 5;
      if (!identity && item.last && now - item.last < 64 && matching.every(slot => slot.host.dataset.live)) continue;
      item.last = now;
      const active = identity && matching.some(slot => slot.host.dataset.active === "true");
      item.cube.update(still ? 7 : time, dark, camera.position, active ? .25 : 0, active ? 1 : .65,
        { amount: identity ? .2 : .12, arrangement: .15, resolve: 0, label: "" }, true);
      const size = identity ? surfaceSize : cardSize;
      renderer.setViewport(0, 0, size, size);
      scene.add(item.cube.group);
      renderer.render(scene, camera);
      scene.remove(item.cube.group);

      for (const { canvas, host } of matching) {
        const context = canvas.getContext("2d");
        if (!context) continue;
        if (canvas.width !== size || canvas.height !== size) { canvas.width = size; canvas.height = size; }
        context.clearRect(0, 0, size, size);
        context.drawImage(source, 0, surfaceSize - size, size, size, 0, 0, size, size);
        host.style.setProperty("--vera-aura-color", veraIdentity.aura);
        host.dataset.live = "true";
      }
    }
    if (!still) frame = requestAnimationFrame(draw);
  }

  function resume() {
    cancelAnimationFrame(frame);
    last = 0;
    for (const item of cubes.values()) item.last = 0;
    frame = requestAnimationFrame(draw);
  }
  refresh = resume;
  const observer = new MutationObserver(resume);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-scene-motion", "data-artwork-motion", "data-vera-motion"] });
  const panels = new MutationObserver(resume);
  panels.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open", "hidden", "data-active"] });
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  motion.addEventListener("change", resume);
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    slots.forEach(({ host }) => delete host.dataset.live);
  };
  const restored = () => { lost = false; resume(); };
  source.addEventListener("webglcontextlost", contextLost);
  source.addEventListener("webglcontextrestored", restored);
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("resize", resume);
  window.addEventListener("scroll", resume, { capture: true, passive: true });
  resume();

  return () => {
    refresh = undefined;
    cancelAnimationFrame(frame);
    observer.disconnect();
    panels.disconnect();
    motion.removeEventListener("change", resume);
    source.removeEventListener("webglcontextlost", contextLost);
    source.removeEventListener("webglcontextrestored", restored);
    document.removeEventListener("visibilitychange", resume);
    window.removeEventListener("resize", resume);
    window.removeEventListener("scroll", resume, true);
    cubes.forEach(({ cube }) => cube.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}

export function attachVeraCube(canvas: HTMLCanvasElement, host: HTMLElement, preset: number) {
  const slot = { canvas, host, preset };
  slots.add(slot);
  try { stop ??= start(); } catch { slots.delete(slot); return () => {}; }
  refresh?.();
  return () => {
    slots.delete(slot);
    delete host.dataset.live;
    if (!slots.size) { stop?.(); stop = undefined; }
  };
}
