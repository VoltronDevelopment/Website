"use client";

import { useState } from "react";
import type { Owner, Project, ProjectStatus } from "@/lib/projects-types";
import { OWNER_POOL, PROJECT_STATUSES, STATUS_LABELS } from "@/lib/projects-types";
import {
  formatShortDate,
  projectCompletionPct,
  projectTimelineRatio,
  weeklyProgressSeries,
  workstreamStatusCounts
} from "@/lib/project-metrics";
import { StatusDonut } from "@/components/admin/AdminCharts";
import { StatusBadge } from "@/components/admin/AdminPickers";

type ProjectCharterProps = {
  project: Project;
  onSave: (patch: Partial<Project>) => Promise<void>;
};

export function ProjectCharter({ project, onSave }: ProjectCharterProps) {
  const [editing, setEditing] = useState<null | "objective" | "ownership">(null);
  const [saving, setSaving] = useState(false);

  const [objective, setObjective] = useState(project.objective);
  const [name, setName] = useState(project.name);
  const [owner, setOwner] = useState(project.owner);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState(project.startDate);
  const [targetDate, setTargetDate] = useState(project.targetDate);
  const [team, setTeam] = useState<Owner[]>(project.team);
  const [newMember, setNewMember] = useState("");

  const completion = projectCompletionPct(project);
  const statusCounts = workstreamStatusCounts(project);
  const weekly = weeklyProgressSeries(project);
  const todayRatio = projectTimelineRatio(project) * 100;

  async function save(patch: Partial<Project>) {
    setSaving(true);
    try {
      await onSave(patch);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  function openObjective() {
    setObjective(project.objective);
    setName(project.name);
    setEditing("objective");
  }

  function openOwnership() {
    setOwner(project.owner);
    setStatus(project.status);
    setStartDate(project.startDate);
    setTargetDate(project.targetDate);
    setTeam(project.team);
    setNewMember("");
    setEditing("ownership");
  }

  function addTeamMember() {
    const value = newMember.trim();
    if (!value) return;
    setTeam((current) => Array.from(new Set([...current, value])));
    setNewMember("");
  }

  function togglePoolMember(person: string) {
    setTeam((current) =>
      current.includes(person) ? current.filter((n) => n !== person) : [...current, person]
    );
  }

  return (
    <section className="admin-charter-modules" aria-label="Project charter">
      <div className="admin-module-grid">
        <article className="admin-module">
          <header className="admin-module-head">
            <h2>Objective</h2>
            {editing !== "objective" ? (
              <button type="button" className="admin-btn-ghost" onClick={openObjective}>
                Edit
              </button>
            ) : null}
          </header>
          {editing === "objective" ? (
            <form
              className="admin-module-form"
              onSubmit={(e) => {
                e.preventDefault();
                void save({ name, objective });
              }}
            >
              <label>
                Project name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label>
                Objective
                <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={4} required />
              </label>
              <div className="admin-module-actions">
                <button type="button" className="admin-btn-ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <p className="admin-charter-objective">{project.objective}</p>
          )}
        </article>

        <article className="admin-module">
          <header className="admin-module-head">
            <h2>Ownership</h2>
            {editing !== "ownership" ? (
              <button type="button" className="admin-btn-ghost" onClick={openOwnership}>
                Edit
              </button>
            ) : null}
          </header>
          {editing === "ownership" ? (
            <div className="admin-module-form">
              <form
                className="admin-module-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const nextTeam = Array.from(new Set([owner, ...team]));
                  void save({
                    owner,
                    status,
                    startDate,
                    targetDate,
                    team: nextTeam
                  });
                }}
              >
                <label>
                  Primary owner
                  <select value={owner} onChange={(e) => setOwner(e.target.value)}>
                    {Array.from(new Set([...team, ...OWNER_POOL, owner])).map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
                    {PROJECT_STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                  <small className="admin-field-hint">
                    Manual status is kept until you change tasks or clear via a new save.
                  </small>
                </label>
                <label>
                  Start
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </label>
                <label>
                  Target
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
                </label>

                <div className="admin-ownership-team">
                  <span className="admin-field-label">Team</span>
                  <div className="admin-team-pool">
                    {OWNER_POOL.map((person) => (
                      <label key={person} className="admin-team-chip">
                        <input
                          type="checkbox"
                          checked={team.includes(person)}
                          onChange={() => togglePoolMember(person)}
                        />
                        {person}
                      </label>
                    ))}
                  </div>
                  <div className="admin-inline-add">
                    <input
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      placeholder="Add owner name"
                    />
                    <button type="button" className="admin-btn-ghost" onClick={addTeamMember}>
                      Add
                    </button>
                  </div>
                  <div className="admin-team-list">
                    {team.map((person) => (
                      <button
                        key={person}
                        type="button"
                        className="admin-owner-pill"
                        onClick={() => setTeam((current) => current.filter((n) => n !== person))}
                        title="Remove"
                      >
                        {person} ×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-module-actions">
                  <button type="button" className="admin-btn-ghost" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary" disabled={saving || !team.length}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="admin-ownership-view">
              <div className="admin-ownership-meta">
                <div>
                  <span>Owner</span>
                  <strong>{project.owner}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <StatusBadge status={project.status} />
                  {project.statusManual ? (
                    <small className="admin-field-hint">Manual override</small>
                  ) : project.workstreams.length ? (
                    <small className="admin-field-hint">Derived from tasks</small>
                  ) : null}
                </div>
                <div>
                  <span>Start</span>
                  <strong>{formatShortDate(project.startDate)}</strong>
                </div>
                <div>
                  <span>Target</span>
                  <strong>{formatShortDate(project.targetDate)}</strong>
                </div>
              </div>
              <div className="admin-ownership-team-view">
                <span>Team</span>
                <div className="admin-team-list">
                  {project.team.map((person) => (
                    <span key={person} className="admin-owner-pill">
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </article>

        <article className="admin-module">
          <header className="admin-module-head">
            <h2>Progress</h2>
          </header>
          <p className="admin-schedule-hint">
            Live plan pace · updates when a review is applied
          </p>

          <div className="admin-pace-timeline" aria-label="Project timeline">
            <div className="admin-pace-track">
              <div className="admin-pace-fill" style={{ width: `${completion}%` }} />
              <span
                className="admin-pace-today"
                style={{ left: `${todayRatio}%` }}
                title="Today"
              />
            </div>
            <div className="admin-pace-labels">
              <span>{formatShortDate(project.startDate)}</span>
              <strong>{completion}% avg</strong>
              <span>{formatShortDate(project.targetDate)}</span>
            </div>
          </div>

          {weekly.length ? (
            <div className="admin-week-pace" aria-label="Weekly task progression">
              {weekly.map((point) => (
                <div
                  key={point.weekEnd}
                  className={`admin-week-pace-col${point.isCurrent ? " is-current" : ""}`}
                >
                  <div className="admin-week-pace-bar-wrap">
                    <div
                      className="admin-week-pace-bar"
                      style={{ height: `${Math.max(4, point.pct)}%` }}
                      title={`${point.label}: ${point.pct}%`}
                    />
                  </div>
                  <strong>{point.pct}%</strong>
                  <span>{point.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-muted">No schedule window yet.</p>
          )}
        </article>

        <article className="admin-module admin-module-viz">
          <header className="admin-module-head">
            <h2>Health</h2>
          </header>
          <div className="admin-charter-viz admin-charter-viz-fill">
            <StatusDonut
              counts={statusCounts}
              size="lg"
              centerValue={`${completion}%`}
              centerLabel="avg"
            />
          </div>
        </article>
      </div>
    </section>
  );
}
