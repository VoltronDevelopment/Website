import { siteUrl } from "@/lib/assets";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
