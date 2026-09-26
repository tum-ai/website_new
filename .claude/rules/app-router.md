---
paths:
  - "src/app/**"
---

# App Router (`src/app`)

Routes are thin. Page composition lives in `src/features/<domain>/<domain>-page.tsx`.

- **Route file shape** (`src/app/(site)/<route>/page.tsx`):
  ```tsx
  import { JsonLd } from "@/components/json-ld";
  import { buildMetadata, getJsonLd } from "@/config/seo";
  import { EventsPage } from "@/features/events/events-page";

  export const metadata = buildMetadata("events");

  export default async function Page() {
    return (
      <>
        <JsonLd data={getJsonLd("events")} />
        <EventsPage /* data fetched here and passed as props */ />
      </>
    );
  }
  ```
- **Imports from features:** only the page module and the page CSS
  (`import "@/features/partners/partners.css"`). Never a feature index, section or data file.
- **Default exports** only for page, layout and global-not-found; route handlers export `GET`.
- **Two root layouts:** `(site)/layout.tsx` owns html, body, font, site CSS and the shell;
  `studio/[[...tool]]/layout.tsx` is the Studio's own root and may import only `@/sanity` and
  `@/lib`. `global-not-found.tsx` renders 404s because no layout is shared.
- **CMS data:** fetch in the server route through the getters in `@/lib/sanity` and set
  `revalidate`. The CMS failure handling lives in `lib` (coming in W1-Data), not in route
  try/catch blocks.
- **API routes:** `api/getNotes` (events), `api/getPartners` and `api/getResearch` are a public
  JSON API; keep their response shapes stable. Draft mode lives in `api/draft-mode/`.
- **`/design-system`** must keep returning 404 in production (`notFound()` outside dev/preview).
- **New route:** add its `config/seo.ts` key, navigation entry and E2E route entry (`add-page`).
  Host redirects run in `src/proxy.ts` (Next 16's replacement for middleware).
