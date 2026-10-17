import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: let the dev server's JavaScript load through Cloudflare quick
  // tunnels (the subdomain changes on every restart). Without this, pages
  // opened via the tunnel render but nothing interactive works.
  allowedDevOrigins: ["*.trycloudflare.com"],
  cacheComponents: true,
  partialPrefetching: true,
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
