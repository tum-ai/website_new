import { Container, PageHero, Section } from "@/components/ds";
import { LegalNav } from "./legal-document";

/**
 * The disclaimer is one paragraph; it is set as an editorial split (opening
 * statement left, the rest right) without changing a word.
 */
export function DisclaimerPage() {
  return (
    <main>
      <PageHero
        size="md"
        title="Disclaimer"
        actions={<LegalNav current="/disclaimer" />}
      />

      <Section as="div" tone="paper" spacing="lg">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <p className="text-display-md text-fg lg:col-span-5">
            We are not an educational program.
          </p>
          <div className="lg:col-span-7 lg:pt-3">
            <p className="text-lead text-fg-muted">
              That means you are not only joining to learn but also to
              contribute to the development of the organization. We don't give
              in-depth lectures or crash courses in AI and coding yet - you need
              to interact with other members to learn things. Help is always
              given to those who ask. We do a lot of organizational work - the
              AI ecosystem is not ready, and you will be part of building it up.
            </p>
            <p className="mt-10 border-t border-hairline pt-8 text-heading-md text-fg">
              We have a membership fee of 10€ per semester for all of our active
              members.
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
