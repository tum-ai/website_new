import { eventType } from "./event";
import { partnerType } from "./partner";
import { researchType } from "./research";

/**
 * The document types of the `live` workspace (the live dataset, which the old
 * site on `main` also renders). Content types go into
 * `./content/index.ts` instead.
 */
export const liveSchemaTypes = [researchType, eventType, partnerType];
