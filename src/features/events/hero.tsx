import { Actions, ButtonLink, Container, TopBlend } from "@tum.ai/ui-kit";
import Image from "next/image";
import { callToActionLabels } from "@/config/calls-to-action";
import type { Event } from "@/lib/types";
import { getEventsCopy } from "./content";
import type { HostArtwork } from "./data/host-logos";
import { type EventSummary, formatEventDate, type HostEntry } from "./events";
import { HeroReel } from "./hero-reel";
import { getHostArtwork } from "./host-content";
import { Lockup } from "./lockup";
import { REEL_ICON_PX, REEL_LOGO_SIZES } from "./reel-images";

/**
 * The page's bold element: the TUM.ai logo and a × as a co-branding lockup,
 * completed by every company, lab and initiative TUM.ai has run an event
 * with, from the CMS (the plain logo while no event has co-hosts). With
 * motion allowed and scripts running, the names roll through the slot after
 * the ×: once on load, as soon as the logos are in (a single roll from the
 * last name back to the first),
 * then wherever the reader turns the reel, and the events of the name in the
 * slot show beside it. Otherwise (reduced motion, no JavaScript) it is a
 * static two-column index. Mechanics: `events.css` and {@link HeroReel}.
 * Co-host artwork is each co-host organisation's logo for dark backgrounds
 * (the CMS or the code's organisations); a co-host typed as a name only is
 * set as text.
 */
