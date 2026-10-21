/** The old join site's domain: every page there goes to /apply. */
export const JOIN_HOST = "join.tum-ai.com";

/**
 * The paths on {@link JOIN_HOST} that stay where they are: /apply itself and
 * what it loads (framework files under /_next/, public /assets/ and root
 * files with a static-file extension).
 */
const JOIN_HOST_KEPT =
  "apply$|_next/|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$";

/**
 * `next.config.ts` redirects: on {@link JOIN_HOST} every other path goes to
 * /apply with a 308, its query kept. A config redirect instead of a proxy
 * (middleware), so no code runs before every request on the main domain.
 */
export const joinHostRedirects = [
  {
    source: `/:path((?!${JOIN_HOST_KEPT}).*)`,
    has: [{ type: "host" as const, value: JOIN_HOST }],
    destination: "/apply",
    permanent: true,
  },
];
