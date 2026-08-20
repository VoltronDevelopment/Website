import type { TaskViewFilter, TimeFilter } from "@/lib/project-metrics";
import type { Workstream } from "@/lib/projects-types";

export const REVIEW_STATUSES = ["draft", "saved", "applied"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewScope = {
  milestoneId: string | null;
  timeFilter: TimeFilter;
  ownerFilter: string;
  priorityFilter: string;
  doneFilter: TaskViewFilter;
};

export type ProjectReview = {
  id: string;
  projectId: string;
  projectSlug: string;
  title: string;
  author: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  appliedAt?: string;
  scope: ReviewScope;
  overallComment: string;
  /** workstreamId -> comment */
  taskComments: Record<string, string>;
  /** Full workstream snapshot at review start */
  baseline: Workstream[];
  /** Working copy / proposed end state */
  proposed: Workstream[];
};

export type CreateReviewInput = {
  projectId: string;
  projectSlug: string;
  title?: string;
  author: string;
  scope: ReviewScope;
  baseline: Workstream[];
};

export type ReviewTaskDiff = {
  workstreamId: string;
  name: string;
  changes: string[];
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: "Draft",
  saved: "Saved",
  applied: "Applied"
};
