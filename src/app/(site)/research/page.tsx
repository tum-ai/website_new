import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { ResearchPage } from "@/features/research/research-page";
import {
  getSanityResearchPartners,
  getSanityResearchProjects,
} from "@/lib/sanity";
import type { Research, ResearchProject } from "@/lib/types";

export const metadata = buildMetadata("research");
export const revalidate = 900;

/**
 * @deprecated The research card still splits a comma-separated string. Pass
 * the projects through unchanged once it takes `keywords: string[]`.
 */
function joinKeywords(project: ResearchProject): Research {
  return { ...project, keywords: project.keywords.join(", ") };
}

export default async function Page() {
  const [projects, researchPartners] = await Promise.all([
    getSanityResearchProjects(),
    getSanityResearchPartners(),
  ]);

  return (
    <>
      <JsonLd data={getJsonLd("research")} />
      <ResearchPage
        initialProjects={projects.map(joinKeywords)}
        researchPartners={researchPartners}
      />
    </>
  );
}
