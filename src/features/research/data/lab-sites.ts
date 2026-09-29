/**
 * Where the institutions on /research are, for the hero globe. One site per
 * city: labs a few kilometres apart would draw one marker anyway. The
 * `institutions` lists hold every name the CMS, the partners and the REX
 * copy use for a lab in that city.
 */

/** A city on the globe and the institutions TUM.ai works with there. */
export type LabSite = {
  /** Stable id; the globe's CSS anchor is `--cobe-<id>`. */
  id: string;
  /** Visible label. */
  city: string;
  /** Latitude and longitude in degrees. */
  location: [number, number];
  /** TUM.ai's own city, where every arc starts. */
  home?: boolean;
  /** Names that place an institution here (case-insensitive). */
  institutions: string[];
};

export const labSites: LabSite[] = [
  {
    id: "munich",
    city: "Munich",
    // TUM main campus.
    location: [48.1497, 11.5679],
    home: true,
    institutions: [
      "TUM",
      "TUM CAMP",
      "Helmholtz",
      "Helmholtz Zentrum",
      "Helmholtz Munich",
      "LMU",
      "LMU Klinikum",
      "Klinikum rechts der Isar",
      // TODO(content): confirm MI4People is based in Munich.
      "MI4People",
    ],
  },
  {
    id: "boston",
    city: "Boston",
    // MIT; Harvard is 3 km away.
    location: [42.3601, -71.0942],
    institutions: [
      "MIT",
      "Harvard",
      "Harvard University",
      "Harvard Medical School",
    ],
  },
  {
    id: "cambridge",
    city: "Cambridge",
    location: [52.2043, 0.1149],
    institutions: ["University of Cambridge", "Cambridge"],
  },
  {
    id: "san-jose",
    city: "San Jose",
    // IBM Research Almaden.
    location: [37.2106, -121.8077],
    institutions: ["IBM Almaden"],
  },
  {
    id: "zurich",
    city: "Zurich",
    // TODO(content): confirm the IBM Research lab is Zurich (Rüschlikon).
    location: [47.3163, 8.5528],
    institutions: ["IBM Research"],
  },
  {
    id: "paris",
    city: "Paris",
    // TODO(content): which Inria centre hosts REX offers? Paris for now.
    location: [48.8566, 2.3522],
    institutions: ["Inria", "INRIA"],
  },
];
