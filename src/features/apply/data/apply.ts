import {
  Book,
  Dumbbell,
  Flame,
  Globe,
  Handshake,
  MessageCircle,
  Rocket,
  Zap,
} from "lucide-react";
import { organizationFacts } from "@/config/organization";

export const requirements = [
  {
    icon: Flame,
    title: "Passion for AI",
    text: "A genuine interest in artificial intelligence and its applications.",
  },
  {
    icon: Dumbbell,
    title: "Commitment & Motivation",
    text: "Willingness to invest time and energy to push our initiative forward.",
  },
  {
    icon: Zap,
    title: "Proactiveness",
    text: "Taking initiative and being ready to react quickly to new topics and challenges.",
  },
  {
    icon: MessageCircle,
    title: "Clear Communication",
    text: "Open, honest, and effective communication within the team.",
  },
];

export const values = [
  {
    icon: Rocket,
    title: "Action, Ambition & Leadership",
    text: "We prioritize setting goals and advancing in all our activities, constantly aiming for excellence. Our commitment to outcomes drives us to take responsibility, even in collaborative settings. We proactively build partnerships with key organizations like 180DC, CDTM, and TUM Blockchain Club, extending our network across TUM, UnternehmerTUM, AppliedAI, ETH Zürich, and beyond.",
  },
  {
    icon: Globe,
    title: "Diversity & Inclusiveness",
    text: `Our club consists of students from ${organizationFacts.majors}+ majors and ${organizationFacts.nationalities}+ nationalities worldwide. We recognize and embrace the power of collaborative teams of unique individuals, which help us foster better decision-making and stimulate new ideas.`,
  },
  {
    icon: Book,
    title: "Learn & Grow",
    text: "We're committed to ongoing learning and staying current with AI advancements. Embracing our diversity, we collaborate to deepen our understanding and maximize AI's potential across all domains. Therefore, we send 10-15 people per semester to institutions such as MIT, Harvard, Standford, and Berkeley to do research, exchange semesters, and their bachelor's / master's thesis.",
  },
  {
    icon: Handshake,
    title: "Trust & Transparency",
    text: "We enable everyone to voice their opinions and invite open communication. We aim to support one another and work in harmony together as a whole to reach our goals. As a community, we respect and trust one another, knowing we can rely on each other's honesty. Offer students practical experience through projects with peers from the group.",
  },
];
