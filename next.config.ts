import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() { return [{source:"/optimized/:path*",headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]}]; },
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600]
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
