"use client";

import { MapPin } from "lucide-react";
import type { ReactNode } from "react";
import {
  BrandPanel,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  FallbackImage,
  Tag,
} from "@/components/ds";
import type { EventDetails } from "./events";

const imageSizes = "(min-width: 768px) 40vw, 100vw";

/**
 * "Read More" trigger and the event detail dialog: image, date, title,
 * location, category, the full description and an optional action (the
 * sign-up for upcoming events). Takes plain, pre-formatted props from the
 * server (`toEventDetails`), so it never formats a date in the browser.
 */
export function EventDetailsDialog({
  details,
  action,
  triggerVariant = "outline",
}: {
  /** What the dialog shows. */
  details: EventDetails;
  /** Rendered under the description, e.g. the sign-up button. */
  action?: ReactNode;
  /** Look of the "Read More" trigger. */
  triggerVariant?: "outline" | "link";
}) {
  const { title, date, location, category, description, image } = details;

  return (
    <Dialog>
      <DialogTrigger render={<Button variant={triggerVariant} arrow />}>
        Read More
        <span className="sr-only"> about {title}</span>
      </DialogTrigger>
      <DialogContent size="xl">
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-sunken md:aspect-auto md:min-h-128">
            {image ? (
              <FallbackImage
                src={image.src}
                alt=""
                fill
                unoptimized
                sizes={imageSizes}
                className="scale-110 object-cover opacity-60 blur-2xl"
                fallback={null}
              />
            ) : null}
            <FallbackImage
              src={image?.src}
              alt={image?.alt ?? ""}
              fill
              unoptimized
              sizes={imageSizes}
              className="object-contain"
              fallback={<BrandPanel />}
            />
          </div>
          <div className="flex min-w-0 flex-col px-6 py-8 sm:px-10 sm:py-10 md:pt-14">
            <p className="text-eyebrow text-highlight">
              <time dateTime={date.dateTime}>{date.long}</time>
            </p>
            <DialogTitle className="mt-4 md:pr-8">{title}</DialogTitle>
            {location ? (
              <DialogDescription className="mt-3 flex items-start gap-2 text-small">
                <MapPin
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-highlight"
                />
                {location}
              </DialogDescription>
            ) : null}
            {category ? (
              <Tag className="mt-5 self-start">{category}</Tag>
            ) : null}
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
