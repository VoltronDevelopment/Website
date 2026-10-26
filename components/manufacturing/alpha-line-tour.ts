import { alphaLineSchedule, alphaLineStateAt, alphaLineDuration, type AlphaLineState } from "./alpha-line-timeline";
const smooth = (t: number) => { t = Math.max(0, Math.min(1,t)); return t*t*(3-2*t); };
let cursor = 0;
/** Repeated operations are explicitly accelerated; the first, coating and final dips remain readable. */
export const alphaTourSegments = alphaLineSchedule.map(event => {
  const repeated = event.chapter === "processing" && !["T01","T07","T13"].includes(event.stationId);
  const rate = event.kind === "travel" ? .48 : event.kind === "turn" ? .65 : repeated ? .12 : event.kind === "verify" ? .25 : 1;
  const duration = event.kind === "travel" && ["T01","T04","T06","T09","T12","UNLOAD"].includes(event.stationId) ? Math.max(.85,(event.t1-event.t0)*rate) : (event.t1-event.t0)*rate;
  const segment = { event, start:cursor, end:cursor+duration, compressed:repeated };
  cursor += duration; return segment;
});
export const alphaTourDuration = cursor;
export function alphaTourTimeAt(sourceTime: number) {
  const segment = alphaTourSegments.find(s=>sourceTime<s.event.t1) ?? alphaTourSegments[alphaTourSegments.length-1];
  const t=Math.max(0,Math.min(1,(sourceTime-segment.event.t0)/(segment.event.t1-segment.event.t0)));
  return segment.start+(segment.end-segment.start)*t;
}
export function alphaTourStateAt(seconds: number): AlphaLineState {
  const time = Math.max(0,Math.min(alphaTourDuration,seconds));
  const segment = alphaTourSegments.find(s=>time<s.end) ?? alphaTourSegments[alphaTourSegments.length-1];
  const t=(time-segment.start)/(segment.end-segment.start);
  const sourceTime=segment.event.t0+(segment.event.t1-segment.event.t0)*t;
  return {...alphaLineStateAt(sourceTime),mode:"tour",time,sourceTime,compressed:segment.compressed};
}
export function alphaPlaybackDuration(mode: AlphaLineState["mode"]) { return mode === "tour" ? alphaTourDuration : alphaLineDuration; }
const at = (id: string, kind: string) => alphaLineSchedule.find(e=>e.stationId===id && e.kind===kind)!.t0;
/** Absolute-time follow camera: no stale station-group anchors during transfers. */
export function alphaLineShotAt(state: AlphaLineState, narrow = false) {
  const toTime = (t: number) => state.mode === "tour" ? alphaTourTimeAt(t) : t;
  const enter = smooth((state.time - toTime(at("LOAD", "receive"))) / .85);
  const exit = smooth((state.time - toTime(at("UNLOAD", "review"))) / .85);
  const detail = enter * (1 - exit);
  // Open the working frame slightly on the short leg; ease with the actual hoist turn.
  const bend = Math.sin(state.yaw);
  const workingZoom = (narrow ? 1.75 : 1.9) - .22 * bend * bend;
  return { x: state.x, z: state.z, zoom: 1 + (workingZoom - 1) * detail, detail, azimuth: -.22 * bend * detail };
}
