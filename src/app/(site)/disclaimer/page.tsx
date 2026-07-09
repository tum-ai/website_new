import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import Disclaimer from "@/views/footer/Disclaimer";

export const metadata = buildMetadata("disclaimer");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("disclaimer")} />
      <Disclaimer />
    </>
  );
}
