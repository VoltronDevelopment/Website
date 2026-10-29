import {createSceneHandoff} from "../performance/scene-handoff";
import {sceneOpeningTime} from "@/lib/scene-continuity";
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {setGlass} from "../home/lattice-materials";
import {intelligenceHeroDuration, intelligenceHeroState} from "./intelligence-hero-timeline";
import {addArtworkSoftboxes, createArtworkEnvironment} from "./artwork-studio";
import {observeArtworkTuning, artworkDefaults} from "./artwork-tuning";
import {createPortraitScans} from "./portrait-scans";
import {bindHeadCoverage, createProjectorCube, createSquareBeam, hologramCubeSize, hologramHeadGap, hologramHeadHeight, hologramRestYaw, orientHeadGeometry, sampleHead, createGatherPoints} from "./intelligence-hologram";

export type IntelligenceHeroController = { toggle(): void; replay(): void; scrub(seconds: number): void; dispose(): void };
type Mode = "static" | "playing" | "paused" | "settled";

export async function mountIntelligenceHero(canvas: HTMLCanvasElement, host: HTMLDivElement, onMode: (mode: Mode) => void): Promise<IntelligenceHeroController> {
  const handoff = createSceneHandoff(host, canvas);
  const gltf = await new GLTFLoader().loadAsync("/human_head/scene.gltf");
  gltf.scene.updateMatrixWorld(true);
  let source: THREE.BufferGeometry | undefined;
  const borrowed: THREE.Material[] = [];
  gltf.scene.traverse(object => {
    if (!(object instanceof THREE.Mesh) || source) return;
    const cloned=object.geometry.clone();
    cloned.applyMatrix4(object.matrixWorld);
    source=cloned;
    borrowed.push(...(Array.isArray(object.material) ? object.material : [object.material]));
  });
  borrowed.forEach(material => material.dispose());
  if (!source) throw new Error("Human head mesh missing");
  const geometry = orientHeadGeometry(source);
  source.dispose();
  const height = geometry.boundingBox?.max.y || 1;
  const mobile = matchMedia("(max-width:767px)").matches;
  const headCount = mobile ? 5000 : 12000;
  const samples = sampleHead(geometry, headCount);
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: "low-power",preserveDrawingBuffer:new URLSearchParams(location.search).has("scene-capture")});
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, new URLSearchParams(location.search).get('poster-dpr')==='2'?2:1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const environment = createArtworkEnvironment(renderer);
  scene.environment = environment.texture;
  addArtworkSoftboxes(scene);
  scene.add(new THREE.HemisphereLight(0xf4fbff, 0x54718b, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-3.2, 6.4, 4.6);
  scene.add(key);
  const track = <T extends {dispose(): void}>(value: T) => value;
  const projector = createProjectorCube(track);
  scene.add(projector.group);
  const head = new THREE.Group();
  head.scale.setScalar(hologramHeadHeight / height);
  head.position.y = hologramCubeSize + hologramHeadGap;
  const headForm = {value: 0},hologramClock={value:0};
  const headMaterial = new THREE.MeshPhysicalMaterial({color: 0x8ca9bd, metalness: 0.27, roughness: 0.46, clearcoat: 0.18, clearcoatRoughness: 0.42, envMapIntensity: 0.9, side: THREE.DoubleSide});
  bindHeadCoverage(headMaterial, headForm, height,hologramClock);
  const headMesh = new THREE.Mesh(geometry, headMaterial);
  headMesh.renderOrder = 2;
  head.add(headMesh);
  const gather = createGatherPoints(samples.positions, samples.seeds, height,true);
  head.add(gather.points);
  scene.add(head);
  const beamTop = head.position.y + hologramHeadHeight + 0.14;
  const beam = createSquareBeam(track, beamTop, 1.05);
  scene.add(beam.group);
  const width = (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x) * head.scale.x;
  const depth = (geometry.boundingBox!.max.z - geometry.boundingBox!.min.z) * head.scale.z;
  const scans = createPortraitScans(Math.max(width, 0.8) * 1.15, Math.max(depth, 0.8) * 1.15);
  const scanSpan = {min: head.position.y + 0.05, max: head.position.y + hologramHeadHeight - 0.04};
  scene.add(scans.group);
  const shadow = contactShadow();
  scene.add(shadow);
  host.dataset.networkNodes = "0";
  const lookY = 1.62;
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
  camera.position.set(6.2, lookY + 2.15, 7.4);
  camera.lookAt(0, lookY, 0);
  const query = new URLSearchParams(location.search);
  const review = query.get("intelligence-time");
  const reviewView = query.get("intelligence-view");
  let preparing=true,disposed = false, frame = 0, visible = false, paused = false, time = sceneOpeningTime.intelligence as number, last = 0;
  let frozen: number | null = null,ambient=0,lastAmbientFrame=0;
  let tuning = {...artworkDefaults};
  if (reviewView && review === null) { frozen = intelligenceHeroDuration; time = frozen; }
  if (review !== null && Number.isFinite(Number(review))) { frozen = Math.max(0, Math.min(intelligenceHeroDuration, Number(review))); time = frozen; }
  function draw() {
    if (preparing||disposed) return;
    const state = intelligenceHeroState(time);
    const dark = document.documentElement.dataset.theme === "dark";
    const diagnostic = reviewView === "solid" || reviewView === "particles";
    const cubeForm = diagnostic ? 1 : state.cube;
    const formed = reviewView === "particles" ? Math.min(0.88, state.head) : reviewView === "solid" ? 1 : state.head;
    const beamAmount = diagnostic ? 1 : state.beam;
    head.rotation.y = hologramRestYaw + (diagnostic ? 0 : state.yaw);
    headForm.value = formed;
    headMesh.visible = reviewView !== "particles" && formed > 0.02;
    hologramClock.value=time+ambient;gather.update(formed, dark, renderer.getPixelRatio() * tuning.particleScale,time+ambient);
    projector.gather.update(cubeForm, dark, renderer.getPixelRatio() * tuning.particleScale);
    projector.faces.forEach(({material}) => { material.opacity = (material.userData.restOpacity as number) * cubeForm; });
    (projector.emitter.material as THREE.MeshBasicMaterial).opacity = beamAmount * 0.9;
    projector.emitter.visible = beamAmount > 0.02;
    beam.set(beamAmount * tuning.glow, dark,time+ambient,camera);
    scans.update(diagnostic ? 0 : time, dark, scanSpan);
    shadow.visible = cubeForm > 0.2;
    (shadow.material as THREE.MeshBasicMaterial).opacity = cubeForm * (dark ? 0.42 : 0.28);
    canvas.dataset.scanHorizontal = state.scans.horizontal.strength.toFixed(4);
    canvas.dataset.scanVertical = "0.0000";
    canvas.dataset.formationParticles = String(headCount);
    canvas.dataset.particleMotion = "surface-particles";
    canvas.dataset.hologram = "soft-volume";canvas.dataset.ambientParticles="360";
    canvas.dataset.beam = beamAmount.toFixed(4);
    canvas.dataset.yaw = (diagnostic ? 0 : state.yaw).toFixed(4);
    host.dataset.phase = state.phase;
    host.parentElement?.style.setProperty("--scene-response", beamAmount.toFixed(4));
    renderer.render(scene, camera);
    canvas.dataset.animationTime = time.toFixed(3);
    canvas.dataset.theme = document.documentElement.dataset.theme || "light";
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || paused || frozen !== null) return;
    if(time>=intelligenceHeroDuration&&now-lastAmbientFrame<40){frame=requestAnimationFrame(tick);return;}
    lastAmbientFrame=now;
    const wasSettled=time>=intelligenceHeroDuration;
    const delta = last ? (now - last) / 1000 : 0;
    last = now;
    if(time>=intelligenceHeroDuration)ambient+=Math.min(.08,delta);
    time = Math.min(intelligenceHeroDuration, time + Math.min(.08,delta));
    draw();
    if(!wasSettled&&time>=intelligenceHeroDuration)onMode("playing");
    frame=requestAnimationFrame(tick);
  }
  function schedule() {
    last = 0;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && host.dataset.sceneState === "live" && !disposed && visible && !document.hidden && !paused && frozen === null && !frame) {
      host.dataset.running = "true";
      frame = requestAnimationFrame(tick);
    }
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; host.dataset.running = "false"; }
  function size() {
    const {width: viewWidth, height: viewHeight} = host.getBoundingClientRect();
    if (!viewWidth || !viewHeight) return;
    renderer.setSize(viewWidth, viewHeight, false);
    camera.updateMatrixWorld();
    const view = new THREE.Matrix4().copy(camera.matrixWorld).invert();
    const point = new THREE.Vector3();
    let maxX = 0.1, maxY = 0.1;
    for (const y of [0, beamTop]) {
      const half = y === 0 ? 0.78 : 1.12;
      for (const x of [-half, half]) for (const z of [-half, half]) {
        point.set(x, y, z).applyMatrix4(view);
        maxX = Math.max(maxX, Math.abs(point.x));
        maxY = Math.max(maxY, Math.abs(point.y));
      }
    }
    const aspect = viewWidth / viewHeight;
    host.dataset.fitWidth=String(maxX*2*1.12);host.dataset.fitHeight=String(maxY*2*1.12);
    const fit = Math.max(maxY, maxX / aspect) * 1.12;
    camera.top = fit;
    camera.bottom = -fit;
    camera.left = -fit * aspect;
    camera.right = fit * aspect;
    camera.updateProjectionMatrix();
    draw();
  }
  function theme() {
    const dark = document.documentElement.dataset.theme === "dark";
    projector.faces.forEach(({material, kind}) => {
      setGlass(material, kind, dark);
      material.opacity *= tuning.glassOpacity;
      material.roughness *= tuning.roughness;
      material.envMapIntensity *= tuning.reflection;
      material.userData.restOpacity = material.opacity;
    });
    headMaterial.color.setHex(dark ? 0x8dafc8 : 0x8ca9bd);
    headMaterial.envMapIntensity = (dark ? 0.55 : 0.65) * tuning.reflection;
    draw();
  }
  function visibility() { if (document.hidden) stop(); else schedule(); }
  function lost(event: Event) { event.preventDefault(); stop(); handoff.fallback(); host.dataset.live = "false"; onMode("static"); }
  function restored() {
    theme();
    size();
    void handoff.reveal().then(() => {
      if (disposed) return;
      host.dataset.live = "true";
      onMode(paused ? "paused" : "playing");
      schedule();
    });
  }
  const resize = new ResizeObserver(size);
  resize.observe(host);
  const themes = new MutationObserver(theme);
  themes.observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
  const view = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    if (visible) schedule(); else stop();
  }, {threshold: [0, 0.25]});
  view.observe(host);
  const studio = observeArtworkTuning("intelligence", value => { tuning = value; theme(); });
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", lost);
  canvas.addEventListener("webglcontextrestored", restored);
  theme();
  size();
  await renderer.compileAsync(scene,camera);preparing=false;draw();
  await handoff.reveal();
  if (disposed) return {toggle() {}, replay() {}, scrub() {}, dispose() {}};
  host.dataset.live = "true";
  onMode(frozen !== null ? "settled" : "playing");
  schedule();
  return {
    scrub(seconds) { stop(); frozen = THREE.MathUtils.clamp(Number.isFinite(seconds) ? seconds : 0, 0, intelligenceHeroDuration); time = frozen; draw(); onMode("settled"); },
    replay() { time = 0; ambient=0; frozen = null; paused = false; onMode("playing"); draw(); schedule(); },
    toggle() {
      if (frozen !== null) { frozen = null; paused = false; }
      else paused = !paused;
      onMode(paused ? "paused" : "playing");
      if (paused) stop(); else schedule();
    },
    dispose() {
      disposed = true;
      studio.dispose();
      handoff.dispose();
      stop();
      resize.disconnect();
      themes.disconnect();
      view.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      host.dataset.live = "false";
      gather.dispose();
      projector.gather.dispose();
      scene.traverse(object => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        if (!mesh.material) return;
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(item => {
          if ("map" in item && item.map instanceof THREE.Texture) item.map.dispose();
          item.dispose();
        });
      });
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

function contactShadow() {
  const stamp = document.createElement("canvas");
  stamp.width = stamp.height = 64;
  const context = stamp.getContext("2d");
  if (context) {
    const gradient=context.createRadialGradient(32,32,2,32,32,32);gradient.addColorStop(0,'rgba(16,38,60,.55)');gradient.addColorStop(.4,'rgba(16,38,60,.25)');gradient.addColorStop(1,'rgba(16,38,60,0)');context.fillStyle=gradient;context.fillRect(0,0,64,64);
  }
  const material = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(stamp), transparent: true, depthWrite: false, toneMapped: false});
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.55), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.012;
  mesh.renderOrder = 0;
  return mesh;
}
