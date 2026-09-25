import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ProjectsPage } from "@/features/projects";

export const metadata = buildMetadata("projects");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("projects")} />
      <ProjectsPage />
    </>
  );
}
