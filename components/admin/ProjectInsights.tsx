"use client";

import { useMemo } from "react";
import type { Project } from "@/lib/projects-types";
import { PRIORITY_LABELS, TASK_PRIORITIES } from "@/lib/projects-types";
import { insightStats, type TaskViewFilter, type TimeFilter } from "@/lib/project-metrics";
import { ProgressRing, StatusDonut } from "@/components/admin/AdminCharts";

type ProjectInsightsProps = {
  project: Project;
  milestoneId: string | null;
  timeFilter: TimeFilter;
  ownerFilter: string;
  priorityFilter: string;
  doneFilter: TaskViewFilter;
};

export function ProjectInsights({
  project,
  milestoneId,
  timeFilter,
  ownerFilter,
  priorityFilter,
  doneFilter
}: ProjectInsightsProps) {
  const stats = useMemo(
    () =>
      insightStats(project, {
        milestoneId,
        time: timeFilter,
        owner: ownerFilter || undefined,
        priority: priorityFilter || undefined,
        done: doneFilter
      }),
    [doneFilter, milestoneId, ownerFilter, priorityFilter, project, timeFilter]
  );

  const ownerEntries = Object.entries(stats.byOwner).sort((a, b) => b[1] - a[1]);
  const priorityEntries = TASK_PRIORITIES.map((p) => [p, stats.byPriority[p] ?? 0] as const).filter(
    ([, count]) => count > 0
  );

  const scopeLabel = [
    milestoneId
      ? project.milestones.find((m) => m.id === milestoneId)?.name ?? "Milestone"
      : "All gates",
    timeFilter === "all" ? null : timeFilter === "week" ? "This week" : "This month",
    doneFilter === "all"
      ? null
      : doneFilter === "open"
        ? "Open"
        : doneFilter === "done"
          ? "Done"
          : doneFilter === "delayed"
            ? "Delayed"
            : "Blocked",
    priorityFilter ? priorityFilter.toUpperCase() : null,
    ownerFilter || null
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="admin-insights admin-insights-compact" aria-label="Project insights">
      <div className="admin-schedule-heading">
        <h3 className="admin-section-title">Insights</h3>
        <p className="admin-schedule-hint">
          {scopeLabel} · {stats.total} tasks
        </p>
      </div>

      <div className="admin-insights-grid admin-insights-grid-4">
        <div className="admin-module admin-module-compact">
          <ProgressRing
            value={stats.completion}
            size="md"
            label="Avg"
            tone={
              stats.counts.blocked > 0
                ? "blocked"
                : stats.counts.delayed > 0
                  ? "delayed"
                  : "default"
            }
          />
          <p className="admin-muted">Mean task progress</p>
        </div>
        <div className="admin-module admin-module-compact">
          <h4>Progress mix</h4>
          <StatusDonut counts={stats.counts} size="sm" />
        </div>
        <div className="admin-module admin-module-compact">
          <h4>Owners</h4>
          {ownerEntries.length ? (
            <ul className="admin-owner-bars">
              {ownerEntries.map(([owner, count]) => (
                <li key={owner}>
                  <span>{owner}</span>
                  <div className="admin-owner-bar-track">
                    <i style={{ width: `${(count / Math.max(stats.total, 1)) * 100}%` }} />
                  </div>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-muted">No tasks match current filters.</p>
          )}
        </div>
        <div className="admin-module admin-module-compact">
          <h4>Priority</h4>
          {priorityEntries.length ? (
            <ul className="admin-owner-bars">
              {priorityEntries.map(([priority, count]) => (
                <li key={priority}>
                  <span>{PRIORITY_LABELS[priority]}</span>
                  <div className="admin-owner-bar-track">
                    <i style={{ width: `${(count / Math.max(stats.total, 1)) * 100}%` }} />
                  </div>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-muted">No tasks match current filters.</p>
          )}
        </div>
      </div>
    </section>
  );
}
