import { describe, expect, test } from "vitest";
import { personRoleLine } from "./people-and-logos";

describe("personRoleLine", () => {
  const accel = { name: "Accel" };
  const harvard = { name: "Harvard University", shortName: "Harvard" };

  test("adds the organisation a role is held at", () => {
    expect(personRoleLine("Partner", accel, true)).toBe("Partner @ Accel");
    expect(personRoleLine("Fellow ", harvard, true)).toBe("Fellow @ Harvard");
  });

  test("shows a role held elsewhere, or without an organisation, as written", () => {
    // A founder quoted under an investor's logo names the startup itself.
    expect(
      personRoleLine(
        "Co-Founder @ Spherecast",
        { name: "Y Combinator" },
        false,
      ),
    ).toBe("Co-Founder @ Spherecast");
    expect(personRoleLine("Computer Science, TUM", null, undefined)).toBe(
      "Computer Science, TUM",
    );
    // An unresolved organisation leaves the position alone.
    expect(personRoleLine("Partner", null, true)).toBe("Partner");
  });
});
