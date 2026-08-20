"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatShortDate, projectCompletionPct } from "@/lib/project-metrics";
import type { Project } from "@/lib/projects-types";
import { dateToRatio } from "@/lib/gantt-math";
import { StatusBadge } from "@/components/admin/AdminPickers";

export function TimelineDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/projects");
        const data = await response.json();
        if (data.ok) setProjects(data.projects);
        else setError(data.message || "Could not load projects.");
      } catch {
        setError("Could not load projects.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const visible = useMemo(
    () => (showCompleted ? projects : projects.filter((p) => p.status !== "completed")),
    [projects, showCompleted]
  );

  const starts = visible.map((p) => p.startDate).sort();
  const ends = visible.map((p) => p.targetDate).sort();
  const rangeStart = starts[0] ?? "2026-08-01";
  const rangeEnd = ends[ends.length - 1] ?? "2026-10-01";

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header-split">
        <div>
          <p className="admin-eyebrow">Founder Project Control</p>
          <h1>Timeline</h1>
          <p className="admin-lead">All strategic projects on one axis.</p>
        </div>
        <label className="admin-filter-toggle">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show completed
        </label>
      </header>

      {loading ? <p className="admin-muted">Loading timeline…</p> : null}
      {error ? (
        <p className="admin-action-error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && visible.length === 0 ? (
        <p className="admin-muted">
          No projects on the timeline yet. Create one from the Projects tab.
        </p>
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <div className="admin-timeline-board">
          {visible.map((project) => {
            const left = dateToRatio(project.startDate, rangeStart, rangeEnd) * 100;
            const right = dateToRatio(project.targetDate, rangeStart, rangeEnd) * 100;
            return (
              <div key={project.id} className="admin-timeline-row">
                <Link href={`/admin/projects/${project.slug}`} className="admin-timeline-label">
                  <strong>{project.name}</strong>
                  <StatusBadge status={project.status} />
                  <span>{projectCompletionPct(project)}%</span>
                </Link>
                <div className="admin-timeline-track">
                  <div
                    className={`admin-timeline-bar status-${project.status}`}
                    style={{ left: `${left}%`, width: `${Math.max(6, right - left)}%` }}
                  >
                    {formatShortDate(project.startDate)} – {formatShortDate(project.targetDate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
