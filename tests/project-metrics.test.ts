import { describe, expect, it } from "vitest";
import { nextMilestoneName } from "@/lib/project-metrics";
import type { Project } from "@/lib/projects-types";

const baseProject: Project = {
  id: "p1",
  slug: "alpha",
  name: "Alpha",
  objective: "Test",
  owner: "Omkar",
  team: ["Omkar"],
  startDate: "2026-01-01",
  targetDate: "2026-12-31",
  status: "in_progress",
  workstreams: [],
  milestones: [
    {
      id: "m1",
      name: "Later gate",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      owner: "Omkar",
      status: "not_started"
    },
    {
      id: "m2",
      name: "Next gate",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      owner: "Omkar",
      status: "in_progress"
    },
    {
      id: "m3",
      name: "Broken gate",
      startDate: "2026-04-01",
      endDate: "",
      owner: "Omkar",
      status: "in_progress"
    }
  ]
};

describe("nextMilestoneName", () => {
  it("returns the earliest incomplete milestone with a valid end date", () => {
    expect(nextMilestoneName(baseProject)).toBe("Next gate");
  });

  it("ignores milestones missing end dates instead of throwing", () => {
    expect(() => nextMilestoneName(baseProject)).not.toThrow();
  });
});
