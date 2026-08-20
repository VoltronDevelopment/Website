import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { createProject, listProjects } from "@/lib/projects-store";
import { dashboardStats, filterProjects, projectCompletionPct, nextMilestoneName } from "@/lib/project-metrics";
import type { ProjectStatus } from "@/lib/projects-types";
import { isValidationError, validationError } from "@/lib/errors";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner")?.trim() || undefined;
  const status = searchParams.get("status") as ProjectStatus | null;
  const showCompleted = searchParams.get("showCompleted") === "true";

  const projects = await listProjects();
  const filtered = filterProjects(projects, {
    owner,
    status: status ?? undefined,
    showCompleted
  });

  const cards = filtered.map((project) => ({
    ...project,
    completionPct: projectCompletionPct(project),
    nextMilestone: nextMilestoneName(project)
  }));

  return NextResponse.json({
    ok: true,
    stats: dashboardStats(filtered),
    projects: cards
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body?.name || typeof body.name !== "string") validationError("Name is required.");
    if (!body?.owner || typeof body.owner !== "string") validationError("Owner is required.");
    if (!body?.startDate || !body?.targetDate) validationError("Start and target dates are required.");

    const project = await createProject({
      name: body.name,
      objective: body.objective,
      owner: body.owner.trim(),
      startDate: body.startDate,
      targetDate: body.targetDate,
      team: Array.isArray(body.team) ? body.team.map(String) : undefined,
      template: body.template === "alpha" ? "alpha" : "blank"
    });

    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    if (isValidationError(error)) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }
    console.error("[api/admin/projects POST]", error);
    return NextResponse.json({ ok: false, message: "Create failed." }, { status: 500 });
  }
}
