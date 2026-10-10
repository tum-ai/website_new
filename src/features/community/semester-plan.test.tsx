import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { stageSteps } from "@/lib/community-model";
import { getCommunityContent } from "./content";
import { stepAnchor } from "./data/member-journey";
import { getMemberStories } from "./people-content";

import { SemesterPlan } from "./semester-plan";

let content: Awaited<ReturnType<typeof getCommunityContent>>;
let stories: Awaited<ReturnType<typeof getMemberStories>>;
beforeAll(async () => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  content = await getCommunityContent();
  stories = await getMemberStories();
});
afterAll(() => vi.unstubAllEnvs());
const steps = () => content.journey.flatMap(stageSteps);

/** Reveal needs matchMedia and an IntersectionObserver; nothing intersects. */
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const Plan = () => (
  <SemesterPlan
    copy={content.copy.journey}
    journey={content.journey}
    stories={stories}
  />
);

describe("SemesterPlan", () => {
  test("lists every journey step in order under the section heading", async () => {
    const { container } = render(<Plan />);
    expect(
      screen.getByRole("region", {
        name: content.copy.journey.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toStrictEqual(steps().map((step) => step.name));
    expect(await axe(container)).toHaveNoViolations();
  });

  test("keeps each step's anchor for deep links", () => {
    render(<Plan />);
    for (const step of steps()) {
      const heading = screen.getByRole("heading", { name: step.name });
      expect(heading.closest(`#${stepAnchor(step.step)}`)).not.toBeNull();
    }
  });

  test("says in words when each step opens, since the columns are decorative", () => {
    render(<Plan />);
    for (const step of steps()) {
      const row = document.getElementById(stepAnchor(step.step));
      expect(row).toHaveTextContent(
        step.fromSemester === 0
          ? "Once, at the start"
          : `From semester ${step.fromSemester}`,
      );
    }
  });

  test("quotes the members named as evidence, with their names", () => {
    render(<Plan />);
    for (const step of steps()) {
      if (!step.evidence) continue;
      const row = document.getElementById(stepAnchor(step.step));
      const story = stories.find((entry) => entry.key === step.evidence?.key);
      expect(row).toHaveTextContent(step.evidence.excerpt);
      expect(row).toHaveTextContent(`${story?.name}, ${story?.role}`);
    }
  });
});

test("a duplicate display name cannot change a quoted member's byline", () => {
  const quoted = stories[0];
  if (!quoted) throw new Error("expected a member fixture");
  const { container } = render(
    <SemesterPlan
      copy={content.copy.journey}
      journey={content.journey}
      stories={[
        { ...quoted, key: "another-member", role: "Unrelated role" },
        quoted,
      ]}
    />,
  );
  expect(container.querySelector("figcaption")).toHaveTextContent(
    `${quoted.name}, ${quoted.role}`,
  );
  expect(screen.queryByText(/Unrelated role/)).toBeNull();
});
