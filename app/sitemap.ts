import { siteUrl } from "@/lib/assets";
import type { MetadataRoute } from "next";
import { isPrelaunch } from "@/lib/launch";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isPrelaunch()) return [];
  return ["", "/technology", "/intelligence", "/manufacturing", "/network", "/about", "/about/voltron-commons", "/partner"].map(route => ({ url: `${siteUrl}${route}`, changeFrequency: "monthly", priority: route ? 0.7 : 1 }));
}
