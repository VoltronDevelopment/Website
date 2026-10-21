import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { mountLotStory, type LotStoryController } from "../components/home/lot-story-renderer";

const gpu = vi.hoisted(() => ({ compile: vi.fn(), render: vi.fn(), dispose: vi.fn(), lose: vi.fn() }));
vi.mock("three", async original => {
  const actual = await original<typeof import("three")>();
  return { ...actual,
    WebGLRenderer: class { setClearColor() {} setPixelRatio() {} setSize() {} compileAsync = gpu.compile; render = gpu.render; dispose = gpu.dispose; forceContextLoss = gpu.lose; },
    PMREMGenerator: class { fromScene() { return new actual.WebGLRenderTarget(1, 1); } dispose() {} },
  };
});
let controller: LotStoryController | undefined;
let intersect: (visible: boolean) => void;
let motion: { matches: boolean; addEventListener: (name: string, callback: () => void) => void; removeEventListener: () => void };
let changeMotion: () => void;
let listeners: Map<string, (event: Event) => void>;
let frames: Map<number, FrameRequestCallback>;
let clock: number;
let narrow: boolean;

function fixture(initialTime: number | null = null) {
  const rect = (x: number, width: number) => ({ left: x, top: 44, width, height: 280, right: x + width, bottom: 324 });
  const anchors = [0, 1, 2, 3].map(index => ({ getBoundingClientRect: () => rect(narrow ? 0 : index * 290, narrow ? 320 : 250) }));
  const canvas = { dataset: {} as Record<string, string>, hidden: false, addEventListener: (name: string, cb: (event: Event) => void) => listeners.set(name, cb), removeEventListener: (name: string) => listeners.delete(name) };
  const host = { dataset: {} as Record<string, string>, querySelectorAll: () => anchors, getBoundingClientRect: () => ({ left: 0, top: 0, width: narrow ? 320 : 1120, height: 372 }) };
  const onState = vi.fn(), onReady = vi.fn();
  controller = mountLotStory(canvas as unknown as HTMLCanvasElement, host as unknown as HTMLDivElement, { initialTime, onState, onReady });
  return { canvas, host, onState, onReady, scene: controller };
}
function advance(count: number) {
  for (let i = 0; i < count; i++) { clock += 100; const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(clock)); }
}

beforeEach(() => {
  vi.clearAllMocks(); gpu.compile.mockReset().mockResolvedValue(undefined);
  controller = undefined; frames = new Map(); listeners = new Map(); clock = 100; narrow = false; let next = 1;
  motion = { matches: false, addEventListener: (_name, callback) => { changeMotion = callback; }, removeEventListener() {} };
  vi.stubGlobal("document", { hidden: false, documentElement: { dataset: { theme: "dark" } }, querySelector: () => ({ getBoundingClientRect: () => ({ height: 80 }) }),
    addEventListener: (name: string, cb: (event: Event) => void) => listeners.set(name, cb), removeEventListener: (name: string) => listeners.delete(name), createElement: () => ({ width: 0, height: 0, getContext: () => ({ createRadialGradient: () => ({ addColorStop() {} }), fillRect() {} }) }),
  });
  vi.stubGlobal("location", { search: "" }); vi.stubGlobal("innerHeight", 900); vi.stubGlobal("devicePixelRatio", 1);
  vi.stubGlobal("matchMedia", (query: string) => query.includes("reduced-motion") ? motion : { matches: narrow });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { const id = next++; frames.set(id, callback); return id; });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("MutationObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersect = visible => callback([{ isIntersecting: visible, intersectionRect: { height: visible ? 300 : 0 }, boundingClientRect: { height: 372 }, rootBounds: { height: 820 } } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
    observe() {} disconnect() {}
  });
});
afterEach(() => { controller?.dispose(); vi.unstubAllGlobals(); });

