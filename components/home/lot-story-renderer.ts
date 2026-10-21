import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createFactoryHousing } from "./factory-housing";
import { glassFace, setGlass, nodeHaloTexture, stroke, strokeMaterial, type GlassFace } from "./lattice-materials";
import { factorySystemsCanStart } from "./factory-systems-visibility";
import { lotStoryDuration, lotStoryStateAt, type LotStoryState } from "./lot-story-timeline";

type Options = { initialTime: number | null; onState: (state: LotStoryState) => void; onReady: (ready: boolean) => void };
export type LotStoryController = { ready: Promise<void>; select: (time: number) => void; replay: () => void; setPaused: (value: boolean) => void; dispose: () => void };
type Line = ReturnType<typeof stroke>;

/** Four stationary snapshots. A single clock drives the physical actions and evidence UI. */
export function mountLotStory(canvas: HTMLCanvasElement, host: HTMLDivElement, options: Options): LotStoryController {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const params = new URLSearchParams(location.search);
  const previewTime = params.has("lot-time") ? Number(params.get("lot-time")) : NaN;
  const preview = Number.isFinite(previewTime), composition = params.get("animate") === "0" || params.get("artwork") === "composition";
  let elapsed = preview ? Math.max(0, Math.min(14, previewTime)) : options.initialTime ?? (motion.matches || composition ? 14 : 0);
  let paused = options.initialTime !== null, frame = 0, previous = 0, disposed = false, failed = false, prepared = false, released = false, visible = false, started = false;
  let cancelPreparation: () => void = () => {};
  const cancelled = new Promise<void>(resolve => { cancelPreparation = resolve; });
  let renderer: THREE.WebGLRenderer;
  try {
    if (params.get("renderer") === "static") throw new Error("Static artwork requested");
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    host.dataset.renderer = "fallback"; canvas.hidden = true; options.onState(lotStoryStateAt(options.initialTime ?? 14)); options.onReady(false);
    return { ready: Promise.resolve(), select() {}, replay() {}, setPaused() {}, dispose() {} };
  }
  renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-6, 6, 2, -2, .1, 100);
  camera.position.set(12, 9.6, 14); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1), forward = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2);
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  const geometry = <T extends THREE.BufferGeometry>(value: T) => { geometries.add(value); return value; };
  const material = <T extends THREE.Material>(value: T) => { materials.add(value); return value; };
  let environment: THREE.WebGLRenderTarget | undefined;
  let unitPixels = 80, mobile = false, width = 0, height = 0, lastSignature = "";
  const anchors = Array.from(host.querySelectorAll<HTMLElement>("[data-lot-story-anchor]"));
  const destinations = Array.from({ length: 4 }, () => new THREE.Vector3());
  const metal = material(new THREE.MeshPhysicalMaterial({ color: 0xc4d3df, metalness: .82, roughness: .3, clearcoat: .25, envMapIntensity: 1 }));
  const steel = material(new THREE.MeshStandardMaterial({ color: 0x7895a9, metalness: .7, roughness: .34 }));
  const darkSteel = material(new THREE.MeshStandardMaterial({ color: 0x325168, metalness: .65, roughness: .4 }));
  const housingGeometry = geometry(createFactoryHousing()), boxGeometry = geometry(new THREE.BoxGeometry(1, 1, 1));
  const sphereGeometry = geometry(new THREE.SphereGeometry(1, 8, 6));
  const haloTexture = nodeHaloTexture(); textures.add(haloTexture);
  const shadowCanvas = document.createElement("canvas"); shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d")!;
  const gradient = shadowContext.createRadialGradient(64, 64, 6, 64, 64, 62);
  gradient.addColorStop(0, "rgba(12,32,48,.48)"); gradient.addColorStop(1, "rgba(12,32,48,0)"); shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas); textures.add(shadowTexture);
  const shadowMat = material(new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .6 }));
  const shadowGeometry = geometry(new THREE.PlaneGeometry(1.25, .9));
  function box(parent: THREE.Group, size: number[], position: number[], mat: THREE.Material) {
    const mesh = new THREE.Mesh(boxGeometry, mat); mesh.scale.fromArray(size); mesh.position.fromArray(position); parent.add(mesh); return mesh;
  }
  const half = .825;
  const corners = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(i & 1 ? half : -half, i & 2 ? half : -half, i & 4 ? half : -half));
  const pairs = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const faces: { kind: GlassFace; p: number[]; r: number[]; front: boolean }[] = [
    { kind: "side", p: [half, 0, 0], r: [0, Math.PI / 2, 0], front: true },
    { kind: "rear", p: [-half, 0, 0], r: [0, -Math.PI / 2, 0], front: false },
    { kind: "top", p: [0, half, 0], r: [-Math.PI / 2, 0, 0], front: true },
    { kind: "bottom", p: [0, -half, 0], r: [Math.PI / 2, 0, 0], front: false },
    { kind: "front", p: [0, 0, half], r: [0, 0, 0], front: true },
    { kind: "rear", p: [0, 0, -half], r: [0, Math.PI, 0], front: false },
  ];
  const snapshots = destinations.map((_, index) => {
    const root = new THREE.Group(); scene.add(root);
    const panes = faces.map(spec => {
      const mat = material(glassFace(spec.kind, false)); mat.forceSinglePass = true;
      const pane = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.65, 1.65)), mat);
      pane.position.fromArray(spec.p); pane.rotation.set(spec.r[0], spec.r[1], spec.r[2]); pane.renderOrder = spec.front ? 5 : 1; root.add(pane);
      return { mat, kind: spec.kind, base: 0 };
    });
    const edges = pairs.map(([a, b]) => {
      const front = a !== 0 && b !== 0;
      const mat = material(strokeMaterial(front)); mat.userData.cssWidth = front ? .8 : 1.1;
      const line = stroke([corners[a], corners[b]], mat); geometry(line.geometry); line.renderOrder = front ? 6 : 2; root.add(line);
      const glows: Line[] = front ? [] : [5, 2.7].map((size, layer) => {
        const glowMat = material(strokeMaterial(false)); glowMat.userData.cssWidth = size;
        const glow = stroke([corners[a], corners[b]], glowMat); glow.geometry.dispose(); glow.geometry = line.geometry; glow.renderOrder = layer ? 1.5 : .5; root.add(glow); return glow;
      });
      return { line, glows, front };
    });
    const housing = new THREE.Mesh(housingGeometry, metal); housing.scale.setScalar(.75); housing.position.set(-.03, -.03, .07); housing.renderOrder = 3; root.add(housing);
    // A stable locating plate and two jaws support the part during the conceptual process action.
    box(root, [1.28, .09, .93], [0, -.72, .02], steel).renderOrder = 3;
    for (const z of [-.3, .3]) box(root, [1.04, .07, .12], [0, -.795, z], steel).renderOrder = 3;
    const shadow = new THREE.Mesh(shadowGeometry, shadowMat); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.672; shadow.renderOrder = 3; root.add(shadow);
    if (index === 1) for (const x of [-.63, .63]) box(root, [.14, .17, .52], [x, -.61, .05], darkSteel).renderOrder = 3;
    const nodes = corners.map((point, corner) => {
      const mat = material(new THREE.MeshBasicMaterial({ color: 0x65caff, transparent: true, depthWrite: false, toneMapped: false }));
      const mesh = new THREE.Mesh(sphereGeometry, mat); mesh.position.copy(point); mesh.renderOrder = corner ? 7 : 2; root.add(mesh); return { mesh, front: corner !== 0 };
    });
    const halo = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, depthWrite: false, opacity: .1, toneMapped: false })));
    halo.position.copy(corners[0]); halo.renderOrder = 2; root.add(halo);
    return { root, panes, edges, nodes, halo };
  });
  const tool = new THREE.Group(); snapshots[1].root.add(tool);
  const spindle = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.14, .14, .32, 32)), steel); spindle.position.y = .12; tool.add(spindle);
  const collar = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.09, .12, .12, 24)), metal); collar.position.y = -.1; tool.add(collar);
  const bit = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.018, .035, .18, 12)), metal); bit.position.y = -.24; tool.add(bit);
  const mark = box(tool, [.018, .22, .015], [.13, .12, .025], darkSteel);
  mark.renderOrder = 3; spindle.renderOrder = collar.renderOrder = bit.renderOrder = 3;
  tool.position.set(.25, .99, .08);
  const scanMaterial = material(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uOpacity: { value: .1 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec2 vUv;uniform float uOpacity;void main(){
      vec2 grid=abs(fract(vUv*12.)-.5);float line=1.-smoothstep(.025,.07,min(grid.x,grid.y));
      float edge=1.-smoothstep(.01,.04,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
      gl_FragColor=vec4(.12,.73,.95,uOpacity*(.16+line*.45+edge*.5));
      #include <colorspace_fragment>
    }`,
  }));
  const scan = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.43, 1.25)), scanMaterial); scan.rotation.x = -Math.PI / 2; scan.position.y = -.12; scan.renderOrder = 4; snapshots[2].root.add(scan);
  const conveyor = new THREE.Group(); scene.add(conveyor);
  const conveyorGeometry: THREE.BufferGeometry[] = [];
  const railMat = material(new THREE.MeshStandardMaterial({ color: 0x7393aa, metalness: .62, roughness: .37 }));
  const beltMat = material(new THREE.MeshStandardMaterial({ color: 0x456478, metalness: .45, roughness: .45 }));
  const connectionMat = material(new THREE.LineBasicMaterial({ color: 0x2894bc, transparent: true, opacity: .25, depthWrite: false, depthTest: false }));
  const recordedMat = material(new THREE.LineBasicMaterial({ color: 0x2894bc, transparent: true, opacity: .6, depthWrite: false, depthTest: false }));
  const historyRoot = new THREE.Group(); scene.add(historyRoot);
  const history = new THREE.Line(geometry(new THREE.BufferGeometry().setFromPoints(destinations)), connectionMat); history.frustumCulled = false; history.renderOrder = 5; historyRoot.add(history);
  const recordedHistory = new THREE.LineSegments(geometry(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 6 }, () => new THREE.Vector3()))), recordedMat); recordedHistory.frustumCulled = false; recordedHistory.renderOrder = 5; historyRoot.add(recordedHistory);
  const historyStations = destinations.map(() => {
    const mat = material(new THREE.MeshBasicMaterial({ color: 0x2894bc, transparent: true, depthWrite: false, depthTest: false, toneMapped: false }));
    const node = new THREE.Mesh(sphereGeometry, mat); node.renderOrder = 6; historyRoot.add(node);
    const leader = new THREE.Line(geometry(new THREE.BufferGeometry().setFromPoints([up.clone().multiplyScalar(.14), up.clone().multiplyScalar(-.28)])), connectionMat); leader.renderOrder = 5; historyRoot.add(leader);
    return { node, leader };
  });
  const historyPulse = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, depthWrite: false, opacity: 0, toneMapped: false })));
  historyPulse.material.depthTest = false; historyPulse.renderOrder = 6; historyRoot.add(historyPulse);
  const atmosphere = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, depthWrite: false, opacity: .1, toneMapped: false })));
  atmosphere.renderOrder = -2; scene.add(atmosphere);
  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x40596e, 1.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.8); key.position.set(-4, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fcfff, 1.8); rim.position.set(4, 2, -3); scene.add(rim);
  const dark = () => document.documentElement.dataset.theme === "dark";

  function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; canvas.dataset.running = "false"; }
  function release() {
    if (released) return; released = true;
    geometries.forEach(value => value.dispose()); conveyorGeometry.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose());
    environment?.dispose(); renderer.dispose(); renderer.forceContextLoss();
  }
  function fail() {
    if (disposed || failed) return; failed = true; stop(); cancelPreparation(); release();
    canvas.hidden = true; host.dataset.renderer = "fallback"; options.onReady(false); options.onState(lotStoryStateAt(paused ? elapsed : 14));
  }
  function render() { if (prepared && !disposed && !failed) renderer.render(scene, camera); }
  function apply() {
    const state = lotStoryStateAt(elapsed);
    snapshots.forEach((snapshot, index) => {
      const active = state.stage === index, completed = state.stage > index;
      snapshot.root.position.copy(destinations[index]); snapshot.root.visible = !mobile || active;
      snapshot.edges.forEach(({ line, glows, front }) => {
        line.material.opacity = front ? dark() ? .36 : .43 : active ? .88 : completed ? .49 : .28;
        glows.forEach((glow, layer) => { glow.material.opacity = (layer ? .14 : .055) * (active ? 1.3 : completed ? .55 : .25); });
      });
      snapshot.panes.forEach(({ mat, base }) => { mat.opacity = base; mat.emissiveIntensity = active ? .025 : .006; });
      snapshot.nodes.forEach(({ mesh, front }) => { mesh.scale.setScalar((front ? 1.2 : 1.8) / unitPixels); mesh.material.opacity = front ? .42 : active ? .95 : .38; });
      snapshot.halo.scale.setScalar((active ? 20 : 13) / unitPixels); snapshot.halo.material.opacity = active ? .25 : .06;
    });
    const working = state.phase === "process";
    tool.position.y = .99 - (working ? Math.sin(Math.PI * state.process) * .13 : 0);
    tool.rotation.y = working ? state.process * Math.PI * 12 : 0;
    scan.position.y = state.phase === "verify" && !motion.matches ? -.67 + state.inspection * 1.33 : -.12;
    scanMaterial.uniforms.uOpacity.value = state.phase === "verify" ? .18 + Math.sin(state.inspection * Math.PI) * .28 : .08;
    historyRoot.visible = !mobile;
    recordedHistory.geometry.setDrawRange(0, Math.floor(state.history) * 2);
    historyStations.forEach(({ node, leader }, index) => {
      node.position.copy(destinations[index]).addScaledVector(up, -1.29); leader.position.copy(node.position);
      node.scale.setScalar((state.stage === index ? 2.8 : 1.8) / unitPixels); node.material.opacity = index <= state.stage ? .85 : .3;
    });
    const pulseAt = Math.min(2.9999, state.history), segment = Math.floor(pulseAt), fraction = pulseAt - segment;
    historyPulse.position.lerpVectors(destinations[segment], destinations[segment + 1], fraction).addScaledVector(up, -1.29).addScaledVector(forward, .03);
    historyPulse.scale.setScalar(18 / unitPixels); historyPulse.material.opacity = fraction > .01 && fraction < .99 ? Math.sin(fraction * Math.PI) * .85 : 0;
    atmosphere.position.copy(destinations[mobile ? state.stage : 1]).addScaledVector(forward, -2); atmosphere.scale.set(mobile ? 3.4 : 8, 3.2, 1); atmosphere.material.opacity = dark() ? .1 : .025;
    const signature = `${state.phase}:${state.evidence.join("")}`;
    if (signature !== lastSignature) { lastSignature = signature; options.onState(state); }
    canvas.dataset.phase = state.phase; canvas.dataset.animationTime = state.time.toFixed(3); canvas.dataset.settled = String(state.settled); canvas.dataset.theme = dark() ? "dark" : "light";
  }
  function palette() {
    snapshots.forEach(snapshot => {
      snapshot.panes.forEach(face => { setGlass(face.mat, face.kind, dark()); face.base = face.mat.opacity * (face.kind === "front" ? .22 : .32); });
      snapshot.edges.forEach(({ line, glows, front }) => {
        line.material.color.setHex(front ? dark() ? 0x6092b3 : 0x526f87 : dark() ? 0x73ceff : 0x2894bc);
        glows.forEach(glow => glow.material.color.setHex(dark() ? 0x58bfff : 0x2894bc));
      });
    });
    railMat.color.setHex(dark() ? 0x496c83 : 0xa5bdcc); beltMat.color.setHex(dark() ? 0x203d50 : 0x8fa7b6);
    const connectionColor = dark() ? 0x36beda : 0x2894bc;
    connectionMat.color.setHex(connectionColor); recordedMat.color.setHex(connectionColor);
    historyStations.forEach(({ node }) => node.material.color.setHex(connectionColor));
    if (prepared && !failed && !disposed) { apply(); render(); }
  }
  function rebuildConveyor() {
    conveyor.clear(); conveyorGeometry.forEach(value => value.dispose()); conveyorGeometry.length = 0;
    const centre = mobile ? destinations[0].clone() : destinations[0].clone().add(destinations[3]).multiplyScalar(.5);
    const length = mobile ? 2.8 : destinations[0].distanceTo(destinations[3]) + 3;
    const vertical = new THREE.Vector3(0, 1, 0), depthAxis = new THREE.Vector3().crossVectors(right, vertical);
    const basis = new THREE.Matrix4().makeBasis(right, vertical, depthAxis); conveyor.quaternion.setFromRotationMatrix(basis);
    conveyor.position.copy(centre).addScaledVector(vertical, -.94);
    box(conveyor, [length, .15, 2.25], [0, 0, 0], beltMat);
    for (const depth of [-1.14, 1.14]) box(conveyor, [length, .12, .055], [0, .06, depth], railMat);
    const rollerGeo = new THREE.CylinderGeometry(.025, .025, 2.2, 8); conveyorGeometry.push(rollerGeo);
    for (let x = -length / 2 + .12; x < length / 2; x += .24) { const roller = new THREE.Mesh(rollerGeo, steel); roller.rotation.x = Math.PI / 2; roller.position.set(x, .09, 0); conveyor.add(roller); }
    for (const x of mobile ? [-.9, .9] : [-length * .4, 0, length * .4]) box(conveyor, [.09, .39, .12], [x, -.25, .23], railMat);
    const positions = history.geometry.getAttribute("position") as THREE.BufferAttribute;
    destinations.forEach((p, i) => positions.setXYZ(i, p.x - up.x * 1.29, p.y - up.y * 1.29, p.z - up.z * 1.29)); positions.needsUpdate = true;
    const recordedPositions = recordedHistory.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < 6; i++) {
      const point = destinations[Math.floor(i / 2) + i % 2];
      recordedPositions.setXYZ(i, point.x - up.x * 1.29, point.y - up.y * 1.29, point.z - up.z * 1.29);
    }
    recordedPositions.needsUpdate = true;
  }
  function resize() {
    if (disposed || failed) return;
    const bounds = host.getBoundingClientRect(), targets = anchors.map(anchor => anchor.getBoundingClientRect());
    if (!bounds.width || !bounds.height || targets.length !== 4) return;
    width = bounds.width; height = bounds.height; mobile = matchMedia("(max-width:767px)").matches;
    const projectedWidth = 1.65 * (Math.abs(right.x) + Math.abs(right.y) + Math.abs(right.z));
    const projectedHeight = 1.65 * (Math.abs(up.x) + Math.abs(up.y) + Math.abs(up.z));
    unitPixels = Math.min(...targets.map(target => Math.min(target.width * .88 / projectedWidth, target.height * .73 / projectedHeight)));
    camera.left = -width / unitPixels / 2; camera.right = -camera.left; camera.top = height / unitPixels / 2; camera.bottom = -camera.top; camera.updateProjectionMatrix();
    targets.forEach((target, index) => destinations[index].copy(right).multiplyScalar((target.left - bounds.left + target.width / 2 - width / 2) / unitPixels).addScaledVector(up, (height / 2 - target.top + bounds.top - target.height * .43) / unitPixels));
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(width, height, false); host.dataset.layout = mobile ? "single" : "four";
    rebuildConveyor(); if (prepared) { apply(); render(); }
  }
  function tick(now: number) {
    if (disposed || failed || !visible || document.hidden || paused) { stop(); return; }
    elapsed = Math.min(lotStoryDuration, elapsed + (previous ? Math.min(.1, (now - previous) / 1000) : 0)); previous = now; apply(); render();
    if (elapsed < lotStoryDuration) frame = requestAnimationFrame(tick); else stop();
  }
  function resume() {
    if (!prepared || disposed || failed) { stop(); return; }
    if (motion.matches || composition) { stop(); if (!paused) elapsed = lotStoryDuration; apply(); render(); return; }
    if (preview) { stop(); apply(); render(); return; }
    if (started && visible && !document.hidden && !paused && elapsed < lotStoryDuration) { if (!frame) { canvas.dataset.running = "true"; frame = requestAnimationFrame(tick); } }
    else stop();
  }
  function preference() { if (motion.matches) elapsed = lotStoryDuration; apply(); render(); resume(); }
  function lost(event: Event) { event.preventDefault(); fail(); }
  const sizing = new ResizeObserver(resize); sizing.observe(host);
  const themes = new MutationObserver(palette); themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 80;
  const view = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (factorySystemsCanStart(entry.intersectionRect.height, entry.boundingClientRect.height, entry.rootBounds?.height ?? innerHeight - headerHeight)) started = true;
    resume();
  }, { threshold: [0, .1, .2, .3, .45], rootMargin: `-${Math.ceil(headerHeight)}px 0px 0px` }); view.observe(host);
  motion.addEventListener("change", preference); document.addEventListener("visibilitychange", resume); canvas.addEventListener("webglcontextlost", lost);
  const preparing = (async () => {
    try {
      const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
      try { environment = pmrem.fromScene(room, .1); scene.environment = environment.texture; } finally { room.dispose(); pmrem.dispose(); }
      resize(); palette(); await renderer.compileAsync(scene, camera);
      if (disposed || failed) return; prepared = true; apply(); render(); host.dataset.renderer = "webgl"; canvas.dataset.ready = "true"; options.onReady(true); resume();
    } catch { if (!disposed) fail(); }
  })();
  return {
    ready: Promise.race([preparing, cancelled]),
    select(time) { if (disposed || failed) return; paused = true; elapsed = lotStoryStateAt(time).time; stop(); if (prepared) { apply(); render(); } },
    replay() { if (disposed || failed) return; elapsed = 0; paused = false; started = true; apply(); render(); resume(); },
    setPaused(value) { paused = value; resume(); },
    dispose() {
      if (disposed) return; disposed = true; stop(); cancelPreparation(); sizing.disconnect(); themes.disconnect(); view.disconnect(); motion.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", resume); canvas.removeEventListener("webglcontextlost", lost); release();
    },
  };
}
