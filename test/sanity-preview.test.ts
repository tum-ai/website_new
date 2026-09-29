import { globSync } from "node:fs";
import { dirname, relative, sep } from "node:path";
import { createClient } from "next-sanity";
import { expect, test, vi } from "vitest";
import { studioConfig } from "../src/sanity/sanity.config.ts";
import { liveSchemaTypes } from "../src/sanity/schemas";
import { contentSchemaTypes } from "../src/sanity/schemas/content";

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

/** The Studio's one workspace, as the new site's dataset has it. */
function workspaceOf(dataset: string) {
  const config = studioConfig(dataset);
  if (Array.isArray(config)) throw new Error("expected one workspace");
  return config;
}

const workspace = workspaceOf("redesign");

/** Presentation previews drafts of events, partners and research. */
function presentationOptions(): PresentationOptions | undefined {
  const tools = (workspace.plugins ?? []).flatMap((plugin) =>
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

test("the Studio is served by the embedded Studio catch-all page at /studio", () => {
  const catchAll = pages
    .map(routePathOf)
    .filter((path) => /^\/studio\/\[\[\.\.\.\w+\]\]$/.test(path));
  expect(catchAll).toHaveLength(1);

  // The optional catch-all serves /studio and every path below it.
  expect(workspace.basePath).toBe("/studio");
});

/** The document type names the Studio registers on `dataset`. */
function typeNames(dataset: string): string[] {
  const types = workspaceOf(dataset).schema?.types;
  return Array.isArray(types) ? types.map((type) => type.name) : [];
}

const liveTypes = liveSchemaTypes.map(({ name }) => name);
const contentTypes = contentSchemaTypes.map(({ name }) => name);

test("the new site's dataset edits every type in one workspace", () => {
  expect(new Set(typeNames("redesign"))).toStrictEqual(
    new Set([...liveTypes, ...contentTypes]),
  );
  expect(workspaceOf("redesign").dataset).toBe("redesign");
});

test("on production the Studio registers no page content type", () => {
  expect(new Set(liveTypes)).toStrictEqual(
    new Set(["event", "partner", "research"]),
  );
  expect(contentTypes.length).toBeGreaterThan(0);
  expect(typeNames("production")).toStrictEqual(liveTypes);
});

test("the new site's Studio creates no partner documents; production's does", () => {
  const defaults = ["partner", "organization", "event"].map((schemaType) => ({
    id: schemaType,
    title: schemaType,
    schemaType,
    value: {},
  }));
  const templates = workspaceOf("redesign").schema?.templates;
  if (typeof templates !== "function") throw new Error("expected a resolver");
  const offered = templates(defaults, {} as never).map(
    ({ schemaType }) => schemaType,
  );
  expect(offered).toContain("organization");
  expect(offered).not.toContain("partner");
  // Production keeps the Studio's defaults, `partner` included.
  expect(workspaceOf("production").schema?.templates).toBeUndefined();
});

/** The field names of `type` as the Studio registers it on `dataset`. */
function fieldNames(dataset: string, type: string): string[] {
  const types = workspaceOf(dataset).schema?.types;
  const found = (Array.isArray(types) ? types : []).find(
    (candidate) => candidate.name === type,
  ) as { fields?: { name: string }[] } | undefined;
  return (found?.fields ?? []).map(({ name }) => name);
}

test("the old site's types keep their fields; organisation references only where organisations exist", () => {
  const research = fieldNames("production", "research");
  // Production has no organisation type, and the old site reads the title.
  expect(research).not.toContain("institutions");
  expect(research).toContain("title");
  // The new site's dataset adds the references and keeps every old field.
  expect(fieldNames("redesign", "research")).toStrictEqual(
    expect.arrayContaining([...research, "institutions"]),
  );
});
