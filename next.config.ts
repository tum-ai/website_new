import type { NextConfig } from "next";

const distDir = process.env.NEXT_DIST_DIR;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tumai/notion-data"],
  images: {
    qualities: [40, 75],
  },
  ...(distDir ? { distDir } : {}),
};

export default nextConfig;
