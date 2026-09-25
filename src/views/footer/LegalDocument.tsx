import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ds";
import { cn } from "@/lib/utils";

/**
 * Shared building blocks for the legal pages (Imprint, Data Privacy,
 * Disclaimer). The legal copy itself lives verbatim in each page view; these
 * pieces only provide structure and typography.
 */

const legalPages = [
  { href: "/imprint", label: "Imprint" },
  { href: "/data-privacy", label: "Data Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
] as const;

type LegalHref = (typeof legalPages)[number]["href"];

/** Pill switcher between the three legal pages, placed in the page hero. */
export function LegalNav({ current }: { current: LegalHref }) {
  return (
    <nav aria-label="Legal" lang="en">
      <ul className="flex flex-wrap gap-1.5 sm:gap-2">
        {legalPages.map((page) => {
          const active = page.href === current;
          return (
            <li key={page.href}>
              <ButtonLink
                href={page.href}
                size="sm"
                variant={active ? "inverse" : "outline"}
                className="h-10 max-sm:px-3"
                aria-current={active ? "page" : undefined}
              >
                {page.label}
              </ButtonLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Link style for legal links outside `Prose` (address cards, fact lists). */
export const legalLinkClass =
  "font-semibold text-highlight underline decoration-1 underline-offset-4 transition-colors duration-300 [overflow-wrap:anywhere] hover:text-fg hover:decoration-2";

/** Scroll offset so anchored headings clear the fixed header. */
export const legalAnchorOffset =
  "scroll-mt-[calc(var(--header-height)+2.5rem)]";

/**
 * One titled part of a legal document. `number` renders the existing
 * numbering ("1.", "a)") as an accent-colored prefix of the same heading text.
 */
export function LegalSection({
  id,
  number,
  title,
  children,
  className,
}: {
  id: string;
  number?: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        legalAnchorOffset,
        "border-hairline not-first:mt-10 not-first:border-t not-first:pt-10 md:not-first:mt-12 md:not-first:pt-12",
        className,
      )}
    >
      {/* Typography resets the margin of whatever follows a heading, so the
          (not-prose) heading carries the gap itself. */}
      <h2
        id={titleId}
        tabIndex={-1}
        className="not-prose mb-5 text-heading-md text-fg"
      >
        {number ? (
          <>
            <span className="tabular text-highlight">{number}</span>{" "}
          </>
        ) : null}
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Lettered sub-part ("a) …") inside a numbered legal section. */
export function LegalSubsection({
  letter,
  title,
  children,
}: {
  letter: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-10 [h2+&]:mt-7">
      <h3 className="not-prose mb-3 text-heading-sm text-fg">
        <span className="text-highlight">{letter}</span> {title}
      </h3>
      {children}
    </div>
  );
}

/** Postal address / contact block on a soft tinted surface. */
export function AddressCard({
  title,
  children,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <address
      className={cn(
        "not-prose mt-6 rounded-3xl bg-sunken p-6 text-small text-fg-muted not-italic md:p-7",
        className,
      )}
    >
      <p className="mb-2 text-body font-semibold text-fg">{title}</p>
      {children}
    </address>
  );
}