describe("synchronized lot scene controller", () => {
  it("plays once, keeps all four snapshots stationary and stops at the completed view", async () => {
    const { scene, canvas, onState } = fixture(); await scene.ready;
    const rendered = gpu.render.mock.lastCall?.[0] as THREE.Scene;
    const snapshotGroups = rendered.children.filter(child => child instanceof THREE.Group).slice(0, 4);
    const positions = snapshotGroups.map(group => group.position.toArray());
    intersect(true); advance(155);
    expect(canvas.dataset.settled).toBe("true"); expect(canvas.dataset.running).toBe("false"); expect(frames.size).toBe(0);
    expect(snapshotGroups.map(group => group.position.toArray())).toEqual(positions);
    expect(onState.mock.lastCall?.[0].evidence).toEqual([true, true, true, true, true]);
  });
  it("pauses, suspends offscreen, resumes and replays without losing coherence", async () => {
    const { scene, canvas } = fixture(); await scene.ready; intersect(true); advance(12);
    scene.setPaused(true); const time = canvas.dataset.animationTime; advance(10); expect(canvas.dataset.animationTime).toBe(time);
    scene.setPaused(false); advance(4); expect(Number(canvas.dataset.animationTime)).toBeGreaterThan(Number(time));
    intersect(false); const offscreen = canvas.dataset.animationTime; advance(10); expect(canvas.dataset.animationTime).toBe(offscreen);
    intersect(true); advance(155); scene.replay(); expect(canvas.dataset.phase).toBe("receive"); expect(canvas.dataset.animationTime).toBe("0.000");
  });
  it("stage selection pauses playback and keeps human release before Dispatch", async () => {
    const { scene, onState, canvas } = fixture(); await scene.ready; intersect(true); advance(3);
    scene.select(9); expect(canvas.dataset.phase).toBe("review"); expect(frames.size).toBe(0);
    expect(onState.mock.lastCall?.[0].stage).toBe(2); expect(onState.mock.lastCall?.[0].released).toBe(false);
    scene.select(14); expect(onState.mock.lastCall?.[0].released).toBe(true); expect(onState.mock.lastCall?.[0].stage).toBe(3);
  });
  it("suspends in a hidden document without advancing the story clock", async () => {
    const { scene, canvas } = fixture(); await scene.ready; intersect(true); advance(6);
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    listeners.get("visibilitychange")?.(new Event("visibilitychange"));
    const time = canvas.dataset.animationTime; advance(20); expect(canvas.dataset.animationTime).toBe(time); expect(frames.size).toBe(0);
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    listeners.get("visibilitychange")?.(new Event("visibilitychange")); advance(4);
    expect(Number(canvas.dataset.animationTime)).toBeGreaterThan(Number(time));
  });
  it("shows only the selected mobile snapshot while preserving its lot placement", async () => {
    narrow = true;
    const { scene, host } = fixture(); await scene.ready;
    const rendered = gpu.render.mock.lastCall?.[0] as THREE.Scene;
    const snapshots = rendered.children.filter(child => child instanceof THREE.Group).slice(0, 4);
    expect(host.dataset.layout).toBe("single"); expect(snapshots.filter(group => group.visible)).toEqual([snapshots[0]]);
    const initial = snapshots[0].position.toArray(); scene.select(14);
    expect(snapshots.filter(group => group.visible)).toEqual([snapshots[3]]); expect(snapshots[3].position.toArray()).toEqual(initial);
  });
  it("settles immediately on reduced motion and supports still snapshot selection", async () => {
    const { scene, canvas } = fixture(); await scene.ready; intersect(true); advance(4);
    motion.matches = true; changeMotion(); expect(canvas.dataset.settled).toBe("true"); expect(frames.size).toBe(0);
    scene.select(8); expect(canvas.dataset.phase).toBe("review"); expect(frames.size).toBe(0);
  });
  it("restores the completed fallback and releases preparation on context loss during compile", async () => {
    gpu.compile.mockImplementation(() => new Promise(() => {}));
    const { scene, host, canvas, onState } = fixture(); await vi.waitFor(() => expect(gpu.compile).toHaveBeenCalledOnce());
    listeners.get("webglcontextlost")?.({ preventDefault() {} } as unknown as Event);
    await scene.ready; expect(host.dataset.renderer).toBe("fallback"); expect(canvas.hidden).toBe(true);
    expect(onState.mock.lastCall?.[0].settled).toBe(true); expect(gpu.dispose).toHaveBeenCalledOnce(); scene.dispose(); expect(gpu.dispose).toHaveBeenCalledOnce();
  });
});
