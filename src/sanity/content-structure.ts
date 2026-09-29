import type { DocumentActionComponent, Template } from "sanity";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import {
  logoListDocumentId,
  logoListSurfaces,
  personPlacements,
} from "../lib/people-and-logos";
import { contentSingletons } from "./schemas/content";
import { applicationPrograms } from "./schemas/content/application-window";
import { faqCollections } from "./schemas/content/faq";

const singletonTypes = new Set(contentSingletons.map(({ type }) => type));

/**
 * The documents the structure opens by id: the singletons (id = type),
 * each program's application window and each section's logo list. The backfill must create exactly
 * these ids (`test/cms-backfill.test.ts`), or editors would edit an empty
 * document beside the imported one.
 */
export const pinnedDocuments: readonly { id: string; type: string }[] = [
  ...contentSingletons.map(({ type }) => ({ id: type, type })),
  ...applicationPrograms.map(({ documentId }) => ({
    id: documentId,
    type: "applicationWindow",
  })),
  ...logoListSurfaces.map(({ value }) => ({
    id: logoListDocumentId(value),
    type: "logoList",
  })),
];

/**
 * Types whose documents are fixed: singletons, the application windows
 * (one pinned document per program) and the logo lists (one per section). Editors change them in place; they
 * cannot create, duplicate or delete them.
 */
const fixedTypes = new Set([
  ...singletonTypes,
  "applicationWindow",
  "logoList",
]);

/** Types with their own entry in the structure, left out of the plain lists. */
const structuredTypes = new Set([
  ...fixedTypes,
  "event",
  "partner",
  "research",
  "faq",
  "campaign",
  "organization",
  "person",
  "caseStudy",
]);

/** The one template that creates a FAQ entry in a given page's collection. */
const faqInCollectionTemplate: Template = {
  id: "faq-in-collection",
  title: "FAQ entry on a page",
  schemaType: "faq",
  parameters: [{ name: "collection", type: "string" }],
  value: ({ collection }: { collection: string }) => ({ collection }),
};

/**
 * The Studio's desk on a dataset with page content (everything but
 * `production`): the old site's types first (events latest first, partners,
 * research projects), then the singletons (one fixed document each), the
 * dated content (the application window of each program, pinned, and the
 * campaigns, latest first), FAQs grouped by page and sorted as the page
 * shows them, logos and people, then every other type as a plain list.
 */
export const siteStructure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...liveItems(S),
      S.divider(),
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
      ...logosAndPeopleItems(S),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return !(id && structuredTypes.has(id));
      }),
    ]);

/** Events, partners and research: the types the old site also has. */
function liveItems(S: StructureBuilder) {
  return [
    S.listItem()
      .id("event")
      .title("Events")
      .schemaType("event")
      .child(
        S.documentTypeList("event")
          .title("Events, latest first")
          .defaultOrdering([{ field: "event_date", direction: "desc" }]),
      ),
    S.documentTypeListItem("partner").title("Partners"),
    S.documentTypeListItem("research").title("Research projects"),
  ];
}

/** Initial-value templates: no "new" for fixed types, plus the FAQ one. */
export function contentTemplates(templates: Template[]): Template[] {
  return [
    ...templates.filter(({ schemaType }) => !fixedTypes.has(schemaType)),
    faqInCollectionTemplate,
    personInPlacementTemplate,
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

// Phase 3: logos and people (stream B). Organisations, the per-section logo
// lists (fixed ids, like singletons), people by page and the partner case
// studies, grouped under one entry. Everything this phase adds to the
// structure is in this block and the four hooks above.

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
