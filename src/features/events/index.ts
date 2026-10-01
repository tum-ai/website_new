/**
 * The events feature's isomorphic entry for other features: how an event's
 * title, co-hosts and place read, so other pages set events the way
 * /events does (/hackathons lists the hackathon events).
 *
 * The /events route imports `./events-page` directly. Never re-export a
 * page here: it would ship its islands and CSS to every importer.
 */
export { formatEventLocation, hostsBeyondTitle } from "./events";
export { Lockup } from "./lockup";
export { SignUpAction } from "./sign-up-action";
