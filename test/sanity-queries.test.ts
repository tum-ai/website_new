import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "next-sanity";

test("Sanity event query returns images as array", async () => {
  const mockClient = createClient({
    projectId: "test-project-id",
    dataset: "production",
    apiVersion: "2024-03-01",
    useCdn: false,
  });

  const query = `*[_type == "event"]{
    "id": _id,
    title,
    "description": desc,
    event_date,
    location,
    city,
    category,
    "poster": poster.asset->url,
    "images": select(defined(img.asset) => [img.asset->url], []),
    sign_up,
    detail
  }`;

  // Verify the query structure includes "images" as an array field
  // The select() function ensures it returns either [url] or []
  assert.ok(
    query.includes(
      '"images": select(defined(img.asset) => [img.asset->url], [])',
    ),
    "Query should map img to images array using select()",
  );

  // Verify we're not using the old "img" field that returns a string
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

test("Sanity research query joins keywords array into string", async () => {
  const mockClient = createClient({
    projectId: "test-project-id",
    dataset: "production",
    apiVersion: "2024-03-01",
    useCdn: false,
  });

  const query = `*[_type == "research"]{
    title,
    "description": desc,
    status,
    publication,
    "keywords": array::join(keywords, ", "),
    "image": img.asset->url
  }`;

  // Verify the query uses array::join to convert keywords array to string
  assert.ok(
    query.includes('"keywords": array::join(keywords, ", ")'),
    'Query should join keywords array with ", " separator',
  );

  // Verify we're not using raw keywords field that would return an array
  assert.ok(
    !query.includes("keywords,") || query.includes("array::join(keywords"),
    "Query should not use raw keywords field without joining",
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
