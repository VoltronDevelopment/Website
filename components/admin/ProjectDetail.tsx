"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Milestone, Owner, Project } from "@/lib/projects-types";
import type { TaskViewFilter, TimeFilter } from "@/lib/project-metrics";
import type { ProjectReview, ReviewScope } from "@/lib/reviews-types";
import { GanttChart } from "@/components/admin/GanttChart";
import { MilestoneRail } from "@/components/admin/MilestoneRail";
import { ProjectCharter } from "@/components/admin/ProjectCharter";
import { ProjectInsights } from "@/components/admin/ProjectInsights";
import { ReviewPanel } from "@/components/admin/ReviewPanel";
import { ReviewsSection } from "@/components/admin/ReviewsSection";

export function ProjectDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [doneFilter, setDoneFilter] = useState<TaskViewFilter>("all");
  const [reviews, setReviews] = useState<ProjectReview[]>([]);
  const [activeReview, setActiveReview] = useState<ProjectReview | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/projects/${slug}`);
      const data = await response.json();
      if (data.ok) setProject(data.project);
      else setActionError(data.message || "Could not load project.");
    } catch {
      setActionError("Could not load project.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadReviews = useCallback(async () => {
    const response = await fetch(`/api/admin/projects/${slug}/reviews`);
    const data = await response.json();
    if (data.ok) setReviews(data.reviews);
  }, [slug]);

  useEffect(() => {
    void load();
    void loadReviews();
  }, [load, loadReviews]);

  const patchProject = useCallback(
    async (patch: Partial<Project>) => {
      setActionError(null);
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      const data = await response.json();
      if (data.ok) setProject(data.project);
      else setActionError(data.message || "Could not save project.");
    },
    [slug]
  );

  const patchMilestone = useCallback(
    async (milestoneId: string, patch: Partial<Milestone>) => {
      setActionError(null);
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, patch })
      });
      const data = await response.json();
      if (data.ok) setProject(data.project);
      else setActionError(data.message || "Could not update milestone.");
    },
    [slug]
  );

  const addMilestone = useCallback(
    async (input: { name: string; owner: Owner; startDate: string; endDate: string }) => {
      setActionError(null);
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addMilestone", ...input })
      });
      const data = await response.json();
      if (data.ok) setProject(data.project);
      else setActionError(data.message || "Could not add milestone.");
    },
    [slug]
  );

  const deleteMilestone = useCallback(
    async (milestoneId: string) => {
      setActionError(null);
      const response = await fetch(`/api/admin/projects/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMilestone", milestoneId })
      });
      const data = await response.json();
      if (data.ok) {
        setProject(data.project);
        if (selectedMilestoneId === milestoneId) setSelectedMilestoneId(null);
      } else {
        setActionError(data.message || "Could not delete milestone.");
      }
    },
    [selectedMilestoneId, slug]
  );

  async function handleDeleteProject() {
    if (!project) return;
    if (!window.confirm(`Delete project “${project.name}”? This cannot be undone.`)) return;
    setActionError(null);
    const response = await fetch(`/api/admin/projects/${slug}`, { method: "DELETE" });
    const data = await response.json();
    if (data.ok) router.push("/admin/projects");
    else setActionError(data.message || "Could not delete project.");
  }

  async function startReview() {
    if (!project) return;
    setReviewBusy(true);
    setActionError(null);
    try {
      const scope: ReviewScope = {
        milestoneId: selectedMilestoneId,
        timeFilter,
        ownerFilter,
        priorityFilter,
        doneFilter
      };
      const response = await fetch(`/api/admin/projects/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope })
      });
      const data = await response.json();
      if (data.ok) {
        setActiveReview(data.review);
        setReviews((current) => [data.review, ...current.filter((r) => r.id !== data.review.id)]);
      } else {
        setActionError(data.message || "Could not start review.");
      }
    } catch {
      setActionError("Could not start review.");
    } finally {
      setReviewBusy(false);
    }
  }

  async function deleteReview(reviewId: string) {
    setActionError(null);
    const response = await fetch(`/api/admin/projects/${slug}/reviews/${reviewId}`, {
      method: "DELETE"
    });
    const data = await response.json();
    if (data.ok) {
      setReviews((current) => current.filter((r) => r.id !== reviewId));
      if (activeReview?.id === reviewId) setActiveReview(null);
    } else {
      setActionError(data.message || "Could not delete review.");
    }
  }

  if (loading) return <p className="admin-muted">Loading project…</p>;
  if (!project) return <p className="admin-muted">Project not found.</p>;

  return (
    <div className="admin-page admin-page-dense">
      <div className="admin-page-toolbar">
        <Link href="/admin/projects" className="admin-back-link">
          ← All projects
        </Link>
        <button type="button" className="admin-btn-danger" onClick={() => void handleDeleteProject()}>
          Delete project
        </button>
      </div>

      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Project</p>
          <h1>{project.name}</h1>
        </div>
      </header>

      {actionError ? (
        <p className="admin-action-error" role="alert">
          {actionError}
          <button type="button" className="admin-btn-ghost" onClick={() => setActionError(null)}>
            Dismiss
          </button>
        </p>
      ) : null}

      <ProjectCharter project={project} onSave={patchProject} />

      <MilestoneRail
        project={project}
        selectedId={selectedMilestoneId}
        onSelect={setSelectedMilestoneId}
        onUpdate={patchMilestone}
        onAdd={addMilestone}
        onDelete={deleteMilestone}
      />

      <GanttChart
        project={project}
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
        readOnly
        headingActions={
          <button
            type="button"
            className="admin-btn-primary"
            disabled={reviewBusy}
            onClick={() => void startReview()}
          >
            {reviewBusy ? "Starting…" : "Start review"}
          </button>
        }
      />

      <ProjectInsights
        project={project}
        milestoneId={selectedMilestoneId}
        timeFilter={timeFilter}
        ownerFilter={ownerFilter}
        priorityFilter={priorityFilter}
        doneFilter={doneFilter}
      />

      <ReviewsSection
        project={project}
        reviews={reviews}
        onOpen={setActiveReview}
        onDelete={(id) => void deleteReview(id)}
      />

      {activeReview ? (
        <ReviewPanel
          project={project}
          review={activeReview}
          onClose={() => setActiveReview(null)}
          onSaved={(next) => {
            setActiveReview(next);
            setReviews((current) => current.map((r) => (r.id === next.id ? next : r)));
          }}
          onApplied={(next) => {
            setActiveReview(next);
            setReviews((current) => current.map((r) => (r.id === next.id ? next : r)));
            void load();
          }}
        />
      ) : null}
    </div>
  );
}
