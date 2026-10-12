// Midnight IST at the start of November 8, 2026.
export const launchAt = Date.parse("2026-11-07T18:30:00.000Z");

export function isPrelaunch(now = Date.now()): boolean {
  return now < launchAt;
}
