import type { Organization } from "@/lib/people-and-logos";

/**
 * Where the institutions on /research are, for the hero globe. One site per
 * city: labs a few kilometres apart would draw one marker anyway. Each site
 * lists the organisations there that the research projects, the research
 * partners and the REX institutions name. The CMS model of the
 * `labSite` documents (`../content.ts`).
 */

/** An organisation at a lab site: what the globe matches institutions by. */
export type LabSiteOrganization = Pick<
  Organization,
  "key" | "name" | "shortName"
>;

/** A city on the globe and the organisations TUM.ai works with there. */
export type LabSite = {
  /** Stable id; the globe's CSS anchor is `--cobe-<id>`. */
  id: string;
  /** Visible label. */
  city: string;
  /** Latitude and longitude in degrees. */
  location: [number, number];
  /** TUM.ai's own city, where every arc starts. */
  home?: boolean;
  /** The organisations here, in the Studio's order. */
  organizations: LabSiteOrganization[];
};
