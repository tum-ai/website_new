# Consumer composition example

Shared primitives and their implementation conventions belong to the versioned
[UI kit](https://github.com/tum-ai/ui-kit/tree/v0.2.0). Compose its public exports
in this app; this example is a page pattern, not a new shared primitive.

```tsx
import { Actions, ButtonLink, Container, Heading, Section } from "@tum.ai/ui-kit";

export function ProjectSection() {
  return (
    <Section tone="paper" aria-labelledby="project-title">
      <Container>
        <Heading as="h2" id="project-title">Build with the community</Heading>
        <Actions className="mt-6">
          <ButtonLink href="/projects">Explore projects</ButtonLink>
          <ButtonLink href="/community" variant="outline">Meet the community</ButtonLink>
        </Actions>
      </Container>
    </Section>
  );
}
```

Keep real CTA labels and facts in app config/content slices. Public `className`
and `classNames` hooks support composition; a missing shared variant or behaviour
is an upstream kit change followed by a release and exact dependency upgrade.
Use app tests for content and integration, and kit tests for primitive behaviour.
