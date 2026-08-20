"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  dateToRatio,
  dayDeltaFromPixels,
  moveRange,
  paddedViewRange,
  resizeRange,
  scheduleTrackWidth,
  timelineTicks
} from "@/lib/gantt-math";
import { barTone, filterWorkstreams, formatShortDate, type TaskViewFilter, type TimeFilter } from "@/lib/project-metrics";
import type { Owner, Project, TaskPriority, Workstream } from "@/lib/projects-types";
import { PRIORITY_LABELS, TASK_PRIORITIES } from "@/lib/projects-types";
import { OwnerPill } from "@/components/admin/AdminPickers";
import { TaskDetailDialog } from "@/components/admin/TaskDetailDialog";

type GanttChartProps = {
  project: Project;
  selectedMilestoneId: string | null;
  timeFilter: TimeFilter;
  ownerFilter: string;
  priorityFilter: string;
  doneFilter: TaskViewFilter;
  onTimeFilter: (value: TimeFilter) => void;
  onOwnerFilter: (value: string) => void;
  onPriorityFilter: (value: string) => void;
  onDoneFilter: (value: TaskViewFilter) => void;
  onSelectMilestone: (id: string | null) => void;
  onUpdate?: (workstreamId: string, patch: Partial<Workstream>) => Promise<void>;
  onAdd?: (input: {
    name: string;
    owner: Owner;
    startDate: string;
    endDate: string;
    milestoneId?: string | null;
    priority?: TaskPriority;
  }) => Promise<void>;
  onDelete?: (workstreamId: string) => Promise<void>;
  readOnly?: boolean;
  headingActions?: ReactNode;
  /** Timeline density multiplier (1 = default). Used by review zoom controls. */
  zoom?: number;
  /** When set, each visible task row shows a comment field. */
  rowComments?: Record<string, string>;
  onRowCommentChange?: (workstreamId: string, value: string) => void;
  rowCommentsReadOnly?: boolean;
};

type DragState = {
  id: string;
  mode: "move" | "resize-start" | "resize-end";
  startX: number;
  originStart: string;
  originEnd: string;
};

