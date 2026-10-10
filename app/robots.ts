import { siteUrl } from "@/lib/assets";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/inquiries"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
