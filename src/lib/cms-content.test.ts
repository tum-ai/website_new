import { redirect } from "next/navigation";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("next-sanity", () => ({
  createClient: () => ({ fetch: mocks.fetch }),
}));
const options = {
  query: '*[_type == "siteSettings"][0]{brandMission}',
  tags: ["content:siteSettings"],
  label: "settings",
};
async function reader(env: Record<string, string | undefined> = {}) {
  vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "fixture");
  vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "redesign");
  vi.stubEnv("USE_MOCK_CMS", "");
  vi.stubEnv("VERCEL", "");
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v ?? "");
  vi.resetModules();
  return import("./cms-content");
}
beforeEach(() => {
  mocks.fetch.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
test("published fetch keeps cache tags and revalidation", async () => {
  const { fetchContent } = await reader();
  mocks.fetch.mockResolvedValue({ title: "CMS" });
  await expect(fetchContent({ ...options, revalidate: 60 })).resolves.toEqual({
    title: "CMS",
  });
  expect(mocks.fetch).toHaveBeenCalledWith(
    options.query,
    {},
    { next: { tags: options.tags, revalidate: 60 } },
  );
});
test.each([
  { NEXT_PUBLIC_SANITY_PROJECT_ID: "" },
  { NEXT_PUBLIC_SANITY_DATASET: "" },
  { NEXT_PUBLIC_SANITY_DATASET: "production" },
])("configuration fails at reader boundary", async (env) => {
  const { fetchContent } = await reader(env);
  await expect(fetchContent(options)).rejects.toThrow(/configuration/);
  expect(mocks.fetch).not.toHaveBeenCalled();
});
test("CMS outage propagates a useful failure", async () => {
  const { fetchContent } = await reader();
  mocks.fetch.mockRejectedValue(new Error("offline"));
  let failure: unknown;
  try {
    await fetchContent(options);
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(Error);
  expect((failure as Error).message).toMatch(/could not fetch/);
});
test("Next control flow survives wrapping", async () => {
  const { fetchContent } = await reader();
  let control: unknown;
  try {
    redirect("/apply");
  } catch (error) {
    control = error;
  }
  mocks.fetch.mockRejectedValue(control);
  let failure: unknown;
  try {
    await fetchContent(options);
  } catch (error) {
    failure = error;
  }
  expect(failure).toBe(control);
});
test("select owns required content validation", async () => {
  const { loadContent } = await reader();
  mocks.fetch.mockResolvedValue(null);
  await expect(
    loadContent({
      ...options,
      select: () => {
        throw new Error("required document");
      },
    }),
  ).rejects.toThrow("required document");
});
test("Vercel ignores mock flag", async () => {
  const { fetchContent } = await reader({ USE_MOCK_CMS: "1", VERCEL: "1" });
  mocks.fetch.mockResolvedValue([]);
  await expect(fetchContent(options)).resolves.toEqual([]);
  expect(mocks.fetch).toHaveBeenCalled();
});
test("local mock evaluates actual GROQ without live configuration", async () => {
  const { fetchContent } = await reader({
    USE_MOCK_CMS: "1",
    NEXT_PUBLIC_SANITY_PROJECT_ID: "",
    NEXT_PUBLIC_SANITY_DATASET: "",
  });
  await expect(fetchContent(options)).resolves.toEqual({
    brandMission: "Build and learn together.",
  });
  expect(mocks.fetch).not.toHaveBeenCalled();
});
