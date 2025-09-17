// Base organization JSON-LD (used across all pages)
export const baseOrganizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TUM.ai",
  legalName: "TUM.ai e.V.",
  alternateName: ["TUM.ai Student Initiative"],
  description: "TUM.ai is Germany's leading student initiative focused on AI. We empower the next generation of AI innovators by creating a community of students who innovate, research, and build at the forefront of AI, fostering both groundbreaking research and entrepreneurial ventures across diverse industries.",
  url: "https://www.tum-ai.com",
  logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/TUM.ai_Logo_Blue_%26_Violet.svg",
  sameAs: [
    "https://www.linkedin.com/company/tum-ai",
    "https://www.instagram.com/tum.ai_official/",
    "https://www.facebook.com/p/Tumai-100064870068663/",
    "https://x.com/TUMai_official",
    "https://www.youtube.com/@tum.aistudentinitiative",
    "http://www.wikidata.org/entity/Q128339659",
    "https://github.com/tum-ai",
    "https://www.crunchbase.com/organization/tum-ai",
    "https://www.reddit.com/r/TUM_ai/",
    "https://www.tiktok.com/@tum.ai_",
    "https://tum-ai.podbean.com/",
    "https://theorg.com/org/tum-ai",
    "https://www.eventbrite.de/o/tumai-31793295023",
  ],
  email: "contact@tum-ai.com",
  foundingDate: "2020",
  foundingLocation: "Munich, Germany",
  location: [
    {
      "@type": "PostalAddress",
      streetAddress: "Rosenheimer Str. 116A",
      postalCode: "81669",
      addressLocality: "Munich",
      addressCountry: "Germany",
      contactType: "Headquarters",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "Arcisstraße 21",
      postalCode: "80333",
      addressLocality: "Munich",
      addressCountry: "Germany",
      contactType: "Registered office",
    },
  ],
  identifier: {
    "@type": "PropertyValue",
    name: "Register of Associations",
    value: "VR 210726",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "partners@tum-ai.com",
    contactType: "Partner and sponsorship inquiries",
  },
};

// Default SEO configuration
export const defaultSEO = {
  title: "TUM.ai - Germany's Leading AI Student Initiative",
  description: "TUM.ai is Germany's leading student initiative focused on AI. We empower the next generation of AI innovators by creating a community of students who innovate, research, and build at the forefront of AI, fostering both groundbreaking research and entrepreneurial ventures across diverse industries.",
};

// Page-specific SEO configurations
export const pageSEOConfig = {
  home: {
    title: "TUM.ai - AI Student Initiative at Technical University of Munich",
    description: "Join TUM.ai, Munich's leading AI student initiative. We organize hackathons, research projects, workshops, and run an AI startup incubator. Connect with AI enthusiasts and drive positive societal impact.",
    canonical: "https://www.tum-ai.com",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "TUM.ai",
        url: "https://www.tum-ai.com",
      }
    ]
  },

  events: {
    title: "Events",
    description: "Explore TUM.ai's upcoming events including workshops, hackathons, and meetups. Join us to learn, network, and innovate in the field of artificial intelligence.",
    canonical: "https://www.tum-ai.com/events",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Events",
        description: "Events, Workshops, and Hackathons by TUM.ai",
        url: "https://www.tum-ai.com/events",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  research: {
    title: "Research",
    description: "Explore cutting-edge AI research projects conducted by TUM.ai students. From machine learning to computer vision, discover innovative research initiatives.",
    canonical: "https://www.tum-ai.com/research",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Research Projects",
        description: "AI Research Projects and Publications by TUM.ai",
        url: "https://www.tum-ai.com/research",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  projects: {
    title: "Innovation Projects",
    description: "Discover TUM.ai's innovation departments and the exciting projects they are working on.",
    canonical: "https://www.tum-ai.com/projects",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Innovation Projects",
        description: "Innovation Departments and Projects by TUM.ai",
        url: "https://www.tum-ai.com/projects"
      }
    ]
  },

  entrepreneurship: {
    title: "Entrepreneurship",
    description: "Explore TUM.ai's startup incubator. Learn how we support AI-driven startups and foster innovation.",
    canonical: "https://www.tum-ai.com/e-lab",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Entrepreneurship",
        description: "Startup Incubator by TUM.ai",
        url: "https://www.tum-ai.com/e-lab",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  community: {
    title: "Community",
    description: "Wanna join us? See our organizational structure, member journey, and member testimonials.",
    canonical: "https://www.tum-ai.com/community",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Community",
        description: "TUM.ai Community",
        url: "https://www.tum-ai.com/community",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  partners: {
    title: "Partners",
    description: "Is your company currently facing challenges with data-driven technologies or you are looking for the greatest talent in artificial intelligence? If one of the answers is yes, become a partner.",
    canonical: "https://www.tum-ai.com/partners",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Partners",
        description: "Partners and Sponsors of TUM.ai",
        url: "https://www.tum-ai.com/partners",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  apply: {
    title: "Become a Member",
    description: "Apply to join TUM.ai and become part of Munich's leading AI student initiative.",
    canonical: "https://www.tum-ai.com/apply",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Apply to TUM.ai",
        description: "Join TUM.ai - Application",
        url: "https://www.tum-ai.com/apply",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  qanda: {
    title: "FAQ - Frequently Asked Questions",
    description: "Find answers to frequently asked questions about TUM.ai, our programs, application process, and AI initiatives at Technical University of Munich.",
    canonical: "https://www.tum-ai.com/qanda",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        name: "TUM.ai FAQ",
        description: "Frequently Asked Questions about TUM.ai",
        url: "https://www.tum-ai.com/qanda",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  // Footer pages
  imprint: {
    title: "Imprint - Legal Information",
    description: "Legal information and imprint for TUM.ai e.V., Germany's leading AI student initiative.",
    canonical: "https://www.tum-ai.com/imprint",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Imprint",
        description: "Legal Information and Imprint",
        url: "https://www.tum-ai.com/imprint",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

  "data-privacy": {
    title: "Data Privacy Policy",
    description: "Learn about TUM.ai's data privacy policy and how we protect your personal information in compliance with GDPR regulations.",
    canonical: "https://www.tum-ai.com/data-privacy",
    jsonLd: [
      baseOrganizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "TUM.ai Privacy Policy",
        description: "Data Privacy and Protection Policy",
        url: "https://www.tum-ai.com/data-privacy",
        publisher: baseOrganizationJsonLd
      }
    ]
  },

};

// Helper function to get SEO config for a page
export const getSEOConfig = (pageKey: keyof typeof pageSEOConfig) => {
  return {
    ...defaultSEO,
    ...pageSEOConfig[pageKey]
  };
};