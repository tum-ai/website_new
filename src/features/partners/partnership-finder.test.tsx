import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  partnershipDurations,
  partnershipFinderCopy,
  partnershipIntents,
  recommendations,
  testPartnershipContact,
} from "./partnership.test-fixtures";
import { PartnershipProvider } from "./partnership-context";
import { PartnershipFinder } from "./partnership-finder";
import { getPartnershipEmailUrl } from "./partnerships";

const [talent, hackathon] = partnershipIntents;
const [oneOff, ongoing] = partnershipDurations;

/** Stubs `matchMedia`; `reducedMotion` answers the reduced-motion query. */
function stubMatchMedia({ reducedMotion }: { reducedMotion: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce")
        ? reducedMotion
        : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  // jsdom has no layout: stub what the finder calls. Reduced motion swaps
  // the steps at once, so the flows below stay synchronous.
  stubMatchMedia({ reducedMotion: true });
  vi.stubGlobal("IntersectionObserver", NoopObserver);
  vi.stubGlobal("ResizeObserver", NoopObserver);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderFinder() {
  const user = userEvent.setup();
  const view = render(
    <PartnershipProvider
      copy={partnershipFinderCopy}
      contact={testPartnershipContact}
    >
      <PartnershipFinder />
    </PartnershipProvider>,
  );
  const heading = () => screen.getByRole("heading", { level: 3 });
  const currentStep = () =>
    within(
      screen.getByRole("list", { name: "Partnership finder progress" }),
    ).getByText((_, node) => node?.getAttribute("aria-current") === "step");
  return { user, heading, currentStep, ...view };
}

test("starts on the goal question with every intent as a button", async () => {
  const { container, heading, currentStep } = renderFinder();
  expect(heading()).toHaveTextContent(
    partnershipFinderCopy.prompts.intentQuestion,
  );
  expect(currentStep()).toHaveTextContent("Your goal");
  for (const intent of partnershipIntents) {
    expect(
      screen.getByRole("button", { name: new RegExp(intent.label) }),
    ).toBeInTheDocument();
  }
  expect(await axe(container)).toHaveNoViolations();
});

test("walks goal, timeframe and fit, moving focus to each step's heading", async () => {
  const { user, container, heading, currentStep } = renderFinder();

  await user.click(
    screen.getByRole("button", { name: new RegExp(talent.label) }),
  );
  expect(heading()).toHaveTextContent(
    partnershipFinderCopy.prompts.durationQuestion,
  );
  expect(heading()).toHaveFocus();
  expect(currentStep()).toHaveTextContent("Your timeframe");
  expect(screen.getByText(talent.label)).toBeInTheDocument();

  await user.click(
    screen.getByRole("button", { name: new RegExp(oneOff.label) }),
  );
  expect(heading()).toHaveTextContent(
    `Try ${recommendations.talent.name} first.`,
  );
  expect(heading()).toHaveFocus();
  expect(currentStep()).toHaveTextContent("Your fit");
  expect(screen.getByText(recommendations.talent.description)).toBeVisible();
  expect(await axe(container)).toHaveNoViolations();
});

test("with motion, the progress moves at once and the old step fades, inert, before the next", async () => {
  stubMatchMedia({ reducedMotion: false });
  const { user, heading, currentStep } = renderFinder();
  const option = screen.getByRole("button", { name: new RegExp(talent.label) });

  await user.click(option);
  expect(currentStep()).toHaveTextContent("Your timeframe");
  expect(option.closest("[inert]")).not.toBeNull();
  expect(heading()).toHaveTextContent(
    partnershipFinderCopy.prompts.intentQuestion,
  );

  const next = await screen.findByRole("heading", {
    level: 3,
    name: partnershipFinderCopy.prompts.durationQuestion,
  });
  expect(next).toHaveFocus();
  expect(next.closest("[inert]")).toBeNull();
});

test("keeps the leaving step's answers while it fades", async () => {
  stubMatchMedia({ reducedMotion: false });
  const { user } = renderFinder();
  await user.click(
    screen.getByRole("button", { name: new RegExp(talent.label) }),
  );
  await screen.findByRole("button", { name: "Back" });

  await user.click(screen.getByRole("button", { name: "Back" }));
  // Back clears the goal; the fading step still names it.
  expect(screen.getByText(talent.label).tagName).toBe("P");
  await screen.findByRole("heading", {
    level: 3,
    name: partnershipFinderCopy.prompts.intentQuestion,
  });
});

test("hands the answers to the email and offers a call", async () => {
  const { user } = renderFinder();
  await user.click(
    screen.getByRole("button", { name: new RegExp(hackathon.label) }),
  );
  await user.click(
    screen.getByRole("button", { name: new RegExp(ongoing.label) }),
  );

  expect(
    screen.getByRole("heading", { level: 3, name: /first/ }),
  ).toHaveTextContent(recommendations.longTerm.name);
  expect(
    screen.getByText(partnershipFinderCopy.prompts.firstChoice),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Request via email" }),
  ).toHaveAttribute(
    "href",
    getPartnershipEmailUrl(
      { intent: "hackathon", duration: "ongoing" },
      partnershipFinderCopy,
      testPartnershipContact,
    ),
  );
  expect(screen.getByRole("button", { name: "Book a call" })).toBeVisible();
});

test("Back returns to the previous question and Start again clears the answers", async () => {
  const { user, heading } = renderFinder();
  await user.click(
    screen.getByRole("button", { name: new RegExp(talent.label) }),
  );
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(heading()).toHaveTextContent(
    partnershipFinderCopy.prompts.intentQuestion,
  );
  expect(heading()).toHaveFocus();
  expect(screen.queryByRole("button", { name: "Back" })).toBeNull();

  await user.click(
    screen.getByRole("button", { name: new RegExp(talent.label) }),
  );
  await user.click(
    screen.getByRole("button", { name: new RegExp(ongoing.label) }),
  );
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(heading()).toHaveTextContent(
    partnershipFinderCopy.prompts.durationQuestion,
  );

  await user.click(
    screen.getByRole("button", { name: new RegExp(ongoing.label) }),
  );
  await user.click(screen.getByRole("button", { name: "Start again" }));
  expect(heading()).toHaveTextContent(
    partnershipFinderCopy.prompts.intentQuestion,
  );
  expect(heading()).toHaveFocus();
  expect(screen.queryByRole("link", { name: "Request via email" })).toBeNull();
});

// The Studio accepts whitespace inside the braces (`copy-fields.ts`).
test.each(["Try {{format}} first.", "Try {{ format }} first."])(
  "asks the questions the page's copy passes in (%s)",
  async (resultQuestion) => {
    const user = userEvent.setup();
    render(
      <PartnershipProvider
        contact={testPartnershipContact}
        copy={{
          ...partnershipFinderCopy,
          prompts: {
            ...partnershipFinderCopy.prompts,
            intentQuestion: "What brings you here?",
            resultQuestion,
          },
        }}
      >
        <PartnershipFinder />
      </PartnershipProvider>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "What brings you here?",
    );
    await user.click(
      screen.getByRole("button", { name: new RegExp(talent.label) }),
    );
    await user.click(
      screen.getByRole("button", { name: new RegExp(oneOff.label) }),
    );
    const result = screen.getByRole("heading", { level: 3 });
    expect(result).toHaveTextContent(
      `Try ${recommendations.talent.name} first.`,
    );
    expect(within(result).getByText(recommendations.talent.name)).toBeVisible();
  },
);

test("puts the recommended format at every {{format}} of the result question", async () => {
  const user = userEvent.setup();
  render(
    <PartnershipProvider
      contact={testPartnershipContact}
      copy={{
        ...partnershipFinderCopy,
        prompts: {
          ...partnershipFinderCopy.prompts,
          resultQuestion: "Try {{format}}. Ready for {{ format }}?",
        },
      }}
    >
      <PartnershipFinder />
    </PartnershipProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: new RegExp(talent.label) }),
  );
  await user.click(
    screen.getByRole("button", { name: new RegExp(oneOff.label) }),
  );
  const { name } = recommendations.talent;
  const result = screen.getByRole("heading", { level: 3 });
  expect(result).toHaveTextContent(`Try ${name}. Ready for ${name}?`);
  expect(within(result).getAllByText(name)).toHaveLength(2);
});
