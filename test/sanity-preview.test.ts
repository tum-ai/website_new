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

const workspaces = sanityConfig;
const liveWorkspace = workspaces.find(({ name }) => name === "live");

/** Presentation runs in the live workspace (drafts of the live dataset). */
function presentationOptions(): PresentationOptions | undefined {
  const tools = (liveWorkspace?.plugins ?? []).flatMap((plugin) =>
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

test("every Studio workspace is served by the embedded Studio catch-all page", () => {
  const catchAll = pages
    .map(routePathOf)
    .filter((path) => /^\/studio\/\[\[\.\.\.\w+\]\]$/.test(path));
  expect(catchAll).toHaveLength(1);

  // The optional catch-all serves /studio and every path below it.
  for (const { name, basePath } of workspaces) {
    expect(basePath, name).toMatch(/^\/studio\/[a-z-]+$/);
  }
});

/** The document type names a workspace registers. */
function typeNames(workspace: string): string[] {
  const types = workspaces.find(({ name }) => name === workspace)?.schema
    ?.types;
  return Array.isArray(types) ? types.map((type) => type.name) : [];
}

test("the content workspace never edits the live dataset's types", () => {
  const liveTypes = typeNames("live");
  expect(new Set(liveTypes)).toStrictEqual(
    new Set(["event", "partner", "research"]),
  );

  const contentTypes = typeNames("content");
  expect(contentTypes.length).toBeGreaterThan(0);
  expect(contentTypes.filter((type) => liveTypes.includes(type))).toStrictEqual(
    [],
  );
});
