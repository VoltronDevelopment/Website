"use client";

import { useEffect, useMemo, useState } from "react";
import { GanttChart } from "@/components/admin/GanttChart";
import { diffWorkstreams, formatScopeLabel } from "@/lib/review-diff";
import { statusFromProgress } from "@/lib/project-metrics";
import type { Project, Workstream } from "@/lib/projects-types";
import type { ProjectReview } from "@/lib/reviews-types";
import { REVIEW_STATUS_LABELS } from "@/lib/reviews-types";

type ReviewPanelProps = {
  project: Project;
  review: ProjectReview;
  onClose: () => void;
  onSaved: (review: ProjectReview) => void;
  onApplied: (review: ProjectReview) => void;
};

export function ReviewPanel({
  project,
  review: initial,
  onClose,
  onSaved,
  onApplied
}: ReviewPanelProps) {
  const [review, setReview] = useState(initial);
  const [proposed, setProposed] = useState<Workstream[]>(initial.proposed);
  const [overallComment, setOverallComment] = useState(initial.overallComment);
  const [taskComments, setTaskComments] = useState<Record<string, string>>(initial.taskComments);
  const [title, setTitle] = useState(initial.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    initial.scope.milestoneId
  );
  const [timeFilter, setTimeFilter] = useState(initial.scope.timeFilter);
  const [ownerFilter, setOwnerFilter] = useState(initial.scope.ownerFilter);
  const [priorityFilter, setPriorityFilter] = useState(initial.scope.priorityFilter);
  const [doneFilter, setDoneFilter] = useState(initial.scope.doneFilter);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setReview(initial);
    setProposed(initial.proposed);
    setOverallComment(initial.overallComment);
    setTaskComments(initial.taskComments);
    setTitle(initial.title);
    setSelectedMilestoneId(initial.scope.milestoneId);
    setTimeFilter(initial.scope.timeFilter);
    setOwnerFilter(initial.scope.ownerFilter);
    setPriorityFilter(initial.scope.priorityFilter);
    setDoneFilter(initial.scope.doneFilter);
    setZoom(1);
    setError("");
  }, [initial]);

  const readOnly = review.status === "applied";
  const workingProject = useMemo(
    () => ({ ...project, workstreams: proposed }),
    [project, proposed]
  );

  const diffs = useMemo(
    () => diffWorkstreams(review.baseline, proposed),
    [proposed, review.baseline]
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function persist(status: "draft" | "saved") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/projects/${project.slug}/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          overallComment,
          taskComments,
          proposed,
          status
        })
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.message || "Save failed.");
        return;
      }
      setReview(data.review);
      onSaved(data.review);
    } finally {
      setBusy(false);
    }
  }

  async function applyLive() {
    if (
      !window.confirm(
        "Apply this review’s proposed task changes to the live project plan?"
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      // Persist latest draft first
      const saveResponse = await fetch(
        `/api/admin/projects/${project.slug}/reviews/${review.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            overallComment,
            taskComments,
            proposed,
            status: "saved"
          })
        }
      );
      const saveData = await saveResponse.json();
      if (!saveData.ok) {
        setError(saveData.message || "Save failed.");
        return;
      }

      const response = await fetch(`/api/admin/projects/${project.slug}/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply" })
      });
      const data = await response.json();
      if (!data.ok) {
        setError(data.message || "Apply failed.");
        return;
      }
      setReview(data.review);
      onApplied(data.review);
    } finally {
      setBusy(false);
    }
  }

  const milestoneName =
    project.milestones.find((m) => m.id === review.scope.milestoneId)?.name ?? null;

  return (
    <div className="admin-review-overlay" role="dialog" aria-modal="true" aria-label="Project review">
      <div className="admin-review-panel">
        <header className="admin-review-panel-head">
          <div>
            <p className="admin-eyebrow">Review · {REVIEW_STATUS_LABELS[review.status]}</p>
            {readOnly ? (
              <h2>{review.title}</h2>
            ) : (
              <input
                className="admin-review-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Review title"
              />
            )}
            <p className="admin-muted">
              Scope: {formatScopeLabel(review.scope, milestoneName)} · by {review.author}
            </p>
          </div>
          <div className="admin-review-panel-tools">
            <div className="admin-zoom-controls" role="group" aria-label="Timeline zoom">
              <button
                type="button"
                className="admin-btn-ghost admin-zoom-btn"
                disabled={zoom <= 0.5}
                onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                title="Zoom out"
              >
                −
              </button>
              <span className="admin-zoom-label">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="admin-btn-ghost admin-zoom-btn"
                disabled={zoom >= 2.5}
                onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))}
                title="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                className="admin-btn-ghost"
                disabled={zoom === 1}
                onClick={() => setZoom(1)}
              >
                Fit
              </button>
            </div>
            <button type="button" className="admin-btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <div className="admin-review-panel-body">
          <GanttChart
            project={workingProject}
            selectedMilestoneId={selectedMilestoneId}
            timeFilter={timeFilter}
            ownerFilter={ownerFilter}
            priorityFilter={priorityFilter}
            doneFilter={doneFilter}
            onTimeFilter={setTimeFilter}
            onOwnerFilter={setOwnerFilter}
            onPriorityFilter={setPriorityFilter}
            onDoneFilter={setDoneFilter}
            onSelectMilestone={setSelectedMilestoneId}
            readOnly={readOnly}
            zoom={zoom}
            onUpdate={
              readOnly
                ? undefined
                : async (workstreamId, patch) => {
                    setProposed((rows) =>
                      rows.map((row) => {
                        if (row.id !== workstreamId) return row;
                        const next = { ...row, ...patch };
                        if (patch.progressPct !== undefined) {
                          next.status = statusFromProgress(next.progressPct, next.status);
                          if (next.progressPct >= 100) next.blockReason = null;
                        }
                        if (next.status !== "blocked") next.blockReason = null;
                        return next;
                      })
                    );
                  }
            }
            onAdd={
              readOnly
                ? undefined
                : async (input) => {
                    const id = `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
                    setProposed((rows) => [
                      ...rows,
                      {
                        id,
                        name: input.name.trim(),
                        owner: input.owner,
                        startDate: input.startDate,
                        endDate: input.endDate,
                        progressPct: 0,
                        status: "not_started",
                        priority: input.priority ?? "p2",
                        milestoneId: input.milestoneId ?? null,
                        blockReason: null
                      }
                    ]);
                  }
            }
            onDelete={
              readOnly
                ? undefined
                : async (workstreamId) => {
                    setProposed((rows) => rows.filter((row) => row.id !== workstreamId));
                    setTaskComments((current) => {
                      const next = { ...current };
                      delete next[workstreamId];
                      return next;
                    });
                  }
            }
            rowComments={taskComments}
            rowCommentsReadOnly={readOnly}
            onRowCommentChange={(workstreamId, value) =>
              setTaskComments((current) => ({ ...current, [workstreamId]: value }))
            }
          />

          <section className="admin-review-comments" aria-label="Overall review comment">
            <h3 className="admin-section-title">Overall comment</h3>
            <label className="admin-review-overall">
              Summary across all line items
              <textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                rows={3}
                disabled={readOnly}
                placeholder="What did this review conclude overall?"
              />
            </label>
          </section>

          <section className="admin-review-diff" aria-label="Proposed changes">
            <h3 className="admin-section-title">Proposed changes</h3>
            {diffs.length === 0 ? (
              <p className="admin-muted">No task edits yet versus review baseline.</p>
            ) : (
              <ul className="admin-review-diff-list">
                {diffs.map((diff) => (
                  <li key={diff.workstreamId}>
                    <strong>{diff.name}</strong>
                    <span>{diff.changes.join(" · ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {error ? <p className="admin-form-error">{error}</p> : null}

        <footer className="admin-review-panel-foot">
          {!readOnly ? (
            <>
              <button
                type="button"
                className="admin-btn-ghost"
                disabled={busy}
                onClick={() => void persist("draft")}
              >
                Save draft
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={busy}
                onClick={() => void persist("saved")}
              >
                Save review
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                disabled={busy}
                onClick={() => void applyLive()}
              >
                Save & apply to live
              </button>
            </>
          ) : (
            <p className="admin-muted">
              Applied {review.appliedAt ? new Date(review.appliedAt).toLocaleString("en-IN") : ""}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
