import type { ContentImage } from "@/lib/cms-content-model";

/** Named work a task force does with a partner, listed under its chapter. */
interface TaskForceWork {
  /** The name of the organisation the work is done with. */
  partner: string;
  /** One line per project, in the task force's own words. */
  items: string[];
}

/**
 * A task force on /projects: a small team of TUM.ai members that takes AI
 * into one other field. The page draws each one as the overlap of an AI
 * circle and its field's circle, in the order of this list. The code
 * model of the published `taskForce` documents (`../content.ts`).
 */
export type TaskForce = {
  /** Anchor of the task force's chapter (`/projects#med-ai`). */
  slug: string;
  name: string;
  /** The field the task force brings AI into: the label of its circle. */
  field: string;
  /** One sentence: what the task force does. */
  description: string;
  /** The longer paragraph under it. */
  detailedDescription: string;
  work?: TaskForceWork;
  /** A photo of the task force's own people or work. */
  photo?: ContentImage;
  /** A factual caption for the photo: what, where, when. */
  photoCaption?: string;
};

/**
 * The anchor of the open circle, the page's close (`/projects#your-field`).
 * Its labels are copy (`openSeat` in `copy.ts`).
 */
export const openSeatSlug = "your-field";
