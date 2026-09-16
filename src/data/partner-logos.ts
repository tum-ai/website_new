import type { Partner } from "../lib/types";

// These brief-approved defaults also keep the core wall available before CMS backfill.
export const featuredPartners: Partner[] = [
  {
    id: "openai",
    name: "OpenAI",
    tier: "gold",
    image: "/assets/partners/logos/openai-wordmark.webp",
    link: "https://openai.com/",
  },
  {
    id: "google",
    name: "Google",
    tier: "gold",
    image: "/assets/partners/logos/google.webp",
    link: "https://about.google/",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tier: "gold",
    image: "/assets/partners/logos/anthropic.webp",
    link: "https://www.anthropic.com/",
  },
  {
    id: "hrt",
    name: "Hudson River Trading",
    tier: "gold",
    image: "/assets/partners/logos/hrt.webp",
    link: "https://www.hudsonrivertrading.com/",
  },
  {
    id: "jetbrains",
    name: "JetBrains",
    tier: "gold",
    image: "/assets/partners/logos/jetbrains.svg",
    link: "https://www.jetbrains.com/",
  },
  {
    id: "unite",
    name: "Unite",
    tier: "gold",
    image: "/assets/partners/logos/unite.webp",
    link: "https://unite.eu/",
  },
  {
    id: "spherecast",
    name: "Spherecast",
    tier: "silver",
    image: "/assets/e-lab/startups/Spherecast.webp",
    link: "https://spherecast.ai/",
  },
  {
    id: "dryft",
    name: "Dryft",
    tier: "silver",
    image: "/assets/partners/logos/dryft.webp",
    link: "https://dryft.ai/",
  },
  {
    id: "reply",
    name: "Reply",
    tier: "silver",
    image: "/assets/partners/logos/reply.webp",
    link: "https://www.reply.com/",
  },
  {
    id: "mutagent",
    name: "Mutagent",
    tier: "bronze",
    image: "/assets/partners/logos/mutagent.svg",
    link: "https://mutagent.io/",
  },
];

export const alumniDestinations = [
  { name: "OpenAI", image: "/assets/partners/logos/openai-wordmark.webp" },
  { name: "Google", image: "/assets/partners/logos/google.webp" },
  { name: "NVIDIA", image: "/assets/partners/logos/nvidia.webp" },
  { name: "AWS", image: "/assets/partners/logos/aws.svg" },
  { name: "Cohere", image: "/assets/partners/logos/cohere.svg" },
  { name: "McKinsey & Company", image: "/assets/partners/logos/mckinsey.svg" },
  { name: "Anthropic", image: "/assets/partners/logos/anthropic.webp" },
  { name: "Databricks", image: "/assets/partners/logos/databricks.svg" },
  { name: "Meta", image: "/assets/partners/logos/meta.svg" },
  { name: "Y Combinator", image: "/assets/e-lab/partners/y-combinator.webp" },
  { name: "JetBrains", image: "/assets/partners/logos/jetbrains.svg" },
] as const;
