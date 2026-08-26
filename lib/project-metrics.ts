import type { AttentionItem, Project, ProjectStatus, Workstream } from "@/lib/projects-types";
import type { ReviewScope } from "@/lib/reviews-types";

export function projectCompletionPct(project: Project): number {
  if (!project.workstreams.length) return 0;
  const total = project.workstreams.reduce((sum, ws) => sum + ws.progressPct, 0);
  return Math.round(total / project.workstreams.length);
}

export function workstreamStatusCounts(project: Project): Record<TaskMixCategory, number> {
  return countTaskMix(project.workstreams);
}

export type TaskMixCategory =
  | "not_started"
  | "in_progress"
  | "delayed"
  | "blocked"
  | "completed";

export const TASK_MIX_ORDER: TaskMixCategory[] = [
  "not_started",
  "in_progress",
  "delayed",
  "blocked",
  "completed"
];

export const TASK_MIX_LABELS: Record<TaskMixCategory, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  delayed: "Delayed",
  blocked: "Blocked",
  completed: "Completed"
};

/** Shared palette for Gantt bars, dots, and donuts. */
export const TASK_MIX_COLORS: Record<TaskMixCategory, string> = {
  not_started: "rgba(255,255,255,0.28)",
  in_progress: "#4a8ffd",
  delayed: "#fb923c",
  blocked: "#f87171",
  completed: "#4ade80"
};

export function emptyTaskMix(): Record<TaskMixCategory, number> {
  return {
    not_started: 0,
    in_progress: 0,
    delayed: 0,
    blocked: 0,
    completed: 0
  };
}

export function taskMixCategory(ws: Workstream): TaskMixCategory {
  if (ws.progressPct >= 100) return "completed";
  if (ws.status === "blocked") return "blocked";
  if (daysUntil(ws.endDate) < 0) return "delayed";
  if (ws.progressPct <= 0) return "not_started";
  return "in_progress";
}

export function countTaskMix(streams: Workstream[]): Record<TaskMixCategory, number> {
  const counts = emptyTaskMix();
  for (const ws of streams) {
    counts[taskMixCategory(ws)] += 1;
  }
  return counts;
}

