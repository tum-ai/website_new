"use client";

import {
  BrandPanel,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  FallbackImage,
} from "@tum.ai/ui-kit";
import type { ReactNode } from "react";
import type { EventDetails } from "./events";
import { categoryLabel } from "./filters";
import { HostLine } from "./host-line";
import { Lockup } from "./lockup";

const imageSizes = "(min-width: 768px) 28rem, 100vw";

/**
 * What opens the dialog: a ds `Button` with a trailing arrow, or a plain
 * `<button>` styled by the caller (a register row's title, a poster tile).
 * The element is created here, on the client: an element built in a server
 * component loses its children when Base UI merges the trigger's props.
 */
export type EventDialogTrigger =
  | { kind: "button"; variant: "primary" | "outline" }
  | { kind: "bare"; className: string };

/**
 * An event's detail dialog: its poster beside the date, title, venue,
 * co-hosts, the full description and an optional action (the sign-up for
 * upcoming events). `children` is the trigger's content, which starts with
 * "Read More about" for screen readers. Takes plain, pre-formatted props from
 * the server (`toEventDetails`), so it never formats a date in the browser.
 */
export function EventDetailsDialog({
  details,
  action,
  trigger,
  children,
}: {
  /** What the dialog shows. */
  details: EventDetails;
  /** Rendered under the description, e.g. the sign-up button. */
  action?: ReactNode;
  /** What opens the dialog. */
  trigger: EventDialogTrigger;
  /** The trigger's content. */
  children: ReactNode;
}) {
  const { title, date, location, category, hosts, description, image } =
    details;

  return (
    <Dialog>
      <DialogTrigger
        render={
          trigger.kind === "button" ? (
            <Button variant={trigger.variant} arrow />
          ) : (
            <button type="button" className={trigger.className} />
          )
        }
      >
        {children}
      </DialogTrigger>
      <DialogContent size="xl">
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="relative aspect-square overflow-hidden bg-sunken md:aspect-auto md:min-h-128">
            <FallbackImage
              src={image?.src}
              alt={image?.alt ?? ""}
              fill
              unoptimized
              sizes={imageSizes}
              className="object-cover"
              fallback={<BrandPanel />}
            />
          </div>
          <div className="flex min-w-0 flex-col px-6 py-8 sm:px-10 sm:py-10 md:pt-14">
            <p className="font-medium text-highlight text-small">
              <time dateTime={date.dateTime}>
                {date.weekday}, {date.long}
                {date.time ? `, ${date.time}` : null}
              </time>
            </p>
            <DialogTitle className="mt-4 md:pr-8">
              <Lockup title={title} />
            </DialogTitle>
            {location || category ? (
              <DialogDescription className="mt-3 text-small">
                {[location, category ? categoryLabel(category) : null]
                  .filter(Boolean)
                  .join(", ")}
              </DialogDescription>
            ) : null}
            <HostLine hosts={hosts} className="mt-2 text-small" />
            <p className="mt-7 whitespace-pre-line border-hairline border-t pt-7 text-body text-fg-muted">
              {description}
            </p>
            {action ? <div className="mt-9 flex">{action}</div> : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
