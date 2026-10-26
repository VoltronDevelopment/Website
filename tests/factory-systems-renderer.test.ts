import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { mountFactorySystems, type FactorySystemsController } from "../components/home/factory-systems-renderer";

// The DOM dissolve is covered separately in scene-handoff.test.ts; keep GPU/controller tests deterministic.
vi.mock("../components/performance/scene-handoff",()=>({createSceneHandoff:(host:HTMLElement)=>({
  async reveal(){host.dataset.sceneState="live";},
  fallback(){host.dataset.sceneState="fallback";},dispose(){},
})}));

const gpu = vi.hoisted(() => ({ compile: vi.fn(), render: vi.fn(), dispose: vi.fn(), lose: vi.fn() }));

// Exercise the real scene/controller without a browser, credentials or a physical GPU.
vi.mock("three", async importOriginal => {
  const actual = await importOriginal<typeof import("three")>();
  return {
    ...actual,
    WebGLRenderer: class {
      setClearColor() {} setPixelRatio() {} setSize() {}
      compileAsync = gpu.compile; render = gpu.render; dispose = gpu.dispose; forceContextLoss = gpu.lose;
    },
    PMREMGenerator: class {
      fromScene() { return new actual.WebGLRenderTarget(1, 1); }
      dispose() {}
    },
    TextureLoader: class {
      async loadAsync() { const texture = new actual.Texture(); texture.image = { width: 256, height: 256 }; return texture; }
    },
  };
});

let controller: FactorySystemsController | undefined;
let view: (entries: IntersectionObserverEntry[]) => void;
let changeTheme: () => void;
let theme: { theme: string };
let listeners: Map<string, (event: Event) => void>;

function fixture() {
  const rect = (x: number, y: number, width: number, height: number) => ({ x, y, left: x, top: y, right: x + width, bottom: y + height, width, height });
  const style = () => {
    const values = new Map<string, string>();
    return { setProperty: (key: string, value: string) => values.set(key, value), removeProperty: (key: string) => values.delete(key) };
  };
  const cards = [0, 1, 2].map(() => ({ style: style() }));
  const anchors = [0, 1, 2].map(index => ({ getBoundingClientRect: () => rect(index * 390, 26, 340, 280) }));
  const images = [0, 1, 2].map(index => ({ currentSrc: "", src: `/test-artwork-${index}.png` }));
  const host = {
    dataset: {} as Record<string, string>,
    getBoundingClientRect: () => rect(0, 0, 1120, 366),
    querySelectorAll: (selector: string) => selector === ".factory-system" ? cards : selector === "[data-system-anchor]" ? anchors : images,
  };
  const canvas = {
    dataset: {} as Record<string, string>, hidden: false,
    addEventListener: (name: string, callback: (event: Event) => void) => listeners.set(name, callback),
    removeEventListener: (name: string) => listeners.delete(name),
  };
  return { host, canvas, mount() {
    controller = mountFactorySystems(canvas as unknown as HTMLCanvasElement, host as unknown as HTMLDivElement, { onReady: vi.fn(), onPhase: vi.fn() });
    return controller;
  } };
}

beforeEach(() => {
  vi.clearAllMocks(); gpu.compile.mockReset().mockResolvedValue(undefined);
  controller = undefined; listeners = new Map(); theme = { theme: "light" };
  const pixels = new Uint8ClampedArray(256 * 256 * 4).fill(255);
  vi.stubGlobal("document", {
    hidden: false, documentElement: { dataset: theme },
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 80 }) }),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    createElement: () => ({ width: 0, height: 0, getContext: () => ({
      createRadialGradient: () => ({ addColorStop() {} }), fillRect() {}, drawImage() {}, getImageData: () => ({ data: pixels }),
    }) }),
  });
  vi.stubGlobal("location", { search: "" }); vi.stubGlobal("innerHeight", 900); vi.stubGlobal("devicePixelRatio", 1);
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1)); vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("MutationObserver", class {
    constructor(callback: MutationCallback) { changeTheme = () => callback([], this as unknown as MutationObserver); }
    observe() {} disconnect() {}
  });
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { view = entries => callback(entries, this as unknown as IntersectionObserver); }
    observe() {} disconnect() {}
  });
});

afterEach(() => { controller?.dispose(); vi.unstubAllGlobals(); });

describe("factory scene controller", () => {
  it("releases preparation when context is lost while shader compilation is still pending", async () => {
    gpu.compile.mockImplementation(() => new Promise(() => {}));
    const { host, canvas, mount } = fixture(), scene = mount();
    await vi.waitFor(() => expect(gpu.compile).toHaveBeenCalledOnce());
    listeners.get("webglcontextlost")?.({ preventDefault: vi.fn() } as unknown as Event);
    await expect(scene.ready).resolves.toBeUndefined();
    expect(host.dataset.renderer).toBe("fallback"); expect(canvas.hidden).toBe(true);
    expect(gpu.dispose).toHaveBeenCalledOnce(); expect(gpu.lose).toHaveBeenCalledOnce();
    scene.dispose(); expect(gpu.dispose).toHaveBeenCalledOnce();
  });

  it("refreshes all glass properties on a light/dark/light round trip", async () => {
    vi.stubGlobal("location", { search: "?factory-time=16" });
    await fixture().mount().ready;
    const rendered = gpu.render.mock.lastCall?.[0] as THREE.Scene;
    function materials() {
      const values: { kind: string; color: number; opacity: number; clearcoat: number; roughness: number; environment: number }[] = [];
      rendered.traverse(object => {
        if (!(object instanceof THREE.Mesh) || !(object.material instanceof THREE.MeshPhysicalMaterial) || !object.material.userData.factoryFace) return;
        const material = object.material;
        values.push({ kind: material.userData.factoryFace, color: material.color.getHex(), opacity: material.opacity, clearcoat: material.clearcoat, roughness: material.roughness, environment: material.envMapIntensity });
      });
      return values;
    }
    const light = materials(); expect(light).toHaveLength(18); expect(light.every(value => value.clearcoat === .95)).toBe(true);
    theme.theme = "dark"; changeTheme();
    const dark = materials(); expect(dark.every(value => value.clearcoat === .95)).toBe(true); expect(dark).not.toEqual(light);
    theme.theme = "light"; changeTheme(); expect(materials()).toEqual(light);
  });

  it("starts on a short screen and retains the running clock across further visibility callbacks", async () => {
    const { canvas, mount } = fixture(); await mount().ready;
    function entry(height: number) {
      return [{ isIntersecting: true, intersectionRatio: height / 468, intersectionRect: { height }, boundingClientRect: { height: 468 }, rootBounds: { height: 168 } } as unknown as IntersectionObserverEntry];
    }
    view(entry(100)); expect(canvas.dataset.running).toBe("true"); expect(requestAnimationFrame).toHaveBeenCalledOnce();
    const cancellations = vi.mocked(cancelAnimationFrame).mock.calls.length;
    view(entry(140)); expect(requestAnimationFrame).toHaveBeenCalledOnce(); expect(cancelAnimationFrame).toHaveBeenCalledTimes(cancellations);
  });
});
