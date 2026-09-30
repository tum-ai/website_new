export function getSafeExternalUrl(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

const siteOrigin = "https://site.invalid";

/**
 * `value` when it is a path on this site (`/research`, `/community#journey`,
 * `/`), else `null`. For CMS links rendered with next/link: a value such as
 * `//evil.example`, `/\evil.example` or `/\t/evil.example` starts with a
 * slash but leaves the site (browsers read a backslash as a slash and drop
 * tabs and newlines), so the WHATWG URL parser decides: the value must
 * resolve to this site's origin. Returned as written, so it renders exactly
 * like the code link.
 */
export function getSafeSitePath(value?: string | null): string | null {
  if (!value?.startsWith("/")) return null;
  try {
    return new URL(value, siteOrigin).origin === siteOrigin ? value : null;
  } catch {
    return null;
  }
}

/**
 * Whether `value` is an absolute `https:` URL, for CMS links that leave the
 * site. Callers keep `value` as written (unlike {@link getSafeExternalUrl},
 * which normalises it), so a valid CMS link renders exactly as the code one.
 */
export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * The hosts whose booking pages the /partners booking dialog embeds. The
 * embed loads its script from the booking page's origin, so the booking URL
 * (a CMS field) decides which script runs on the page: only these hosts.
 */
const calBookingHosts: readonly string[] = ["cal.eu", "cal.com"];

/** A Cal booking page as the embed takes it. */
export type CalBooking = {
  /** The page's path without the leading slash: `<user>/<event>`. */
  calLink: string;
  calOrigin: string;
  /** The embed script, on the booking host itself. */
  embedJsUrl: string;
};

/**
 * The Cal booking page at `value`, or `null` unless it is an `https:` page
 * on one of {@link calBookingHosts} (exact host, no port or credentials) with
 * a path. Checked where the URL enters (the site-settings slice, the Studio)
 * and again before the dialog loads the embed script.
 */
export function getCalBooking(value?: string | null): CalBooking | null {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const calLink = url.pathname.slice(1);
  if (
    url.protocol !== "https:" ||
    !calBookingHosts.includes(url.hostname) ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    calLink === ""
  ) {
    return null;
  }
  return {
    calLink,
    calOrigin: url.origin,
    embedJsUrl: `${url.origin}/embed.js`,
  };
}
