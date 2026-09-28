/**
 * Cell sizes shared by the "In the room" spread and its loading skeleton, so
 * swapping one for the other causes no layout shift. Kept dependency-free so
 * the skeleton doesn't pull the deferred chunk into the main bundle.
 */

/** The spread: stacked on phones, a 12-column editorial grid from md. */
export const ROOM_GRID = "grid gap-x-5 gap-y-10 md:grid-cols-12 md:gap-y-12";

/**
 * Placement and photo frame per cell, in `roomPhotos` order: a wide lead
 * photo beside a tall one, a full-width panorama, then a narrow and a wide
 * photo. Cells in one row share the row's height from md up.
 */
export const ROOM_CELLS = [
  {
    id: "lead",
    cell: "md:col-span-8",
    frame: "aspect-[4/3] md:aspect-[16/10]",
  },
  { id: "tall", cell: "md:col-span-4", frame: "aspect-[4/3] md:aspect-auto" },
  {
    id: "panorama",
    cell: "md:col-span-12",
    frame: "aspect-[16/9] md:aspect-[1920/668]",
  },
  { id: "narrow", cell: "md:col-span-5", frame: "aspect-[4/3] md:aspect-auto" },
  { id: "wide", cell: "md:col-span-7", frame: "aspect-[4/3]" },
] as const;
