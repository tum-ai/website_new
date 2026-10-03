import { axe } from "@test/axe";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ButtonLink } from "@tum.ai/ui-kit";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { resetRouteImagePreloadForTests } from "@/components/shell/route-image-preload";
import { EventDetailsDialog, type EventDialogTrigger } from "./event-details";
import type { EventDetails } from "./events";
import { categoryLabel } from "./filters";

const details: EventDetails = {
  title: "TUM.ai x Research Lab",
  date: {
    dateTime: "2026-10-10T16:30:00Z",
    long: "10 October 2026",
    short: "10 Oct",
    day: "10",
    month: "October",
    weekday: "Saturday",
    time: "18:30",
  },
  location: "Munich Urban Colab",
  category: "Speaker",
  hosts: ["Campus AI Group"],
  description: "An evening of research demos and discussion.",
};

// jsdom can join the inline lockup spans without the spaces browsers retain.
const accessibleTitle = /^TUM\.ai\s*and\s*Research Lab$/;

const triggerLabel = `Read More about ${details.title}`;

function renderEventDetails(trigger: EventDialogTrigger) {
  return render(
    <div id="app-root">
      <EventDetailsDialog
        details={details}
        trigger={trigger}
        action={<ButtonLink href="/events#register">Register</ButtonLink>}
      >
        {triggerLabel}
      </EventDetailsDialog>
    </div>,
  );
}

describe("event details dialog integration", () => {
  test.each([
    { kind: "button", variant: "outline" },
    { kind: "bare", className: "text-heading-lg" },
  ] satisfies EventDialogTrigger[])(
    "the $kind trigger opens accessible event content and Escape returns focus",
    async (trigger) => {
      const user = userEvent.setup();
      const { baseElement } = renderEventDetails(trigger);
      const opener = screen.getByRole("button", { name: triggerLabel });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(opener);
      const dialog = await screen.findByRole("dialog", {
        name: accessibleTitle,
      });
      expect(dialog).toHaveAccessibleDescription(
        `${details.location}, ${categoryLabel(details.category ?? "Event")}`,
      );
      expect(
        within(dialog).getByRole("heading", {
          name: accessibleTitle,
          level: 2,
        }),
      ).toBeVisible();
      const date = within(dialog).getByText(
        `${details.date.weekday}, ${details.date.long}, ${details.date.time}`,
      );
      expect(date).toHaveAttribute("datetime", details.date.dateTime);
      expect(within(dialog).getByText(details.description)).toBeVisible();
      expect(within(dialog).getByText(details.hosts[0])).toBeVisible();
      expect(
        within(dialog).getByRole("link", { name: "Register" }),
      ).toHaveAttribute("href", "/events#register");
      expect(document.getElementById("app-root")?.inert).toBe(true);
      await waitFor(() =>
        expect(
          within(dialog).getByRole("button", { name: "Close" }),
        ).toHaveFocus(),
      );
      expect(await axe(baseElement)).toHaveNoViolations();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(opener).toHaveFocus();
      expect(document.getElementById("app-root")?.inert).toBe(false);
    },
  );

  test("the visible close control returns focus to the event trigger", async () => {
    const user = userEvent.setup();
    renderEventDetails({ kind: "button", variant: "primary" });
    const opener = screen.getByRole("button", { name: triggerLabel });
    await user.click(opener);
    const dialog = await screen.findByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.getElementById("app-root")?.inert).toBe(false);
  });
});

describe("event details dialog image warm-up", () => {
  const posterSrc =
    "https://cdn.sanity.io/images/o9uuv2sq/test/synthetic-event-poster-800x800.webp";
  /** The images the warm-up created, as the browser would fetch them. */
  let created: { src: string; srcset: string; sizes: string }[];

  beforeEach(() => {
    resetRouteImagePreloadForTests();
    created = [];
    vi.stubGlobal(
      "Image",
      class {
        src = "";
        srcset = "";
        sizes = "";
        fetchPriority = "auto";
        constructor() {
          created.push(this);
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, "connection", {
      value: undefined,
      configurable: true,
    });
  });

  function renderWithPoster() {
    render(
      <EventDetailsDialog
        details={{
          ...details,
          image: { src: posterSrc, alt: "poster" },
        }}
        trigger={{ kind: "bare", className: "" }}
      >
        {triggerLabel}
      </EventDetailsDialog>,
    );
    return screen.getByRole("button", { name: triggerLabel });
  }

  test("pointing at or focusing the trigger loads the dialog's image once", () => {
    const opener = renderWithPoster();
    fireEvent.pointerEnter(opener);
    fireEvent.focus(opener);
    fireEvent.pointerDown(opener);

    expect(created).toStrictEqual([
      expect.objectContaining({
        src: expect.stringContaining(encodeURIComponent(posterSrc)),
        srcset: expect.stringMatching(/\d+w/),
        sizes: "(min-width: 768px) 28rem, 100vw",
        fetchPriority: "high",
      }),
    ]);
  });

  test("leaves the image alone with Save-Data", () => {
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
      configurable: true,
    });
    fireEvent.pointerEnter(renderWithPoster());
    expect(created).toStrictEqual([]);
  });
});
