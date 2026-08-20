export function parseIsoDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = parseIsoDate(dateStr);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function daysBetween(start: string, end: string): number {
  const ms = parseIsoDate(end).getTime() - parseIsoDate(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function dateToRatio(dateStr: string, rangeStart: string, rangeEnd: string): number {
  const start = parseIsoDate(rangeStart).getTime();
  const end = parseIsoDate(rangeEnd).getTime();
  const value = parseIsoDate(dateStr).getTime();
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

export function ratioToDate(ratio: number, rangeStart: string, rangeEnd: string): string {
  const start = parseIsoDate(rangeStart).getTime();
  const end = parseIsoDate(rangeEnd).getTime();
  const ms = start + ratio * (end - start);
  return toIsoDate(new Date(ms));
}

export function timelineTicks(rangeStart: string, rangeEnd: string, count = 5): string[] {
  const start = parseIsoDate(rangeStart).getTime();
  const end = parseIsoDate(rangeEnd).getTime();
  const ticks: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const ratio = count === 1 ? 0 : i / (count - 1);
    ticks.push(toIsoDate(new Date(start + ratio * (end - start))));
  }
  return ticks;
}

export function dayDeltaFromPixels(
  pixelDelta: number,
  trackWidth: number,
  rangeStart: string,
  rangeEnd: string
): number {
  if (trackWidth <= 0) return 0;
  const spanDays = daysBetween(rangeStart, rangeEnd);
  return Math.round((pixelDelta / trackWidth) * spanDays);
}

export function moveRange(
  startDate: string,
  endDate: string,
  dayDelta: number,
  rangeStart: string,
  rangeEnd: string
): { startDate: string; endDate: string } {
  const duration = daysBetween(startDate, endDate);
  let nextStart = addDays(startDate, dayDelta);
  let nextEnd = addDays(nextStart, duration);
  if (nextStart < rangeStart) {
    nextStart = rangeStart;
    nextEnd = addDays(nextStart, duration);
  }
  if (nextEnd > rangeEnd) {
    nextEnd = rangeEnd;
    nextStart = addDays(nextEnd, -duration);
    if (nextStart < rangeStart) nextStart = rangeStart;
  }
  return { startDate: nextStart, endDate: nextEnd };
}

export function resizeRange(
  startDate: string,
  endDate: string,
  mode: "resize-start" | "resize-end",
  dayDelta: number,
  rangeStart: string,
  rangeEnd: string
): { startDate: string; endDate: string } {
  let nextStart = startDate;
  let nextEnd = endDate;

  if (mode === "resize-start") {
    nextStart = addDays(startDate, dayDelta);
    if (nextStart < rangeStart) nextStart = rangeStart;
    if (nextStart > nextEnd) nextStart = nextEnd;
  } else {
    nextEnd = addDays(endDate, dayDelta);
    if (nextEnd > rangeEnd) nextEnd = rangeEnd;
    if (nextEnd < nextStart) nextEnd = nextStart;
  }

  return { startDate: nextStart, endDate: nextEnd };
}

export function scheduleTrackWidth(rangeStart: string, rangeEnd: string, pxPerDay = 28): number {
  return Math.max(420, daysBetween(rangeStart, rangeEnd) * pxPerDay);
}

export function paddedViewRange(
  focusStart: string,
  focusEnd: string,
  projectStart: string,
  projectEnd: string,
  padDays = 3
): { startDate: string; endDate: string } {
  let start = addDays(focusStart, -padDays);
  let end = addDays(focusEnd, padDays);
  if (start < projectStart) start = projectStart;
  if (end > projectEnd) end = projectEnd;
  if (start > end) {
    start = projectStart;
    end = projectEnd;
  }
  return { startDate: start, endDate: end };
}
