"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  FlaskConical,
  Megaphone,
  RotateCcw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { partnershipDurations, partnershipIntents } from "@/data/partners";
import { getPartnershipRecommendation } from "@/lib/partnerships";
import { ContactActions } from "./ContactActions";
import { usePartnership } from "./PartnershipContext";

const icons = {
  talent: Users,
  hackathon: Zap,
  brand: Megaphone,
  research: FlaskConical,
};

export default function PartnershipFinder() {
  const { selection, dispatch } = usePartnership();
  const { step, intent } = selection;
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const recommendation = getPartnershipRecommendation(selection);
  const selectedIntent = partnershipIntents.find((item) => item.id === intent);

  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      previousStep.current = step;
    }
  }, [step]);

  return (
    <section
      id="find-your-fit"
      className="partner-finder-section"
      aria-labelledby="finder-title"
    >
      <div className="partner-container partner-finder-layout">
        <div className="partner-finder-intro">
          <span className="partner-section-note">
            <Sparkles size={18} />
            Your way in
          </span>
          <h2 id="finder-title">
            Big ambitions.
            <br />
            The right partnership.
          </h2>
          <p>
            Tell us what you have in mind. We’ll find your place in the
            ecosystem.
          </p>
          <span className="partner-finder-promise">
            Two quick questions. No forms. Just a starting point.
          </span>
        </div>
        <div className="partner-finder-panel" ref={panel}>
          <ol
            className="partner-finder-progress"
            aria-label="Partnership finder progress"
          >
            {["Your goal", "Your timeframe", "Your fit"].map((label, index) => {
              const activeIndex =
                step === "intent" ? 0 : step === "duration" ? 1 : 2;
              return (
                <li
                  key={label}
                  aria-current={index === activeIndex ? "step" : undefined}
                  data-complete={index < activeIndex}
                >
                  <span>
                    {index < activeIndex ? <Check size={12} /> : index + 1}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>
          {step !== "intent" ? (
            <button
              type="button"
              className="partner-finder-back"
              onClick={() => dispatch({ type: "back" })}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          ) : null}
          {step === "intent" ? (
            <>
              <h3 ref={heading} tabIndex={-1}>
                What matters most to you right now?
              </h3>
              <div className="partner-finder-options">
                {partnershipIntents.map((item) => {
                  const Icon = icons[item.id];
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        dispatch({ type: "intent", intent: item.id })
                      }
                    >
                      <Icon className="partner-option-icon" size={22} />
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </span>
                      <ArrowRight size={18} className="partner-option-arrow" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : step === "duration" ? (
            <>
              <p className="partner-selection-label">{selectedIntent?.label}</p>
              <h3 ref={heading} tabIndex={-1}>
                Are you looking for a one-off activation or an ongoing
                relationship?
              </h3>
              <div className="partner-finder-options partner-duration-options">
                {partnershipDurations.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      dispatch({ type: "duration", duration: item.id })
                    }
                  >
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.detail}</small>
                    </span>
                    <ArrowRight size={18} className="partner-option-arrow" />
                  </button>
                ))}
              </div>
            </>
          ) : recommendation ? (
            <div className="partner-recommendation">
              <span className="partner-selection-label">
                <Check size={16} />
                {selectedIntent?.label}
              </span>
              <h3 ref={heading} tabIndex={-1}>
                Sounds like a {recommendation.name} is a good fit.
              </h3>
              <p>{recommendation.description}</p>
              {intent === "hackathon" && selection.duration === "ongoing" ? (
                <p className="partner-result-emphasis">
                  With first choice on hackathon slots.
                </p>
              ) : null}
              <ContactActions />
              <button
                type="button"
                className="partner-finder-restart"
                onClick={() => dispatch({ type: "reset" })}
              >
                <RotateCcw size={14} />
                Start again
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
