import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import Community from "@/views/headerPages/Community";

export const metadata = buildMetadata("community");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("community")} />
      <Community />
    </>
  );
}
