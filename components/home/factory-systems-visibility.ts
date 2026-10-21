/** Short screens need a reachable trigger even when half of the scene cannot fit. */
export function factorySystemsCanStart(visibleHeight: number, sceneHeight: number, viewportHeight: number) {
  if (![visibleHeight, sceneHeight, viewportHeight].every(Number.isFinite)) return false;
  if (sceneHeight <= 0 || viewportHeight <= 0 || visibleHeight <= 0) return false;
  return visibleHeight >= Math.min(sceneHeight * .45, viewportHeight * .5);
}
