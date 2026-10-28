import {identityMark, identityMark2x} from '@/lib/identity-assets';
import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {addArtworkSoftboxes} from "../brand/artwork-studio";
import type {HeroController, SharedHeroResources} from "./hero-renderer";
import {sizeHeroSurface} from "./hero-surface";
import {createRenderQuality, yieldToBrowser} from "../performance/scene-policy";
import {homeCubeDuration, homeCubeHold, homeCubeMoves, homeCubeStep, homeCubeTurn, type CubeMove} from "./home-cube-timeline";
import {glassFace,setGlass,type GlassFace} from "./lattice-materials";
import type {PaneRole} from "./home-glass";

type Options = {immediate?: boolean; deferStart?: boolean; shared?: SharedHeroResources; static?: boolean; sharp?: boolean};
type Cubie = {mesh: THREE.Group; sx: number; sy: number; sz: number; x: number; y: number; z: number; q: THREE.Quaternion};

const TILE = 900;
const PIECE = 512;
const CUBIE = 0.92;
const SPACING = 0.96;
const STICKER = 0.9;
const phrases = ["Human ingenuity", "Shared progress", "Connected intelligence"] as const;
/** 0 while the pieces are apart, 1 when the solved faces read as single tiles. */
function joined(now: number) {
  if (now < homeCubeHold) return 1 - ease((now - homeCubeHold + 0.3) / 0.3);
  return ease((now - homeCubeDuration) / 0.55);
}

