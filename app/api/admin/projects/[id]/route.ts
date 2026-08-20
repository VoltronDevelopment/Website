import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { projectCompletionPct } from "@/lib/project-metrics";
import {
  addMilestone,
  addWorkstream,
  deleteMilestone,
  deleteProject,
  deleteWorkstream,
  getProject,
  saveProject,
  updateMilestone,
  updateWorkstream
} from "@/lib/projects-store";
import { deleteReviewsForProject } from "@/lib/reviews-store";
import { PROJECT_STATUSES, TASK_PRIORITIES } from "@/lib/projects-types";
import type { Milestone, Owner, Project, ProjectStatus, TaskPriority, Workstream } from "@/lib/projects-types";
import { isValidationError, validationError } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    project,
    completionPct: projectCompletionPct(project)
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
    }

    const body = await request.json();

    if (body.action === "addWorkstream") {
      const updated = await addWorkstream(id, {
        name: normalizeName(body.name),
        owner: body.owner ? normalizeOwner(body.owner) : project.owner,
        startDate: body.startDate ? normalizeDate(body.startDate) : undefined,
        endDate: body.endDate ? normalizeDate(body.endDate) : undefined,
        progressPct: body.progressPct !== undefined ? normalizePct(body.progressPct) : undefined,
        status: body.status ? normalizeStatus(body.status) : undefined,
        priority: body.priority ? normalizePriority(body.priority) : undefined,
        milestoneId:
          body.milestoneId === null || body.milestoneId === ""
            ? null
            : body.milestoneId
              ? normalizeName(body.milestoneId)
              : undefined
      });
      return NextResponse.json({ ok: true, project: updated });
    }

    if (body.action === "deleteWorkstream") {
      if (!body.workstreamId) validationError("workstreamId required.");
      const updated = await deleteWorkstream(id, body.workstreamId);
      return NextResponse.json({ ok: true, project: updated });
    }

    if (body.action === "addMilestone") {
      const updated = await addMilestone(id, {
        name: normalizeName(body.name),
        owner: body.owner ? normalizeOwner(body.owner) : project.owner,
        startDate: body.startDate ? normalizeDate(body.startDate) : undefined,
        endDate: body.endDate ? normalizeDate(body.endDate) : undefined,
        status: body.status ? normalizeStatus(body.status) : undefined
      });
      return NextResponse.json({ ok: true, project: updated });
    }

    if (body.action === "deleteMilestone") {
      if (!body.milestoneId) validationError("milestoneId required.");
      const updated = await deleteMilestone(id, body.milestoneId);
      return NextResponse.json({ ok: true, project: updated });
    }

    if (body.workstreamId) {
      const patch = validateWorkstreamPatch(body.patch ?? body);
      try {
        const updated = await updateWorkstream(id, body.workstreamId, patch);
        return NextResponse.json({ ok: true, project: updated });
      } catch (error) {
        if (error instanceof Error && error.message.includes("Block reason")) {
          return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
        }
        throw error;
      }
    }

    if (body.milestoneId) {
      const patch = validateMilestonePatch(body.patch ?? body);
      const updated = await updateMilestone(id, body.milestoneId, patch);
      return NextResponse.json({ ok: true, project: updated });
    }

    const charterPatch = validateCharterPatch(body);
    if (charterPatch.status !== undefined) {
      (charterPatch as Project).statusManual = true;
    }
    const updated = await saveProject({ ...project, ...charterPatch });
    return NextResponse.json({ ok: true, project: updated });
  } catch (error) {
    if (isValidationError(error)) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }
    console.error("[api/admin/projects/id]", error);
    return NextResponse.json({ ok: false, message: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
  }

  const ok = await deleteProject(id);
  if (!ok) {
    return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
  }

  try {
    await deleteReviewsForProject(project.id, project.slug);
  } catch (error) {
    console.error("[api/admin/projects] cascade review delete failed", error);
  }

  return NextResponse.json({ ok: true });
}

