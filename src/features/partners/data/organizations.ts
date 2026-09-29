import type {
  LogoArtwork,
  LogoLists,
  Organization,
} from "@/lib/people-and-logos";

/**
 * Every company and initiative the site shows a logo for, one entry each,
 * and the partner sections' logo lists: the code source of the CMS
 * `organization` and `logoList` documents (`organization-content.ts`). The
 * logo surfaces of other pages (E-Lab ventures and testimonials, events
 * co-hosts) pick their organisations from here by key, so a company that
 * appears on several pages has one entry. The REX institutions are the
 * exception: /research keeps them (`features/research/data/rex.ts`).
 *
 * Sizes are each file's intrinsic size, as Sanity reports it; SVG sizes are
 * the `viewBox`, rounded. `aspectRatio` records the drawn artwork's ratio
 * where a page sizes logos by it and it differs from the file.
 */

type ArtworkInput = Omit<LogoArtwork, "alt"> & { alt?: string };

type OrganizationInput = Omit<Organization, "logo" | "logoOnDark"> & {
  logo?: ArtworkInput;
  logoOnDark?: ArtworkInput;
};

/** An organisation; artwork without its own alt text is "<name> logo". */
function defineOrganization({
  logo,
  logoOnDark,
  ...organization
}: OrganizationInput): Organization {
  const artwork = (input: ArtworkInput): LogoArtwork => ({
    ...input,
    alt: input.alt ?? `${organization.name} logo`,
  });
  return {
    ...organization,
    ...(logo ? { logo: artwork(logo) } : {}),
    ...(logoOnDark ? { logoOnDark: artwork(logoOnDark) } : {}),
  };
}

