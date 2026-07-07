import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import Homepage from "@/views/Homepage";

export const metadata = buildMetadata("home");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("home")} />
      <Homepage />
    </>
  );
}
