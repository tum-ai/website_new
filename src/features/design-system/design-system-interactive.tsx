"use client";

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
  TextLink,
} from "@tum.ai/ui-kit";
import { Menu, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

/** Stateful demos for the /design-system reference page. */
export function DesignSystemInteractive() {
  const [category, setCategory] = useState("all");

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p id="chip-label" className="text-eyebrow text-fg-subtle">
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
              intensity="subtle"
              className="absolute right-[-18%] bottom-[18%] -z-10 w-[85%]"
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
