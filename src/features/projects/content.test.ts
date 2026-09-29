import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { organizationByKey } from "@/features/partners";
import { buildOrganizationBackfill } from "@/features/partners/server";
import { fetchContent } from "@/lib/cms-content";
import { fillCodeCopy } from "@/lib/content-copy";
import type { PROJECTS_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  buildProjectsBackfill,
  getProjectsContent,
  PROJECTS_CONTENT_QUERY,
} from "./content";
import { projectsCopyTemplate, projectsPageTokens } from "./data/copy";
import { taskForces, taskForceTemplates } from "./data/projects";

/**
 * Parity: the backfill documents, read back through the real GROQ query
 * under the mock CMS, render exactly what the code renders.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const code = {
  copy: fillCodeCopy(projectsCopyTemplate, contentTokens, projectsPageTokens),
  taskForces,
};

describe("the /projects content slice", () => {
  test("code source: the code copy and task forces", async () => {
    useSource("code");
    await expect(getProjectsContent()).resolves.toStrictEqual(code);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<PROJECTS_CONTENT_QUERY_RESULT>({
      query: PROJECTS_CONTENT_QUERY,
      tags: [],
      mockDocuments: buildProjectsBackfill,
      label: "parity",
    });
    expect(result?.copy?.hero?.title).toBe(projectsCopyTemplate.hero.title);
    expect(result?.taskForces.map(({ slug }) => slug)).toStrictEqual(
      taskForces.map(({ slug }) => slug),
    );
  });

  test("sanity source over the backfill: the same copy and task forces", async () => {
    useSource("sanity");
    await expect(getProjectsContent()).resolves.toStrictEqual(code);
  });

  test("a task force's partner is its organisation, shown by name", async () => {
    useSource("sanity");
    const query = (withOrganizations: boolean) =>
      fetchContent<PROJECTS_CONTENT_QUERY_RESULT>({
        query: PROJECTS_CONTENT_QUERY,
        tags: [],
        mockDocuments: () => [
          ...buildProjectsBackfill(),
          ...(withOrganizations ? buildOrganizationBackfill() : []),
        ],
        label: "partner",
      });
    const template = taskForceTemplates.find(({ work }) => work);
    if (!template?.work) throw new Error("a task force names a partner");
    const partnerOf = (result: PROJECTS_CONTENT_QUERY_RESULT | null) =>
      result?.taskForces.find(({ slug }) => slug === template.slug)?.work
        ?.partner;
    expect(partnerOf(await query(true))).toBe(
      organizationByKey(template.work.partner).name,
    );
    // A reference that resolves to nothing names no partner.
    expect(partnerOf(await query(false))).toBeNull();
  });

  test("the backfill holds the copy and one document per task force", () => {
    const documents = buildProjectsBackfill();
    expect(
      documents.filter(({ _type }) => _type === "projectsCopy"),
    ).toHaveLength(1);
    expect(documents.filter(({ _type }) => _type === "taskForce")).toHaveLength(
      taskForces.length,
    );
  });
});
