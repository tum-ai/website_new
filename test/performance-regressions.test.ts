import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("shared shell avoids heavy modal and animation libraries", () => {
  const headerSource = readFileSync(
    new URL("../src/components/Header.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(headerSource, /framer-motion/);
  assert.doesNotMatch(headerSource, /@radix-ui\/react-dialog/);
});

test("homepage shell avoids gsap-powered client sections", () => {
  const heroSource = readFileSync(
    new URL("../src/components/ui/hero.tsx", import.meta.url),
    "utf8",
  );
  const partnersSource = readFileSync(
    new URL("../src/components/home/PartnersSection.tsx", import.meta.url),
    "utf8",
  );
  const scrollSource = readFileSync(
    new URL("../src/components/home/ScrollSection.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(heroSource, /gsap/);
  assert.doesNotMatch(partnersSource, /gsap/);
  assert.doesNotMatch(scrollSource, /gsap/);
  assert.doesNotMatch(heroSource, /^["']use client["'];/m);
  assert.doesNotMatch(partnersSource, /^["']use client["'];/m);
  assert.doesNotMatch(scrollSource, /^["']use client["'];/m);
});

test("community route avoids framer-motion and fontawesome", () => {
  const communityViewSource = readFileSync(
    new URL("../src/views/headerPages/Community.tsx", import.meta.url),
    "utf8",
  );
  const journeySource = readFileSync(
    new URL("../src/components/community/JourneySection.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(communityViewSource, /framer-motion/);
  assert.doesNotMatch(journeySource, /framer-motion/);
  assert.doesNotMatch(journeySource, /@fortawesome/);
  assert.doesNotMatch(communityViewSource, /^["']use client["'];/m);
  assert.match(journeySource, /^["']use client["'];/m);
  assert.match(journeySource, /IntersectionObserver/);
  assert.match(journeySource, /visibleStages/);
  assert.match(journeySource, /stageRefs/);
  assert.match(journeySource, /journey-path-segment/);
});
