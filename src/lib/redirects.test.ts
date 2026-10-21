// Next matches redirect sources with its bundled path-to-regexp.
// @ts-expect-error -- Next ships the compiled matcher without types.
import { pathToRegexp as compile } from "next/dist/compiled/path-to-regexp";
import { describe, expect, test } from "vitest";
import { JOIN_HOST, joinHostRedirects } from "@/lib/redirects";

const [redirect] = joinHostRedirects;
const source = (compile as (path: string) => RegExp)(redirect?.source ?? "");
const redirects = (pathname: string) => source.test(pathname);

describe("join host redirect", () => {
  test("applies on the join host only, permanently, to /apply", () => {
    expect(joinHostRedirects).toHaveLength(1);
    expect(redirect?.has).toStrictEqual([{ type: "host", value: JOIN_HOST }]);
    expect(redirect?.destination).toBe("/apply");
    expect(redirect?.permanent).toBe(true);
  });

  test("sends every page to /apply", () => {
    for (const pathname of ["/", "/some/path", "/events", "/apply-now"]) {
      expect(redirects(pathname), pathname).toBe(true);
    }
  });

  test("keeps /apply and what it loads", () => {
    for (const pathname of [
      "/apply",
      "/_next/static/chunks/app.js",
      "/_next/image",
      "/assets/tum_ai_logo_new.svg",
      "/favicon.ico",
      "/icon.svg",
      "/robots.txt",
    ]) {
      expect(redirects(pathname), pathname).toBe(false);
    }
  });
});
