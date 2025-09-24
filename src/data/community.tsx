export interface Step {
  step: string;
  name: string;
  gradient: string;
  description: string;
}

export const steps: Step[] = [
  {
    step: "00",
    name: "Batch Introduction",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "Kick off your journey at the onboarding weekend! Meet members, join social events, and deepen connections on our getaway.",
  },
  {
    step: "01A",
    name: "Research Track",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "Join a team on an Impact Project applying AI to real-world challenges. Contribute to research, academic publications, or open-source work, and engage with the TUM.ai community through trips, events, and hands-on learning.",
  },
  {
    step: "01B",
    name: "Initiative Track",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "Join one of our core departments and become a driving force behind everything that makes TUM.ai stand out. Shape the future of TUM.ai, and develop your skills while engaging in trips, events, and learning opportunities.",
  },
  {
    step: "02",
    name: "Growth Opportunities",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "After your first semester, expand your impact — join new teams, lead a task force, or take on a Team Lead role.",
  },
  {
    step: "03",
    name: "Research Exchange (REX) Program",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "After one semester, you can join the REX Program — conduct research at top institutions like MIT, Harvard, or Cambridge. With our alumni network, we guide you in finding a topic, navigating applications, and contributing to cutting-edge AI research globally.",
  },
  {
    step: "04",
    name: "Alumni Program",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "Having been with TUM.ai for two or more semesters, you can join the Alumni Program, opening up opportunities for continued networking and collaboration.",
  },
];

export interface Department {
  name: string;
  icon: string;
  description: string;
  gradient: string;
}

export const departments: Department[] = [
  {
    name: "Makeathon",
    icon: "Rocket",
    description:
      "We are responsible for our signature event, 'Makeathon,' which draws over 500 participants, as well as several smaller hackathons on diverse, niche topics e.g. civil engineering, public sector. We handle organizing these events from start to finish, managing everything from planning to execution.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Venture",
    icon: "Building2",
    description:
      "The venture team runs the E-Lab, our AI startup incubator, providing founders with mentorship, resources, and guidance to turn innovative ideas into high-impact startups. Participants gain strong exposure and direct contact with VC companies, building valuable networks to support their growth.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  // {
  //   name: "Innovation",
  //   icon: "Lightbulb",
  //   description:
  //     "Exploring AI applications such as in quantitative finance, robotics, medicine, and accelerating GPUs.",
  //   gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  // },
  // {
  //   name: "Education",
  //   icon: "GraduationCap",
  //   description:
  //     "Creating and delivering AI educational content and events for all skill levels - from beginner to expert.",
  //   gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  // },
  {
    name: "Software Development",
    icon: "Code",
    description:
      "We’re a small, hands-on team passionate about building reliable, scalable software. This semester we are tackling two big projects: revamping our public website and developing a secure full-stack Member Manager tool. We value curiosity, responsibility, and grit over prior experience, and if you want to build software that is sleek, secure, and impactful, this is the team to join.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Legal & Finance",
    icon: "Scale",
    description:
      "The legal and finance team ensures that all our operations run smoothly, safely, and within regulations. We handle contracts, compliance, budgeting, and financial planning, while supporting other departments with legal guidance and financial resources to help their projects succeed.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Community",
    icon: "Users",
    description:
      "We make the TUM.ai community feel like one big group of friends by bringing people together at exciting events. Our team will organize company visits, networking meetups, and joint activities with other student groups, as well as fun hangouts like bar nights or sports tournaments. The goal is to create lasting connections and a vibrant, welcoming atmosphere for everyone at TUM.ai.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Marketing",
    icon: "Megaphone",
    description:
      "The Marketing Department shapes TUM.ai’s public image by driving strategic communication, creating impactful designs, and promoting our vision and events to the broader community. oder The Marketing Department at TUM.ai gives our vision a voice and a look — translating ideas into designs and stories that resonate across our students and professional network.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
  {
    name: "Partners & Sponsors",
    icon: "Handshake",
    description:
      "The partnership department is the main point of contact for companies, focused on building strategic partnerships and securing sponsorships to support ambitious events and projects. We make speaker events with AI leaders like OpenAI and Anthropic happen, and connect other departments with the right partners to help their initiatives succeed.",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
  },
];
//   {
//     name: "Makeathon",
//     icon: "Rocket",
//     description:
//       "Organizing Munich's largest AI Hackathon - a 48-hour virtual challenge where teams develop real-world business cases with AI. Features workshops, talks, and expert mentorship.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Venture",
//     icon: "Building2",
//     description:
//       "Bridging the gap between ideas and successful AI startups. We foster innovation and entrepreneurial spirit within TUM.ai.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Innovation",
//     icon: "Lightbulb",
//     description:
//       "Exploring AI applications such as in quantitative finance, robotics, medicine, and accelerating GPUs.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Education",
//     icon: "GraduationCap",
//     description:
//       "Creating and delivering AI educational content and events for all skill levels - from beginner to expert.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Software Development",
//     icon: "Code",
//     description:
//       "Building and maintaining TUM.ai's digital infrastructure, from in-house tools to cloud services.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Legal & Finance",
//     icon: "Scale",
//     description:
//       "Ensuring TUM.ai's compliance and financial sustainability while maintaining our non-profit status.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Community",
//     icon: "Users",
//     description:
//       "Building and nurturing our community through events, buddy programs, and recruitment.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Marketing",
//     icon: "Megaphone",
//     description:
//       "Shaping TUM.ai's public image and promoting our vision through strategic communication.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
//   {
//     name: "Partners & Sponsors",
//     icon: "Handshake",
//     description:
//       "Building strategic partnerships and securing sponsorships to enable ambitious events and projects.",
//     gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
//   },
// ];
