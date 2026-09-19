"use client";

import { ArrowRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPartnerKey } from "@/lib/partner-directory";
import {
  createPartnerRotation,
  nextPartnerRotation,
} from "@/lib/partner-rotation";
import type { Partner } from "@/lib/types";
import PartnerTile from "./PartnerTile";

const labels = { gold: "Gold", silver: "Silver", bronze: "Bronze" };

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

export default function PartnerTier({
  partners,
  tier,
  index,
}: {
  partners: Partner[];
  tier: keyof typeof labels;
  index: number;
}) {
  const byKey = new Map(
    partners.map((partner) => [getPartnerKey(partner.name), partner]),
  );
  const [rotation, setRotation] = useState(() =>
    createPartnerRotation([...byKey.keys()]),
  );
  const [transition, setTransition] = useState<{
    slot: number;
    outgoing: string;
  } | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const root = useRef<HTMLElement>(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const current = useRef(rotation);
  const endTransition = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const canRun =
    !paused && !reduced && visible && !hidden && !hovered && !focused;
  const allowed = useRef(false);
  allowed.current = canRun;
  const rotating = byKey.size > 3;

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

  const advance = useCallback(
    async (manual = false) => {
      if (busy.current) return;
      const next = nextPartnerRotation(current.current);
      if (!next) return;
      busy.current = true;
      const incoming = partners.find(
        (partner) => getPartnerKey(partner.name) === next.incoming,
      );
      await preload(incoming?.image);
      if (!mounted.current || (!manual && !allowed.current)) {
        busy.current = false;
        return;
      }
      current.current = next.state;
      setRotation(next.state);
      if (reduced) {
        busy.current = false;
        return;
      }
      setTransition({ slot: next.slot, outgoing: next.outgoing });
      endTransition.current = setTimeout(() => {
        setTransition(null);
        busy.current = false;
      }, 600);
    },
    [partners, reduced],
  );

  useEffect(() => {
    if (!rotating || !canRun) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(
      () => {
        void advance();
        interval = setInterval(() => void advance(), 2500);
      },
      2500 + index * 850,
    );
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [advance, canRun, index, rotating]);

  if (!rotation.visible.length) return null;
  return (
    <section
      ref={root}
      className="partner-tier-group"
      aria-labelledby={`partner-tier-${tier}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="partner-tier-heading">
        <h3 id={`partner-tier-${tier}`}>{labels[tier]} partners</h3>
        {rotating && (
          <div className="partner-tier-controls">
            {!reduced && (
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={`${paused ? "Resume" : "Pause"} ${labels[tier]} partner rotation`}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
            )}
            <button
              type="button"
              onClick={() => void advance(true)}
              aria-label={`Show next ${labels[tier]} partner`}
            >
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
      <div
        className={`partner-logo-row partner-logo-row-${index + 1} partner-rotating-row`}
      >
        {rotation.visible.map((key, slot) => {
          const partner = byKey.get(key);
          const outgoing =
            transition?.slot === slot
              ? byKey.get(transition.outgoing)
              : undefined;
          return partner ? (
            <div className="partner-rotation-slot" key={`slot-${slot}`}>
              <div
                className={
                  outgoing
                    ? "partner-rotation-current partner-rotation-enter"
                    : "partner-rotation-current"
                }
                key={key}
              >
                <PartnerTile partner={partner} />
              </div>
              {outgoing && (
                <div
                  className="partner-rotation-outgoing"
                  aria-hidden="true"
                  inert
                >
                  <PartnerTile partner={outgoing} />
                </div>
              )}
            </div>
          ) : null;
        })}
      </div>
    </section>
  );
}
