import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { SEED_PROJECTS, buildAlphaPlan } from "@/lib/projects-seed";
import { syncProjectRollups } from "@/lib/project-metrics";
import type { CreateProjectInput, Milestone, Owner, Project, TaskPriority, Workstream } from "@/lib/projects-types";
import { OWNER_POOL } from "@/lib/projects-types";
import { statusFromProgress } from "@/lib/project-metrics";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "projects.json");
const awsRegion = process.env.VOLTRON_AWS_REGION || process.env.AWS_REGION || "ap-south-1";
const projectsTableName = process.env.PROJECTS_TABLE_NAME;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeWorkstream(raw: Workstream & { priority?: TaskPriority }): Workstream {
  const progressPct = Math.max(0, Math.min(100, Math.round(raw.progressPct ?? 0)));
  const priority = (raw.priority ?? "p2") as TaskPriority;
  const status = statusFromProgress(progressPct, raw.status);
  const reason =
    typeof raw.blockReason === "string" && raw.blockReason.trim()
      ? raw.blockReason.trim().slice(0, 200)
      : null;
  return {
    ...raw,
    progressPct,
    priority,
    status,
    milestoneId: raw.milestoneId ?? null,
    blockReason: status === "blocked" ? reason || "Reason not stated" : null
  };
}

function normalizeMilestone(raw: Milestone & { date?: string }): Milestone {
  const endDate = raw.endDate || raw.date || raw.startDate;
  const startDate = raw.startDate || raw.date || endDate;
  if (!startDate || !endDate) {
    throw new Error(`Milestone ${raw.id} is missing dates.`);
  }
  return {
    id: raw.id,
    name: raw.name,
    owner: raw.owner,
    status: raw.status,
    startDate: startDate <= endDate ? startDate : endDate,
    endDate: startDate <= endDate ? endDate : startDate
  };
}

function normalizeTeam(project: Project): Owner[] {
  const fromRows = [
    project.owner,
    ...project.workstreams.map((w) => w.owner),
    ...project.milestones.map((m) => m.owner)
  ];
  const team = [...(project.team ?? []), ...fromRows]
    .map((n) => n.trim())
    .filter(Boolean);
  return Array.from(new Set(team));
}

export function normalizeProject(raw: Project): Project {
  const milestones = (raw.milestones ?? []).map((ms) =>
    normalizeMilestone(ms as Milestone & { date?: string })
  );
  const workstreams = (raw.workstreams ?? []).map((ws) => normalizeWorkstream(ws));
  const withTeam: Project = {
    ...raw,
    milestones,
    workstreams,
    team: [],
    statusManual: raw.statusManual ?? false
  };
  withTeam.team = normalizeTeam(withTeam);
  return syncProjectRollups(withTeam);
}

export async function listProjects(): Promise<Project[]> {
  if (projectsTableName) {
    return listProjectsFromDynamo();
  }
  return listProjectsLocally();
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await listProjects();
  return projects.find((p) => p.id === id || p.slug === id) ?? null;
}

export async function saveProject(project: Project): Promise<Project> {
  const normalized = normalizeProject(project);
  if (projectsTableName) {
    await saveProjectToDynamo(normalized);
    return normalized;
  }
  const projects = await listProjectsLocally();
  const index = projects.findIndex((p) => p.id === normalized.id);
  const next =
    index >= 0
      ? projects.map((p, i) => (i === index ? normalized : p))
      : [...projects, normalized];
  await writeProjectsLocally(next);
  return normalized;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const projects = await listProjects();
  let slug = slugify(input.name) || "project";
  const base = slug;
  let n = 2;
  while (projects.some((p) => p.slug === slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }

  const owner = input.owner.trim() || OWNER_POOL[0];
  const team = Array.from(new Set([owner, ...(input.team ?? OWNER_POOL.map(String))]));

  let workstreams: Workstream[] = [];
  let milestones: Milestone[] = [];
  let objective =
    (input.objective ?? "").trim() ||
    (input.template === "alpha"
      ? "Deliver Voltron Alpha v1 in 90 days: incorporate, secure site, acquire and install the plant, bring SCADA/ERP/Voltron online, and reach operational readiness with controlled trials."
      : "Define the project objective.");

  if (input.template === "alpha") {
    const plan = buildAlphaPlan(input.startDate);
    workstreams = plan.workstreams;
    milestones = plan.milestones;
  }

  const project: Project = {
    id: newId("proj"),
    slug,
    name: input.name.trim(),
    objective,
    owner,
    team,
    startDate: input.startDate,
    targetDate: input.targetDate,
    status: "not_started",
    statusManual: false,
    workstreams,
    milestones
  };

  return saveProject(project);
}

export async function deleteProject(id: string): Promise<boolean> {
  const project = await getProject(id);
  if (!project) return false;

  if (projectsTableName) {
    const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: awsRegion }));
    await client.send(
      new DeleteCommand({
        TableName: projectsTableName,
        Key: { id: project.id }
      })
    );
    return true;
  }

  const projects = await listProjectsLocally();
  await writeProjectsLocally(projects.filter((p) => p.id !== project.id));
  return true;
}

