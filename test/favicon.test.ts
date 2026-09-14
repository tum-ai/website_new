import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  const signature = buffer.subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a");

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test("favicon assets stay square, branded, and synchronized", async () => {
  const appIcon = await readFile(
    new URL("../src/app/icon.svg", import.meta.url),
    "utf8",
  );
  const publicIcon = await readFile(
    new URL("../public/assets/favicon.svg", import.meta.url),
    "utf8",
  );

  assert.equal(publicIcon, appIcon);
  assert.match(appIcon, /viewBox="0 0 1024 1024"/);
  assert.match(appIcon, /<circle[^>]+fill="#1B0049"/);
  assert.match(appIcon, /fill="#FFFFFF"/);
  assert.match(appIcon, /fill="url\(#mark-gradient\)"/);
});

test("favicon raster exports have their declared dimensions", async () => {
  const searchIcon = await readFile(
    new URL("../public/assets/favicon-96.png", import.meta.url),
  );
  const appleIcon = await readFile(
    new URL("../public/assets/apple-touch-icon.png", import.meta.url),
  );

  assert.deepEqual(readPngDimensions(searchIcon), { width: 96, height: 96 });
  assert.deepEqual(readPngDimensions(appleIcon), {
    width: 180,
    height: 180,
  });
});

test("site metadata advertises raster favicons before the SVG fallback", async () => {
  const layout = await readFile(
    new URL("../src/app/layout.tsx", import.meta.url),
    "utf8",
  );
  const searchIconIndex = layout.indexOf("/assets/favicon-96.png");
  const svgFallbackIndex = layout.indexOf("/icon.svg");

  assert.notEqual(searchIconIndex, -1);
  assert.notEqual(svgFallbackIndex, -1);
  assert.ok(searchIconIndex < svgFallbackIndex);
  assert.match(layout, /\/assets\/apple-touch-icon\.png/);
});
