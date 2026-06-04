import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schema } from "./schemas";

export default defineConfig({
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  title: "Website Content",
  schema,
  plugins: [structureTool()],
});