export const organizations: readonly Organization[] = [
  // Partners (the directory's launch defaults, `partner-logos.ts`)
  defineOrganization({
    key: "openai",
    name: "OpenAI",
    href: "https://openai.com/",
    logo: {
      src: "/assets/partners/logos/openai-wordmark.webp",
      width: 440,
      height: 121,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/openai.svg",
      width: 928,
      height: 308,
    },
  }),
  defineOrganization({
    key: "google",
    name: "Google",
    href: "https://about.google/",
    logo: { src: "/assets/partners/logos/google.webp", width: 270, height: 82 },
    logoOnDark: {
      src: "/assets/partners/marquee/google.png",
      width: 544,
      height: 184,
    },
  }),
  defineOrganization({
    key: "anthropic",
    name: "Anthropic",
    href: "https://www.anthropic.com/",
    logo: {
      src: "/assets/partners/logos/anthropic.webp",
      width: 500,
      height: 56,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/anthropic.svg",
      width: 570,
      height: 64,
      aspectRatio: 8.906,
    },
  }),
  defineOrganization({
    key: "hudson-river-trading",
    name: "Hudson River Trading",
    href: "https://www.hudsonrivertrading.com/",
    logo: { src: "/assets/partners/logos/hrt.webp", width: 193, height: 150 },
    logoOnDark: {
      src: "/assets/partners/logos/hrt.webp",
      width: 193,
      height: 150,
    },
  }),
  defineOrganization({
    key: "jetbrains",
    name: "JetBrains",
    href: "https://www.jetbrains.com/",
    logo: {
      src: "/assets/partners/logos/jetbrains.svg",
      width: 298,
      height: 64,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/jetbrains.svg",
      width: 298,
      height: 64,
    },
  }),
  defineOrganization({
    key: "unite",
    name: "Unite",
    href: "https://unite.eu/",
    logo: { src: "/assets/partners/logos/unite.webp", width: 500, height: 122 },
    logoOnDark: {
      src: "/assets/partners/logos/unite.webp",
      width: 500,
      height: 122,
    },
  }),
  defineOrganization({
    key: "spherecast",
    name: "Spherecast",
    href: "https://www.spherecast.ai/",
    logo: {
      src: "/assets/e-lab/startups/Spherecast.webp",
      width: 244,
      height: 55,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/spherecast.svg",
      width: 1588,
      height: 262,
    },
  }),
  defineOrganization({
    key: "dryft",
    name: "Dryft",
    href: "https://dryft.ai/",
    logo: { src: "/assets/partners/logos/dryft.webp", width: 498, height: 128 },
    logoOnDark: {
      src: "/assets/partners/marquee/dryft.png",
      width: 512,
      height: 512,
      symbolOnly: true,
    },
  }),
  defineOrganization({
    key: "reply",
    name: "Reply",
    href: "https://www.reply.com/",
    logo: { src: "/assets/partners/logos/reply.webp", width: 500, height: 133 },
    logoOnDark: {
      src: "/assets/partners/marquee/reply.svg",
      width: 113,
      height: 56,
    },
  }),
  defineOrganization({
    key: "mutagent",
    name: "Mutagent",
    href: "https://mutagent.io/",
    logo: {
      src: "/assets/partners/logos/mutagent.svg",
      width: 672,
      height: 672,
      symbolOnly: true,
    },
    logoOnDark: {
      src: "/assets/partners/logos/mutagent.svg",
      width: 672,
      height: 672,
      symbolOnly: true,
    },
  }),
  defineOrganization({
    key: "nvidia",
    name: "NVIDIA",
    href: "https://www.nvidia.com/",
    logo: {
      src: "/assets/partners/logos/nvidia.webp",
      width: 204,
      height: 150,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/nvidia.webp",
      width: 400,
      height: 311,
      aspectRatio: 1.286,
    },
  }),
  defineOrganization({
    key: "entire-io",
    name: "Entire.io",
    href: "https://entire.io/",
    logo: {
      src: "/assets/partners/logos/entire-lockup.webp",
      width: 960,
      height: 237,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/entire-lockup.webp",
      width: 960,
      height: 237,
    },
  }),
  defineOrganization({
    key: "mckinsey-company",
    name: "McKinsey & Company",
    href: "https://www.mckinsey.com/",
    logo: {
      src: "/assets/partners/logos/mckinsey.svg",
      width: 160,
      height: 50,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/mckinsey.svg",
      width: 160,
      height: 50,
    },
  }),
  defineOrganization({
    key: "jane-street",
    name: "Jane Street",
    href: "https://www.janestreet.com/",
    logo: {
      src: "/assets/partners/logos/jane-street.svg",
      width: 181,
      height: 49,
    },
    logoOnDark: {
      src: "/assets/partners/marquee/jane-street.svg",
      width: 181,
      height: 49,
    },
  }),
  defineOrganization({
    key: "bmw",
    name: "BMW",
    href: "https://www.bmw.com/",
    logo: { src: "/assets/partners/logos/bmw.svg", width: 2500, height: 2500 },
    logoOnDark: {
      src: "/assets/partners/logos/bmw.svg",
      width: 2500,
      height: 2500,
      aspectRatio: 1,
    },
  }),
  defineOrganization({
    key: "aws",
    name: "AWS",
    href: "https://aws.amazon.com/",
    logo: { src: "/assets/partners/logos/aws.svg", width: 160, height: 80 },
    logoOnDark: {
      src: "/assets/partners/marquee/aws.webp",
      width: 398,
      height: 238,
      aspectRatio: 1.672,
    },
  }),
  defineOrganization({
    key: "amd",
    name: "AMD",
    href: "https://www.amd.com/",
    logo: { src: "/assets/partners/logos/amd.webp", width: 600, height: 144 },
    logoOnDark: {
      src: "/assets/partners/marquee/amd.svg",
      width: 140,
      height: 33,
    },
  }),
  defineOrganization({
    key: "ibm",
    name: "IBM",
    href: "https://www.ibm.com/",
    logo: { src: "/assets/partners/logos/ibm.png", width: 500, height: 200 },
    logoOnDark: {
      src: "/assets/partners/logos/ibm.png",
      width: 500,
      height: 200,
    },
  }),

  // Where alumni go (beyond the partners above)
  defineOrganization({
    key: "cohere",
    name: "Cohere",
    logo: { src: "/assets/partners/logos/cohere.svg", width: 118, height: 20 },
  }),
  defineOrganization({
    key: "databricks",
    name: "Databricks",
    logo: {
      src: "/assets/partners/logos/databricks.svg",
      width: 713,
      height: 113,
    },
  }),
  defineOrganization({
    key: "meta",
    name: "Meta",
    logo: { src: "/assets/partners/logos/meta.svg", width: 50, height: 11 },
  }),
  defineOrganization({
    key: "y-combinator",
    name: "Y Combinator",
    logo: {
      src: "/assets/e-lab/partners/y-combinator.webp",
      width: 128,
      height: 64,
    },
  }),

  // Partner case studies (`partners.ts`)
  defineOrganization({ key: "quantco", name: "QuantCo" }),
  defineOrganization({
    key: "osapiens",
    name: "Osapiens",
    logo: {
      src: "/assets/partners/logos/osapiens.svg",
      width: 143,
      height: 60,
    },
  }),

  // E-Lab ventures (features/e-lab/data/venture-page.ts)
  defineOrganization({
    key: "tenmin",
    name: "Tenmin",
    href: "https://tenmin.ai/",
    logo: { src: "/assets/e-lab/startups/Tenmin.svg", width: 105, height: 31 },
  }),
  defineOrganization({
    key: "explaino",
    name: "Explaino",
    href: "https://explaino.ai/",
    logo: {
      src: "/assets/e-lab/startups/LogoExplaino.svg",
      width: 1329,
      height: 314,
    },
  }),
  defineOrganization({
    key: "get-ikigai",
    name: "Get Ikigai",
    href: "https://www.get-ikigai.com/",
    logo: {
      src: "/assets/e-lab/startups/get-ilkigai.svg",
      width: 135,
      height: 25,
    },
  }),
  defineOrganization({
    key: "tau-robotics",
    name: "Tau Robotics",
    href: "https://www.tau-robotics.com/",
    logo: {
      src: "/assets/e-lab/startups/TauRobotics.svg",
      width: 40,
      height: 40,
      symbolOnly: true,
    },
  }),
  defineOrganization({
    key: "helmit",
    name: "Helmit",
    href: "https://www.helmit.org/",
    logo: {
      src: "/assets/e-lab/startups/helmit.svg",
      width: 8394,
      height: 3372,
    },
  }),
  defineOrganization({
    key: "invertix",
    name: "Invertix",
    href: "https://www.invertix.ai/",
    logo: {
      src: "/assets/e-lab/startups/invertix.webp",
      width: 160,
      height: 80,
      symbolOnly: true,
    },
  }),

  // E-Lab testimonials: who the quoted people speak for
  defineOrganization({
    key: "cdtm",
    name: "CDTM",
    logo: { src: "/assets/e-lab/partners/cdtm.webp", width: 128, height: 64 },
    logoOnDark: {
      src: "/assets/events/hosts/cdtm.svg",
      width: 85,
      height: 64,
      aspectRatio: 1.32,
    },
  }),
  defineOrganization({
    key: "ewor",
    name: "EWOR",
    logo: { src: "/assets/e-lab/partners/ewor.webp", width: 128, height: 64 },
  }),
  defineOrganization({
    key: "uvc-partners",
    name: "UVC Partners",
    logo: {
      src: "/assets/e-lab/partners/uvc-partners.webp",
      width: 128,
      height: 64,
    },
  }),
  defineOrganization({
    key: "google-cloud",
    name: "Google Cloud",
    logo: {
      src: "/assets/e-lab/partners/google.svg",
      width: 118,
      height: 120,
      alt: "Google logo",
      symbolOnly: true,
    },
    logoOnDark: {
      src: "/assets/events/hosts/google-cloud.svg",
      width: 123,
      height: 20,
      aspectRatio: 6.137,
    },
  }),
  defineOrganization({
    key: "accel",
    name: "Accel",
    logo: { src: "/assets/e-lab/partners/accel.svg", width: 1288, height: 413 },
  }),

  // Events co-hosts (features/events/data/host-logos.ts; sources in
  // public/assets/events/hosts/SOURCES.md)
  defineOrganization({
    key: "beyond-presence",
    name: "Beyond Presence",
    logoOnDark: {
      src: "/assets/events/hosts/beyond-presence.svg",
      width: 226,
      height: 21,
      aspectRatio: 10.752,
    },
  }),
  defineOrganization({
    key: "bkw",
    name: "BKW",
    logoOnDark: {
      src: "/assets/events/hosts/bkw.svg",
      width: 1130,
      height: 271,
      aspectRatio: 4.162,
    },
  }),
  defineOrganization({
    key: "hugging-face",
    name: "Hugging Face",
    logoOnDark: {
      src: "/assets/events/hosts/hugging-face.svg",
      width: 866,
      height: 192,
      aspectRatio: 4.516,
    },
  }),
  defineOrganization({
    key: "lovable",
    name: "Lovable",
    logoOnDark: {
      src: "/assets/events/hosts/lovable.svg",
      width: 950,
      height: 173,
      aspectRatio: 5.495,
    },
  }),
  defineOrganization({
    key: "manage-and-more",
    name: "Manage & More",
    logoOnDark: {
      src: "/assets/events/hosts/manage-and-more.svg",
      width: 484,
      height: 113,
      aspectRatio: 4.299,
    },
  }),
  defineOrganization({
    key: "mercura",
    name: "Mercura",
    logoOnDark: {
      src: "/assets/events/hosts/mercura-icon.webp",
      width: 160,
      height: 160,
      symbolOnly: true,
    },
  }),
  defineOrganization({
    key: "n8n",
    name: "n8n",
    logoOnDark: {
      src: "/assets/events/hosts/n8n.svg",
      width: 295,
      height: 80,
      aspectRatio: 3.684,
    },
  }),
  defineOrganization({
    key: "project-a",
    name: "Project A",
    logoOnDark: {
      src: "/assets/events/hosts/project-a.svg",
      width: 180,
      height: 45,
      aspectRatio: 4.017,
    },
  }),
  defineOrganization({
    key: "red-bull",
    name: "Red Bull",
    logoOnDark: {
      src: "/assets/events/hosts/red-bull.svg",
      width: 224,
      height: 36,
      aspectRatio: 224.189 / 36,
    },
  }),
  defineOrganization({
    key: "tacto",
    name: "Tacto",
    logoOnDark: {
      src: "/assets/events/hosts/tacto.svg",
      width: 124,
      height: 40,
      aspectRatio: 3.08,
    },
  }),
  defineOrganization({
    key: "yellow",
    name: "Yellow",
    logoOnDark: {
      src: "/assets/events/hosts/yellow.svg",
      width: 311,
      height: 91,
      aspectRatio: 3.435,
    },
  }),
];

