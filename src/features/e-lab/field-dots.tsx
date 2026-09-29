"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createFieldSim,
  type FieldSim,
  MIN_SCALE,
  settleField,
  stepField,
} from "./field-physics";

/**
 * A venture a lit dot opens into: its name, logo artwork and, when it has
 * one, its site. Without `href` the logo still opens but is not a link.
 */
type FieldVenture = {
  name: string;
  href?: string;
  logoSrc: string;
  /** Name set under a symbol-only logo. */
  wordmark?: string;
};

/** One dot of the field, in lattice units (neighbours sit 1 apart). */
export type FieldDotData = {
  x: number;
  y: number;
  /** Fade delay in ms for dots that go out on load; none for lit dots. */
  delay?: number;
  venture?: FieldVenture;
  /**
   * For a lit dot without a venture: two short lines it opens into instead,
   * e.g. "Your team" and the cohort. Decorative; no link.
   */
  invite?: [string, string];
};

/** Props for {@link FieldDots}. */
export type FieldDotsProps = {
  dots: FieldDotData[];
  /** The SVG viewBox around every dot at rest. */
  viewBox: string;
  /** Dot radius at rest, in lattice units. */
  radius: number;
  className?: string;
};

/** Radius of a venture's logo disc when open. */
const LOGO_RADIUS = 2.4;
/** Pointer catch radius around a lit dot, in lattice units. */
const CATCH = 1.1;
/** Extra reach past an open dot's edge before the pointer leaves it. */
const HIT_SLOP = 0.2;
/**
 * The longest step the spring integrates, in seconds: after a dropped frame
 * or a background tab the field resumes instead of jumping.
 */
const MAX_STEP_S = 1 / 30;
/** A logo may overshoot with its dot's spring, up to this scale. */
const LOGO_MAX_SCALE = 1.2;
/** A logo is fully opaque once its dot is 1 / this of the way open. */
const LOGO_FADE_RATE = 1.4;

/**
 * The field's dots as a small spring simulation. Pointing at a lit dot opens
 * it, into a venture's logo (a link to its site when it has one) or, where
 * no venture is left, into its `invite` lines, and shoves the neighbouring dots out of
 * the way. Dots collide and never overlap, so the ones pushed aside push
 * theirs in turn: the field ripples outward and springs back with a little
 * overshoot (see `stepField`). Other dots never open. Keyboard focus on a
 * venture link does what hover does. On touch, with no hover, the first tap
 * opens a venture's dot and the next tap on it follows the link. The loop
 * only runs while something moves, only `transform` and `r` change, and
 * under reduced motion dots jump to their places without the spring.
 */
