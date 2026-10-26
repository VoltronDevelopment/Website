import {createSceneHandoff} from "../performance/scene-handoff";
import {createRenderQuality} from "../performance/scene-policy";
import * as THREE from "three";
import { capabilityCubeCamera, capabilityGlassVisibility as glassVisibility, capabilityEdgeWidth } from "./capability-cube-style";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {createMachiningView} from "./machining-part";
import {createFactoryFormation} from './factory-formation';
import { factorySystemsDuration, factorySystemsStateAt, type FactoryPhase } from "./factory-systems-timeline";
import { factorySystemsCanStart } from "./factory-systems-visibility";
import { glassFace, setGlass, nodeHaloTexture, stroke, strokeMaterial, type GlassFace } from "./lattice-materials";

type Options = { onReady: (ready: boolean) => void; onPhase: (phase: FactoryPhase) => void; onFocus?: (index:number)=>void };
export type FactorySystemsController = {
  ready: Promise<void>; select: (index:number)=>void; setPaused: (paused: boolean) => void; replay: () => void; dispose: () => void;
};
type Cube = {
  root: THREE.Group;
  faces: { material: THREE.MeshPhysicalMaterial; base: number }[];
  edges: { line: ReturnType<typeof stroke>; glows: ReturnType<typeof stroke>[]; from: THREE.Vector3; to: THREE.Vector3; front: boolean }[];
  nodes: { mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>; front: boolean }[];
  halo: THREE.Sprite;
  artwork?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
};


