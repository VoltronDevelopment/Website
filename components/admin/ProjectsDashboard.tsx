"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatShortDate } from "@/lib/project-metrics";
import {
  OWNER_POOL,
  PROJECT_STATUSES,
  STATUS_LABELS,
  type Owner,
  type Project,
  type ProjectStatus
} from "@/lib/projects-types";
import { ProgressRing } from "@/components/admin/AdminCharts";
import { ProgressBar, StatusBadge } from "@/components/admin/AdminPickers";

type Stats = {
  activeCount: number;
  alphaPct: number;
  blockedCount: number;
  milestonesDue: number;
};

type ProjectCard = Project & {
  completionPct: number;
  nextMilestone: string | null;
};

export function ProjectsDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [owner, setOwner] = useState<Owner | "">("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    objective: string;
    owner: Owner;
    startDate: string;
    targetDate: string;
    template: "blank" | "alpha";
  }>({
    name: "",
    objective: "",
    owner: OWNER_POOL[0],
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    template: "alpha"
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (owner) params.set("owner", owner);
    if (status) params.set("status", status);
    if (showCompleted) params.set("showCompleted", "true");
    const response = await fetch(`/api/admin/projects?${params.toString()}`);
    const data = await response.json();
    if (data.ok) {
      setStats(data.stats);
      setProjects(data.projects);
    }
    setLoading(false);
  }, [owner, showCompleted, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.ok) {
        setShowCreate(false);
        router.push(`/admin/projects/${data.project.slug}`);
      } else {
        setCreateError(data.message || "Could not create project.");
      }
    } catch {
      setCreateError("Could not create project.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(project: ProjectCard) {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
    setCreateError(null);
    const response = await fetch(`/api/admin/projects/${project.slug}`, { method: "DELETE" });
    const data = await response.json();
    if (data.ok) void load();
    else setCreateError(data.message || "Could not delete project.");
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header-split">
        <div>
          <p className="admin-eyebrow">Founder Project Control</p>
          <h1>Projects</h1>
          <p className="admin-lead">Modular charters, milestones first, editable schedules.</p>
        </div>
        <button type="button" className="admin-btn-primary" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Close" : "+ New project"}
        </button>
      </header>

      {showCreate ? (
        <form className="admin-create-card" onSubmit={handleCreate}>
          <h2>Create project</h2>
          {createError ? (
            <p className="admin-action-error" role="alert">
              {createError}
            </p>
          ) : null}
          <div className="admin-create-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="Project name"
              />
            </label>
            <label>
              Owner
              <select
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              >
                {OWNER_POOL.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Plan template
              <select
                value={form.template}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    template: e.target.value as "blank" | "alpha"
                  }))
                }
              >
                <option value="alpha">Alpha 90-day (90 tasks, 8 gates)</option>
                <option value="blank">Blank charter</option>
              </select>
            </label>
            <label>
              Start
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                required
              />
            </label>
            <label>
              Target
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                required
              />
            </label>
            <label className="admin-create-wide">
              Objective
              <textarea
                value={form.objective}
                onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                rows={3}
                placeholder="What this project must achieve"
              />
            </label>
          </div>
          <button type="submit" className="admin-btn-primary" disabled={creating}>
            {creating ? "Creating…" : "Create project"}
          </button>
        </form>
      ) : null}

      {!showCreate && createError ? (
        <p className="admin-action-error" role="alert">
          {createError}
        </p>
      ) : null}

      {stats ? (
        <div className="admin-stats-strip">
          <div className="admin-stat admin-stat-ring">
            <ProgressRing
              value={stats.alphaPct}
              size="md"
              label="Alpha"
              tone={stats.blockedCount > 0 ? "blocked" : "default"}
            />
          </div>
          <div className="admin-stat">
            <span>{stats.activeCount}</span>
            <small>Active Projects</small>
          </div>
          <div className="admin-stat">
            <span>{stats.blockedCount}</span>
            <small>Blocked Items</small>
          </div>
          <div className="admin-stat">
            <span>{stats.milestonesDue}</span>
            <small>Milestones Due</small>
          </div>
        </div>
      ) : null}

      <div className="admin-filters">
        <label>
          Owner
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="">All</option>
            {OWNER_POOL.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus | "")}>
            <option value="">All</option>
            {PROJECT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-filter-toggle">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show completed
        </label>
      </div>

      {loading ? <p className="admin-muted">Loading projects…</p> : null}

      {!loading && projects.length === 0 ? (
        <p className="admin-muted">No projects match these filters.</p>
      ) : null}

      <div className="admin-project-grid">
        {projects.map((project) => (
          <article key={project.id} className="admin-project-card">
            <div className="admin-project-card-top">
              <div>
                <h2>{project.name}</h2>
                <StatusBadge status={project.status} />
              </div>
              <ProgressRing
                value={project.completionPct}
                size="sm"
                tone={
                  project.status === "blocked"
                    ? "blocked"
                    : project.status === "completed"
                      ? "completed"
                      : "default"
                }
              />
            </div>
            <ProgressBar value={project.completionPct} />
            <p className="admin-project-dates">
              {formatShortDate(project.startDate)} → {formatShortDate(project.targetDate)}
            </p>
            <p className="admin-project-meta">
              Owner: {project.owner}
              {project.nextMilestone ? ` · Next: ${project.nextMilestone}` : ""}
            </p>
            <div className="admin-card-actions">
              <Link href={`/admin/projects/${project.slug}`} className="admin-card-link">
                Open project →
              </Link>
              <button type="button" className="admin-text-danger" onClick={() => void handleDelete(project)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
