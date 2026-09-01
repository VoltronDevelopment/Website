export const PROJECT_STATUSES = ["not_started", "in_progress", "blocked", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const TASK_PRIORITIES = ["p0", "p1", "p2", "p3"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
  p3: "P3"
};

/** Suggested founder pool — projects can also add custom owner names. */
export const OWNER_POOL = ["Omkar", "Akshay", "Hanumant"] as const;
export type Owner = string;

export type Workstream = {
  id: string;
  name: string;
  owner: Owner;
  startDate: string;
  endDate: string;
  progressPct: number;
  status: ProjectStatus;
  priority: TaskPriority;
  /** Optional link to a project milestone gate */
  milestoneId?: string | null;
  /** Required when status is blocked; shown on Gantt hover */
  blockReason?: string | null;
};

export type Milestone = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  owner: Owner;
  status: ProjectStatus;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  objective: string;
  owner: Owner;
  team: Owner[];
  startDate: string;
  targetDate: string;
  status: ProjectStatus;
  /** When true, charter status is not overwritten by task rollups */
  statusManual?: boolean;
  workstreams: Workstream[];
  milestones: Milestone[];
};

export type AttentionItem = {
  id: string;
  projectId: string;
  projectSlug: string;
  projectName: string;
  label: string;
  kind: "blocked" | "delayed" | "due_soon";
  owner: Owner;
  progressPct?: number;
  dueDate?: string;
  workstreamId?: string;
  milestoneId?: string;
  detail?: string;
};

export type ProjectFilters = {
  owner?: Owner;
  status?: ProjectStatus;
  showCompleted?: boolean;
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  completed: "Completed"
};

export type CreateProjectInput = {
  name: string;
  objective?: string;
  owner: Owner;
  startDate: string;
  targetDate: string;
  team?: Owner[];
  template?: "blank" | "alpha";
};
