import {createSceneHandoff} from "../performance/scene-handoff";
import {batchStaticMeshes} from "../performance/static-batching";
import { alphaLineShotAt, alphaTourStateAt, alphaPlaybackDuration } from "./alpha-line-tour";
import {createRenderQuality,yieldToBrowser} from "../performance/scene-policy";
import * as THREE from "three";
import { createAlphaStackLight } from "../home/alpha-stack-light";
import {createArtworkEnvironment} from "../brand/artwork-studio";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { alphaViewBounds, fitAlphaCamera } from "../home/alpha-process-framing";
import { alphaVisualColors } from "../home/alpha-visual-palette";
import { alphaBathColor } from "./alpha-line-bath-palette";
import { alphaLineCoatId, alphaLineEndX, alphaLineFarZ, alphaLineNearZ, alphaLinePath, alphaLineStation, alphaLineStations, type AlphaLineStation } from "./alpha-line-config";
import { alphaLineCameraOffset, alphaLineLookTarget, clampAlphaLineOrbit, frameAlphaLineStation, spaceAlphaLineLabels } from "./alpha-line-framing";
import {
  alphaLineCorners,
  alphaLineDeviationDuration,
  alphaLineDeviationStateAt,
  alphaLineDuration,
  alphaLineRaisedY,
  alphaLineRouteState,
  alphaLineStateAt,
  alphaLineStationDistance,
  alphaLineUnloadY,
  type AlphaLineState,
} from "./alpha-line-timeline";

type Mode = "route" | "journey" | "tour" | "deviation";
type Options = {
  initialState?: AlphaLineState;
  paused: boolean;
  onState: (state: AlphaLineState) => void;
  onSelect: (id: string) => void;
  onReady: () => void;
  onEnded: () => void;
};
export type AlphaLineController = {
  setPaused: (paused: boolean) => void;
  seek: (mode: Mode, time: number) => void;
  setExplore: (enabled: boolean) => void;
  setGuided: (enabled: boolean) => void;
  resetView: () => void;
  orbit: (horizontal: number, vertical: number, magnification: number) => void;
  focusStation: (id: string | null) => void;
  dispose: () => void;
};

const railY = 5.28;
const liquidY = 1.82;

