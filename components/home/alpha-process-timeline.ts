export const alphaDuration = 28;
export const alphaStations = [-3.45, 0, 3.45] as const;
export const alphaLoadingX = -6.9;
export const alphaUnloadingX = 6.9;
export const alphaRaisedY = 4.12;
export const alphaImmersedY = 1.95;
export const alphaUnloadY = 2.21;

export type AlphaPhase = "load" | "travel" | "lower" | "hold" | "raise" | "drain" | "unload" | "return";
export type AlphaState = {
  time: number; x: number; y: number; stage: number; phase: AlphaPhase;
  coating: number; attached: boolean; partOpacity: number; finishedOpacity: number;
  wet: number; ripple: number; drain: number; sheen: number; jawOpen: number;
};
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * smooth(t);
const tankStarts = [2.5, 8.9, 15.3];

/** Absolute-time choreography: seeking and suspended tabs cannot skip a release or a reset. */
export function alphaStateAt(seconds: number): AlphaState {
  const time = Math.max(0, seconds) % alphaDuration;
  const state: AlphaState = {
    time, x: alphaLoadingX, y: alphaRaisedY, stage: 0, phase: "load",
    coating: 0, attached: true, partOpacity: 1, finishedOpacity: 0,
    wet: 0, ripple: 0, drain: 0, sheen: 0, jawOpen: 0,
  };
  if (time < 1) {
    state.partOpacity = smooth(time / .65);
    return state;
  }
  if (time < 2.5) {
    state.x = mix(alphaLoadingX, alphaStations[0], (time - 1) / 1.5);
    state.phase = "travel";
    return state;
  }
  for (let i = 0; i < 3; i++) {
    const age = Math.round((time - tankStarts[i]) * 1e9) / 1e9;
    if (age < 0) continue;
    state.stage = i + 1;
    state.x = alphaStations[i];
    state.coating = i === 0 ? 0 : i === 1 ? smooth((age - 1.1) / 2) : 1;
    state.wet = 1;
    if (age < 4.9) {
      if (age < 1.1) {
        state.phase = "lower";
        state.y = mix(alphaRaisedY, alphaImmersedY, age / 1.1);
        state.ripple = Math.sin(Math.PI * clamp((age - .35) / .75));
      } else if (age < 3.1) {
        state.phase = "hold";
        state.y = alphaImmersedY;
        state.ripple = .12;
      } else if (age < 4.2) {
        state.phase = "raise";
        state.y = mix(alphaImmersedY, alphaRaisedY, (age - 3.1) / 1.1);
        state.ripple = Math.sin(Math.PI * clamp((age - 3.1) / 1.1));
      } else {
        state.phase = "drain";
        state.drain = (age - 4.2) / .7;
      }
      state.wet = state.phase === "lower" ? smooth((alphaRaisedY - state.y - .65) / .8) : state.phase === "drain" ? 1 - state.drain * .3 : 1;
      state.sheen = i === 2 ? smooth((age - 3.1) / 1.1) * .55 : 0;
      return state;
    }
    if (i < 2 && age < 6.4) {
      state.wet = .65;
      state.phase = "travel";
      state.x = mix(alphaStations[i], alphaStations[i + 1], (age - 4.9) / 1.5);
      return state;
    }
  }
  state.stage = 4;
  state.coating = 1;
  if (time < 21.7) {
    state.phase = "travel";
    state.x = mix(alphaStations[2], alphaUnloadingX, (time - 20.2) / 1.5);
  } else if (time < 22.8) {
    state.phase = "unload";
    state.x = alphaUnloadingX;
    state.y = mix(alphaRaisedY, alphaUnloadY, (time - 21.7) / 1.1);
  } else {
    state.attached = false;
    state.partOpacity = 0;
    state.finishedOpacity = 1 - smooth((time - 25) / 1.8);
    state.sheen = Math.sin(Math.PI * clamp((time - 22.8) / 1.2));
    state.phase = time < 23.4 ? "unload" : "return";
    state.x = time < 24.5 ? alphaUnloadingX : mix(alphaUnloadingX, alphaLoadingX, (time - 24.5) / 3);
    state.jawOpen = time < 27.5 ? smooth((time - 22.8) / .2) : 1 - smooth((time - 27.5) / .5);
    state.y = time < 23.4 ? mix(alphaUnloadY, alphaUnloadY + .14, (time - 22.8) / .6) : mix(alphaUnloadY + .14, alphaRaisedY, (time - 23.4) / 1.1);
    if (time >= 27.5) state.stage = 0;
  }
  return state;
}
