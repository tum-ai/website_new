import { defineConfig, type WorkspaceOptions } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import {
  sanityContentDataset,
  sanityDataset,
  sanityProjectId,
  studioPaths,
} from "../lib/sanity-config";
import {
  contentDocumentActions,
  contentStructure,
  contentTemplates,
} from "./content-structure";
import { liveSchemaTypes } from "./schemas";
import { contentSchemaTypes } from "./schemas/content";

/**
 * The Studio's workspaces (docs/adr/0009-cms-content-source.md):
 *
 * - `live` edits events, partners and research in the live dataset, with
 *   Presentation for draft previews. The old site renders these documents
 *   too, so this workspace never gets new types.
 * - `content` edits the page content types in `contentDataset`
 *   (`NEXT_PUBLIC_SANITY_CONTENT_DATASET`), published only (no Presentation
 *   or draft preview yet). Without a content dataset (`null`: unset, or
 *   naming the live dataset) the workspace does not exist, so an editor can
 *   never publish page content into the live dataset.
 *
 * Sanity requires workspace base paths with the same number of segments, so
 * both sit one level below `/studio`, which redirects to the first one.
 */
export function studioWorkspaces(
  contentDataset: string | null,
): WorkspaceOptions[] {
  const live: WorkspaceOptions = {
    name: "live",
    title: "Events, partners and research",
    subtitle: sanityDataset,
    basePath: studioPaths.live,
    projectId: sanityProjectId,
    dataset: sanityDataset,
    schema: { types: liveSchemaTypes },
    plugins: [
      structureTool(),
      presentationTool({
        previewUrl: {
          initial: "/",
          previewMode: {
            enable: "/api/draft-mode/enable",
          },
        },
      }),
    ],
  };
  if (!contentDataset) return [live];
  return [
    live,
    {
      name: "content",
      title: "Site content",
      subtitle: contentDataset,
      basePath: studioPaths.content,
      projectId: sanityProjectId,
      dataset: contentDataset,
      schema: { types: contentSchemaTypes, templates: contentTemplates },
      document: { actions: contentDocumentActions },
      plugins: [structureTool({ structure: contentStructure })],
    },
  ];
}

/** The embedded Studio (`/studio`); see {@link studioWorkspaces}. */
export default defineConfig(studioWorkspaces(sanityContentDataset));
