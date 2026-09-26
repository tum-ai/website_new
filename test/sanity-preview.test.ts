import { globSync } from "node:fs";
import { dirname, relative, sep } from "node:path";
import { createClient } from "next-sanity";
import { expect, test, vi } from "vitest";
import sanityConfig from "../src/sanity/sanity.config.ts";

// The route handler reads the shared client; the real module also defines
// Sanity Live, which only loads under the react-server runtime.
vi.mock("@/lib/sanity", () => ({
  client: createClient({
    projectId: "test-project-id",
    dataset: "production",
    apiVersion: "2024-03-01",
    useCdn: false,
  }),
}));

const appDir = new URL("../src/app/", import.meta.url).pathname;

/** URL path an App Router file serves, ignoring route groups like `(site)`. */
function routePathOf(file: string) {
  const segments = relative(appDir, dirname(file))
    .split(sep)
    .filter((segment) => segment && !/^\(.+\)$/.test(segment));
  return `/${segments.join("/")}`;
}

const routeHandlers = globSync(`${appDir}**/route.{ts,tsx}`);
const pages = globSync(`${appDir}**/page.{ts,tsx}`);

type PresentationOptions = {
  previewUrl?: { initial?: string; previewMode?: { enable?: string } };
};

function presentationOptions(): PresentationOptions | undefined {
  const tools = (sanityConfig.plugins ?? []).flatMap((plugin) =>
    typeof plugin === "object" &&
    "tools" in plugin &&
    Array.isArray(plugin.tools)
      ? plugin.tools
      : [],
  );
  return tools.find((tool) => tool.name === "presentation")?.options;
}

test("Studio Presentation enables draft mode through an existing route handler", async () => {
  const enablePath = presentationOptions()?.previewUrl?.previewMode?.enable;
  expect(
    enablePath,
    "Presentation tool has no draft-mode enable path",
  ).toBeTypeOf("string");

  const handler = routeHandlers.find(
    (file) => routePathOf(file) === enablePath,
  );
  expect(handler, `no route handler serves ${enablePath}`).toBeDefined();

  const route = await import(/* @vite-ignore */ handler as string);
  expect(route.GET).toBeTypeOf("function");
});

test("Studio basePath is served by the embedded Studio catch-all page", () => {
  const studioPages = pages
    .map(routePathOf)
    .filter((path) => path.startsWith(`${sanityConfig.basePath}/`));

  expect(studioPages).toStrictEqual([
    expect.stringMatching(/^\/studio\/\[\[\.\.\.\w+\]\]$/),
  ]);
});
