import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ProjectsPage } from "@/features/projects/projects-page";
import "@/features/projects/projects.css";

export const metadata = buildMetadata("projects");

export default async function Page() {
  return (
    <>
      <JsonLd data={await getJsonLd("projects")} />
      <ProjectsPage />
    </>
  );
}
