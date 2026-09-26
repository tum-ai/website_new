"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Button,
  ChipGroup,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ds";

/** Stateful demos for the /design-system reference page. */
export function DesignSystemInteractive() {
  const [category, setCategory] = useState("all");

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="text-eyebrow text-fg-subtle uppercase">Chip group</p>
        <ChipGroup
          className="mt-4"
          label="Category"
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
                Focus is trapped, Escape closes, focus returns to the trigger.
              </DialogDescription>
            </div>
          </DialogContent>
        </Dialog>
        <Collapsible>
          <CollapsibleTrigger
            render={<Button variant="outline" />}
            className="gap-2"
          >
            <SlidersHorizontal aria-hidden className="size-4" />
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
