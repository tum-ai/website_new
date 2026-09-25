import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type QuoteCardProps = {
  quote: ReactNode;
  name: string;
  role?: ReactNode;
  portrait?: { src: string; alt?: string };
  /** Organization logo shown in the footer row. */
  logo?: { src: string; alt: string };
  variant?: "raised" | "glass";
  className?: string;
};

/** Testimonial: large quotation, person row with portrait and affiliation. */
export function QuoteCard({
  quote,
  name,
  role,
  portrait,
  logo,
  variant = "raised",
  className,
}: QuoteCardProps) {
  return (
    <figure
      className={cn(
        "relative flex h-full flex-col justify-between gap-8 rounded-3xl p-7 md:p-8",
        variant === "raised"
          ? "border border-hairline bg-raised shadow-soft"
          : "border border-white/10 bg-white/[0.045] shadow-inset-hairline backdrop-blur-md",
        className,
      )}
    >
      <div>
        <svg
          aria-hidden
          viewBox="0 0 32 24"
          className="h-6 w-8 text-highlight"
          fill="currentColor"
        >
          <path d="M0 24V14.4C0 6.24 4.32 1.44 12.96 0l1.44 3.36C9.6 4.8 7.2 7.68 7.2 12H13.2V24H0Zm18.8 0V14.4C18.8 6.24 23.12 1.44 31.76 0l1.44 3.36C28.4 4.8 26 7.68 26 12H32V24H18.8Z" />
        </svg>
        <blockquote className="mt-5 text-lead text-fg">{quote}</blockquote>
      </div>
      <figcaption className="flex items-center gap-4">
        {portrait ? (
          <Image
            src={portrait.src}
            alt={portrait.alt ?? ""}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full object-cover ring-2 ring-hairline"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-heading-sm text-fg">{name}</p>
          {role ? <p className="text-meta text-fg-subtle">{role}</p> : null}
        </div>
        {logo ? (
          <img
            src={logo.src}
            alt={logo.alt}
            loading="lazy"
            decoding="async"
            className="h-6 w-auto max-w-24 shrink-0 object-contain opacity-80"
          />
        ) : null}
      </figcaption>
    </figure>
  );
}
