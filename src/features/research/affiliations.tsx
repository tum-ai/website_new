import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { ProjectAffiliation } from "./research";

/**
 * An affiliation number, set as in a paper's title block. Decorative: the
 * ordered list and the visible names carry the meaning for assistive tech.
 */
function AffiliationMark({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  return (
    <sup
      aria-hidden="true"
      className={cn("tabular font-semibold text-highlight", className)}
    >
      {index}
    </sup>
  );
}

/**
 * An index entry's number, hung at the name's cap height as in a paper's
 * affiliation list. Decorative like {@link AffiliationMark}.
 */
function IndexNumber({ index }: { index: number }) {
  return (
    <span
      aria-hidden="true"
      className="tabular mt-1 mr-1.5 font-semibold text-highlight text-label-sm leading-none lg:mt-1.5"
    >
      {index}
    </span>
  );
}

/**
 * The page's title block: every institution named on a project, numbered in
 * the order the projects cite them. With `openSlot`, the list ends on one more, unfilled number and the
 * named entries step back.
 */
export function AffiliationIndex({
  affiliations,
  openSlot,
  id,
  label,
  className,
}: {
  /** Institutions in index order; position + 1 is the cited number. */
  affiliations: string[];
  /** The label of an extra, highlighted last entry ("Your lab"). */
  openSlot?: string;
  /** Unique id prefix; the label's id is derived from it. */
  id: string;
  /** Visible label above the list; it also names the list. */
  label: string;
  className?: string;
}) {
  const labelId = `${id}-label`;
  return (
    <div className={className}>
      <p id={labelId} className="text-fg-subtle text-meta">
        {label}
      </p>
      <ol
        aria-labelledby={labelId}
        className="mt-4 flex flex-wrap gap-x-7 gap-y-1 font-light text-fg text-heading-md md:gap-x-10 lg:text-heading-lg"
      >
        {affiliations.map((name, position) => (
          <li
            key={name}
            className={cn(
              "flex items-start whitespace-nowrap",
              openSlot && "text-fg-muted",
            )}
          >
            <IndexNumber index={position + 1} />
            {name}
          </li>
        ))}
        {openSlot ? (
          <li className="flex items-start whitespace-nowrap text-highlight">
            <IndexNumber index={affiliations.length + 1} />
            {openSlot}
          </li>
        ) : null}
      </ol>
    </div>
  );
}

/** A project's institutions as its author line, each with its index number. */
export function AffiliationNames({
  affiliations,
  className,
}: {
  affiliations: ProjectAffiliation[];
  className?: string;
}) {
  if (affiliations.length === 0) return null;
  return (
    <p className={cn("text-fg-muted text-small", className)}>
      {affiliations.map(({ name, index }, position) => (
        <Fragment key={name}>
          {position > 0 ? ", " : null}
          {name}
          <AffiliationMark index={index} className="ml-0.5" />
        </Fragment>
      ))}
    </p>
  );
}
