/**
 * Per-page metadata and JSON-LD. Each route calls `buildMetadata(key)` for its
 * `metadata` export and renders `getJsonLd(key)` through `<JsonLd>`.
 *
 * URLs, names and legal facts are not written here: they come from
 * config/site.ts (origin, name, tagline), config/organization.ts (legal
 * identity) and config/contact.ts (emails, social profiles), so every
 * canonical link and structured-data node follows a change there.
 */
import type { Metadata } from "next";
import { contactEmails, socialLinks } from "./contact";
import {
  legalEntity,
  organizationFacts,
  unconfirmedRegisterNumbers,
} from "./organization";
import { absoluteUrl, siteConfig, siteTitle } from "./site";

/** Profiles on other sites that describe TUM.ai (JSON-LD `sameAs`). */
const externalProfiles = [
  socialLinks.linkedin,
  socialLinks.instagram,
  socialLinks.facebook,
  socialLinks.x,
  socialLinks.youtube,
  "http://www.wikidata.org/entity/Q128339659",
  socialLinks.github,
  "https://www.crunchbase.com/organization/tum-ai",
  "https://www.reddit.com/r/TUM_ai/",
  socialLinks.tiktok,
  "https://tum-ai.podbean.com/",
  "https://theorg.com/org/tum-ai",
  "https://www.eventbrite.de/o/tumai-31793295023",
];

/** The Organization node every page starts its JSON-LD with. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  legalName: legalEntity.legalName,
  alternateName: [...legalEntity.alternateNames],
  description: siteConfig.description,
  url: absoluteUrl(),
  logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/TUM.ai_Logo_Blue_%26_Violet.svg",
  sameAs: externalProfiles,
  email: contactEmails.general,
  foundingDate: String(organizationFacts.foundingYear),
  foundingLocation: legalEntity.foundingLocation,
  location: [
    {
      "@type": "PostalAddress",
      ...legalEntity.headquarters,
      contactType: "Headquarters",
    },
    {
      "@type": "PostalAddress",
      ...legalEntity.registeredOffice,
      contactType: "Registered office",
    },
  ],
  identifier: {
    "@type": "PropertyValue",
    name: "Register of Associations",
    // TODO(content): unconfirmed; see `unconfirmedRegisterNumbers`.
    value: unconfirmedRegisterNumbers.jsonLd,
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: contactEmails.partners,
    contactType: "Partner and sponsorship inquiries",
  },
};

type PageSeo = {
  /** Site path; the canonical URL is `absoluteUrl(path)`. */
  path: string;
  title: string;
  description: string;
  /** The page's own JSON-LD node, after the Organization node. */
  page: {
    type: "WebPage" | "FAQPage";
    name: string;
    description: string;
    /** Repeat the Organization node as `publisher` (every page but /projects). */
    publisher?: false;
  };
};

