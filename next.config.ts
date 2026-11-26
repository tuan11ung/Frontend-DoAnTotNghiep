import type { NextConfig } from "next";
import path from "node:path";
import { configuredBackendOrigin } from "./src/shared/lib/backend-origin";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS?.split(",").map(origin => origin.trim()).filter(Boolean),
  async rewrites() {
    const backend = configuredBackendOrigin();
    return { beforeFiles: [{ source: '/api/notifications/ws', destination: `${backend}/api/v1/ws` }] };
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: [{ loader: "@tailwindcss/turbopack", options: { base: path.join(process.cwd(), "src") } }],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
