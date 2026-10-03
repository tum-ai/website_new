"use client";

import { useEffect, useState } from "react";
import type { Partner } from "@/lib/types";
import { PartnerRotationGrid } from "./partner-rotation-grid";

/**
 * Columns of `.partner-supporter-grid` per media query (partners.css), widest
 * first: Tailwind's `lg`, `md` and `sm`, and three below that.
 */
const columnQueries = [
  { query: "(width >= 64rem)", columns: 6 },
  { query: "(width >= 48rem)", columns: 5 },
  { query: "(width >= 40rem)", columns: 4 },
] as const;

/** The supporter board: three rows of small tiles that rotate a row at a time. */
export function PartnerSupporters({
  partners,
  title,
}: {
  partners: Partner[];
  /** The board's heading, from the page copy. */
  title: string;
}) {
  const [columns, setColumns] = useState(6);
  useEffect(() => {
    const queries = columnQueries.map((entry) => ({
      media: window.matchMedia(entry.query),
      columns: entry.columns,
    }));
    const update = () =>
      setColumns(queries.find(({ media }) => media.matches)?.columns ?? 3);
    update();
    for (const { media } of queries) media.addEventListener("change", update);
    return () => {
      for (const { media } of queries)
        media.removeEventListener("change", update);
    };
  }, []);
  if (!partners.length) return null;
  return (
    <section
      className="mt-16 border-hairline border-t pt-10 md:mt-20 md:pt-12"
      aria-labelledby="partner-supporters-title"
    >
      <h3
        id="partner-supporters-title"
        className="mb-6 text-fg-muted text-heading-md md:mb-8"
      >
        {title}
      </h3>
      <PartnerRotationGrid
        key={columns}
        partners={partners}
        capacity={columns * 3}
        batchSize={columns}
        offset={600}
        size="sm"
        className="partner-supporter-grid"
      />
    </section>
  );
}