export async function EventsHero({
  summary,
  hosts,
  hasUpcoming,
}: {
  /** Counts over every event on the page. */
  summary: EventSummary;
  /** The co-host index, most frequent first. */
  hosts: HostEntry<Event>[];
  /** Whether the "Upcoming" section lists events. */
  hasUpcoming: boolean;
}) {
  const rolls = hosts.length > 1;
  const [artwork, { hero }] = await Promise.all([
    rolls
      ? getHostArtwork(hosts.flatMap(({ key }) => (key ? [key] : [])))
      : undefined,
    getEventsCopy(),
  ]);
  return (
    <HeroReel
      names={hosts.map((host) => host.name)}
      aria-labelledby="events-hero-title"
      className="events-hero"
      data-roll={rolls ? "" : undefined}
    >
      <div className="events-hero-stage">
        <TopBlend />
        <Container className="events-hero-inner pt-[calc(var(--header-height)+clamp(3rem,7vw,6rem))] pb-[clamp(3.5rem,7vw,6rem)]">
          <div className="events-lockup">
            <h1 id="events-hero-title" className="events-lockup-title text-fg">
              <Image
                src="/assets/tum_ai_logo_new.svg"
                alt="TUM.ai"
                width={1640}
                height={406}
                loading="eager"
                className="events-lockup-logo"
              />
              {/* Without co-hosts the × would lead nowhere: the plain logo. */}
              {hosts.length > 0 ? (
                <span aria-hidden="true" className="text-highlight">
                  ×
                </span>
              ) : null}
              <span className="sr-only"> events</span>
            </h1>
            {hosts.length > 0 ? (
              <div className="events-names-window">
                <div className="events-names-viewport">
                  <ul
                    aria-label="Co-hosts, sponsors and challenge partners"
                    className="events-names"
                  >
                    {hosts.map((host) => (
                      <li key={host.name} className="events-name">
                        <span className="min-w-0">{host.name}</span>
                        <Count count={host.events.length} />
                      </li>
                    ))}
                  </ul>
                  {artwork ? <Reel hosts={hosts} artwork={artwork} /> : null}
                </div>
              </div>
            ) : null}
            {rolls ? (
              <div aria-hidden="true" className="events-host-panels">
                {hosts.map((host, index) => (
                  <HostPanel key={host.name} host={host} index={index} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="events-hero-footer max-w-2xl [animation-delay:380ms] motion-safe:animate-rise-sm">
            <Lead summary={summary} emptyLead={hero.emptyLead} />
            <Actions className="mt-8">
              {hasUpcoming ? (
                <>
                  <ButtonLink href="#upcoming-events" size="lg" arrow="down">
                    See upcoming events
                  </ButtonLink>
                  <ButtonLink
                    href="/partners#partner-contact"
                    size="lg"
                    variant="outline"
                  >
                    {callToActionLabels.partner}
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink href="/partners#partner-contact" size="lg">
                    {callToActionLabels.partner}
                  </ButtonLink>
                  <ButtonLink href="/apply" size="lg" variant="outline" arrow>
                    {callToActionLabels.member}
                  </ButtonLink>
                </>
              )}
            </Actions>
          </div>
        </Container>
      </div>
    </HeroReel>
  );
}

/**
 * The hero's lead: the events counted in one sentence, built from the
 * summary (its grammar follows the counts, so it stays in code), or the
 * page copy's `emptyLead` while there are none.
 */
function Lead({
  summary,
  emptyLead,
}: {
  summary: EventSummary;
  emptyLead: string;
}) {
  const { total, since, hackathons, withHosts } = summary;
  if (total === 0) {
    return <p className="text-fg-muted text-lead">{emptyLead}</p>;
  }
  return (
    <p className="text-fg-muted text-lead">
      {total} {total === 1 ? "event" : "events"}
      {since ? ` since ${since}` : null}
      {hackathons > 0
        ? `, ${hackathons} of them ${hackathons === 1 ? "a hackathon" : "hackathons"}`
        : null}
      .{" "}
      {withHosts > 0
        ? `${withHosts} ${withHosts === 1 ? "was" : "were"} run together with the partners named here.`
        : null}
    </p>
  );
}

/** "×4" after a co-host that was part of more than one event. */
function Count({ count }: { count: number }) {
  if (count < 2) return null;
  return (
    <span className="events-name-count tabular text-highlight">
      <span aria-hidden="true">×{count}</span>
      <span className="sr-only">, {count} events</span>
    </span>
  );
}

/**
 * The names as a reel: three copies of the index in a row, so the slot
 * always has neighbours and a full turn ends where it began (HeroReel keeps
 * `--roll` within one turn, so the copies wrap without a seam). Co-hosts with
 * verified dark-band artwork show their logo, sized to one optical area.
 * Decorative: the list above carries the names for assistive technology.
 * The images load eagerly: the viewport clips the reel, so lazy loading would
 * hold back every logo outside the slot until it rolled in, and the load roll
 * waits for them ({@link HeroReel}). The copies share one URL per logo, and
 * other pages warm those URLs ahead (`RouteImagePreload` in the site layout), so the sizes
 * come from `reel-images.ts`.
 */
function Reel({
  hosts,
  artwork,
}: {
  hosts: HostEntry<Event>[];
  artwork: HostArtwork;
}) {
  return (
    <div aria-hidden="true" className="events-reel">
      {[0, 1, 2].map((copy) =>
        hosts.map((host) => {
          const logo = host.key ? artwork.logos[host.key] : undefined;
          const icon = logo || !host.key ? undefined : artwork.icons[host.key];
          const height = logo ? Math.min(0.9, Math.sqrt(1.5 / logo.aspect)) : 0;
          return (
            <div key={`${copy}-${host.name}`} className="events-name">
              {logo ? (
                <span
                  className="events-name-logo"
                  style={{
                    height: `${height}em`,
                    width: `${height * logo.aspect}em`,
                  }}
                >
                  <Image
                    src={logo.src}
                    alt=""
                    fill
                    sizes={REEL_LOGO_SIZES}
                    loading="eager"
                  />
                </span>
              ) : (
                <span className="events-name-text">
                  {icon ? (
                    <Image
                      src={icon}
                      alt=""
                      width={REEL_ICON_PX}
                      height={REEL_ICON_PX}
                      loading="eager"
                      className="events-name-icon"
                    />
                  ) : null}
                  <span className="truncate">{host.name}</span>
                </span>
              )}
              {host.events.length > 1 ? (
                <span className="events-name-count tabular text-highlight">
                  ×{host.events.length}
                </span>
              ) : null}
            </div>
          );
        }),
      )}
    </div>
  );
}

/** The events of the co-host in the slot, newest first (at most three). */
function HostPanel({ host, index }: { host: HostEntry<Event>; index: number }) {
  const shown = host.events.slice(0, 3);
  const more = host.events.length - shown.length;
  return (
    <div
      className="events-host-panel"
      data-host-panel={index}
      data-active={index === 0 ? "" : undefined}
    >
      <ol className="space-y-4">
        {shown.map((event) => {
          const date = formatEventDate(event.event_date);
          return (
            <li key={event.id} className="border-hairline-strong border-t pt-3">
              <p className="tabular text-fg-subtle text-meta">{date.long}</p>
              <p className="mt-1 text-fg text-small">
                <Lockup title={event.title.trim()} />
              </p>
            </li>
          );
        })}
      </ol>
      {more > 0 ? (
        <p className="mt-4 text-fg-subtle text-meta">
          and {more} more {more === 1 ? "event" : "events"}
        </p>
      ) : null}
    </div>
  );
}
