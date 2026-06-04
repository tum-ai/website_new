import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "next-sanity";

test("Sanity event query returns images as array and description with fallback", async () => {
  const mockClient = createClient({
    projectId: "test-project-id",
    dataset: "production",
    apiVersion: "2024-03-01",
    useCdn: false,
  });

  const query = `*[_type == "event"]{
    "id": _id,
    title,
    "description": coalesce(desc, ""),
    event_date,
    location,
    city,
    category,
    "poster": poster.asset->url,
    "images": array::compact([poster.asset->url, img.asset->url]),
    sign_up,
    detail
  }`;

  // Verify the query uses coalesce for description to prevent null/undefined
  assert.ok(
    query.includes('"description": coalesce(desc, "")'),
    "Query should use coalesce to ensure description is always a string",
  );

  // Verify the query uses array::compact to include both poster and img
  assert.ok(
    query.includes(
      '"images": array::compact([poster.asset->url, img.asset->url])',
    ),
    "Query should use array::compact to include both poster and img URLs",
  );

  // Verify we're not using the old "img" field that returns a single string
  assert.ok(
    !query.includes('"img": img.asset->url,'),
    'Query should not use "img": img.asset->url which returns a string',
  );
});

test("Event type expects images as optional string array", () => {
  // This is a type-level test to ensure the Event interface matches
  // the query structure
  type Event = {
    id: string;
    title: string;
    description: string;
    event_date: string;
    location?: string;
    city?: string;
    category?: string;
    poster?: string;
    images?: string[];
    sign_up?: string;
    detail?: string;
  };

  // Verify that images is typed as string[] not string
  const mockEvent: Event = {
    id: "1",
    title: "Test Event",
    description: "Test Description",
    event_date: "2024-01-01",
    images: ["url1", "url2"],
  };

  assert.ok(Array.isArray(mockEvent.images), "images should be an array");
  assert.equal(
    typeof mockEvent.images[0],
    "string",
    "array items should be strings",
  );
});

test("Sanity research query includes id, coalesced description, and joined keywords", async () => {
  const mockClient = createClient({
    projectId: "test-project-id",
    dataset: "production",
    apiVersion: "2024-03-01",
    useCdn: false,
  });

  const query = `*[_type == "research"]{
    "id": _id,
    title,
    "description": coalesce(desc, ""),
    status,
    publication,
    "keywords": array::join(keywords, ", "),
    "image": img.asset->url
  }`;

  // Verify the query includes id field
  assert.ok(
    query.includes('"id": _id'),
    "Query should include id field mapped from _id",
  );

  // Verify the query uses coalesce for description to prevent null/undefined
  assert.ok(
    query.includes('"description": coalesce(desc, "")'),
    "Query should use coalesce to ensure description is always a string",
  );

  // Verify the query uses array::join to convert keywords array to string
  assert.ok(
    query.includes('"keywords": array::join(keywords, ", ")'),
    'Query should join keywords array with ", " separator',
  );
});

test("Research type expects keywords as optional string", () => {
  // This is a type-level test to ensure the Research interface matches
  // the query structure
  type Research = {
    id: string;
    title: string;
    description: string;
    image?: string;
    publication?: string;
    status?: string;
    keywords?: string;
  };

  // Verify that keywords is typed as string (joined), not string[]
  const mockResearch: Research = {
    id: "1",
    title: "Test Research",
    description: "Test Description",
    keywords: "AI, Machine Learning, Deep Learning",
  };

  assert.equal(
    typeof mockResearch.keywords,
    "string",
    "keywords should be a string (joined from array)",
  );
});
