"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatShortDate } from "@/lib/project-metrics";
import type { AttentionItem } from "@/lib/projects-types";
import { ProgressBar } from "@/components/admin/AdminPickers";

const KIND_LABELS = {
  blocked: "Blocked",
  delayed: "Delayed",
  due_soon: "Due soon"
} as const;

export function AttentionDashboard() {
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/attention");
        const data = await response.json();
        if (data.ok) setItems(data.items);
        else setError(data.message || "Could not load attention feed.");
      } catch {
        setError("Could not load attention feed.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Founder Project Control</p>
          <h1>What needs attention</h1>
          <p className="admin-lead">Blocked work, delays, and milestones due in the next week.</p>
        </div>
      </header>

      {loading ? <p className="admin-muted">Loading attention feed…</p> : null}
      {error ? (
        <p className="admin-action-error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && !items.length ? (
        <p className="admin-muted">Nothing needs attention right now.</p>
      ) : null}

      <div className="admin-attention-grid">
        {items.map((item) => {
          const hash = item.workstreamId
            ? `#ws-${item.workstreamId}`
            : item.milestoneId
              ? `#ms-${item.milestoneId}`
              : "";
          return (
          <Link
            key={item.id}
            href={`/admin/projects/${item.projectSlug}${hash}`}
            className={`admin-attention-card kind-${item.kind}`}
          >
            <span className="admin-attention-kind">{KIND_LABELS[item.kind]}</span>
            <h2>{item.label}</h2>
            <p>
              {item.projectName} · Owner: {item.owner}
            </p>
            {typeof item.progressPct === "number" ? (
              <ProgressBar value={item.progressPct} />
            ) : null}
            {item.detail ? <p className="admin-attention-detail">{item.detail}</p> : null}
            {item.dueDate ? <p className="admin-attention-due">Due {formatShortDate(item.dueDate)}</p> : null}
          </Link>
          );
        })}
      </div>
    </div>
  );
}
