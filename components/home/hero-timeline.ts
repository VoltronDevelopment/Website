export const duration = 11;
export const starts = [.3, .7, 1.1, 1.5, 2.5, 3, 3.5];
export const offsets = [[-.65,.12,-.3],[.7,.2,-.35],[-.6,.25,.4],[.7,.14,.6],[-.4,.65,-.3],[.45,.7,-.25],[-.5,.6,.4]];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (value: number) => {const t = clamp(value);return t*t*(3-2*t);};
export function stateAt(seconds: number) {
  const t = clamp(seconds/duration)*duration;
  return {
    time:t,
    arrivals:starts.map(start => {const progress=clamp((t-start)/1.5);return {progress,travel:1-Math.pow(1-progress,3),visible:progress>0};}),
    resolve:smooth((t-5)/.4), logo:smooth((t-5.4)/.6), ground:smooth(t/.4), pulse:0,
    gridPulse:t<11 ? Math.sin(Math.PI*t/5.5)**2*(1-smooth(t-10)) : 0, done:t>=duration,
  };
}
export function gridOpacityAt(seconds: number, dark=false) {return (dark ? .035 : .03)+stateAt(seconds).gridPulse*(dark ? .035 : .03);}
export function latticeWaveAt(seconds: number, distance: number) {
  const progress=(seconds-5.6-Math.min(3,Math.max(0,distance))*.22)/3.5;
  return progress>0 && progress<1 ? Math.sin(Math.PI*progress)**2 : 0;
}
