/**
 * `MOCK_CMS_NOW` for the local mock CMS (src/lib/mock-cms.ts). The on/off
 * switch, `USE_MOCK_CMS=1`, is checked in `lib/sanity.ts`, where the fixtures
 * are imported on demand.
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
 * unparseable: a typo should fail the run, not fall back to the real clock.
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
