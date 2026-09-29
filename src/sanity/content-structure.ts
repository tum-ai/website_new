import type { DocumentActionComponent, Template } from "sanity";
import type { StructureResolver } from "sanity/structure";
import { contentSingletons } from "./schemas/content";
import { faqCollections } from "./schemas/content/faq";

const singletonTypes = new Set(contentSingletons.map(({ type }) => type));

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
 * FAQs grouped by page and sorted as the page shows them, then every other
 * type as a plain list.
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
        return id !== "faq" && !(id && singletonTypes.has(id));
      }),
    ]);

/** Initial-value templates: no "new" for singletons, plus the FAQ one. */
export function contentTemplates(templates: Template[]): Template[] {
  return [
    ...templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
    faqInCollectionTemplate,
  ];
}

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

/** Singletons can be published and reverted, never duplicated or deleted. */
export function contentDocumentActions(
  actions: DocumentActionComponent[],
  { schemaType }: { schemaType: string },
): DocumentActionComponent[] {
  return singletonTypes.has(schemaType)
    ? actions.filter(({ action }) => action && singletonActions.has(action))
    : actions;
}
