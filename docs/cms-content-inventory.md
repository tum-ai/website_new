# CMS content inventory

Every piece of hard-coded content on the site, where it is used, and what happens to it as content
moves into the Sanity content dataset (issue #286, [ADR 0009](adr/0009-cms-content-source.md)). The
recipe for moving one piece is the "Content slices" section of the `cms-content-model` skill.

- **Decision:** the target type in the content dataset, or **keep** (stays in code, with the
  reason).
- **Phase:** 1 campaigns and application windows; 2 `siteSettings` singleton facts; 3 logos and
  people; 4 page copy. **Done** is already served by a slice.
- **Owner:** the follow-up stream that moves it. **A** campaigns, windows and site settings;
  **B** logos and people; **C** page copy. File ownership is disjoint (see "Who owns which
  files"); a row whose content is rendered in another owner's file is listed under
  "Integration points".

Paths are relative to `src/` unless they start with `public/`.

## Target types

All in `sanity/schemas/content/`, registered only in the `content` workspace. References to live
documents (events) are `_id` strings, because the free plan has no cross-dataset references;
references between content types are normal references.

| Type | Kind | Holds | Owner |
| --- | --- | --- | --- |
| `faq` | list | `collection` (`apply`, `e-lab`, `qanda`), `order`, `question`, `answer` (plain text with `{{placeholders}}`); Q&A-only `anchor`, `points`, `spans`, `evidence` | done (Q&A wiring: C) |
| `campaign` | list | `name`, `startsAt`/`endsAt` (Munich wall-clock strings, like the config), the header CTA (`variant` key `member`/`partner`/`elab`/`notify`, optional `label`), `notifyUrl`, `featuredEventId` (a live event `_id` as a string), `priority` | A |
| `applicationWindow` | list | `program` (`membership`, `e-lab`), `roundName` or cohort, `switchedOn`, `opens`, `deadlineDate`, `deadlineTime` (Munich), `applicationUrl`, `milestones[]` (`key` such as `interviews`/`onboarding`, `from`, `to`), `nextWindowLabel` | A |
| `siteSettings` | singleton | organization figures, `brandMission`, role emails, social links, booking page and host, community and impact figures, E-Lab program facts (length, funding, selection funnel, hero logo), footer tagline, header CTA fallback | A |
| `organization` | list | `name`, `key` (the lookup key code uses today), `logo` and optional `logoOnDark` (`ContentImage`), `aspectRatio`, `symbolOnly`, `href`, `shortName`, `roles[]` (`alumniDestination`, `eLabPartner`, `eLabVenture`, `rexInstitution`, `eventHost`, `marquee`), `order` | B |
| `person` | list | `name`, `role`, `context`, `quote` or `story`, `portrait` (`ContentImage`, position via hotspot), `organization` (reference), `placements[]` (`memberStory`, `eLabFounder`, `eLabInvestor`, `partnerProfile`), `order` | B |
| `caseStudy` | list | partner case studies: `organization`, `metric`, `label`, `summary`, `copy`, `attribution`, `image` | B |
| `ventureTrace` | singleton | the traced E-Lab venture: `venture` and `person` references, `cohort`, `now`, `milestones[]` with source URLs | B |
| `department` | list | `name`, `description` (placeholders), optional `photo` (`ContentImage` + caption), `order` | C |
| `journeyStep` | list | `number`, `name`, `description`, `iconKey` (mapped to a Lucide icon in code), `fromSemester`, `span`, `stage`/fork, `evidence` (a `person` story excerpt, as text) | C |
| `milestone` | list | `year`, `kind` (`research`, `programs`, `events`, `organization`), `title`, `detail` | C |
| `taskForce` | list | `slug`, `name`, `field`, `description`, `detailedDescription`, `work` (`partner`, `items[]`), optional `photo` | C |
| `labSite` | list | `city`, `location` (lat, lng), `home`, `institutions[]` (aliases matched against research titles) | C |
| `<page>Copy` | singleton per page | the page's hero, section titles and leads, closings and figure copy: `homeCopy`, `applyCopy`, `communityCopy`, `eventsCopy`, `eLabCopy`, `projectsCopy`, `qandaCopy`, `researchCopy` (C); `partnersCopy` (B) | C, B |

`pageCopy` is one singleton type per page, not one generic type: TypeGen then types each page's
fields, and each owner defines its own schema file.

## Phase 1: campaigns and application windows (A)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Header CTA variants and labels | `config/navigation.ts`: `headerCtas` (member, partner, elab, notify without a target) | `getHeaderOptions` → `components/shell/header.tsx` | `campaign.headerCta`; variant keys and hrefs stay in code, labels may come from the campaign | A |
| Header CTA choice | `config/navigation.ts`: `headerCtaSetting`, `selectHeaderCta`, `headerCtaLink` | `app/(site)/layout.tsx`, `header.tsx` | the dated `campaign` in effect feeds `selectHeaderCta` (already free of config imports); `fallback` from `siteSettings` | A |
| Per-route header options | `config/navigation.ts`: `routeHeaderOptions` (`/partners`) | `header.tsx` | keep: layout behaviour | A |
| Notify link, featured event | none yet (`notify` has no target, TODO) | – | `campaign.notifyUrl`, `campaign.featuredEventId` | A |
| Membership round | `config/membership.ts`: `membershipConfig` (switch, form URL, `round` name, opens, deadline, interviews, onboarding) | `apply/round.ts`, `apply/apply-action.tsx`, `community/membership-apply-button.tsx`, header, layout | `applicationWindow` (`program: membership`, milestones for interviews and onboarding) | A |
| Round schedule helpers | `config/membership.ts`: `roundSchedule`, `membershipWindowBoundaries`, `isMembershipApplicationOpen`, `applicationProgress`, `recruitingTimeline` | apply, community, header, layout, `{{recruiting.*}}` placeholders | keep: logic; they take the window as input | A |
| E-Lab window | `config/e-lab.ts`: `applicationsOpen`, `applicationUrl`, `applicationDeadlineDate`/`Time`, `nextApplicationWindow`, `currentIteration` | `e-lab/application-cta.tsx`, `e-lab-phase*.tsx`, `closing-section.tsx`, `hero.tsx`, header label | `applicationWindow` (`program: e-lab`; it has no opening date today) | A |
| E-Lab phase copy | `config/e-lab.ts`: `eLabPhaseCopy` (`teaserStatus` unused, `ctaLabel`, `roundStatus`), `eLabApplicationCopy` | `e-lab/application-cta.tsx`, `e-lab/closing-section.tsx`, navigation, placeholders | keep derived from the window (template strings); wording into `eLabCopy` later | A |
| Inline copy in phase-driven sections | `apply/hero.tsx` ("Call for members.", "Read the FAQ"), `apply/closing-section.tsx`, `apply/apply-action.tsx` ("Apply now"), `e-lab/application-cta.tsx`, `e-lab/closing-section.tsx` (title, investor fork), `community/membership-apply-button.tsx` | apply, e-lab, community | stays inline in A's files; titles and leads join the page's `<page>Copy` in the integration pass | A |
| Recruiting call copy | `features/apply/round.ts`: key-date labels, `callStatus`, `closedLabel`, `closingTitle`, `closingLead`, day notes | `apply/hero.tsx`, `apply/closing-section.tsx` | keep: date logic with ~20 templates; the fixed labels may move to `applyCopy` in phase 4 | A |

## Phase 2: site settings (A)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Organization figures | `config/organization.ts`: `organizationFacts` (founding year, active members, alumni, majors, universities, nationalities), `officialMembers` (derived) | seo, home, apply, community, partners, qanda data and sections; `{{org.*}}` | `siteSettings`; derived values stay computed in code | A |
| Mission statement | `config/organization.ts`: `brandMission` | `apply/who-should-apply.tsx`, `qanda/qanda-page.tsx` | `siteSettings.brandMission` | A |
| Legal entity | `config/organization.ts`: `legalEntity`, `registeredOfficeLinesDe`; `config/contact.ts`: `registeredOfficeAddressLine` | legal pages, seo, contact | **keep**: legal wording needs the board | – |
| Role emails | `config/contact.ts`: `contactEmails` | seo, navigation, imprint, qanda closing, partnerships, `{{contact.recruitmentEmail}}` | `siteSettings` (the imprint keeps reading code) | A |
| Social links | `config/contact.ts`: `socialLinks` | seo, navigation, events upcoming, e-lab closing, design system | `siteSettings.socialLinks` | A |
| Partnership booking | `config/contact.ts`: `partnershipContact` (`bookingUrl`, `bookingHost`; `cc` holds personal addresses) | `partners/partnerships.ts`, `booking-dialog.tsx` | booking URL and host to `siteSettings`; **keep** `cc` in code (personal data) | A |
| Community figure | `config/community.ts`: `communityFacts.makeathonSize` | departments, homepage, milestones, partners; `{{community.makeathonSize}}` | `siteSettings` | A |
| Research and hackathon record | `config/impact.ts`: `impactFacts`, `publicationVenuesText` | research, partners, home, qanda; `{{impact.*}}` | `siteSettings` | A |
| E-Lab program facts | `config/e-lab.ts`: `programWeeks`, `ventureFundingMillions`, `selection` funnel, `heroLogo`; derived `eLabProgramSummary`, `eLabCompletedIterations` | e-lab sections, home, partners, qanda, seo | `siteSettings` (the funnel is drawn to scale: validate each gate ≤ the one before) | A |
| Footer tagline and bottom line | `components/shell/footer.tsx` inline ("Empowering students…", "Student Initiative at…", column titles) | footer | tagline to `siteSettings`; **keep** column titles (navigation structure) | A |
| Placeholder values | `config/content-tokens.ts`, names in `lib/content-tokens.ts` | every slice | keep: code; values follow `siteSettings` once it exists | A |
| Site identity and SEO | `config/site.ts` (`siteConfig`, `absoluteUrl`), `config/seo.ts` (page titles, descriptions, JSON-LD) | routes, layout | **keep**: site URL and SEO structure | – |
| Navigation | `config/navigation.ts`: `mainNavigation`, `connectLinks`, `headerConnectLinks`, `legalLinks`, `contributeLinks` | header, footer | **keep**: navigation structure (hrefs from `socialLinks`) | – |

## Phase 3: logos and people (B)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Partner directory fallback | `partners/data/partner-logos.ts`: `featuredPartners` (18) | `partners/partner-directory.ts` → home hero, home partners, partners page | **keep** as the fallback of the live `partner` type (never add `partner` documents to production); logo overrides by `key` via `organization` if needed | B |
| Symbol-only logos | `partners/data/partner-logos.ts`: `symbolOnlyLogos` | `partner-tile.tsx`, `partner-marquee.tsx`, home partners | `organization.symbolOnly` | B |
| Alumni destinations | `partners/data/partner-logos.ts`: `alumniDestinations` (11) | `partners/sections/people-section.tsx` | `organization` (`roles: alumniDestination`) | B |
| Marquee logos (on dark) | `partners/data/partner-marquee-logos.ts`: `marqueeLogos` (18) | `partner-marquee.tsx`, home hero | `organization.logoOnDark` (`roles: marquee`) | B |
| Partner directory logic | `partners/partner-directory.ts` (alias map, tier order, merge), `partner-rotation.ts` | partners, home | keep: logic | B |
| Partner profiles | `partners/data/partners.ts`: `partnerProfiles` (3) | `people-section.tsx` | `person` (`placements: partnerProfile`) | B |
| Case studies | `partners/data/partners.ts`: `partnerCaseStudies` (3) | `cases-section.tsx`, home partners | `caseStudy` | B |
| Partners page copy and funnel | `partners/data/partners.ts`: `partnershipIntents`, `partnershipDurations`, `recommendations`, `partnerReasons`, `partnerStats`, `partnerPillars`, `partnerPitch`; inline copy in `partners/sections/*`, `partnership-finder.tsx`, `booking-dialog.tsx`, `contact-actions.tsx`, `partner-marquee.tsx`, `partner-tier.tsx`, `partner-supporters.tsx`; mail texts in `partnerships.ts` | partners page; `partnerPitch` also in apply, community, qanda closings | `partnersCopy` (stat figures stay derived in code: they are facts; icons as keys); keep mail templates in code | B |
| E-Lab testimonials | `e-lab/data/venture-page.ts`: `testimonialCards` (7), `eLabVoices` | `voices-section.tsx`, `venture-trace.tsx`, home partners (`partnerQuoteId`) | `person` (`placements: eLabFounder`/`eLabInvestor`) with `organization` logos | B |
| E-Lab ventures | `e-lab/data/venture-page.ts`: `notableStartups` (7) | `venture-trace.tsx`, `application-field.tsx` | `organization` (`roles: eLabVenture`) | B |
| Traced venture | `e-lab/data/venture-page.ts`: `tracedVenture`, `tracedVentureLead` | `venture-trace.tsx` | `ventureTrace`; the lead sentence stays built in code | B |
| E-Lab venture copy | inline in `e-lab/venture-trace.tsx`, `voices-section.tsx`, `application-field.tsx` (figcaption), `field-dots.tsx` (aria) | e-lab | B keeps the section titles and leads inline for now (page copy is C's `eLabCopy`; moved in the integration pass); aria strings stay | B |
| Event host logos | `events/data/host-logos.ts` (17 keys, dynamic `/assets/events/hosts/`, `/assets/partners/`) | `events/hero.tsx` | `organization` (`roles: eventHost`, `key` = the normalised host name) | B |
| Events hero lockup and reel | inline in `events/hero.tsx`, `hero-reel.tsx`, `lockup.tsx` (lead "Hackathons, talks and pitch nights…", generated summary) | /events | logos from `organization`; the lead stays inline for now (see integration points) | B |
| REX institutions | `research/data/rex.ts`: `rexInstitutions` (4), `rexLead`, `rexProcess`, `rexOrigin` | `research/research-page.tsx`, home `programs` text | `organization` (`roles: rexInstitution`); REX copy into `researchCopy` via integration | B |
| Member stories | `community/data/member-stories.ts`: `stories` (6) | `community-page.tsx`, `member-stories.tsx`, `semester-plan.tsx`, apply `tracks.tsx`, home `join-section.tsx` | `person` (`placements: memberStory`); journey excerpts must stay verbatim substrings | B |

## Phase 4: page copy (C)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Apply FAQ | `apply/data/faq.ts` | `apply-page.tsx` via `apply/content.ts` | **done**: `faq` (`apply`) | – |
| E-Lab FAQ | `e-lab/data/faq.ts` | `e-lab-page.tsx` via `e-lab/content.ts` | **done**: `faq` (`e-lab`) | – |
| Q&A entries | `qanda/data/qanda.ts`: `faqs` (7; `spans`, `points`, `evidence` with facts) | `qanda-page.tsx` (+ FAQPage JSON-LD), `mission-section.tsx`, design system | `faq` (`qanda`; `anchor` = today's `id`; evidence text with `{{org.*}}`, `{{impact.*}}`, `{{eLab.*}}`); `spans` stay exact substrings of the passage | C |
| Mission passage | `qanda/data/qanda.ts`: `missionQuestion`, `missionPassage` | qanda page | `qandaCopy` (edit together with the spans; the span test must run on CMS data) | C |
| Q&A forks and closing | `qanda/data/qanda.ts`: `forks`; inline in `qanda-page.tsx`, `mission-section.tsx`, `mission-answers.tsx`, `closing-section.tsx` | qanda | `qandaCopy` (the companies fork is `partnerPitch`) | C |
| Apply page copy | `apply/data/apply.ts`: `heroLead`, `tracksLead`, `selectionStages`, `qualities`, `notRequired`, `values`, `offerings`; inline in `selection.tsx`, `since-founding.tsx`, `tracks.tsx`, `who-should-apply.tsx` (titles, photo alts) | apply | `applyCopy` (`{{org.majors}}` etc. for facts; stage `when` keys stay code) | C |
| Apply milestones | `apply/data/milestones.ts`: `milestones` (22), `milestoneKinds` | `since-founding.tsx` | `milestone` (kinds stay code) | C |
| Departments | `community/data/departments.ts` (7, 4 photos) | `departments-section.tsx`, home `programs` (count) | `department` | C |
| Member journey | `community/data/member-journey.ts`: `memberJourney` (Lucide icons) | `semester-plan.tsx`, apply `tracks.tsx` | `journeyStep` (`iconKey`); `semesterColumns`, `stepAnchor` stay code | C |
| Community page copy | inline in `community-page.tsx`, `closing-section.tsx`, `departments-section.tsx`, `member-stories.tsx` (section title), `semester-plan.tsx` | community | `communityCopy` (recruiting dates as `{{recruiting.*}}`) | C |
| Home copy | `home/data/homepage.ts`: `heroLead`, `ledgerFacts`, `programs`, `roomPhotos`, `heroPhotos`, `memberQuote`, `partnerQuoteId`; inline in `home-hero.tsx`, `join-section.tsx`, `mission-section.tsx`, `partners-section.tsx` (see B), `programs-section.tsx`, `room-section.tsx` | home | `homeCopy` (ledger values stay derived facts; photos as `ContentImage`; quotes reference `person`) | C |
| Projects copy | `projects/data/copy.ts`: `hero`, `figureSeats`, `closing` | `projects-page.tsx`, `closing-section.tsx` | `projectsCopy` | C |
| Task forces | `projects/data/projects.ts`: `taskForces` (5), `openSeat` | projects page, `copy.ts` | `taskForce` (`openSeat` into `projectsCopy`) | C |
| Research copy | `research/data/research-copy.ts`: `heroLead`, `abstractStatement`, `getAbstractBody`, `figurePanels`, `closing`; inline in `research-page.tsx` (~15 strings), `research-figure.tsx`, `project-list.tsx`, `research-globe.tsx` (aria) | research | `researchCopy` (the body stays a template with the live project count) | C |
| Lab sites | `research/data/lab-sites.ts`: `labSites` (6) | `research/research.ts` → globe, affiliations | `labSite` | C |
| E-Lab selection copy | `e-lab/data/selection.ts`: `selectionStages` (gates and phases; team counts from config); inline in `selection-gates.tsx`, `hero.tsx` | e-lab | `eLabCopy` (gate counts stay facts) | C |
| Events copy | inline in `events/closing-section.tsx`, `upcoming.tsx`, `register.tsx`, `register-filter.tsx`, `poster-wall.tsx`, `sign-up-action.tsx`, `host-line.tsx`; labels in `events/filters.ts` (`categoryNames`), `events/events.ts` (semester labels) | events | `eventsCopy` for titles, leads and the closing; category and semester labels stay in code (they map schema enums) | C |
| Page titles and descriptions | `config/seo.ts` | metadata | **keep**: SEO structure | – |

## Kept in code

| Content | Where | Why |
| --- | --- | --- |
| Dot-field layout | `e-lab/data/field.ts` | geometry (seeded lattice), not content |
| Task-force overlap figure | `projects/overlaps.ts`, `overlaps-figure.tsx` | geometry |
| Logomark and room grid | `home/logomark-construction.ts`, `home/room-layout.ts`, `home/hero-aperture.tsx`, `construction-lines.tsx` | geometry |
| Legal pages | `features/legal/*`, `legalEntity` | wording needs the board; a CMS edit would bypass review |
| Site URL, SEO, JSON-LD | `config/site.ts`, `config/seo.ts` | structure and canonical URLs |
| Navigation structure | `config/navigation.ts` links, footer column titles | structure; labels follow routes |
| Icons | Lucide components in `member-journey.ts`, `partnership-finder.tsx`, `reasons-section.tsx` | the CMS stores an icon key, code maps it |
| UI and accessibility strings | aria labels, screen-reader text, "Read More", "Back", "Zoom in", "Sign up", chip labels, repeated CTA labels ("Become a Partner", "Become a Member") | interface, not content |
| Logic with embedded wording | `apply/round.ts` date notes, `events/events.ts`, `events/filters.ts`, `partners/partnerships.ts` mail templates, `research/research.ts`, `qanda/mission-spans.ts` | tied to code paths and tests |
| Live-dataset mock fixtures | `lib/mock-cms.ts` | test data for events, research, partners |
| Design system showcase | `features/design-system/*` | development only |

## Assets (`public/assets/`)

Images used by moved content are uploaded by the backfill (`backfillImage`) and then served from
the Sanity CDN; the files stay in the repository as long as a code fallback uses them.

| Folder | Files | Used by | Owner |
| --- | --- | --- | --- |
| `/` (root) | favicons, `Manrope.ttf`, `tum_ai_logo_new.svg`, `logo_new_white_standard.png`, 4 photos | layout, shell, heroes, seo; some photos only in `lib/mock-cms.ts` | keep (brand) |
| `brand/` | `logomark-mask.svg` | home CSS and logomark | keep |
| `apply/` | 6 member portraits, 3 section photos | member stories (B); apply sections, home programs (C) | B portraits, C photos |
| `e-lab/` | `E-Lab5Logo.svg` | `eLabConfig.heroLogo` | A |
| `e-lab/partners/`, `e-lab/startups/`, `e-lab/testimonials/` | 6, 7, 7 logos and portraits | venture page (B), partner logos | B |
| `events/hosts/` | 13 logos (+ `SOURCES.md`) | `events/data/host-logos.ts` (dynamic paths) | B |
| `homepage/` | 8 photos | home, departments, partners pillars, research figure, e-lab kickoff | C (partners pillars: B) |
| `innovation/` | 6 photos | projects, home programs, research figure | C |
| `partners/` (`hero.webp`, `cases/`, `logos/`, `marquee/`, `people/`) | 1, 3, 22, 14, 6 | partners page, host logos | B |
| `research/rex/` | 4 logos | `research/data/rex.ts` | B |

Unreferenced today: `partners/logos/osapiens.svg`, `partners/logos/entire.svg`,
`partners/marquee/entire.svg`, `partners/people/jasmin.webp`, `partners/people/mohamed.webp`.

## Who owns which files

Each stream edits only its files. Shared registries are append-only under the stream's phase
comment: `sanity/schemas/content/index.ts` (`contentSchemaTypes`), `scripts/sanity/slices.ts`.
`lib/sanity.types.generated.ts` is regenerated (`pnpm sanity:typegen`) after merging, never merged
by hand. `lib/cms-*`, `lib/faq-content.ts` and `lib/sanity-config.ts` belong to the foundation:
report a needed change instead of editing them. A new slice file in a feature where another stream
owns `content.ts` is `features/<x>/<topic>-content.ts`.

- **A (campaigns, windows, site settings):** `config/` (all but `seo.ts` and `site.ts`),
  `lib/content-tokens.ts`, `config/*-content.ts` (new), `components/shell/*`,
  `app/(site)/layout.tsx`, `sanity/content-structure.ts` (singleton pins), `apply/round.ts`,
  `apply/hero.tsx`, `apply/closing-section.tsx`, `apply/apply-action.tsx`,
  `e-lab/application-cta.tsx`, `e-lab/e-lab-phase.tsx`, `e-lab/e-lab-phase-switch.tsx`,
  `e-lab/closing-section.tsx`, `community/membership-apply-button.tsx`,
  `community/membership-phase.tsx`, `community/membership-phase-switch.tsx`; schemas
  `campaign`, `applicationWindow`, `siteSettings`.
- **B (logos and people):** all of `features/partners/`; `e-lab/data/venture-page.ts`,
  `e-lab/venture-trace.tsx`, `e-lab/voices-section.tsx`, `e-lab/application-field.tsx`,
  `e-lab/field-dots.tsx`, `e-lab/venture-content.ts` (new); `events/data/host-logos.ts`,
  `events/hero.tsx`, `events/hero-reel.tsx`, `events/lockup.tsx`, `events/host-content.ts`
  (new); `research/data/rex.ts`, `research/rex-content.ts` (new);
  `community/data/member-stories.ts`, `community/member-stories.tsx`,
  `community/people-content.ts` (new); `home/partners-section.tsx`; schemas `organization`,
  `person`, `caseStudy`, `ventureTrace`, `partnersCopy`.
- **C (page copy):** `apply/data/*`, `apply/content.ts`, `apply/apply-page.tsx`,
  `apply/selection.tsx`, `since-founding.tsx`, `tracks.tsx`, `who-should-apply.tsx`;
  `e-lab/data/faq.ts`, `e-lab/data/selection.ts`, `e-lab/content.ts`, `e-lab/e-lab-page.tsx`,
  `e-lab/hero.tsx`, `e-lab/selection-gates.tsx`; `community/data/departments.ts`,
  `community/data/member-journey.ts`, `community/content.ts`, `community-page.tsx`,
  `community/closing-section.tsx`, `departments-section.tsx`, `semester-plan.tsx`; all of
  `features/qanda/`, `features/projects/` (except geometry, which stays), `home/` except
  `partners-section.tsx`; `events/content.ts` (new), `events/closing-section.tsx`,
  `upcoming.tsx`, `register.tsx`, `register-filter.tsx`, `poster-wall.tsx`, `sign-up-action.tsx`,
  `host-line.tsx`; `research/data/research-copy.ts`, `research/data/lab-sites.ts`,
  `research/content.ts` (new), `research-page.tsx`, `research-figure.tsx`, `project-list.tsx`,
  `research-globe.tsx`, `affiliations.tsx`; schemas `department`, `journeyStep`, `milestone`, `taskForce`, `labSite`
  and the `<page>Copy` singletons except `partnersCopy`.

Files nobody edits in this migration: `config/seo.ts`, `config/site.ts`, `features/legal/*`,
`features/design-system/*`, `e-lab/data/field.ts`, `projects/overlaps.ts`,
`projects/overlaps-figure.tsx`, the home geometry modules, `events/events.ts`,
`events/filters.ts`, `events/event-details.tsx`, `events/events-page.tsx`,
`research/research.ts`, `lib/mock-cms.ts`.

### Integration points (after the three streams merge)

Content that one stream moves but another stream's file renders. Until this pass the consumer keeps
importing the code data (same shape, so nothing breaks), which means the CMS value does not show
there yet:

- Member stories (B) in `community/semester-plan.tsx`, `apply/tracks.tsx`, `home/join-section.tsx`
  (C): await B's getter in those server sections.
- `testimonialCards`, `partnerCaseStudies`, partner logos (B) in `home/home-hero.tsx` (C).
- REX institutions and copy (B) in `research/research-page.tsx` and home `programs` (C).
- `partnerPitch` (B) in the apply, community and qanda closings (C, A).
- Site-settings facts (A) behind the `{{placeholders}}` and in derived config values used
  everywhere: once `siteSettings` exists, `config/content-tokens.ts` must read the fetched
  values on the server, and client islands that import config facts (`components/shell/header.tsx`,
  `e-lab/e-lab-phase-switch.tsx`, `community/membership-phase-switch.tsx`) need them as props.
- Header CTA labels repeated inline ("Become a Partner", "Become a Member") across B and C files.

Rules that keep the streams independent: keep the exported shape of code data that other files
import; await a getter in the server section that renders the content (sections are server
components; a client island gets props from its server parent); never edit another stream's file,
list the change here instead.
