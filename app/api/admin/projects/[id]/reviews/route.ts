import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { workstreamsForReviewScope } from "@/lib/project-metrics";
import { getProject } from "@/lib/projects-store";
import { createReview, listReviews } from "@/lib/reviews-store";
import type { ReviewScope } from "@/lib/reviews-types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const { id } = await context.params;
  const reviews = await listReviews(id);
  return NextResponse.json({ ok: true, reviews });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ ok: false, message: "Project not found." }, { status: 404 });
  }

  let body: {
    title?: string;
    scope?: ReviewScope;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  if (!body.scope) {
    return NextResponse.json({ ok: false, message: "Review scope required." }, { status: 400 });
  }

  const scoped = workstreamsForReviewScope(project, body.scope);

  const review = await createReview({
    projectId: project.id,
    projectSlug: project.slug,
    title: body.title,
    author: user,
    scope: body.scope,
    baseline: scoped
  });

  return NextResponse.json({ ok: true, review });
}
