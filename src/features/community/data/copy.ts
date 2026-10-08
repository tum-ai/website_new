import type { ContentImage } from "@/lib/cms-content-model";

/** Required published copy for the community page. */
export type CommunityCopy = {
  hero: {
    title: string;
    lead: string;
    photo: ContentImage;
    /** What, where and when the photo shows. */
    photoCaption: string;
  };
  journey: { title: string; lead: string };
  departments: { title: string; lead: string };
  /** The member stories band; the stories are `person` documents. */
  stories: { title: string; lead: string };
  closing: {
    title: string;
    /** The latest recruiting round, with its dates as placeholders. */
    lead: string;
    /** The label over the partners' pitch beside the closing. */
    companiesReader: string;
  };
};
