import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  robots?: string;
  lang?: string;
  jsonLd?: object;
  canonical?: string;
}

const SEO = ({
  title,
  description,
  robots = "index,follow",
  lang = "en",
  jsonLd,
  canonical,
}: SEOProps) => {
  // Construct full title
  const fullTitle = title
    ? `${title} | TUM.ai`
    : "TUM.ai - Germany's Leading AI Student Initiative";

  useEffect(() => {
    // Set document language
    document.documentElement.lang = lang;

    // Handle JSON-LD structured data
    if (jsonLd) {
      // Remove existing JSON-LD script
      const existingScript = document.getElementById("structured-data");
      if (existingScript) {
        existingScript.remove();
      }

      // Add new JSON-LD script
      const script = document.createElement("script");
      script.id = "structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById("structured-data");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [jsonLd, lang]);

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
    </>
  );
};

export default SEO;
