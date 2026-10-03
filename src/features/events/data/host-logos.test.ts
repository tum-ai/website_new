import { expect, test } from "vitest";
import { hostArtworkOf } from "./host-logos";

test("wordmarks use optical aspect and symbol-only logos become icons", () => {
  expect(
    hostArtworkOf([
      {
        key: "word",
        name: "Word",
        logoOnDark: {
          src: "/assets/fixtures/logo.svg",
          alt: "Word",
          width: 200,
          height: 80,
          aspectRatio: 3,
        },
      },
      {
        key: "icon",
        name: "Icon",
        logoOnDark: {
          src: "/assets/fixtures/logo.svg",
          alt: "Icon",
          width: 200,
          height: 80,
          symbolOnly: true,
        },
      },
      { key: "plain", name: "Plain" },
    ]),
  ).toEqual({
    logos: { word: { src: "/assets/fixtures/logo.svg", aspect: 3 } },
    icons: { icon: "/assets/fixtures/logo.svg" },
  });
});
