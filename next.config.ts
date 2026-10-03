import type { NextConfig } from "next";
import { sanityProjectId } from "./src/lib/sanity-config";

const distDir = process.env.NEXT_DIST_DIR;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    // Inlines USE_MOCK_CMS into server code at BUILD time, so `pnpm build`
    // without USE_MOCK_CMS=1 folds the mock-CMS branch in lib/sanity.ts away
    // and ships no fixture chunk. Consequence: the flag is read when building,
    // not at `next start`; set it for the build (as CI's E2E job does).
    // Pass the raw value: Next JSON-encodes define values itself, so
    // wrapping it in JSON.stringify would inline the string `"1"` with quotes
    // and the gate would never match.
    defineServer: {
      "process.env.USE_MOCK_CMS": process.env.USE_MOCK_CMS ?? "",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    qualities: [40, 75],
    // Editorial images are served from Sanity's CDN. Brand and synthetic
    // fixture files stay under local /assets/. Only this project's assets
    // (every dataset): the optimizer never fetches another project's files
    // on the site's behalf.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: `/images/${sanityProjectId}/**`,
      },
    ],
  },
  experimental: {
    // The site and /studio are separate root layouts; unmatched URLs render
    // `src/app/global-not-found.tsx` instead of a bare default document.
    globalNotFound: true,
  },
  ...(distDir ? { distDir } : {}),
};

export default nextConfig;
