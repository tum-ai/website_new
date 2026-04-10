import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { getResearchProjects } from "@/lib/notion";
import Research from "@/views/headerPages/Research";

export const metadata = buildMetadata("research");
export const dynamic = "force-dynamic";

export default async function Page() {
  const projects = await getResearchProjects();

  return (
    <>
      <JsonLd data={getJsonLd("research")} />
      <Research initialProjects={projects} />
    </>
  );
}
