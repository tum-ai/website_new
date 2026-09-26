import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { HomePage } from "@/features/home/home-page";
// Page CSS loads from the route: a CSS import inside a feature would keep
// that module in every page that imports the feature.
import "@/features/home/home.css";

export const metadata = buildMetadata("home");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("home")} />
      <HomePage />
    </>
  );
}
