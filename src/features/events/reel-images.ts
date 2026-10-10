import { getImageProps } from "next/image";
import type { ImagePreload } from "@/lib/image-preload";
import type { HostArtwork } from "./data/host-logos";

/** The `sizes` of a co-host logo in the hero reel (a `fill` image). */
export const REEL_LOGO_SIZES = "20rem";

/** The intrinsic size of a co-host app icon in the hero reel, in px. */
export const REEL_ICON_PX = 160;

/**
 * The reel's images as the hero renders them (same `sizes` and widths, so
 * the same optimizer URLs): a page that loads these ahead leaves the hero
 * nothing to wait for.
 */
export function reelImagePreloads(artwork: HostArtwork): ImagePreload[] {
  const preload = (props: ReturnType<typeof getImageProps>["props"]) => ({
    src: props.src,
    srcSet: props.srcSet,
    sizes: props.sizes,
  });
  return [
    ...Object.values(artwork.logos).map(({ src }) =>
      preload(
        getImageProps({ src, alt: "", fill: true, sizes: REEL_LOGO_SIZES })
          .props,
      ),
    ),
    ...Object.values(artwork.icons).map((src) =>
      preload(
        getImageProps({
          src,
          alt: "",
          width: REEL_ICON_PX,
          height: REEL_ICON_PX,
        }).props,
      ),
    ),
  ];
}
