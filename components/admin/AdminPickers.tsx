"use client";

import { STATUS_LABELS, type Owner, type ProjectStatus } from "@/lib/projects-types";

type PickerProps<T extends string> = {
  value: T;
  options: readonly T[];
  labels?: Record<T, string>;
  onChange: (value: T) => void;
  className?: string;
};

export function InlinePicker<T extends string>({
  value,
  options,
  labels,
  onChange,
  className = ""
}: PickerProps<T>) {
  return (
    <div className={`admin-picker ${className}`.trim()} role="listbox">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="option"
          aria-selected={value === option}
          className={`admin-picker-option${value === option ? " active" : ""}`}
          onClick={() => onChange(option)}
        >
          {labels?.[option] ?? option}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`admin-status admin-status-${status}`}>{STATUS_LABELS[status]}</span>;
}

export function OwnerPill({
  owner,
  options,
  onChange
}: {
  owner: Owner;
  options?: readonly string[];
  onChange?: (owner: Owner) => void;
}) {
  if (!onChange) {
    return <span className="admin-owner-pill">{owner}</span>;
  }

  const list = options?.length ? options : [owner];

  return (
    <details className="admin-owner-details">
      <summary className="admin-owner-pill">{owner}</summary>
      <InlinePicker
        value={owner}
        options={list as readonly string[]}
        onChange={onChange}
        className="admin-picker-pop"
      />
    </details>
  );
}

export function ProgressBar({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  if (!onChange) {
    return (
      <div className="admin-progress">
        <span className="admin-progress-fill" style={{ width: `${value}%` }} />
        <span className="admin-progress-label">{value}%</span>
      </div>
    );
  }

  return (
    <label className="admin-progress admin-progress-editable">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="admin-progress-input"
      />
      <span className="admin-progress-fill" style={{ width: `${value}%` }} />
      <span className="admin-progress-label">{value}%</span>
    </label>
  );
}
