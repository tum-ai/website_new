"use client";

import { useEffect, useState } from "react";
import type { Partner } from "@/lib/types";
import PartnerRotationGrid from "./PartnerRotationGrid";

export default function PartnerSupporters({
  partners,
}: {
  partners: Partner[];
}) {
  const [columns, setColumns] = useState(6);
  useEffect(() => {
    // Match the existing compact-grid breakpoints; each viewport keeps three rows.
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
      className="partner-supporters"
      aria-labelledby="partner-supporters-title"
    >
      <h3 id="partner-supporters-title">Supporters of the vision</h3>
      <PartnerRotationGrid
        key={columns}
        partners={partners}
        capacity={columns * 3}
        batchSize={columns}
        offset={600}
        compact
        className="partner-supporter-grid"
      />
    </section>
  );
}
