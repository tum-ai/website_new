import { Container, Eyebrow, PageHero, Prose, Section } from "@/components/ds";
import { contactEmails, registeredOfficeAddressLine } from "@/config/contact";
import { LegalNav, LegalSection, legalLinkClass } from "./legal-document";

/** Organisation facts, shown as a definition list. Values are verbatim. */
const organisation = [
  { term: "Vereinsregisternummer", value: "VR209059" },
  { term: "Adresse", value: registeredOfficeAddressLine },
  {
    term: "Vertreter",
    value: "Sami Haddouti, Julian Sikora, William Homburg, Luca Fink",
  },
  {
    term: "Mail",
    value: contactEmails.general,
    href: `mailto:${contactEmails.general}`,
  },
] satisfies { term: string; value: string; href?: string }[];

export function ImprintPage() {
  return (
    <main lang="de">
      <PageHero
        size="md"
        title="Impressum"
        actions={<LegalNav current="/imprint" />}
      />

      <Section as="div" tone="paper" spacing="lg">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,21rem)_minmax(0,46rem)] lg:gap-[clamp(3.5rem,7vw,7rem)]">
          <section
            aria-labelledby="organisation-title"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div
              data-tone="lavender"
              className="rounded-4xl p-7 [overflow-wrap:break-word] md:p-9"
            >
              <Eyebrow as="h2" id="organisation-title">
                Organisation
              </Eyebrow>
              <p className="mt-5 text-fg text-heading-lg">TUM.ai e.V.</p>
              {/* Term beside value from sm up; stacked in the narrow lg sidebar. */}
              <dl className="mt-7 divide-y divide-hairline border-hairline border-y">
                {organisation.map((row) => (
                  <div
                    key={row.term}
                    className="py-4 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline sm:gap-6 lg:block"
                  >
                    <dt className="font-medium text-fg-subtle text-meta">
                      {row.term}
                    </dt>
                    <dd className="mt-1 text-body text-fg sm:mt-0 lg:mt-1">
                      {"href" in row ? (
                        <a href={row.href} className={legalLinkClass}>
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <Prose>
            <LegalSection id="haftung-fuer-inhalte" title="Haftung für Inhalte">
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
                Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                gespeicherte fremde Informationen zu überwachen oder nach
                Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
                Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
                hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst
                ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
                möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen
                werden wir diese Inhalte umgehend entfernen.
              </p>
            </LegalSection>

            <LegalSection id="haftung-fuer-links" title="Haftung für Links">
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf
                deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
                diese fremden Inhalte auch keine Gewähr übernehmen. Für die
                Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
                oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
                wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
                überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
                Verlinkung nicht erkennbar. Eine permanente inhaltliche
                Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
                Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
                Bekanntwerden von Rechtsverletzungen werden wir derartige Links
                umgehend entfernen.
              </p>
            </LegalSection>

            <LegalSection id="urheberrecht" title="Urheberrecht">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
                schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                Downloads und Kopien dieser Seite sind nur für den privaten,
                nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf
                dieser Seite nicht vom Betreiber erstellt wurden, werden die
                Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
                Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
                Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
                entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
                werden wir derartige Inhalte umgehend entfernen. Quelle:
                eRecht24
              </p>
            </LegalSection>
          </Prose>
        </Container>
      </Section>
    </main>
  );
}
