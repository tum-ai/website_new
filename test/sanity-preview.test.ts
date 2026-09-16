import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sanityConfig = readFileSync(
  new URL("../src/sanity/sanity.config.ts", import.meta.url),
  "utf8",
);
const draftModeRoute = readFileSync(
  new URL("../src/app/api/draft-mode/enable/route.ts", import.meta.url),
  "utf8",
);
const appLayout = readFileSync(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8",
);
const siteLayout = readFileSync(
  new URL("../src/app/(site)/layout.tsx", import.meta.url),
  "utf8",
);
const studioLayout = readFileSync(
  new URL("../src/app/studio/[[...tool]]/layout.tsx", import.meta.url),
  "utf8",
);

test("Sanity Studio presentation can enable website draft mode", () => {
  assert.match(sanityConfig, /presentationTool/);
  assert.match(sanityConfig, /enable:\s*"\/api\/draft-mode\/enable"/);
  assert.match(draftModeRoute, /defineEnableDraftMode/);
  assert.match(draftModeRoute, /SANITY_API_READ_TOKEN/);
});

test("public site layout wires Sanity live preview for draft sessions", () => {
  assert.match(siteLayout, /SanityLive/);
  assert.match(siteLayout, /includeDrafts={isDraftMode}/);
  assert.match(siteLayout, /VisualEditing/);
});

test("Sanity Studio is isolated from the public website shell", () => {
  assert.doesNotMatch(appLayout, /Header|Footer|SanityLive|VisualEditing/);
  assert.doesNotMatch(studioLayout, /Header|Footer|SanityLive|VisualEditing/);
});
