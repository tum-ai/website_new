/** A member's testimonial: who they are and their story in their words. */
export type MemberStory = {
  /**
   * The `person` document's key (`member-story` placement): its backfill id
   * and how code picks the story, fixed so a renamed member stays one
   * document.
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

/** Member testimonials shown on /community. */
export const stories = [
  {
    key: "jasmin-el-wafi",
    name: "Jasmin El-Wafi",
    role: "Mathematics in Data Science, TUM",
    story:
      "TUM.ai has enabled me to grow from ML research with MIT to leading the dev team. I rebuilt this website for minimal maintenance and developed tools to automate and optimize internal processes. Being part of such an ambitious and intelligent community inspires learning, aiming high, and building lasting friendships.",
    image: "/assets/apply/jasmin_el-wafi.webp",
  },
  {
    key: "zexin-gong",
    name: "Zexin Gong",
    role: "Information Systems, TUM",
    story:
      "Becoming co-team-lead of the dev team shortly after joining TUM.ai enabled me to take initiative, collaborate with talented and passionate individuals, and develop impactful tools used by hundreds of people. Being part of this community not only enhanced my technical, leadership, and project management skills, but also helped me forge incredible friendships.",
    image: "/assets/apply/zexin_gong.webp",
  },
  {
    key: "sami-haddouti",
    name: "Sami Haddouti",
    role: "Robotics, Cognition and Intelligence, TUM",
    story:
      "TUM.ai has enabled me to evolve from conducting applied AI research in collaboration with MIT to negotiating partnership contracts with leading AI companies. The breadth of responsibilities and leadership opportunities here is truly unmatched.",
    image: "/assets/apply/sami_haddouti.webp",
  },
  {
    key: "xabier-irizar",
    name: "Xabier Irizar",
    role: "Robotics, Cognition and Intelligence, TUM",
    story:
      "Being a team lead at TUM.ai allowed me to gain first-hand leadership experience and have the creative freedom to direct a department of 10+ people. TUM.ai helped me immensely in expanding my horizons of what is possible to do during university.",
    image: "/assets/apply/xabi.webp",
  },

  {
    key: "simon-huang",
    name: "Simon Huang",
    role: "Computer Science, TUM",
    story:
      "Within one semester at TUM.ai, I went from joining the software development team to leading a group of seven. Building our internal member management platform taught me the value of teamwork and leadership, while also helping me grow both personally and professionally. TUM.ai inspired me to step out of my comfort zone and connect with ambitious, like-minded people.",
    image: "/assets/apply/simon_huang.webp",
  },

  {
    key: "marco-lorenz",
    name: "Marco Lorenz",
    role: "Robotics, Cognition and Intelligence, TUM",
    story:
      "Joining TUM.ai as part of the MIT project gave me the chance to work on exciting AI research with talented peers and mentors. I also enjoyed participating in a GenAI Hackathon in Paris and later joined the recruiting team, helping to shape the community. The inspiring people I met at TUM.ai have motivated me to pursue new opportunities and push my own ambitions further.",
    image: "/assets/apply/marco_lorenz.webp",
  },
] satisfies MemberStory[];

/**
 * The key of the member story told by `name`, for backfill references from
 * copy that quotes a member by name (the journey's evidence, the homepage
 * join quote). Throws for a name without a story, so a renamed member
 * fails the backfill test instead of importing a dangling reference.
 */
export function memberStoryKey(name: string): string {
  const story = stories.find((entry) => entry.name === name);
  if (!story) throw new Error(`No member story by "${name}"`);
  return story.key;
}
