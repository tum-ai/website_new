import type { IndexListItem, LedgerItem } from "@/components/ds";
import { communityFacts } from "@/config/community";
import { eLabConfig } from "@/config/e-lab";
import { impactFacts } from "@/config/impact";
import { officialMembers, organizationFacts } from "@/config/organization";
import { rexInstitutions } from "@/features/research";
import { fillPageTokens } from "@/lib/content-copy";
import { formatList, spellCount } from "@/lib/words";
import type { HomeCopy, LedgerKey } from "./data/homepage";

/**
 * The ledger's figures: facts from the config, so a config edit updates the
 * homepage whatever its copy says. The copy picks and labels them.
 */
const ledgerFigures: Record<
  LedgerKey,
  Pick<LedgerItem, "value" | "prefix" | "suffix">
> = {
  founded: { value: String(organizationFacts.foundingYear) },
  members: { value: officialMembers, suffix: "+" },
  nationalities: { value: organizationFacts.nationalities, suffix: "+" },
  funding: {
    value: eLabConfig.ventureFundingMillions,
    prefix: "€",
    suffix: "M",
  },
  makeathon: { value: communityFacts.makeathonSize, suffix: "+" },
  publications: { value: impactFacts.publications, suffix: "+" },
};

/**
 * What the homepage renders from its copy: the ledger with its figures, and
 * the programs with their page tokens filled (`departmentCount` is how many
 * departments /community lists).
 */
export function homeView(copy: HomeCopy, departmentCount: number) {
  const tokens = {
    rexInstitutions: formatList(
      rexInstitutions.map((institution) => institution.shortName),
    ),
    departments: spellCount(departmentCount),
  };
  const ledger: LedgerItem[] = copy.ledger.map(({ key, label, note }) => ({
    label,
    ...ledgerFigures[key],
    note,
  }));
  const programs: IndexListItem[] = copy.programs.items.map(
    ({ image, description, ...program }) => ({
      ...program,
      description: fillPageTokens(description, tokens),
      image: image.objectPosition
        ? { src: image.src, position: image.objectPosition }
        : { src: image.src },
    }),
  );
  return { ledger, programs };
}
