import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { lockupParts } from "./events";

/**
 * A title set as a co-branding lockup: each "x" between names becomes a ×
 * in the tone's accent, the way the events' own posters pair TUM.ai with its
 * co-hosts. Screen readers hear "and" in its place.
 */
export function Lockup({
  title,
  className,
  crossClassName,
}: {
  /** The CMS title, e.g. "Anthropic x Lovable x Hugging Face". */
  title: string;
  className?: string;
  /** Classes for each ×, e.g. its colour over a photo instead of the tone's accent. */
  crossClassName?: string;
}) {
  const parts = lockupParts(title);
  return (
    <span className={className}>
      {parts.map((part, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a title's parts are static and may repeat; their position is their identity.
        <Fragment key={index}>
          {index > 0 ? <Cross className={crossClassName} /> : null}
          {part}
        </Fragment>
      ))}
    </span>
  );
}

/** The lockup's ×, read as "and". */
function Cross({ className }: { className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={cn("text-highlight", className)}>
        {" × "}
      </span>
      <span className="sr-only"> and </span>
    </>
  );
}
