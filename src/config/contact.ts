/** Contact shapes and code-owned legal address and partnership CC recipients. Public booking and role addresses come from CMS site settings. */
import { registeredOfficeLinesDe } from "./organization";

/** CMS-owned role addresses. */
export type ContactEmails = {
  general: string;
  partners: string;
  venture: string;
  recruitment: string;
};
/** CMS-owned social destinations. */
export type SocialLinks = {
  linkedin: string;
  instagram: string;
  github: string;
  x: string;
  youtube: string;
  facebook: string;
  tiktok: string;
  slack: string;
};
/** CMS-owned partnership contact details. */
export type PartnershipBooking = { bookingUrl: string; bookingHost: string };
/**
 * German one-line form of the registered office for the Imprint ("Arcisstraße
 * 21, 80333 München"), joined from `registeredOfficeLinesDe` in
 * config/organization.ts.
 */
export const registeredOfficeAddressLine = registeredOfficeLinesDe.join(", ");

/** Existing partnership request CC recipients, kept outside the public CMS. */
export const partnershipContactCc = [
  "silas.zamzow@tum-ai.com",
  "kim.schlemmer@tum-ai.com",
] as const;
