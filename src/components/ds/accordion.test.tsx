import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { FaqList } from "./accordion";

const items = [
  { question: "Who can apply?", answer: "Every student in Munich." },
  { question: "Does it cost anything?", answer: "No, membership is free." },
];

describe("FaqList", () => {
  test("renders each question as a heading around a collapsed button", () => {
    render(<FaqList items={items} />);
    const heading = screen.getByRole("heading", {
      level: 3,
      name: "Who can apply?",
    });
    const trigger = screen.getByRole("button", { name: "Who can apply?" });
    expect(heading).toContainElement(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("keeps closed answers in the DOM as hidden until found", () => {
    render(<FaqList items={items} />);
    const answer = screen.getByText("Every student in Munich.");
    const panel = answer.closest("[hidden]");
    expect(panel).toHaveAttribute("hidden", "until-found");
  });

  test("opens and closes an answer with the keyboard", async () => {
    const user = userEvent.setup();
    render(<FaqList items={items} />);
    const trigger = screen.getByRole("button", { name: "Who can apply?" });

    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Every student in Munich.")).toBeVisible();

    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("reaches every question with Tab, skipping closed answers", async () => {
    const user = userEvent.setup();
    render(
      <FaqList
        items={[
          ...items,
          { question: "Where?", answer: <a href="#map">On the map</a> },
        ]}
      />,
    );
    await user.tab();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Does it cost anything?" }),
    ).toHaveFocus();
    await user.tab();
    // The closed answer's link is hidden, so focus goes to the next question.
    expect(screen.getByRole("button", { name: "Where?" })).toHaveFocus();
  });

  test("uses the requested heading level", () => {
    render(<FaqList items={items} headingAs="h4" />);
    expect(
      screen
        .getAllByRole("heading", { level: 4 })
        .map((node) => node.textContent),
    ).toEqual(["Who can apply?", "Does it cost anything?"]);
  });

  test("has no axe violations", async () => {
    const { container } = render(<FaqList items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
