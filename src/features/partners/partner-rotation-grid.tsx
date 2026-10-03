"use client";

import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Partner } from "@/lib/types";
import { getPartnerKey } from "./partner-key";
import { createPartnerRotation, nextPartnerBatch } from "./partner-rotation";
import { PartnerTile, type PartnerTileSize } from "./partner-tile";

// Bound a slow or broken remote CMS image; the tile falls back to the name.
function preload(src?: string) {
  if (!src) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => {
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve();
    };
    const timeout = window.setTimeout(finish, 3000);
    image.onload = () => {
      void image
        .decode()
        .catch(() => undefined)
        .then(finish);
    };
    image.onerror = finish;
    image.src = src;
  });
}

/**
 * A wall of partner tiles that, when there are more partners than
 * `capacity`, swaps `batchSize` of them every 2.5 s with a dissolve (the
 * `partner-rotation-*` classes in styles/partner-rotation.css). The first
 * `capacity` partners start on the wall. It pauses off screen, in background
 * tabs and under reduced motion, where it shows every partner or, with
 * `stillShows="capacity"`, only the starting wall. Remount it (`key`) when
 * capacity or the company keys change, which cancels pending batches
 * safely.
 */
export function PartnerRotationGrid({
  partners,
  capacity = 3,
  batchSize = 1,
  offset = 0,
  size = "xl",
  stillShows = "all",
  label,
  className,
}: {
  partners: Partner[];
  capacity?: number;
  batchSize?: number;
  offset?: number;
  size?: PartnerTileSize;
  /**
   * What the wall shows under reduced motion: every partner (`all`, the
   * /partners walls) or the starting wall of `capacity` tiles (`capacity`),
   * for a wall whose size must not grow.
   */
  stillShows?: "all" | "capacity";
  /** Makes the wall a list with this accessible name. */
  label?: string;
  className: string;
}) {
  const byKey = new Map(
    partners.map((partner) => [getPartnerKey(partner.name), partner]),
  );
  const [rotation, setRotation] = useState(() =>
    createPartnerRotation([...byKey.keys()], capacity),
  );
  const [transitions, setTransitions] = useState<
    { slot: number; outgoing: string; delay: number }[]
  >([]);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLElement>(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const current = useRef(rotation);
  const endTransition = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const canRun = !reduced && visible && !hidden;
  const allowed = useRef(false);
  allowed.current = canRun;
  const rotating = byKey.size > capacity;

  useEffect(() => {
    mounted.current = true;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (root.current) observer.observe(root.current);
    return () => {
      mounted.current = false;
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      clearTimeout(endTransition.current);
    };
  }, []);

  const advance = useCallback(async () => {
    if (busy.current) return;
    const next = nextPartnerBatch(current.current, batchSize);
    if (!next) return;
    busy.current = true;
    await Promise.all(
      next.changes.map((change) =>
        preload(
          partners.find(
            (partner) => getPartnerKey(partner.name) === change.incoming,
          )?.image,
        ),
      ),
    );
    if (!mounted.current || !allowed.current) {
      busy.current = false;
      return;
    }
    current.current = next.state;
    setRotation(next.state);
    setTransitions(next.changes);
    endTransition.current = setTimeout(
      () => {
        setTransitions([]);
        busy.current = false;
      },
      600 + next.changes[next.changes.length - 1].delay,
    );
  }, [partners, batchSize]);

  useEffect(() => {
    if (!rotating || !canRun) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      void advance();
      interval = setInterval(() => void advance(), 2500);
    }, 2500 + offset);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [advance, canRun, offset, rotating]);

  const Wall = label ? "ul" : "div";
  const Slot = label ? "li" : "div";
  const still = reduced && stillShows === "capacity";
  return (
    <Wall
      ref={root as RefObject<HTMLUListElement & HTMLDivElement>}
      aria-label={label}
      className={className}
      // Visual tests mask rotating walls by this marker; a wall that holds
      // its starting tiles under reduced motion is still and drops it.
      data-rotating={still ? undefined : !reduced}
    >
      {(reduced && !still ? [...byKey.keys()] : rotation.visible).map(
        (key, slot) => {
          const partner = byKey.get(key);
          const transition = reduced
            ? undefined
            : transitions.find((change) => change.slot === slot);
          const outgoing = transition
            ? byKey.get(transition.outgoing)
            : undefined;
          return partner ? (
            <Slot
              className="partner-rotation-slot"
              // Slots are fixed positions on the wall; the company inside changes.
              // biome-ignore lint/suspicious/noArrayIndexKey: the slot index is the identity
              key={`slot-${slot}`}
              style={
                {
                  "--partner-logo-delay": `${transition?.delay ?? 0}ms`,
                } as CSSProperties
              }
            >
              <div
                className={
                  outgoing
                    ? "partner-rotation-current partner-rotation-enter"
                    : "partner-rotation-current"
                }
                key={key}
              >
                <PartnerTile partner={partner} size={size} />
              </div>
              {outgoing ? (
                <div
                  className="partner-rotation-outgoing"
                  aria-hidden="true"
                  inert
                >
                  <PartnerTile partner={outgoing} size={size} transparent />
                </div>
              ) : null}
            </Slot>
          ) : null;
        },
      )}
    </Wall>
  );
}
