import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { HomePage } from "@/features/home";

export const metadata = buildMetadata("home");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("home")} />
      <HomePage />
    </>
  );
}
