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
  experimental: {
    // The site and /studio are separate root layouts; unmatched URLs render
    // `src/app/global-not-found.tsx` instead of a bare default document.
    globalNotFound: true,
  },
  ...(distDir ? { distDir } : {}),
};

export default nextConfig;
