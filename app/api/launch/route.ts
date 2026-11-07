import {launchAt} from "@/lib/launch";

export const dynamic = "force-dynamic";
export function GET() {
  return Response.json({now: Date.now(), launchAt}, {headers: {"Cache-Control": "private, no-store"}});
}
