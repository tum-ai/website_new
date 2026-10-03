/**
 * Whether an image must bypass Next's optimizer. Sanity image CDN URLs match
 * this site's remote patterns and stay optimized; other HTTP(S) hosts do not.
 * Local assets keep Next's default handling, including its SVG passthrough.
 */
export function isUnoptimizedRemoteImage(src: string): boolean {
  return (
    /^https?:\/\//.test(src) && !src.startsWith("https://cdn.sanity.io/images/")
  );
}
