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
      "Kick off your journey with the Batch Introduction! During the onboarding weekend, you'll get introduced to TUM.ai, meet current and new members, and take part in social events - setting the foundation for your journey. The experience continues with a getaway trip designed to deepen connections with both previous and new members in an unforgettable setting.",
  },
  {
    step: "01A",
    name: "Research Track",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "Join a dedicated team working on an Impact Project aligned with your skills and interests, applying AI to address real-world challenges in a collaborative environment. These projects are designed to contribute to the broader research and technology community through tangible outcomes such as academic publications or open-source contributions. Along the way, you'll have the opportunity to engage deeply with our vibrant community, develop new skills, and take part in learning opportunities, trips, and special events—all while experiencing the hands-on, team-oriented culture that defines TUM.ai.",
  },
  {
    step: "01B",
    name: "Initiative Track",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "Join one of our core departments and become a driving force behind everything that makes TUM.ai stand out. In this track, you'll dive into exciting projects, collaborate with motivated peers, and help shape the future of our community. Whether it's launching new ideas, strengthening our network, or making the day-to-day magic happen - you'll be at the heart of it all, growing your skills while making TUM.ai better for everyone. Alongside your work, you'll have the chance to engage deeply with our vibrant network, develop new skills, and take part in learning opportunities, trips, and special events.",
  },
  {
    step: "02",
    name: "Growth Opportunities",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "After your first semester, your journey at TUM.ai doesn't end with your initial project. You'll have the opportunity to further shape the initiative by founding a strategic task force, joining a department or task force that's new to you or continuing in your current department, potentially taking on a Team Lead role.",
  },
  {
    step: "03",
    name: "Research Exchange (REX) Program",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "After completing one semester, you become eligible for the REX Program-your gateway to conducting research at world-renowned institutions like MIT, Harvard, or Cambridge. Through our strong alumni network, we'll help you find the right research topic, navigate the application process, and support you every step of the way. It's a unique chance to take your AI journey global and contribute to cutting-edge research on an international stage.",
  },
  {
    step: "04",
    name: "Alumni Program",
    gradient: "bg-linear-to-br from-slate-50 via-slate-100 to-slate-200",
    description:
      "Having been with TUM.ai for two or more semesters, you can join the Alumni Program, opening up opportunities for continued networking and collaboration.",
  },
];