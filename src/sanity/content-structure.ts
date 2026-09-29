import type { DocumentActionComponent, Template } from "sanity";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import {
  logoListDocumentId,
  logoListSurfaces,
  personPlacements,
} from "../lib/people-and-logos";
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
      ...logosAndPeopleItems(S),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return (
          id !== "faq" &&
          !(id && singletonTypes.has(id)) &&
          !(id && logosAndPeopleTypes.has(id))
        );
      }),
    ]);

/** Initial-value templates: no "new" for singletons, plus the FAQ one. */
export function contentTemplates(templates: Template[]): Template[] {
  return [
    ...templates.filter(
      ({ schemaType }) =>
        !singletonTypes.has(schemaType) &&
        !logosAndPeopleFixedTypes.has(schemaType),
    ),
    faqInCollectionTemplate,
    personInPlacementTemplate,
  ];
}

const singletonActions = new Set(["publish", "discardChanges", "restore"]);

/** Singletons can be published and reverted, never duplicated or deleted. */
export function contentDocumentActions(
  actions: DocumentActionComponent[],
  { schemaType }: { schemaType: string },
): DocumentActionComponent[] {
  return singletonTypes.has(schemaType) ||
    logosAndPeopleFixedTypes.has(schemaType)
    ? actions.filter(({ action }) => action && singletonActions.has(action))
    : actions;
}

// Phase 3: logos and people (stream B). Organisations, the per-section logo
// lists (fixed ids, like singletons), people by page and the partner case
// studies, grouped under one entry. Everything this phase adds to the
// structure is in this block and the four hooks above.

/** Logo lists have fixed ids: no "new", duplicate or delete. */
const logosAndPeopleFixedTypes = new Set(["logoList"]);

/** Types this block lists, left out of the plain type lists. */
const logosAndPeopleTypes = new Set([
  "organization",
  "logoList",
  "person",
  "caseStudy",
]);

/**
 * The logo lists the Studio opens by id; the backfill creates exactly these
 * (`logoListDocumentId`), so editors never edit an empty twin.
 */
export const logoListPinnedDocuments: readonly { id: string; type: string }[] =
  logoListSurfaces.map(({ value }) => ({
    id: logoListDocumentId(value),
    type: "logoList",
  }));

/** The one template that creates a person on a given page. */
const personInPlacementTemplate: Template = {
  id: "person-in-placement",
  title: "Person on a page",
  schemaType: "person",
  parameters: [{ name: "placement", type: "string" }],
  value: ({ placement }: { placement: string }) => ({ placement }),
};

/** "Logos and people": organisations, logo lists, people and case studies. */
function logosAndPeopleItems(S: StructureBuilder) {
  return [
    S.listItem()
      .id("logos-and-people")
      .title("Logos and people")
      .child(
        S.list()
          .title("Logos and people")
          .items([
            S.listItem()
              .id("organization")
              .title("Organisations")
              .schemaType("organization")
              .child(
                S.documentTypeList("organization")
                  .title("Organisations")
                  .defaultOrdering([{ field: "name", direction: "asc" }]),
              ),
            S.listItem()
              .id("logoList")
              .title("Logo lists")
              .schemaType("logoList")
              .child(
                S.list()
                  .title("Logo lists by section")
                  .items(
                    logoListSurfaces.map(({ value, title }) =>
                      S.listItem()
                        .id(logoListDocumentId(value))
                        .title(title)
                        .child(
                          S.document()
                            .schemaType("logoList")
                            .documentId(logoListDocumentId(value))
                            .title(title),
                        ),
                    ),
                  ),
              ),
            S.listItem()
              .id("person")
              .title("People")
              .schemaType("person")
              .child(
                S.list()
                  .title("People by page")
                  .items(
                    personPlacements.map(({ value, title }) =>
                      S.listItem()
                        .id(`person-${value}`)
                        .title(title)
                        .child(
                          S.documentList()
                            .id(`person-${value}-list`)
                            .title(title)
                            .schemaType("person")
                            .filter(
                              '_type == "person" && placement == $placement',
                            )
                            .params({ placement: value })
                            .defaultOrdering([
                              { field: "order", direction: "asc" },
                            ])
                            .initialValueTemplates([
                              S.initialValueTemplateItem(
                                personInPlacementTemplate.id,
                                { placement: value },
                              ),
                            ]),
                        ),
                    ),
                  ),
              ),
            S.listItem()
              .id("caseStudy")
              .title("Partner case studies")
              .schemaType("caseStudy")
              .child(
                S.documentTypeList("caseStudy")
                  .title("Partner case studies")
                  .defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
          ]),
      ),
  ];
}
