import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { buildAttentionItems } from "@/lib/project-metrics";
import { listProjects } from "@/lib/projects-store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const projects = await listProjects();
  return NextResponse.json({
    ok: true,
    items: buildAttentionItems(projects)
  });
}
