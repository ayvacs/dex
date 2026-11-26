import type { NextConfig } from "next";

const isPagesExport = process.env.PAGES_EXPORT === "true";

const nextConfig: NextConfig = {
    ...(isPagesExport
        ? {
              output: "export",
              basePath: process.env.PAGES_BASE_PATH || undefined,
              images: {
                  unoptimized: true,
              },
          }
        : {
              cacheComponents: true,
              partialPrefetching: true,
          }),
    experimental: {
        agentFeedback: true,
    },
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
