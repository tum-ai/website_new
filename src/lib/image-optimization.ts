/** One breakpoint of a frame: its CSS width and its aspect (width / height). */
export type CoverFrame = {
  /** Media condition; omit on the last (default) entry. */
  media?: string;
  /** Frame width in `unit`. */
  width: number;
  unit: "rem" | "vw";
  /** Frame aspect ratio, width / height. */
  aspect: number;
};

/**
 * `sizes` for a photo drawn with `object-cover`: a photo wider than its frame
 * fills the frame's height and so draws wider than the frame, by the ratio of
 * the two aspects. Naming only the frame width makes the browser fetch a file
 * too small for what it draws, and the photo turns soft.
 */
export function coverSizes(
  photo: { width: number; height: number },
  frames: CoverFrame[],
): string {
  const aspect = photo.width / photo.height;
  return frames
    .map(({ media, width, unit, aspect: frame }) => {
      const size = `${Math.ceil(width * Math.max(1, aspect / frame))}${unit}`;
      return media ? `${media} ${size}` : size;
    })
    .join(", ");
}

/**
 * A ui-kit `Photo aspect="panorama"` across a page `Container` (80rem at
 * most): 4:3 on phones, 2:1 from `sm`, 24:7 from `lg`.
 */
export const PANORAMA_PHOTO_FRAMES: CoverFrame[] = [
  { media: "(min-width: 80rem)", width: 80, unit: "rem", aspect: 24 / 7 },
  { media: "(min-width: 64rem)", width: 100, unit: "vw", aspect: 24 / 7 },
  { media: "(min-width: 40rem)", width: 100, unit: "vw", aspect: 2 },
  { width: 100, unit: "vw", aspect: 4 / 3 },
];

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
