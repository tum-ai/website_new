"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { getPartnerKey } from "@/lib/partner-directory";
import {
  createPartnerRotation,
  nextPartnerBatch,
} from "@/lib/partner-rotation";
import type { Partner } from "@/lib/types";
import PartnerTile from "./PartnerTile";

// Bound a slow or broken remote CMS image; PartnerLogo supplies the name fallback.
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

/** Remount when capacity or company keys change to cancel pending batches safely. */
export default function PartnerRotationGrid({
  partners,
  capacity = 3,
  batchSize = 1,
  offset = 0,
  compact = false,
  className,
}: {
  partners: Partner[];
  capacity?: number;
  batchSize?: number;
  offset?: number;
  compact?: boolean;
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
  const root = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={root} className={className} data-rotating={!reduced}>
      {(reduced ? [...byKey.keys()] : rotation.visible).map((key, slot) => {
        const partner = byKey.get(key);
        const transition = reduced
          ? undefined
          : transitions.find((change) => change.slot === slot);
        const outgoing = transition
          ? byKey.get(transition.outgoing)
          : undefined;
        return partner ? (
          <div
            className="partner-rotation-slot"
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
              <PartnerTile partner={partner} compact={compact} />
            </div>
            {outgoing && (
              <div
                className="partner-rotation-outgoing"
                aria-hidden="true"
                inert
              >
                <PartnerTile partner={outgoing} compact={compact} />
              </div>
            )}
          </div>
        ) : null;
      })}
    </div>
  );
}
