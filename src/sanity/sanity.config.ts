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
import { liveTypesWithReferences } from "./schemas/content/live-references";

/**
 * The Studio for `dataset` (docs/adr/0009-cms-content-source.md): one
 * workspace at `/studio` with events, partners and research, Presentation
 * for their draft previews, and, on every dataset except `production`, the
 * page content types in one desk structure (`siteStructure`).
 *
 * On `production`, the old site's dataset, the content types are not
 * registered: an editor can never create page content there, where the old
 * site renders every event, partner and research document, and partners
 * are the `partner` documents. There the events and research have only
 * their old fields; everywhere else they also reference organisations
 * (`liveTypesWithReferences`). Everywhere else partners are organisations
 * with a partner tier: `partner` stays registered (its copied documents
 * remain readable) but the desk hides it and offers no way to create one.
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
          types: [...liveTypesWithReferences, ...contentSchemaTypes],
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
