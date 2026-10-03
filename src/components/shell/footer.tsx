import { ButtonLink } from "@tum.ai/ui-kit";
import { type FooterColumn, Footer as KitFooter } from "@tum.ai/ui-kit/shell";
import { callToActionLabels } from "@/config/calls-to-action";
import {
  connectLinksFor,
  contributeLinksFor,
  legalLinks,
  mainNavigation,
} from "@/config/navigation";
import { getSiteFacts } from "@/config/site-settings-content";

/**
 * Server data adapter for the kit footer. Tagline and contact destinations use
 * this render's site facts; column IDs remain stable when titles change.
 */
export async function Footer() {
  const facts = await getSiteFacts();
  const columns: readonly FooterColumn[] = [
    { id: "explore", title: "Explore", links: mainNavigation },
    { id: "connect", title: "Connect", links: connectLinksFor(facts) },
    { id: "legal", title: "Legal", links: legalLinks },
    { id: "contribute", title: "Contribute", links: contributeLinksFor(facts) },
  ];
  return (
    <KitFooter
      logo={{
        src: "/assets/tum_ai_logo_new.svg",
        alt: "TUM.ai",
        width: 1640,
        height: 406,
      }}
      tagline={facts.footerTagline}
      columns={columns}
      actions={
        <>
          <ButtonLink href="/apply" arrow>
            {callToActionLabels.member}
          </ButtonLink>
          <ButtonLink href="/partners" variant="outline">
            Partner with us
          </ButtonLink>
        </>
      }
      bottomLine={
        <>
          <p>TUM.ai - Student Initiative at Technical University of Munich</p>
          <p>Munich, Germany</p>
        </>
      }
    />
  );
}