const byKey = new Map(organizations.map((entry) => [entry.key, entry]));

/**
 * The organisation with `key`. Throws on an unknown key: code lists name
 * organisations by key, and a typo must fail the tests.
 */
export function organizationByKey(key: string): Organization {
  const organization = byKey.get(key);
  if (!organization) throw new Error(`Unknown organisation key "${key}"`);
  return organization;
}

/** The partner sections' logo lists, in page order. */
export const partnerLogoLists: LogoLists<
  "alumni-destinations" | "partner-marquee"
> = {
  /** "Where they go afterwards" on /partners. */
  "alumni-destinations": [
    "openai",
    "google",
    "nvidia",
    "aws",
    "cohere",
    "mckinsey-company",
    "anthropic",
    "databricks",
    "meta",
    "y-combinator",
    "jetbrains",
  ].map(organizationByKey),
  /**
   * Partners whose dark artwork is verified on the dark hero; the marquee
   * shows every highlighted partner and sets the name for those not here.
   */
  "partner-marquee": [
    "nvidia",
    "entire-io",
    "mckinsey-company",
    "jane-street",
    "bmw",
    "aws",
    "amd",
    "ibm",
    "openai",
    "anthropic",
    "spherecast",
    "dryft",
    "google",
    "hudson-river-trading",
    "jetbrains",
    "unite",
    "reply",
    "mutagent",
  ].map(organizationByKey),
};
