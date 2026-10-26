import {createSceneHandoff} from "../performance/scene-handoff";
import {createRenderQuality,yieldToBrowser} from "../performance/scene-policy";
import * as THREE from "three";
import { createAlphaStackLight } from "./alpha-stack-light";
import {createArtworkEnvironment} from "../brand/artwork-studio";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { alphaStationPosition, alphaViewBounds, fitAlphaCamera } from "./alpha-process-framing";
import { positionAlphaLabels } from "./alpha-process-layout";
import { alphaVisualColors } from "./alpha-visual-palette";
import {
  alphaDuration, alphaImmersedY, alphaLoadingX, alphaRaisedY, alphaStations,
  alphaStateAt, alphaUnloadY, alphaUnloadingX, type AlphaState,
} from "./alpha-process-timeline";

type Options = { paused: boolean; onStage: (stage: number) => void; onReady: () => void; onEnded?:()=>void };
export type AlphaProcessController = { setPaused: (paused: boolean) => void; replay: () => void; dispose: () => void };
const liquidY = 1.82;
const railY = 5.28;

export async function mountAlphaProcess(canvas: HTMLCanvasElement, host: HTMLDivElement, options: Options): Promise<AlphaProcessController> {
  const handoff=createSceneHandoff(host,canvas);
  const quality=createRenderQuality(canvas);
  await yieldToBrowser();
  let renderer: THREE.WebGLRenderer;
  try {
    if (new URLSearchParams(location.search).get("renderer") === "static") throw new Error("Static illustration requested");
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    canvas.hidden = true;
    handoff.fallback();host.dataset.fallback = "true";
    return { setPaused() {}, replay() {}, dispose() {} };
  }
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, .1, 100);
  camera.position.set(-8, 8.2, 16);
  camera.lookAt(0, 2.2, 0);
  camera.updateMatrixWorld();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const geometry = <T extends THREE.BufferGeometry>(value: T) => { geometries.add(value); return value; };
  const material = <T extends THREE.Material>(value: T) => { materials.add(value); return value; };
  const equipment = new THREE.Group();
  scene.add(equipment);
  const environment = createArtworkEnvironment(renderer);
  scene.environment = environment.texture;
  scene.environmentIntensity = .75;

  const visual = alphaVisualColors(false);
  const metal = material(new THREE.MeshStandardMaterial({ color: visual.metal, metalness: .8, roughness: .25, envMapIntensity: 1.1 }));
  const polished = material(new THREE.MeshStandardMaterial({ color: visual.polished, metalness: .86, roughness: .2, envMapIntensity: 1.1 }));
  const steelDark = material(new THREE.MeshStandardMaterial({ color: visual.steelDark, metalness: .7, roughness: .36 }));
  const railEdge = material(new THREE.MeshStandardMaterial({ color: visual.railEdge, metalness: .68, roughness: .34 }));
  const foundation = material(new THREE.MeshStandardMaterial({ color: visual.foundation, metalness: .32, roughness: .38 }));
  const bayMaterial = material(new THREE.MeshStandardMaterial({ color: visual.bay, metalness: .5, roughness: .31 }));
  const gasket = material(new THREE.MeshStandardMaterial({ color: 0x4b7690, metalness: .35, roughness: .45 }));
  const boltGeometry = geometry(new THREE.CylinderGeometry(.035, .035, .035, 8));
  const unitBox = geometry(new THREE.BoxGeometry(1, 1, 1));
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 12));
  const rounded = geometry(new RoundedBoxGeometry(1, 1, 1, 2, .06));

  function box(parent: THREE.Group, size: number[], position: number[], mat: THREE.Material = metal, soft = false) {
    const mesh = new THREE.Mesh(soft ? rounded : unitBox, mat);
    mesh.scale.set(size[0], size[1], size[2]);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = !mat.transparent;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const end = new THREE.Vector3();
  function rod(parent: THREE.Group, from: number[], to: number[], radius: number, mat: THREE.Material = polished) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const mesh = new THREE.Mesh(cylinder, mat);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    end.copy(b).sub(a);
    mesh.scale.set(radius, end.length(), radius);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.normalize());
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function bolt(parent: THREE.Group, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(boltGeometry, polished);
    mesh.position.set(x, y, z); mesh.rotation.x = Math.PI / 2;
    parent.add(mesh);
  }

  const hemisphere = new THREE.HemisphereLight(0xeaf6ff, 0x718ba0, 1.65);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(-3, 10, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -11; key.shadow.camera.right = 11;
  key.shadow.camera.top = 7; key.shadow.camera.bottom = -7;
  key.shadow.normalBias = .035; key.shadow.bias = -.0002;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa4ddff, 2);
  rim.position.set(6, 6, -5); scene.add(rim);

  const shadowMaterial = material(new THREE.ShadowMaterial({ color: 0x254962, opacity: .14 }));
  const floor = new THREE.Mesh(geometry(new THREE.PlaneGeometry(30, 16)), shadowMaterial);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.01; floor.receiveShadow = true; scene.add(floor);
  const shadowCanvas = document.createElement("canvas"); shadowCanvas.width = 128; shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d")!;
  const gradient = shadowContext.createRadialGradient(64, 64, 8, 64, 64, 64);
  gradient.addColorStop(0, "rgba(19,42,66,.25)"); gradient.addColorStop(.5, "rgba(19,42,66,.12)"); gradient.addColorStop(1, "rgba(19,42,66,0)");
  shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas); textures.add(shadowTexture);
  const contactMaterial = material(new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, opacity: .8 }));
  const contact = new THREE.Mesh(geometry(new THREE.PlaneGeometry(21, 7)), contactMaterial);
  contact.rotation.x = -Math.PI / 2; contact.position.set(0, .002, .1); scene.add(contact);

  // One foundation and one overhead gantry encompass loading, all three baths and unloading.
  box(equipment, [17.2, .16, 3.5], [0, .15, 0], foundation, true);
  box(equipment, [17.05, .035, 3.37], [0, .245, 0], polished);
  for (const x of [-8.05, 8.05]) {
    for (const z of [-1.4, 1.4]) {
      box(equipment, [.42, .09, .4], [x, .3, z], metal, true);
      box(equipment, [.14, 4.94, .14], [x, 2.81, z], metal, true);
      box(equipment, [.23, .28, .24], [x, 4.95, z], steelDark, true);
      rod(equipment, [x, 4.55, z], [x, 5.08, z * .48], .035);
      for (const dx of [-.13, .13]) bolt(equipment, x + dx, .31, z + .2);
    }
    box(equipment, [.18, .16, 3.02], [x, 5.28, 0], polished, true);
    for (const z of [-.67, .67]) {
      box(equipment, [.2, .21, .2], [x, 5.26, z], metal, true);
      bolt(equipment, x, 5.26, z + .115);
    }
  }
  for (const z of [-.67, .67]) {
    box(equipment, [16.55, .16, .12], [0, railY, z], metal, true);
    box(equipment, [16.65, .055, .24], [0, railY + .09, z], polished, true);
    box(equipment, [16.55, .04, .19], [0, railY - .09, z], steelDark);
    box(equipment, [16.55, .025, .012], [0, railY + .015, z + .065], railEdge);
    for (const x of [-8.31, 8.31]) box(equipment, [.045, .24, .25], [x, railY + .025, z], polished, true);
  }
  // Rear supports keep the foreground clear while giving the long rail a credible span.
  for (const x of [-5.18, 5.18]) {
    box(equipment, [.13, 4.95, .13], [x, 2.8, -1.43], metal, true);
    rod(equipment, [x, 5.2, -1.43], [x, 5.28, -.67], .055);
  }

  type Bath = { surface: THREE.ShaderMaterial; front: THREE.MeshPhysicalMaterial; side: THREE.MeshPhysicalMaterial; volume: THREE.MeshBasicMaterial; back: THREE.MeshStandardMaterial };
  const baths: Bath[] = [];
  const stackLights: ReturnType<typeof createAlphaStackLight>[] = [];
  for (const [index, x] of alphaStations.entries()) {
    const tank = new THREE.Group(); tank.position.x = x; equipment.add(tank);
    const lamp = createAlphaStackLight(geometry, material, polished);
    lamp.group.position.set(-1.39, 2.12, 1.12); tank.add(lamp.group); stackLights.push(lamp);
    box(tank, [3.13, .16, 2.63], [0, .38, 0], metal, true);
    const back = material(new THREE.MeshStandardMaterial({ color: visual.tankBack, metalness: .38, roughness: .31 }));
    box(tank, [3.04, 1.57, .07], [0, 1.22, -1.19], back);
    const front = material(new THREE.MeshPhysicalMaterial({ color: visual.glass, metalness: .05, roughness: .16, transparent: true, opacity: visual.glassOpacity, depthWrite: false, clearcoat: 1, envMapIntensity: .9, side: THREE.DoubleSide }));
    const side = material(front.clone()); side.opacity = .27;
    const frontPane = box(tank, [3.04, 1.57, .035], [0, 1.22, 1.21], front);
    frontPane.renderOrder = 5;
    for (const sx of [-1.51, 1.51]) {
      const pane = box(tank, [.035, 1.57, 2.38], [sx, 1.22, 0], side); pane.renderOrder = 4;
      for (const z of [-1.21, 1.21]) box(tank, [.065, 1.66, .065], [sx, 1.24, z], polished);
    }
    const volume = material(new THREE.MeshBasicMaterial({ color: index === 1 ? visual.liquidCoat : visual.liquid, transparent: true, opacity: index === 1 ? .64 : .48, depthWrite: false }));
    const waterVolume = box(tank, [2.93, 1.34, 2.29], [0, liquidY - .67, 0], volume); waterVolume.renderOrder = 2;
    const water = material(new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uImpact: { value: 0 }, uDark: { value: 0 }, uTone: { value: index === 1 ? .48 : 1 } },
      vertexShader: `varying vec2 vUv; uniform float uTime; uniform float uImpact;
        void main(){vUv=uv; vec3 p=position; p.z+=sin(p.x*7.+uTime*.8)*cos(p.y*6.-uTime*.6)*(.0015+uImpact*.01); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uImpact; uniform float uDark; uniform float uTone;
        void main(){vec2 p=(vUv-.5)*vec2(1.28,1.); float r=length(p);
          float ring=sin(r*48.-uTime*5.)*.5+.5; ring=pow(ring,7.)*exp(-r*5.5)*uImpact;
          float wave=sin(p.x*11.+sin(p.y*6.)*.4+uTime*.35)*cos(p.y*9.-uTime*.3);
          float reflection=pow(clamp(.52+wave*.25+sin(p.x*4.-p.y*3.)*.12,0.,1.),6.);
          float edge=1.-smoothstep(0.,.035,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
          vec3 base=mix(vec3(.025,.38,.62),vec3(.025,.19,.32),uDark)*uTone;
          vec3 color=base+vec3(.32,.34,.34)*(reflection*.22+ring*.6+edge*.2);
          gl_FragColor=vec4(color,.78);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    const surface = new THREE.Mesh(geometry(new THREE.PlaneGeometry(2.94, 2.3, 16, 12)), water);
    surface.rotation.x = -Math.PI / 2; surface.position.y = liquidY; surface.renderOrder = 3; tank.add(surface);
    for (const z of [-1.24, 1.24]) {
      box(tank, [3.19, .1, .105], [0, 2.065, z], polished, true);
      box(tank, [3.18, .045, .06], [0, .47, z], steelDark);
    }
    for (const sx of [-1.55, 1.55]) box(tank, [.105, .1, 2.48], [sx, 2.065, 0], polished, true);
    // Sparse panel fasteners and a restrained reflection stripe give the glass a readable thickness.
    for (const sx of [-1.38, 1.38]) for (const y of [.66, 1.77]) bolt(tank, sx, y, 1.245);
    const reflection = material(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .12, depthWrite: false }));
    const stripe = box(tank, [.038, 1.4, .005], [-1.19, 1.23, 1.234], reflection); stripe.renderOrder = 6;
    baths.push({ surface: water, front, side, volume, back });
  }

  for (const x of [alphaLoadingX, alphaUnloadingX]) {
    const bay = new THREE.Group(); bay.position.x = x; equipment.add(bay);
    box(bay, [1.68, .12, 1.75], [0, .63, 0], bayMaterial, true);
    box(bay, [1.56, .045, 1.65], [0, .71, 0], polished);
    for (const sx of [-.62, .62]) for (const z of [-.65, .65]) box(bay, [.075, .33, .075], [sx, .435, z], steelDark);
    for (const z of [-.66, .66]) box(bay, [1.25, .07, .07], [0, .77, z], gasket, true);
    // Two shallow receiving guides support the released panel in its upright orientation.
    for (const sx of [-.33, .33]) box(bay, [.11, .12, .23], [sx, .79, 0], steelDark, true);
  }

  const trolley = new THREE.Group(); equipment.add(trolley);
  box(trolley, [.64, .16, 1.65], [0, 5.48, 0], metal, true);
  box(trolley, [.44, .32, .43], [0, 5.29, 0], steelDark, true);
  box(trolley, [.49, .17, .47], [0, 5.23, 0], polished, true);
  const wheelGeometry = geometry(new THREE.CylinderGeometry(.13, .13, .09, 20));
  const wheels: THREE.Mesh[] = [];
  for (const x of [-.23, .23]) for (const z of [-.69, .69]) {
    const wheel = new THREE.Mesh(wheelGeometry, steelDark);
    wheel.rotation.x = Math.PI / 2; wheel.position.set(x, 5.46, z); trolley.add(wheel); wheels.push(wheel);
    bolt(trolley, x, 5.46, z + .06);
  }
  const fixture = new THREE.Group(); trolley.add(fixture);
  box(fixture, [.97, .07, .11], [0, 0, 0], polished, true);
  const hookGeometry = geometry(new THREE.TorusGeometry(.085, .018, 6, 20, Math.PI * 1.75));
  const topHook = new THREE.Mesh(hookGeometry, metal); topHook.position.y = .1; fixture.add(topHook);
  const jaws = [-.34, .34].map(x => {
    const jaw = new THREE.Group(); jaw.position.set(x, -.02, 0); fixture.add(jaw);
    rod(jaw, [0, 0, 0], [0, -.18, 0], .018);
    const hook = new THREE.Mesh(hookGeometry, polished); hook.scale.setScalar(.55); hook.position.y = -.15; jaw.add(hook);
    return jaw;
  });
  const cables = [-.12, .12].map(z => rod(trolley, [0, railY - .18, z], [0, alphaRaisedY + .14, z], .012, steelDark));

  const panelShape = new THREE.Shape();
  panelShape.moveTo(-.47, -.63); panelShape.lineTo(.47, -.63); panelShape.lineTo(.47, .63); panelShape.lineTo(-.47, .63); panelShape.closePath();
  for (const x of [-.34, .34]) for (const y of [-.48, 0, .48]) {
    const hole = new THREE.Path(); hole.absarc(x, y, .033, 0, Math.PI * 2, true); panelShape.holes.push(hole);
  }
  const panelGeometry = geometry(new THREE.ExtrudeGeometry(panelShape, { depth: .075, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .016, bevelThickness: .012, curveSegments: 10 }));
  panelGeometry.translate(0, 0, -.0375);
  const immersion = { level: { value: -20 }, tint: { value: new THREE.Color(0x238eb8) } };
  function panelMaterial() {
    const mat = material(new THREE.MeshPhysicalMaterial({ color: 0xc9d4db, metalness: .8, roughness: .27, clearcoat: .35, clearcoatRoughness: .22, transparent: true, depthWrite: true }));
    mat.onBeforeCompile = shader => {
      shader.uniforms.uBathLevel = immersion.level; shader.uniforms.uBathTint = immersion.tint;
      shader.vertexShader = "varying float vBathHeight;\n" + shader.vertexShader.replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvBathHeight=(modelMatrix*vec4(transformed,1.)).y;");
      shader.fragmentShader = "varying float vBathHeight; uniform float uBathLevel; uniform vec3 uBathTint;\n" + shader.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\nfloat submerged=1.-smoothstep(uBathLevel-.035,uBathLevel+.035,vBathHeight); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.48+uBathTint*.28,submerged);");
    };
    mat.customProgramCacheKey = () => "alpha-panel-immersion-v1";
    return mat;
  }
  const carriedMaterial = panelMaterial();
  const carried = new THREE.Mesh(panelGeometry, carriedMaterial); carried.position.y = -.83; carried.castShadow = true; fixture.add(carried);
  const finishedMaterial = panelMaterial();
  const finished = new THREE.Mesh(panelGeometry, finishedMaterial);
  finished.position.set(alphaUnloadingX, alphaUnloadY - .83, 0); finished.castShadow = true; equipment.add(finished);

  const staticLoads = new THREE.Group(); equipment.add(staticLoads);
  const staticMaterials: THREE.MeshPhysicalMaterial[] = [];
  for (const [i, x] of alphaStations.entries()) {
    const mat = panelMaterial(); staticMaterials.push(mat);
    const panel = new THREE.Mesh(panelGeometry, mat); panel.position.set(x, 2.66, 0); staticLoads.add(panel);
    rod(staticLoads, [x, railY - .1, 0], [x, 3.4, 0], .018, steelDark);
    box(staticLoads, [.8, .06, .08], [x, 3.4, 0], polished);
    for (const dx of [-.32, .32]) rod(staticLoads, [x + dx, 3.4, 0], [x + dx, 3.27, 0], .015);
    mat.color.set(i === 0 ? 0xc9d4db : 0x303c46);
    mat.metalness = i === 0 ? .8 : .42;
  }

  // Exclude the floor/shadow planes and transient effects from the machinery fit.
  // Collect geometry in the same view axes at both ends and all lift extremes.
  const fixedObjects = equipment.children.filter(child => child !== trolley);
  const framingBounds = alphaViewBounds(fixedObjects, camera);
  for (const x of [alphaLoadingX, alphaUnloadingX]) {
    trolley.position.x = x;
    for (const y of [alphaRaisedY, alphaUnloadY, alphaImmersedY]) {
      fixture.position.y = y;
      jaws.forEach((jaw, i) => { jaw.rotation.z = (i === 0 ? -1 : 1) * .42; });
      framingBounds.union(alphaViewBounds([trolley], camera));
    }
  }
  trolley.position.x = alphaLoadingX; fixture.position.y = alphaRaisedY;
  jaws.forEach(jaw => { jaw.rotation.z = 0; });

  const dropletGeometry = geometry(new THREE.SphereGeometry(.025, 6, 8));
  const dropletMaterial = material(new THREE.MeshPhysicalMaterial({ color: 0x65c9eb, metalness: .15, roughness: .1, transparent: true, opacity: .7, depthWrite: false }));
  const droplets = Array.from({ length: 7 }, () => {
    const drop = new THREE.Mesh(dropletGeometry, dropletMaterial); drop.scale.set(1, 1.6, 1); equipment.add(drop); return drop;
  });
  const sweepMaterial = material(new THREE.MeshBasicMaterial({ color: 0xcbefff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const sweep = new THREE.Mesh(geometry(new THREE.PlaneGeometry(.11, 1.24)), sweepMaterial);
  sweep.rotation.z = -.28; sweep.renderOrder = 7; equipment.add(sweep);

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const savingData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  let paused = options.paused, visible = false, disposed = false, lostContext = false;
  const review=new URLSearchParams(location.search).get("process-time");
  let revealing=false;
  let elapsed = review!==null?Number(review)||0:0, previous = 0, frame = 0, lastStage = -2, ready = false;
  let revealFrame = 0;
  let pixelWidth = 0, pixelHeight = 0, lastDpr = 0;
  const silver = new THREE.Color(0xc9d4db), graphite = new THREE.Color(0x29343e);
  const isDark = () => document.documentElement.dataset.theme === "dark";
  const isStatic = () => motion.matches || savingData;

  function palette() {
    const dark = isDark();
    const colors = alphaVisualColors(dark);
    metal.color.set(colors.metal);
    polished.color.set(colors.polished);
    steelDark.color.set(colors.steelDark);
    railEdge.color.set(colors.railEdge);
    foundation.color.set(colors.foundation);
    bayMaterial.color.set(colors.bay);
    hemisphere.intensity = colors.hemisphere;
    key.intensity = colors.key;
    rim.intensity = colors.rim;
    scene.environmentIntensity = colors.environment;
    shadowMaterial.opacity = colors.shadowOpacity;
    shadowMaterial.color.set(colors.shadowColor);
    contactMaterial.opacity = colors.contactOpacity;
    baths.forEach((bath, i) => {
      bath.front.color.set(colors.glass);
      bath.front.opacity = colors.glassOpacity;
      bath.side.color.copy(bath.front.color);
      bath.back.color.set(colors.tankBack);
      bath.volume.color.set(i === 1 ? colors.liquidCoat : colors.liquid);
      bath.surface.uniforms.uDark.value = colors.liquidDark;
    });
    canvas.dataset.theme = dark ? "dark" : "light";
  }

  function apply(state: AlphaState) {
    const still = isStatic();
    trolley.position.x = state.x;
    fixture.position.y = state.y;
    staticLoads.visible = still;
    trolley.visible = !still;
    carried.visible = state.attached && state.partOpacity > .001;
    carriedMaterial.opacity = state.partOpacity;
    carriedMaterial.color.copy(silver).lerp(graphite, state.coating);
    carriedMaterial.metalness = THREE.MathUtils.lerp(.8, .38, state.coating);
    carriedMaterial.roughness = THREE.MathUtils.lerp(.27, .29, state.coating) - state.wet * .035 - state.sheen * .05;
    carriedMaterial.clearcoat = .25 + state.coating * .25 + state.sheen * .45;
    finished.visible = still || state.finishedOpacity > .001;
    finishedMaterial.color.copy(graphite);
    finishedMaterial.metalness = .38; finishedMaterial.roughness = .26; finishedMaterial.clearcoat = .7;
    finishedMaterial.opacity = still ? 1 : state.finishedOpacity;
    immersion.level.value = !still && state.stage > 0 && state.stage < 4 && state.phase !== "travel" ? liquidY : -20;
    cables.forEach(cable => {
      const top = railY - .18, bottom = state.y + .16;
      cable.position.y = (top + bottom) / 2; cable.scale.y = Math.max(.01, top - bottom);
    });
    wheels.forEach(wheel => { wheel.rotation.z = state.x * 2; });
    jaws.forEach((jaw, i) => { jaw.rotation.z = (i === 0 ? -1 : 1) * state.jawOpen * .42; });
    baths.forEach((bath, i) => {
      bath.surface.uniforms.uTime.value = !still && state.stage === i + 1 ? elapsed : 0;
      const active = !still && state.stage === i + 1 && ["lower", "hold", "raise", "drain"].includes(state.phase);
      const complete = !still && (state.stage > i + 1 || state.stage === i + 1 && state.phase === "travel" || state.phase === "return");
      stackLights[i].setState(active ? "active" : complete ? "complete" : "idle");
      bath.surface.uniforms.uImpact.value = !still && state.stage === i + 1 ? state.ripple : 0;
    });
    droplets.forEach((drop, i) => {
      const age = state.drain * .7 - i * .065;
      const dropY = state.y - 1.45 - .6 * age - 4.9 * age * age;
      drop.visible = !still && state.phase === "drain" && age > 0 && age < .65 && dropY > liquidY;
      drop.position.set(state.x + ((i % 3) - 1) * .28, dropY, (i % 2 ? -.05 : .05));
    });
    const unloadSweep = !still && !state.attached && state.sheen > 0;
    sweep.visible = unloadSweep;
    sweep.position.set(alphaUnloadingX - .65 + Math.min(1, (state.time - 22.8) / 1.2) * 1.3, alphaUnloadY - .83, .064);
    sweepMaterial.opacity = state.sheen * .28;
    const stage = still ? -1 : state.stage;
    if (stage !== lastStage) { lastStage = stage; options.onStage(stage); }
    canvas.dataset.phase = still ? "static" : state.phase;
    canvas.dataset.stage = String(stage);
    canvas.dataset.animationTime = state.time.toFixed(3);
    canvas.dataset.attached = String(state.attached);
    canvas.dataset.motion = still ? "reduced" : "full";
  }

  function render() {
    if (disposed || lostContext || !pixelWidth || !pixelHeight) return;
    apply(alphaStateAt(elapsed));
    renderer.render(scene, camera);
    if (!ready && !revealing) {
      revealing=true;
      // Commit the fitted first frame before revealing it or advancing the clock.
      revealFrame = requestAnimationFrame(() => {
        revealFrame = 0;
        if (disposed || lostContext) return;
        render();void handoff.reveal().then(()=>{if(disposed)return;ready = true;options.onReady();resume();});
      });
    }
  }
  function stop() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    canvas.dataset.running = "false";
  }
  function tick(now: number) {
    if(quality.sample(now)){renderer.shadowMap.enabled=quality.shadows;resize();}
    frame = 0;
    if (disposed || !visible || document.hidden || paused || isStatic() || lostContext) { stop(); return; }
    elapsed = Math.min(alphaDuration,elapsed+(previous ? Math.min((now - previous) / 1000, .1) : 0));
    previous = now;
    render();
    if(elapsed>=alphaDuration){paused=true;stop();options.onEnded?.();return;}
    canvas.dataset.running = "true";
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if(review!==null){if(ready)render();return;}
    stop(); render();
    if (ready && !disposed && visible && !document.hidden && !paused && !isStatic() && !lostContext) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    const dpr = quality.ratio;
    const w = Math.round(width), h = Math.round(height);
    if (w !== pixelWidth || h !== pixelHeight || dpr !== lastDpr) {
      pixelWidth = w; pixelHeight = h; lastDpr = dpr;
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      const padding = fitAlphaCamera(camera, framingBounds, width, height);
      canvas.dataset.framePadding = String(padding);
      canvas.dataset.frameInsets = JSON.stringify({
        top: (camera.top - framingBounds.max.y) / (camera.top - camera.bottom) * height,
        bottom: (framingBounds.min.y - camera.bottom) / (camera.top - camera.bottom) * height,
        left: (framingBounds.min.x - camera.left) / (camera.right - camera.left) * width,
        right: (camera.right - framingBounds.max.x) / (camera.right - camera.left) * width,
      });
      positionAlphaLabels(host, [alphaLoadingX, ...alphaStations, alphaUnloadingX].map(x => alphaStationPosition(camera, x)));
    }
    render();
  }
  function onTheme() { palette(); render(); }
  function onVisibility() { if (document.hidden) stop(); else resume(); }
  function onContextLost(event: Event) {
    event.preventDefault(); lostContext = true; stop(); canvas.hidden = true;
    handoff.fallback();host.dataset.fallback = "true"; host.dataset.ready = "false";
  }
  function onContextRestored() {
    lostContext = false; canvas.hidden = false; delete host.dataset.fallback;
    host.dataset.ready = "true";
    positionAlphaLabels(host, [alphaLoadingX, ...alphaStations, alphaUnloadingX].map(x => alphaStationPosition(camera, x)));
    palette(); resume();
  }
  await yieldToBrowser();
  await renderer.compileAsync(scene,camera);
  const resizing = new ResizeObserver(resize); resizing.observe(host);
  const themes = new MutationObserver(onTheme); themes.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, { threshold: .08 }); view.observe(host);
  motion.addEventListener("change", resume);
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  canvas.dataset.kind = "alpha-process"; canvas.dataset.duration = String(alphaDuration);
  palette(); resize();
  return {
    setPaused(value) { paused = value; resume(); },
    replay() { paused = false; elapsed = 0; resume(); },
    dispose() {
      disposed = true;handoff.dispose(); stop(); cancelAnimationFrame(revealFrame); resizing.disconnect(); themes.disconnect(); view.disconnect();
      motion.removeEventListener("change", resume); document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost); canvas.removeEventListener("webglcontextrestored", onContextRestored);
      geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose());
      environment.dispose(); renderer.dispose();
    },
  };
}
