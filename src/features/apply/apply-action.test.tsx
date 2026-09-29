import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { membershipConfig } from "@/config/membership";
import { ApplyAction } from "./apply-action";

describe("ApplyAction", () => {
  test("links to the application form while the call is open", async () => {
    const { container } = render(
      <ApplyAction phase="open" statusId="status" closedLabel="unused" />,
    );
    expect(screen.getByRole("link", { name: /Apply now/ })).toHaveAttribute(
      "href",
      membershipConfig.applicationUrl,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  test.each([
    ["upcoming", "Opens 28 September"],
    ["closed", "Applications closed"],
  ] as const)(
    "while %s, the button stays focusable and says why it is unavailable",
    async (phase, label) => {
      const { container } = render(
        <ApplyAction phase={phase} statusId="status" closedLabel={label} />,
      );
      const button = screen.getByRole("button", { name: "Apply now" });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveAccessibleDescription(label);
      expect(screen.queryByRole("link")).toBeNull();
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
