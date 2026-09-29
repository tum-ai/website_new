import type { Organization } from "@/lib/people-and-logos";
import type { Partner } from "@/lib/types";
import { partnerLogoLists } from "./organizations";

// These brief-approved defaults also keep the core wall available before CMS backfill.
export const featuredPartners: Partner[] = [
  {
    id: "openai",
    name: "OpenAI",
    tier: "gold",
    image: "/assets/partners/logos/openai-wordmark.webp",
    link: "https://openai.com/",
  },
  {
    id: "google",
    name: "Google",
    tier: "gold",
    image: "/assets/partners/logos/google.webp",
    link: "https://about.google/",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tier: "gold",
    image: "/assets/partners/logos/anthropic.webp",
    link: "https://www.anthropic.com/",
  },
  {
    id: "hrt",
    name: "Hudson River Trading",
    tier: "gold",
    image: "/assets/partners/logos/hrt.webp",
    link: "https://www.hudsonrivertrading.com/",
  },
  {
    id: "jetbrains",
    name: "JetBrains",
    tier: "gold",
    image: "/assets/partners/logos/jetbrains.svg",
    link: "https://www.jetbrains.com/",
  },
  {
    id: "unite",
    name: "Unite",
    tier: "gold",
    image: "/assets/partners/logos/unite.webp",
    link: "https://unite.eu/",
  },
  {
    id: "spherecast",
    name: "Spherecast",
    tier: "silver",
    image: "/assets/e-lab/startups/Spherecast.webp",
    link: "https://spherecast.ai/",
  },
  {
    id: "dryft",
    name: "Dryft",
    tier: "silver",
    image: "/assets/partners/logos/dryft.webp",
    link: "https://dryft.ai/",
  },
  {
    id: "reply",
    name: "Reply",
    tier: "silver",
    image: "/assets/partners/logos/reply.webp",
    link: "https://www.reply.com/",
  },
  {
    id: "mutagent",
    name: "Mutagent",
    tier: "bronze",
    image: "/assets/partners/logos/mutagent.svg",
    link: "https://mutagent.io/",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    tier: "gold",
    image: "/assets/partners/logos/nvidia.webp",
    link: "https://www.nvidia.com/",
  },
  {
    id: "entire",
    name: "Entire.io",
    tier: "gold",
    image: "/assets/partners/logos/entire-lockup.webp",
    link: "https://entire.io/",
  },
  {
    id: "mckinsey",
    name: "McKinsey & Company",
    tier: "silver",
    image: "/assets/partners/logos/mckinsey.svg",
    link: "https://www.mckinsey.com/",
  },
  {
    id: "jane-street",
    name: "Jane Street",
    tier: "silver",
    image: "/assets/partners/logos/jane-street.svg",
    link: "https://www.janestreet.com/",
  },
  {
    id: "bmw",
    name: "BMW",
    tier: "silver",
    image: "/assets/partners/logos/bmw.svg",
    link: "https://www.bmw.com/",
  },
  {
    id: "aws",
    name: "AWS",
    tier: "silver",
    image: "/assets/partners/logos/aws.svg",
    link: "https://aws.amazon.com/",
  },
  {
    id: "amd",
    name: "AMD",
    tier: "bronze",
    image: "/assets/partners/logos/amd.webp",
    link: "https://www.amd.com/",
  },
  {
    id: "ibm",
    name: "IBM",
    tier: "bronze",
    image: "/assets/partners/logos/ibm.png",
    link: "https://www.ibm.com/",
  },
];

/** A company in "Where they go afterwards": its name and light logo. */
export type AlumniDestination = { name: string; image?: string };

/** The alumni-destination chips of a logo list. */
export function alumniDestinationsOf(
  list: readonly Organization[],
): AlumniDestination[] {
  return list.map(({ name, logo }) =>
    logo ? { name, image: logo.src } : { name },
  );
}

/**
 * The symbol-only artwork among `lists` (light and dark logos): artwork that
 * doesn't name its company, so tiles and the hero marquee set the partner
 * name beside it as a wordmark lockup. Matched by file, so it covers the
 * launch defaults above as long as they use the same files.
 */
export function symbolOnlyLogosOf(
  lists: readonly (readonly Organization[])[],
): ReadonlySet<string> {
  return new Set(
    lists
      .flat()
      .flatMap(({ logo, logoOnDark }) => [logo, logoOnDark])
      .flatMap((artwork) => (artwork?.symbolOnly ? [artwork.src] : [])),
  );
}

export const symbolOnlyLogos = symbolOnlyLogosOf(
  Object.values(partnerLogoLists),
);

export const alumniDestinations = alumniDestinationsOf(
  partnerLogoLists["alumni-destinations"],
);
