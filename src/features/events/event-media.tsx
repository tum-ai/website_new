"use client";

import Image from "next/image";
import { useState } from "react";
import { BrandMark } from "@/components/ds";
import { cn } from "@/lib/cn";

/**
 * On-brand stand-in for events without a poster or photos, and for CMS images
 * that fail to load: an ink panel with violet light and the logomark as a
 * cropped tonal shape (as on the brand guide's slides). Decorative only, so it
 * is hidden from assistive technology. Fills its `relative` parent.
 */
export function EventArtwork({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      data-tone="ink"
      className={cn("absolute inset-0 isolate overflow-hidden", className)}
    >
      <div className="absolute -top-[35%] -left-[30%] h-[95%] w-[90%] rounded-full bg-[radial-gradient(closest-side,rgb(154_100_217/0.5),transparent)]" />
      <div className="absolute -right-[30%] -bottom-[40%] h-[90%] w-[85%] rounded-full bg-[radial-gradient(closest-side,rgb(82_53_115/0.9),transparent)]" />
      <BrandMark
        drift={false}
        className="absolute -right-[16%] -bottom-[12%] w-[96%] text-white/[0.07]"
      />
      <div className="grain" />
    </div>
  );
}

/**
 * Event poster or photo. CMS images are Sanity CDN URLs outside the
 * next.config image patterns, so they are served `unoptimized`. Falls back to
 * <EventArtwork> when there is no source or the image fails to load. Fills its
 * `relative` parent.
 */
export function EventImage({
  src,
  alt,
  sizes,
  className,
}: {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <EventArtwork />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      onError={() => setFailedSrc(src)}
      className={cn("object-cover", className)}
    />
  );
}
