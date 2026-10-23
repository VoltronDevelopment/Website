import { alphaLineStation } from "./alpha-line-config";
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
const anchor = (id: string, zoom: number) => {const s=alphaLineStation(id);return {x:s.x,z:s.z,zoom};};
const shots = [
  {at:0,x:0,z:0,zoom:1,detail:0},
  {at:at("LOAD","receive"),...anchor("LOAD",1.9),detail:1},
  {at:at("T01","travel"),...anchor("T02",1.8),detail:1},
  {at:at("T04","travel"),...anchor("T04",1.8),detail:1},
  {at:at("T06","travel"),...anchor("T07",1.65),detail:1},
  {at:at("T09","travel"),...anchor("T10",1.8),detail:1},
  {at:at("T12","travel"),...anchor("T12",1.8),detail:1},
  {at:at("UNLOAD","travel"),...anchor("UNLOAD",1.9),detail:1},
  {at:at("UNLOAD","review"),x:0,z:0,zoom:1,detail:0},
];
/** Seekable camera track; orientation is fixed and each operation has a settled working frame. */
export function alphaLineShotAt(state: AlphaLineState, narrow = false) {
  const time=state.time, toTime=(t:number)=>state.mode==="tour"?alphaTourTimeAt(t):t;
  let index=0; shots.forEach((s,i)=>{if(time>=toTime(s.at))index=i;});
  // On narrow screens centre the featured first/final dips instead of their wider tank group.
  const frame = (shot: typeof shots[number]) => {
    if (!narrow) return shot;
    const station = shot.at === at("T01","travel") ? alphaLineStation("T01") : shot.at === at("T12","travel") ? alphaLineStation("T13") : null;
    return station ? {...shot,x:station.x,z:station.z} : shot;
  };
  const next=frame(shots[index]), previous=frame(shots[Math.max(0,index-1)]);
  const t=smooth((time-toTime(next.at))/.85);
  return {x:previous.x+(next.x-previous.x)*t,z:previous.z+(next.z-previous.z)*t,zoom:previous.zoom+(next.zoom-previous.zoom)*t,detail:previous.detail+(next.detail-previous.detail)*t};
}
