import { readFile } from "node:fs/promises";
import { expect, test, vi } from "vitest";

// The layout is imported only for its `metadata` export. next/font only works
// inside the Next.js compiler, and Sanity Live needs the react-server runtime.
vi.mock("next/font/local", () => ({
  default: () => ({ className: "", variable: "", style: {} }),
}));
vi.mock("@/lib/sanity", () => ({
  isSanityConfigured: false,
  SanityLive: () => null,
}));

const { metadata } = await import("../src/app/(site)/layout.tsx");

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

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

  expect(publicIcon).toBe(appIcon);
  expect(appIcon).toMatch(/viewBox="0 0 1024 1024"/);
  expect(appIcon).toMatch(/<circle[^>]+fill="#1B0049"/);
  expect(appIcon).toMatch(/fill="#FFFFFF"/);
  expect(appIcon).toMatch(/fill="url\(#mark-gradient\)"/);
});

test("favicon raster exports have their declared dimensions", async () => {
  const searchIcon = await readFile(
    new URL("../public/assets/favicon-96.png", import.meta.url),
  );
  const appleIcon = await readFile(
    new URL("../public/assets/apple-touch-icon.png", import.meta.url),
  );

  expect(readPngDimensions(searchIcon)).toStrictEqual({
    width: 96,
    height: 96,
  });
  expect(readPngDimensions(appleIcon)).toStrictEqual({
    width: 180,
    height: 180,
  });
});

test("site metadata advertises raster favicons before the SVG fallback", () => {
  const icons = metadata.icons;
  if (
    !icons ||
    typeof icons !== "object" ||
    Array.isArray(icons) ||
    icons instanceof URL
  ) {
    throw new Error("metadata.icons must be an Icons object");
  }

  // Browsers take the first icon they support: search engines and older
  // browsers need the PNG, so it must precede the SVG.
  const iconUrls = [icons.icon ?? []]
    .flat()
    .map((icon) =>
      typeof icon === "object" && "url" in icon ? icon.url : icon,
    )
    .map(String);
  expect(iconUrls).toStrictEqual(["/assets/favicon-96.png", "/icon.svg"]);

  expect(icons.apple).toMatchObject({
    url: "/assets/apple-touch-icon.png",
    sizes: "180x180",
  });
});
