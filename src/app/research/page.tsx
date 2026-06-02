import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { getSanityResearchProjects } from "@/lib/sanity";
import Research from "@/views/headerPages/Research";

export const metadata = buildMetadata("research");
export const revalidate = 900;

export default async function Page() {
  const projects = await getSanityResearchProjects();

  return (
    <>
      <JsonLd data={getJsonLd("research")} />
      <Research initialProjects={projects} />
    </>
  );
}