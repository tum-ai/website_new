import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ProjectsPage } from "@/features/projects/projects-page";

export const metadata = buildMetadata("projects");

export default function Page() {
  return (
    <>
      <JsonLd data={getJsonLd("projects")} />
      <ProjectsPage />
    </>
  );
}
