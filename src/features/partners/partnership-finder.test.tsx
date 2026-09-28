import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  partnershipDurations,
  partnershipIntents,
  recommendations,
} from "./data/partners";
import { PartnershipProvider } from "./partnership-context";
import { PartnershipFinder } from "./partnership-finder";
import { getPartnershipEmailUrl } from "./partnerships";

const [talent, hackathon] = partnershipIntents;
const [oneOff, ongoing] = partnershipDurations;

beforeEach(() => {
  // jsdom has no layout: stub what the finder and the ds Reveal call.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderFinder() {
  const user = userEvent.setup();
  const view = render(
    <PartnershipProvider>
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
  expect(heading()).toHaveTextContent("What matters most to you right now?");
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
  expect(heading()).toHaveTextContent(/one-off activation or an ongoing/);
  expect(heading()).toHaveFocus();
  expect(currentStep()).toHaveTextContent("Your timeframe");
  expect(screen.getByText(talent.label)).toBeInTheDocument();

  await user.click(
    screen.getByRole("button", { name: new RegExp(oneOff.label) }),
  );
  expect(heading()).toHaveTextContent(
    `Sounds like a ${recommendations.talent.name} is a good fit.`,
  );
  expect(heading()).toHaveFocus();
  expect(currentStep()).toHaveTextContent("Your fit");
  expect(screen.getByText(recommendations.talent.description)).toBeVisible();
  expect(await axe(container)).toHaveNoViolations();
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
    screen.getByRole("heading", { level: 3, name: /is a good fit/ }),
  ).toHaveTextContent(recommendations.longTerm.name);
  expect(
    screen.getByText("With first choice on hackathon slots."),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Request via email" }),
  ).toHaveAttribute(
    "href",
    getPartnershipEmailUrl({ intent: "hackathon", duration: "ongoing" }),
  );
  expect(screen.getByRole("button", { name: "Book a call" })).toBeVisible();
});

test("Back returns to the previous question and Start again clears the answers", async () => {
  const { user, heading } = renderFinder();
  await user.click(
    screen.getByRole("button", { name: new RegExp(talent.label) }),
  );
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(heading()).toHaveTextContent("What matters most to you right now?");
  expect(heading()).toHaveFocus();
  expect(screen.queryByRole("button", { name: "Back" })).toBeNull();

  await user.click(
    screen.getByRole("button", { name: new RegExp(talent.label) }),
  );
  await user.click(
    screen.getByRole("button", { name: new RegExp(ongoing.label) }),
  );
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(heading()).toHaveTextContent(/one-off activation or an ongoing/);

  await user.click(
    screen.getByRole("button", { name: new RegExp(ongoing.label) }),
  );
  await user.click(screen.getByRole("button", { name: "Start again" }));
  expect(heading()).toHaveTextContent("What matters most to you right now?");
  expect(heading()).toHaveFocus();
  expect(screen.queryByRole("link", { name: "Request via email" })).toBeNull();
});
