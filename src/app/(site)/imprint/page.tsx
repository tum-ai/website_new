import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import Imprint from "@/views/footer/Imprint";

export const metadata = buildMetadata("imprint");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("imprint")} />
      <Imprint />
    </>
  );
}
