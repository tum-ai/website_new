import { axe } from "@test/axe";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { stubMatchMedia, stubObservers } from "./testing";

function Page({ variant }: { variant?: "modal" | "fullscreen" }) {
  return (
    <div id="app-root">
      <a href="#behind">Link behind the dialog</a>
      <Dialog>
        <DialogTrigger>Open details</DialogTrigger>
        <DialogContent variant={variant}>
          <DialogTitle>Event details</DialogTitle>
          <DialogDescription>Where and when.</DialogDescription>
          <button type="button">Register</button>
          <DialogClose>Done</DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

beforeEach(() => {
  stubMatchMedia();
  stubObservers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openDialog() {
  const user = userEvent.setup();
  render(<Page />);
  const trigger = screen.getByRole("button", { name: "Open details" });
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Event details" });
  return { user, trigger, dialog };
}

describe("Dialog", () => {
  test("opens a named, described modal dialog", async () => {
    const { dialog } = await openDialog();
    expect(dialog).toHaveAccessibleDescription("Where and when.");
  });

  test("makes the page behind it inert while open", async () => {
    const { user } = await openDialog();
    const root = document.getElementById("app-root");
    expect(root?.inert).toBe(true);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(root?.inert).toBe(false));
  });

  test("traps focus inside the dialog", async () => {
    const { user, dialog } = await openDialog();
    const focusIsInside = () =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await waitFor(focusIsInside);
    for (let step = 0; step < 6; step += 1) {
      await user.tab();
      await waitFor(focusIsInside);
    }
    for (let step = 0; step < 3; step += 1) {
      await user.tab({ shift: true });
      await waitFor(focusIsInside);
    }
  });

  test("closes on Escape and returns focus to the trigger", async () => {
    const { user, trigger } = await openDialog();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test("has a labelled close button", async () => {
    const { user } = await openDialog();
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("fullscreen variant has no corner close button by default", async () => {
    const user = userEvent.setup();
    render(<Page variant="fullscreen" />);
    await user.click(screen.getByRole("button", { name: "Open details" }));
    await screen.findByRole("dialog", { name: "Event details" });
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  test("has no axe violations while open", async () => {
    const { dialog } = await openDialog();
    expect(await axe(dialog)).toHaveNoViolations();
  });
});
