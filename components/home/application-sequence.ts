export const CARD_HOLD = 3.2;
export const CARD_GLIDE = 0.8;
export const CARD_RETURN = 0.55;

const MES_X = [64, 152, 240, 328];
const TWIN_X = [112, 220, 328, 328];

export function applicationCycleDuration() {
  return 4 * CARD_HOLD + 3 * CARD_GLIDE + CARD_RETURN;
}

/** Forward holds are slow. The return from the last card to the first is one fast pass. */
export function applicationFrame(elapsed: number) {
  const cycle = applicationCycleDuration();
  let t = ((elapsed % cycle) + cycle) % cycle;
  for (let i = 0; i < 4; i++) {
    if (t < CARD_HOLD) return {progress: i, direction: 'forward' as const};
    t -= CARD_HOLD;
    if (i < 3) {
      if (t < CARD_GLIDE) return {progress: i + t / CARD_GLIDE, direction: 'forward' as const};
      t -= CARD_GLIDE;
    }
  }
  const u = Math.min(1, t / CARD_RETURN);
  return {progress: 3 * (1 - u), direction: 'return' as const};
}

export function diagramBeat(elapsed: number, duration = CARD_HOLD) {
  const travel = Math.max(0, Math.min(1, elapsed / duration));
  const scaled = travel >= 1 ? 3.999999 : travel * 4;
  const step = Math.min(3, Math.floor(scaled));
  return {step, travel, within: scaled - step};
}

export function mesLotX(step: number) {
  return MES_X[Math.min(3, Math.max(0, step))];
}

const ROPE_REST = 58;
const DIP = 76;

/** The gantry travels first, then the rope lowers into the tank and holds. The part stays black after coating. */
export function twinPartPose(step: number, within: number) {
  const index = Math.min(3, Math.max(0, step));
  let amount = 0;
  if (index < 3) {
    if (within < 0.32) amount = 0;
    else if (within < 0.55) amount = (within - 0.32) / 0.23;
    else if (within < 0.78) amount = 1;
    else amount = Math.max(0, 1 - (within - 0.78) / 0.22);
  }
  const dip = amount * DIP;
  return {x: TWIN_X[index], y: dip, rope: ROPE_REST + dip};
}

export function twinCoated(step: number, within: number) {
  return step > 1 || (step === 1 && within >= 0.55);
}
