export const factorySystemsDuration = 6;

export type FactoryPhase = "component" | "digitize" | "separate" | "assemble" | "resolve" | "connect" | "settled";

export function smoothProgress(time: number, start: number, end: number) {
  const value = Math.max(0, Math.min(1, (time - start) / (end - start)));
  return value * value * (3 - 2 * value);
}

/** All scene and HTML reveals use this clock; the particle-only hold is intentional. */
export function factorySystemsStateAt(seconds: number) {
  const time = Math.max(0, Math.min(factorySystemsDuration, Number.isFinite(seconds) ? seconds : 0));
  const phase: FactoryPhase = time < 1.2 ? "component" : time < 2.4 ? "digitize" : time < 3.3 ? "separate" : time < 4.2 ? "assemble" : time < 5.2 ? "resolve" : time < 6 ? "connect" : "settled";
  return {
    time, phase,
    dissolve: smoothProgress(time, 1.2, 2.1),
    separate: smoothProgress(time, 2.4, 3.65),
    ghost: smoothProgress(time, 2.4, 2.49) * (1 - smoothProgress(time, 2.49, 2.85)),
    particles: 1 - smoothProgress(time, 4.2, 4.95),
    cubes: [0, .09, .18].map(delay => smoothProgress(time, 3.3 + delay, 4.02 + delay)),
    artworks: [0, .08, .16].map(delay => smoothProgress(time, 4.2 + delay, 4.94 + delay)),
    labels: [0, .08, .16].map(delay => smoothProgress(time, 4.38 + delay, 4.94 + delay)),
    connections: smoothProgress(time, 5.2, 5.72),
    pulse: smoothProgress(time, 5.34, 5.94),
    settled: time === factorySystemsDuration,
  };
}
