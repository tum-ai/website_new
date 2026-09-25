import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Actions } from "./actions";
import { Aurora } from "./aurora";
import { BrandMark } from "./brand-mark";
import { Container } from "./container";
import { Section, type Tone } from "./section";
import { SplitWords } from "./split-words";
import { TopBlend } from "./top-blend";
import { Eyebrow } from "./typography";

const titleSizes = {
  md: "text-display-lg",
  lg: "text-display-xl",
  xl: "text-display-2xl",
} as const;

type PageHeroProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  /** Buttons and status badges, laid out by <Actions>. */
  actions?: ReactNode;
  /** Right column (image, card, stats). Stacks under the text on mobile. */
  media?: ReactNode;
  /** Content below the headline block (stats row, filters, tabs). */
  children?: ReactNode;
  size?: keyof typeof titleSizes;
  tone?: Extract<Tone, "ink" | "night">;
  /** Large drifting logomark in the background. */
  mark?: boolean;
  titleId?: string;
  className?: string;
};

/**
 * Opening band for every page: dark tone, aurora light field, drifting
 * logomark, word-by-word headline. Everything above the fold animates with
 * CSS only, so it starts before hydration and doesn't hold back LCP. Top
 * padding clears the fixed header.
 */
export function PageHero({
  title,
  eyebrow,
  lead,
  actions,
  media,
  children,
  size = "lg",
  tone = "ink",
  mark = true,
  titleId,
  className,
}: PageHeroProps) {
  return (
    <Section
      tone={tone}
      spacing="none"
      grain
      aria-labelledby={titleId}
      className={cn(
        "overflow-clip pt-[calc(var(--header-height)+clamp(3rem,7vw,6rem))] pb-[clamp(3.5rem,7vw,6rem)]",
        className,
      )}
    >
      <Aurora />
      {mark ? (
        <BrandMark className="absolute top-[6%] -right-[12%] -z-10 w-[min(64rem,78%)] text-white/[0.035]" />
      ) : null}
      <TopBlend />
      <Container>
        <div
          className={cn(
            media &&
              "grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16",
          )}
        >
          <div className={cn(!media && "max-w-5xl")}>
            {eyebrow ? (
              <Eyebrow className="motion-safe:animate-rise-sm">
                {eyebrow}
              </Eyebrow>
            ) : null}
            <h1
              id={titleId}
              className={cn("text-fg", titleSizes[size], eyebrow && "mt-6")}
            >
              <SplitWords delay={80}>{title}</SplitWords>
            </h1>
            {lead ? (
              <div className="mt-7 max-w-2xl text-lead text-fg-muted motion-safe:animate-rise-sm [animation-delay:380ms]">
                {lead}
              </div>
            ) : null}
            {actions ? (
              <Actions className="mt-10 motion-safe:animate-rise-sm [animation-delay:520ms]">
                {actions}
              </Actions>
            ) : null}
          </div>
          {media ? (
            <div className="motion-safe:animate-rise-sm [animation-delay:260ms]">
              {media}
            </div>
          ) : null}
        </div>
        {children ? (
          <div className="mt-14 motion-safe:animate-rise-sm [animation-delay:640ms] md:mt-20">
            {children}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
