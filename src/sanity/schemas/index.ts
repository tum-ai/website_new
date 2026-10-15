import { eventType } from "./event";
import { partnerType } from "./partner";
import { researchType } from "./research";

/**
 * The document types the old site on `main` also has (events, partners and
 * research), registered on every dataset. Page content types go into
 * `./content/index.ts` instead.
 */
export const liveSchemaTypes = [researchType, eventType, partnerType];
