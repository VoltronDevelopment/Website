import { describe, expect, it } from "vitest";
import { addDays, daysBetween, moveRange } from "@/lib/gantt-math";

describe("gantt-math", () => {
  it("adds days across month boundaries", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
  });

  it("computes inclusive day spans", () => {
    expect(daysBetween("2026-01-01", "2026-01-01")).toBe(1);
    expect(daysBetween("2026-01-01", "2026-01-05")).toBe(4);
  });

  it("clamps moved ranges inside the project window", () => {
    const moved = moveRange("2026-01-10", "2026-01-12", 10, "2026-01-01", "2026-01-20");
    expect(moved.startDate).toBe("2026-01-18");
    expect(moved.endDate).toBe("2026-01-20");
  });
});
