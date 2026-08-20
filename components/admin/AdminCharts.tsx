"use client";

import {
  TASK_MIX_COLORS,
  TASK_MIX_LABELS,
  TASK_MIX_ORDER,
  type TaskMixCategory
} from "@/lib/project-metrics";

type RingSize = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<RingSize, { box: number; stroke: number; font: string }> = {
  xs: { box: 28, stroke: 2.5, font: "0.52rem" },
  sm: { box: 36, stroke: 3, font: "0.58rem" },
  md: { box: 56, stroke: 4, font: "0.78rem" },
  lg: { box: 68, stroke: 5, font: "0.9rem" }
};

export function ProgressRing({
  value,
  size = "md",
  label,
  tone = "default",
  className = ""
}: {
  value: number;
  size?: RingSize;
  label?: string;
  tone?: "default" | "blocked" | "completed" | "delayed";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const { box, stroke, font } = SIZE_MAP[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const strokeColor =
    tone === "blocked"
      ? TASK_MIX_COLORS.blocked
      : tone === "completed"
        ? TASK_MIX_COLORS.completed
        : tone === "delayed"
          ? TASK_MIX_COLORS.delayed
          : TASK_MIX_COLORS.in_progress;

  return (
    <div className={`admin-ring ${className}`.trim()} style={{ width: box, height: box }}>
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle
          className="admin-ring-track"
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="admin-ring-value"
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
        />
      </svg>
      <div className="admin-ring-center">
        <strong style={{ fontSize: font }}>{pct}%</strong>
        {label ? <span>{label}</span> : null}
      </div>
    </div>
  );
}

export function StatusDonut({
  counts,
  className = "",
  size = "sm",
  centerValue,
  centerLabel = "tasks"
}: {
  counts: Record<TaskMixCategory, number>;
  className?: string;
  size?: "sm" | "md" | "lg";
  centerValue?: string | number;
  centerLabel?: string;
}) {
  const order = TASK_MIX_ORDER;
  const entries = order
    .map((status) => ({ status, count: counts[status] ?? 0 }))
    .filter((e) => e.count > 0);
  const rawTotal = order.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  const box = size === "lg" ? 148 : size === "md" ? 96 : 72;
  const stroke = size === "lg" ? 16 : size === "md" ? 10 : 8;
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let cursor = 0;
  const arcs =
    rawTotal > 0
      ? entries.map((entry) => {
          const length = (entry.count / rawTotal) * circumference;
          const dashoffset = -cursor;
          cursor += length;
          return { ...entry, length, dashoffset };
        })
      : [];

  return (
    <div className={`admin-donut admin-donut-${size} ${className}`.trim()}>
      <div className="admin-donut-visual" style={{ width: box, height: box }}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
          <circle
            className="admin-ring-track"
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          {arcs.map((arc) => (
            <circle
              key={arc.status}
              cx={box / 2}
              cy={box / 2}
              r={radius}
              fill="none"
              stroke={TASK_MIX_COLORS[arc.status]}
              strokeWidth={stroke}
              strokeDasharray={`${arc.length} ${Math.max(0, circumference - arc.length)}`}
              strokeDashoffset={arc.dashoffset}
              transform={`rotate(-90 ${box / 2} ${box / 2})`}
            />
          ))}
        </svg>
        <div className="admin-donut-center">
          <strong>{centerValue ?? rawTotal}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className="admin-donut-legend">
        {order.map((status) => (
          <li key={status}>
            <i style={{ background: TASK_MIX_COLORS[status] }} />
            <span>{TASK_MIX_LABELS[status]}</span>
            <strong>{counts[status] ?? 0}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
