import { afterEach, describe, expect, test, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

async function loadConfig(dataset: string) {
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", dataset);
  vi.resetModules();
  return import("./sanity-config");
}

describe("the site's dataset", () => {
  test("defaults to production, the old site's dataset", async () => {
    const config = await loadConfig("");
    expect(config.sanityDataset).toBe("production");
    expect(config.hasPageContent).toBe(false);
  });

  test("the new site's dataset holds the page content", async () => {
    const config = await loadConfig("redesign");
    expect(config.sanityDataset).toBe("redesign");
    expect(config.hasPageContent).toBe(true);
    expect(config.sanityClientConfig).toMatchObject({
      dataset: "redesign",
      perspective: "published",
    });
  });
});

test("page content goes to every dataset but production", async () => {
  const { datasetHoldsPageContent } = await loadConfig("");
  expect(datasetHoldsPageContent("production")).toBe(false);
  expect(datasetHoldsPageContent(" production ")).toBe(false);
  expect(datasetHoldsPageContent("redesign")).toBe(true);
  expect(datasetHoldsPageContent("staging")).toBe(true);
});
