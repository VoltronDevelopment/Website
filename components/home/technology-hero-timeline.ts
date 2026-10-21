import { smooth } from "./hero-timeline";

export const duration = 11;
export const coreSize = .58;
export const pitch = 1+coreSize;
export const outerGap = pitch-1;
export const upperHeight = .5+pitch;
const corner = pitch/2;
export const cells = [
  [-corner,.5,-corner], [corner,.5,-corner], [-corner,.5,corner], [corner,.5,corner],
  [-corner,upperHeight,-corner], [corner,upperHeight,-corner], [-corner,upperHeight,corner],
] as const;
export const missingCell = [corner,upperHeight,corner] as const;
export const coreCentre = [0,.5+corner,0] as const;
export const starts = [1.15,1.55,1.95,2.35,3.15,3.6,4.05];
export const offsets = [
  [-.65,.15,-.35], [.65,.2,-.35], [-.6,.2,.4], [.65,.15,.5],
  [-.35,.75,-.3], [.4,.75,-.25], [-.4,.7,.35],
] as const;
const clamp = (value: number) => Math.max(0,Math.min(1,value));

export function stateAt(seconds: number) {
  const t = clamp(seconds/duration)*duration;
  return {
    time:t,
    arrivals:starts.map(start => {
      const progress=clamp((t-start)/1.5);
      return {progress,travel:1-Math.pow(1-progress,3),visible:progress>0};
    }),
    resolve:smooth((t-5.55)/.45), core:smooth((t-.15)/.65),
    connection:smooth((t-6.05)/.65), logo:smooth((t-6.7)/.7), ground:smooth(t/.4),
    pulse:0, gridPulse:t<11 ? Math.sin(Math.PI*t/5.5)**2*(1-smooth(t-10)) : 0,
    done:t>=duration,
  };
}

export function latticeWaveAt(seconds: number, distance: number) {
  const progress=(seconds-7.1-Math.min(3,Math.max(0,distance))*.18)/3.3;
  return progress>0 && progress<1 ? Math.sin(Math.PI*progress)**2 : 0;
}
