import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { getMockEvents } from "@/lib/mock-cms";
import { hostIcon, hostLogo } from "./host-logos";

const publicDir = path.resolve(import.meta.dirname, "../../../../public");

test("names match whatever the editors' spacing, case and ampersands", () => {
  expect(hostLogo("Hugging Face")).toEqual(hostLogo("hugging  face"));
  expect(hostLogo("Manage & More")?.src).toBe(
    "/assets/events/hosts/manage-and-more.svg",
  );
  expect(hostLogo("Mercura")).toBeUndefined();
  expect(hostIcon("Mercura")).toBe("/assets/events/hosts/mercura-icon.webp");
});

test("every logo a co-host resolves to ships in public/", () => {
  const hosts = new Set(getMockEvents().flatMap((event) => event.hosts));
  for (const host of hosts) {
    for (const src of [hostLogo(host)?.src, hostIcon(host)]) {
      if (src) expect(existsSync(path.join(publicDir, src)), host).toBe(true);
    }
  }
});
