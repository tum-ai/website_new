"use client";

import Image from "next/image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import {
  createFieldSim,
  type FieldBodies,
  type FieldSim,
  MIN_SCALE,
  STIFFNESS,
  settleField,
  stepField,
} from "@/lib/spring-field";

/** A member in the join band: their face, who they are and their quote. */
export type QuotedMember = {
  /** Stable CMS person identity; names need not be unique. */
  key: string;
  name: string;
  role: string;
  excerpt: string;
  image: string;
  imagePosition?: string;
};

/** Share of a face's diameter its neighbour covers at rest. */
const OVERLAP = 0.27;
/** The quoted face's size, as a multiple of its rest size. */
const PEAK = 1.2;
/**
 * Room kept on each side of the row, in diameters: as far as the quoted
 * face pushes the row out (half its growth), so no face leaves the band.
 */
const SLACK = (PEAK - 1) / 2;
/** Damping of the faces' movement: a touch of overshoot, then calm. */
const DAMPING = 22;
/** Longest frame time the row advances by, in seconds (as `FieldDots`). */
const MAX_STEP_S = 1 / 30;

/** A face's inline transform for the sim state. */
function faceTransform(state: FieldSim, index: number) {
  const ox = ((state.ox[index] ?? 0) * 100).toFixed(2);
  const oy = ((state.oy[index] ?? 0) * 100).toFixed(2);
  const s = Math.max(state.s[index] ?? 1, MIN_SCALE).toFixed(3);
  return `translate(${ox}%, ${oy}%) scale(${s})`;
}

/**
 * The join band's member quote with the faces of everyone quoted. The
 * quoted member's face is grown and shoves its neighbours out of the way;
 * pointing at another face (or focusing or tapping it) quotes that member,
 * and the grown face hands over: a spring simulation in face diameters
 * (`lib/spring-field.ts`, the E-Lab field's), the faces overlapping at
 * rest, so the push runs down the row. The faces stack as a fan around the
 * quoted one. The pointer picks by its place over the row at rest, not by
 * the face under it, so a face moving under a still pointer never takes
 * over. The first member is quoted, already grown, in the server HTML.
 * Every quote sits in one grid cell, so the block keeps the longest one's
 * height; the old quote fades out as the new fades in. The loop runs only while something moves and writes only inline
 * styles; under reduced motion the faces jump to their places. `link`
 * follows the caption.
 */
