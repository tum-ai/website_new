import { expect, test } from "vitest";
import { validateRequiredAlt } from "./image-rules";

const uploaded = { asset: { _ref: "image-abc-240x80-svg" } };

test("alt text is required once a file is uploaded", () => {
  expect(validateRequiredAlt(undefined, { parent: uploaded })).toMatch(
    /Describe the image/,
  );
  expect(validateRequiredAlt("  ", { parent: uploaded })).toMatch(
    /Describe the image/,
  );
  expect(validateRequiredAlt("Accel logo", { parent: uploaded })).toBe(true);
});

test("an image left empty asks for no alt text", () => {
  expect(validateRequiredAlt(undefined, { parent: undefined })).toBe(true);
  expect(validateRequiredAlt(undefined, { parent: { _type: "image" } })).toBe(
    true,
  );
});
