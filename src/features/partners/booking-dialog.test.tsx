import { axe } from "@test/axe";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ContactActions } from "./contact-actions";
import {
  partnershipFinderCopy,
  testPartnershipContact,
} from "./partnership.test-fixtures";
import { PartnershipProvider } from "./partnership-context";
import {
  getPartnershipEmailUrl,
  type PartnershipContact,
} from "./partnerships";

/*
 * The Cal.eu embed is a third-party script: the mock renders a placeholder
 * and records the listeners the dialog registers, so a test can report the
 * calendar as ready or failed.
 */
const cal = vi.hoisted(() => ({
  listeners: new Map<string, () => void>(),
  getCalApi: vi.fn(),
}));

vi.mock("@calcom/embed-react", () => ({
  default: ({ calLink }: { calLink: string }) => (
    <div data-testid="cal-embed" data-cal-link={calLink} />
  ),
  getCalApi: cal.getCalApi,
}));

const dialogName = partnershipFinderCopy.prompts.bookingTitle;

beforeEach(() => {
  cal.listeners.clear();
  cal.getCalApi.mockImplementation(
    async () =>
      (command: string, options: { action: string; callback: () => void }) => {
        if (command === "on")
          cal.listeners.set(options.action, options.callback);
      },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function renderContact(contact: PartnershipContact = testPartnershipContact) {
  const user = userEvent.setup();
  const view = render(
    <div id="app-root">
      <PartnershipProvider copy={partnershipFinderCopy} contact={contact}>
        <ContactActions />
      </PartnershipProvider>
    </div>,
  );
  const trigger = screen.getByRole("button", { name: "Book a call" });
  return { user, trigger, ...view };
}

async function openBooking() {
  const context = renderContact();
  await context.user.click(context.trigger);
  const dialog = await screen.findByRole("dialog", { name: dialogName });
  return { ...context, dialog };
}

test("loads the dialog and the calendar embed only once a call is requested", async () => {
  const { user, trigger } = renderContact();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByTestId("cal-embed")).toBeNull();
  expect(cal.getCalApi).not.toHaveBeenCalled();

  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: dialogName });
  expect(dialog).toHaveAccessibleDescription(
    new RegExp(testPartnershipContact.bookingHost),
  );
  expect(screen.getByTestId("cal-embed")).toHaveAttribute(
    "data-cal-link",
    new URL(testPartnershipContact.bookingUrl).pathname.slice(1),
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Loading available times…",
  );
});

test("reports a ready calendar to screen readers only", async () => {
  const { dialog } = await openBooking();
  await waitFor(() => expect(cal.listeners.has("linkReady")).toBe(true));
  act(() => cal.listeners.get("linkReady")?.());
  expect(screen.getByRole("status")).toHaveTextContent("Calendar ready.");
  expect(screen.getByRole("status")).toHaveClass("sr-only");
  expect(await axe(dialog)).toHaveNoViolations();
});

test("offers the booking page and email when the embed fails", async () => {
  const { dialog } = await openBooking();
  await waitFor(() => expect(cal.listeners.has("linkFailed")).toBe(true));
  act(() => cal.listeners.get("linkFailed")?.());

  expect(screen.getByRole("status")).toHaveTextContent(
    partnershipFinderCopy.prompts.bookingSlow,
  );
  expect(
    screen.getByRole("link", { name: /Open booking page/ }),
  ).toHaveAttribute(
    "href",
    expect.stringMatching(
      new RegExp(
        `^${testPartnershipContact.bookingUrl.replaceAll(".", "\\.")}\\?`,
      ),
    ),
  );
  expect(
    screen.getByRole("link", { name: "Email us instead" }),
  ).toHaveAttribute(
    "href",
    getPartnershipEmailUrl(
      { intent: null, duration: null },
      partnershipFinderCopy,
      testPartnershipContact,
    ),
  );
  expect(await axe(dialog)).toHaveNoViolations();
});

test("falls back when the embed never answers", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  await openBooking();
  expect(screen.getByRole("status")).toHaveTextContent(
    "Loading available times…",
  );
  act(() => vi.advanceTimersByTime(15_000));
  expect(screen.getByRole("status")).toHaveTextContent(
    partnershipFinderCopy.prompts.bookingSlow,
  );
});

test("returns focus to the button that opened it", async () => {
  const { user, trigger } = await openBooking();
  await user.click(screen.getByRole("button", { name: /close/i }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger).toHaveFocus();

  // A second request reopens the already loaded dialog.
  await user.click(trigger);
  expect(
    await screen.findByRole("dialog", { name: dialogName }),
  ).toBeInTheDocument();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(trigger).toHaveFocus();
});

test("never loads an embed script from a booking page off Cal", async () => {
  const { user, trigger } = renderContact({
    ...testPartnershipContact,
    bookingUrl: "https://evil.example/ada/intro",
  });
  await user.click(trigger);
  await screen.findByRole("dialog", { name: dialogName });
  expect(screen.queryByTestId("cal-embed")).toBeNull();
  expect(cal.getCalApi).not.toHaveBeenCalled();
  expect(
    screen.getByRole("link", { name: "Email us instead" }),
  ).toBeInTheDocument();
});
