import {createSceneHandoff} from "../performance/scene-handoff";
import {createRenderQuality} from "../performance/scene-policy";
import * as THREE from "three";
import { capabilityGlassVisibility, capabilityEdgeWidth } from "./capability-cube-style";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {createMachiningPartGeometry,millingPosition} from './machining-part';
import { glassFace, setGlass, nodeHaloTexture, stroke, strokeMaterial, type GlassFace } from "./lattice-materials";
import { factorySystemsCanStart } from "./factory-systems-visibility";
import { lotStageTimes, lotStoryDuration, lotStoryStateAt, type LotStoryState } from "./lot-story-timeline";
import {createLotReveal} from './lot-story-particles';

type Options = { initialTime: number | null; onState: (state: LotStoryState) => void; onReady: (ready: boolean) => void };
export type LotStoryController = { ready: Promise<void>; select: (time: number) => void; replay: () => void; setPaused: (value: boolean) => void; dispose: () => void };
type Line = ReturnType<typeof stroke>;

/** One travelling lot, fixed stage equipment and evidence driven by a single clock. */
export function mountLotStory(canvas: HTMLCanvasElement, host: HTMLDivElement, options: Options): LotStoryController {
  const handoff=createSceneHandoff(host,canvas);
  const quality=createRenderQuality(canvas,1.5);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const params = new URLSearchParams(location.search);
  const previewTime = params.has("lot-time") ? Number(params.get("lot-time")) : NaN;
  const preview = Number.isFinite(previewTime), composition = params.get("animate") === "0" || params.get("artwork") === "composition";
  let elapsed = preview ? Math.max(0, Math.min(lotStoryDuration, previewTime)) : options.initialTime ?? (motion.matches || composition ? lotStoryDuration : 0);
  let paused = options.initialTime !== null, frame = 0, previous = 0, disposed = false, failed = false, prepared = false, released = false, visible = false, started = false;
  let cancelPreparation: () => void = () => {};
  const cancelled = new Promise<void>(resolve => { cancelPreparation = resolve; });
  let renderer: THREE.WebGLRenderer;
  try {
    if (params.get("renderer") === "static") throw new Error("Static artwork requested");
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: params.get("lot-poster") === "1" });
  } catch {
    handoff.fallback();host.dataset.renderer = "fallback"; canvas.hidden = true; options.onState(lotStoryStateAt(options.initialTime ?? lotStoryDuration)); options.onReady(false);
    return { ready: Promise.resolve(), select() {}, replay() {}, setPaused() {}, dispose() {} };
  }
  renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-6, 6, 2, -2, .1, 100);
  // Alpha's viewing direction, relative to its look-at point; materials stay shared.
  camera.position.set(-8, 6, 16); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1), forward = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2);
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  const geometry = <T extends THREE.BufferGeometry>(value: T) => { geometries.add(value); return value; };
  const material = <T extends THREE.Material>(value: T) => { materials.add(value); return value; };
  let environment: THREE.WebGLRenderTarget | undefined;
  let unitPixels = 80, mobile = false, width = 0, height = 0, lastSignature = "";
  const anchors = Array.from(host.querySelectorAll<HTMLElement>("[data-lot-story-anchor]"));
  const destinations = Array.from({ length: 4 }, () => new THREE.Vector3());
  const stationMarkers=destinations.map((_,i)=>{const group=new THREE.Group();group.name='lot-station-'+i;scene.add(group);return group;});
  // On the front rail, with the projected node centred under its station.
  const historyOffset = new THREE.Vector3(-right.z / right.x * 1.22, -.94, 1.22);
  const metal = material(new THREE.MeshPhysicalMaterial({ color: 0xaabac7, metalness: .86, roughness: .28, clearcoat: .18, envMapIntensity: .8 }));
  const steel = material(new THREE.MeshStandardMaterial({ color: 0x7895a9, metalness: .7, roughness: .34 }));
  const darkSteel = material(new THREE.MeshStandardMaterial({ color: 0x325168, metalness: .65, roughness: .4 }));
  const supportGlass = material(glassFace("side")); supportGlass.userData.glassConveyor = true;
  const frameEdge = material(new THREE.LineBasicMaterial({ color: 0x397cae, transparent: true, opacity: .38, depthWrite: false }));
  const housingGeometry = geometry(createMachiningPartGeometry()), boxGeometry = geometry(new THREE.BoxGeometry(1, 1, 1));
  const frameGeometry = geometry(new THREE.EdgesGeometry(boxGeometry));
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
    const mesh = new THREE.Mesh(boxGeometry, mat); mesh.scale.fromArray(size); mesh.position.fromArray(position);
    if (mat.userData.glassConveyor) mesh.add(new THREE.LineSegments(frameGeometry, frameEdge));
    parent.add(mesh); return mesh;
  }
  const half = .825;
  const corners = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(i & 1 ? half : -half, i & 2 ? half : -half, i & 4 ? half : -half));
  const pairs = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const faces: { kind: GlassFace; p: number[]; r: number[]; front: boolean }[] = [
    { kind: "rear", p: [half, 0, 0], r: [0, Math.PI / 2, 0], front: false },
    { kind: "side", p: [-half, 0, 0], r: [0, -Math.PI / 2, 0], front: true },
    { kind: "top", p: [0, half, 0], r: [-Math.PI / 2, 0, 0], front: true },
    { kind: "bottom", p: [0, -half, 0], r: [Math.PI / 2, 0, 0], front: false },
    { kind: "front", p: [0, 0, half], r: [0, 0, 0], front: true },
    { kind: "rear", p: [0, 0, -half], r: [0, Math.PI, 0], front: false },
  ];
  const snapshots = destinations.slice(0,1).map((_, index) => {
    const root = new THREE.Group();root.name='lot-carrier'; scene.add(root);
    const panes = faces.map(spec => {
      const mat = material(glassFace(spec.kind, false,true,"display")); mat.forceSinglePass = true;
      const pane = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.65, 1.65)), mat);
      pane.position.fromArray(spec.p); pane.rotation.set(spec.r[0], spec.r[1], spec.r[2]); pane.renderOrder = spec.front ? 5 : 1; root.add(pane);
      return { mat, kind: spec.kind, base: 0 };
    });
    const edges = pairs.map(([a, b]) => {
      const front = a !== 1 && b !== 1;
      const mat = material(strokeMaterial(front)); mat.userData.cssWidth = front ? capabilityEdgeWidth.front : capabilityEdgeWidth.rear;
      const line = stroke([corners[a], corners[b]], mat); geometry(line.geometry); line.renderOrder = front ? 6 : 2; root.add(line);
      const glows: Line[] = front ? [] : capabilityEdgeWidth.glow.map((size, layer) => {
        const glowMat = material(strokeMaterial(false)); glowMat.userData.cssWidth = size;
        const glow = stroke([corners[a], corners[b]], glowMat); glow.geometry.dispose(); glow.geometry = line.geometry; glow.renderOrder = layer ? 1.5 : .5; root.add(glow); return glow;
      });
      return { line, glows, front,point:corners[a].clone().lerp(corners[b],.5) };
    });
    const housing = new THREE.Mesh(housingGeometry, metal); housing.name='shared-flange-housing';housing.scale.setScalar(.64); housing.position.set(-.03, -.12, .07); housing.renderOrder = 3; root.add(housing);
    // A stable locating plate and two jaws support the part during the conceptual process action.
    const plate = box(root, [1.38, .045, 1.04], [0, -.70, .02], supportGlass); plate.renderOrder = 3;
    plate.rotation.y = 0;
    for (const z of [-.3, .3]) box(root, [1.04, .1, .12], [0, -.775, z], supportGlass).renderOrder = 3;
    const shadow = new THREE.Mesh(shadowGeometry, shadowMat); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.672; shadow.renderOrder = 3; root.add(shadow);
    if (index === 1) for (const x of [-.63, .63]) box(root, [.14, .17, .52], [x, -.61, .05], darkSteel).renderOrder = 3;
    const nodes = corners.map((point, corner) => {
      const mat = material(new THREE.MeshBasicMaterial({ color: 0x65caff, transparent: true, depthWrite: false, toneMapped: false }));
      const mesh = new THREE.Mesh(sphereGeometry, mat); mesh.position.copy(point); mesh.renderOrder = corner !== 1 ? 7 : 2; root.add(mesh); return { mesh, front: corner !== 1 };
    });
    const halo = new THREE.Sprite(material(new THREE.SpriteMaterial({ map: haloTexture, transparent: true, depthWrite: false, opacity: .1, toneMapped: false })));
    halo.position.copy(corners[1]); halo.renderOrder = 2; root.add(halo);
    return { root, panes, edges, nodes, halo };
  });
  const sharedCopies=new Map<THREE.Material,THREE.Material>();
  const reveal=createLotReveal(snapshots[0].root,housingGeometry,geometry,material);
  snapshots[0].root.traverse(object=>{const mesh=object as THREE.Mesh;if(!mesh.material||Array.isArray(mesh.material)||mesh.material instanceof THREE.ShaderMaterial||mesh.material instanceof THREE.SpriteMaterial||mesh.material===shadowMat)return;let mat=mesh.material;if([metal,supportGlass,frameEdge].includes(mat as never)){if(!sharedCopies.has(mat))sharedCopies.set(mat,material(mat.clone()));mat=sharedCopies.get(mat)!;mesh.material=mat;}reveal.bind(mat);});
  const toolStation=new THREE.Group();toolStation.name='lot-process-equipment';scene.add(toolStation);
  const tool = new THREE.Group();toolStation.add(tool);
  const spindle = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.14, .14, .32, 32)), steel); spindle.position.y = .12; tool.add(spindle);
  const collar = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.09, .12, .12, 24)), metal); collar.position.y = -.1; tool.add(collar);
  const bit = new THREE.Mesh(geometry(new THREE.CylinderGeometry(.018, .035, .18, 12)), metal); bit.position.y = -.24; tool.add(bit);
  const mark = box(tool, [.018, .22, .015], [.13, .12, .025], darkSteel);
  mark.renderOrder = 3; spindle.renderOrder = collar.renderOrder = bit.renderOrder = 3;
  tool.position.set(.25, .89, .08);
  const scanMaterial = material(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uOpacity: { value: .1 } },
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec2 vUv;uniform float uOpacity;void main(){
      float edge=1.-smoothstep(.01,.04,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
      float beam=1.-smoothstep(.015,.075,abs(vUv.x-.5));
      float falloff=smoothstep(0.,.12,vUv.y)*smoothstep(0.,.12,1.-vUv.y);
      gl_FragColor=vec4(.18,.68,1.,uOpacity*(.035+beam*.58*falloff+edge*.9));
      #include <colorspace_fragment>
    }`,
  }));
  const scanStation=new THREE.Group();scanStation.name='lot-inspection-equipment';scene.add(scanStation);
  const scan = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.43, 1.25)), scanMaterial); scan.rotation.x = -Math.PI / 2; scan.position.y = -.12; scan.renderOrder = 4;scanStation.add(scan);
  const scanCorners=[[-.715,0,-.625],[.715,0,-.625],[.715,0,.625],[-.715,0,.625]].map(p=>new THREE.Vector3(...p as [number,number,number]));
  const scanGlow=[{width:8,peak:.12},{width:4,peak:.28},{width:1.8,peak:.9}].map(spec=>{const mat=material(strokeMaterial(true));mat.userData.cssWidth=spec.width;mat.color.setHex(spec.width===1.8?0xc8f4ff:0x2eabff);const line=stroke(scanCorners.flatMap((p,i)=>[p,scanCorners[(i+1)%4]]),mat);geometry(line.geometry);line.renderOrder=4;scanStation.add(line);return {line,mat,...spec};});
  const conveyor = new THREE.Group();conveyor.name='lot-conveyor'; scene.add(conveyor);
  const treads:{mesh:THREE.Mesh;x:number}[]=[],rollers:THREE.Mesh[]=[];let conveyorLength=1;
  const treadMaterial=material(new THREE.MeshBasicMaterial({color:0x55b9ed,transparent:true,opacity:.22,depthWrite:false,toneMapped:false}));
  const conveyorGeometry: THREE.BufferGeometry[] = [];
  const railMat = material(glassFace("side")); railMat.userData.glassConveyor = true;
  const beltMat = material(glassFace("top")); beltMat.userData.glassConveyor = true;
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
  scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x26394b, .95));
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
    handoff.fallback();canvas.hidden = true; host.dataset.renderer = "fallback"; options.onReady(false); options.onState(lotStoryStateAt(paused ? elapsed : lotStoryDuration));
  }
  let renderedFrames=0;
  function render() { if (prepared && !disposed && !failed){renderer.render(scene, camera);canvas.dataset.renderedFrames=String(++renderedFrames);} }
  function apply() {
    const state = lotStoryStateAt(elapsed);
    // A motion-free summary keeps the released lot visible before its outgoing dissolve.
    const visual=(motion.matches||composition)&&state.settled?lotStoryStateAt(lotStageTimes[3]):state;
    const carrierSegment=Math.min(2,Math.floor(visual.position)),carrierFraction=visual.position-carrierSegment;
    snapshots.forEach(snapshot => {
      snapshot.root.position.lerpVectors(destinations[carrierSegment],destinations[carrierSegment+1],carrierFraction);snapshot.root.visible=true;
      snapshot.edges.forEach(({ line, glows, front,point }) => {
        const field=(point.x+.825)/1.65*.72,exitField=(point.x+.825)/1.65*.72;
        const visibility=THREE.MathUtils.smoothstep(visual.formation,field,field+.16)*(1-THREE.MathUtils.smoothstep(visual.departure,exitField,exitField+.16));
        line.material.opacity = (front ? dark() ? .38 : .42 : (dark() ? .78 : .65)*1.15)*visibility;
        glows.forEach((glow, layer) => { glow.material.opacity = (layer ? dark() ? .15 : .08 : dark() ? .07 : .035)*1.25*visibility; });
      });
      snapshot.panes.forEach(({ mat, base }) => { mat.opacity = base; mat.emissiveIntensity = .025; });
      snapshot.nodes.forEach(({ mesh, front }) => {mesh.scale.setScalar((front ? 1.2 : 1.6) / unitPixels);mesh.material.opacity=(front?.42:.85)*visual.formation*(1-visual.departure);});
      snapshot.halo.scale.setScalar(20/unitPixels);snapshot.halo.material.opacity=.25*visual.formation*(1-visual.departure);
    });
    reveal.update(visual.formation,visual.departure,visual.time,dark(),quality.ratio);shadowMat.opacity=.6*visual.formation*(1-visual.departure);
    toolStation.position.copy(destinations[1]);scanStation.position.copy(destinations[2]);stationMarkers.forEach((m,i)=>m.position.copy(destinations[i]));
    const working = state.phase === "process"&&state.position>=1&&state.position<1.001;
    toolStation.visible=working;
    const cutAt=millingPosition(state.process),approach=1-THREE.MathUtils.smoothstep(state.process,0,.12),retract=THREE.MathUtils.smoothstep(state.process,.88,1);
    tool.scale.setScalar(.7);tool.position.set(cutAt.x*.64-.03,cutAt.y*.64-.12,.515+(approach+retract)*.18);
    tool.rotation.set(Math.PI/2,working?state.process*Math.PI*12:0,0);
    const inspecting = state.phase === "verify"&&state.position>=2&&state.position<2.001;
    const sweep = state.inspection * state.inspection * (3 - 2 * state.inspection);
    scan.position.y = inspecting ? -.68 + sweep * 1.10 : -.12;
    scan.visible=inspecting;scanMaterial.uniforms.uOpacity.value=inspecting?.5+Math.sin(state.inspection*Math.PI)*.4:0;
    scanGlow.forEach(({line,mat,peak})=>{line.visible=inspecting;line.position.y=scan.position.y;mat.opacity=peak*(.5+.5*Math.sin(state.inspection*Math.PI));mat.color.setHex(peak===.9?(dark()?0xc8f4ff:0x1676cf):0x2eabff);});
    const travel=visual.belt*1.1;treads.forEach(({mesh,x})=>{mesh.position.x=((x-travel+conveyorLength/2)%conveyorLength+conveyorLength)%conveyorLength-conveyorLength/2;});rollers.forEach(r=>r.rotation.set(Math.PI/2,travel/.025,0));
    historyRoot.visible = !mobile;
    recordedHistory.geometry.setDrawRange(0, Math.floor(state.history) * 2);
    historyStations.forEach(({ node, leader }, index) => {
      node.position.copy(destinations[index]).add(historyOffset); leader.position.copy(node.position);
      node.scale.setScalar((state.stage === index ? 2.8 : 1.8) / unitPixels); node.material.opacity = index <= state.stage ? .85 : .3;
    });
    const pulseAt = Math.min(2.9999, state.history), segment = Math.floor(pulseAt), fraction = pulseAt - segment;
    historyPulse.position.lerpVectors(destinations[segment], destinations[segment + 1], fraction).add(historyOffset).addScaledVector(forward, .03);
    historyPulse.scale.setScalar(18 / unitPixels); historyPulse.material.opacity = fraction > .01 && fraction < .99 ? Math.sin(fraction * Math.PI) * .85 : 0;
    atmosphere.position.copy(destinations[mobile ? state.stage : 1]).addScaledVector(forward, -2); atmosphere.scale.set(mobile ? 3.4 : 8, 3.2, 1); atmosphere.material.opacity = dark() ? .1 : .025;
    const signature = `${state.phase}:${state.evidence.join("")}`;
    if (signature !== lastSignature) { lastSignature = signature; options.onState(state); }
    canvas.dataset.phase = state.phase; canvas.dataset.animationTime = state.time.toFixed(3); canvas.dataset.settled = String(state.settled); canvas.dataset.theme = dark() ? "dark" : "light";
    canvas.dataset.partIdentity='flange-housing';canvas.dataset.particleMotion='surface-particles';canvas.dataset.carrierCount='1';canvas.dataset.carrierPosition=snapshots[0].root.position.toArray().map(v=>v.toFixed(4)).join(',');canvas.dataset.lotPosition=state.position.toFixed(4);canvas.dataset.formation=visual.formation.toFixed(4);canvas.dataset.departure=visual.departure.toFixed(4);canvas.dataset.beltTravel=travel.toFixed(4);canvas.dataset.mobileConveyor=String(mobile);canvas.dataset.particles=String(reveal.points.visible);canvas.dataset.scanGlow=inspecting?'enhanced':'off';
    canvas.dataset.scanEnergy=String(scanMaterial.uniforms.uOpacity.value);canvas.dataset.lotStage=String(state.stage);
  }
  function palette() {
    snapshots.forEach(snapshot => {
      snapshot.panes.forEach(face => {
        setGlass(face.mat, face.kind, dark());
        face.base = face.mat.opacity * capabilityGlassVisibility(face.kind);
      });
      snapshot.edges.forEach(({ line, glows, front }) => {
        line.material.color.setHex(front ? dark() ? 0x6092b3 : 0x526f87 : dark() ? 0x73ceff : 0x2894bc);
        glows.forEach(glow => glow.material.color.setHex(dark() ? 0x58bfff : 0x2894bc));
      });
    });
    setGlass(railMat, "side", dark()); setGlass(beltMat, "top", dark()); setGlass(supportGlass, "side", dark());
    railMat.opacity = dark() ? .28 : .32; beltMat.opacity = dark() ? .15 : .2; supportGlass.opacity = .3;
    frameEdge.color.setHex(dark() ? 0x73ceff : 0x397cae);
    const carrierSupport=sharedCopies.get(supportGlass) as THREE.MeshPhysicalMaterial|undefined;if(carrierSupport){setGlass(carrierSupport,'side',dark());carrierSupport.opacity=.3;}
    (sharedCopies.get(frameEdge) as THREE.LineBasicMaterial|undefined)?.color.copy(frameEdge.color);treadMaterial.opacity=dark()?.24:.16;
    const connectionColor = dark() ? 0x36beda : 0x2894bc;
    connectionMat.color.setHex(connectionColor); recordedMat.color.setHex(connectionColor);
    historyStations.forEach(({ node }) => node.material.color.setHex(connectionColor));
    if (prepared && !failed && !disposed) { apply(); render(); }
  }
  function rebuildConveyor() {
    conveyor.clear();treads.length=rollers.length=0; conveyorGeometry.forEach(value => value.dispose()); conveyorGeometry.length = 0;
    const centre = mobile ? destinations[0].clone() : destinations[0].clone().add(destinations[3]).multiplyScalar(.5);
    const length = mobile ? 2.8 : destinations[0].distanceTo(destinations[3]) + 3;
    conveyorLength=length;
    const vertical = new THREE.Vector3(0, 1, 0);
    conveyor.quaternion.identity();
    conveyor.position.copy(centre).addScaledVector(vertical, -.94);
    box(conveyor, [length, .15, 2.25], [0, 0, 0], beltMat);
    // A continuous front fascia gives the rollers a supporting frame and visible thickness.
    box(conveyor, [length, .22, .075], [0, -.035, 1.14], railMat);
    for (const depth of [-1.14, 1.14]) box(conveyor, [length, .12, .055], [0, .06, depth], railMat);
    const rollerGeo = new THREE.CylinderGeometry(.025, .025, 2.2, 8); conveyorGeometry.push(rollerGeo);
    for (let x = -length / 2 + .12; x < length / 2; x += .24) { const roller = new THREE.Mesh(rollerGeo, supportGlass); roller.rotation.x = Math.PI / 2; roller.position.set(x, .09, 0); conveyor.add(roller);rollers.push(roller);const tread=box(conveyor,[.018,.012,2.12],[x,.117,0],treadMaterial);treads.push({mesh:tread,x}); }
    for (const x of mobile ? [-.9, .9] : [-length * .4, 0, length * .4]) box(conveyor, [.09, .39, .12], [x, -.25, .23], railMat);
    const positions = history.geometry.getAttribute("position") as THREE.BufferAttribute;
    destinations.forEach((p, i) => positions.setXYZ(i, p.x + historyOffset.x, p.y + historyOffset.y, p.z + historyOffset.z)); positions.needsUpdate = true;
    const recordedPositions = recordedHistory.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < 6; i++) {
      const point = destinations[Math.floor(i / 2) + i % 2];
      recordedPositions.setXYZ(i, point.x + historyOffset.x, point.y + historyOffset.y, point.z + historyOffset.z);
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
    const rise = mobile ? 0 : Math.abs(up.x / right.x) * (targets[3].left - targets[0].left) / 2;
    host.style?.setProperty("--lot-rise", `${rise}px`);
    const baseline = mobile ? 44 + targets[0].height * .43 : rise + 16 + 44 + targets[0].height * .43;
    targets.forEach((target, index) => {
      const worldX = mobile ? 0 : (target.left - bounds.left + target.width / 2 - width / 2) / (unitPixels * right.x);
      destinations[index].copy(up).multiplyScalar((height / 2 - baseline) / unitPixels).add(new THREE.Vector3(worldX, 0, 0));
      const offset = -worldX * up.x * unitPixels;
      anchors[index].parentElement?.style.setProperty("--lot-station-offset", `${offset}px`);
    });
    renderer.setPixelRatio(quality.ratio); renderer.setSize(width, height, false); host.dataset.layout = mobile ? "single" : "four";
    rebuildConveyor(); if (prepared) { apply(); render(); }
  }
  function tick(now: number) {
    if(quality.sample(now))resize();
    if (disposed || failed || !visible || document.hidden || paused) { stop(); return; }
    elapsed = Math.min(lotStoryDuration, elapsed + (previous ? Math.max(0, (now - previous) / 1000) : 0)); previous = now; apply(); render();
    if (elapsed < lotStoryDuration) frame = requestAnimationFrame(tick); else stop();
  }
  function resume() {
    if (!prepared || disposed || failed || host.dataset.sceneState!=="live") { stop(); return; }
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
      if (disposed || failed) return; prepared = true; apply(); render(); await handoff.reveal();if(disposed)return;host.dataset.renderer = "webgl"; canvas.dataset.ready = "true"; options.onReady(true); resume();
    } catch { if (!disposed) fail(); }
  })();
  return {
    ready: Promise.race([preparing, cancelled]),
    select(time) { if (disposed || failed) return; paused = true; elapsed = lotStoryStateAt(time).time; stop(); if (prepared) { apply(); render(); } },
    replay() { if (disposed || failed) return; elapsed = 0; paused = false; started = true; apply(); render(); resume(); },
    setPaused(value) { paused = value; resume(); },
    dispose() {
      if (disposed) return; disposed = true; handoff.dispose();stop(); cancelPreparation(); sizing.disconnect(); themes.disconnect(); view.disconnect(); motion.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", resume); canvas.removeEventListener("webglcontextlost", lost); release();
    },
  };
}