function hasDate(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function nextMilestoneName(project: Project): string | null {
  const upcoming = [...project.milestones]
    .filter((m) => m.status !== "completed" && hasDate(m.endDate))
    .sort((a, b) => a.endDate.localeCompare(b.endDate));
  return upcoming[0]?.name ?? null;
}

export function deriveProjectStatus(project: Project): ProjectStatus {
  if (project.statusManual) return project.status;
  if (!project.workstreams.length) return project.status;
  if (project.workstreams.some((ws) => ws.status === "blocked" && ws.progressPct < 100)) {
    return "blocked";
  }
  if (project.workstreams.every((ws) => ws.progressPct >= 100 || ws.status === "completed")) {
    return "completed";
  }
  if (project.workstreams.every((ws) => ws.progressPct <= 0 && ws.status !== "blocked")) {
    return "not_started";
  }
  return "in_progress";
}

/** Gate status follows linked tasks when any are assigned; otherwise keeps the stored value. */
export function deriveMilestoneStatus(
  project: Project,
  milestoneId: string,
  fallback: ProjectStatus
): ProjectStatus {
  const linked = project.workstreams.filter((ws) => ws.milestoneId === milestoneId);
  if (!linked.length) return fallback;
  if (linked.some((ws) => ws.status === "blocked" && ws.progressPct < 100)) return "blocked";
  if (linked.every((ws) => ws.progressPct >= 100)) return "completed";
  if (linked.every((ws) => ws.progressPct <= 0)) return "not_started";
  return "in_progress";
}

export function linkedTaskCount(project: Project, milestoneId: string): number {
  return project.workstreams.filter((ws) => ws.milestoneId === milestoneId).length;
}

export function syncProjectRollups(project: Project): Project {
  const milestones = project.milestones.map((ms) => ({
    ...ms,
    status: deriveMilestoneStatus(project, ms.id, ms.status)
  }));
  const withMilestones = { ...project, milestones };
  return { ...withMilestones, status: deriveProjectStatus(withMilestones) };
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export type DueTone = "green" | "yellow" | "delayed" | "blocked" | "done";

/**
 * Bar/dot color from date + status:
 * done → completed green, blocked → red, overdue → delayed orange,
 * due ≤7d → yellow, else on-track green/blue via green class for schedule.
 */
export function dueTone(endDate: string, progressPct: number, status?: ProjectStatus): DueTone {
  if (progressPct >= 100) return "done";
  if (status === "blocked") return "blocked";
  const days = daysUntil(endDate);
  if (days < 0) return "delayed";
  if (days <= 7) return "yellow";
  return "green";
}

export function barTone(ws: Workstream): DueTone {
  return dueTone(ws.endDate, ws.progressPct, ws.status);
}

export function statusFromProgress(progressPct: number, current: ProjectStatus): ProjectStatus {
  if (progressPct >= 100) return "completed";
  if (current === "blocked") return "blocked";
  if (current === "completed" || (progressPct > 0 && current === "not_started")) return "in_progress";
  return current;
}

function isOverdue(endDate: string, progressPct: number): boolean {
  return daysUntil(endDate) < 0 && progressPct < 100;
}

export function buildAttentionItems(projects: Project[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const project of projects) {
    for (const ws of project.workstreams) {
      if (ws.status === "blocked") {
        items.push({
          id: `${project.id}-${ws.id}-blocked`,
          projectId: project.id,
          projectSlug: project.slug,
          projectName: project.name,
          label: ws.name,
          kind: "blocked",
          owner: ws.owner,
          progressPct: ws.progressPct,
          dueDate: ws.endDate,
          workstreamId: ws.id,
          detail: ws.blockReason ?? undefined
        });
        continue;
      }

      if (isOverdue(ws.endDate, ws.progressPct)) {
        items.push({
          id: `${project.id}-${ws.id}-delayed`,
          projectId: project.id,
          projectSlug: project.slug,
          projectName: project.name,
          label: ws.name,
          kind: "delayed",
          owner: ws.owner,
          progressPct: ws.progressPct,
          dueDate: ws.endDate,
          workstreamId: ws.id
        });
      }
    }

    for (const ms of project.milestones) {
      if (ms.status === "completed" || !hasDate(ms.endDate)) continue;
      const dueIn = daysUntil(ms.endDate);
      if (dueIn >= 0 && dueIn <= 7) {
        items.push({
          id: `${project.id}-${ms.id}-due`,
          projectId: project.id,
          projectSlug: project.slug,
          projectName: project.name,
          label: ms.name,
          kind: "due_soon",
          owner: ms.owner,
          dueDate: ms.endDate,
          milestoneId: ms.id
        });
      }
    }
  }

  const rank = { blocked: 0, delayed: 1, due_soon: 2 };
  return items.sort((a, b) => rank[a.kind] - rank[b.kind]);
}

export function mergeProposedWorkstreams(live: Workstream[], proposed: Workstream[]): Workstream[] {
  const proposedMap = new Map(proposed.map((ws) => [ws.id, ws]));
  const merged = live.map((ws) => proposedMap.get(ws.id) ?? ws);
  for (const ws of proposed) {
    if (!live.some((row) => row.id === ws.id)) merged.push(ws);
  }
  return merged;
}

export function workstreamsForReviewScope(project: Project, scope: ReviewScope): Workstream[] {
  return filterWorkstreams(project, {
    milestoneId: scope.milestoneId,
    time: scope.timeFilter,
    owner: scope.ownerFilter || undefined,
    priority: scope.priorityFilter || undefined,
    done: scope.doneFilter
  });
}

export function dashboardStats(projects: Project[]) {
  const active = projects.filter((p) => p.status !== "completed");
  const alpha = projects.find((p) => p.slug === "voltron-alpha");
  const attention = buildAttentionItems(projects);
  const blocked = attention.filter((a) => a.kind === "blocked").length;
  const milestonesDue = attention.filter((a) => a.kind === "due_soon").length;

  return {
    activeCount: active.length,
    alphaPct: alpha ? projectCompletionPct(alpha) : 0,
    blockedCount: blocked,
    milestonesDue
  };
}

export function filterProjects(
  projects: Project[],
  filters: { owner?: string; status?: ProjectStatus; showCompleted?: boolean }
): Project[] {
  return projects.filter((project) => {
    if (!filters.showCompleted && project.status === "completed") return false;
    if (filters.status && project.status !== filters.status) return false;
    if (filters.owner) {
      const ownerMatch =
        project.owner === filters.owner ||
        project.workstreams.some((ws) => ws.owner === filters.owner);
      if (!ownerMatch) return false;
    }
    return true;
  });
}

export function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec"
] as const;

/** Locale-independent short date (avoids SSR/client ICU hydration mismatches). */
export function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  return `${day} ${SHORT_MONTHS[month - 1]}`;
}

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function toLocalIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daySpan(start: string, end: string): number {
  const ms = parseLocalDate(end).getTime() - parseLocalDate(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

/** Progress attributed to a date if current task progress is earned uniformly over the task window. */
export function progressAsOf(ws: Workstream, asOf: string): number {
  if (asOf < ws.startDate) return 0;
  if (asOf >= ws.endDate) return ws.progressPct;
  const elapsed = daySpan(ws.startDate, asOf);
  const span = daySpan(ws.startDate, ws.endDate);
  return Math.round(ws.progressPct * Math.min(1, elapsed / span));
}

export type WeeklyProgressPoint = {
  weekEnd: string;
  label: string;
  pct: number;
  isCurrent: boolean;
};

/** Week-by-week % from live task progress (updates when reviews are applied). */
export function weeklyProgressSeries(project: Project): WeeklyProgressPoint[] {
  const start = parseLocalDate(project.startDate);
  const end = parseLocalDate(project.targetDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const today = toLocalIso(new Date());
  const points: WeeklyProgressPoint[] = [];
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + 6);

  while (true) {
    const atEnd = cursor >= end;
    const weekEnd = toLocalIso(atEnd ? end : cursor);
    const pct = project.workstreams.length
      ? Math.round(
          project.workstreams.reduce((sum, ws) => sum + progressAsOf(ws, weekEnd), 0) /
            project.workstreams.length
        )
      : 0;
    points.push({
      weekEnd,
      label: formatShortDate(weekEnd),
      pct,
      isCurrent: false
    });
    if (atEnd || points.length > 16) break;
    cursor.setDate(cursor.getDate() + 7);
  }

  for (let i = 0; i < points.length; i += 1) {
    const weekStart =
      i === 0
        ? project.startDate
        : toLocalIso(new Date(parseLocalDate(points[i - 1].weekEnd).getTime() + 86400000));
    points[i].isCurrent = today >= weekStart && today <= points[i].weekEnd;
  }

  return points;
}

export function projectTimelineRatio(
  project: Project,
  dateStr = toLocalIso(new Date())
): number {
  const start = parseLocalDate(project.startDate).getTime();
  const end = parseLocalDate(project.targetDate).getTime();
  const value = parseLocalDate(dateStr).getTime();
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}

export function clampWorkstreamDates(ws: Workstream, projectStart: string, projectEnd: string): Workstream {
  let { startDate, endDate } = ws;
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  if (startDate < projectStart) startDate = projectStart;
  if (endDate > projectEnd) endDate = projectEnd;
  if (startDate > endDate) endDate = startDate;
  return { ...ws, startDate, endDate };
}

export type InsightScope = "overall" | "milestone" | "week" | "month";
export type TimeFilter = "all" | "week" | "month";
export type TaskViewFilter = "all" | "open" | "done" | "blocked" | "delayed";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

export function periodBounds(filter: TimeFilter): { start: string; end: string } | null {
  if (filter === "all") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  const end = new Date(today);
  if (filter === "week") {
    start.setDate(start.getDate() - start.getDay());
    end.setDate(start.getDate() + 6);
  } else {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);
  }
  const toLocalIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return {
    start: toLocalIso(start),
    end: toLocalIso(end)
  };
}

export function filterWorkstreams(
  project: Project,
  opts: {
    milestoneId?: string | null;
    time?: TimeFilter;
    owner?: string;
    status?: ProjectStatus | "";
    priority?: string;
    done?: TaskViewFilter;
  }
): Workstream[] {
  let streams = project.workstreams;

  if (opts.milestoneId) {
    streams = streams.filter((ws) => ws.milestoneId === opts.milestoneId);
  }

  const bounds = periodBounds(opts.time ?? "all");
  if (bounds) {
    streams = streams.filter((ws) => overlaps(ws.startDate, ws.endDate, bounds.start, bounds.end));
  }

  if (opts.owner) {
    streams = streams.filter((ws) => ws.owner === opts.owner);
  }

  if (opts.status) {
    streams = streams.filter((ws) => ws.status === opts.status);
  }

  if (opts.priority) {
    streams = streams.filter((ws) => ws.priority === opts.priority);
  }

  if (opts.done === "open") {
    streams = streams.filter((ws) => ws.progressPct < 100 && ws.status !== "blocked");
  } else if (opts.done === "done") {
    streams = streams.filter((ws) => ws.progressPct >= 100);
  } else if (opts.done === "blocked") {
    streams = streams.filter((ws) => ws.status === "blocked" && ws.progressPct < 100);
  } else if (opts.done === "delayed") {
    streams = streams.filter(
      (ws) =>
        ws.progressPct < 100 && ws.status !== "blocked" && daysUntil(ws.endDate) < 0
    );
  }

  return streams;
}

export function workstreamsForInsight(
  project: Project,
  scope: InsightScope,
  milestoneId?: string
): Workstream[] {
  if (scope === "milestone" && milestoneId) {
    return filterWorkstreams(project, { milestoneId });
  }
  if (scope === "week") return filterWorkstreams(project, { time: "week" });
  if (scope === "month") return filterWorkstreams(project, { time: "month" });
  return project.workstreams;
}

export function insightStats(
  project: Project,
  opts: {
    milestoneId?: string | null;
    time?: TimeFilter;
    owner?: string;
    status?: ProjectStatus | "";
    priority?: string;
    done?: TaskViewFilter;
  } = {}
) {
  const streams = filterWorkstreams(project, opts);
  const counts = countTaskMix(streams);
  const completion = streams.length
    ? Math.round(streams.reduce((s, ws) => s + ws.progressPct, 0) / streams.length)
    : 0;

  const byOwner: Record<string, number> = {};
  for (const ws of streams) {
    byOwner[ws.owner] = (byOwner[ws.owner] ?? 0) + 1;
  }

  const byPriority: Record<string, number> = {};
  for (const ws of streams) {
    const key = ws.priority || "p2";
    byPriority[key] = (byPriority[key] ?? 0) + 1;
  }

  return { streams, counts, completion, byOwner, byPriority, total: streams.length };
}
