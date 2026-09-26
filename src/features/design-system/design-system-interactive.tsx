"use client";

import { Menu, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import {
  BrandMark,
  Button,
  ChipGroup,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  IconButton,
  Parallax,
  ScrollProgress,
  TextLink,
} from "@/components/ds";

/** Stateful demos for the /design-system reference page. */
export function DesignSystemInteractive() {
  const [category, setCategory] = useState("all");

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p id="chip-label" className="text-eyebrow text-fg-subtle uppercase">
          Chip group
        </p>
        <ChipGroup
          className="mt-4"
          label="Category"
          labelledBy="chip-label"
          value={category}
          onValueChange={setCategory}
          options={[
            { value: "all", label: "All", count: 9 },
            { value: "hackathon", label: "Hackathon", count: 1 },
            { value: "speaker", label: "Speaker", count: 2 },
            { value: "elab", label: "E-Lab", count: 2 },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <Dialog>
          <DialogTrigger render={<Button variant="primary" arrow />}>
            Open dialog
          </DialogTrigger>
          <DialogContent size="md">
            <div className="p-8 md:p-10">
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription className="mt-3">
                Focus is trapped, the page behind is inert, Escape closes and
                focus returns to the trigger.
              </DialogDescription>
              <DialogClose
                render={<Button variant="outline" className="mt-8" />}
              >
                Done
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger
            render={<IconButton aria-label="Open fullscreen menu" />}
          >
            <Menu aria-hidden="true" className="size-4" />
          </DialogTrigger>
          <DialogContent variant="fullscreen" tone="ink" className="max-w-md">
            <BrandMark
              drift={false}
              className="absolute right-[-18%] bottom-[18%] -z-10 w-[85%] text-white/[0.035]"
            />
            <div className="flex min-h-lvh flex-col p-8">
              <div className="flex items-center justify-between">
                <DialogTitle>Menu</DialogTitle>
                <DialogClose render={<Button variant="secondary" />}>
                  Close
                </DialogClose>
              </div>
              <DialogDescription className="mt-3">
                `variant="fullscreen"`: a full-height sheet from the right that
                covers phones; the header menu pattern.
              </DialogDescription>
              <nav aria-label="Demo" className="mt-10 flex flex-col gap-4">
                <TextLink href="/events">Events</TextLink>
                <TextLink href="/research">Research</TextLink>
                <TextLink href="/partners">Partners</TextLink>
              </nav>
            </div>
          </DialogContent>
        </Dialog>
        <Collapsible>
          <CollapsibleTrigger
            render={<Button variant="outline" />}
            className="gap-2"
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Collapsible
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <p className="pt-4 text-fg-muted text-small">
              Panel content with a smooth height transition.
            </p>
          </CollapsiblePanel>
        </Collapsible>
      </div>
    </div>
  );
}

/** Scroll-linked demos: <Parallax> and <ScrollProgress> need a client ref. */
export function DesignSystemScrollDemo() {
  const target = useRef<HTMLDivElement>(null);
  return (
    <div ref={target} className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
      <div className="relative hidden w-px bg-hairline md:block">
        <ScrollProgress
          target={target}
          className="absolute inset-0 bg-violet-500"
        />
      </div>
      <div className="relative h-64 overflow-hidden rounded-3xl bg-sunken">
        <Parallax offset={40} className="absolute inset-x-0 top-8">
          <p className="text-center text-display-md text-fg">Parallax</p>
        </Parallax>
        <p className="absolute right-6 bottom-6 text-fg-muted text-small">
          Static under reduced motion.
        </p>
      </div>
    </div>
  );
}