function validateWorkstreamPatch(input: unknown): Partial<Workstream> {
  if (!input || typeof input !== "object") validationError("Invalid workstream patch.");
  const body = input as Record<string, unknown>;
  const patch: Partial<Workstream> = {};

  if (body.startDate !== undefined) patch.startDate = normalizeDate(body.startDate);
  if (body.endDate !== undefined) patch.endDate = normalizeDate(body.endDate);
  if (body.progressPct !== undefined) patch.progressPct = normalizePct(body.progressPct);
  if (body.owner !== undefined) patch.owner = normalizeOwner(body.owner);
  if (body.status !== undefined) patch.status = normalizeStatus(body.status);
  if (body.priority !== undefined) patch.priority = normalizePriority(body.priority);
  if (body.name !== undefined) patch.name = normalizeName(body.name);
  if (body.milestoneId !== undefined) {
    patch.milestoneId =
      body.milestoneId === null || body.milestoneId === ""
        ? null
        : normalizeName(body.milestoneId);
  }
  if (body.blockReason !== undefined) {
    if (body.blockReason === null || body.blockReason === "") {
      patch.blockReason = null;
    } else if (typeof body.blockReason === "string") {
      const reason = body.blockReason.trim().slice(0, 200);
      if (!reason) validationError("Block reason cannot be empty.");
      patch.blockReason = reason;
    } else {
      validationError("Invalid block reason.");
    }
  }

  // Status from % is applied in the store using the existing workstream status
  // (so blocked is preserved until 100%).
  return patch;
}

function validateMilestonePatch(input: unknown): Partial<Milestone> {
  if (!input || typeof input !== "object") validationError("Invalid milestone patch.");
  const body = input as Record<string, unknown>;
  const patch: Partial<Milestone> = {};

  if (body.startDate !== undefined) patch.startDate = normalizeDate(body.startDate);
  if (body.endDate !== undefined) patch.endDate = normalizeDate(body.endDate);
  if (body.owner !== undefined) patch.owner = normalizeOwner(body.owner);
  if (body.status !== undefined) patch.status = normalizeStatus(body.status);
  if (body.name !== undefined) patch.name = normalizeName(body.name);

  return patch;
}

function validateCharterPatch(input: unknown): Partial<Project> {
  if (!input || typeof input !== "object") validationError("Invalid project patch.");
  const body = input as Record<string, unknown>;
  const patch: Partial<Project> = {};

  if (body.name !== undefined) patch.name = normalizeName(body.name);
  if (body.objective !== undefined) patch.objective = normalizeName(body.objective);
  if (body.owner !== undefined) patch.owner = normalizeOwner(body.owner);
  if (body.startDate !== undefined) patch.startDate = normalizeDate(body.startDate);
  if (body.targetDate !== undefined) patch.targetDate = normalizeDate(body.targetDate);
  if (body.status !== undefined) patch.status = normalizeStatus(body.status);
  if (body.team !== undefined) {
    if (!Array.isArray(body.team)) validationError("Invalid team.");
    patch.team = Array.from(
      new Set(body.team.map((n) => String(n).trim()).filter(Boolean))
    ) as Owner[];
  }

  return patch;
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    validationError("Invalid date.");
  }
  return value;
}

function normalizePct(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 100) validationError("Progress must be 0–100.");
  return Math.round(num);
}

function normalizeOwner(value: unknown): Owner {
  if (typeof value !== "string" || !value.trim()) validationError("Invalid owner.");
  return value.trim().slice(0, 60);
}

function normalizeStatus(value: unknown): ProjectStatus {
  if (typeof value !== "string" || !PROJECT_STATUSES.includes(value as ProjectStatus)) {
    validationError("Invalid status.");
  }
  return value as ProjectStatus;
}

function normalizePriority(value: unknown): TaskPriority {
  if (typeof value !== "string" || !TASK_PRIORITIES.includes(value as TaskPriority)) {
    validationError("Invalid priority.");
  }
  return value as TaskPriority;
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) validationError("Invalid text.");
  return value.trim().slice(0, 500);
}
