/**
 * Box sizes shared by the deferred home sections and their loading
 * skeletons, so swapping one for the other causes no layout shift. Kept in a
 * dependency-free module so the skeletons don't pull the deferred chunks
 * into the main bundle.
 */

/** One photo in the community rail (ScrollSection). */
export const PHOTO_RAIL_ITEM =
  "aspect-[16/10] w-[17rem] sm:w-[24rem] lg:w-[30rem]";

/**
 * The four-destination grid (ExploreBento): stacked on phones, two columns
 * on tablets and small laptops, a bento from xl up (where the short tiles are
 * tall enough for their copy).
 */
export const EXPLORE_GRID =
  "grid gap-4 md:grid-cols-2 xl:grid-cols-12 xl:grid-rows-[repeat(2,clamp(18rem,24vw,22rem))_clamp(21rem,28vw,26rem)] xl:gap-5";

/**
 * Grid placement and card height per destination, in render order: a tall
 * feature tile, two stacked tiles beside it and a full-width banner.
 */
export const EXPLORE_CELLS = [
  "aspect-[4/5] sm:aspect-[4/3] md:col-span-2 md:aspect-[16/10] lg:aspect-[16/8] xl:col-span-7 xl:row-span-2 xl:aspect-auto",
  "aspect-[4/5] sm:aspect-[4/3] md:aspect-[4/5] lg:aspect-[4/3] xl:col-span-5 xl:aspect-auto",
  "aspect-[4/5] sm:aspect-[4/3] md:aspect-[4/5] lg:aspect-[4/3] xl:col-span-5 xl:aspect-auto",
  "aspect-[4/5] sm:aspect-[4/3] md:col-span-2 md:aspect-[16/9] lg:aspect-[16/7] xl:col-span-12 xl:aspect-auto",
] as const;