function ease(v: number) {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function mountHomeCube(canvas: HTMLCanvasElement, host: HTMLDivElement, hero: HTMLElement, options: Options = {}): HeroController {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(-0.62, 1.7, 7.9);
  camera.lookAt(0, 0, 0);
  const quality = createRenderQuality(canvas, 2);
  const tileSize = options.sharp ? PIECE * 3 : TILE;
  const px = (value: number) => Math.round(value * tileSize / TILE);
  const query = new URLSearchParams(location.search);
  const review = query.get("hero-time");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const resources = new Set<{dispose(): void}>();
  const track = <T extends {dispose(): void}>(value: T) => {resources.add(value); return value;};
  let renderer: THREE.WebGLRenderer | undefined;
  let disposed = false, started = !options.deferStart, paused = review !== null, frozen = review !== null, visible = true, lost = false, frame = 0, last = 0, frames = 0;
  let time = review === null ? (options.immediate ? homeCubeDuration : 0) : Math.max(0, Number(review) || 0);
  const cube = new THREE.Group();
  scene.add(cube);
  const cubies: Cubie[] = [];
  const stickers: THREE.MeshBasicMaterial[] = [];
  const faceKinds:GlassFace[]=['side','side','top','bottom','front','rear'];
  const faceRoles:PaneRole[]=['near','recess','crown','base','clear','recess'];
  const glasses=faceKinds.map((kind,i)=>{const m=track(glassFace(kind,false,true,'home',faceRoles[i]));m.forceSinglePass=true;return m;});
  let logoImage=options.shared?.texture.image as CanvasImageSource|undefined;
  const bodyGeometry = track(new RoundedBoxGeometry(CUBIE, CUBIE, CUBIE, 3, 0.03));
  const stickerGeometry = track(new THREE.PlaneGeometry(STICKER, STICKER));
  const stickerMeshes: THREE.Mesh[] = [];
  const canvases = {
    logo: document.createElement("canvas"),
    ingenuity: document.createElement("canvas"),
    progress: document.createElement("canvas"),
    intelligence: document.createElement("canvas"),
  };
  for (const node of Object.values(canvases)) {node.width = node.height = tileSize;}
  const atlas = options.sharp ? null : {
    logo: track(new THREE.CanvasTexture(canvases.logo)),
    ingenuity: track(new THREE.CanvasTexture(canvases.ingenuity)),
    progress: track(new THREE.CanvasTexture(canvases.progress)),
    intelligence: track(new THREE.CanvasTexture(canvases.intelligence)),
  };
  if (atlas) for (const map of Object.values(atlas)) {map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;}
  const pieces: {canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; master: HTMLCanvasElement; x: number; y: number}[] = [];
  function pieceTexture(master: HTMLCanvasElement, col: number, row: number) {
    const piece = document.createElement("canvas");
    piece.width = piece.height = PIECE;
    const texture = track(new THREE.CanvasTexture(piece));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    pieces.push({canvas: piece, texture, master, x: col * PIECE, y: row * PIECE});
    return texture;
  }

  const faces: {id: keyof typeof canvases; axis: "x" | "z"; side: number; rotY: number; col: (x: number, z: number) => number}[] = [
    {id: "logo", axis: "z", side: 1, rotY: 0, col: x => x + 1},
    {id: "ingenuity", axis: "x", side: 1, rotY: Math.PI / 2, col: (_, z) => 1 - z},
    {id: "progress", axis: "z", side: -1, rotY: Math.PI, col: x => 1 - x},
    {id: "intelligence", axis: "x", side: -1, rotY: -Math.PI / 2, col: (_, z) => z + 1},
  ];

  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(bodyGeometry, glasses);
    body.renderOrder = 1;
    group.add(body);
    for (const face of faces) {
      const onFace = face.axis === "x" ? x === face.side : z === face.side;
      if (!onFace) continue;
      const map = options.sharp ? pieceTexture(canvases[face.id], face.col(x, z), 1 - y) : track(atlas![face.id].clone());
      if (!options.sharp) {
        map.repeat.set(1 / 3, 1 / 3);
        map.offset.set(face.col(x, z) / 3, y / 3 + 1 / 3);
        map.colorSpace = THREE.SRGBColorSpace;
        map.needsUpdate = true;
      }
      const material = track(new THREE.MeshBasicMaterial({map, transparent: true, depthWrite: true, toneMapped: false}));
      stickers.push(material);
      const sticker = new THREE.Mesh(stickerGeometry, material);
      sticker.rotation.y = face.rotY;
      sticker.position.set(face.axis === "x" ? face.side : 0, 0, face.axis === "z" ? face.side : 0).multiplyScalar(CUBIE / 2 + 0.012);
      sticker.renderOrder = 2;
      group.add(sticker);
      stickerMeshes.push(sticker);
    }
    group.position.set(x * SPACING, y * SPACING, z * SPACING);
    cube.add(group);
    cubies.push({mesh: group, sx: x, sy: y, sz: z, x, y, z, q: new THREE.Quaternion()});
  }

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d")!;
  const shadowGradient = shadowContext.createRadialGradient(64, 64, 8, 64, 64, 64);
  shadowGradient.addColorStop(0, "rgba(18,42,66,.28)");
  shadowGradient.addColorStop(1, "rgba(18,42,66,0)");
  shadowContext.fillStyle = shadowGradient;
  shadowContext.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(3.4, 2.4)), track(new THREE.MeshBasicMaterial({map: track(new THREE.CanvasTexture(shadowCanvas)), transparent: true, depthWrite: false, toneMapped: false})));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.62;
  scene.add(shadow);
  scene.add(new THREE.HemisphereLight(0xe7f4fc, 0x24384c, 0.9));
  addArtworkSoftboxes(scene, new THREE.Vector3());

  const axis = new THREE.Vector3();
  const turn = new THREE.Quaternion();
  const point = new THREE.Vector3();
  function applyMove(move: CubeMove, angle: number, snap: boolean) {
    axis.set(move.axis === "x" ? 1 : 0, move.axis === "y" ? 1 : 0, move.axis === "z" ? 1 : 0);
    turn.setFromAxisAngle(axis, angle);
    const layer = cubies.filter(cubie => Math.round(cubie[move.axis]) === move.layer);
    for (const cubie of layer) {
      point.set(cubie.x, cubie.y, cubie.z).applyQuaternion(turn);
      cubie.x = point.x; cubie.y = point.y; cubie.z = point.z;
      cubie.q.premultiply(turn);
      if (snap) {cubie.x = Math.round(cubie.x); cubie.y = Math.round(cubie.y); cubie.z = Math.round(cubie.z);}
    }
  }
  function pose(now: number) {
    for (const cubie of cubies) {cubie.x = cubie.sx; cubie.y = cubie.sy; cubie.z = cubie.sz; cubie.q.identity();}
    const motion = now - homeCubeHold;
    if (motion > 0) for (let index = 0; index < homeCubeMoves.length; index++) {
      const start = index * homeCubeStep;
      if (motion < start) break;
      const local = motion - start;
      const done = local >= homeCubeTurn;
      applyMove(homeCubeMoves[index], (done ? 1 : ease(local / homeCubeTurn)) * homeCubeMoves[index].dir * Math.PI / 2, done);
      if (!done) break;
    }
    const join = joined(now);
    const spacing = SPACING + (CUBIE - SPACING) * join;
    const reach = STICKER + (spacing * 1.004 - STICKER) * join;
    for (const cubie of cubies) {cubie.mesh.position.set(cubie.x * spacing, cubie.y * spacing, cubie.z * spacing); cubie.mesh.quaternion.copy(cubie.q);}
    for (const mesh of stickerMeshes) mesh.scale.set(reach / STICKER, reach / STICKER, 1);
    canvas.dataset.joined = join.toFixed(2);
    const spin = now > homeCubeDuration ? (now - homeCubeDuration) * 0.28 : 0;
    cube.rotation.set(0, spin, 0);
  }

  function paint() {
    const css = getComputedStyle(document.documentElement);
    const dark = document.documentElement.dataset.theme === "dark";
    const blue = css.getPropertyValue("--blue").trim() || (dark ? "#78b0ff" : "#246bd4");
    const tile = css.getPropertyValue("--canvas").trim() || (dark ? "#101820" : "#f4f8fb");
    const line = dark ? "rgba(120,176,255,.4)" : "rgba(36,107,212,.3)";
    const image = logoImage;
    const drawTile = (canvasNode: HTMLCanvasElement, mark: (ctx: CanvasRenderingContext2D) => void) => {
      const ctx = canvasNode.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, tileSize, tileSize);
      rounded(ctx, px(8), px(8), tileSize - px(16), tileSize - px(16), px(48));
      ctx.fillStyle = tile;
      ctx.fill();
      ctx.lineWidth = px(8);
      ctx.strokeStyle = line;
      ctx.stroke();
      mark(ctx);
    };
    drawTile(canvases.logo, ctx => {if (image && "width" in image && typeof image.width === "number" && image.width > 0) ctx.drawImage(image, px(90), px(90), tileSize - px(180), tileSize - px(180));});
    phrases.forEach((phrase, index) => {
      const names = ["ingenuity", "progress", "intelligence"] as const;
      drawTile(canvases[names[index]], ctx => {
        ctx.fillStyle = blue;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = phrase.split(" ");
        let size = px(92);
        ctx.font = `500 ${size}px Montserrat, Arial, sans-serif`;
        while (size > px(46) && lines.some(lineText => ctx.measureText(lineText).width > tileSize * 0.7)) {size -= px(4); ctx.font = `500 ${size}px Montserrat, Arial, sans-serif`;}
        lines.forEach((lineText, line) => ctx.fillText(lineText, tileSize / 2, tileSize / 2 + (line - (lines.length - 1) / 2) * size * 1.18));
      });
    });
    for (const piece of pieces) {
      const ctx = piece.canvas.getContext("2d");
      if (!ctx) continue;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(piece.master, piece.x, piece.y, PIECE, PIECE, 0, 0, PIECE, PIECE);
      piece.texture.needsUpdate = true;
    }
    if (atlas) for (const map of Object.values(atlas)) map.needsUpdate = true;
    for (const material of stickers) if (material.map) material.map.needsUpdate = true;
    glasses.forEach((material,i)=>{setGlass(material,faceKinds[i],dark);material.opacity*=faceKinds[i]==='front'?.75:.92;material.envMapIntensity*=.8;});

  }

  const dark = () => document.documentElement.dataset.theme === "dark";
  function draw() {
    if (disposed || !renderer || lost) return;
    pose(time);
    renderer.autoClear = true;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    const solved = time >= homeCubeDuration;
    canvas.dataset.ready = "true";
    canvas.dataset.animationTime = time.toFixed(3);
    canvas.dataset.settled = String(solved);
    canvas.dataset.theme = dark() ? "dark" : "light";
    canvas.dataset.composition = "home-cube";canvas.dataset.glassTreatment="voltron-face-optics";canvas.dataset.cells="27";
    canvas.dataset.renderedFrames = String(++frames);
    canvas.dataset.continuousRendering = String(!!frame);
    host.dataset.sceneMode = paused || frozen ? "paused" : solved ? "rotating" : time < homeCubeHold ? "tiles" : time < homeCubeHold + homeCubeStep * (homeCubeMoves.length / 2) ? "scramble" : "solve";
    hero.style.setProperty("--identity-opacity", "0");
    if (canvas.parentElement) {canvas.parentElement.dataset.cube = "picture"; canvas.parentElement.style.setProperty("--identity-opacity", "0");}
  }
  function size() {
    if (!renderer || disposed) return;
    const {width, height} = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.fov = width / height < 0.9 ? 39.7 : 33.2;
    camera.updateProjectionMatrix();
    const ratio = options.sharp ? Math.max(2, quality.ratio) : quality.ratio;
    sizeHeroSurface(renderer, [], width, height, ratio);
    canvas.dataset.renderScale = ratio.toFixed(2);
    draw();
  }
  function stop() {cancelAnimationFrame(frame); frame = 0; last = 0; canvas.dataset.continuousRendering = "false";}
  function tick(now: number) {
    frame = 0;
    if (disposed || lost || paused || frozen || !visible || document.hidden) return;
    const delta = last ? Math.max(0, Math.min(0.05, (now - last) / 1000)) : 0;
    time += delta;
    last = now;
    if (quality.sample(now)) size();
    draw();
    frame = requestAnimationFrame(tick);
    canvas.dataset.continuousRendering = "true";
  }
  function schedule() {if (!disposed && !lost && started && !paused && !frozen && visible && !document.hidden && !motion.matches && !frame) {last = 0; frame = requestAnimationFrame(tick);}}
  function controls(event: Event) {
    const detail = (event as CustomEvent).detail;
    if (detail?.action === "seek") {stop(); time = Math.max(0, Number(detail.time) || 0); frozen = true; paused = true; draw();}
    else if (detail?.action === "replay") {stop(); time = 0; frozen = paused = false; started = true; draw(); schedule();}
    else {paused = !paused; if (paused) stop(); else {frozen = false; schedule();} draw();}
  }
  function visibility() {if (document.hidden) stop(); else schedule();}
  function preference() {if (motion.matches) {stop(); time = homeCubeDuration+.55; draw();} else schedule();}
  function contextLost(event: Event) {event.preventDefault(); lost = true; stop(); canvas.hidden = true; host.dataset.scenePose = "complete"; host.dataset.sceneState = "fallback"; host.dataset.sceneMode = "static";}
  function restored() {lost = false; canvas.hidden = false; paint(); size(); host.dataset.sceneState = "live"; schedule();}
  const resize = new ResizeObserver(size);
  const themes = new MutationObserver(() => {paint(); draw();});
  const view = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; if (visible) schedule(); else stop();});
  const cleanup = Object.assign(() => {
    disposed = true; stop(); resize.disconnect(); themes.disconnect(); view.disconnect();
    host.removeEventListener("hero-control", controls);
    document.removeEventListener("visibilitychange", visibility);
    motion.removeEventListener("change", preference);
    canvas.removeEventListener("webglcontextlost", contextLost);
    canvas.removeEventListener("webglcontextrestored", restored);
    resources.forEach(resource => resource.dispose());
    if (!options.shared) renderer?.dispose();
    if (canvas.parentElement) delete canvas.parentElement.dataset.cube;
  }, {ready: Promise.resolve(), pause() {stop(); started = false;}, start() {started = true; schedule();}, beginMorph() {stop();}, morph() {size();}}) as HeroController;

  cleanup.ready = (async () => {
    try {
      if (options.static) throw new Error("Static artwork requested");
      canvas.hidden = false;
      renderer = options.shared?.renderer ?? new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: "low-power"});
      renderer.setClearColor(0, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      scene.environment = options.shared?.environment ?? null;
      await document.fonts?.load(`500 ${px(92)}px Montserrat`).catch(() => undefined);
      if (disposed) return;
      if(!logoImage){const texture=track(await new THREE.TextureLoader().loadAsync(options.sharp ? identityMark2x : identityMark));logoImage=texture.image as CanvasImageSource;if(disposed)return;}
      paint();
      await yieldToBrowser();
      if (disposed) return;
      await renderer.compileAsync(scene, camera);
      if (disposed) return;
      if (options.immediate || motion.matches) time = homeCubeDuration+.55;
      size();
      resize.observe(host);
      themes.observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});
      view.observe(host);
      host.addEventListener("hero-control", controls);
      document.addEventListener("visibilitychange", visibility);
      motion.addEventListener("change", preference);
      canvas.addEventListener("webglcontextlost", contextLost);
      canvas.addEventListener("webglcontextrestored", restored);
      canvas.dataset.ready = "true";
      schedule();
    } catch (error) {
      if (disposed) return;
      stop();
      canvas.hidden = true;
      canvas.dataset.fallbackReason = error instanceof Error ? error.message : String(error);
      host.dataset.sceneMode = "static";
      host.dataset.scenePose = "complete";
    }
  })();
  return cleanup;
}
