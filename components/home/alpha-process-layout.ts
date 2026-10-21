/** HTML labels share the artwork's station anchors, including the mobile canvas bleed. */
export function positionAlphaLabels(host: HTMLDivElement, positions: readonly number[]) {
  const list = host.parentElement?.querySelector<HTMLOListElement>(".alpha-process-stages");
  if (!list) return;
  const listBounds = list.getBoundingClientRect(), artBounds = host.getBoundingClientRect();
  if (!listBounds.width) return;
  Array.from(list.children).forEach((item, index) => {
    const label = item as HTMLElement;
    const projectedX = artBounds.left - listBounds.left + positions[index] * artBounds.width;
    const halfLabel = label.getBoundingClientRect().width / 2 + 2;
    const x = Math.max(halfLabel, Math.min(listBounds.width - halfLabel, projectedX));
    label.style.setProperty("--alpha-station-x", `${x / listBounds.width * 100}%`);
  });
}

export function positionAlphaFallbackLabels(host: HTMLDivElement) {
  const { width, height } = host.getBoundingClientRect();
  if (!width || !height) return;
  const scale = Math.min(width / 1120, height / 450);
  const offset = (width - 1120 * scale) / 2;
  positionAlphaLabels(host, [103, 316, 531, 746, 976].map(x => (offset + x * scale) / width));
}
