import type { Workstream } from "@/lib/projects-types";
import type { ReviewTaskDiff } from "@/lib/reviews-types";

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function diffWorkstreams(baseline: Workstream[], proposed: Workstream[]): ReviewTaskDiff[] {
  const baseMap = new Map(baseline.map((ws) => [ws.id, ws]));
  const diffs: ReviewTaskDiff[] = [];

  const proposedIds = new Set(proposed.map((ws) => ws.id));
  for (const prev of baseline) {
    if (!proposedIds.has(prev.id)) {
      diffs.push({ workstreamId: prev.id, name: prev.name, changes: ["Removed task"] });
    }
  }

  for (const next of proposed) {
    const prev = baseMap.get(next.id);
    if (!prev) {
      diffs.push({ workstreamId: next.id, name: next.name, changes: ["Added task"] });
      continue;
    }
    const changes: string[] = [];
    if (prev.progressPct !== next.progressPct) {
      changes.push(`Progress ${prev.progressPct}% → ${next.progressPct}%`);
    }
    if (prev.owner !== next.owner) changes.push(`Owner ${prev.owner} → ${next.owner}`);
    if (prev.priority !== next.priority) {
      changes.push(`Priority ${prev.priority.toUpperCase()} → ${next.priority.toUpperCase()}`);
    }
    if (prev.milestoneId !== next.milestoneId) {
      changes.push("Gate changed");
    }
    if (prev.startDate !== next.startDate || prev.endDate !== next.endDate) {
      changes.push(`Dates ${prev.startDate}→${prev.endDate} to ${next.startDate}→${next.endDate}`);
    }
    if (prev.status !== next.status || prev.blockReason !== next.blockReason) {
      if (next.status === "blocked") {
        changes.push(`Blocked: ${next.blockReason || "Reason not stated"}`);
      } else if (prev.status === "blocked") {
        changes.push("Block cleared");
      } else if (prev.status !== next.status) {
        changes.push(`Status ${prev.status} → ${next.status}`);
      }
    }
    if (!same(
      {
        progressPct: prev.progressPct,
        owner: prev.owner,
        priority: prev.priority,
        milestoneId: prev.milestoneId,
        startDate: prev.startDate,
        endDate: prev.endDate,
        status: prev.status,
        blockReason: prev.blockReason
      },
      {
        progressPct: next.progressPct,
        owner: next.owner,
        priority: next.priority,
        milestoneId: next.milestoneId,
        startDate: next.startDate,
        endDate: next.endDate,
        status: next.status,
        blockReason: next.blockReason
      }
    ) && changes.length === 0) {
      changes.push("Updated");
    }
    if (changes.length) {
      diffs.push({ workstreamId: next.id, name: next.name, changes });
    }
  }

  return diffs;
}

export function formatScopeLabel(
  scope: {
    milestoneId: string | null;
    timeFilter: string;
    ownerFilter: string;
    priorityFilter: string;
    doneFilter: string;
  },
  milestoneName?: string | null
): string {
  return [
    milestoneName || (scope.milestoneId ? "Gate" : "All gates"),
    scope.timeFilter === "all" ? null : scope.timeFilter,
    scope.doneFilter === "all" ? null : scope.doneFilter,
    scope.priorityFilter ? scope.priorityFilter.toUpperCase() : null,
    scope.ownerFilter || null
  ]
    .filter(Boolean)
    .join(" · ");
}
