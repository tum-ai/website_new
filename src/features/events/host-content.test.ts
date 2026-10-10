import { expect, test, vi } from "vitest";
import { getHostArtwork } from "./host-content";

vi.mock("@/lib/organization-content", () => ({
  getOrganizationsByKey: vi.fn(async () => []),
}));

import { getOrganizationsByKey } from "@/lib/organization-content";

test("no hosts avoids a CMS request", async () => {
  vi.mocked(getOrganizationsByKey).mockClear();
  expect(await getHostArtwork([])).toEqual({ logos: {}, icons: {} });
  expect(getOrganizationsByKey).not.toHaveBeenCalled();
});
test("host artwork comes exclusively from queried CMS organizations", async () => {
  vi.mocked(getOrganizationsByKey).mockResolvedValue([
    {
      key: "sample",
      name: "Sample",
      logoOnDark: {
        src: "/assets/fixtures/logo.svg",
        alt: "Sample",
        width: 200,
        height: 80,
      },
    },
  ]);
  expect(await getHostArtwork(["sample"])).toEqual({
    logos: { sample: { src: "/assets/fixtures/logo.svg", aspect: 2.5 } },
    icons: {},
  });
});
