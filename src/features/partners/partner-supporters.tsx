"use client";

import { useEffect, useState } from "react";
import type { Partner } from "@/lib/types";
import { PartnerRotationGrid } from "./partner-rotation-grid";

export function PartnerSupporters({ partners }: { partners: Partner[] }) {
  const [columns, setColumns] = useState(6);
  useEffect(() => {
    // Match the `.partner-supporter-grid` breakpoints in partners.css; each viewport keeps three rows.
    const queries = [600, 850, 1100].map((width) =>
      window.matchMedia(`(max-width: ${width}px)`),
    );
    const update = () =>
      setColumns(
        queries[0].matches
          ? 3
          : queries[1].matches
            ? 4
            : queries[2].matches
              ? 5
              : 6,
      );
    update();
    for (const query of queries) query.addEventListener("change", update);
    return () => {
      for (const query of queries) query.removeEventListener("change", update);
    };
  }, []);
  if (!partners.length) return null;
  return (
    <section
      className="mt-16 border-t border-hairline pt-10 md:mt-20 md:pt-12"
      aria-labelledby="partner-supporters-title"
    >
      <h3
        id="partner-supporters-title"
        className="mb-6 text-heading-md text-fg-muted md:mb-8"
      >
        Supporters of the vision
      </h3>
      <PartnerRotationGrid
        key={columns}
        partners={partners}
        capacity={columns * 3}
        batchSize={columns}
        offset={600}
        size="compact"
        className="partner-supporter-grid"
      />
    </section>
  );
}
