/**
 * What the browser needs to fetch an image exactly as an `<img>` would: the
 * same `srcSet` and `sizes` make it pick the same candidate, so a page that
 * loads it ahead leaves the real image a cache hit. From next/image's
 * `getImageProps`.
 */
export type ImagePreload = { src: string; srcSet?: string; sizes?: string };