export function mountFactorySystems(canvas: HTMLCanvasElement, host: HTMLDivElement, options: Options): FactorySystemsController {
  const handoff=createSceneHandoff(host,canvas);
  const quality=createRenderQuality(canvas,1.5);
  const cards = Array.from(host.querySelectorAll<HTMLElement>(".factory-system"));
  const anchors = Array.from(host.querySelectorAll<HTMLElement>("[data-system-anchor]"));
  const views=[0,1,2].map(createMachiningView);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const params = new URLSearchParams(location.search);
  const previewTime = params.has("factory-time") ? Number(params.get("factory-time")) : NaN;
  const preview = Number.isFinite(previewTime);
  const composition = params.get("artwork") === "composition" || params.get("animate") === "0";
  let renderer: THREE.WebGLRenderer;
  try {
    if (params.get("renderer") === "static") throw new Error("Static illustration requested");
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power",preserveDrawingBuffer:params.has("factory-poster") });
  } catch {
    canvas.hidden = true; host.dataset.renderer = "fallback";
    return { ready: Promise.resolve(), select() {}, setPaused() {}, replay() {}, dispose() {} };
  }
  renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 100);
  camera.position.set(...capabilityCubeCamera); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const forward = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2);
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  const geometry = <T extends THREE.BufferGeometry>(value: T) => { geometries.add(value); return value; };
  const material = <T extends THREE.Material>(value: T) => { materials.add(value); return value; };
  let environment: THREE.WebGLRenderTarget | undefined;
  let disposed = false, failed = false, released = false, prepared = false, visible = false, started = false, paused = false;
  let cancelPreparation: () => void = () => {};
  const cancelled = new Promise<void>(resolve => { cancelPreparation = resolve; });
  let elapsed = preview ? Math.max(0, Math.min(factorySystemsDuration, previewTime)) : motion.matches || composition ? factorySystemsDuration : 0;
  let frame = 0, previous = 0, lastPhase: FactoryPhase | undefined, mobile = false, unitPixels = 90;
  let width = 0, height = 0, focus=0,manualFocus=false;
  const dark = () => document.documentElement.dataset.theme === "dark";
  const source = new THREE.Vector3(), destinations = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x40596e, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3.1); key.position.set(-4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8dcfff, 2.2); rim.position.set(4, 2, -3); scene.add(rim);
  const haloTexture = nodeHaloTexture(); textures.add(haloTexture);
  const nodeGeometry = geometry(new THREE.SphereGeometry(1, 8, 6));
  const half = .825;
  const corners = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(i & 1 ? half : -half, i & 2 ? half : -half, i & 4 ? half : -half));
  const pairs = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cubes: Cube[] = destinations.map((_,viewIndex) => {
    const root = new THREE.Group(); scene.add(root);
    const faces: Cube["faces"] = [];
    const faceSpecs: { kind: GlassFace; position: number[]; rotation: number[]; front: boolean }[] = [
      { kind: "side", position: [half, 0, 0], rotation: [0, Math.PI / 2, 0], front: true },
      { kind: "rear", position: [-half, 0, 0], rotation: [0, -Math.PI / 2, 0], front: false },
      { kind: "top", position: [0, half, 0], rotation: [-Math.PI / 2, 0, 0], front: true },
      { kind: "bottom", position: [0, -half, 0], rotation: [Math.PI / 2, 0, 0], front: false },
      { kind: "front", position: [0, 0, half], rotation: [0, 0, 0], front: true },
      { kind: "rear", position: [0, 0, -half], rotation: [0, Math.PI, 0], front: false },
    ];
    for (const spec of faceSpecs) {
      const mat = material(glassFace(spec.kind, dark(),true,"display"));
      mat.forceSinglePass = true;
      mat.userData.factoryFace = spec.kind;
      const base = mat.opacity * glassVisibility(spec.kind);
      const pane = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.65, 1.65)), mat);
      pane.position.fromArray(spec.position); pane.rotation.set(spec.rotation[0], spec.rotation[1], spec.rotation[2]);
      pane.renderOrder = spec.front ? 5 : 1; root.add(pane); faces.push({ material: mat, base });
    }
    const edges = pairs.map(([a, b]) => {
      const from = corners[a], to = corners[b];
      // With this fixed camera, the three hidden edges meet at the far negative corner.
      const front = a !== 0 && b !== 0;
      const mat = material(strokeMaterial(front));
      mat.userData.cssWidth = front ? capabilityEdgeWidth.front : capabilityEdgeWidth.rear;
      const line = stroke([from, to], mat); geometry(line.geometry); line.renderOrder = front ? 6 : 2; root.add(line);
      const glows = front ? [] : capabilityEdgeWidth.glow.map((width, index) => {
        const glowMaterial = material(strokeMaterial(false));
        glowMaterial.userData.cssWidth = width;
        const glow = stroke([from, to], glowMaterial);
        glow.geometry.dispose(); glow.geometry = line.geometry;
        glow.renderOrder = index === 0 ? .5 : 1.5; root.add(glow);
        return glow;
      });
      return { line, glows, from, to, front };
    });
    const nodes = corners.map(point => {
      const front = point.x > 0 || point.y > 0 || point.z > 0;
      const mat = material(new THREE.MeshBasicMaterial({ color: 0x63baff, transparent: true, depthWrite: false, toneMapped: false }));
      const mesh = new THREE.Mesh(nodeGeometry, mat); mesh.position.copy(point); mesh.renderOrder = front ? 7 : 2; root.add(mesh);
      return { mesh, front };
    });
    const halo = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, depthWrite: false, opacity: 0, toneMapped: false })));
    halo.position.copy(corners[0]); halo.renderOrder = 2; root.add(halo);
    root.add(views[viewIndex].group);views[viewIndex].group.traverse(o=>{if(o instanceof THREE.Sprite){material(o.material);if(o.material.map)textures.add(o.material.map);}if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.Line){geometry(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])material(m);}});
    return { root, faces, edges, nodes, halo };
  });
  const connections = [0, 1].map(() => {
    const mat = material(new THREE.LineDashedMaterial({ color: 0x2894bc, dashSize: .022, gapSize: .065, transparent: true, opacity: 0, depthWrite: false }));
    const line = new THREE.Line(geometry(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])), mat);
    line.frustumCulled = false; line.renderOrder = 2; scene.add(line);
    const pulse = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })));
    pulse.scale.setScalar(.21); pulse.renderOrder = 7; scene.add(pulse);
    return { line, pulse, from: new THREE.Vector3(), to: new THREE.Vector3() };
  });
  const atmosphere = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, opacity: .12, depthWrite: false, toneMapped: false })));
  const formation=createFactoryFormation(views[0].group.getObjectByName('shared-flange-housing')!,source,destinations,up);scene.add(formation.group);
  atmosphere.renderOrder = -2; scene.add(atmosphere);
  const shadowCanvas = document.createElement("canvas"); shadowCanvas.width = 128; shadowCanvas.height = 64;
  const shadowContext = shadowCanvas.getContext("2d")!;
  const shadowGradient = shadowContext.createRadialGradient(64, 32, 4, 64, 32, 62);
  shadowGradient.addColorStop(0, "rgba(17,45,66,.3)"); shadowGradient.addColorStop(1, "rgba(17,45,66,0)");
  shadowContext.fillStyle = shadowGradient; shadowContext.fillRect(0, 0, 128, 64);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas); textures.add(shadowTexture);
  const shadow = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: shadowTexture, transparent: true, opacity: .65, depthWrite: false })));
  shadow.scale.set(2.4, .4, 1); shadow.renderOrder = -1; scene.add(shadow);

  function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; canvas.dataset.running = "false"; }
  function release() {
    if (released) return;
    released = true;
    formation.dispose();
    geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose());
    environment?.dispose(); renderer.dispose(); renderer.forceContextLoss();
  }
  function fallback() {
    handoff.fallback();
    if (disposed || failed) return;
    failed = true; cancelPreparation(); stop(); canvas.hidden = true; host.dataset.renderer = "fallback";
    cards.forEach(card => card.style.removeProperty("--label-reveal"));
    options.onReady(false); options.onPhase("settled");
    release();
  }
  function render() {
    if (!disposed && !failed) renderer.render(scene, camera);
  }
  function apply() {
    const state = factorySystemsStateAt(elapsed);
    if(!manualFocus)focus=state.time<8.5?0:state.time<12?1:2;
    host.dataset.focus=String(focus);options.onFocus?.(focus);
    host.style?.setProperty('--context-reveal',String(state.context));host.style?.setProperty('--intelligence-reveal',String(state.intelligence));host.style?.setProperty('--recommendation-reveal',String(state.recommendation));
    host.style?.setProperty('--card-reveal',String(state.cards));formation.update(state.time,state.dissolve,state.separate,state.particles,dark(),quality.ratio);
    atmosphere.visible=false;shadow.visible=false;
    cubes.forEach((cube, index) => {
      const reveal = state.cubes[index], energy=state.activity[index];
      cube.root.visible = reveal > 0&&(!mobile||focus===index); cube.root.position.copy(destinations[index]);
      cube.faces.forEach(face => {
        face.material.opacity = face.base * reveal;
        face.material.emissiveIntensity = .012 + energy * .13;
      });
      cube.edges.forEach((edge, edgeIndex) => {
        const progress = Math.max(0, Math.min(1, reveal * 1.35 - edgeIndex / 32));
        const end = edge.line.geometry.getAttribute("instanceEnd") as THREE.InterleavedBufferAttribute;
        end.setXYZ(0, THREE.MathUtils.lerp(edge.from.x, edge.to.x, progress), THREE.MathUtils.lerp(edge.from.y, edge.to.y, progress), THREE.MathUtils.lerp(edge.from.z, edge.to.z, progress));
        end.data.needsUpdate = true;
        edge.line.visible = progress > 0;
        edge.line.material.opacity = (edge.front ? dark() ? .38 : .42 : dark() ? .78 : .65) * reveal;
        edge.line.material.opacity+=energy*.16;
        edge.glows.forEach((glow, index) => {
          glow.visible = progress > 0;
          glow.material.opacity = (index === 0 ? dark() ? .07 : .035 : dark() ? .15 : .08) * reveal*(1+energy*2);
        });
      });
      cube.nodes.forEach(({ mesh, front }) => {
        mesh.scale.setScalar((front ? 1.2 : 1.6) / unitPixels);
        mesh.material.opacity = (front ? .42 : .85) * reveal;
      });
      cube.halo.scale.setScalar(17 / unitPixels);
      cube.halo.material.opacity = ((dark() ? .13 : .07) + energy * .28) * reveal;
      views[index].group.visible=state.models>0;
      views[index].group.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.transparent=true;m.opacity=state.models;m.depthWrite=state.models>.99;}}});
      views[index].update(Math.max(0,state.time-4),state.cut,state.context,state.intelligence);
      cards[index]?.style.setProperty('--summary-reveal',String(state.summaries[index]));
      cards[index]?.querySelectorAll?.<HTMLElement>('.factory-records>div').forEach((row,i)=>row.style.setProperty('--record-reveal',String(state.records[index][i])));
      cards[index]?.style.setProperty("--label-reveal", String(state.labels[index]));
    });
    connections.forEach(({ line, pulse, from, to }) => {
      const attribute = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      attribute.setXYZ(0, from.x, from.y, from.z);
      attribute.setXYZ(1, THREE.MathUtils.lerp(from.x, to.x, state.connections), THREE.MathUtils.lerp(from.y, to.y, state.connections), THREE.MathUtils.lerp(from.z, to.z, state.connections));
      attribute.needsUpdate = true; line.computeLineDistances();
      line.material.opacity = (dark() ? .6 : .5) * state.connections;
      line.visible = !mobile&&state.connections > 0;
      pulse.position.lerpVectors(from, to, state.pulse);
      pulse.material.opacity = mobile?0:state.connections * Math.sin(state.pulse * Math.PI) * .85;
    });
    canvas.dataset.phase = state.phase; canvas.dataset.animationTime = state.time.toFixed(3);
    canvas.dataset.contextMarks=String(state.time>=7.5&&state.time<11.8);canvas.dataset.inspectionScan=String(state.time>10.25&&state.time<13.8);canvas.dataset.partIdentity='flange-housing';canvas.dataset.partViews='3';canvas.dataset.cutProgress=state.cut.toFixed(4);canvas.dataset.focus=String(focus);canvas.dataset.artworkSource='shared-3d-part';canvas.dataset.settled = String(state.settled); canvas.dataset.theme = dark() ? "dark" : "light";
    if (lastPhase !== state.phase) { lastPhase = state.phase; options.onPhase(state.phase); }
  }
  function resize() {
    if (disposed || failed) return;
    const bounds = host.getBoundingClientRect(), targets = anchors.map(anchor => anchor.getBoundingClientRect());
    if (!bounds.width || !bounds.height || targets.length !== 3) return;
    width = bounds.width; height = bounds.height; mobile = matchMedia("(max-width: 767px)").matches;
    const projectedWidth = 1.65 * (Math.abs(right.x) + Math.abs(right.y) + Math.abs(right.z));
    const projectedHeight = 1.65 * (Math.abs(up.x) + Math.abs(up.y) + Math.abs(up.z));
    unitPixels = Math.min(...targets.map(target => Math.min(target.width * .9 / projectedWidth, target.height * .9 / projectedHeight)));
    camera.left = -width / unitPixels / 2; camera.right = -camera.left;
    camera.top = height / unitPixels / 2; camera.bottom = -camera.top; camera.updateProjectionMatrix();
    targets.forEach((target, index) => {
      destinations[index].copy(right).multiplyScalar((target.left - bounds.left + target.width / 2 - width / 2) / unitPixels)
        .addScaledVector(up, (height / 2 - (target.top - bounds.top + target.height / 2)) / unitPixels);
    });
    source.copy(destinations[1]);
    connections.forEach((connection, index) => {
      connection.from.copy(destinations[index]); connection.to.copy(destinations[index + 1]);
      if (mobile) {
        const gap = projectedHeight / 2 + .07;
        connection.from.addScaledVector(up, -gap); connection.to.addScaledVector(up, gap);
      } else {
        const gap = projectedWidth / 2 + .07;
        connection.from.addScaledVector(right, gap); connection.to.addScaledVector(right, -gap);
      }
    });
    const density = quality.ratio;
    renderer.setPixelRatio(density); renderer.setSize(width, height, false);
    host.dataset.layout = mobile ? "vertical" : "horizontal";
    if (prepared) { apply(); render(); }
  }
  function palette() {
    if (disposed || failed) return;
    connections.forEach(({ line, pulse }) => {
      line.material.color.setHex(dark() ? 0x78b0ff : 0x246bd4);
      pulse.material.color.setHex(dark() ? 0x92d6ff : 0x246bd4);
    });
    cubes.forEach(cube => {
      cube.faces.forEach(face => {
        const kind = face.material.userData.factoryFace as GlassFace;
        // Reuse the canonical glass palette without changing the other website scenes.
        setGlass(face.material, kind, dark());
        face.base = face.material.opacity * glassVisibility(kind);
      });
      cube.edges.forEach(({ line, glows, front }) => {
        line.material.color.setHex(front ? dark() ? 0x6092b3 : 0x397cae : dark() ? 0x78b0ff : 0x246bd4);
        glows.forEach(glow => glow.material.color.setHex(dark() ? 0x78b0ff : 0x246bd4));
      });
      cube.nodes.forEach(({ mesh }) => mesh.material.color.setHex(dark() ? 0x92d6ff : 0x3284d7));
    });
    if (prepared) { apply(); render(); }
  }
  function tick(now: number) {
    if(quality.sample(now))resize();
    if (disposed || failed || paused || !visible || document.hidden) { stop(); return; }
    elapsed = Math.min(factorySystemsDuration, elapsed + (previous ? Math.min(.1, (now - previous) / 1000) : 0));
    previous = now; apply(); render();
    if (elapsed < factorySystemsDuration) frame = requestAnimationFrame(tick); else stop();
  }
  function resume() {
    stop();
    if (!prepared || disposed || failed || host.dataset.sceneState!=="live") return;
    if (motion.matches || composition) { elapsed = factorySystemsDuration; apply(); render(); return; }
    if (preview) { apply(); render(); return; }
    if (started && visible && !document.hidden && !paused && elapsed < factorySystemsDuration) {
      canvas.dataset.running = "true"; frame = requestAnimationFrame(tick);
    }
  }
  function visibility() { resume(); }
  function preference() { if (motion.matches) elapsed = factorySystemsDuration; resume(); }
  function contextLost(event: Event) { event.preventDefault(); fallback(); }
  function seek(event:Event){const t=Number((event as CustomEvent).detail?.time);if(!preview||!Number.isFinite(t)||!prepared)return;stop();manualFocus=false;paused=true;elapsed=THREE.MathUtils.clamp(t,0,factorySystemsDuration);apply();render();}
  host.addEventListener?.('factory-control',seek);
  const sizing = new ResizeObserver(resize); sizing.observe(host);
  const themes = new MutationObserver(palette); themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 80;
  const view = new IntersectionObserver(([entry]) => {
    const wasVisible = visible, hadStarted = started;
    visible = entry.isIntersecting;
    const availableHeight = entry.rootBounds?.height ?? Math.max(0, innerHeight - headerHeight);
    if (factorySystemsCanStart(entry.intersectionRect.height, entry.boundingClientRect.height, availableHeight)) started = true;
    if (visible !== wasVisible || started !== hadStarted) resume();
  }, { threshold: [0, .1, .2, .3, .45], rootMargin: `-${Math.ceil(headerHeight)}px 0px 0px` });
  view.observe(host);
  motion.addEventListener("change", preference); document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", contextLost);

  const preparing = (async () => {
    try {
      const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
      try { environment = pmrem.fromScene(room, .1); scene.environment = environment.texture; }
      finally { room.dispose(); pmrem.dispose(); }

      if (disposed || failed) return;
      resize(); palette();
      // Prepare every material before the reveal, including those hidden at its first frame.
      await renderer.compileAsync(scene, camera);
      if (disposed || failed) return;
      prepared = true; canvas.hidden = false; apply(); render();
      await handoff.reveal();if(disposed)return;host.dataset.renderer = "webgl"; canvas.dataset.ready = "true";
      options.onReady(true); resume();
    } catch { if (!disposed) fallback(); }
  })();
  const ready = Promise.race([preparing, cancelled]);
  return {
    ready,
    select(index) {focus=Math.max(0,Math.min(2,index));manualFocus=true;paused=true;elapsed=[6.5,10.5,16][focus];apply();render();stop();},
    setPaused(value) { paused = value; resume(); },
    replay() { if (disposed || failed) return; elapsed = 0; manualFocus=false; paused = false; started = true; apply(); render(); resume(); },
    dispose() {
      if (disposed) return;
      disposed = true;handoff.dispose(); cancelPreparation(); stop(); sizing.disconnect(); themes.disconnect(); view.disconnect();
      motion.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      host.removeEventListener?.('factory-control',seek);
      release();
    },
  };
}
