import { axe } from "@test/axe";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MemberFaces, type QuotedMember } from "./member-faces";

const members: QuotedMember[] = [
  {
    key: "first",
    name: "Example Member",
    role: "First programme",
    excerpt: "We built a prototype.",
    image: "/assets/fixtures/photo.svg",
  },
  {
    key: "second",
    name: "Example Member",
    role: "Second programme",
    excerpt: "We organized a workshop.",
    image: "/assets/fixtures/photo.svg",
  },
];

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => ({ matches: true, media })),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

function renderFaces() {
  return render(
    <MemberFaces
      members={members}
      link={<a href="/community">Member stories</a>}
    />,
  );
}

test("the first CMS member is selected with no unsolicited live announcement", async () => {
  const { container } = renderFaces();
  const buttons = screen.getAllByRole("button", { name: "Example Member" });
  expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText("“We built a prototype.”")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
  expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement();
  expect(await axe(container)).toHaveNoViolations();
});

test("keyboard focus selects the matching quote even when names coincide", async () => {
  const user = userEvent.setup();
  const { container } = renderFaces();
  const buttons = screen.getAllByRole("button", { name: "Example Member" });
  await user.tab();
  await user.tab();
  expect(buttons[1]).toHaveFocus();
  expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
  expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText("“We organized a workshop.”")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
  expect(screen.getByText("Second programme").parentElement).toHaveAttribute(
    "aria-hidden",
    "false",
  );
  expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
    "Example Member: “We organized a workshop.”",
  );
  expect(await axe(container)).toHaveNoViolations();
});

test("pointer position picks a resting slot and repeated intent keeps that selection", () => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  renderFaces();
  const row = screen.getByRole("group", { name: "Members quoted" });
  vi.spyOn(row, "getBoundingClientRect").mockReturnValue({
    left: 100,
    height: 64,
  } as DOMRect);
  fireEvent.pointerMove(row, { clientX: 190 });
  fireEvent.pointerDown(row, { clientX: 190 });
  expect(
    screen.getAllByRole("button", { name: "Example Member" })[1],
  ).toHaveAttribute("aria-pressed", "true");
  expect(requestAnimationFrame).toHaveBeenCalledOnce();
});

test("keyboard activation restores the focused face after pointer intent changed the quote", async () => {
  const user = userEvent.setup();
  vi.stubGlobal("PointerEvent", MouseEvent);
  renderFaces();
  const row = screen.getByRole("group", { name: "Members quoted" });
  vi.spyOn(row, "getBoundingClientRect").mockReturnValue({
    left: 100,
    height: 64,
  } as DOMRect);
  const buttons = screen.getAllByRole("button", { name: "Example Member" });
  await user.tab();
  fireEvent.pointerMove(row, { clientX: 190 });
  expect(buttons[0]).toHaveFocus();
  expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
  await user.keyboard("{Enter}");
  expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  fireEvent.pointerMove(row, { clientX: 190 });
  await user.keyboard(" ");
  expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
});