export function GanttChart({
  project,
  selectedMilestoneId,
  timeFilter,
  ownerFilter,
  priorityFilter,
  doneFilter,
  onTimeFilter,
  onOwnerFilter,
  onPriorityFilter,
  onDoneFilter,
  onSelectMilestone,
  onUpdate,
  onAdd,
  onDelete,
  readOnly = false,
  headingActions,
  zoom = 1,
  rowComments,
  onRowCommentChange,
  rowCommentsReadOnly = false
}: GanttChartProps) {
  const showRowComments = Boolean(rowComments && onRowCommentChange);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState(project.owner);
  const [priority, setPriority] = useState<TaskPriority>("p2");
  const [milestoneId, setMilestoneId] = useState<string>(selectedMilestoneId ?? "");
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.targetDate);
  const [busy, setBusy] = useState(false);
  const [localRows, setLocalRows] = useState(project.workstreams);
  const [pctDraft, setPctDraft] = useState<Record<string, string>>({});
  const [blockDraftId, setBlockDraftId] = useState<string | null>(null);
  const [blockReasonDraft, setBlockReasonDraft] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    setLocalRows(project.workstreams);
  }, [project.workstreams]);

  useEffect(() => {
    if (selectedMilestoneId) setMilestoneId(selectedMilestoneId);
  }, [selectedMilestoneId]);

  const owners = project.team.length ? project.team : [project.owner];
  const detailTask = detailId ? localRows.find((ws) => ws.id === detailId) ?? null : null;

  const openDetail = (id: string) => setDetailId(id);

  const effectiveProject = useMemo(
    () => ({ ...project, workstreams: localRows }),
    [localRows, project]
  );

  const viewRange = useMemo(() => {
    if (!selectedMilestoneId) {
      return { startDate: project.startDate, endDate: project.targetDate };
    }
    const ms = project.milestones.find((m) => m.id === selectedMilestoneId);
    if (!ms) return { startDate: project.startDate, endDate: project.targetDate };
    return paddedViewRange(ms.startDate, ms.endDate, project.startDate, project.targetDate, 4);
  }, [project.milestones, project.startDate, project.targetDate, selectedMilestoneId]);

  const rangeStart = viewRange.startDate;
  const rangeEnd = viewRange.endDate;
  const ticks = timelineTicks(rangeStart, rangeEnd, 6);
  const pxPerDay = Math.round(42 * Math.min(2.5, Math.max(0.5, zoom)));
  const trackWidth = scheduleTrackWidth(rangeStart, rangeEnd, pxPerDay);

  const filtered = useMemo(
    () =>
      filterWorkstreams(effectiveProject, {
        milestoneId: selectedMilestoneId,
        time: timeFilter,
        owner: ownerFilter || undefined,
        priority: priorityFilter || undefined,
        done: doneFilter
      }),
    [
      doneFilter,
      effectiveProject,
      ownerFilter,
      priorityFilter,
      selectedMilestoneId,
      timeFilter
    ]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.startsWith("#ws-")) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("is-hash-target");
    const timer = window.setTimeout(() => el.classList.remove("is-hash-target"), 1800);
    return () => window.clearTimeout(timer);
  }, [filtered]);

  const selectedMilestoneName =
    project.milestones.find((m) => m.id === selectedMilestoneId)?.name ?? null;

  const applyDrag = useCallback(
    (state: DragState, clientX: number) => {
      const width = trackRef.current?.getBoundingClientRect().width ?? trackWidth;
      const delta = dayDeltaFromPixels(clientX - state.startX, width, rangeStart, rangeEnd);
      if (state.mode === "move") {
        return moveRange(state.originStart, state.originEnd, delta, project.startDate, project.targetDate);
      }
      return resizeRange(
        state.originStart,
        state.originEnd,
        state.mode,
        delta,
        project.startDate,
        project.targetDate
      );
    },
    [project.startDate, project.targetDate, rangeEnd, rangeStart, trackWidth]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      const next = applyDrag(state, event.clientX);
      setLocalRows((current) =>
        current.map((row) => (row.id === state.id ? { ...row, ...next } : row))
      );
    },
    [applyDrag]
  );

  const endDrag = useCallback(
    async (event: PointerEvent) => {
      const state = dragRef.current;
      dragRef.current = null;
      setDragId(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      if (!state) return;
      if (onUpdate) await onUpdate(state.id, applyDrag(state, event.clientX));
    },
    [applyDrag, onPointerMove, onUpdate]
  );

  const startDrag = (
    event: React.PointerEvent,
    workstream: Workstream,
    mode: DragState["mode"]
  ) => {
    if (readOnly || !onUpdate) return;
    event.preventDefault();
    event.stopPropagation();
    const state: DragState = {
      id: workstream.id,
      mode,
      startX: event.clientX,
      originStart: workstream.startDate,
      originEnd: workstream.endDate
    };
    dragRef.current = state;
    setDragId(workstream.id);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  };

  async function commitPct(ws: Workstream, raw: string) {
    const num = Math.max(0, Math.min(100, Math.round(Number(raw))));
    if (!Number.isFinite(num)) {
      setPctDraft((d) => {
        const next = { ...d };
        delete next[ws.id];
        return next;
      });
      return;
    }
    setLocalRows((rows) =>
      rows.map((row) =>
        row.id === ws.id
          ? {
              ...row,
              progressPct: num,
              status: num >= 100 ? "completed" : row.status === "completed" ? "in_progress" : row.status,
              blockReason: num >= 100 ? null : row.blockReason
            }
          : row
      )
    );
    setPctDraft((d) => {
      const next = { ...d };
      delete next[ws.id];
      return next;
    });
    if (onUpdate) await onUpdate(ws.id, { progressPct: num });
  }

  function startBlock(ws: Workstream) {
    if (readOnly || !onUpdate || ws.progressPct >= 100) return;
    if (ws.status === "blocked") {
      if (!window.confirm(`Clear block on “${ws.name}”?`)) return;
      setLocalRows((rows) =>
        rows.map((row) =>
          row.id === ws.id ? { ...row, status: "in_progress", blockReason: null } : row
        )
      );
      void onUpdate(ws.id, { status: "in_progress", blockReason: null });
      return;
    }
    setBlockDraftId(ws.id);
    setBlockReasonDraft(ws.blockReason ?? "");
  }

  async function confirmBlock(ws: Workstream) {
    if (!onUpdate) return;
    const reason = blockReasonDraft.trim();
    if (!reason) {
      window.alert("A block reason is required.");
      return;
    }
    setLocalRows((rows) =>
      rows.map((row) =>
        row.id === ws.id ? { ...row, status: "blocked", blockReason: reason } : row
      )
    );
    setBlockDraftId(null);
    setBlockReasonDraft("");
    await onUpdate(ws.id, { status: "blocked", blockReason: reason });
  }

  function barTitle(ws: Workstream): string {
    if (ws.status === "blocked") {
      return `${ws.name}\nBlocked: ${ws.blockReason || "Reason not stated"}`;
    }
    return `${ws.name}\n${formatShortDate(ws.startDate)} → ${formatShortDate(ws.endDate)}`;
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (readOnly || !onAdd || !name.trim()) return;
    setBusy(true);
    try {
      await onAdd({
        name: name.trim(),
        owner,
        startDate,
        endDate,
        priority,
        milestoneId: milestoneId || selectedMilestoneId || null
      });
      setName("");
      setShowAdd(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-schedule admin-schedule-compact" aria-label="Workstream schedule">
      <div className="admin-schedule-heading">
        <h3 className="admin-section-title">Workstreams</h3>
        <div className="admin-schedule-heading-actions">
          <p className="admin-schedule-hint">
            Showing {filtered.length}/{localRows.length}
            {selectedMilestoneName ? ` · ${selectedMilestoneName}` : " · All gates"}
            {timeFilter !== "all" ? ` · ${timeFilter}` : ""}
            {doneFilter !== "all" ? ` · ${doneFilter}` : ""}
            {priorityFilter ? ` · ${priorityFilter.toUpperCase()}` : ""}
            {ownerFilter ? ` · ${ownerFilter}` : ""}
            {readOnly ? " · Read-only" : ""}
          </p>
          {headingActions}
          {!readOnly ? (
            <button type="button" className="admin-btn-primary" onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? "Close" : "+ Task"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-gantt-filters">
        <div className="admin-filter-chips">
          <button
            type="button"
            className={`admin-chip${selectedMilestoneId === null ? " active" : ""}`}
            onClick={() => onSelectMilestone(null)}
          >
            All gates
          </button>
          {project.milestones.map((ms) => (
            <button
              key={ms.id}
              type="button"
              className={`admin-chip${selectedMilestoneId === ms.id ? " active" : ""}`}
              onClick={() => onSelectMilestone(ms.id)}
            >
              {ms.name}
            </button>
          ))}
        </div>
        <div className="admin-filter-chips">
          {(
            [
              ["all", "All tasks"],
              ["week", "This week"],
              ["month", "This month"]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`admin-chip${timeFilter === id ? " active" : ""}`}
              onClick={() => onTimeFilter(id)}
            >
              {label}
            </button>
          ))}
          {(
            [
              ["all", "Open+Done"],
              ["open", "Open"],
              ["done", "Done"],
              ["delayed", "Delayed"],
              ["blocked", "Blocked"]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`admin-chip${doneFilter === id ? " active" : ""}`}
              onClick={() => onDoneFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="admin-filter-chips" role="group" aria-label="Owner filter">
          <button
            type="button"
            className={`admin-chip${ownerFilter === "" ? " active" : ""}`}
            onClick={() => onOwnerFilter("")}
          >
            All owners
          </button>
          {owners.map((person) => (
            <button
              key={person}
              type="button"
              className={`admin-chip${ownerFilter === person ? " active" : ""}`}
              onClick={() => onOwnerFilter(person)}
            >
              {person}
            </button>
          ))}
        </div>
        <div className="admin-filter-chips" role="group" aria-label="Priority filter">
          <button
            type="button"
            className={`admin-chip${priorityFilter === "" ? " active" : ""}`}
            onClick={() => onPriorityFilter("")}
          >
            All priority
          </button>
          {TASK_PRIORITIES.map((value) => (
            <button
              key={value}
              type="button"
              className={`admin-chip${priorityFilter === value ? " active" : ""}`}
              onClick={() => onPriorityFilter(value)}
            >
              {PRIORITY_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {!readOnly && showAdd ? (
        <form className="admin-add-form admin-add-form-compact" onSubmit={handleAdd}>
          <label className="admin-add-task">
            Task
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Gate
            <select value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
              <option value="">Unassigned</option>
              {project.milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.name}
                </option>
              ))}
            </select>
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
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {TASK_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-add-dates">
            <label>
              Start
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label>
              End
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
            <button type="submit" className="admin-btn-primary admin-add-submit" disabled={busy}>
              {busy ? "…" : "Add"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-schedule-scroll">
        <div
          className="admin-schedule-board"
          style={{ ["--schedule-track-width" as string]: `${trackWidth}px` }}
        >
          <div className="admin-schedule-header">
            <div className="admin-schedule-meta admin-schedule-meta-head admin-meta-slim">
              <span className="col-num">#</span>
              <span className="col-task">Task / Gate</span>
              <span className="col-owner">Owner</span>
              <span className="col-pri">Pri / %</span>
              <span className="col-actions" />
            </div>
            <div className="admin-schedule-axis" ref={trackRef}>
              {ticks.map((tick) => (
                <span key={tick} style={{ left: `${dateToRatio(tick, rangeStart, rangeEnd) * 100}%` }}>
                  {formatShortDate(tick)}
                </span>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="admin-schedule-empty">No tasks match these filters.</p>
          ) : null}

          {filtered.map((ws, index) => {
            const left = dateToRatio(ws.startDate, rangeStart, rangeEnd) * 100;
            const right = dateToRatio(ws.endDate, rangeStart, rangeEnd) * 100;
            const width = Math.max(3.2, right - left);
            const tone = barTone(ws);
            const pctValue = pctDraft[ws.id] ?? String(ws.progressPct);
            const compactBar = width < 9;

            return (
              <div key={ws.id} id={`ws-${ws.id}`} className="admin-schedule-row">
                <div className="admin-schedule-meta admin-meta-slim">
                  <span className="col-num">{index + 1}</span>
                  <span className="col-task">
                    <button
                      type="button"
                      className="admin-task-open"
                      onClick={() => openDetail(ws.id)}
                      title="Open task details"
                    >
                      <strong>{ws.name}</strong>
                    </button>
                    <small>
                      {formatShortDate(ws.startDate)} → {formatShortDate(ws.endDate)}
                    </small>
                    {readOnly ? (
                      <span className="admin-readonly-gate">
                        {project.milestones.find((m) => m.id === ws.milestoneId)?.name ?? "No gate"}
                      </span>
                    ) : (
                      <select
                        className="admin-gate-select"
                        value={ws.milestoneId ?? ""}
                        onChange={(e) => {
                          const nextMilestoneId = e.target.value || null;
                          setLocalRows((rows) =>
                            rows.map((row) =>
                              row.id === ws.id ? { ...row, milestoneId: nextMilestoneId } : row
                            )
                          );
                          void onUpdate?.(ws.id, { milestoneId: nextMilestoneId });
                        }}
                        aria-label={`${ws.name} gate`}
                      >
                        <option value="">No gate</option>
                        {project.milestones.map((ms) => (
                          <option key={ms.id} value={ms.id}>
                            {ms.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </span>
                  <span className="col-owner">
                    {readOnly ? (
                      <span className="admin-owner-pill">{ws.owner}</span>
                    ) : (
                      <OwnerPill
                        owner={ws.owner}
                        options={owners}
                        onChange={(next) => {
                          setLocalRows((rows) =>
                            rows.map((row) => (row.id === ws.id ? { ...row, owner: next } : row))
                          );
                          void onUpdate?.(ws.id, { owner: next });
                        }}
                      />
                    )}
                  </span>
                  <span className="col-pri">
                    {readOnly ? (
                      <span className="admin-readonly-pri">{PRIORITY_LABELS[ws.priority]}</span>
                    ) : (
                      <select
                        className="admin-pri-select"
                        value={ws.priority}
                        onChange={(e) => {
                          const nextPriority = e.target.value as TaskPriority;
                          setLocalRows((rows) =>
                            rows.map((row) =>
                              row.id === ws.id ? { ...row, priority: nextPriority } : row
                            )
                          );
                          void onUpdate?.(ws.id, { priority: nextPriority });
                        }}
                        aria-label={`${ws.name} priority`}
                      >
                        {TASK_PRIORITIES.map((value) => (
                          <option key={value} value={value}>
                            {PRIORITY_LABELS[value]}
                          </option>
                        ))}
                      </select>
                    )}
                    <span className="admin-pri-pct">
                      <span
                        className={`admin-due-dot tone-${tone}`}
                        title={
                          ws.status === "blocked"
                            ? `Blocked: ${ws.blockReason || "Reason not stated"}`
                            : tone === "delayed"
                              ? `Delayed · due ${formatShortDate(ws.endDate)}`
                              : `Due ${formatShortDate(ws.endDate)}`
                        }
                      />
                      {readOnly ? (
                        <span className="admin-readonly-pct">{ws.progressPct}%</span>
                      ) : (
                        <input
                          className="admin-pct-input"
                          type="number"
                          min={0}
                          max={100}
                          value={pctValue}
                          onChange={(e) =>
                            setPctDraft((d) => ({ ...d, [ws.id]: e.target.value }))
                          }
                          onBlur={() => void commitPct(ws, pctValue)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          aria-label={`${ws.name} progress`}
                        />
                      )}
                    </span>
                    {!readOnly && ws.progressPct < 100 ? (
                      <button
                        type="button"
                        className={`admin-block-btn${ws.status === "blocked" ? " is-on" : ""}`}
                        onClick={() => startBlock(ws)}
                        title={
                          ws.status === "blocked"
                            ? ws.blockReason || "Blocked"
                            : "Mark blocked (reason required)"
                        }
                      >
                        {ws.status === "blocked" ? "Blocked" : "Block"}
                      </button>
                    ) : readOnly && ws.status === "blocked" ? (
                      <span className="admin-block-btn is-on" title={ws.blockReason || "Blocked"}>
                        Blocked
                      </span>
                    ) : null}
                  </span>
                  <span className="col-actions">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => openDetail(ws.id)}
                      title="Task details"
                      aria-label={`Details for ${ws.name}`}
                    >
                      i
                    </button>
                    {!readOnly && onDelete ? (
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => {
                          if (window.confirm(`Delete “${ws.name}”?`)) void onDelete(ws.id);
                        }}
                      >
                        ×
                      </button>
                    ) : null}
                  </span>
                </div>

                {!readOnly && blockDraftId === ws.id ? (
                  <form
                    className="admin-block-reason-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void confirmBlock(ws);
                    }}
                  >
                    <input
                      autoFocus
                      value={blockReasonDraft}
                      onChange={(e) => setBlockReasonDraft(e.target.value)}
                      placeholder="Why is this blocked? (required)"
                      maxLength={200}
                      aria-label={`${ws.name} block reason`}
                    />
                    <button type="submit" className="admin-btn-primary">
                      Save
                    </button>
                    <button
                      type="button"
                      className="admin-btn-ghost"
                      onClick={() => {
                        setBlockDraftId(null);
                        setBlockReasonDraft("");
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : null}

                <div className="admin-schedule-track">
                  <div
                    className={`admin-schedule-bar tone-${tone}${dragId === ws.id ? " dragging" : ""}${readOnly ? " is-readonly is-openable" : ""}${compactBar ? " is-compact" : ""}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={readOnly ? `${barTitle(ws)}\nClick for details` : barTitle(ws)}
                    role={readOnly ? "button" : undefined}
                    tabIndex={readOnly ? 0 : undefined}
                    onKeyDown={
                      readOnly
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openDetail(ws.id);
                            }
                          }
                        : undefined
                    }
                    onPointerDown={(e) => startDrag(e, ws, "move")}
                    onClick={() => {
                      if (readOnly) openDetail(ws.id);
                    }}
                  >
                    <span
                      className="admin-schedule-handle start"
                      onPointerDown={(e) => startDrag(e, ws, "resize-start")}
                    />
                    <span className="admin-schedule-bar-label">
                      {tone === "blocked"
                        ? `Blocked · ${ws.name}`
                        : tone === "delayed"
                          ? `Delayed · ${ws.name}`
                          : ws.name}
                    </span>
                    <span
                      className="admin-schedule-handle end"
                      onPointerDown={(e) => startDrag(e, ws, "resize-end")}
                    />
                  </div>
                </div>

                {showRowComments ? (
                  <label className="admin-row-comment">
                    <span className="admin-row-comment-label">Comment</span>
                    <textarea
                      value={rowComments?.[ws.id] ?? ""}
                      onChange={(e) => onRowCommentChange?.(ws.id, e.target.value)}
                      rows={2}
                      disabled={rowCommentsReadOnly}
                      placeholder={`Note on ${ws.name}…`}
                      aria-label={`${ws.name} review comment`}
                    />
                  </label>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {detailTask ? (
        <TaskDetailDialog
          project={effectiveProject}
          task={detailTask}
          owners={owners}
          readOnly={readOnly}
          onClose={() => setDetailId(null)}
          onUpdate={onUpdate}
          onFilterGate={onSelectMilestone}
        />
      ) : null}
    </section>
  );
}
