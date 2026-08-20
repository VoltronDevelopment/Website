import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import {
  applyReview,
  deleteReview,
  getReview,
  updateReview
} from "@/lib/reviews-store";
import type { ProjectReview } from "@/lib/reviews-types";
import type { Workstream } from "@/lib/projects-types";

type RouteContext = { params: Promise<{ id: string; reviewId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const { id, reviewId } = await context.params;
  const review = await getReview(id, reviewId);
  if (!review) {
    return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, review });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id, reviewId } = await context.params;
  let body: {
    action?: "apply";
    title?: string;
    overallComment?: string;
    taskComments?: Record<string, string>;
    proposed?: Workstream[];
    status?: "draft" | "saved";
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  try {
    if (body.action === "apply") {
      const result = await applyReview(id, reviewId);
      if (!result) {
        return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
      }
      return NextResponse.json({ ok: true, review: result.review, applied: true });
    }

    const patch: Partial<
      Pick<ProjectReview, "title" | "overallComment" | "taskComments" | "proposed" | "status">
    > = {};
    if (body.title !== undefined) patch.title = String(body.title).trim().slice(0, 120);
    if (body.overallComment !== undefined) {
      patch.overallComment = String(body.overallComment).trim().slice(0, 4000);
    }
    if (body.taskComments !== undefined) patch.taskComments = body.taskComments;
    if (body.proposed !== undefined) patch.proposed = body.proposed;
    if (body.status === "draft" || body.status === "saved") patch.status = body.status;

    const review = await updateReview(id, reviewId, patch);
    if (!review) {
      return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  const { id, reviewId } = await context.params;
  const ok = await deleteReview(id, reviewId);
  if (!ok) {
    return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
