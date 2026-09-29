import { type Config, defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import {
  datasetHoldsPageContent,
  sanityDataset,
  sanityProjectId,
  studioPath,
} from "../lib/sanity-config";
import {
  contentDocumentActions,
  contentTemplates,
  siteStructure,
} from "./content-structure";
import { liveSchemaTypes } from "./schemas";
import { contentSchemaTypes } from "./schemas/content";

/**
 * The Studio for `dataset` (docs/adr/0009-cms-content-source.md): one
 * workspace at `/studio` with events, partners and research, Presentation
 * for their draft previews, and, on every dataset except `production`, the
 * page content types in one desk structure (`siteStructure`).
 *
 * On `production`, the old site's dataset, the content types are not
 * registered: an editor can never create page content there, where the old
 * site renders every event, partner and research document.
 */
export function studioConfig(dataset: string): Config {
  const pageContent = datasetHoldsPageContent(dataset);
  return defineConfig({
    name: "default",
    title: "TUM.ai",
    subtitle: dataset,
    basePath: studioPath,
    projectId: sanityProjectId,
    dataset,
    schema: pageContent
      ? {
          types: [...liveSchemaTypes, ...contentSchemaTypes],
          templates: contentTemplates,
        }
      : { types: liveSchemaTypes },
    document: { actions: contentDocumentActions },
    plugins: [
      structureTool(pageContent ? { structure: siteStructure } : {}),
      presentationTool({
        previewUrl: {
          initial: "/",
          previewMode: {
            enable: "/api/draft-mode/enable",
          },
        },
      }),
    ],
  });
}

/** The embedded Studio (`/studio`) on `NEXT_PUBLIC_SANITY_DATASET`. */
export default studioConfig(sanityDataset);
