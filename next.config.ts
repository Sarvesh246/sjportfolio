import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // getThumbnails() lists this folder at runtime (ISR), so make sure it ships inside the server bundle.
  outputFileTracingIncludes: { "/*": ["./public/thumbnails/**/*"] },
  turbopack: {
    // A stray package-lock.json higher up (C:\Projects) otherwise confuses root detection.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
