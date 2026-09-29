/**
 * The clock of the local mock CMS (src/lib/mock-cms.ts): `MOCK_CMS_NOW`, and
 * `getCmsNow()`, the render time for pages that split or word content by
 * date. The on/off switch, `USE_MOCK_CMS=1`, also gates the fixtures in
 * `lib/sanity.ts`, where they are imported on demand.
 */
type Env = Record<string, string | undefined>;

/** A date (`2026-09-25`, UTC midnight) or a date-time with an explicit offset. */
const isoInstant =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/;

/**
 * The "now" mock events are dated from: `MOCK_CMS_NOW` when set, otherwise
 * `fallback` (the current time). Fixing it keeps the upcoming/past split and
 * every rendered date stable for end-to-end and visual tests.
 *
 * `MOCK_CMS_NOW` is ISO 8601: a date such as `2026-09-25` or a date-time
 * with an offset such as `2026-09-25T12:00:00Z`. A value without an offset
 * would depend on the machine's timezone, so it throws, as does anything
 * unparsable: a typo should fail the run, not fall back to the real clock.
 */
export function getMockCmsNow(env: Env, fallback: Date = new Date()): Date {
  const value = env.MOCK_CMS_NOW?.trim();
  if (!value) return fallback;

  const now = new Date(value);
  if (!isoInstant.test(value) || Number.isNaN(now.getTime())) {
    throw new Error(
      `MOCK_CMS_NOW must be an ISO 8601 date or a date-time with an offset (e.g. 2026-09-25T12:00:00Z), got "${value}"`,
    );
  }
  return now;
}

/**
 * "Now" for a server render that depends on the date (the upcoming/past
 * split on /events, the initiative's age on /apply): `MOCK_CMS_NOW` under
 * the mock CMS, so pages and fixtures share one clock and E2E and visual
 * runs are deterministic; otherwise the current time.
 *
 * The gate is the one in `lib/sanity.ts`: `USE_MOCK_CMS === "1"` and never
 * on Vercel. It reads `process.env.USE_MOCK_CMS` literally because
 * next.config.ts inlines that expression at build time, so this clock
 * follows the same build-time flag as the fixtures.
 */
export function getCmsNow(): Date {
  return isMockCmsOn() ? getMockCmsNow(process.env) : new Date();
}

/**
 * Whether `getCmsNow()` is pinned by `MOCK_CMS_NOW`. Islands that follow the
 * clock live (application windows) then keep the server's answer, because
 * the browser's real clock would disagree with the rest of the page.
 */
export function isCmsClockFixed(): boolean {
  return isMockCmsOn() && Boolean(process.env.MOCK_CMS_NOW?.trim());
}

/** The mock CMS gate; see {@link getCmsNow} for why it reads env literally. */
function isMockCmsOn(): boolean {
  return process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL;
}
