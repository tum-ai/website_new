import { communityFixtureDocuments } from "./community";
import { hackathonsFixtureDocuments } from "./hackathons";
import { organizationsFixtureDocuments } from "./organizations";
import { programmesFixtureDocuments } from "./programmes";
import { settingsFixtureDocuments } from "./settings";
import type { CmsFixtureDocument } from "./types";

const asset = (
  id: string,
  url: string,
  width: number,
  height: number,
): CmsFixtureDocument => ({
  _id: id,
  _type: "sanity.imageAsset",
  url,
  metadata: { dimensions: { width, height, aspectRatio: width / height } },
});

/** Small synthetic published dataset; never imported outside the literal mock gate. */
export function getFixtureDocuments(): CmsFixtureDocument[] {
  return [
    ...settingsFixtureDocuments,
    ...organizationsFixtureDocuments,
    ...communityFixtureDocuments,
    ...programmesFixtureDocuments,
    ...hackathonsFixtureDocuments,
    asset("fixture-photo", "/assets/fixtures/photo.svg", 960, 640),
    asset("fixture-logo", "/assets/fixtures/logo.svg", 200, 80),
  ];
}
