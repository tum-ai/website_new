import { PageHero } from "@/components/ds";
import { getPartnerCaseStudies } from "@/features/partners/server";
import type { Event } from "@/lib/types";
import { ClosingSection } from "./closing-section";
import { getHackathonsCopy } from "./content";
import { HackathonRibbon } from "./hackathon-ribbon";
import { hackathonsView } from "./hackathons-view";
import { LeagueSection } from "./league-section";
import { MakeathonSection } from "./makeathon-section";
import { type HackathonOutcome, OfferSection } from "./offer-section";
import {
  type HackathonVoice,
  PartnerHackathonsSection,
} from "./partner-hackathons-section";

/** The partner whose words sit beside the other hackathons. */
const VOICE_PARTNER = "bmw";
/** The partner whose result backs the offer. */
const OUTCOME_PARTNER = "osapiens";

/** "Manuel, Head of Innovation, BMW Group" as a name and a byline. */
function splitAttribution(attribution: string) {
  const [name, ...byline] = attribution.split(", ");
  return { name, byline: byline.join(", ") || undefined };
}

/**
 * /hackathons, TUM.ai as an organiser of hackathons. The page's one bold
 * element is the ribbon in the hero: every hackathon since the first
 * Makeathon, at its real dates. The bands then read it lane by lane (the
 * Makeathon, the hackathons between, the league), give partners their way
 * in, and the close returns to the ribbon's end with the next hackathon.
 * The copy comes from the content slice (`content.ts`), the other
 * hackathons from the CMS events, the league from `config/hackathons.ts`.
 */
export async function HackathonsPage({
  events,
  now,
}: {
  /** Every CMS event; the page keeps the hackathons. */
  events: readonly Event[];
  /** The render time: what is past, next and still to come. */
  now: Date;
}) {
  const [copy, caseStudies] = await Promise.all([
    getHackathonsCopy(),
    getPartnerCaseStudies(),
  ]);
  const view = hackathonsView({ copy, events, now });

  const bmw = caseStudies.find(
    ({ organization }) => organization === VOICE_PARTNER,
  );
  const voice: HackathonVoice | undefined = bmw?.attribution
    ? {
        quote: bmw.copy.replace(/^["“]|["”]$/g, ""),
        ...splitAttribution(bmw.attribution),
        image: { src: bmw.image, alt: bmw.alt, position: bmw.imagePosition },
      }
    : undefined;
  const osapiens = caseStudies.find(
    ({ organization }) => organization === OUTCOME_PARTNER,
  );
  const outcome: HackathonOutcome | undefined = osapiens
    ? {
        name: osapiens.name,
        metric: osapiens.metric,
        label: osapiens.label,
        copy: osapiens.copy,
      }
    : undefined;

  return (
    <main>
      <PageHero
        tone="night"
        mark={false}
        titleId="hackathons-hero-title"
        eyebrow={view.hero.eyebrow}
        title={view.hero.title}
        lead={view.hero.lead}
        size="md"
        classNames={{ content: "max-w-4xl", footer: "mt-14 md:mt-20" }}
      >
        <HackathonRibbon ribbon={view.ribbon} copy={view.hero} />
      </PageHero>
      <MakeathonSection makeathon={view.makeathon} />
      <PartnerHackathonsSection partners={view.partners} voice={voice} />
      <LeagueSection league={view.league} />
      <OfferSection offer={view.offer} outcome={outcome} />
      <ClosingSection closing={view.closing} />
    </main>
  );
}
