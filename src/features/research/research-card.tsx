"use client";

import { FileText, Plus } from "lucide-react";
import { useId, useState } from "react";
import {
  ButtonLink,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  SpotlightCard,
  StatusBadge,
  Tag,
} from "@/components/ds";
import { cn } from "@/lib/cn";
import { getSafeExternalUrl } from "@/lib/security";
import { BrandPlaceholder } from "./brand-placeholder";

type ResearchCardProps = {
  title: string;
  description: string;
  image?: string;
  publication?: string;
  keywords?: string;
  /** CMS status: "ongoing" or "completed". */
  status?: string;
  /** Position in its list, rendered as an editorial counter ("01"). */
  index?: number;
  /** `card`: image-led grid card. `row`: compact archive row with a thumbnail. */
  layout?: "card" | "row";
};

function getCollaboratorName(title: string) {
  const lead = title.trim().split(":")[0]?.trim() || title.trim();

  if (/^IBM\b/i.test(lead)) {
    return "IBM";
  }

  if (/^MIT\b/i.test(lead)) {
    return "MIT";
  }

  if (/^TUM\b/i.test(lead)) {
    return "TUM";
  }

  if (/^LMU\b/i.test(lead)) {
    return "LMU";
  }

  if (/Helmholtz/i.test(lead)) {
    return "Helmholtz";
  }

  if (/University of Cambridge/i.test(lead)) {
    return "University of Cambridge";
  }

  return lead.split(",")[0]?.trim() || lead;
}

const statusLabels: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
};

function splitKeywords(keywords?: string) {
  return (keywords ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

const counter = (index: number) => String(index + 1).padStart(2, "0");

function KeywordTags({
  keywords,
  className,
}: {
  keywords: string[];
  className?: string;
}) {
  if (keywords.length === 0) return null;
  return (
    <ul
      aria-label="Keywords"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {keywords.map((keyword) => (
        <li key={keyword}>
          <Tag>{keyword}</Tag>
        </li>
      ))}
    </ul>
  );
}

/** Small static status line for cards; the dialog uses the full StatusBadge. */
function StatusLine({ status }: { status?: string }) {
  const label = status ? statusLabels[status] : undefined;
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-2 text-meta font-semibold text-fg-muted">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "ongoing"
            ? "bg-violet-500 shadow-[0_0_0_3px_rgb(154_100_217/0.18)]"
            : "border border-fg-subtle",
        )}
      />
      {label}
    </span>
  );
}

function PublicationHint() {
  return (
    <span className="inline-flex items-center gap-1.5 text-meta font-medium text-fg-subtle">
      <FileText aria-hidden className="size-3.5" strokeWidth={1.75} />
      Publication
    </span>
  );
}

/**
 * The dialog-opening affordance: a disc whose plus turns on hover. `media`
 * is the white disc for photos; `tonal` sits on the card surface.
 */
function OpenHint({
  variant = "media",
  className,
}: {
  variant?: "media" | "tonal";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition-[rotate,background-color] duration-500 ease-brand group-hover/media:rotate-90 motion-reduce:transition-none",
        variant === "media"
          ? "bg-white/90 text-violet-950 shadow-soft backdrop-blur group-hover/media:bg-white"
          : "bg-fg/[0.07] text-fg group-hover/media:bg-fg/[0.12]",
        className,
      )}
    >
      <Plus className="size-4" />
    </span>
  );
}

/**
 * A research project: the collaborator as eyebrow, title, keywords and
 * status. The whole surface is one dialog trigger (labelled by the title)
 * that opens the full description and the publication link.
 */
