import { defineField, defineType } from "sanity";
import { copyString, copyText } from "./copy-fields";
import { validatePassageSpans } from "./qanda-spans";

/**
 * The /qanda page's own copy (one document, `_id` `qandaCopy`). The
 * questions are FAQ entries on the Q&A page (`faq`, collection `qanda`); the
 * short mission above the passage is the site's brand mission (site
 * settings). Read and validated by `features/qanda/content.ts`.
 */
export const qandaCopyType = defineType({
  name: "qandaCopy",
  title: "Q&A page",
  type: "document",
  fields: [
    copyString({
      name: "heroTitle",
      title: "Page title",
      description:
        "The page's headline, at display size. It should fit on two lines on a phone.",
      max: 40,
    }),
    copyString({
      name: "missionQuestion",
      title: "Mission question",
      description:
        "The heading above the mission passage; it also opens the page's FAQ in search results.",
      max: 60,
    }),
    copyText({
      name: "missionLead",
      title: "Mission lead",
      description: "One or two sentences under the mission question.",
      max: 200,
    }),
    defineField({
      name: "missionPassage",
      title: "Mission passage",
      type: "text",
      rows: 8,
      description:
        "The long mission paragraph. Each Q&A entry quotes the words of it that answer its question (its mission phrases), and the page marks them while the question is open. Editing it can break those quotes: update the passage and its phrases together. At most 900 characters.",
      validation: (Rule) => [
        Rule.required().max(900),
        Rule.custom(validatePassageSpans),
      ],
    }),
    defineField({
      name: "closing",
      title: "Closing",
      type: "object",
      validation: (Rule) => Rule.required(),
      description: "The ink band at the end of the page.",
      fields: [
        copyString({
          name: "title",
          title: "Title",
          description:
            "Display size, about 11 characters per line on a phone: keep it short.",
          max: 40,
        }),
        copyText({ name: "lead", title: "Lead", max: 160, rows: 2 }),
        copyString({
          name: "action",
          title: "Button label",
          description: "The button that writes to the general inbox.",
          max: 30,
        }),
      ],
    }),
    defineField({
      name: "forks",
      title: "Next steps",
      type: "object",
      validation: (Rule) => Rule.required(),
      description:
        "Each reader's next step, beside the closing. The companies' text is the partners page pitch, edited there.",
      fields: [
        defineField({
          name: "students",
          title: "For students",
          type: "object",
          validation: (Rule) => Rule.required(),
          fields: [
            copyString({ name: "reader", title: "Reader", max: 30 }),
            copyText({ name: "text", title: "Text", max: 200, rows: 2 }),
          ],
        }),
        defineField({
          name: "companies",
          title: "For companies",
          type: "object",
          validation: (Rule) => Rule.required(),
          fields: [copyString({ name: "reader", title: "Reader", max: 30 })],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Q&A page" }) },
});
