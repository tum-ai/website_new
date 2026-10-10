import { expect, test } from "vitest";
import { evaluateMockQuery, getMockContentDocuments } from "./cms-content-mock";
import { CONTENT_IMAGE_PROJECTION, toContentImage } from "./cms-content-model";

test("real GROQ resolves synthetic references and image metadata", async () => {
  const docs = [
    {
      _id: "asset",
      _type: "sanity.imageAsset",
      url: "/assets/fixtures/logo.svg",
      metadata: { dimensions: { width: 200, height: 80 } },
    },
    {
      _id: "org",
      _type: "organization",
      key: "example",
      name: "Example",
      logo: {
        _type: "image",
        asset: { _type: "reference", _ref: "asset" },
        alt: "Example logo",
      },
    },
    {
      _id: "list",
      _type: "logoList",
      organizations: [{ _type: "reference", _ref: "org" }],
    },
  ];
  const result = await evaluateMockQuery<
    { name: string; logo: Parameters<typeof toContentImage>[0] }[]
  >(
    `*[_type == "logoList"][0].organizations[]->{name,"logo":logo${CONTENT_IMAGE_PROJECTION}}`,
    {},
    docs,
  );
  expect(result[0].name).toBe("Example");
  expect(toContentImage(result[0].logo)).toStrictEqual({
    src: "/assets/fixtures/logo.svg",
    width: 200,
    height: 80,
    alt: "Example logo",
  });
});

test("query parameters and intentional absence are preserved", async () => {
  expect(
    await evaluateMockQuery(
      "*[_type == $type]",
      { type: "absent" },
      getMockContentDocuments(),
    ),
  ).toStrictEqual([]);
});

test("aggregate documents have unique stable IDs", () => {
  const docs = getMockContentDocuments();
  expect(new Set(docs.map(({ _id }) => _id)).size).toBe(docs.length);
});
