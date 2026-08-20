"use client";

import { formatScopeLabel } from "@/lib/review-diff";
import type { Project } from "@/lib/projects-types";
import type { ProjectReview } from "@/lib/reviews-types";
import { REVIEW_STATUS_LABELS } from "@/lib/reviews-types";

type ReviewsSectionProps = {
  project: Project;
  reviews: ProjectReview[];
  onOpen: (review: ProjectReview) => void;
  onDelete: (reviewId: string) => void;
};

export function ReviewsSection({ project, reviews, onOpen, onDelete }: ReviewsSectionProps) {
  return (
    <section className="admin-reviews" aria-label="Saved reviews">
      <div className="admin-schedule-heading">
        <h3 className="admin-section-title">Reviews</h3>
        <p className="admin-schedule-hint">
          Filter the live Gantt, then start a review. Saved reviews keep comments and proposed edits.
        </p>
      </div>

      {!reviews.length ? (
        <p className="admin-muted">No reviews yet.</p>
      ) : (
        <ul className="admin-reviews-list">
          {reviews.map((review) => {
            const milestoneName =
              project.milestones.find((m) => m.id === review.scope.milestoneId)?.name ?? null;
            return (
              <li key={review.id} className="admin-review-card">
                <button type="button" className="admin-review-card-main" onClick={() => onOpen(review)}>
                  <span className={`admin-review-status status-${review.status}`}>
                    {REVIEW_STATUS_LABELS[review.status]}
                  </span>
                  <strong>{review.title}</strong>
                  <span className="admin-muted">
                    {formatScopeLabel(review.scope, milestoneName)} · {review.author} ·{" "}
                    {new Date(review.updatedAt).toLocaleString("en-IN")}
                  </span>
                  {review.overallComment ? (
                    <span className="admin-review-card-note">{review.overallComment}</span>
                  ) : null}
                </button>
                {review.status !== "applied" ? (
                  <button
                    type="button"
                    className="admin-text-danger"
                    onClick={() => {
                      if (window.confirm(`Delete review “${review.title}”?`)) onDelete(review.id);
                    }}
                  >
                    Delete
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
