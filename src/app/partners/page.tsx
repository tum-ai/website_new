import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import Partners from "@/views/headerPages/Partners";

export const metadata = buildMetadata("partners");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("partners")} />
      <Partners />
    </>
  );
}