export function MemberFaces({
  members,
  link,
}: {
  members: readonly QuotedMember[];
  link: ReactNode;
}) {
  const faceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const target = useRef(0);
  const frame = useRef(0);
  const last = useRef(0);
  const [selected, setSelected] = useState(0);
  /** Whether a visitor has picked a face: only then is a quote announced. */
  const [picked, setPicked] = useState(false);

  const bodies = useMemo<FieldBodies>(
    () => ({
      rest: members.map((_, index) => ({ x: index * (1 - OVERLAP), y: 0 })),
      radius: 0.5,
      gap: -OVERLAP,
      damping: DAMPING,
      // Critical: a shrinking face never dips below its size into the page.
      scaleDamping: 2 * Math.sqrt(STIFFNESS),
      peaks: members.map(() => PEAK),
    }),
    [members],
  );
  /** The row at rest with the first face grown: the server render's state. */
  const initial = useMemo(() => {
    const state = createFieldSim(members.length);
    settleField(state, bodies, 0);
    return state;
  }, [members.length, bodies]);
  const sim = useRef<FieldSim | null>(null);

  const step = useCallback(
    (now: number) => {
      const state = sim.current;
      if (!state) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const dt = Math.min((now - (last.current || now)) / 1000, MAX_STEP_S);
      last.current = now;

      let moving = false;
      if (reduced) settleField(state, bodies, target.current);
      else moving = stepField(state, bodies, target.current, dt);

      faceRefs.current.forEach((face, index) => {
        if (face) face.style.transform = faceTransform(state, index);
      });

      if (moving) {
        frame.current = requestAnimationFrame(step);
      } else {
        frame.current = 0;
        last.current = 0;
      }
    },
    [bodies],
  );

  /** Quotes the member at `index` and hands the grown face over to theirs. */
  const pick = useCallback(
    (index: number) => {
      if (target.current === index) return;
      target.current = index;
      setSelected(index);
      setPicked(true);
      // A copy: the render keeps reading the server state, so React leaves
      // the styles the loop writes alone.
      sim.current ??= {
        ...initial,
        ox: initial.ox.slice(),
        oy: initial.oy.slice(),
        vx: initial.vx.slice(),
        vy: initial.vy.slice(),
        s: initial.s.slice(),
        vs: initial.vs.slice(),
      };
      if (!frame.current) frame.current = requestAnimationFrame(step);
    },
    [initial, step],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /** The face whose resting slot is under `clientX` over the row `element`. */
  const slotAt = (element: HTMLElement, clientX: number) => {
    const { left, height } = element.getBoundingClientRect();
    const along = (clientX - left) / height - SLACK - 0.5;
    const index = Math.round(along / (1 - OVERLAP));
    return Math.min(Math.max(index, 0), members.length - 1);
  };

  const current = members[selected] ?? members[0];
  if (!current) return null;
  const rowWidth = members.length - (members.length - 1) * OVERLAP + 2 * SLACK;

  return (
    <figure className="mt-12 max-w-xl border-hairline border-t pt-8 md:mt-16">
      <div className="grid">
        {members.map((member, index) => (
          <blockquote
            key={member.key}
            aria-hidden={index !== selected}
            className={cn(
              "text-fg text-heading-sm transition-[opacity,translate,visibility] duration-500 ease-brand [grid-area:1/1] motion-reduce:transition-none sm:text-heading-md",
              index === selected
                ? "opacity-100"
                : "invisible translate-y-1 opacity-0",
            )}
          >
            “{member.excerpt}”
          </blockquote>
        ))}
      </div>
      <figcaption className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        {/* biome-ignore lint/a11y/useSemanticElements: a group of toggle buttons, not a form fieldset */}
        <div
          role="group"
          aria-label="Members quoted"
          className="relative isolate h-(--face) shrink-0 [--face:2.25rem] sm:[--face:2.75rem]"
          style={{ width: `calc(${rowWidth.toFixed(3)} * var(--face))` }}
          onPointerMove={(event) =>
            pick(slotAt(event.currentTarget, event.clientX))
          }
          onPointerDown={(event) =>
            pick(slotAt(event.currentTarget, event.clientX))
          }
        >
          {members.map((member, index) => (
            <button
              key={member.key}
              ref={(node) => {
                faceRefs.current[index] = node;
              }}
              type="button"
              aria-pressed={index === selected}
              aria-label={member.name}
              className="absolute top-0 size-(--face) cursor-pointer rounded-full outline-none will-change-transform focus-visible:outline-2 focus-visible:outline-fg-muted focus-visible:outline-offset-2"
              style={{
                left: `calc(${(SLACK + index * (1 - OVERLAP)).toFixed(3)} * var(--face))`,
                transform: faceTransform(initial, index),
                // A fan: the quoted face on top, the rest by distance from
                // it, so a handover swaps only the two faces it moves between.
                zIndex: members.length - Math.abs(index - selected),
              }}
              onFocus={() => pick(index)}
              onClick={(event) => {
                // Keyboard and assistive activation selects this button;
                // pointer intent is picked by its resting slot on the row.
                if (event.detail === 0) pick(index);
              }}
            >
              <Image
                src={member.image}
                alt=""
                width={64}
                height={64}
                className="size-full rounded-full object-cover ring-2 ring-canvas"
                style={{ objectPosition: member.imagePosition }}
              />
            </button>
          ))}
        </div>
        <div className="grid">
          {members.map((member, index) => (
            <div
              key={member.key}
              aria-hidden={index !== selected}
              className={cn(
                "transition-[opacity,visibility] duration-500 ease-brand [grid-area:1/1] motion-reduce:transition-none",
                index === selected ? "opacity-100" : "invisible opacity-0",
              )}
            >
              <p className="font-medium text-fg text-small">{member.name}</p>
              <p className="text-fg-muted text-meta">{member.role}</p>
            </div>
          ))}
        </div>
        {link}
        <p aria-live="polite" className="sr-only">
          {picked ? `${current.name}: “${current.excerpt}”` : ""}
        </p>
      </figcaption>
    </figure>
  );
}
