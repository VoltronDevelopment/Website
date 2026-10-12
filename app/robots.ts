import { siteUrl } from "@/lib/assets";
import type { MetadataRoute } from "next";
import { isPrelaunch } from "@/lib/launch";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: isPrelaunch() ? undefined : "/",
      disallow: isPrelaunch() ? "/" : ["/api", "/admin"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
