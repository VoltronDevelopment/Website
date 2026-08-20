"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatShortDate, linkedTaskCount } from "@/lib/project-metrics";
import type { Milestone, Owner, Project, ProjectStatus } from "@/lib/projects-types";
import { PROJECT_STATUSES, STATUS_LABELS } from "@/lib/projects-types";

const FIT_LIMIT = 6;
const SLOT_PX = 118;

type MilestoneRailProps = {
  project: Project;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (milestoneId: string, patch: Partial<Milestone>) => Promise<void>;
  onAdd: (input: {
    name: string;
    owner: Owner;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  onDelete: (milestoneId: string) => Promise<void>;
};

export function MilestoneRail({
  project,
  selectedId,
  onSelect,
  onUpdate,
  onAdd,
  onDelete
}: MilestoneRailProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState(project.owner);
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.startDate);

  const owners = project.team.length ? project.team : [project.owner];
  const selected = useMemo(
    () => project.milestones.find((m) => m.id === selectedId) ?? null,
    [project.milestones, selectedId]
  );
  const editing = useMemo(
    () => project.milestones.find((m) => m.id === editingId) ?? null,
    [editingId, project.milestones]
  );
  const selectedLinked = selected ? linkedTaskCount(project, selected.id) : 0;
  const editingLinked = editing ? linkedTaskCount(project, editing.id) : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#ms-")) return;
    const milestoneId = hash.slice(4);
    const el = document.getElementById(`ms-${milestoneId}`);
    if (!el) return;
    onSelect(milestoneId);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("is-hash-target");
    const timer = window.setTimeout(() => el.classList.remove("is-hash-target"), 1800);
    return () => window.clearTimeout(timer);
  }, [project.milestones]);

  const count = project.milestones.length;
  const scrollMode = count > FIT_LIMIT;

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onAdd({ name: name.trim(), owner, startDate, endDate });
      setName("");
      setShowAdd(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-ms-rail" aria-label="Milestone timeline">
      <div className="admin-schedule-heading">
        <h3 className="admin-section-title">Milestones</h3>
        <div className="admin-schedule-heading-actions">
          <p className="admin-schedule-hint">Click a gate to filter and reframe the Gantt</p>
          <button type="button" className="admin-btn-primary" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Close" : "+ Add"}
          </button>
        </div>
      </div>

      {showAdd ? (
        <form className="admin-add-form admin-add-form-compact" onSubmit={handleAdd}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Owner
            <select value={owner} onChange={(e) => setOwner(e.target.value)}>
              {owners.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
          <label>
            End
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </label>
          <button type="submit" className="admin-btn-primary" disabled={busy}>
            {busy ? "…" : "Add"}
          </button>
        </form>
      ) : null}

      <div className={`admin-ms-scroll${scrollMode ? " is-scroll" : " is-fit"}`}>
        <div
          className={`admin-ms-roll${scrollMode ? " scroll" : " fit"}`}
          style={scrollMode ? { width: Math.max(count, 1) * SLOT_PX } : undefined}
        >
          <div className="admin-ms-line" aria-hidden="true" />
          {project.milestones.map((ms) => {
            const active = selectedId === ms.id;
            const linked = linkedTaskCount(project, ms.id);
            return (
              <button
                key={ms.id}
                id={`ms-${ms.id}`}
                type="button"
                className={`admin-ms-node status-${ms.status}${active ? " active" : ""}`}
                style={scrollMode ? { width: SLOT_PX } : undefined}
                onClick={() => onSelect(active ? null : ms.id)}
                title={`${ms.name} · ${formatShortDate(ms.endDate)} · ${linked} task${linked === 1 ? "" : "s"}`}
              >
                <span className="admin-ms-dot" />
                <span className="admin-ms-label">{ms.name}</span>
                <span className="admin-ms-date">
                  {formatShortDate(ms.endDate)}
                  {linked ? ` · ${linked}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div className="admin-ms-detail">
          <div>
            <strong>{selected.name}</strong>
            <span>
              {formatShortDate(selected.startDate)} → {formatShortDate(selected.endDate)} · {selected.owner} ·{" "}
              {STATUS_LABELS[selected.status]}
              {selectedLinked
                ? ` · ${selectedLinked} linked task${selectedLinked === 1 ? "" : "s"}`
                : " · no linked tasks"}
            </span>
          </div>
          <div className="admin-ms-detail-actions">
            <button type="button" className="admin-btn-ghost" onClick={() => setEditingId(selected.id)}>
              Edit
            </button>
            <button type="button" className="admin-btn-ghost" onClick={() => onSelect(null)}>
              Clear
            </button>
            <button
              type="button"
              className="admin-text-danger"
              onClick={() => {
                if (window.confirm(`Delete “${selected.name}”?`)) void onDelete(selected.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <p className="admin-ms-empty">All milestones · select one to focus tasks</p>
      )}

      {editing ? (
        <form
          className="admin-add-form admin-add-form-compact"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const patch: Partial<Milestone> = {
              name: String(form.get("name") || editing.name),
              owner: String(form.get("owner") || editing.owner),
              startDate: String(form.get("startDate") || editing.startDate),
              endDate: String(form.get("endDate") || editing.endDate)
            };
            if (!editingLinked) {
              patch.status = String(form.get("status") || editing.status) as ProjectStatus;
            }
            void onUpdate(editing.id, patch).then(() => setEditingId(null));
          }}
        >
          <label>
            Name
            <input name="name" defaultValue={editing.name} required />
          </label>
          <label>
            Owner
            <select name="owner" defaultValue={editing.owner}>
              {owners.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </label>
          <label>
            Start
            <input name="startDate" type="date" defaultValue={editing.startDate} required />
          </label>
          <label>
            End
            <input name="endDate" type="date" defaultValue={editing.endDate} required />
          </label>
          {editingLinked ? (
            <p className="admin-muted">
              Status is derived from {editingLinked} linked task{editingLinked === 1 ? "" : "s"} (
              {STATUS_LABELS[editing.status]}).
            </p>
          ) : (
            <label>
              Status
              <select name="status" defaultValue={editing.status}>
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" className="admin-btn-primary">
            Save
          </button>
          <button type="button" className="admin-btn-ghost" onClick={() => setEditingId(null)}>
            Cancel
          </button>
        </form>
      ) : null}
    </section>
  );
}