export function FieldDots({
  dots,
  viewBox,
  radius,
  className,
}: FieldDotsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const logoRefs = useRef(new Map<number, SVGGElement>());
  const sim = useRef<FieldSim | null>(null);
  const target = useRef(-1);
  /**
   * The dot the current press opened, whose link must not follow that
   * press's click: a tap opens a dot and its click would otherwise land on
   * the logo growing under the finger. -1 when the press found the dot open.
   */
  const pressed = useRef(-1);
  const frame = useRef(0);
  const last = useRef(0);
  const [active, setActive] = useState(-1);

  /** Each dot's size while pointed at, as a multiple of its rest radius. */
  const peaks = useMemo(
    () =>
      dots.map((dot) => (dot.venture || dot.invite ? LOGO_RADIUS / radius : 1)),
    [dots, radius],
  );
  const bodies = useMemo(
    () => ({ rest: dots, radius, peaks }),
    [dots, radius, peaks],
  );

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

      for (let index = 0; index < dots.length; index++) {
        const dot = dots[index];
        if (!dot) continue;
        const circle = dotRefs.current[index];
        const ox = state.ox[index] ?? 0;
        const oy = state.oy[index] ?? 0;
        const s = Math.max(state.s[index] ?? 1, MIN_SCALE);
        if (circle) {
          circle.setAttribute(
            "transform",
            `translate(${ox.toFixed(3)} ${oy.toFixed(3)})`,
          );
          circle.setAttribute("r", (radius * s).toFixed(3));
        }
        const logo = logoRefs.current.get(index);
        if (logo) {
          const open = Math.min(
            Math.max((s - 1) / ((peaks[index] ?? 2) - 1), 0),
            LOGO_MAX_SCALE,
          );
          logo.setAttribute(
            "transform",
            `translate(${(dot.x + ox).toFixed(3)} ${(dot.y + oy).toFixed(3)}) scale(${open.toFixed(3)})`,
          );
          logo.style.opacity = Math.min(open * LOGO_FADE_RATE, 1).toFixed(3);
        }
      }

      if (moving) {
        frame.current = requestAnimationFrame(step);
      } else {
        frame.current = 0;
        last.current = 0;
      }
    },
    [dots, radius, peaks, bodies],
  );

  const aim = useCallback(
    (index: number) => {
      if (target.current === index) return;
      target.current = index;
      setActive(index);
      if (!sim.current) sim.current = createFieldSim(dots.length);
      if (!frame.current) frame.current = requestAnimationFrame(step);
    },
    [dots.length, step],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  /**
   * The venture dot under the pointer: the open one while the pointer is
   * inside it, else the nearest venture dot within reach. Other dots never
   * open; they only make way.
   */
  const dotAt = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM()?.inverse();
    if (!svg || !matrix) return -1;
    const point = new DOMPoint(clientX, clientY).matrixTransform(matrix);
    const state = sim.current;
    const position = (index: number) => ({
      x: (dots[index]?.x ?? 0) + (state?.ox[index] ?? 0),
      y: (dots[index]?.y ?? 0) + (state?.oy[index] ?? 0),
    });
    const current = target.current;
    if (current >= 0) {
      const at = position(current);
      const size = radius * (state?.s[current] ?? 1);
      if (Math.hypot(point.x - at.x, point.y - at.y) < size + HIT_SLOP) {
        return current;
      }
    }
    let nearest = -1;
    let best = CATCH;
    for (let index = 0; index < dots.length; index++) {
      if (!dots[index]?.venture && !dots[index]?.invite) continue;
      const at = position(index);
      const distance = Math.hypot(point.x - at.x, point.y - at.y);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    }
    return nearest;
  };

  /** Registers the group the step loop scales open for the dot at `index`. */
  const logoRef = (index: number) => (node: SVGGElement | null) => {
    if (node) logoRefs.current.set(index, node);
    else logoRefs.current.delete(index);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={className}
      aria-label="One round of team applications, with links to ventures from the E-Lab"
      onPointerMove={(event) => aim(dotAt(event.clientX, event.clientY))}
      onPointerDown={(event) => {
        const index = dotAt(event.clientX, event.clientY);
        pressed.current = index === target.current ? -1 : index;
        aim(index);
      }}
      onPointerLeave={(event) => {
        // A tap ends with pointerleave; keep the tapped dot open until the
        // next tap lands elsewhere.
        if (event.pointerType !== "touch") aim(-1);
      }}
    >
      <g fill="currentColor">
        {dots.map((dot, index) => (
          <circle
            key={`${dot.x}:${dot.y}`}
            ref={(node) => {
              dotRefs.current[index] = node;
            }}
            cx={dot.x}
            cy={dot.y}
            r={radius}
            className={dot.delay === undefined ? undefined : "elab-field-out"}
            style={
              dot.delay === undefined
                ? undefined
                : ({ "--delay": `${dot.delay}ms` } as CSSProperties)
            }
          />
        ))}
      </g>
      {dots.map((dot, index) =>
        dot.venture?.href ? (
          <a
            key={dot.venture.name}
            href={dot.venture.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${dot.venture.name}, an E-Lab venture (opens in a new tab)`}
            data-expanded={active === index}
            className="elab-field-venture outline-none"
            onClick={(event) => {
              if (pressed.current === index) event.preventDefault();
              pressed.current = -1;
            }}
            onFocus={() => aim(index)}
            onBlur={() => {
              if (target.current === index) aim(-1);
            }}
          >
            <g
              ref={logoRef(index)}
              transform={`translate(${dot.x} ${dot.y}) scale(0)`}
              style={{ opacity: 0 }}
            >
              <VentureArtwork venture={dot.venture} />
            </g>
          </a>
        ) : dot.venture ? (
          // A venture without a site: the same logo, opened by pointing at
          // it, but no link to follow or focus. Decorative like the invites;
          // the ventures band below the hero names every venture.
          // biome-ignore lint/a11y/noAriaHiddenOnFocusable: an SVG <g> without tabindex or a link is not focusable
          <g
            key={dot.venture.name}
            aria-hidden="true"
            data-expanded={active === index}
            ref={logoRef(index)}
            transform={`translate(${dot.x} ${dot.y}) scale(0)`}
            style={{ opacity: 0 }}
          >
            <VentureArtwork venture={dot.venture} />
          </g>
        ) : dot.invite ? (
          // biome-ignore lint/a11y/noAriaHiddenOnFocusable: an SVG <g> without tabindex or a link is not focusable; this hides the repeated decorative "Your team" text from screen readers
          <g
            key={`invite-${dot.x}:${dot.y}`}
            aria-hidden="true"
            ref={logoRef(index)}
            transform={`translate(${dot.x} ${dot.y}) scale(0)`}
            style={{ opacity: 0 }}
          >
            <circle r={LOGO_RADIUS} className="fill-violet-50" />
            <text
              y={-0.1}
              textAnchor="middle"
              fontSize={0.62}
              fontWeight={600}
              className="fill-violet-950"
            >
              {dot.invite[0]}
            </text>
            <text
              y={0.72}
              textAnchor="middle"
              fontSize={0.5}
              className="fill-violet-700"
            >
              {dot.invite[1]}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  );
}

/** A venture's open disc: its logo on white, with the name under a symbol. */
function VentureArtwork({ venture }: { venture: FieldVenture }) {
  return (
    <>
      <circle r={LOGO_RADIUS} className="fill-white" />
      <circle
        r={LOGO_RADIUS + 0.22}
        fill="none"
        strokeWidth={0.14}
        className="elab-field-ring stroke-current"
      />
      <image
        href={venture.logoSrc}
        x={-1.8}
        y={venture.wordmark ? -1.35 : -0.9}
        width={3.6}
        height={venture.wordmark ? 1.4 : 1.8}
        preserveAspectRatio="xMidYMid meet"
      />
      {venture.wordmark ? (
        <text
          y={0.85}
          textAnchor="middle"
          fontSize={0.52}
          fontWeight={600}
          className="fill-violet-950"
        >
          {venture.wordmark}
        </text>
      ) : null}
    </>
  );
}
