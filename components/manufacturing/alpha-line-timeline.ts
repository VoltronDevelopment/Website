import {
  alphaLineCoatId, alphaLineDeviationId, alphaLinePath, alphaLineStation,
  alphaLineStations, type AlphaLineJourneyChapter,
} from "./alpha-line-config";

export const alphaLineRaisedY = 4.12;
export const alphaLineImmersedY = 1.95;
export const alphaLineUnloadY = 2.21;
export type AlphaLineChapter = "route" | AlphaLineJourneyChapter | "deviation";
export type AlphaLinePhase = "idle" | "overview" | "pickup-lower" | "attach" | "pickup-raise" | "loaded" | "support" | "finished" | "receive" | "travel" | "turn" | "lower" | "hold" | "raise" | "drain" | "verify" | "descend" | "release" | "review" | "pause";
export type AlphaLineState = {
  time: number; mode: "route" | "journey" | "tour" | "deviation"; chapter: AlphaLineChapter;
  phase: AlphaLinePhase; x: number; z: number; y: number; yaw: number; distance: number;
  stationId: string; carrierVisible: boolean; attached: boolean; partOpacity: number;
  finishedOpacity: number; loadingOpacity: number; sourceTime: number; compressed: boolean; coating: number; jawOpen: number; ripple: number; wetness: number;
  corner: number | null; turnProgress: number; processingComplete: boolean;
  qualityReleased: false; dispatched: false; deviationStep: number | null;
  equipmentCommand: null; amberStationId: string | null;
};
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * smooth(t);
const points = alphaLinePath();
let length = 0;
const segments = points.slice(1).map((b, i) => {
  const a = points[i]; const start = length;
  length += Math.hypot(b.x - a.x, b.z - a.z);
  return { a, b, start, end: length, yaw: Math.atan2(-(b.z - a.z), b.x - a.x) };
});
const corners = segments.flatMap((s, i) => s.b.corner ? [{ distance: s.end, before: s.yaw, after: segments[i + 1].yaw, x: s.b.x, z: s.b.z }] : []);
export function alphaLinePathLength() { return length; }
export function alphaLineCorners() { return corners; }
export function alphaLineStationDistance(id: string) {
  if (id === "LOAD") return 0;
  const s = segments.find(s => s.b.stationId === id);
  if (!s) throw new Error(`Unknown Alpha station ${id}`);
  return s.end;
}
export function alphaLinePose(distance: number) {
  const d = Math.min(length, Math.max(0, distance));
  const s = segments.find(s => d < s.end) ?? segments[segments.length - 1];
  const t = (d - s.start) / (s.end - s.start);
  return { x: s.a.x + (s.b.x - s.a.x) * t, z: s.a.z + (s.b.z - s.a.z) * t, yaw: s.yaw, distance: d };
}
export type AlphaLineEvent = {
  kind: Exclude<AlphaLinePhase, "idle" | "pause">; t0: number; t1: number;
  stationId: string; from: number; to: number; chapter: AlphaLineJourneyChapter; corner?: number;
};
function buildSchedule() {
  const events: AlphaLineEvent[] = []; let time = 0; let cursor = 0;
  const push = (kind: AlphaLineEvent["kind"], duration: number, stationId: string, chapter: AlphaLineJourneyChapter, to = cursor, corner?: number) => {
    events.push({ kind, t0: time, t1: time + duration, stationId, chapter, from: cursor, to, corner });
    time += duration; cursor = to;
  };
  const travel = (id: string, chapter: AlphaLineJourneyChapter) => {
    const destination = alphaLineStationDistance(id);
    corners.forEach((corner, index) => {
      if (corner.distance > cursor && corner.distance < destination) {
        push("travel", (corner.distance - cursor) / 4.6, id, chapter, corner.distance);
        push("turn", 1.3, id, chapter, cursor, index);
      }
    });
    push("travel", (destination - cursor) / 4.6, id, chapter, destination);
  };
  push("overview", 2, "LOAD", "loading");
  push("receive", 1, "LOAD", "loading");
  push("pickup-lower", 1.2, "LOAD", "loading");
  push("attach", .65, "LOAD", "loading");
  push("pickup-raise", 1.2, "LOAD", "loading");
  push("loaded", .4, "LOAD", "loading");
  for (const station of alphaLineStations.filter(s => s.kind === "tank")) {
    travel(station.id, "processing");
    push("lower", .95, station.id, "processing");
    push("hold", 2, station.id, "processing");
    push("raise", .95, station.id, "processing");
    push("drain", .55, station.id, "processing");
  }
  push("verify", 3.2, "T13", "verification");
  travel("UNLOAD", "unloading");
  push("descend", 1.2, "UNLOAD", "unloading");
  push("support", .65, "UNLOAD", "unloading");
  push("release", 1.4, "UNLOAD", "unloading");
  push("finished", 1.2, "UNLOAD", "unloading");
  push("review", 3.2, "UNLOAD", "review");
  return events;
}
export const alphaLineSchedule: readonly AlphaLineEvent[] = buildSchedule();
export const alphaLineDuration = alphaLineSchedule[alphaLineSchedule.length - 1].t1;
export function alphaLineChapterStart(chapter: AlphaLineJourneyChapter) {
  return alphaLineSchedule.find(e => e.chapter === chapter)!.t0;
}
/** A manual chapter opens on a readable pose rather than the first millisecond of travel. */
export function alphaLineChapterPreview(chapter: AlphaLineJourneyChapter) {
  const phase = chapter === "loading" ? "pickup-lower" : chapter === "processing" ? "hold" : chapter === "unloading" ? "release" : null;
  const event = alphaLineSchedule.find(e => e.chapter === chapter && (!phase || e.kind === phase))!;
  return event.t0 + (event.t1 - event.t0) * (chapter === "unloading" ? .6 : .5);
}
function base(partial: Partial<AlphaLineState>): AlphaLineState {
  return {
    time: 0, mode: "route", chapter: "route", phase: "idle", ...alphaLinePose(0),
    y: alphaLineRaisedY, stationId: "LOAD", carrierVisible: false, attached: false,
    partOpacity: 0, finishedOpacity: 0, loadingOpacity: 1, sourceTime: 0, compressed: false, coating: 0, jawOpen: 0, ripple: 0, wetness: 0,
    corner: null, turnProgress: 0, processingComplete: false, deviationStep: null,
    amberStationId: null, ...partial, qualityReleased: false, dispatched: false, equipmentCommand: null,
  };
}
export function alphaLineRouteState() { return base({}); }
export function alphaLineStateAt(seconds: number): AlphaLineState {
  const time = Math.min(alphaLineDuration, Math.max(0, seconds));
  const e = alphaLineSchedule.find(e => time < e.t1) ?? alphaLineSchedule[alphaLineSchedule.length - 1];
  const t = clamp((time - e.t0) / (e.t1 - e.t0));
  const pose = alphaLinePose(e.kind === "travel" ? mix(e.from, e.to, t) : e.to);
  const state = base({ ...pose, time, mode: "journey", chapter: e.chapter, phase: e.kind,
    stationId: e.stationId, sourceTime: time, loadingOpacity: 0, carrierVisible: true, attached: true, partOpacity: 1 });
  if (["overview", "receive", "pickup-lower", "attach"].includes(e.kind)) {
    state.attached = false; state.partOpacity = 0; state.loadingOpacity = 1; state.jawOpen = 1;
    state.x = e.kind === "overview" ? -1.5 : e.kind === "receive" ? mix(-1.5, 0, t) : 0;
    if (e.kind === "pickup-lower") state.y = mix(alphaLineRaisedY, alphaLineUnloadY, t);
    if (e.kind === "attach") { state.y = alphaLineUnloadY; state.jawOpen = 1 - smooth(t); }
  }
  if (e.kind === "pickup-raise") state.y = mix(alphaLineUnloadY, alphaLineRaisedY, t);
  if (e.kind === "turn") {
    const c = corners[e.corner!]; state.yaw = mix(c.before, c.after, t);
    state.corner = e.corner!; state.turnProgress = smooth(t);
  }
  if (e.kind === "lower") state.y = mix(alphaLineRaisedY, alphaLineImmersedY, t);
  if (e.kind === "hold") { state.y = alphaLineImmersedY; state.ripple = .18 * (1-t); }
  if (e.kind === "raise") state.y = mix(alphaLineImmersedY, alphaLineRaisedY, t);
  if (e.kind === "lower" || e.kind === "raise") state.ripple = Math.sin(Math.PI * t);
  if (e.kind === "lower") state.wetness = t;
  if (e.kind === "hold" || e.kind === "raise") state.wetness = 1;
  if (e.kind === "drain") { state.wetness = 1 - t * .55; state.ripple = .12 * (1 - t); }
  if (e.kind === "travel" && e.from > 0) state.wetness = .45 * (1 - t);
  const coat = alphaLineSchedule.find(e => e.stationId === alphaLineCoatId && e.kind === "hold")!;
  state.coating = smooth((time - coat.t0) / (coat.t1 - coat.t0));
  state.processingComplete = e.chapter === "verification" || e.chapter === "unloading" || e.chapter === "review";
  if (e.kind === "support") state.y = alphaLineUnloadY;
  if (e.kind === "descend") state.y = mix(alphaLineRaisedY, alphaLineUnloadY, t);
  if (e.kind === "release") {
    state.jawOpen = smooth(t / .25); state.attached = t < .2;
    state.partOpacity = state.attached ? 1 : 0; state.finishedOpacity = state.attached ? 0 : 1;
    state.y = t < .2 ? alphaLineUnloadY : t < .45 ? mix(alphaLineUnloadY, alphaLineUnloadY + .14, (t - .2) / .25) : mix(alphaLineUnloadY + .14, alphaLineRaisedY, (t - .45) / .55);
  }
  if (e.kind === "review" || e.kind === "finished") Object.assign(state, { jawOpen: 1, attached: false, partOpacity: 0, finishedOpacity: 1 });
  return state;
}
export const alphaLineDeviationStepDuration = 3.2;
export const alphaLineDeviationSteps = 6;
export const alphaLineDeviationDuration = alphaLineDeviationSteps * alphaLineDeviationStepDuration;
export function alphaLineDeviationStateAt(seconds: number) {
  const time = Math.min(alphaLineDeviationDuration, Math.max(0, seconds));
  const station = alphaLineStation(alphaLineDeviationId);
  return base({ ...alphaLinePose(alphaLineStationDistance(station.id)), time, mode: "deviation", chapter: "deviation", phase: "pause", stationId: station.id,
    carrierVisible: true, attached: true, partOpacity: 1, loadingOpacity: 0, amberStationId: station.id,
    deviationStep: Math.min(5, Math.floor(time / alphaLineDeviationStepDuration)) });
}
