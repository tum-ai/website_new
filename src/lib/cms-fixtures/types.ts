/** CMS-shaped documents used only by opt-in local development and tests. */
export type CmsFixtureDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
};
