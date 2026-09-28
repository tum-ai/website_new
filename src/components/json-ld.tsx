import { serializeJsonLd } from "@/lib/security";

type JsonLdValue = object | object[];

export function JsonLd({ data }: { data: JsonLdValue }) {
  const entries = Array.isArray(data) ? data : [data];

  return entries.map((entry) => {
    const json = serializeJsonLd(entry);
    return (
      <script
        key={json}
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be the script's raw text (React would HTML-escape children); serializeJsonLd escapes `<`, `>` and `&`, so the content can't close the tag.
        dangerouslySetInnerHTML={{ __html: json }}
      />
    );
  });
}
