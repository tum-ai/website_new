import { afterEach, describe, expect, test, vi } from "vitest";
import { type BackfillDocument, backfillImage } from "./cms-backfill";
import {
  buildLogoListDocument,
  buildOrganizationDocument,
  getLogoLists,
  logoListId,
  organizationId,
  toOrganization,
} from "./organization-content";
import type { Organization } from "./people-and-logos";

afterEach(() => {
  vi.unstubAllEnvs();
});

function useSanityMock() {
  vi.stubEnv("CMS_CONTENT_SOURCE", "sanity");
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const logo = (src: string) => ({
  src,
  width: 100,
  height: 50,
  alt: "Logo",
  hotspot: null,
});

describe("toOrganization", () => {
  test("drops an organisation without key or name (a dangling reference)", () => {
    expect(toOrganization(null)).toBeNull();
    expect(toOrganization({ key: " ", name: "Acme" })).toBeNull();
    expect(toOrganization({ key: "acme", name: null })).toBeNull();
  });

  test("keeps a website only when it is https", () => {
    const org = (href: string) => toOrganization({ key: "a", name: "A", href });
    expect(org("https://a.example/")?.href).toBe("https://a.example/");
    expect(org("http://a.example/")?.href).toBeUndefined();
    expect(org("javascript:alert(1)")?.href).toBeUndefined();
  });

  test("leaves out empty fields and keeps set flags only", () => {
    expect(
      toOrganization({
        key: " acme ",
        name: "Acme",
        shortName: "",
        href: null,
        logo: logo("/a.svg"),
        logoSymbolOnly: false,
        logoAspectRatio: 0,
        logoOnDark: logo("/b.svg"),
        logoOnDarkSymbolOnly: true,
        logoOnDarkAspectRatio: 3.5,
      }),
    ).toStrictEqual({
      key: "acme",
      name: "Acme",
      logo: { src: "/a.svg", width: 100, height: 50, alt: "Logo" },
      logoOnDark: {
        src: "/b.svg",
        width: 100,
        height: 50,
        alt: "Logo",
        symbolOnly: true,
        aspectRatio: 3.5,
      },
    });
  });

  test("keeps short name and link", () => {
    expect(
      toOrganization({
        key: "mit",
        name: "MIT",
        shortName: "MIT",
        href: "https://mit.edu/",
        logo: null,
        logoOnDark: { src: null, width: null, height: null, alt: null },
      }),
    ).toStrictEqual({
      key: "mit",
      name: "MIT",
      shortName: "MIT",
      href: "https://mit.edu/",
    });
  });
});

const acme: Organization = {
  key: "acme",
  name: "Acme",
  href: "https://acme.test/",
  logo: {
    src: "/assets/partners/logos/meta.svg",
    width: 50,
    height: 11,
    alt: "Acme logo",
    symbolOnly: true,
    aspectRatio: 4,
  },
};
const globex: Organization = {
  key: "globex",
  name: "Globex",
  logoOnDark: {
    src: "/assets/partners/logos/cohere.svg",
    width: 118,
    height: 20,
    alt: "Globex logo",
  },
};

describe("the backfill builders", () => {
  test("an organisation document keeps the artwork flags beside the image", () => {
    expect(buildOrganizationDocument(acme)).toStrictEqual({
      _id: "organization-acme",
      _type: "organization",
      key: "acme",
      name: "Acme",
      href: "https://acme.test/",
      logo: {
        ...backfillImage("/assets/partners/logos/meta.svg", {
          alt: "Acme logo",
        }),
        symbolOnly: true,
        aspectRatio: 4,
      },
    });
  });

  test("a logo list references organisations in order under a fixed id", () => {
    expect(buildLogoListDocument("event-hosts", [globex, acme])).toStrictEqual({
      _id: logoListId("event-hosts"),
      _type: "logoList",
      surface: "event-hosts",
      organizations: [
        { _key: "globex", _type: "reference", _ref: organizationId("globex") },
        { _key: "acme", _type: "reference", _ref: organizationId("acme") },
      ],
    });
  });
});

describe("getLogoLists", () => {
  const documents = (lists: BackfillDocument[]) => () => [
    buildOrganizationDocument(acme),
    buildOrganizationDocument(globex),
    ...lists,
  ];

  test("a section's CMS list replaces its code list; a missing list keeps code", async () => {
    useSanityMock();
    const lists = await getLogoLists({
      lists: { "event-hosts": [acme], "rex-institutions": [acme] },
      label: "test",
      mockDocuments: documents([
        buildLogoListDocument("event-hosts", [globex, acme]),
      ]),
    });
    expect(lists["event-hosts"].map(({ key }) => key)).toStrictEqual([
      "globex",
      "acme",
    ]);
    expect(lists["rex-institutions"]).toStrictEqual([acme]);
  });

  test("dangling references are skipped", async () => {
    useSanityMock();
    const list = buildLogoListDocument("event-hosts", [
      { key: "gone" },
      globex,
    ]);
    const lists = await getLogoLists({
      lists: { "event-hosts": [acme] },
      label: "test",
      mockDocuments: documents([list]),
    });
    expect(lists["event-hosts"].map(({ key }) => key)).toStrictEqual([
      "globex",
    ]);
  });
});