const pages = {
  events: {
    path: "/events",
    title: "Events",
    description:
      "Explore TUM.ai's upcoming events including workshops, hackathons, and meetups. Join us to learn, network, and innovate in the field of artificial intelligence.",
    page: {
      type: "WebPage",
      name: "TUM.ai Events",
      description: "Events, Workshops, and Hackathons by TUM.ai",
    },
  },
  research: {
    path: "/research",
    title: "Research",
    description:
      "Explore cutting-edge AI research projects conducted by TUM.ai students. From machine learning to computer vision, discover innovative research initiatives.",
    page: {
      type: "WebPage",
      name: "TUM.ai Research Projects",
      description: "AI Research Projects and Publications by TUM.ai",
    },
  },
  projects: {
    path: "/projects",
    title: "Task Forces and Projects",
    description:
      "Discover TUM.ai's current task forces and the research, education, and community initiatives they are driving.",
    page: {
      type: "WebPage",
      name: "TUM.ai Task Forces and Projects",
      description:
        "Current task forces and projects across research, education, and community at TUM.ai.",
      publisher: false,
    },
  },
  entrepreneurship: {
    path: "/e-lab",
    title: "Entrepreneurship",
    description:
      "Explore TUM.ai's startup incubator. Learn how we support AI-driven startups and foster innovation.",
    page: {
      type: "WebPage",
      name: "TUM.ai Entrepreneurship",
      description: "Startup Incubator by TUM.ai",
    },
  },
  community: {
    path: "/community",
    title: "Community",
    description:
      "Wanna join us? See our organizational structure, member journey, and member testimonials.",
    page: {
      type: "WebPage",
      name: "TUM.ai Community",
      description: "TUM.ai Community",
    },
  },
  partners: {
    path: "/partners",
    title: "Partners",
    description:
      "Meet the cracked & the curious. Partner with TUM.ai for exceptional AI talent, research, hackathons, and a place in Europe's next generation of AI companies.",
    page: {
      type: "WebPage",
      name: "TUM.ai Partners",
      description:
        "Find your partnership with TUM.ai: talent, decision makers, network and exposure.",
    },
  },
  apply: {
    path: "/apply",
    title: "Become a Member",
    description:
      "Apply to join TUM.ai and become part of Munich's leading AI student initiative.",
    page: {
      type: "WebPage",
      name: "Apply to TUM.ai",
      description: "Join TUM.ai - Application",
    },
  },
  qanda: {
    path: "/qanda",
    title: "FAQ - Frequently Asked Questions",
    description:
      "Find answers to frequently asked questions about TUM.ai, our programs, application process, and AI initiatives at Technical University of Munich.",
    page: {
      type: "FAQPage",
      name: "TUM.ai FAQ",
      description: "Frequently Asked Questions about TUM.ai",
    },
  },
  imprint: {
    path: "/imprint",
    title: "Imprint - Legal Information",
    description:
      "Legal information and imprint for TUM.ai e.V., Germany's leading AI student initiative.",
    page: {
      type: "WebPage",
      name: "TUM.ai Imprint",
      description: "Legal Information and Imprint",
    },
  },
  "data-privacy": {
    path: "/data-privacy",
    title: "Data Privacy Policy",
    description:
      "Learn about TUM.ai's data privacy policy and how we protect your personal information in compliance with GDPR regulations.",
    page: {
      type: "WebPage",
      name: "TUM.ai Privacy Policy",
      description: "Data Privacy and Protection Policy",
    },
  },
  disclaimer: {
    path: "/disclaimer",
    title: "Disclaimer",
    description:
      "Read the legal disclaimer for TUM.ai and the information published on this website.",
    page: {
      type: "WebPage",
      name: "TUM.ai Disclaimer",
      description: "Legal disclaimer for TUM.ai",
    },
  },
} satisfies Record<string, PageSeo>;

const home = {
  path: "/",
  title: "TUM.ai - AI Student Initiative at Technical University of Munich",
  description:
    "Join TUM.ai, Munich's leading AI student initiative. We organize hackathons, research projects, workshops, and run an AI startup incubator. Connect with AI enthusiasts and drive positive societal impact.",
};

export type SEOPageKey = "home" | keyof typeof pages;

function seoOf(
  key: SEOPageKey,
): Pick<PageSeo, "path" | "title" | "description"> {
  return key === "home" ? home : pages[key];
}

/** The Next.js `metadata` for a page: title, description, canonical, social cards. */
export function buildMetadata(key: SEOPageKey): Metadata {
  const { path, title, description } = seoOf(key);
  const canonical = absoluteUrl(path);

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        { url: siteConfig.socialImagePath, alt: `${siteConfig.name} logo` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.socialImagePath],
    },
  };
}

/** The JSON-LD nodes for a page: the Organization, then the page itself. */
export function getJsonLd(key: SEOPageKey): object[] {
  if (key === "home") {
    return [
      organizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: absoluteUrl(),
      },
    ];
  }

  const { path, page } = pages[key] as PageSeo;
  return [
    organizationJsonLd,
    {
      "@context": "https://schema.org",
      "@type": page.type,
      name: page.name,
      description: page.description,
      url: absoluteUrl(path),
      ...(page.publisher === false ? {} : { publisher: organizationJsonLd }),
    },
  ];
}

/**
 * Site-wide defaults for the `(site)` root layout: `metadataBase` (so relative
 * image paths resolve against the canonical origin), the title template and
 * the fallback title and description for pages without their own.
 */
export const rootMetadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteTitle, template: `%s | ${siteConfig.name}` },
  description: siteConfig.summary,
} satisfies Metadata;
