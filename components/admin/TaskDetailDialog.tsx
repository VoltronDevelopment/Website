"use client";

import { useEffect, useId, useState } from "react";
import { barTone, formatShortDate, statusFromProgress } from "@/lib/project-metrics";
import type { Owner, Project, TaskPriority, Workstream } from "@/lib/projects-types";
import {
  PRIORITY_LABELS,
  PROJECT_STATUSES,
  STATUS_LABELS,
  TASK_PRIORITIES
} from "@/lib/projects-types";
import { StatusBadge } from "@/components/admin/AdminPickers";

const TONE_LABELS: Record<ReturnType<typeof barTone>, string> = {
  green: "On track",
  yellow: "Due soon",
  delayed: "Delayed",
  blocked: "Blocked",
  done: "Done"
};

type TaskDetailDialogProps = {
  project: Project;
  task: Workstream;
  owners: readonly string[];
  readOnly?: boolean;
  onClose: () => void;
  onUpdate?: (workstreamId: string, patch: Partial<Workstream>) => Promise<void>;
  onFilterGate?: (milestoneId: string | null) => void;
};

export function TaskDetailDialog({
  project,
  task,
  owners,
  readOnly = true,
  onClose,
  onUpdate,
  onFilterGate
}: TaskDetailDialogProps) {
  const titleId = useId();
  const editable = !readOnly && Boolean(onUpdate);
  const [draft, setDraft] = useState(task);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(task);
    setError(null);
  }, [task]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const gateName =
    project.milestones.find((m) => m.id === draft.milestoneId)?.name ?? "No gate";
  const tone = barTone(draft);
  const durationDays = Math.max(
    1,
    Math.round(
      (new Date(`${draft.endDate}T00:00:00`).getTime() -
        new Date(`${draft.startDate}T00:00:00`).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  async function save(patch: Partial<Workstream>) {
    if (!onUpdate) return;
    setBusy(true);
    setError(null);
    try {
      const next = { ...draft, ...patch };
      if (patch.progressPct !== undefined) {
        next.status = statusFromProgress(patch.progressPct, next.status);
        if (patch.progressPct >= 100) next.blockReason = null;
      }
      setDraft(next);
      await onUpdate(task.id, {
        ...patch,
        ...(patch.progressPct !== undefined
          ? {
              status: statusFromProgress(patch.progressPct, draft.status),
              ...(patch.progressPct >= 100 ? { blockReason: null } : {})
            }
          : {})
      });
    } catch {
      setError("Could not save changes.");
      setDraft(task);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="admin-task-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="admin-task-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="admin-task-dialog-head">
          <div>
            <p className="admin-task-dialog-kicker">Task detail</p>
            {editable ? (
              <input
                id={titleId}
                className="admin-task-dialog-title-input"
                value={draft.name}
                disabled={busy}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                onBlur={() => {
                  const name = draft.name.trim();
                  if (name && name !== task.name) void save({ name });
                }}
              />
            ) : (
              <h2 id={titleId}>{draft.name}</h2>
            )}
          </div>
          <button type="button" className="admin-btn-ghost" onClick={onClose} aria-label="Close">
            Close
          </button>
        </header>

        <div className="admin-task-dialog-body">
          <div className="admin-task-dialog-status-row">
            <StatusBadge status={draft.status} />
            <span className={`admin-task-tone tone-${tone}`}>{TONE_LABELS[tone]}</span>
            <span className="admin-task-pct">{draft.progressPct}%</span>
          </div>

          <dl className="admin-task-dl">
            <div>
              <dt>Gate</dt>
              <dd>
                {editable ? (
                  <select
                    value={draft.milestoneId ?? ""}
                    disabled={busy}
                    onChange={(e) => {
                      const milestoneId = e.target.value || null;
                      setDraft((d) => ({ ...d, milestoneId }));
                      void save({ milestoneId });
                    }}
                  >
                    <option value="">No gate</option>
                    {project.milestones.map((ms) => (
                      <option key={ms.id} value={ms.id}>
                        {ms.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  gateName
                )}
              </dd>
            </div>

            <div>
              <dt>Owner</dt>
              <dd>
                {editable ? (
                  <select
                    value={draft.owner}
                    disabled={busy}
                    onChange={(e) => {
                      const owner = e.target.value as Owner;
                      setDraft((d) => ({ ...d, owner }));
                      void save({ owner });
                    }}
                  >
                    {owners.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  draft.owner
                )}
              </dd>
            </div>

            <div>
              <dt>Priority</dt>
              <dd>
                {editable ? (
                  <select
                    value={draft.priority}
                    disabled={busy}
                    onChange={(e) => {
                      const priority = e.target.value as TaskPriority;
                      setDraft((d) => ({ ...d, priority }));
                      void save({ priority });
                    }}
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                ) : (
                  PRIORITY_LABELS[draft.priority]
                )}
              </dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>
                {editable ? (
                  <select
                    value={draft.status}
                    disabled={busy}
                    onChange={(e) => {
                      const status = e.target.value as Workstream["status"];
                      const patch: Partial<Workstream> = { status };
                      if (status !== "blocked") patch.blockReason = null;
                      setDraft((d) => ({ ...d, ...patch }));
                      void save(patch);
                    }}
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                ) : (
                  STATUS_LABELS[draft.status]
                )}
              </dd>
            </div>

            <div>
              <dt>Start</dt>
              <dd>
                {editable ? (
                  <input
                    type="date"
                    value={draft.startDate}
                    disabled={busy}
                    onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                    onBlur={() => {
                      if (draft.startDate !== task.startDate) void save({ startDate: draft.startDate });
                    }}
                  />
                ) : (
                  formatShortDate(draft.startDate)
                )}
              </dd>
            </div>

            <div>
              <dt>End</dt>
              <dd>
                {editable ? (
                  <input
                    type="date"
                    value={draft.endDate}
                    disabled={busy}
                    onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                    onBlur={() => {
                      if (draft.endDate !== task.endDate) void save({ endDate: draft.endDate });
                    }}
                  />
                ) : (
                  formatShortDate(draft.endDate)
                )}
              </dd>
            </div>

            <div>
              <dt>Duration</dt>
              <dd>
                {durationDays} day{durationDays === 1 ? "" : "s"}
              </dd>
            </div>

            <div>
              <dt>Progress</dt>
              <dd>
                {editable ? (
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.progressPct}
                    disabled={busy}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        progressPct: Math.max(0, Math.min(100, Number(e.target.value) || 0))
                      }))
                    }
                    onBlur={() => {
                      if (draft.progressPct !== task.progressPct) {
                        void save({ progressPct: draft.progressPct });
                      }
                    }}
                  />
                ) : (
                  `${draft.progressPct}%`
                )}
              </dd>
            </div>
          </dl>

          {(draft.status === "blocked" || draft.blockReason) && (
            <div className="admin-task-block-box">
              <strong>Block reason</strong>
              {editable ? (
                <textarea
                  value={draft.blockReason ?? ""}
                  rows={3}
                  disabled={busy}
                  placeholder="Why is this blocked?"
                  onChange={(e) => setDraft((d) => ({ ...d, blockReason: e.target.value }))}
                  onBlur={() => {
                    const blockReason = (draft.blockReason ?? "").trim() || null;
                    if (blockReason !== (task.blockReason ?? null)) {
                      void save({
                        status: "blocked",
                        blockReason
                      });
                    }
                  }}
                />
              ) : (
                <p>{draft.blockReason || "Reason not stated"}</p>
              )}
            </div>
          )}

          {error ? <p className="admin-task-error">{error}</p> : null}
        </div>

        <footer className="admin-task-dialog-foot">
          {draft.milestoneId && onFilterGate ? (
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => {
                onFilterGate(draft.milestoneId ?? null);
                onClose();
              }}
            >
              Show gate on chart
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="admin-btn-primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
