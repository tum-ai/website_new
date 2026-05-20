"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSafeExternalUrl } from "@/lib/security";
import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

type ResearchCardProps = {
  title: string;
  description: string;
  image?: string;
  publication?: string;
  keywords?: string;
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

export default function ResearchCard({
  title,
  description,
  image,
  publication,
  keywords,
}: ResearchCardProps) {
  const publicationUrl = getSafeExternalUrl(publication);
  const [isOpen, setIsOpen] = useState(false);
  const [imageUnavailable, setImageUnavailable] = useState(!image);
  const hasImage = !imageUnavailable;
  const collaboratorName = getCollaboratorName(title);
  const titleColorClass = hasImage
    ? "text-black drop-shadow-[0_1px_14px_rgb(255_255_255/0.35)]"
    : "text-white";
  const titleOverlayClass = hasImage
    ? "bg-gradient-to-b from-white/70 via-white/20 to-transparent"
    : "bg-gradient-to-b from-black/55 via-black/10 to-black/10";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-dark-indigo !p-0 text-left text-white shadow-sm !outline-none transition-shadow duration-200 hover:shadow-2xl hover:shadow-black/30 focus:!outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          style={{ backgroundImage: "none" }}
          aria-label={title}
        >
          {!imageUnavailable ? (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImageUnavailable(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,var(--color-dark-indigo),var(--color-black))]">
              <img
                src="/assets/logo_new_white_standard.png"
                alt="Placeholder"
                className="h-1/2 w-2/3 object-contain opacity-45"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          <div className={`absolute inset-0 ${titleOverlayClass}`} />

          <div className="absolute inset-x-0 top-0 p-6 md:p-7">
            <h3
              className={`max-w-[16rem] text-3xl font-bold leading-none tracking-[-0.04em] md:text-4xl ${titleColorClass}`}
            >
              {collaboratorName}
            </h3>
          </div>

          <div className="absolute inset-0 bg-black p-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 md:p-7">
            <h3 className="max-w-[16rem] text-3xl font-bold leading-none tracking-[-0.04em] md:text-4xl">
              {title}
            </h3>
            {keywords && (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {keywords}
              </p>
            )}
            <p className="mt-5 text-sm leading-6 text-white/78 md:text-[0.95rem]">
              {description}
            </p>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[86vh] w-[calc(100vw-2rem)] overflow-y-auto border-0 bg-white p-0 text-black shadow-2xl !outline-none focus:!outline-none sm:max-w-3xl"
        showCloseButton={false}
      >
        <DialogClose
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full !bg-black/70 !p-0 text-white transition hover:!bg-dark-purple focus:!outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          style={{ backgroundImage: "none" }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="relative h-72 overflow-hidden bg-dark-indigo sm:h-96">
          {!imageUnavailable ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
              onError={() => setImageUnavailable(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--color-dark-indigo),var(--color-black))]">
              <img
                src="/assets/logo_new_white_standard.png"
                alt="Placeholder"
                className="h-32 w-72 object-contain opacity-45"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <DialogHeader className="absolute right-6 bottom-6 left-6 text-left">
            <DialogTitle className="text-4xl font-bold tracking-[-0.04em] text-white md:text-5xl">
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-7 p-6 md:p-8">
          {keywords && (
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {keywords}
            </p>
          )}
          <div>
            <h4 className="mb-2 text-lg font-semibold text-dark-indigo">
              About
            </h4>
            <p className="leading-7 text-text-gray">{description}</p>
          </div>
          {publicationUrl && (
            <Button asChild variant="primary" className="h-11 rounded-md px-5">
              <a
                href={publicationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Read Publication
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
