import { expect, test } from "vitest";
import { getPartnerKey } from "./partner-key";

test("one organisation's spellings share a key", () => {
  for (const [a, b] of [
    ["Hudson River Trading", "HRT"],
    ["aws", "Amazon Web Services"],
    ["manage-and-more", "Manage and More"],
    ["helmholtz-munich", "Helmholtz Zentrum"],
    ["Helmholtz Munich", "Helmholtz Center Munich"],
    ["Helmholtz", "Helmholtz Munich"],
  ]) {
    expect(getPartnerKey(a ?? ""), `${a} = ${b}`).toBe(getPartnerKey(b ?? ""));
  }
});
