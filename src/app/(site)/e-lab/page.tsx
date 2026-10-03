import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ELabPage } from "@/features/e-lab/e-lab-page";
// Page CSS loads from the route: a CSS import inside a feature would keep
// that module in every page that imports the feature.
import "@/features/e-lab/e-lab.css";

export const metadata = buildMetadata("entrepreneurship");

/* The application phase is decided at render time (see config/e-lab.ts), so
 * the page regenerates every 5 minutes and its HTML follows the deadline. */
export const revalidate = 300;

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("entrepreneurship")} />
      <ELabPage />
    </>
  );
}