export async function mountAlphaLine(canvas: HTMLCanvasElement, host: HTMLDivElement, options: Options): Promise<AlphaLineController> {
  const handoff=createSceneHandoff(host,canvas);
  const quality=createRenderQuality(canvas);
  await yieldToBrowser();
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    canvas.hidden = true;
    handoff.fallback();host.dataset.fallback = "true";
    return { setPaused() {}, seek() {}, setExplore() {}, setGuided() {}, resetView() {}, orbit() {}, focusStation() {}, dispose() {} };
  }
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const look = alphaLineLookTarget();
  const camera = new THREE.OrthographicCamera(-20, 20, 12, -12, 0.1, 120);
  const opening = alphaLineCameraOffset(0, 0);
  camera.position.set(look.x + opening.x, look.y + opening.y, look.z + opening.z);
  camera.lookAt(look.x, look.y, look.z);
  camera.updateMatrixWorld();

  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const signTextures: THREE.Texture[] = [];
  const geometry = <T extends THREE.BufferGeometry>(value: T) => { geometries.add(value); return value; };
  const material = <T extends THREE.Material>(value: T) => { materials.add(value); return value; };
  const isDark = () => document.documentElement.dataset.theme === "dark";
  const visual = alphaVisualColors(isDark());
  const metal = material(new THREE.MeshStandardMaterial({ color: visual.metal, metalness: 0.8, roughness: 0.25, envMapIntensity: 1.1 }));
  const polished = material(new THREE.MeshStandardMaterial({ color: visual.polished, metalness: 0.86, roughness: 0.2, envMapIntensity: 1.1 }));
  const steelDark = material(new THREE.MeshStandardMaterial({ color: visual.steelDark, metalness: 0.7, roughness: 0.36 }));
  const foundation = material(new THREE.MeshStandardMaterial({ color: visual.foundation, metalness: 0.32, roughness: 0.38 }));
  const bayMaterial = material(new THREE.MeshStandardMaterial({ color: visual.bay, metalness: 0.5, roughness: 0.31 }));
  const glass = material(new THREE.MeshPhysicalMaterial({ color: visual.glass, metalness: 0.05, roughness: 0.16, transparent: true, opacity: visual.glassOpacity, depthWrite: false, clearcoat: 1, envMapIntensity: 0.9, side: THREE.DoubleSide }));
  const glassSide = material(glass.clone());
  glassSide.opacity = visual.glassOpacity + 0.07;
  const tankBack = material(new THREE.MeshStandardMaterial({ color: visual.tankBack, metalness: 0.38, roughness: 0.31 }));
  const liquidMaterial = material(new THREE.MeshBasicMaterial({ color: visual.liquid, transparent: true, opacity: 0.48, depthWrite: false }));
  const coatLiquid = material(new THREE.MeshBasicMaterial({ color: visual.liquidCoat, transparent: true, opacity: 0.64, depthWrite: false }));
  const routeMaterial = material(new THREE.MeshBasicMaterial({ color: 0x2894bc }));
  const amberMaterial = material(new THREE.LineBasicMaterial({ color: 0xd0893a }));
  const selectMaterial = material(new THREE.LineBasicMaterial({ color: 0x2894bc }));
  const hitMaterial = material(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));

  const environment = createArtworkEnvironment(renderer);
  scene.environment = environment.texture;
  scene.environmentIntensity = visual.environment;
  const hemisphere = new THREE.HemisphereLight(0xeaf6ff, 0x718ba0, visual.hemisphere);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xffffff, visual.key);
  key.position.set(look.x - 6, 14, look.z + 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -18;
  key.shadow.camera.right = 18;
  key.shadow.camera.top = 16;
  key.shadow.camera.bottom = -16;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa4ddff, visual.rim);
  rim.position.set(look.x + 10, 9, look.z - 8);
  scene.add(rim);

  const unit = geometry(new THREE.BoxGeometry(1, 1, 1));
  const rounded = geometry(new RoundedBoxGeometry(1, 1, 1, 2, 0.06));
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 12));
  const equipment = new THREE.Group();
  scene.add(equipment);
  const pickables: THREE.Object3D[] = [];

  function box(parent: THREE.Object3D, size: number[], position: number[], mat: THREE.Material = metal, soft = false) {
    const mesh = new THREE.Mesh(soft ? rounded : unit, mat);
    mesh.scale.set(size[0], size[1], size[2]);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = !mat.transparent;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const end = new THREE.Vector3();
  function rod(parent: THREE.Object3D, from: number[], to: number[], radius: number, mat: THREE.Material = polished) {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mesh = new THREE.Mesh(cylinder, mat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    end.copy(b).sub(a);
    mesh.scale.set(radius, end.length(), radius);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.normalize());
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  const points = alphaLinePath();
  const cornerPoints = alphaLineCorners();
  const turntables: THREE.Group[] = [];
  for (const corner of cornerPoints) {
    const housing = new THREE.Group();
    housing.position.set(corner.x, 0, corner.z);
    equipment.add(housing);
    box(housing, [2.3, .18, 2.3], [0, railY - .2, 0], steelDark, true);
    const bearing = new THREE.Mesh(geometry(new THREE.CylinderGeometry(1.05, 1.05, .09, 40)), polished);
    bearing.position.y = railY - .065;
    housing.add(bearing);
    const rotating = new THREE.Group();
    rotating.rotation.y = corner.before;
    housing.add(rotating);
    for (const side of [-.72, .72]) {
      box(rotating, [2.05, .12, .11], [0, railY, side], metal);
      box(rotating, [2.05, .045, .2], [0, railY + .08, side], polished);
    }
    turntables.push(rotating);
    for (const x of [-1.02, 1.02]) for (const z of [-1.02, 1.02]) {
      box(housing, [.12, .08, .12], [x, railY - .07, z], polished);
    }
  }
  box(equipment, [alphaLineEndX + 3.6, 0.16, 3.55], [alphaLineEndX / 2, 0.15, alphaLineFarZ], foundation, true);
  box(equipment, [alphaLineEndX + 3.6, 0.16, 3.55], [alphaLineEndX / 2, 0.15, alphaLineNearZ], foundation, true);
  box(equipment, [3.7, 0.16, alphaLineNearZ - alphaLineFarZ + 3.5], [alphaLineEndX, 0.15, 0], foundation, true);
  for (const point of [points[0], points[points.length - 1]]) {
    const marker = box(equipment, [1.4, 0.9, 1.4], [point.x, 5.55, point.z], metal);
    marker.visible = false;
  }

  for (let index = 0; index < points.length - 1; index++) {
    const a = points[index];
    const b = points[index + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz) || 1;
    const yaw = Math.atan2(-dz, dx);
    const px = -dz / length;
    const pz = dx / length;
    const startTrim = a.corner ? 1.05 : a.stationId === "LOAD" ? -1.5 : 0;
    const endTrim = b.corner ? 1.05 : 0;
    const railLength = length - startTrim - endTrim;
    const midpoint = (startTrim - endTrim) / 2;
    for (const side of [-0.72, 0.72]) {
      const rail = box(equipment, [railLength, 0.12, 0.11], [(a.x + b.x) / 2 + dx / length * midpoint + px * side, railY, (a.z + b.z) / 2 + dz / length * midpoint + pz * side], metal);
      rail.rotation.y = yaw;
      const cap = box(equipment, [railLength, 0.045, 0.2], [(a.x + b.x) / 2 + dx / length * midpoint + px * side, railY + 0.08, (a.z + b.z) / 2 + dz / length * midpoint + pz * side], polished);
      cap.rotation.y = yaw;
    }
    if (a.stationId && a.stationId !== "LOAD") {
      const joint = new THREE.Group();
      joint.position.set(a.x,railY, a.z);
      joint.rotation.y = yaw;
      equipment.add(joint);
      for (const side of [-.72,.72]) {
        box(joint,[.28,.03,.32],[0,.11,side],steelDark);
        for (const x of [-.08,.08]) box(joint,[.045,.035,.045],[x,.14,side],polished);
      }
    }
    const route = box(equipment, [length, 0.03, 0.055], [(a.x + b.x) / 2, 0.46, (a.z + b.z) / 2], routeMaterial);
    route.rotation.y = yaw;
    const arrow = new THREE.ArrowHelper(new THREE.Vector3(dx, 0, dz).normalize(), new THREE.Vector3((a.x + b.x) / 2 - dx / length * .5, .49, (a.z + b.z) / 2 - dz / length * .5), 1, 0x2894bc, .23, .16);
    arrow.traverse(child => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        geometry(child.geometry);
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(mat => material(mat));
      }
    });
    equipment.add(arrow);
  }

  const centre = alphaLineLookTarget();
  for (const point of [points[0], points[5], points[6], points[9], points[10], points[points.length - 1]]) {
    const dx = point.x - centre.x;
    const dz = point.z - centre.z;
    const length = Math.hypot(dx, dz) || 1;
    const x = point.x + dx / length * 1.85;
    const z = point.z + dz / length * 1.85;
    box(equipment, [0.16, 5.05, 0.16], [x, 2.75, z], metal, true);
    rod(equipment, [x, 5.15, z], [point.x, railY, point.z], 0.045);
    if (point === points[0] || point === points[points.length - 1]) {
      const label = document.createElement("canvas"); label.width = 512; label.height = 112;
      const context = label.getContext("2d")!;
      context.fillStyle = "#edf5fa"; context.fillRect(0, 0, 512, 112);
      context.strokeStyle = "#9ab5ca"; context.lineWidth = 8; context.strokeRect(4, 4, 504, 104);
      context.fillStyle = "#174b80"; context.font = "500 48px Montserrat, sans-serif";
      context.textAlign = "center"; context.textBaseline = "middle";
      context.fillText(point === points[0] ? "LOADING" : "UNLOADING", 256, 58);
      const texture = new THREE.CanvasTexture(label); texture.colorSpace = THREE.SRGBColorSpace; signTextures.push(texture);
      // Fixed vertical sign panels, elevated above the complete trolley/rail envelope.
      const sign = new THREE.Group(); sign.position.set(x, 6.75, z); sign.rotation.y = -.4;
      equipment.add(sign);
      box(sign, [2.7, .68, .14], [0, 0, 0], metal, true);
      const board = new THREE.Mesh(geometry(new THREE.PlaneGeometry(2.54, .54)), material(new THREE.MeshStandardMaterial({map:texture, roughness:.5, metalness:.08})));
      board.position.z = .076; sign.add(board);
      // Twin rear brackets and a crossbar connect the framed panel to its extended pole.
      for (const side of [-.72, .72]) {
        box(sign, [.09, .72, .1], [side, -.55, -.11], steelDark);
        rod(sign, [0, -.89, -.11], [side, -.57, -.11], .032);
        const fastener = new THREE.Mesh(cylinder, polished);
        fastener.scale.set(.026, .025, .026); fastener.rotation.x = Math.PI / 2;
        fastener.position.set(side, -.2, .087); sign.add(fastener);
      }
      box(sign, [1.62, .1, .14], [0, -.89, -.11], polished);
      box(equipment, [.25, .18, .25], [x, 5.24, z], steelDark, true);
      rod(equipment, [x, 5.275, z], [x, 5.91, z], .065);
    }
  }

  type Bath = { id: string; surface: THREE.ShaderMaterial; volume: THREE.MeshBasicMaterial };
  const baths: Bath[] = [];
  const stackLights: { id: string; lamp: ReturnType<typeof createAlphaStackLight> }[] = [];
  function waterMaterial(color: number) {
    return material(new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uImpact: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOpacity: {value:.78} },
      vertexShader: `varying vec2 vUv; uniform float uTime; uniform float uImpact;
        void main(){vUv=uv; vec3 p=position; p.z+=sin(p.x*7.+uTime*.8)*cos(p.y*6.-uTime*.6)*(.0015+uImpact*.01); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uImpact; uniform vec3 uColor; uniform float uOpacity;
        void main(){vec2 p=(vUv-.5)*vec2(1.28,1.); float r=length(p);
          float ring=pow(sin(r*48.-uTime*5.)*.5+.5,7.)*exp(-r*5.5)*uImpact;
          float wave=sin(p.x*11.+sin(p.y*6.)*.4+uTime*.35)*cos(p.y*9.-uTime*.3);
          float reflection=pow(clamp(.52+wave*.25+sin(p.x*4.-p.y*3.)*.12,0.,1.),6.);
          float edge=1.-smoothstep(0.,.035,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
          vec3 base=uColor;
          gl_FragColor=vec4(base+vec3(.32,.34,.34)*(reflection*.32+ring*.6+edge*.2),uOpacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
  }
  function addTank(station: AlphaLineStation) {
    const tank = new THREE.Group();
    tank.position.set(station.x, 0, station.z);
    tank.rotation.y = station.yaw;
    equipment.add(tank);
    const lamp = createAlphaStackLight(geometry, material, polished);
    lamp.group.position.set(-1.39, 2.12, 1.12); tank.add(lamp.group);
    stackLights.push({ id: station.id, lamp });
    box(tank, [3.13, 0.16, 2.63], [0, 0.38, 0], metal, true);
    box(tank, [3.13, .055, .08], [0,.29,1.29],steelDark);
    box(tank, [3.04, 1.57, 0.07], [0, 1.22, -1.19], tankBack);
    const front = box(tank, [3.04, 1.57, 0.035], [0, 1.22, 1.21], glass);
    front.renderOrder = 5;
    for (const side of [-1.51, 1.51]) {
      const pane = box(tank, [0.035, 1.57, 2.38], [side, 1.22, 0], glassSide);
      pane.renderOrder = 4;
      for (const z of [-1.21, 1.21]) box(tank, [0.065, 1.66, 0.065], [side, 1.24, z], polished);
    }
    for (const x of [-1.4, 1.4]) for (const y of [.6, 1.8]) {
      const fastener = new THREE.Mesh(cylinder, polished);
      fastener.scale.set(.035, .028, .035);
      fastener.rotation.x = Math.PI / 2;
      fastener.position.set(x, y, 1.24);
      tank.add(fastener);
    }
    for (const x of [-1.36,1.36]) for(const z of [-1.05,1.05]) box(tank,[.18,.12,.22],[x,.24,z],steelDark,true);
    const coated = station.id === alphaLineCoatId;
    const volumeMaterial = material((coated ? coatLiquid : liquidMaterial).clone());
    volumeMaterial.color.setHex(alphaBathColor(station.id, isDark())).multiplyScalar(.8);
    const volume = box(tank, [2.93, 1.34, 2.29], [0, liquidY - 0.67, 0], volumeMaterial);
    volume.renderOrder = 2;
    const surfaceMaterial = waterMaterial(alphaBathColor(station.id, isDark()));
    const surface = new THREE.Mesh(geometry(new THREE.PlaneGeometry(2.94, 2.3, 10, 8)), surfaceMaterial);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = liquidY;
    surface.renderOrder = 3;
    tank.add(surface);
    for (const z of [-1.24, 1.24]) box(tank, [3.19, 0.1, 0.105], [0, 2.065, z], polished, true);
    for (const side of [-1.55, 1.55]) box(tank, [0.105, 0.1, 2.48], [side, 2.065, 0], polished, true);
    const hit = new THREE.Mesh(unit, hitMaterial);
    hit.scale.set(3.2, 1.9, 2.7);
    hit.position.y = 1.2;
    hit.userData.stationId = station.id;
    tank.add(hit);
    pickables.push(hit);
    baths.push({ id: station.id, surface: surfaceMaterial, volume: volumeMaterial });
  }
  function addBay(station: AlphaLineStation) {
    const bay = new THREE.Group();
    bay.position.set(station.x, 0, station.z);
    equipment.add(bay);
    box(bay, [1.68, 0.12, 1.75], [0, 0.63, 0], bayMaterial, true);
    box(bay, [1.56, 0.045, 1.65], [0, 0.71, 0], polished);
    for (const x of [-0.62, 0.62]) for (const z of [-0.65, 0.65]) box(bay, [0.075, 0.33, 0.075], [x, 0.435, z], steelDark);
    for (const x of [-.48,.48]) {
      box(bay,[.07,.35,.09],[x,.9,-.12],steelDark);
      box(bay,[.18,.06,.24],[x,.76,0],polished);
    }
    const hit = new THREE.Mesh(unit, hitMaterial);
    hit.scale.set(1.8, 0.8, 1.9);
    hit.position.y = 0.7;
    hit.userData.stationId = station.id;
    bay.add(hit);
    pickables.push(hit);
  }
  for (const station of alphaLineStations) {
    await yieldToBrowser();
    if (station.kind === "tank") addTank(station);
    else addBay(station);
  }

  const edgeGeometry = geometry(new THREE.EdgesGeometry(geometry(new THREE.BoxGeometry(3.34, 1.9, 2.84))));
  const active = new THREE.LineSegments(edgeGeometry, material(new THREE.LineBasicMaterial({ color: 0x39bde3, transparent: true, opacity: .72 })));
  active.visible = false;
  const selection = new THREE.LineSegments(edgeGeometry, selectMaterial);
  const amber = new THREE.LineSegments(edgeGeometry, amberMaterial);
  selection.visible = false;
  amber.visible = false;
  scene.add(selection, amber, active);
  function placeMarker(marker: THREE.LineSegments, id: string) {
    const station = alphaLineStation(id);
    marker.position.set(station.x, 1.22, station.z);
    marker.rotation.y = station.yaw;
    marker.visible = true;
  }

  const carrier = new THREE.Group();
  scene.add(carrier);
  box(carrier, [0.64, 0.16, 1.65], [0, 5.48, 0], metal, true);
  box(carrier, [0.44, 0.32, 0.43], [0, 5.29, 0], steelDark, true);
  box(carrier, [.49,.17,.47], [0,5.23,0],polished,true);
  const wheelGeometry = geometry(new THREE.CylinderGeometry(0.13, 0.13, 0.09, 16));
  const wheels: THREE.Mesh[] = [];
  for (const x of [-0.23, 0.23]) for (const z of [-0.69, 0.69]) {
    const wheel = new THREE.Mesh(wheelGeometry, steelDark);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 5.46, z);
    carrier.add(wheel);
    wheels.push(wheel);
  }
  const fixture = new THREE.Group();
  carrier.add(fixture);
  box(fixture, [0.97, 0.07, 0.11], [0, 0, 0], polished, true);
  const hookGeometry = geometry(new THREE.TorusGeometry(.085,.018,6,20,Math.PI*1.75));
  const topHook = new THREE.Mesh(hookGeometry,metal);
  topHook.position.y = .1;
  fixture.add(topHook);
  const jaws = [-0.34, 0.34].map(x => {
    const jaw = new THREE.Group();
    jaw.position.set(x, -0.02, 0);
    fixture.add(jaw);
    rod(jaw, [0, 0, 0], [0, -0.18, 0], 0.018);
    const hook = new THREE.Mesh(hookGeometry,polished);
    hook.scale.setScalar(.55); hook.position.y=-.15; jaw.add(hook);
    return jaw;
  });
  const cables = [-0.12, 0.12].map(z => rod(carrier, [0, railY - 0.18, z], [0, alphaLineRaisedY + 0.14, z], 0.012, steelDark));
  const panelShape = new THREE.Shape();
  panelShape.moveTo(-0.47, -0.63);
  panelShape.lineTo(0.47, -0.63);
  panelShape.lineTo(0.47, 0.63);
  panelShape.lineTo(-0.47, 0.63);
  panelShape.closePath();
  for (const x of [-.36, .36]) for (const y of [-.5, 0, .5]) {
    const hole = new THREE.Path(); hole.absarc(x, y, .027, 0, Math.PI * 2, true); panelShape.holes.push(hole);
  }
  const panelGeometry = geometry(new THREE.ExtrudeGeometry(panelShape, { depth: 0.075, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.012, bevelThickness: 0.01 }));
  panelGeometry.translate(0, 0, -0.0375);
  const immersion = { level: { value: -20 }, tint: { value: new THREE.Color(0x238eb8) } };
  function panelMaterial() {
    const mat = material(new THREE.MeshPhysicalMaterial({ color: 0xc9d4db, metalness: 0.8, roughness: 0.27, clearcoat: 0.35, transparent: true }));
    mat.onBeforeCompile = shader => {
      shader.uniforms.uBathLevel = immersion.level;
      shader.uniforms.uBathTint = immersion.tint;
      shader.vertexShader = `varying float vBathHeight;\n${shader.vertexShader.replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvBathHeight=(modelMatrix*vec4(transformed,1.)).y;")}`;
      shader.fragmentShader = `varying float vBathHeight; uniform float uBathLevel; uniform vec3 uBathTint;\n${shader.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\nfloat submerged=1.-smoothstep(uBathLevel-.035,uBathLevel+.035,vBathHeight); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.48+uBathTint*.28,submerged);")}`;
    };
    mat.customProgramCacheKey = () => "alpha-line-panel-v1";
    return mat;
  }
  const carriedMaterial = panelMaterial();
  const carried = new THREE.Mesh(panelGeometry, carriedMaterial);
  carried.position.y = -0.83;
  carried.castShadow = true;
  fixture.add(carried);
  const finishedMaterial = panelMaterial();
  const unload = alphaLineStation("UNLOAD");
  const finished = new THREE.Mesh(panelGeometry, finishedMaterial);
  finished.position.set(unload.x, alphaLineUnloadY - 0.83, unload.z);
  finished.rotation.y = Math.PI;
  scene.add(finished);
  const loadingMaterial = panelMaterial();
  const loading = new THREE.Mesh(panelGeometry, loadingMaterial);
  loading.position.set(0, alphaLineUnloadY - .83, alphaLineFarZ);
  loading.castShadow = true;
  scene.add(loading);
  for (const part of [carried,finished,loading]) box(part,[.065,1.24,.16],[.445,0,.065],part.material);

  const dropMaterial = material(new THREE.MeshBasicMaterial({ color: visual.liquid, transparent: true, opacity: .72 }));
  const dropGeometry = geometry(new THREE.SphereGeometry(.024, 6, 5));
  const droplets = Array.from({ length: 6 }, () => {
    const drop = new THREE.Mesh(dropGeometry, dropMaterial); drop.scale.y = 1.8; scene.add(drop); return drop;
  });
  const shadow = new THREE.Mesh(geometry(new THREE.PlaneGeometry(40, 28)), material(new THREE.ShadowMaterial({ color: visual.shadowColor, opacity: visual.shadowOpacity })));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(centre.x, -0.01, 0);
  shadow.receiveShadow = true;
  scene.add(shadow);

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const reviewTime = new URLSearchParams(location.search).get("alpha-time");
  const reviewFraming = new URLSearchParams(location.search).has("artwork-review");
  let mode: Mode = options.initialState?.mode ?? (reviewTime !== null ? "journey" : "route");
  let elapsed = options.initialState?.time ?? (reviewTime !== null ? Math.max(0, Number(reviewTime) || 0) : 0);
  let paused = options.paused;
  let explore = false;
  let guided = true;
  let manualShot: ReturnType<typeof alphaLineShotAt> | null = null;
  let focusId: string | null = null;
  let framedId: string | null = null;
  let focusBlend = 0;
  let azimuth = 0;
  let polar = 0;
  let zoom = 1;
  let disposed = false;
  let lostContext = false;
  let visible = false;
  let frame = 0;
  let previous = 0;
  const disposeBatches=batchStaticMeshes(equipment,new Set<THREE.Object3D>([...turntables,...droplets,...stackLights.map(item => item.lamp.group)]));
  let signature = "";
  let ended = false;
  let pixelWidth = 0;
  let pixelHeight = 0;
  let boundsKey = "";
  let framingBounds = new THREE.Box2();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const silver = new THREE.Color(0xc9d4db);
  const graphite = new THREE.Color(0x29343e);

  function palette() {
    graphite.setHex(isDark() ? 0x465d72 : 0x29343e);
    const colors = alphaVisualColors(isDark());
    metal.color.set(colors.metal).multiplyScalar(.92);
    polished.color.set(colors.polished);
    steelDark.color.set(colors.steelDark);
    foundation.color.set(colors.foundation);
    bayMaterial.color.set(colors.bay);
    glass.color.set(colors.glass);
    glass.opacity = colors.glassOpacity;
    glassSide.color.copy(glass.color);
    glassSide.opacity = colors.glassOpacity + 0.07;
    tankBack.color.set(colors.tankBack);
    liquidMaterial.color.set(colors.liquid).multiplyScalar(.8);
    coatLiquid.color.set(colors.liquidCoat);
    dropMaterial.color.set(colors.liquid);
    hemisphere.intensity = colors.hemisphere;
    key.intensity = colors.key;
    rim.intensity = colors.rim;
    scene.environmentIntensity = colors.environment;
    (shadow.material as THREE.ShadowMaterial).opacity = colors.shadowOpacity;
    (shadow.material as THREE.ShadowMaterial).color.set(colors.shadowColor);
    baths.forEach(bath => {
      bath.surface.uniforms.uColor.value.setHex(alphaBathColor(bath.id, isDark()));
      bath.volume.color.setHex(alphaBathColor(bath.id, isDark())).multiplyScalar(.8);
    });
    canvas.dataset.theme = isDark() ? "dark" : "light";
  }
  function currentState() {
    if (mode === "route") return alphaLineRouteState();
    if (mode === "deviation") return alphaLineDeviationStateAt(elapsed);
    return mode === "tour" ? alphaTourStateAt(elapsed) : alphaLineStateAt(elapsed);
  }
  function publish(state: AlphaLineState) {
    const complete = state.time >= (state.mode === "deviation" ? alphaLineDeviationDuration : alphaPlaybackDuration(state.mode));
    const next = `${state.mode}|${state.chapter}|${state.phase}|${state.stationId}|${state.deviationStep}|${state.attached}|${Math.floor(state.time * 4)}|${complete}`;
    if (next === signature) return;
    signature = next;
    options.onState(state);
  }
  function apply(state: AlphaLineState) {
    stackLights.forEach(({ id, lamp }) => {
      const active = state.carrierVisible && state.stationId === id && ["lower", "hold", "raise", "drain", "verify"].includes(state.phase);
      const complete = state.mode !== "route" && (state.processingComplete || state.distance > alphaLineStationDistance(id) + .01);
      lamp.setState(state.amberStationId === id ? "attention" : active ? "active" : complete ? "complete" : "idle");
    });
    loading.visible = state.loadingOpacity > .001;
    loadingMaterial.opacity = state.loadingOpacity;
    carrier.visible = state.carrierVisible;
    carrier.position.set(state.x, 0, state.z);
    carrier.rotation.y = state.yaw;
    fixture.position.y = state.y;
    carried.visible = state.attached && state.partOpacity > 0.001;
    carriedMaterial.opacity = state.partOpacity;
    carriedMaterial.color.copy(silver).lerp(graphite, state.coating);
    carriedMaterial.metalness = THREE.MathUtils.lerp(0.8, 0.38, state.coating);
    finished.visible = state.finishedOpacity > 0.001;
    finishedMaterial.opacity = state.finishedOpacity;
    finishedMaterial.color.copy(graphite);
    jaws.forEach((jaw, index) => { jaw.rotation.z = (index === 0 ? -1 : 1) * state.jawOpen * 0.42; });
    cables.forEach(cable => {
      const top = railY - 0.18;
      const bottom = state.y + 0.16;
      cable.position.y = (top + bottom) / 2;
      cable.scale.y = Math.max(0.01, top - bottom);
    });
    wheels.forEach(wheel => { wheel.rotation.z = state.distance / .13; });
    carriedMaterial.roughness = THREE.MathUtils.lerp(.3, .16, state.wetness);
    carriedMaterial.clearcoat = .35 + state.wetness * .55;
    finishedMaterial.roughness = state.phase === "release" ? .19 + Math.sin(state.time * 7) * .035 : .26;
    turntables.forEach((table, index) => {
      const c = cornerPoints[index];
      table.rotation.y = state.corner === index ? state.yaw : state.distance >= c.distance ? c.after : c.before;
    });
    droplets.forEach((drop, index) => {
      const t = (state.time * 2.2 + index * .167) % 1;
      drop.visible = state.phase === "drain" && t < .96;
      drop.position.set(state.x + ((index % 3) - 1) * .21, state.y - 1.46 - t * t * (state.y - 1.46 - liquidY), state.z + (index % 2 ? .05 : -.05));
    });
    if (state.carrierVisible && alphaLineStation(state.stationId).kind === "tank") placeMarker(active, state.stationId);
    else active.visible = false;
    immersion.level.value = state.carrierVisible && (state.phase === "lower" || state.phase === "hold" || state.phase === "raise") ? liquidY : -20;
    baths.forEach(bath => {
      const immersed = state.stationId === bath.id && ["lower","hold","raise"].includes(state.phase);
      const reveal = immersed ? THREE.MathUtils.smoothstep(3.45-state.y,0,1) : 0;
      bath.surface.uniforms.uTime.value = immersed ? elapsed : 0;
      bath.surface.uniforms.uImpact.value = state.stationId === bath.id ? state.ripple : 0;
      bath.surface.uniforms.uOpacity.value = .78 - reveal * .36;
      bath.volume.opacity = THREE.MathUtils.lerp(bath.id === alphaLineCoatId ? .64 : .48,.2,reveal);
    });
    if (state.amberStationId) placeMarker(amber, state.amberStationId);
    else amber.visible = false;
    canvas.dataset.chapter = state.chapter;
    canvas.dataset.phase = state.phase;
    canvas.dataset.time = state.time.toFixed(3);
    canvas.dataset.attached = String(state.attached);
    canvas.dataset.duration = String(state.mode === "deviation" ? alphaLineDeviationDuration : alphaPlaybackDuration(state.mode));
    host.dataset.activeStation = state.carrierVisible ? state.stationId : "";
    canvas.dataset.station = state.stationId;
    publish(state);
  }
  let labelSignature="";
  function placeLabels() {
    const stamp=[pixelWidth,pixelHeight,currentState().stationId,currentState().carrierVisible,...camera.projectionMatrix.elements,...camera.matrixWorld.elements].join("|");
    if(stamp===labelSignature)return;labelSignature=stamp;
    const nodes = Array.from(host.querySelectorAll<HTMLElement>(".alpha-line-numbers [data-station]"));
    const state = currentState();
    const positions = nodes.map(node => {
      const station = alphaLineStation(node.dataset.station!);
      const offset = station.kind === "tank" ? 1.26 : 0;
      const labelShift = station.kind === "tank" && state.carrierVisible && state.stationId === station.id ? -.95 : 0;
      const projected = new THREE.Vector3(station.x + Math.sin(station.yaw) * offset + Math.cos(station.yaw) * labelShift, station.kind === "tank" ? 1.4 : .55, station.z + Math.cos(station.yaw) * offset - Math.sin(station.yaw) * labelShift).project(camera);
      const anchorX = (projected.x + 1) / 2 * pixelWidth, anchorY = (1 - projected.y) / 2 * pixelHeight;
      const bay = station.kind !== "tank";
      return { x: anchorX - (bay ? 22 : 0), y: anchorY + (bay ? 25 : 0), anchorX, anchorY, width: node.offsetWidth, height: node.offsetHeight, visible: Math.abs(projected.x) <= .96 && Math.abs(projected.y) <= .96 && projected.z > -1 && projected.z < 1 };
    });
    const visibleIndices = positions.flatMap((p, index) => p.visible ? [index] : []);
    const positionsWithSpacing = positions.map(p => ({x:p.x,y:p.y,width:p.width,height:p.height}));
    spaceAlphaLineLabels(visibleIndices.map(index => positions[index]), pixelWidth, pixelHeight).forEach((p, index) => { positionsWithSpacing[visibleIndices[index]] = p; });
    host.querySelector(".alpha-line-leaders")?.setAttribute("viewBox", `0 0 ${pixelWidth} ${pixelHeight}`);
    nodes.forEach((node, index) => {
      node.style.left = `${positionsWithSpacing[index].x / pixelWidth * 100}%`;
      node.style.top = `${positionsWithSpacing[index].y / pixelHeight * 100}%`;
      node.style.visibility = positions[index].visible ? "" : "hidden";
      const leader = host.querySelector<SVGLineElement>(`[data-bay="${node.dataset.station}"]`);
      if (leader) {
        leader.style.visibility = positions[index].visible ? "" : "hidden";
        leader.setAttribute("x1", String(positions[index].anchorX)); leader.setAttribute("y1", String(positions[index].anchorY));
        leader.setAttribute("x2", String(positionsWithSpacing[index].x)); leader.setAttribute("y2", String(positionsWithSpacing[index].y - positions[index].height / 2));
      }
    });
  }
  function applyCamera(forceBounds = false) {
    const directed = guided && mode !== "route" && mode !== "deviation";
    const shot = directed ? alphaLineShotAt(currentState(),pixelWidth < 600) : manualShot;
    const orbit = clampAlphaLineOrbit(azimuth, polar, zoom);
    azimuth = orbit.azimuth;
    polar = orbit.polar;
    zoom = orbit.zoom;
    const offset = alphaLineCameraOffset(azimuth + (directed && shot && "azimuth" in shot ? Number(shot.azimuth) : 0), polar);
    camera.position.set(look.x + offset.x, look.y + offset.y, look.z + offset.z);
    camera.lookAt(look.x, look.y, look.z);
    camera.updateMatrixWorld();
    const key = `${camera.position.x.toFixed(2)}|${camera.position.y.toFixed(2)}|${camera.position.z.toFixed(2)}|${pixelWidth}|${pixelHeight}`;
    if (forceBounds || key !== boundsKey) {
      framingBounds = alphaViewBounds([equipment], camera);
      const position = carrier.position.clone(); const rotation = carrier.rotation.clone(); const lift = fixture.position.y;
      fixture.position.y = alphaLineRaisedY;
      for (const point of [...points, {x:-1.5,z:alphaLineFarZ}]) {
        carrier.position.set(point.x, 0, point.z);
        for (const angle of [0, Math.PI / 4, Math.PI / 2, Math.PI]) {
          carrier.rotation.y = angle;
          framingBounds.union(alphaViewBounds([carrier], camera));
        }
      }
      carrier.position.copy(position); carrier.rotation.copy(rotation); fixture.position.y = lift;
      boundsKey = key;
    }
    if (pixelWidth && pixelHeight) {
      const padding = fitAlphaCamera(camera, framingBounds, pixelWidth, pixelHeight);
      canvas.dataset.framePadding = String(padding);
      const unitsX = (camera.right - camera.left) / pixelWidth;
      const unitsY = (camera.top - camera.bottom) / pixelHeight;
      canvas.dataset.frameInsets = JSON.stringify({ top: (camera.top - framingBounds.max.y) / unitsY, bottom: (framingBounds.min.y - camera.bottom) / unitsY, left: (framingBounds.min.x - camera.left) / unitsX, right: (camera.right - framingBounds.max.x) / unitsX });
    }
    const cx = (camera.left + camera.right) / 2;
    const cy = (camera.top + camera.bottom) / 2;
    const width = (camera.right - camera.left) / zoom;
    const height = (camera.top - camera.bottom) / zoom;
    camera.left = cx - width / 2;
    camera.right = cx + width / 2;
    camera.top = cy + height / 2;
    camera.bottom = cy - height / 2;
    camera.updateProjectionMatrix();
    if (shot) {
      const point = new THREE.Vector3(shot.x, 2.85, shot.z).applyMatrix4(camera.matrixWorldInverse);
      const centreX = cx + (point.x - cx) * shot.detail;
      const centreY = cy + (point.y - cy) * shot.detail;
      const detailZoom = shot.zoom * (pixelWidth < 600 ? 1 + shot.detail * .45 : 1);
      camera.left = centreX - width / detailZoom / 2; camera.right = centreX + width / detailZoom / 2;
      camera.top = centreY + height / detailZoom / 2; camera.bottom = centreY - height / detailZoom / 2;
      camera.updateProjectionMatrix();
      canvas.dataset.camera = directed ? shot.detail < .05 ? "overview" : "guided" : "manual";
      canvas.dataset.cameraZoom = detailZoom.toFixed(3);
    } else { canvas.dataset.camera = focusId ? "station" : "overview"; canvas.dataset.cameraZoom = zoom.toFixed(3); }
    if (focusId) framedId = focusId;
    if (framedId && focusBlend > 0.001) {
      const station = alphaLineStation(framedId);
      frameAlphaLineStation(camera, new THREE.Vector3(station.x, 2.8, station.z), 1 + focusBlend * (pixelWidth < 600 ? 2.1 : 1.15));
      placeMarker(selection, framedId);
    } else {
      selection.visible = false;
    }
    placeLabels();
    host.dataset.detail = String(Number(canvas.dataset.cameraZoom ?? 1) > 1.15 || !!focusId);
  }
  function render() {
    if (disposed || lostContext || !pixelWidth) return;
    const state = currentState();
    apply(state);
    const target = focusId ? 1 : 0;
    if (motion.matches) focusBlend = target;
    else if (Math.abs(focusBlend - target) > 0.001) focusBlend += (target - focusBlend) * 0.2;
    else focusBlend = target;
    applyCamera();
    if (reviewFraming) {
      const tracked = new THREE.Vector3(state.x, state.y - .83, state.z).project(camera);
      canvas.dataset.carrierFrame = JSON.stringify({x:tracked.x,y:tracked.y,phase:state.phase});
    }
    renderer.render(scene, camera);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
  }
  function tick(now: number) {
    if(quality.sample(now)){renderer.shadowMap.enabled=quality.shadows;resize();}
    frame = 0;
    if (disposed || lostContext) return;
    const playing = visible && !document.hidden && !paused && !motion.matches;
    if (playing) {
      elapsed += previous ? Math.min((now - previous) / 1000, 0.1) : 0;
      previous = now;
      if ((mode === "journey" || mode === "tour") && elapsed >= alphaPlaybackDuration(mode)) {
        elapsed = alphaPlaybackDuration(mode);
        paused = true;
        if (!ended) { ended = true; options.onEnded(); }
      } else if (mode === "deviation" && elapsed >= alphaLineDeviationDuration) {
        elapsed = alphaLineDeviationDuration;
        paused = true;
        if (!ended) { ended = true; options.onEnded(); }
      }
    } else previous = 0;
    render();
    const focusing = Math.abs(focusBlend - (focusId ? 1 : 0)) > 0.002;
    if (visible && !document.hidden && (playing || focusing)) frame = requestAnimationFrame(tick);
  }
  function resume() {
    if(host.dataset.sceneState!=="live")return;
    if(reviewTime!==null){stop();render();return;}
    stop();
    render();
    if (!disposed && visible && !document.hidden && !lostContext) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = quality.ratio;
    const w = Math.round(width);
    const h = Math.round(height);
    if (w !== pixelWidth || h !== pixelHeight || renderer.getPixelRatio() !== dpr) {
      pixelWidth = w;
      pixelHeight = h;
      boundsKey = "";
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
    }
    render();
  }
  function selectAt(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    const id = hit?.object.userData.stationId as string | undefined;
    if (id) options.onSelect(id);
  }
  let dragX = 0;
  let dragY = 0;
  let dragging = false;
  let moved = false;
  function onPointerDown(event: PointerEvent) {
    if (!explore || event.button !== 0) return;
    dragging = true;
    moved = false;
    dragX = event.clientX;
    dragY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent) {
    if (!dragging) return;
    const dx = event.clientX - dragX;
    const dy = event.clientY - dragY;
    if (Math.hypot(dx, dy) > 3) moved = true;
    azimuth += dx * 0.005;
    polar += dy * 0.0025;
    dragX = event.clientX;
    dragY = event.clientY;
    boundsKey = "";
    render();
  }
  function onPointerUp(event: PointerEvent) {
    const wasDrag = dragging && moved;
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (!wasDrag && event.button === 0) selectAt(event);
  }
  function onWheel(event: WheelEvent) {
    if (!explore) return;
    event.preventDefault();
    zoom += event.deltaY * 0.001;
    render();
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    lostContext = true;
    stop();
    canvas.hidden = true;
    handoff.fallback();host.dataset.fallback = "true";
    host.dataset.ready = "false";
  }
  function onPointerLeave(event: PointerEvent) { if (!canvas.hasPointerCapture(event.pointerId)) dragging = false; }
  function onVisibility() { if (document.hidden) stop(); else resume(); }
  function onContextRestored() {
    lostContext = false; canvas.hidden = false; host.dataset.fallback = "false"; host.dataset.ready = "true";
    palette();resize();void handoff.reveal().then(resume);
  }
  await yieldToBrowser();
  await renderer.compileAsync(scene,camera);
  const resizing = new ResizeObserver(resize);
  resizing.observe(host);
  const themes = new MutationObserver(() => { palette(); render(); });
  themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, { threshold: 0.08 });
  view.observe(host.closest(".alpha-line-stage") ?? host);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  motion.addEventListener("change", resume);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.dataset.kind = "alpha-line";
  palette();
  resize();
  await handoff.reveal();
  host.dataset.ready = "true";
  options.onReady();
  resume();
  return {
    setPaused(value) { paused = value; if (!value) ended = false; resume(); },
    seek(nextMode, time) {
      mode = nextMode;
      elapsed = Math.max(0, time);
      ended = false;
      signature = "";
      resume();
    },
    setGuided(enabled) {
      if (!enabled && guided && mode !== "route" && mode !== "deviation") manualShot = alphaLineShotAt(currentState(),pixelWidth < 600);
      guided = enabled;
      if (enabled) { manualShot=null; focusId=null; framedId=null; focusBlend=0; azimuth=0; polar=0; zoom=1; }
      resume();
    },
    setExplore(enabled) { explore = enabled; canvas.style.cursor = enabled ? "grab" : "pointer"; canvas.style.touchAction = enabled ? "none" : "pan-y"; },
    orbit(horizontal, vertical, magnification) { azimuth += horizontal; polar += vertical; zoom += magnification; boundsKey = ""; resume(); },
    resetView() {
      azimuth = 0;
      polar = 0;
      zoom = 1;
      focusId = null;
      framedId = null;
      focusBlend = 0;
      manualShot = null;
      boundsKey = "";
      resume();
    },
    focusStation(id) { focusId = id; manualShot = null; resume(); },
    dispose() {
      disposed = true;
      handoff.dispose();stop();
      resizing.disconnect();
      themes.disconnect();
      view.disconnect();
      motion.removeEventListener("change", resume);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      disposeBatches();
      geometries.forEach(value => value.dispose());
      materials.forEach(value => value.dispose());
      signTextures.forEach(value => value.dispose());
      environment.dispose();
      key.shadow.dispose();
      renderer.dispose();
    },
  };
}
