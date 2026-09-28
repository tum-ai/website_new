/**
 * Single source for TUM.ai contact details: role email addresses, social
 * profiles and the Imprint's address line. The header, footer, Q&A, imprint,
 * partner flows and JSON-LD read them. See "Updating site facts" in
 * docs/contributor-guide.md.
 */
import { legalEntity } from "./organization";

export const contactEmails = {
  general: "contact@tum-ai.com",
  partners: "partners@tum-ai.com",
  venture: "venture@tum-ai.com",
  recruitment: "recruitment@tum-ai.com",
} as const;

/**
 * Who handles partnership requests from /partners. The finder's email goes to
 * `contactEmails.partners` with `cc` copied in, and "Book a call" embeds the
 * `bookingUrl` Cal.eu page, introduced as a chat with `bookingHost`. All three
 * change together when the partnership leads hand over.
 *
 * TODO(content): `cc`, `bookingUrl` and `bookingHost` name people, not roles.
 * Does partners@ reach the leads on its own (then drop `cc`), and is there a
 * shared Cal.eu team page to use instead of a personal one?
 */
export const partnershipContact = {
  cc: ["silas.zamzow@tum-ai.com", "kim.schlemmer@tum-ai.com"],
  bookingUrl: "https://cal.eu/silaszamzow/tumai-quick-chat",
  bookingHost: "Silas",
} as const;

export const socialLinks = {
  linkedin: "https://www.linkedin.com/company/tum-ai",
  instagram: "https://www.instagram.com/tum.ai_official/",
  github: "https://github.com/tum-ai",
  x: "https://x.com/TUMai_official",
  youtube: "https://www.youtube.com/@tum.aistudentinitiative",
  facebook: "https://www.facebook.com/p/Tumai-100064870068663/",
  tiktok: "https://www.tiktok.com/@tum.ai_",
  slack:
    "https://join.slack.com/t/tumaipublic/shared_invite/zt-10kg0t1f9-JLRXDxY_d_vprKWgab0cVw",
} as const;

/**
 * German one-line form of the registered office for the Imprint ("Arcisstraße
 * 21, 80333 München"). The address itself lives in config/organization.ts.
 */
export const registeredOfficeAddressLine = `${legalEntity.registeredOffice.streetAddress}, ${legalEntity.registeredOffice.postalCode} München`;
