import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Actions } from "./actions";
import { Aurora } from "./aurora";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { Section, type Tone } from "./section";
import { Eyebrow } from "./typography";

type CtaBandProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  /** Buttons and status badges, laid out by <Actions>. */
  actions?: ReactNode;
  titleId?: string;
  /** Anchor id for the section (e.g. "contact"). */
  id?: string;
  /**
   * `panel`: rounded ink panel inset in a light band (default).
   * `band`: full-bleed dark band.
   */
  variant?: "panel" | "band";
  /** Surrounding band tone for the `panel` variant. */
  tone?: Tone;
  className?: string;
};

/** Closing call to action with aurora light and the drifting logomark. */
export function CtaBand({
  title,
  eyebrow,
  lead,
  actions,
  titleId,
  id,
  variant = "panel",
  tone = "paper",
  className,
}: CtaBandProps) {
  const inner = (
    <div className="relative mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}
      <Reveal delay={60}>
        <h2
          id={titleId}
          className={cn("text-display-lg text-fg", eyebrow && "mt-5")}
        >
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal delay={140}>
          <p className="mx-auto mt-6 max-w-xl text-fg-muted text-lead">
            {lead}
          </p>
        </Reveal>
      ) : null}
      {actions ? (
        <Reveal delay={220}>
          <Actions align="center" className="mt-10">
            {actions}
          </Actions>
        </Reveal>
      ) : null}
    </div>
  );

  if (variant === "band") {
    return (
      <Section
        tone="ink"
        spacing="xl"
        grain
        id={id}
        aria-labelledby={titleId}
        className={cn("overflow-clip", className)}
      >
        <Aurora />
        <BrandMark className="absolute -bottom-[30%] left-1/2 -z-10 w-[min(70rem,110%)] -translate-x-1/2 text-white/[0.035]" />
        <Container>{inner}</Container>
      </Section>
    );
  }

  return (
    <Section
      tone={tone}
      spacing="md"
      id={id}
      aria-labelledby={titleId}
      className={className}
    >
      <Container>
        <Reveal variant="scale">
          <div
            data-tone="ink"
            className="relative isolate overflow-clip rounded-5xl px-6 py-20 md:px-16 md:py-28"
          >
            <div aria-hidden className="grain -z-10" />
            <Aurora />
            <BrandMark className="absolute -right-[8%] -bottom-[35%] -z-10 w-[min(44rem,80%)] text-white/[0.04]" />
            {inner}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
