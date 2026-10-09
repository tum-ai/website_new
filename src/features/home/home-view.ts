import type { IndexListItem, LedgerItem } from "@tum.ai/ui-kit";
import { deriveSiteFacts, type SiteFacts } from "@/config/site-facts";
import { fillPageTokens } from "@/lib/content-copy";
import { formatList, spellCount } from "@/lib/words";
import type { HomeCopy, LedgerKey } from "./data/homepage";

/**
 * The ledger's figures: the render's site facts, so a fact edit updates
 * the homepage whatever its copy says. The copy picks and labels them.
 */
function ledgerFiguresOf(
  facts: SiteFacts,
): Record<
  LedgerKey,
  Pick<LedgerItem, "value" | "prefix" | "suffix" | "decimals">
> {
  const funding = facts.eLab.ventureFundingMillions;
  return {
    founded: { value: String(facts.organization.foundingYear) },
    members: { value: deriveSiteFacts(facts).officialMembers, suffix: "+" },
    nationalities: { value: facts.organization.nationalities, suffix: "+" },
    // Counts up to ventureFundingTextOf()'s "€8M+", the copy's figure.
    funding: {
      value: funding,
      prefix: "€",
      suffix: "M+",
      // As many as the fact has (€7.5M+), like the copy that quotes it.
      decimals: String(funding).split(".")[1]?.length ?? 0,
    },
    makeathon: { value: facts.community.makeathonSize, suffix: "+" },
    publications: { value: facts.impact.publications, suffix: "+" },
  };
}

/** What the homepage's figures and page tokens come from, per render. */
export type HomeViewSources = {
  /** `await getSiteFacts()`. */
  facts: SiteFacts;
  /** How many departments /community lists. */
  departmentCount: number;
  /** The REX institutions, in order (`getRexInstitutions()`). */
  rexInstitutions: readonly { shortName: string }[];
};

/**
 * What the homepage renders from its copy: the ledger with its figures, and
 * the programs with their page tokens filled.
 */
export function homeView(
  copy: HomeCopy,
  { facts, departmentCount, rexInstitutions }: HomeViewSources,
) {
  const tokens = {
    rexInstitutions: formatList(
      rexInstitutions.map((institution) => institution.shortName),
    ),
    departments: spellCount(departmentCount),
  };
  const ledgerFigures = ledgerFiguresOf(facts);
  const ledger: LedgerItem[] = copy.ledger.map(({ key, label, note }) => ({
    label,
    ...ledgerFigures[key],
    note,
  }));
  const programs: IndexListItem[] = copy.programs.items.map(
    ({ image, description, ...program }) => ({
      ...program,
      description: fillPageTokens(description, tokens),
      image: {
        src: image.src,
        width: image.width,
        height: image.height,
        ...(image.objectPosition ? { position: image.objectPosition } : {}),
      },
    }),
  );
  return { ledger, programs };
}
