import { describe, expect, test } from "vitest";
import { hackathonsFixture as hackathonsCopyTemplate } from "@/lib/cms-fixtures/hackathons";
import { finaleView } from "./hackathons-view";

const copy = hackathonsCopyTemplate.league.finale;
const match = { city: "Munich", start: "2026-10-10", end: "2026-10-11" };
const recapPhoto = {
  src: "/finale.webp",
  width: 1600,
  height: 1067,
  alt: "The champions on stage",
};

describe("finaleView", () => {
  test("before it: the poster, a countdown and the way to follow it", () => {
    const view = finaleView(copy, match, "2026-10-02");
    expect(view.phase).toBe("upcoming");
    expect(view.countdown).toBe("In 8 days");
    expect(view.text).toBe(copy.text);
    expect(view.actionLabel).toBe(copy.actionLabel);
    expect(view.image).toBe(copy.poster);
    expect(view.result).toBeUndefined();
  });

  test("on both days: live", () => {
    for (const today of ["2026-10-10", "2026-10-11"]) {
      const view = finaleView(copy, match, today);
      expect(view.phase).toBe("live");
      expect(view.countdown).toBe(copy.liveLabel);
    }
  });

  test("after it, before the result is in: decided, with the standings link", () => {
    const view = finaleView(
      { ...copy, champion: "  ", recapPhoto },
      match,
      "2026-10-12",
    );
    expect(view.phase).toBe("decided");
    expect(view.countdown).toBeUndefined();
    expect(view.text).toBe(copy.pastText);
    expect(view.actionLabel).toBe(copy.standingsLabel);
    // The recap photo waits for the champion.
    expect(view.image).toBe(copy.poster);
  });

  test("once editors enter the champion: the result and the recap photo", () => {
    const view = finaleView(
      {
        ...copy,
        champion: "TakeTheMoneyAndRun",
        runnersUp: ["bussies", " ", "Harissa & Oasis"],
        recapPhoto,
        recapCaption: "The champions on stage in Munich.",
      },
      match,
      "2026-10-12",
    );
    expect(view.phase).toBe("champion");
    expect(view.text).toBeUndefined();
    expect(view.image).toBe(recapPhoto);
    expect(view.caption).toBe("The champions on stage in Munich.");
    expect(view.result).toStrictEqual({
      label: copy.championLabel,
      champion: "TakeTheMoneyAndRun",
      runnersUpLabel: copy.runnersUpLabel,
      runnersUp: ["bussies", "Harissa & Oasis"],
    });
  });

  test("a champion entered early shows nothing until the finale is over", () => {
    const view = finaleView(
      { ...copy, champion: "TakeTheMoneyAndRun" },
      match,
      "2026-10-11",
    );
    expect(view.phase).toBe("live");
    expect(view.result).toBeUndefined();
  });

  test("the champion without a recap photo keeps the poster", () => {
    const view = finaleView(
      { ...copy, champion: "TakeTheMoneyAndRun" },
      match,
      "2026-10-12",
    );
    expect(view.image).toBe(copy.poster);
    expect(view.caption).toBeUndefined();
  });
});
