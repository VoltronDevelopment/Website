import {createRenderQuality} from "../performance/scene-policy";
import * as THREE from "three";
import { capabilityCubeCamera, capabilityGlassVisibility as glassVisibility, capabilityEdgeWidth } from "./capability-cube-style";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createFactoryHousing, createHousingParticles } from "./factory-housing";
import { factorySystemsDuration, factorySystemsStateAt, type FactoryPhase } from "./factory-systems-timeline";
import { factorySystemsCanStart } from "./factory-systems-visibility";
import { glassFace, setGlass, nodeHaloTexture, stroke, strokeMaterial, type GlassFace } from "./lattice-materials";

type Options = { onReady: (ready: boolean) => void; onPhase: (phase: FactoryPhase) => void };
export type FactorySystemsController = {
  ready: Promise<void>; setPaused: (paused: boolean) => void; replay: () => void; dispose: () => void;
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
  const quality=createRenderQuality(canvas,1.5);
  const cards = Array.from(host.querySelectorAll<HTMLElement>(".factory-system"));
  const anchors = Array.from(host.querySelectorAll<HTMLElement>("[data-system-anchor]"));
  const images = Array.from(host.querySelectorAll<HTMLImageElement>(".factory-system-fallback img"));
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const params = new URLSearchParams(location.search);
  const previewTime = params.has("factory-time") ? Number(params.get("factory-time")) : NaN;
  const preview = Number.isFinite(previewTime);
  const composition = params.get("artwork") === "composition" || params.get("animate") === "0";
  let renderer: THREE.WebGLRenderer;
  try {
    if (params.get("renderer") === "static") throw new Error("Static illustration requested");
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    canvas.hidden = true; host.dataset.renderer = "fallback";
    return { ready: Promise.resolve(), setPaused() {}, replay() {}, dispose() {} };
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
  let elapsed = preview ? Math.max(0, Math.min(6, previewTime)) : motion.matches || composition ? 6 : 0;
  let frame = 0, previous = 0, lastPhase: FactoryPhase | undefined, mobile = false, unitPixels = 90;
  let width = 0, height = 0;
  const dark = () => document.documentElement.dataset.theme === "dark";
  const source = new THREE.Vector3(), destinations = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const scan = { value: -1.5 }, sweep = { value: -1.5 };
  const metal = material(new THREE.MeshPhysicalMaterial({
    color: 0xd2dce4, metalness: .82, roughness: .28, clearcoat: .25,
    clearcoatRoughness: .24, envMapIntensity: 1.15,
  }));
  metal.onBeforeCompile = shader => {
    shader.uniforms.uFactoryScan = scan; shader.uniforms.uFactorySweep = sweep;
    shader.vertexShader = "varying float vFactoryScan;\n" + shader.vertexShader.replace(
      "#include <begin_vertex>", "#include <begin_vertex>\nvFactoryScan=dot(position,vec3(.65,.28,.2));",
    );
    shader.fragmentShader = "varying float vFactoryScan; uniform float uFactoryScan; uniform float uFactorySweep;\n" + shader.fragmentShader.replace(
      "#include <color_fragment>", `#include <color_fragment>
        if(vFactoryScan<uFactoryScan) discard;
        float scanEdge=exp(-abs(vFactoryScan-uFactoryScan)*45.);
        float lightSweep=exp(-pow((vFactoryScan-uFactorySweep)*3.2,2.));
        diffuseColor.rgb+=vec3(.17,.28,.36)*lightSweep+vec3(.08,.32,.48)*scanEdge;`,
    );
  };
  metal.customProgramCacheKey = () => "factory-housing-dissolve-v1";
  const housingGeometry = geometry(createFactoryHousing());
  const housing = new THREE.Mesh(housingGeometry, metal); scene.add(housing);
  const particleGeometry = geometry(createHousingParticles(housingGeometry, 1400));
  const particleUniforms = {
    uScan: scan, uSeparate: { value: 0 }, uOpacity: { value: 1 }, uGhost: { value: 0 }, uSourceScale: { value: 1 },
    uPointSize: { value: 8 }, uGlow: { value: 0 }, uSource: { value: source },
    uDest0: { value: destinations[0] }, uDest1: { value: destinations[1] }, uDest2: { value: destinations[2] },
    uRight: { value: right }, uUp: { value: up }, uForward: { value: forward },
    uColor: { value: new THREE.Color(0x3284d7) },
  };
  const particleMaterial = material(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: particleUniforms,
    vertexShader: `attribute vec3 aTarget; attribute float aGroup; attribute float aSeed;
      uniform vec3 uSource; uniform vec3 uDest0; uniform vec3 uDest1; uniform vec3 uDest2;
      uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uForward;
      uniform float uSeparate; uniform float uScan; uniform float uOpacity; uniform float uGhost; uniform float uPointSize; uniform float uSourceScale;
      varying float vAlpha; varying float vSeed;
      void main(){
        vec3 destination=aGroup<.5?uDest0:(aGroup<1.5?uDest1:uDest2);
        vec3 target=destination+uRight*aTarget.x+uUp*aTarget.y+uForward*aTarget.z;
        float progress=uSeparate*(1.-uGhost);
        vec3 p=mix(position*uSourceScale+uSource,target,progress);
        p+=uUp*sin(progress*3.14159265)*(.22+aSeed*.28);
        float scanAt=dot(position,vec3(.65,.28,.2));
        vAlpha=(1.-smoothstep(uScan-.035,uScan+.035,scanAt))*uOpacity;
        vSeed=aSeed;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        gl_PointSize=uPointSize*(.72+aSeed*.48);
      }`,
    fragmentShader: `uniform vec3 uColor; uniform float uGlow; uniform float uSeparate; varying float vAlpha; varying float vSeed;
      void main(){
        vec2 p=gl_PointCoord-.5;
        float angle=sin(uSeparate*3.14159265)*(vSeed-.5)*.7;
        p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
        float hex=max(abs(p.x)/.28,(abs(p.x)*.57735+abs(p.y))/.3233);
        float core=1.-smoothstep(.9,1.,hex);
        float halo=exp(-dot(p,p)*22.)*.32*uGlow;
        float top=step(p.y,-abs(p.x)*.57735);
        vec3 face=mix(uColor*.68,uColor,step(0.,p.x));
        face=mix(face,mix(uColor,vec3(.87,.96,1.),.68),top);
        float alpha=max(core,halo)*vAlpha*(.72+vSeed*.28);
        if(alpha<.015) discard;
        gl_FragColor=vec4(mix(uColor,face,core),alpha);
        #include <colorspace_fragment>
      }`,
  }));
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.frustumCulled = false; particles.renderOrder = 3; scene.add(particles);
  const ghostMaterial = material(particleMaterial.clone());
  ghostMaterial.uniforms.uGhost.value = 1;
  const ghost = new THREE.Points(particleGeometry, ghostMaterial);
  ghost.frustumCulled = false; ghost.renderOrder = 2; scene.add(ghost);

  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x40596e, 2));
  const key = new THREE.DirectionalLight(0xffffff, 3.1); key.position.set(-4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8dcfff, 2.2); rim.position.set(4, 2, -3); scene.add(rim);
  const haloTexture = nodeHaloTexture(); textures.add(haloTexture);
  const nodeGeometry = geometry(new THREE.SphereGeometry(1, 8, 6));
  const half = .825;
  const corners = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(i & 1 ? half : -half, i & 2 ? half : -half, i & 4 ? half : -half));
  const pairs = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const cubes: Cube[] = destinations.map(() => {
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
      const mat = material(glassFace(spec.kind, dark()));
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
    geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose());
    environment?.dispose(); renderer.dispose(); renderer.forceContextLoss();
  }
  function fallback() {
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
    scan.value = THREE.MathUtils.lerp(-1.5, 1.5, state.dissolve);
    sweep.value = THREE.MathUtils.lerp(-1.2, 1.25, Math.min(1, state.time / 1.2));
    housing.visible = state.dissolve < 1; housing.position.copy(source); housing.scale.setScalar(mobile ? 1.45 : 1);
    key.position.x = -4 + Math.min(1, state.time / 1.2) * 5;
    particles.visible = state.time >= 1.2 && state.particles > 0;
    particleUniforms.uSeparate.value = state.separate;
    particleUniforms.uGlow.value = .7 + Math.sin(Math.PI * Math.min(1, state.dissolve)) * .8 + Math.sin(Math.PI * state.separate) * .65;
    particleUniforms.uOpacity.value = state.particles;
    ghost.visible = state.ghost > 0;
    ghostMaterial.uniforms.uSource.value.copy(source);
    ghostMaterial.uniforms.uScan.value = scan.value;
    ghostMaterial.uniforms.uOpacity.value = state.ghost * .14;
    shadow.position.copy(source).addScaledVector(up, mobile ? -1.3 : -.91).addScaledVector(forward, -.9);
    shadow.material.opacity = (dark() ? .38 : .6) * (1 - state.dissolve);
    atmosphere.position.copy(source).addScaledVector(forward, -2);
    atmosphere.scale.set(mobile ? 3.6 : 6.2, 3.7, 1);
    atmosphere.material.opacity = dark() ? .12 : .045;
    cubes.forEach((cube, index) => {
      const reveal = state.cubes[index], asset = state.artworks[index];
      cube.root.visible = reveal > 0; cube.root.position.copy(destinations[index]);
      cube.faces.forEach(face => {
        face.material.opacity = face.base * reveal;
        face.material.emissiveIntensity = .012 + Math.sin(state.pulse * Math.PI) * .055;
      });
      cube.edges.forEach((edge, edgeIndex) => {
        const progress = Math.max(0, Math.min(1, reveal * 1.35 - edgeIndex / 32));
        const end = edge.line.geometry.getAttribute("instanceEnd") as THREE.InterleavedBufferAttribute;
        end.setXYZ(0, THREE.MathUtils.lerp(edge.from.x, edge.to.x, progress), THREE.MathUtils.lerp(edge.from.y, edge.to.y, progress), THREE.MathUtils.lerp(edge.from.z, edge.to.z, progress));
        end.data.needsUpdate = true;
        edge.line.visible = progress > 0;
        edge.line.material.opacity = (edge.front ? dark() ? .38 : .42 : dark() ? .78 : .65) * reveal;
        edge.glows.forEach((glow, index) => {
          glow.visible = progress > 0;
          glow.material.opacity = (index === 0 ? dark() ? .07 : .035 : dark() ? .15 : .08) * reveal;
        });
      });
      cube.nodes.forEach(({ mesh, front }) => {
        mesh.scale.setScalar((front ? 1.2 : 1.6) / unitPixels);
        mesh.material.opacity = (front ? .42 : .85) * reveal;
      });
      cube.halo.scale.setScalar(17 / unitPixels);
      cube.halo.material.opacity = ((dark() ? .13 : .07) + Math.sin(state.pulse * Math.PI) * .18) * reveal;
      if (cube.artwork) { cube.artwork.visible = asset > 0; cube.artwork.material.opacity = asset; }
      cards[index]?.style.setProperty("--label-reveal", String(state.labels[index]));
    });
    connections.forEach(({ line, pulse, from, to }) => {
      const attribute = line.geometry.getAttribute("position") as THREE.BufferAttribute;
      attribute.setXYZ(0, from.x, from.y, from.z);
      attribute.setXYZ(1, THREE.MathUtils.lerp(from.x, to.x, state.connections), THREE.MathUtils.lerp(from.y, to.y, state.connections), THREE.MathUtils.lerp(from.z, to.z, state.connections));
      attribute.needsUpdate = true; line.computeLineDistances();
      line.material.opacity = (dark() ? .6 : .5) * state.connections;
      line.visible = state.connections > 0;
      pulse.position.lerpVectors(from, to, state.pulse);
      pulse.material.opacity = state.connections * Math.sin(state.pulse * Math.PI) * .85;
    });
    canvas.dataset.phase = state.phase; canvas.dataset.animationTime = state.time.toFixed(3);
    canvas.dataset.settled = String(state.settled); canvas.dataset.theme = dark() ? "dark" : "light";
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
    particleUniforms.uPointSize.value = (mobile ? 6.8 : 8.2) * density;
    particleUniforms.uSourceScale.value = mobile ? 1.45 : 1;
    ghostMaterial.uniforms.uSourceScale.value = particleUniforms.uSourceScale.value;
    ghostMaterial.uniforms.uPointSize.value = particleUniforms.uPointSize.value;
    host.dataset.layout = mobile ? "vertical" : "horizontal";
    if (prepared) { apply(); render(); }
  }
  function palette() {
    if (disposed || failed) return;
    particleUniforms.uColor.value.setHex(dark() ? 0x78b0ff : 0x246bd4);
    ghostMaterial.uniforms.uColor.value.copy(particleUniforms.uColor.value);
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
    if (!prepared || disposed || failed) return;
    if (motion.matches || composition) { elapsed = 6; apply(); render(); return; }
    if (preview) { apply(); render(); return; }
    if (started && visible && !document.hidden && !paused && elapsed < 6) {
      canvas.dataset.running = "true"; frame = requestAnimationFrame(tick);
    }
  }
  function visibility() { resume(); }
  function preference() { if (motion.matches) elapsed = 6; resume(); }
  function contextLost(event: Event) { event.preventDefault(); fallback(); }
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

  async function loadArtwork(image: HTMLImageElement, index: number) {
    const texture = await new THREE.TextureLoader().loadAsync(image.currentSrc || image.getAttribute?.("src") || image.dataset?.sceneSrc || image.src);
    if (disposed || failed) { texture.dispose(); return; }
    textures.add(texture); texture.colorSpace = THREE.SRGBColorSpace;
    const scratch = document.createElement("canvas"); scratch.width = scratch.height = 256;
    const context = scratch.getContext("2d", { willReadFrequently: true })!;
    context.drawImage(texture.image, 0, 0, 256, 256);
    const pixels = context.getImageData(0, 0, 256, 256).data;
    let minX = 256, minY = 256, maxX = 0, maxY = 0;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      if (pixels[(y * 256 + x) * 4 + 3] > 16) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    }
    const visibleWidth = Math.max(1, maxX - minX + 1), visibleHeight = Math.max(1, maxY - minY + 1);
    texture.repeat.set(visibleWidth / 256, visibleHeight / 256); texture.offset.set(minX / 256, 1 - (maxY + 1) / 256);
    const aspect = visibleWidth / visibleHeight;
    const mat = material(new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0, alphaTest: .015, depthWrite: false, toneMapped: false }));
    // Preserve alpha and the source object's lighting while bringing all three assets
    // into the hero's silver / cobalt / ice-blue material family.
    mat.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float value=clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)),0.,1.);
        vec3 blue=mix(vec3(.025,.10,.24),vec3(.16,.43,.78),smoothstep(.0,.48,value));
        diffuseColor.rgb=mix(blue,vec3(.83,.94,1.),smoothstep(.38,1.,value));`);
    };
    mat.customProgramCacheKey = () => 'factory-hero-artwork-v1';
    const artwork = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.68 * Math.min(aspect, 1.08), 1.68 / Math.max(aspect / 1.08, 1))), mat);
    artwork.quaternion.copy(camera.quaternion); artwork.renderOrder = 3; cubes[index].root.add(artwork); cubes[index].artwork = artwork;
  }
  const preparing = (async () => {
    try {
      const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
      try { environment = pmrem.fromScene(room, .1); scene.environment = environment.texture; }
      finally { room.dispose(); pmrem.dispose(); }
      await Promise.all(images.map(loadArtwork));
      if (disposed || failed) return;
      resize(); palette();
      // Prepare every material before the reveal, including those hidden at its first frame.
      await renderer.compileAsync(scene, camera);
      if (disposed || failed) return;
      prepared = true; canvas.hidden = false; apply(); render();
      host.dataset.renderer = "webgl"; canvas.dataset.ready = "true";
      options.onReady(true); resume();
    } catch { if (!disposed) fallback(); }
  })();
  const ready = Promise.race([preparing, cancelled]);
  return {
    ready,
    setPaused(value) { paused = value; resume(); },
    replay() { if (disposed || failed) return; elapsed = 0; paused = false; started = true; apply(); render(); resume(); },
    dispose() {
      if (disposed) return;
      disposed = true; cancelPreparation(); stop(); sizing.disconnect(); themes.disconnect(); view.disconnect();
      motion.removeEventListener("change", preference); document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      release();
    },
  };
}
