import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import ELab from "@/views/headerPages/e-lab/ELab";

export const metadata = buildMetadata("entrepreneurship");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("entrepreneurship")} />
      <ELab />
    </>
  );
}
