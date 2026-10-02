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
 * co-hosts, the REX institutions) pick their organisations from here by
 * key, so a company that appears on several pages has one entry. The REX
 * institutions that are not partners are the exception: /research keeps
 * them (`features/research/data/rex.ts`).
 *
 * Every TUM.ai partner is an organisation with a `partnership` (its tier,
 * and the old site's category where it had one): the code source of the
 * partner directory ({@link partnerOrganizations}).
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
  // Highlighted partners: gold, silver and bronze (in `partnerLaunchOrder`)
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
    partnership: { tier: "gold", category: "Technical Partners" },
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
    partnership: { tier: "gold", category: "Technical Partners" },
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
    partnership: { tier: "gold", category: "Technical Partners" },
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
    partnership: { tier: "gold", category: "Industry Partners" },
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
    partnership: { tier: "gold" },
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
    partnership: { tier: "gold", category: "Industry Partners" },
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
    partnership: { tier: "silver" },
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
    partnership: { tier: "silver" },
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
    partnership: { tier: "silver" },
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
    partnership: { tier: "bronze" },
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
    partnership: { tier: "gold", category: "Technical Partners" },
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
    partnership: { tier: "gold" },
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
    partnership: { tier: "silver" },
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
    partnership: { tier: "silver", category: "Industry Partners" },
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
    partnership: { tier: "silver", category: "Industry Partners" },
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
    partnership: { tier: "silver", category: "Technical Partners" },
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
    partnership: { tier: "bronze" },
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
    partnership: { tier: "bronze", category: "Research Partners" },
  }),

  // Supporters: the old site's other partners (its `partner` documents in
  // `production`, 2026-09-29; logo sources in docs/asset-sources/partners.md).
  // The research institutions are in /research's REX list too.
  defineOrganization({
    key: "mit",
    name: "MIT",
    shortName: "MIT",
    href: "https://www.mit.edu/",
    logo: {
      src: "/assets/research/rex/mit.svg",
      width: 449,
      height: 252,
      alt: "MIT logo",
      aspectRatio: 1473.281 / 829.367,
    },
    partnership: { tier: "supporter", category: "Research Partners" },
  }),
  defineOrganization({
    key: "10x-founders",
    name: "10x Founders",
    href: "https://www.10xfounders.com/",
    logo: {
      src: "/assets/partners/logos/10x-founders.webp",
      width: 500,
      height: 112,
    },
    partnership: { tier: "supporter", category: "Venture Capital" },
  }),
  defineOrganization({
    key: "aleph-alpha",
    name: "Aleph Alpha",
    href: "https://www.aleph-alpha.com/",
    logo: {
      src: "/assets/partners/logos/aleph-alpha.webp",
      width: 303,
      height: 150,
    },
    logoOnDark: {
      src: "/assets/events/hosts/aleph-alpha.webp",
      width: 303,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "applied-ai",
    name: "Applied AI",
    href: "https://www.appliedai.de/de/",
    logo: {
      src: "/assets/partners/logos/applied-ai.webp",
      width: 347,
      height: 64,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "auswaertiges-amt",
    name: "Auswärtiges Amt",
    href: "https://www.auswaertiges-amt.de",
    logo: {
      src: "/assets/partners/logos/auswaertiges-amt.webp",
      width: 274,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "check24",
    name: "CHECK24",
    href: "https://www.check24.de",
    logo: {
      src: "/assets/partners/logos/check24.webp",
      width: 500,
      height: 123,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "cobrowser",
    name: "CoBrowser",
    href: "https://www.cobrowser.com/",
    logo: {
      src: "/assets/partners/logos/cobrowser.webp",
      width: 380,
      height: 59,
    },
    partnership: { tier: "supporter", category: "Technical Partners" },
  }),
  defineOrganization({
    key: "elevenlabs",
    name: "ElevenLabs",
    href: "https://elevenlabs.io/",
    logo: {
      src: "/assets/partners/logos/elevenlabs.svg",
      width: 694,
      height: 90,
    },
    partnership: { tier: "supporter", category: "Technical Partners" },
  }),
  defineOrganization({
    key: "enactus-munich",
    name: "Enactus Munich",
    href: "https://enactus-muenchen.de/",
    logo: {
      src: "/assets/partners/logos/enactus-munich.webp",
      width: 264,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "entreprenow-community",
    name: "EntrepreNow Community",
    href: "https://www.linkedin.com/company/entreprenow-community/",
    logo: {
      src: "/assets/partners/logos/entreprenow-community.webp",
      width: 500,
      height: 125,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "eth-analytics-club",
    name: "ETH Analytics Club",
    href: "https://analytics-club.org/wordpress/",
    logo: {
      src: "/assets/partners/logos/eth-analytics-club.webp",
      width: 115,
      height: 143,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "flower-labs",
    name: "Flower Labs",
    href: "https://flower.ai/",
    logo: {
      src: "/assets/partners/logos/flower-labs.webp",
      width: 344,
      height: 83,
    },
    partnership: { tier: "supporter", category: "Research Partners" },
  }),
  defineOrganization({
    key: "gdsc",
    name: "GDSC",
    href: "https://gdsc.community.dev/technical-university-of-munich/",
    logo: { src: "/assets/partners/logos/gdsc.webp", width: 152, height: 150 },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "harvard-medical-school",
    name: "Harvard Medical School",
    href: "https://hms.harvard.edu/",
    logo: {
      src: "/assets/partners/logos/harvard-medical-school.webp",
      width: 500,
      height: 141,
    },
    partnership: { tier: "supporter", category: "Research Partners" },
  }),
  defineOrganization({
    key: "heimkapital",
    name: "Heimkapital",
    href: "https://www.heimkapital.de/",
    logo: {
      src: "/assets/partners/logos/heimkapital.svg",
      width: 142,
      height: 23,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  // The old site's partner "Helmholtz" (the association's wordmark): TUM.ai
  // works with this Munich centre, med.AI's partner on /projects, whose
  // research projects are titled "Helmholtz Zentrum" (its former name).
  defineOrganization({
    key: "helmholtz-munich",
    name: "Helmholtz Munich",
    href: "https://www.helmholtz-munich.de/",
    logo: {
      src: "/assets/partners/logos/helmholtz-munich.svg",
      width: 1301,
      height: 100,
    },
    partnership: { tier: "supporter", category: "Research Partners" },
  }),
  defineOrganization({
    key: "infineon",
    name: "Infineon",
    href: "https://www.infineon.com/cms/de/",
    logo: {
      src: "/assets/partners/logos/infineon.webp",
      width: 343,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "initiatives-for-humanity",
    name: "Initiatives for Humanity",
    href: "https://www.linkedin.com/company/initiatives-for-humanity/",
    logo: {
      src: "/assets/partners/logos/initiatives-for-humanity.webp",
      width: 176,
      height: 72,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "itcs",
    name: "ITCS",
    href: "https://it-cs.io/",
    logo: { src: "/assets/partners/logos/itcs.webp", width: 157, height: 150 },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "klinikum-rechts-der-isar",
    name: "Klinikum rechts der Isar",
    href: "https://www.mri.tum.de/",
    logo: {
      src: "/assets/partners/logos/klinikum-rechts-der-isar.svg",
      width: 1024,
      height: 456,
    },
    partnership: { tier: "supporter", category: "Research Partners" },
  }),
  defineOrganization({
    key: "knust-coe-ic",
    name: "KNUST CoE IC",
    href: "https://www.linkedin.com/company/knust-coe-ic/about/",
    logo: {
      src: "/assets/partners/logos/knust-coe-ic.webp",
      width: 120,
      height: 125,
      symbolOnly: true,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "lmu",
    name: "LMU",
    href: "https://www.lmu.de/",
    logo: { src: "/assets/partners/logos/lmu.webp", width: 316, height: 150 },
    partnership: { tier: "supporter", category: "Research Partners" },
  }),
  defineOrganization({
    key: "mcml",
    name: "MCML",
    href: "https://www.mcml.ai",
    logo: { src: "/assets/partners/logos/mcml.webp", width: 500, height: 136 },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "mi4people",
    name: "MI4People",
    href: "https://de.mi4people.org/",
    logo: {
      src: "/assets/partners/logos/mi4people.webp",
      width: 150,
      height: 150,
      symbolOnly: true,
    },
    partnership: { tier: "supporter", category: "Research Partners" },
  }),
  defineOrganization({
    key: "microsoft",
    name: "Microsoft",
    href: "https://www.microsoft.com/de-de/about",
    logo: {
      src: "/assets/partners/logos/microsoft.webp",
      width: 500,
      height: 106,
    },
    partnership: { tier: "supporter", category: "Technical Partners" },
  }),
  defineOrganization({
    key: "ministry-for-digital-affairs",
    name: "Bavarian State Ministry for Digital Affairs",
    href: "https://www.stmd.bayern.de",
    logo: {
      src: "/assets/partners/logos/ministry-for-digital-affairs.svg",
      width: 484,
      height: 139,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "netlight",
    name: "Netlight",
    href: "https://www.netlight.com",
    logo: {
      src: "/assets/partners/logos/netlight.webp",
      width: 500,
      height: 126,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "qsummit",
    name: "QSummit",
    href: "https://q-summit.com",
    logo: {
      src: "/assets/partners/logos/qsummit.webp",
      width: 168,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "rohde-schwarz",
    name: "Rohde & Schwarz",
    href: "https://www.rohde-schwarz.com/de",
    logo: {
      src: "/assets/partners/logos/rohde-schwarz.webp",
      width: 500,
      height: 101,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "siemens",
    name: "Siemens",
    href: "https://www.siemens.com/de/de.html",
    logo: {
      src: "/assets/partners/logos/siemens.svg",
      width: 1000,
      height: 159,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "speedinvest",
    name: "Speedinvest",
    href: "https://www.speedinvest.com/",
    logo: {
      src: "/assets/partners/logos/speedinvest.webp",
      width: 242,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Venture Capital" },
  }),
  defineOrganization({
    key: "start-munich",
    name: "Start Munich",
    href: "https://www.startmunich.de/",
    logo: {
      src: "/assets/partners/logos/start-munich.webp",
      width: 331,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "tensordyne",
    name: "Tensordyne",
    href: "https://www.tensordyne.ai",
    logo: {
      src: "/assets/partners/logos/tensordyne.webp",
      width: 500,
      height: 36,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "tum-venture-labs",
    name: "TUM Venture Labs",
    href: "https://www.tum-venture-labs.de",
    logo: {
      src: "/assets/partners/logos/tum-venture-labs.webp",
      width: 464,
      height: 80,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "unternehmertum",
    name: "UnternehmerTUM",
    href: "https://www.unternehmertum.de/",
    logo: {
      src: "/assets/partners/logos/unternehmertum.webp",
      width: 250,
      height: 150,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "vercel",
    name: "Vercel",
    href: "https://vercel.com/",
    logo: {
      src: "/assets/partners/logos/vercel.webp",
      width: 500,
      height: 100,
    },
    partnership: { tier: "supporter", category: "Technical Partners" },
  }),

  // Where alumni go (beyond the partners above)
  defineOrganization({
    key: "cohere",
    name: "Cohere",
    href: "https://cohere.com/",
    logo: { src: "/assets/partners/logos/cohere.svg", width: 118, height: 20 },
  }),
  defineOrganization({
    key: "databricks",
    name: "Databricks",
    href: "https://www.databricks.com/",
    logo: {
      src: "/assets/partners/logos/databricks.svg",
      width: 713,
      height: 113,
    },
  }),
  defineOrganization({
    key: "meta",
    name: "Meta",
    href: "https://about.meta.com/",
    logo: { src: "/assets/partners/logos/meta.svg", width: 50, height: 11 },
  }),
  defineOrganization({
    key: "y-combinator",
    name: "Y Combinator",
    href: "https://www.ycombinator.com/",
    logo: {
      src: "/assets/e-lab/partners/y-combinator.webp",
      width: 128,
      height: 64,
    },
  }),

  // Partner case studies (`partners.ts`)
  defineOrganization({
    key: "quantco",
    name: "QuantCo",
    href: "https://www.quantco.com/",
  }),
  defineOrganization({
    key: "osapiens",
    name: "Osapiens",
    href: "https://osapiens.com/",
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
    href: "https://www.cdtm.de/",
    logo: { src: "/assets/e-lab/partners/cdtm.webp", width: 128, height: 64 },
    logoOnDark: {
      src: "/assets/events/hosts/cdtm.svg",
      width: 85,
      height: 64,
      aspectRatio: 1.32,
    },
    partnership: { tier: "supporter", category: "Initiatives" },
  }),
  defineOrganization({
    key: "ewor",
    name: "EWOR",
    href: "https://www.ewor.com/",
    logo: { src: "/assets/e-lab/partners/ewor.webp", width: 128, height: 64 },
    partnership: { tier: "supporter", category: "Venture Capital" },
  }),
  defineOrganization({
    key: "uvc-partners",
    name: "UVC Partners",
    href: "https://www.uvcpartners.com/",
    logo: {
      src: "/assets/e-lab/partners/uvc-partners.webp",
      width: 128,
      height: 64,
    },
    partnership: { tier: "supporter", category: "Venture Capital" },
  }),
  defineOrganization({
    key: "google-cloud",
    name: "Google Cloud",
    href: "https://cloud.google.com/",
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
    href: "https://www.accel.com/",
    logo: { src: "/assets/e-lab/partners/accel.svg", width: 1288, height: 413 },
  }),

  // Research institutions and labs the site names without a logo: the
  // research projects cite them, the /research globe places them
  // (features/research/data/lab-sites.ts). Named as the project titles name
  // them.
  defineOrganization({ key: "tum", name: "TUM", href: "https://www.tum.de/" }),
  defineOrganization({
    key: "tum-camp",
    name: "TUM CAMP",
    href: "https://www.cs.cit.tum.de/camp/",
  }),
  defineOrganization({
    key: "lmu-klinikum",
    name: "LMU Klinikum",
    href: "https://www.lmu-klinikum.de/",
  }),
  // IBM's lab in San Jose, now "IBM Research – Silicon Valley".
  defineOrganization({
    key: "ibm-almaden",
    name: "IBM Almaden",
    href: "https://research.ibm.com/labs/silicon-valley",
  }),
  // IBM Research Europe, Zurich (Rüschlikon).
  defineOrganization({
    key: "ibm-research",
    name: "IBM Research",
    href: "https://research.ibm.com/labs/zurich",
  }),

  // Events co-hosts (features/events/data/host-logos.ts; sources in
  // docs/asset-sources/events-hosts.md)
  defineOrganization({
    key: "beyond-presence",
    name: "Beyond Presence",
    href: "https://www.beyondpresence.ai/",
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
    href: "https://www.bkw.de/de",
    logo: { src: "/assets/partners/logos/bkw.webp", width: 500, height: 108 },
    logoOnDark: {
      src: "/assets/events/hosts/bkw.svg",
      width: 1130,
      height: 271,
      aspectRatio: 4.162,
    },
    partnership: { tier: "supporter", category: "Industry Partners" },
  }),
  defineOrganization({
    key: "hugging-face",
    name: "Hugging Face",
    href: "https://huggingface.co/",
    logo: {
      src: "/assets/partners/logos/hugging-face.webp",
      width: 500,
      height: 121,
    },
    logoOnDark: {
      src: "/assets/events/hosts/hugging-face.svg",
      width: 866,
      height: 192,
      aspectRatio: 4.516,
    },
    partnership: { tier: "supporter", category: "Technical Partners" },
  }),
  defineOrganization({
    key: "lovable",
    name: "Lovable",
    href: "https://lovable.dev/",
    logo: {
      src: "/assets/partners/logos/lovable.svg",
      width: 911,
      height: 155,
    },
    logoOnDark: {
      src: "/assets/events/hosts/lovable.svg",
      width: 950,
      height: 173,
      aspectRatio: 5.495,
    },
    partnership: { tier: "supporter", category: "Technical Partners" },
  }),
  defineOrganization({
    key: "manage-and-more",
    name: "Manage & More",
    href: "https://www.manageandmore.de/",
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
    href: "https://www.mercura.ai/",
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
    href: "https://n8n.io/",
    logo: { src: "/assets/partners/logos/n8n.svg", width: 296, height: 80 },
    logoOnDark: {
      src: "/assets/events/hosts/n8n.svg",
      width: 295,
      height: 80,
      aspectRatio: 3.684,
    },
    partnership: { tier: "supporter", category: "Technical Partners" },
  }),
  defineOrganization({
    key: "project-a",
    name: "Project A",
    href: "https://www.project-a.vc/",
    logo: {
      src: "/assets/partners/logos/project-a.webp",
      width: 425,
      height: 150,
    },
    logoOnDark: {
      src: "/assets/events/hosts/project-a.svg",
      width: 180,
      height: 45,
      aspectRatio: 4.017,
    },
    partnership: { tier: "supporter", category: "Venture Capital" },
  }),
  defineOrganization({
    key: "red-bull",
    name: "Red Bull",
    href: "https://www.redbull.com/",
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
    href: "https://www.tacto.ai/",
    logoOnDark: {
      src: "/assets/events/hosts/tacto.svg",
      width: 124,
      height: 40,
      aspectRatio: 3.08,
    },
  }),
  defineOrganization({
    // A REX institution on /research and a partner of the league's season.
    key: "inria",
    name: "Inria",
    shortName: "Inria",
    href: "https://www.inria.fr/en",
    logo: {
      src: "/assets/research/rex/inria.svg",
      width: 283,
      height: 83,
      alt: "Inria logo",
      aspectRatio: 283.46 / 82.75,
    },
    logoOnDark: {
      src: "/assets/events/hosts/inria.svg",
      width: 283,
      height: 83,
      aspectRatio: 283.46 / 82.75,
    },
  }),
  defineOrganization({
    key: "atira",
    name: "Atira",
    href: "https://atira.ai/",
    logoOnDark: {
      src: "/assets/events/hosts/atira.svg",
      width: 44,
      height: 18,
      aspectRatio: 44 / 18,
    },
  }),
  defineOrganization({
    key: "yellow",
    name: "Yellow",
    href: "https://yellow.vc/",
    logoOnDark: {
      src: "/assets/events/hosts/yellow.svg",
      width: 311,
      height: 91,
      aspectRatio: 3.435,
    },
  }),
];

const byKey = new Map(organizations.map((entry) => [entry.key, entry]));

/** Every partner: the organisations with a partnership. */
export const partnerOrganizations: readonly Organization[] =
  organizations.filter(({ partnership }) => partnership);

/**
 * The launch brief's order within each tier, by organisation key: the
 * directory's tiebreak after "leads its tier". Partners not listed follow
 * alphabetically.
 */
export const partnerLaunchOrder: readonly string[] = [
  "openai",
  "google",
  "anthropic",
  "hudson-river-trading",
  "jetbrains",
  "unite",
  "spherecast",
  "dryft",
  "reply",
  "mutagent",
  "nvidia",
  "entire-io",
  "mckinsey-company",
  "jane-street",
  "bmw",
  "aws",
  "amd",
  "ibm",
];

/**
 * The organisation with `key`. Throws on an unknown key: code lists name
 * organisations by key, and a typo must fail the tests.
 */
export function organizationByKey(key: string): Organization {
  const organization = byKey.get(key);
  if (!organization) throw new Error(`Unknown organisation key "${key}"`);
  return organization;
}

/**
 * The organisations among `keys` the table has, for keys that come from
 * the CMS (an event's co-hosts), where an unknown key is no error.
 */
export function organizationsWithKeys(keys: readonly string[]): Organization[] {
  return keys.flatMap((key) => byKey.get(key) ?? []);
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
