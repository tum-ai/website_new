import { serializeJsonLd } from "@/lib/security";

type JsonLdValue = object | object[];

export default function JsonLd({ data }: { data: JsonLdValue }) {
  const entries = Array.isArray(data) ? data : [data];

  return entries.map((entry, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(entry) }}
    />
  ));
}
