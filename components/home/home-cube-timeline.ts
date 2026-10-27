export const homeCubeHold = 1.2;
export const homeCubeTurn = 0.42;
export const homeCubeGap = 0.04;
export const homeCubeStep = homeCubeTurn + homeCubeGap;

export type CubeAxis = "x" | "y" | "z";
export type CubeMove = {axis: CubeAxis; layer: -1 | 0 | 1; dir: -1 | 1};

/** Twelve spatial turns, about five and a half seconds, then the same turns reversed. */
export const homeCubeScramble: CubeMove[] = [
  {axis: "y", layer: 1, dir: 1},
  {axis: "x", layer: 1, dir: -1},
  {axis: "z", layer: 1, dir: 1},
  {axis: "y", layer: -1, dir: 1},
  {axis: "x", layer: -1, dir: 1},
  {axis: "z", layer: -1, dir: -1},
  {axis: "y", layer: 0, dir: -1},
  {axis: "x", layer: 1, dir: 1},
  {axis: "z", layer: 0, dir: 1},
  {axis: "y", layer: 1, dir: -1},
  {axis: "x", layer: 0, dir: 1},
  {axis: "z", layer: 1, dir: -1},
];

export const homeCubeMoves: CubeMove[] = [
  ...homeCubeScramble,
  ...[...homeCubeScramble].reverse().map(move => ({...move, dir: (move.dir * -1) as -1 | 1})),
];

export const homeCubeScrambleEnd = homeCubeHold + homeCubeStep * homeCubeScramble.length;
export const homeCubeDuration = homeCubeHold + homeCubeStep * homeCubeMoves.length;
