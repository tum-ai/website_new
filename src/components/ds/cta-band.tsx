import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Actions } from "./actions";
import { Aurora } from "./aurora";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { Section, type Tone } from "./section";
import type { HeadingLevel } from "./types";
import { Eyebrow } from "./typography";

/** Class overrides for a CTA band's inner parts (merged over the defaults). */
export type CtaBandClassNames = {
  /** The centered text column. */
  content?: string;
  /** The heading. */
  title?: string;
  /** The lead paragraph. */
  lead?: string;
  /** The <Actions> row around `actions`. */
  actions?: string;
  /** The wrapper around `children`. */
  footer?: string;
};

/** Props for {@link CtaBand}. */
export type CtaBandProps = {
  /** The closing statement. */
  title: ReactNode;
  /** Small label above the title. */
  eyebrow?: ReactNode;
  /** Large icon or artwork above the title (decorative; hide it from AT). */
  visual?: ReactNode;
  /** One or two sentences under the title. */
  lead?: ReactNode;
  /** Buttons and status badges, laid out by <Actions>. */
  actions?: ReactNode;
  /**
   * Content under the lead that brings its own layout (e.g. a feature's
   * contact row that is already an <Actions>), revealed after `actions`.
   */
  children?: ReactNode;
  /** id of the heading, referenced by the section's `aria-labelledby`. */
  titleId?: string;
  /** Heading level of the title. Default `h2`. */
  headingAs?: HeadingLevel;
  /** Anchor id for the section (e.g. "contact"). */
  id?: string;
  /**
   * `panel`: rounded ink panel inset in a light band (default).
   * `band`: full-bleed dark band.
   */
  variant?: "panel" | "band";
  /** Surrounding band tone for the `panel` variant. Default `paper`. */
  tone?: Tone;
  /** Class overrides for the inner parts. */
  classNames?: CtaBandClassNames;
  /** Classes merged over the section. */
  className?: string;
};

/** Closing call to action with aurora light and the drifting logomark. */
export function CtaBand({
  title,
  eyebrow,
  visual,
  lead,
  actions,
  children,
  titleId,
  headingAs: HeadingTag = "h2",
  id,
  variant = "panel",
  tone = "paper",
  classNames,
  className,
}: CtaBandProps) {
  const inner = (
    <div
      className={cn(
        "relative mx-auto max-w-3xl text-center",
        classNames?.content,
      )}
    >
      {visual ? <Reveal variant="scale">{visual}</Reveal> : null}
      {eyebrow ? (
        <Reveal>
          <Eyebrow className={cn(visual && "mt-6 md:mt-8")}>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}
      <Reveal delay={60}>
        <HeadingTag
          id={titleId}
          className={cn(
            "text-display-lg text-fg",
            eyebrow ? "mt-5" : visual && "mt-6 md:mt-8",
            classNames?.title,
          )}
        >
          {title}
        </HeadingTag>
      </Reveal>
      {lead ? (
        <Reveal delay={140}>
          <p
            className={cn(
              "mx-auto mt-6 max-w-xl text-fg-muted text-lead",
              classNames?.lead,
            )}
          >
            {lead}
          </p>
        </Reveal>
      ) : null}
      {actions ? (
        <Reveal delay={220}>
          <Actions align="center" className={cn("mt-10", classNames?.actions)}>
            {actions}
          </Actions>
        </Reveal>
      ) : null}
      {children ? (
        <Reveal
          delay={actions ? 300 : 220}
          className={cn("mt-10", classNames?.footer)}
        >
          {children}
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
