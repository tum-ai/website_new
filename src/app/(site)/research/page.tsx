import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ResearchPage } from "@/features/research/research-page";
import "@/features/research/research.css";
import { getSanityResearchProjects } from "@/lib/sanity";

export const metadata = buildMetadata("research");
export const revalidate = 900;

export default async function Page() {
  const projects = await getSanityResearchProjects();

  return (
    <>
      <JsonLd data={await getJsonLd("research")} />
      <ResearchPage projects={projects} />
    </>
  );
}
