import type { DocumentActionComponent, Template } from "sanity";
import type { StructureResolver } from "sanity/structure";
import { contentSingletons } from "./schemas/content";
import { applicationPrograms } from "./schemas/content/application-window";
import { faqCollections } from "./schemas/content/faq";

const singletonTypes = new Set(contentSingletons.map(({ type }) => type));

/**
 * The documents the structure opens by id: the singletons (id = type) and
 * each program's application window. The backfill must create exactly
 * these ids (`test/cms-backfill.test.ts`), or editors would edit an empty
 * document beside the imported one.
 */
export const pinnedDocuments: readonly { id: string; type: string }[] = [
  ...contentSingletons.map(({ type }) => ({ id: type, type })),
  ...applicationPrograms.map(({ documentId }) => ({
    id: documentId,
    type: "applicationWindow",
  })),
];

/**
 * Types whose documents are fixed: singletons, and the application windows
 * (one pinned document per program). Editors change them in place; they
 * cannot create, duplicate or delete them.
 */
const fixedTypes = new Set([...singletonTypes, "applicationWindow"]);

/** Types with their own entry in the structure, left out of the plain lists. */
const structuredTypes = new Set([...fixedTypes, "faq", "campaign"]);

/** The one template that creates a FAQ entry in a given page's collection. */
const faqInCollectionTemplate: Template = {
  id: "faq-in-collection",
  title: "FAQ entry on a page",
  schemaType: "faq",
  parameters: [{ name: "collection", type: "string" }],
  value: ({ collection }: { collection: string }) => ({ collection }),
};

/**
 * The content workspace's desk: singletons first (one fixed document each),
 * then the dated content (the application window of each program, pinned,
 * and the campaigns, latest first), FAQs grouped by page and sorted as the
 * page shows them, then every other type as a plain list.
 */
export const contentStructure: StructureResolver = (S) =>
  S.list()
    .title("Site content")
    .items([
      ...contentSingletons.map(({ type, title }) =>
        S.listItem()
          .id(type)
          .title(title)
          .child(S.document().schemaType(type).documentId(type).title(title)),
      ),
      S.divider(),
      S.listItem()
        .id("applicationWindow")
        .title("Application windows")
        .child(
          S.list()
            .title("Application windows")
            .items(
              applicationPrograms.map(({ title, documentId }) =>
                S.listItem()
                  .id(documentId)
                  .title(title)
                  .child(
                    S.document()
                      .schemaType("applicationWindow")
                      .documentId(documentId)
                      .title(title),
                  ),
              ),
            ),
        ),
      S.listItem()
        .id("campaign")
        .title("Campaigns")
        .child(
          S.documentTypeList("campaign")
            .title("Campaigns, latest first")
            .defaultOrdering([
              { field: "startDate", direction: "desc" },
              { field: "startTime", direction: "desc" },
            ]),
        ),
      S.divider(),
      S.listItem()
        .id("faq")
        .title("FAQs")
        .child(
          S.list()
            .title("FAQs by page")
            .items(
              faqCollections.map(({ title, value }) =>
                S.listItem()
                  .id(`faq-${value}`)
                  .title(title)
                  .child(
                    S.documentList()
                      .id(`faq-${value}-list`)
                      .title(title)
                      .schemaType("faq")
                      .filter('_type == "faq" && collection == $collection')
                      .params({ collection: value })
                      .defaultOrdering([{ field: "order", direction: "asc" }])
                      .initialValueTemplates([
                        S.initialValueTemplateItem(faqInCollectionTemplate.id, {
                          collection: value,
                        }),
                      ]),
                  ),
              ),
            ),
        ),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return !(id && structuredTypes.has(id));
      }),
    ]);

/** Initial-value templates: no "new" for fixed types, plus the FAQ one. */
export function contentTemplates(templates: Template[]): Template[] {
  return [
    ...templates.filter(({ schemaType }) => !fixedTypes.has(schemaType)),
    faqInCollectionTemplate,
  ];
}

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

/** Fixed documents can be published and reverted, never duplicated or deleted. */
export function contentDocumentActions(
  actions: DocumentActionComponent[],
  { schemaType }: { schemaType: string },
): DocumentActionComponent[] {
  return fixedTypes.has(schemaType)
    ? actions.filter(({ action }) => action && singletonActions.has(action))
    : actions;
}
