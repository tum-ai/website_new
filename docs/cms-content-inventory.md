# CMS content inventory

Every piece of hard-coded content on the site, where it is used, and what happens to it as content
moves into the site's Sanity dataset, `redesign` (issue #286, [ADR 0009](adr/0009-cms-content-source.md)). The
recipe for moving one piece is the "Content slices" section of the `cms-content-model` skill.

- **Decision:** the target content type, or **keep** (stays in code, with the
  reason).
- **Phase:** 1 campaigns and application windows; 2 `siteSettings` singleton facts; 3 logos and
  people; 4 page copy. **Done** is served by a slice and rendered from it (all phases, after the
  integration pass below); **open** is not moved yet (none left).
- **Owner:** the follow-up stream that moves it. **A** campaigns, windows and site settings;
  **B** logos and people; **C** page copy. File ownership is disjoint (see "Who owns which
  files"); a row whose content is rendered in another owner's file is listed under
  "Integration points".

Paths are relative to `src/` unless they start with `public/`.

## Target types

All in `sanity/schemas/content/`, registered in the Studio on every dataset except `production`
(the old site's). A campaign's featured event is a weak reference, so the campaign never blocks
deleting the event; references between content types are normal references.

The old site's types (`event`, `partner`, `research`) are not in this table: the backfill copies
their published documents from `production` into `redesign` unchanged (same `_id`s), adding the
events' `hosts` from `liveEventHosts` in `lib/mock-cms.ts`. The new site reads partners from
`organization` instead (a partner is an organisation with a `partnerTier`);
`pnpm sanity:migrate-partners` moves the copied `partner` documents onto organisations, and the
Studio hides `partner` outside `production` (ADR 0009, "Partners are organisations"). On every
dataset but `production` the research type also has `institutions` and the event type `coHosts`
(references to organisations, which /research cites instead of the names in the title and /events
lists instead of `hosts`); the old site's string fields stay.

| Type | Kind | Holds | Owner |
| --- | --- | --- | --- |
| `faq` | list | `collection` (`apply`, `e-lab`, `qanda`), `order`, `question`, `answer` (plain text with `{{placeholders}}`); Q&A-only `anchor`, `points`, `spans`, `evidence` | done |
| `campaign` | list | `name`, start and end (Sanity dates plus Munich "HH:MM" times), the header CTA (`variant` key `member`/`partner`/`elab`/`notify`, optional `label`, `yieldsToRecruiting`), `notifyUrl`, `featuredEvent` (a weak reference to an event, read as its `_id`); no priority: the latest start wins | done (A) |
| `applicationWindow` | list | `program` (`membership`, `e-lab`), `roundName` or cohort, `switchedOn`, `opens`, `deadlineDate`, `deadlineTime` (Munich), `applicationUrl`, `milestones[]` (`key` such as `interviews`/`onboarding`, `from`, `to`), `nextWindowLabel` | done (A) |
| `siteSettings` | singleton | organization figures, `brandMission`, role emails, social links, booking page and host, community and impact figures, E-Lab program facts (length, funding, selection funnel, hero logo), footer tagline, header CTA fallback | done (A) |
| `organization` | list | `name`, `key` (kebab-case; pages match its letters and digits), `shortName`, `href`, `logo` and optional `logoOnDark` (image with `alt`, `symbolOnly`, `aspectRatio`); the "Partnership" group: `partnerTier` (set = a partner), `partnerFeatured`, `partnerCategory`, hidden `legacyPartnerId` (the old `partner` document's id, which `/api/getPartners` returns); one document per company, reused by every surface | done (B) |
| `logoList` | list, fixed ids | `surface` (`alumni-destinations`, `partner-marquee`, `e-lab-ventures`, `rex-institutions`), `organizations[]` (references, in page order); one document per section, `_id` `logolist-<surface>`. Membership and order live here, not on the organisation, because one organisation appears in several sections in different places | done (B) |
| `person` | list | `placement` (`member-story`, `partner-profile`, `e-lab-testimonial`; one per document, since role and portrait differ per page), `key` (the id code picks by), `order`, `name`, `role`, `context`, `quote` or `story`, `portrait` (hotspot = position), `organization` (reference, any placement; testimonials need one), `roleAtOrganization` (the page shows "role @ organisation") | done (B) |
| `caseStudy` | list | partner case studies: `organization`, `metric`, `label`, `summary`, `copy`, `attribution`, `image` | done (B) |
| `ventureTrace` | singleton | the traced E-Lab venture: `venture` and `person` references, `cohort`, `now`, `milestones[]` with source URLs | done (B) |
| `department` | list | `name`, `description` (placeholders), optional `photo` (`ContentImage` + caption), `order` | done (C) |
| `journeyStep` | list | `number`, `name`, `description`, `iconKey` (mapped to a Lucide icon in code), `fromSemester`, `span`, `stage`/fork, `evidence` (a `person` reference to a member story and an excerpt) | done (C) |
| `milestone` | list | `year`, `kind` (`research`, `programs`, `events`, `organization`), `title`, `detail` | done (C) |
| `taskForce` | list | `slug`, `name`, `field`, `description`, `detailedDescription`, `work` (`partner`, `items[]`), optional `photo` | done (C) |
| `labSite` | list | `city`, `location` (lat, lng), `home`, `organizations[]` (references: the research projects', research partners' and REX institutions' organisations there) | done (C) |
| `<page>Copy` | singleton per page | the page's hero, section titles and leads, closings and figure copy: `homeCopy` (its quotes reference `person`), `applyCopy`, `communityCopy`, `eventsCopy`, `eLabCopy`, `projectsCopy`, `qandaCopy`, `researchCopy` (with the REX band's copy) (C); `partnersCopy` (B) | done (C, B) |

`pageCopy` is one singleton type per page, not one generic type: TypeGen then types each page's
fields, and each owner defines its own schema file.

## Phase 1: campaigns and application windows (A)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Header CTA variants and labels | `config/navigation.ts`: `headerCtas` (member, partner, elab, notify without a target) | `getHeaderOptions` → `components/shell/header.tsx` | **done**: `campaign.headerCta`; variant keys and hrefs stay in code, labels may come from the campaign | A |
| Header CTA choice | `config/navigation.ts`: `headerCtaSetting`, `selectHeaderCta`, `headerCtaLink` | `app/(site)/layout.tsx`, `header.tsx` | **done**: the dated `campaign` in effect feeds `selectHeaderCta` (already free of config imports); `fallback` from `siteSettings` | A |
| Per-route header options | `config/navigation.ts`: `routeHeaderOptions` (`/partners`) | `header.tsx` | **keep**: layout behaviour | A |
| Notify link, featured event | none yet (`notify` has no target, TODO) | – | **done**: `campaign.notifyUrl`, `campaign.featuredEvent` (`getFeaturedEventId()`; /events pins it first among the upcoming events and in the closing band while it is upcoming) | A |
| Membership round | `config/membership.ts`: `membershipConfig` (switch, form URL, `round` name, opens, deadline, interviews, onboarding) | `apply/round.ts`, `apply/apply-action.tsx`, `community/membership-apply-button.tsx`, header, layout | **done**: `applicationWindow` (`program: membership`, milestones for interviews and onboarding) | A |
| Round schedule helpers | `config/membership.ts`: `roundSchedule`, `membershipWindowBoundaries`, `isMembershipApplicationOpen`, `applicationProgress`, `recruitingTimeline` | apply, community, header, layout, `{{recruiting.*}}` placeholders | **keep**: logic; they take the render's window as input | A |
| E-Lab window | `config/e-lab.ts`: `applicationsOpen`, `applicationUrl`, `applicationDeadlineDate`/`Time`, `nextApplicationWindow`, `currentIteration` | `e-lab/application-cta.tsx`, `e-lab-phase*.tsx`, `closing-section.tsx`, `hero.tsx`, header label | **done**: `applicationWindow` (`program: e-lab`; it has no opening date today) | A |
| E-Lab phase copy | `config/e-lab.ts`: `eLabPhaseCopy` (`teaserStatus` unused, `ctaLabel`, `roundStatus`), `eLabApplicationCopy` | `e-lab/application-cta.tsx`, `e-lab/closing-section.tsx`, navigation, placeholders | **keep**: derived per render from the window and the facts (`eLabPhaseCopyOf`); the FAQ reads the same values through placeholders | A |
| Inline copy in phase-driven sections | `apply/hero.tsx` ("Call for members.", "Read the FAQ"), `apply/closing-section.tsx`, `apply/apply-action.tsx` ("Apply now"), `e-lab/application-cta.tsx`, `e-lab/closing-section.tsx` (title, investor fork), `community/membership-apply-button.tsx` | apply, e-lab, community | **done** (integration): titles, labels and the closings' reader lines in `applyCopy` and `eLabCopy`; "Apply now", "Become a Member/Partner" and "Questions and answers" from `config/calls-to-action.ts`; the status badge wording stays in the component | A |
| Recruiting call copy | `features/apply/round.ts`: key-date labels, `callStatus`, `closedLabel`, `closingTitle`, `closingLead`, day notes | `apply/hero.tsx`, `apply/closing-section.tsx` | **keep**: date logic with ~20 templates whose grammar follows the phase (the key-date row labels map the round's milestones) | A |

## Phase 2: site settings (A)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Organization figures | `config/organization.ts`: `organizationFacts` (founding year, active members, alumni, majors, universities, nationalities), `officialMembers` (derived) | seo, home, apply, community, partners, qanda data and sections; `{{org.*}}` | **done**: `siteSettings`; derived values stay computed in code | A |
| Mission statement | `config/organization.ts`: `brandMission` | `apply/who-should-apply.tsx`, `qanda/qanda-page.tsx` | **done**: `siteSettings.brandMission` | A |
| Legal entity | `config/organization.ts`: `legalEntity`, `registeredOfficeLinesDe`; `config/contact.ts`: `registeredOfficeAddressLine` | legal pages, seo, contact | **keep**: legal wording needs the board | – |
| Role emails | `config/contact.ts`: `contactEmails` | seo, navigation, imprint, qanda closing, partnerships, `{{contact.recruitmentEmail}}` | **done**: `siteSettings` (the imprint keeps reading code) | A |
| Social links | `config/contact.ts`: `socialLinks` | seo, navigation, events upcoming, e-lab closing, design system | **done**: `siteSettings.socialLinks` | A |
| Partnership booking | `config/contact.ts`: `partnershipContact` (`bookingUrl`, `bookingHost`; `cc` holds personal addresses) | `partners/partnerships.ts`, `booking-dialog.tsx` | **done**: booking URL and host to `siteSettings`; **keep** `cc` in code (personal data) | A |
| Community figure | `config/community.ts`: `communityFacts.makeathonSize` | departments, homepage, milestones, partners; `{{community.makeathonSize}}` | **done**: `siteSettings` | A |
| Research and hackathon record | `config/impact.ts`: `impactFacts`, `publicationVenuesText` | research, partners, home, qanda; `{{impact.*}}` | **done**: `siteSettings` | A |
| E-Lab program facts | `config/e-lab.ts`: `programWeeks`, `ventureFundingMillions`, `selection` funnel, `heroLogo`; derived `eLabProgramSummary`, `eLabCompletedIterations` | e-lab sections, home, partners, qanda, seo | **done**: `siteSettings` (the funnel is drawn to scale: validate each gate ≤ the one before) | A |
| Footer tagline and bottom line | `components/shell/footer.tsx` inline ("Empowering students…", "Student Initiative at…", column titles) | footer | **done**: tagline to `siteSettings`; **keep** column titles (navigation structure) and the bottom line (content question) | A |
| Placeholder values | `config/content-tokens.ts`, names in `lib/content-tokens.ts` | every slice | **done**: `getContentTokens()` fills them per render from `siteSettings` and the windows; names stay code | A |
| Site identity and SEO | `config/site.ts` (`siteConfig`, `absoluteUrl`), `config/seo.ts` (page titles, descriptions, JSON-LD) | routes, layout | **keep**: site URL and SEO structure | – |
| Navigation | `config/navigation.ts`: `mainNavigation`, `connectLinks`, `headerConnectLinks`, `legalLinks`, `contributeLinks` | header, footer | **keep**: navigation structure (hrefs from `socialLinks`) | – |

## Phase 3: logos and people (B)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Partner directory | `partners/data/organizations.ts`: every organisation with a `partnership` (62: the 18 highlighted with tiers, the old site's other partners as supporters); `partnerLaunchOrder` | `getPartners()` → home hero, home partners, partners page, /research (research partners), `/api/getPartners` from the CMS | **done**: `organization` (`partnerTier`, `partnerFeatured`, `partnerCategory`); replaces `featuredPartners` and, on the new dataset, the `partner` type | B |
| Symbol-only logos | `partners/data/partner-logos.ts`: `symbolOnlyLogos` | `partner-tile.tsx`, `partner-marquee.tsx`, home partners | **done**: `organization.symbolOnly` | B |
| Alumni destinations | `partners/data/partner-logos.ts`: `alumniDestinations` (11) | `partners/sections/people-section.tsx` | **done**: `organization` (`roles: alumniDestination`) | B |
| Marquee logos (on dark) | `partners/data/partner-marquee-logos.ts`: `marqueeLogos` (18) | `partner-marquee.tsx`, home hero | **done**: `organization.logoOnDark` (`roles: marquee`) | B |
| Partner directory logic | `partners/partner-directory.ts` (alias map, `partnerOf`, tier and launch order), `partner-rotation.ts` | partners, home | **keep**: logic | B |
| Partner profiles | `partners/data/partners.ts`: `partnerProfiles` (3) | `people-section.tsx` | **done**: `person` (`placements: partnerProfile`) | B |
| Case studies | `partners/data/partners.ts`: `partnerCaseStudies` (3) | `cases-section.tsx`, home partners | **done**: `caseStudy` | B |
| Partners page copy and funnel | `partners/data/partners.ts`: `partnershipIntents`, `partnershipDurations`, `recommendations`, `partnerReasons`, `partnerStats`, `partnerPillars`, `partnerPitch`; inline copy in `partners/sections/*`, `partnership-finder.tsx`, `booking-dialog.tsx`, `contact-actions.tsx`, `partner-marquee.tsx`, `partner-tier.tsx`, `partner-supporters.tsx`; mail texts in `partnerships.ts` | partners page; `partnerPitch` also in apply, community, qanda closings | **done**: `partnersCopy` for the pitch (read by every closing), finder answers, reasons, stats and pillars (pillar figures derived from the site facts; icons as keys); the section headings, leads and labels in `partnersCopy.sections` (headings set on fixed lines as line lists, the hero title animating line by line), the finder questions and the booking dialog's words in `partnersCopy.prompts` (through `PartnershipProvider` to the islands); interface labels ("Book a call", "Request via email", the step names) and mail templates stay in code | B |
| E-Lab testimonials | `e-lab/data/venture-page.ts`: `testimonialCards` (7), `eLabVoices` | `voices-section.tsx`, `venture-trace.tsx`, home partners (`partnerQuoteId`) | **done**: `person` (`placements: eLabFounder`/`eLabInvestor`) with `organization` logos | B |
| E-Lab ventures | `e-lab/data/venture-page.ts`: `notableStartups` (7) | `venture-trace.tsx`, `application-field.tsx` | **done**: `organization` (`roles: eLabVenture`) | B |
| Traced venture | `e-lab/data/venture-page.ts`: `tracedVenture`, `tracedVentureLead` | `venture-trace.tsx` | **done**: `ventureTrace`; the lead sentence stays built in code | B |
| E-Lab venture copy | inline in `e-lab/venture-trace.tsx`, `voices-section.tsx`, `application-field.tsx` (figcaption), `field-dots.tsx` (aria) | e-lab | **done** (integration): `eLabCopy.ventures`, `.voices`, `.field` (the caption's drawn figures are page tokens); the founder and investor picks (`eLabVoices`) and aria strings stay in code | B |
| Event host logos | `events/data/host-logos.ts` (dynamic `/assets/events/hosts/`, `/assets/partners/`) | `events/hero.tsx` | **done**: each co-host's `organization.logoOnDark`, by the events' `coHosts` references (`events/host-content.ts`); no logo list, since the hero orders co-hosts by their events | B |
| Events hero lockup and reel | inline in `events/hero.tsx`, `hero-reel.tsx`, `lockup.tsx` (lead "Hackathons, talks and pitch nights…", generated summary) | /events | **done**: logos from `organization`; the lead without events in `eventsCopy.hero.emptyLead` (integration); the counted lead stays built in code | B |
| REX institutions | `research/data/rex.ts`: `rexInstitutions` (4), `rexLead`, `rexProcess`, `rexOrigin` | `research/research-page.tsx`, home `programs` text | **done**: `organization` in the `rex-institutions` logo list; the REX lead, process and origin in `researchCopy.rex` (integration) | B |
| Member stories | `community/data/member-stories.ts`: `stories` (6) | `community-page.tsx`, `member-stories.tsx`, `semester-plan.tsx`, apply `tracks.tsx`, home `join-section.tsx` | **done**: `person` (`placements: memberStory`); the journey and homepage excerpts must stay verbatim substrings (Studio validation, `lib/quote-excerpt.ts`) | B |

## Phase 4: page copy (C)

| Content | Source | Consumers | Decision | Owner |
| --- | --- | --- | --- | --- |
| Apply FAQ | `apply/data/faq.ts` | `apply-page.tsx` via `apply/content.ts` | **done**: `faq` (`apply`) | – |
| E-Lab FAQ | `e-lab/data/faq.ts` | `e-lab-page.tsx` via `e-lab/content.ts` | **done**: `faq` (`e-lab`) | – |
| Q&A entries | `qanda/data/qanda.ts`: `faqs` (7; `spans`, `points`, `evidence` with facts) | `qanda-page.tsx` (+ FAQPage JSON-LD), `mission-section.tsx`, design system | **done**: `faq` (`qanda`; `anchor` = today's `id`; evidence text with `{{org.*}}`, `{{impact.*}}`, `{{eLab.*}}`); `spans` stay exact substrings of the passage; the `member-journey` answer's points are the journey fork's tracks, derived at render (`qanda/journey-tracks.ts`), not stored | C |
| Mission passage | `qanda/data/qanda.ts`: `missionQuestion`, `missionPassage` | qanda page | **done**: `qandaCopy` (edit together with the spans; the span test must run on CMS data) | C |
| Q&A forks and closing | `qanda/data/qanda.ts`: `forks`; inline in `qanda-page.tsx`, `mission-section.tsx`, `mission-answers.tsx`, `closing-section.tsx` | qanda | **done**: `qandaCopy` (the companies fork is `partnerPitch`) | C |
| Apply page copy | `apply/data/apply.ts`: `heroLead`, `tracksLead`, `selectionStages`, `qualities`, `notRequired`, `values`, `offerings`; inline in `selection.tsx`, `since-founding.tsx`, `tracks.tsx`, `who-should-apply.tsx` (titles, photo alts) | apply | **done**: `applyCopy` (`{{org.majors}}` etc. for facts; stage `when` keys stay code) | C |
| Apply milestones | `apply/data/milestones.ts`: `milestones` (22), `milestoneKinds` | `since-founding.tsx` | **done**: `milestone` (kinds stay code) | C |
| Departments | `community/data/departments.ts` (7, 4 photos) | `departments-section.tsx`, home `programs` (count) | **done**: `department` | C |
| Member journey | `community/data/member-journey.ts`: `memberJourney` (Lucide icons) | `semester-plan.tsx`, apply `tracks.tsx` | **done**: `journeyStep` (`iconKey`); `semesterColumns`, `stepAnchor` stay code | C |
| Community page copy | inline in `community-page.tsx`, `closing-section.tsx`, `departments-section.tsx`, `member-stories.tsx` (section title), `semester-plan.tsx` | community | **done**: `communityCopy` (recruiting dates as `{{recruiting.*}}`) | C |
| Home copy | `home/data/homepage.ts`: `heroLead`, `ledgerFacts`, `programs`, `roomPhotos`, `heroPhotos`, `memberQuote`, `partnerQuoteId`; inline in `home-hero.tsx`, `join-section.tsx`, `mission-section.tsx`, `partners-section.tsx` (see B), `programs-section.tsx`, `room-section.tsx` | home | **done**: `homeCopy` (ledger values stay derived facts; photos as `ContentImage`; quotes reference `person`) | C |
| Projects copy | `projects/data/copy.ts`: `hero`, `figureSeats`, `closing` | `projects-page.tsx`, `closing-section.tsx` | **done**: `projectsCopy` | C |
| Task forces | `projects/data/projects.ts`: `taskForces` (5), `openSeat` | projects page, `copy.ts` | **done**: `taskForce` (`openSeat` into `projectsCopy`) | C |
| Research copy | `research/data/research-copy.ts`: `heroLead`, `abstractStatement`, `getAbstractBody`, `figurePanels`, `closing`; inline in `research-page.tsx` (~15 strings), `research-figure.tsx`, `project-list.tsx`, `research-globe.tsx` (aria) | research | **done**: `researchCopy` (the body stays a template with the live project count) | C |
| Lab sites | `research/data/lab-sites.ts`: `labSites` (6) | `research/research.ts` → globe, affiliations | **done**: `labSite`; `research-page.tsx` passes `getLabSiteList()` to `getLabSites` | C |
| E-Lab selection copy | `e-lab/data/selection.ts`: `selectionStages` (gates and phases; team counts from config); inline in `selection-gates.tsx`, `hero.tsx` | e-lab | **done**: `eLabCopy` (gate counts stay facts) | C |
| Events copy | inline in `events/closing-section.tsx`, `upcoming.tsx`, `register.tsx`, `register-filter.tsx`, `poster-wall.tsx`, `sign-up-action.tsx`, `host-line.tsx`; labels in `events/filters.ts` (`categoryNames`), `events/events.ts` (semester labels) | events | **done** (each section awaits the getter; `events-page.tsx` is untouched): `eventsCopy` for titles, leads and the closing; category and semester labels stay in code (they map schema enums) | C |
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
| UI and accessibility strings | aria labels, screen-reader text, "Read More", "Back", "Zoom in", "Sign up", chip labels, the default "Frequently asked questions" title | interface, not content |
| Standing CTA labels | `config/calls-to-action.ts` ("Become a Member", "Become a Partner", "Apply now", "Questions and answers") | they name destinations, like the menu; one owner keeps every page consistent |
| Logic with embedded wording | `apply/round.ts` status lines and date notes, `config/e-lab.ts` phase copy, the events hero's counted lead, `e-lab/data/venture-page.ts` `tracedVentureLead`, `events/events.ts`, `events/filters.ts`, `partners/partnerships.ts` mail templates, `research/research.ts` | grammar follows dates and counts; tied to code paths and tests |
| JSON-LD facts | `config/seo.ts` (emails, social links, E-Lab summary, organisation figures) | SEO structure and synchronous metadata; reads the code facts (a follow-up could pass the render's facts) |
| Event and research mock fixtures | `lib/mock-cms.ts` | test data for events and research (partners are organisations: the mock queries their backfill); its `liveEventHosts` is the source of the co-hosts the backfill adds to the copied events |
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
| `events/hosts/` | 13 logos (sources: `docs/asset-sources/events-hosts.md`) | `events/data/host-logos.ts` (dynamic paths) | B |
| `homepage/` | 8 photos | home, departments, partners pillars, research figure, e-lab kickoff | C (partners pillars: B) |
| `innovation/` | 6 photos | projects, home programs, research figure | C |
| `partners/` (`hero.webp`, `cases/`, `logos/`, `marquee/`, `people/`) | 1, 3, 62, 14, 6 | partners page, homepage, /research, host logos | B |
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

### Integration pass (done)

Content one stream moved but another stream's file rendered, wired after the three streams merged
(branch `chore/cms-integration`):

- Site facts (A) everywhere a page rendered a config constant: the home ledger, `brandMission`
  (/apply, /qanda), the E-Lab funnel, hero logo, cohort name and funding (gates, dot field,
  trace, closing), the /qanda inbox, the /events social links, the partners pillar figures,
  member counts and contact (as `PartnershipProvider` props for the islands). `/apply` renders
  `recruitingCall(now, await getMembershipWindow())`.
- Member stories (B) in `semester-plan.tsx`, `member-stories.tsx`, `apply/tracks.tsx` and
  `home/join-section.tsx`, passed from the page components.
- REX institutions (B) on /research and in the home programs; the REX copy in `researchCopy`.
- Partner artwork (B) in the home hero and partner wall (`getPartnerLogos()`), the partners
  themselves (`getPartners()`) on the homepage and /research, `partnerPitch` as
  `getPartnersCopy().pitch` in the apply, community and qanda closings.
- Lab sites (C): `getLabSites(names, await getLabSiteList())`.
- Inline copy in A's and B's files into `applyCopy`, `eLabCopy`, `communityCopy.stories`,
  `homeCopy.partners` and `eventsCopy.hero`; the standing CTA labels into
  `config/calls-to-action.ts`.
- `person` references for the home quotes and the journey evidence.

Server-only getters reach other features through `features/<x>/server.ts`; `index.ts` stays
isomorphic, and `src/architecture.test.ts` fails on a client path to `server-only`.

Rules that keep the streams independent: keep the exported shape of code data that other files
import; await a getter in the server section that renders the content (sections are server
components; a client island gets props from its server parent); never edit another stream's file,
list the change here instead.