export function ResearchCard({
  title,
  description,
  image,
  publication,
  keywords,
  status,
  index = 0,
  layout = "card",
}: ResearchCardProps) {
  const publicationUrl = getSafeExternalUrl(publication);
  const [imageUnavailable, setImageUnavailable] = useState(!image);
  const titleId = useId();
  const collaboratorName = getCollaboratorName(title);
  const keywordList = splitKeywords(keywords);
  const statusLabel = status ? statusLabels[status] : undefined;

  /* CMS (Sanity) URLs sit outside next/image's configured hosts, so a plain
     lazy <img> is used. On error the branded placeholder takes over. */
  const renderMedia = (alt: string, placeholderType: string) =>
    imageUnavailable ? (
      <BrandPlaceholder seed={index}>
        <span
          className={cn(
            "absolute bottom-0 left-0 p-5 leading-none font-light tracking-[-0.04em] text-white/90 md:p-6",
            placeholderType,
          )}
        >
          {collaboratorName}
        </span>
      </BrandPlaceholder>
    ) : (
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setImageUnavailable(true)}
        className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-brand group-hover/media:scale-[1.04] motion-reduce:transition-none"
      />
    );

  const trigger = (
    <DialogTrigger
      aria-labelledby={titleId}
      className="absolute inset-0 z-10 rounded-[inherit]"
    />
  );

  const card =
    layout === "row" ? (
      <article className="group/media relative isolate grid grid-cols-[minmax(0,1fr)_6.5rem] items-start gap-x-5 gap-y-4 rounded-3xl py-6 sm:grid-cols-[2.5rem_minmax(0,1fr)_10rem] md:grid-cols-[3.5rem_minmax(0,1fr)_14rem] md:gap-x-8 md:py-8 lg:grid-cols-[4rem_minmax(0,1fr)_17rem]">
        {/* Explicit placement: on phones the tags run under both the text
            and the thumbnail; from `sm` they sit in the text column. The
            counter and the text column share one baseline. */}
        <span
          aria-hidden
          className="tabular hidden self-baseline text-eyebrow text-fg-subtle sm:col-start-1 sm:row-span-2 sm:row-start-1 sm:block"
        >
          {counter(index)}
        </span>
        <div className="col-start-1 row-start-1 min-w-0 self-baseline sm:col-start-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <p className="text-eyebrow text-highlight uppercase">
              {collaboratorName}
            </p>
            {publicationUrl ? <PublicationHint /> : null}
          </div>
          <h3
            id={titleId}
            className="mt-2.5 text-heading-md text-fg transition-colors duration-300 ease-brand group-hover/media:text-highlight"
          >
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-2xl text-small text-fg-muted max-sm:hidden">
            {description}
          </p>
        </div>
        {/* Radius 24px = disc radius 16px + 8px inset, so the disc sits
            concentric in the corner. */}
        <div
          className={cn(
            "relative col-start-2 row-start-1 aspect-square overflow-hidden rounded-3xl bg-sunken sm:col-start-3 sm:aspect-[16/10]",
            keywordList.length > 0 && "sm:row-span-2",
          )}
        >
          {renderMedia("", "hidden text-heading-lg md:block")}
          <OpenHint className="absolute top-2 right-2 size-8" />
        </div>
        <KeywordTags
          keywords={keywordList}
          className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2"
        />
        {trigger}
      </article>
    ) : (
      <SpotlightCard
        variant="raised"
        padding="none"
        interactive
        className="group/media flex h-full flex-col sm:max-lg:grid sm:max-lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]"
      >
        {/* Media bleeds to the card edge: outer corners follow the card's
            radius (minus its 1px border), inner edges stay straight. */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-[calc(1.5rem-1px)] bg-sunken sm:max-lg:aspect-auto sm:max-lg:h-full sm:max-lg:min-h-64 sm:max-lg:rounded-l-[calc(1.5rem-1px)] sm:max-lg:rounded-tr-none">
          {renderMedia("", "text-display-md")}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:max-lg:p-7 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-eyebrow text-highlight uppercase">
              {collaboratorName}
            </p>
            <span aria-hidden className="tabular text-eyebrow text-fg-subtle">
              {counter(index)}
            </span>
          </div>
          <h3 id={titleId} className="mt-3 text-heading-md text-fg">
            {title}
          </h3>
          <p className="mt-3 line-clamp-3 text-small text-fg-muted">
            {description}
          </p>
          <KeywordTags keywords={keywordList} className="mt-5" />
          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <StatusLine status={status} />
                {publicationUrl ? <PublicationHint /> : null}
              </div>
              <OpenHint variant="tonal" className="size-9" />
            </div>
          </div>
        </div>
        {trigger}
      </SpotlightCard>
    );

  return (
    <Dialog>
      {card}
      <DialogContent size="lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-sunken sm:aspect-[2/1]">
          {renderMedia(title, "text-display-lg")}
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-0">
            <p className="text-eyebrow text-highlight uppercase">
              {collaboratorName}
            </p>
            {statusLabel ? (
              <StatusBadge status={status === "ongoing" ? "live" : "idle"}>
                {statusLabel}
              </StatusBadge>
            ) : null}
          </div>
          <DialogTitle className="mt-4 max-w-2xl">{title}</DialogTitle>
          <KeywordTags keywords={keywordList} className="mt-5" />
          <div className="mt-8 grid gap-3 border-t border-hairline pt-8 md:grid-cols-[8rem_minmax(0,1fr)] md:items-baseline md:gap-8">
            <h3 className="text-eyebrow text-fg-subtle uppercase">About</h3>
            <DialogDescription className="leading-relaxed">
              {description}
            </DialogDescription>
          </div>
          {publicationUrl ? (
            <div className="mt-8 flex border-t border-hairline pt-8 md:pl-40">
              <ButtonLink href={publicationUrl} arrow="external">
                Read Publication
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