export async function updateWorkstream(
  projectId: string,
  workstreamId: string,
  patch: Partial<Workstream>
): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const workstreams = project.workstreams.map((ws) => {
    if (ws.id !== workstreamId) return ws;
    const next = { ...ws, ...patch };
    if (patch.progressPct !== undefined) {
      next.status = statusFromProgress(next.progressPct, next.status);
    }
    if (next.status === "blocked") {
      const reason = (next.blockReason ?? "").trim();
      if (!reason) {
        // Explicitly setting blocked requires a reason; other patches keep existing text.
        if (patch.status === "blocked" || patch.blockReason !== undefined) {
          throw new Error("Block reason is required when a task is blocked.");
        }
        next.blockReason = (ws.blockReason || "Reason not stated").slice(0, 200);
      } else {
        next.blockReason = reason.slice(0, 200);
      }
    } else {
      next.blockReason = null;
    }
    return next;
  });

  return saveProject({ ...project, workstreams });
}

export async function addWorkstream(
  projectId: string,
  input: Partial<Workstream> & { name: string }
): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const owner = (input.owner || project.owner).trim();
  const workstream: Workstream = {
    id: newId("ws"),
    name: input.name.trim(),
    owner,
    startDate: input.startDate || project.startDate,
    endDate: input.endDate || project.targetDate,
    progressPct: input.progressPct ?? 0,
    status: input.status ?? "not_started",
    priority: input.priority ?? "p2",
    milestoneId: input.milestoneId ?? null,
    blockReason: null
  };

  return saveProject({
    ...project,
    team: Array.from(new Set([...project.team, owner])),
    workstreams: [...project.workstreams, workstream]
  });
}

export async function deleteWorkstream(
  projectId: string,
  workstreamId: string
): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;
  return saveProject({
    ...project,
    workstreams: project.workstreams.filter((ws) => ws.id !== workstreamId)
  });
}

export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  patch: Partial<Milestone>
): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const milestones = project.milestones.map((ms) =>
    ms.id === milestoneId ? { ...ms, ...patch } : ms
  );

  return saveProject({ ...project, milestones });
}

export async function addMilestone(
  projectId: string,
  input: Partial<Milestone> & { name: string }
): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const owner = (input.owner || project.owner).trim();
  const endDate = input.endDate || project.targetDate;
  const startDate = input.startDate || endDate;

  const milestone: Milestone = {
    id: newId("ms"),
    name: input.name.trim(),
    owner,
    startDate: startDate <= endDate ? startDate : endDate,
    endDate: startDate <= endDate ? endDate : startDate,
    status: input.status ?? "not_started"
  };

  return saveProject({
    ...project,
    team: Array.from(new Set([...project.team, owner])),
    milestones: [...project.milestones, milestone]
  });
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string
): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;
  return saveProject({
    ...project,
    milestones: project.milestones.filter((ms) => ms.id !== milestoneId),
    workstreams: project.workstreams.map((ws) =>
      ws.milestoneId === milestoneId ? { ...ws, milestoneId: null } : ws
    )
  });
}

async function listProjectsLocally(): Promise<Project[]> {
  await mkdir(dataDirectory, { recursive: true });
  try {
    const content = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((p) => normalizeProject(p as Project));
    }
  } catch {
    /* seed on first run */
  }
  const seeded = SEED_PROJECTS.map((p) => normalizeProject(p));
  await writeProjectsLocally(seeded);
  return seeded;
}

async function writeProjectsLocally(projects: Project[]) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(projects, null, 2));
}

async function listProjectsFromDynamo(): Promise<Project[]> {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: awsRegion }));
  const result = await client.send(new ScanCommand({ TableName: projectsTableName }));
  const items = (result.Items ?? []) as Project[];
  if (!items.length) {
    for (const project of SEED_PROJECTS) {
      await saveProjectToDynamo(normalizeProject(project));
    }
    return SEED_PROJECTS.map((p) => normalizeProject(p));
  }
  return items.map((p) => normalizeProject(p));
}

async function saveProjectToDynamo(project: Project) {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: awsRegion }));
  await client.send(
    new PutCommand({
      TableName: projectsTableName,
      Item: project
    })
  );
}
