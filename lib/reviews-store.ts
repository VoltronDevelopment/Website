import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { mergeProposedWorkstreams } from "@/lib/project-metrics";
import { getProject, saveProject } from "@/lib/projects-store";
import type { Workstream } from "@/lib/projects-types";
import type { CreateReviewInput, ProjectReview, ReviewStatus } from "@/lib/reviews-types";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "reviews.json");
const awsRegion = process.env.VOLTRON_AWS_REGION || process.env.AWS_REGION || "ap-south-1";
const reviewsTableName = process.env.REVIEWS_TABLE_NAME;

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function cloneStreams(streams: Workstream[]): Workstream[] {
  return streams.map((ws) => ({ ...ws }));
}

function docClient() {
  return DynamoDBDocumentClient.from(new DynamoDBClient({ region: awsRegion }));
}

async function readAllLocal(): Promise<ProjectReview[]> {
  await mkdir(dataDirectory, { recursive: true });
  try {
    const content = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as ProjectReview[]) : [];
  } catch {
    return [];
  }
}

async function writeAllLocal(reviews: ProjectReview[]): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(reviews, null, 2));
}

async function listAllReviews(): Promise<ProjectReview[]> {
  if (reviewsTableName) {
    const result = await docClient().send(new ScanCommand({ TableName: reviewsTableName }));
    return (result.Items ?? []) as ProjectReview[];
  }
  return readAllLocal();
}

async function putReview(review: ProjectReview): Promise<void> {
  if (reviewsTableName) {
    await docClient().send(
      new PutCommand({
        TableName: reviewsTableName,
        Item: review
      })
    );
    return;
  }
  const all = await readAllLocal();
  const index = all.findIndex((r) => r.id === review.id);
  if (index >= 0) {
    all[index] = review;
  } else {
    all.push(review);
  }
  await writeAllLocal(all);
}

async function removeReviewById(reviewId: string): Promise<boolean> {
  if (reviewsTableName) {
    const existing = (await listAllReviews()).find((r) => r.id === reviewId);
    if (!existing) return false;
    await docClient().send(
      new DeleteCommand({
        TableName: reviewsTableName,
        Key: { id: reviewId }
      })
    );
    return true;
  }
  const all = await readAllLocal();
  const next = all.filter((r) => r.id !== reviewId);
  if (next.length === all.length) return false;
  await writeAllLocal(next);
  return true;
}

function matchesProject(review: ProjectReview, projectId: string, projectSlug: string): boolean {
  return review.projectId === projectId || review.projectSlug === projectSlug;
}

export async function listReviews(projectIdOrSlug: string): Promise<ProjectReview[]> {
  const project = await getProject(projectIdOrSlug);
  if (!project) return [];
  const all = await listAllReviews();
  return all
    .filter((r) => matchesProject(r, project.id, project.slug))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getReview(
  projectIdOrSlug: string,
  reviewId: string
): Promise<ProjectReview | null> {
  const reviews = await listReviews(projectIdOrSlug);
  return reviews.find((r) => r.id === reviewId) ?? null;
}

export async function createReview(input: CreateReviewInput): Promise<ProjectReview> {
  const now = new Date().toISOString();
  const baseline = cloneStreams(input.baseline);
  const review: ProjectReview = {
    id: newId("rev"),
    projectId: input.projectId,
    projectSlug: input.projectSlug,
    title: (input.title || `Review ${new Date().toLocaleString("en-IN")}`).trim(),
    author: input.author.trim() || "Admin",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    scope: input.scope,
    overallComment: "",
    taskComments: {},
    baseline,
    proposed: cloneStreams(baseline)
  };
  await putReview(review);
  return review;
}

export async function updateReview(
  projectIdOrSlug: string,
  reviewId: string,
  patch: Partial<
    Pick<
      ProjectReview,
      "title" | "overallComment" | "taskComments" | "proposed" | "status" | "scope"
    >
  >
): Promise<ProjectReview | null> {
  const project = await getProject(projectIdOrSlug);
  if (!project) return null;
  const current = await getReview(project.id, reviewId);
  if (!current) return null;

  if (current.status === "applied" && patch.proposed) {
    throw new Error("Applied reviews cannot change proposed workstreams.");
  }

  if (patch.proposed) {
    const ids = new Set<string>();
    for (const ws of patch.proposed) {
      if (ids.has(ws.id)) {
        throw new Error("Proposed workstreams contain duplicate task ids.");
      }
      ids.add(ws.id);
    }
  }

  const next: ProjectReview = {
    ...current,
    ...patch,
    proposed: patch.proposed ? cloneStreams(patch.proposed) : current.proposed,
    taskComments: patch.taskComments ? { ...patch.taskComments } : current.taskComments,
    updatedAt: new Date().toISOString()
  };

  if (patch.status && patch.status !== "applied") {
    next.status = patch.status;
  }

  await putReview(next);
  return next;
}

export async function applyReview(
  projectIdOrSlug: string,
  reviewId: string
): Promise<{ review: ProjectReview; projectId: string } | null> {
  const project = await getProject(projectIdOrSlug);
  if (!project) return null;
  const review = await getReview(project.id, reviewId);
  if (!review) return null;

  if (review.status === "applied") {
    throw new Error("This review was already applied.");
  }

  await saveProject({
    ...project,
    workstreams: mergeProposedWorkstreams(project.workstreams, review.proposed)
  });

  const now = new Date().toISOString();
  const applied: ProjectReview = {
    ...review,
    status: "applied" as ReviewStatus,
    appliedAt: now,
    updatedAt: now,
    proposed: cloneStreams(review.proposed)
  };
  await putReview(applied);
  return { review: applied, projectId: project.id };
}

export async function deleteReview(
  projectIdOrSlug: string,
  reviewId: string
): Promise<boolean> {
  const project = await getProject(projectIdOrSlug);
  if (!project) return false;
  const review = await getReview(project.id, reviewId);
  if (!review) return false;
  return removeReviewById(review.id);
}

/** Cascade helper when a project is deleted. */
export async function deleteReviewsForProject(
  projectId: string,
  projectSlug: string
): Promise<number> {
  const all = await listAllReviews();
  const doomed = all.filter((r) => matchesProject(r, projectId, projectSlug));
  for (const review of doomed) {
    await removeReviewById(review.id);
  }
  return doomed.length;
}
