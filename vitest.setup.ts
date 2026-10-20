// Setup for the `jsdom` project (component tests).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";
import { toHaveNoViolations } from "./test/axe";

expect.extend({ toHaveNoViolations });

afterEach(() => {
  cleanup();
});
