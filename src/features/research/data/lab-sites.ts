import { organizationByKey } from "@/features/partners";
import type { Organization } from "@/lib/people-and-logos";
import { rexOwnOrganizations } from "./rex";

/**
 * Where the institutions on /research are, for the hero globe. One site per
 * city: labs a few kilometres apart would draw one marker anyway. Each site
 * lists the organisations there that the research projects, the research
 * partners and the REX institutions name. The code fallback of the
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

const rexOwnByKey = new Map(
  rexOwnOrganizations.map((organization) => [organization.key, organization]),
);

/** The organisation with `key`, from the partners' table or the REX list. */
function siteOrganization(key: string): LabSiteOrganization {
  const { name, shortName } = rexOwnByKey.get(key) ?? organizationByKey(key);
  return { key, name, ...(shortName ? { shortName } : {}) };
}

/** A lab site as code writes it: its organisations by key. */
type LabSiteTemplate = Omit<LabSite, "organizations"> & {
  organizations: string[];
};

/** The lab sites, their organisations by key (the backfill references them). */
export const labSiteTemplates: readonly LabSiteTemplate[] = [
  {
    id: "munich",
    city: "Munich",
    // TUM main campus.
    location: [48.1497, 11.5679],
    home: true,
    organizations: [
      "tum",
      "tum-camp",
      "helmholtz",
      "helmholtz-munich",
      "lmu",
      "lmu-klinikum",
      "klinikum-rechts-der-isar",
      // TODO(content): confirm MI4People is based in Munich.
      "mi4people",
    ],
  },
  {
    id: "boston",
    city: "Boston",
    // MIT; Harvard is 3 km away.
    location: [42.3601, -71.0942],
    organizations: ["mit", "harvard-university", "harvard-medical-school"],
  },
  {
    id: "cambridge",
    city: "Cambridge",
    location: [52.2043, 0.1149],
    organizations: ["university-of-cambridge"],
  },
  {
    id: "san-jose",
    city: "San Jose",
    // IBM Research Almaden.
    location: [37.2106, -121.8077],
    organizations: ["ibm-almaden"],
  },
  {
    id: "zurich",
    city: "Zurich",
    // TODO(content): confirm the IBM Research lab is Zurich (Rüschlikon).
    location: [47.3163, 8.5528],
    organizations: ["ibm-research"],
  },
  {
    id: "paris",
    city: "Paris",
    // TODO(content): which Inria centre hosts REX offers? Paris for now.
    location: [48.8566, 2.3522],
    organizations: ["inria"],
  },
];

export const labSites: LabSite[] = labSiteTemplates.map(
  ({ organizations, ...site }) => ({
    ...site,
    organizations: organizations.map(siteOrganization),
  }),
);
