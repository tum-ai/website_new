import { getSiteFacts } from "@/config/site-settings-content";
import { getPartnerCaseStudies } from "@/features/partners/server";
import { getLogoLists } from "@/lib/organization-content";
import type { Event } from "@/lib/types";
import { ClosingSection } from "./closing-section";
import { getHackathonsCopy } from "./content";
import { HackathonsHero } from "./hackathons-hero";
import { hackathonsView } from "./hackathons-view";
import { LeagueSection } from "./league-section";
import { MakeathonSection } from "./makeathon-section";
import { type HackathonOutcome, OfferSection } from "./offer-section";
import {
  type HackathonVoice,
  PartnerHackathonsSection,
} from "./partner-hackathons-section";

/** "Manuel, Head of Innovation, BMW Group" as a name and a byline. */
function splitAttribution(attribution: string) {
  const [name, ...byline] = attribution.split(", ");
  return { name, byline: byline.join(", ") || undefined };
}

/**
 * /hackathons, TUM.ai as an organiser of hackathons, and of its two
 * flagships above all. The hero claims both and draws the ribbon: every
 * hackathon since the first Makeathon, at its real dates. The league
 * follows while its season is live, then the Makeathon that opened it,
 * the hackathons between, the partners' way in, and the close returns to
 * the ribbon's end with the next hackathon. The copy comes from the content
 * slice (`content.ts`), the other hackathons from the CMS events, the
 * league facts from the CMS site settings.
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
  const [copy, caseStudies, siteFacts, logoLists] = await Promise.all([
    getHackathonsCopy(),
    getPartnerCaseStudies(),
    getSiteFacts(),
    getLogoLists({
      surfaces: ["ehl-partners"],
      label: "hackathons league partners",
    }),
  ]);
  const logos = logoLists["ehl-partners"].flatMap(
    ({ name, href, logoOnDark }) =>
      logoOnDark && !logoOnDark.symbolOnly
        ? [
            {
              name,
              src: logoOnDark.src,
              aspect:
                logoOnDark.aspectRatio ?? logoOnDark.width / logoOnDark.height,
              ...(href ? { href } : {}),
            },
          ]
        : [],
  );
  const view = hackathonsView({
    copy,
    facts: siteFacts.hackathons,
    logos,
    events,
    now,
  });

  const selectedVoice = caseStudies.find(
    ({ id }) => id === copy.voiceCaseStudy,
  );
  const voice: HackathonVoice | undefined = selectedVoice?.attribution
    ? {
        quote: selectedVoice.copy.replace(/^["“]|["”]$/g, ""),
        ...splitAttribution(selectedVoice.attribution),
        image: {
          src: selectedVoice.image,
          alt: selectedVoice.alt,
          position: selectedVoice.imagePosition,
        },
      }
    : undefined;
  const selectedOutcome = caseStudies.find(
    ({ id }) => id === copy.outcomeCaseStudy,
  );
  const outcome: HackathonOutcome | undefined = selectedOutcome
    ? {
        name: selectedOutcome.name,
        metric: selectedOutcome.metric,
        label: selectedOutcome.label,
        copy: selectedOutcome.copy,
      }
    : undefined;

  return (
    <main>
      <HackathonsHero hero={view.hero} />
      <LeagueSection league={view.league} />
      <MakeathonSection makeathon={view.makeathon} />
      <PartnerHackathonsSection partners={view.partners} voice={voice} />
      <OfferSection offer={view.offer} outcome={outcome} />
      <ClosingSection closing={view.closing} />
    </main>
  );
}
