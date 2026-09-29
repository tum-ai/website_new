import Image from "next/image";
import { Actions, ButtonLink, Container, TopBlend } from "@/components/ds";
import type { Event } from "@/lib/types";
import { hostLogo } from "./data/host-logos";
import { type EventSummary, formatEventDate, type HostEntry } from "./events";
import { HeroScroll } from "./hero-scroll";
import { Lockup } from "./lockup";

/**
 * The page's bold element: "TUM.ai ×" as a co-branding lockup, completed by
 * every company, lab and initiative TUM.ai has run an event with, from the
 * CMS. With motion allowed and scripts running, the hero pins while the
 * names roll through the slot after the ×: once on load (a single roll from
 * the last name back to the first), then with the reader's scroll, and the
 * events of the name in the slot show beside it. Otherwise (reduced motion,
 * no JavaScript) it is a static two-column index. Mechanics: `events.css`
 * and {@link HeroScroll}.
 */
export function EventsHero({
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
  return (
    <HeroScroll
      count={hosts.length}
      aria-labelledby="events-hero-title"
      className="events-hero"
      data-roll={rolls ? "" : undefined}
    >
      <div className="events-hero-stage">
        <TopBlend />
        <Container className="events-hero-inner pt-[calc(var(--header-height)+clamp(3rem,7vw,6rem))] pb-[clamp(3.5rem,7vw,6rem)]">
          <div className="events-lockup">
            <h1
              id="events-hero-title"
              className="events-lockup-title text-display-lg text-fg"
            >
              TUM.ai
              <span aria-hidden="true" className="text-highlight">
                {" ×"}
              </span>
              <span className="sr-only"> events</span>
            </h1>
            {hosts.length > 0 ? (
              <div className="events-names-window">
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
                {rolls ? <Reel hosts={hosts} /> : null}
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
            <Lead summary={summary} />
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
                    Become a Partner
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink href="/partners#partner-contact" size="lg">
                    Become a Partner
                  </ButtonLink>
                  <ButtonLink href="/apply" size="lg" variant="outline" arrow>
                    Become a Member
                  </ButtonLink>
                </>
              )}
            </Actions>
          </div>
        </Container>
      </div>
    </HeroScroll>
  );
}

function Lead({ summary }: { summary: EventSummary }) {
  const { total, since, hackathons, withHosts } = summary;
  if (total === 0) {
    return (
      <p className="text-fg-muted text-lead">
        Hackathons, talks and pitch nights in Munich.
      </p>
    );
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
 * The names as a reel for the pinned hero: three copies of the index in a
 * row, so the slot always has neighbours and a full turn ends where it began
 * (HeroScroll keeps the position within the middle copy). Co-hosts with
 * verified dark-band artwork show their logo, sized to one optical area.
 * Decorative: the list above carries the names for assistive technology.
 */
function Reel({ hosts }: { hosts: HostEntry<Event>[] }) {
  return (
    <div aria-hidden="true" className="events-reel">
      {[0, 1, 2].map((copy) =>
        hosts.map((host) => {
          const logo = hostLogo(host.name);
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
                  <Image src={logo.src} alt="" fill sizes="20rem" />
                </span>
              ) : (
                <span className="events-name-text">{host.name}</span>
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
