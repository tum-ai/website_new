import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import Projects from "@/views/headerPages/Projects";

export const metadata = buildMetadata("projects");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("projects")} />
      <Projects />
    </>
  );
}
