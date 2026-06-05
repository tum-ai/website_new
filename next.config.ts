import type { NextConfig } from "next";

const distDir = process.env.NEXT_DIST_DIR;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    qualities: [40, 75],
  },
  ...(distDir ? { distDir } : {}),
};

export default nextConfig;
