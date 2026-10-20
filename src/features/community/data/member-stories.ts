/** A member's testimonial: who they are and their story in their words. */
export type MemberStory = {
  /**
   * The `person` document's key (`member-story` placement): the stable identity used to match quoted authors when names change.
   */
  key: string;
  name: string;
  /** Their degree and university. */
  role: string;
  story: string;
  image: string;
  /** CSS `object-position` of the portrait, from the Studio hotspot. */
  imagePosition?: string;
};
