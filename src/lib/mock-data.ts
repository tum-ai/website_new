import type { Event } from "./types.ts"

// Current date for reference
const currentDate = new Date()

// Helper to create dates relative to current date
const createDate = (dayOffset: number, hour = 18, minute = 0): string => {
  const date = new Date(currentDate)
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export const mockEvents: Event[] = [
  // Upcoming events
  {
    id: "1",
    title: "AI Ethics Workshop",
    description:
      "Join us for a workshop on ethical considerations in AI development. We'll discuss responsible AI practices, bias mitigation, and the social impact of AI systems.",
    date: createDate(14), // 2 weeks from now
    location: "TUM Informatics Building, Room 0.01",
    city: "Munich",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: "2",
    title: "Machine Learning Hackathon",
    description:
      "A 48-hour hackathon focused on solving real-world problems using machine learning. Form teams, develop solutions, and compete for prizes!",
    date: createDate(30), // 1 month from now
    location: "Munich Urban Colab",
    city: "Munich",
    category: "Hackathon",
    imageUrl: "",
  },
  {
    id: "3",
    title: "Industry Talk: AI in Healthcare",
    description:
      "Industry experts discuss how AI is transforming healthcare, from diagnosis to treatment planning and patient care optimization.",
    date: createDate(45), // 1.5 months from now
    location: "TUM Main Campus, Audimax",
    city: "Munich",
    category: "Talk",
    imageUrl: "",
  },
  {
    id: "4",
    title: "Natural Language Processing Workshop",
    description:
      "Learn about the latest advancements in NLP and how to implement transformer models for various language tasks.",
    date: createDate(60), // 2 months from now
    location: "Online (Zoom)",
    city: "Online",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: "5",
    title: "AI Research Symposium",
    description:
      "A day of presentations and discussions on cutting-edge AI research from TUM and partner institutions.",
    date: createDate(75), // 2.5 months from now
    location: "TUM Institute for Advanced Study",
    city: "Munich",
    category: "Symposium",
    imageUrl: "",
  },

  // Past events
  {
    id: "6",
    title: "Computer Vision Deep Dive",
    description:
      "An intensive workshop on computer vision algorithms and applications, with hands-on exercises using PyTorch.",
    date: createDate(-20), // 20 days ago
    location: "TUM Department of Informatics",
    city: "Munich",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: "7",
    title: "TUM.ai Makeathon 2023",
    description:
      "Our annual makeathon brought together 150 students to develop AI solutions for sustainability challenges.",
    date: createDate(-60), // 2 months ago
    location: "Munich Urban Colab",
    city: "Munich",
    category: "Hackathon",
    imageUrl: "",
  },
  {
    id: "8",
    title: "Reinforcement Learning Workshop",
    description: "Introduction to reinforcement learning concepts and practical applications in robotics and game AI.",
    date: createDate(-90), // 3 months ago
    location: "TUM Informatics Building",
    city: "Munich",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: "9",
    title: "AI Career Fair",
    description:
      "Connect with top companies hiring in AI, machine learning, and data science. Resume reviews and interview preparation included.",
    date: createDate(-120), // 4 months ago
    location: "TUM Main Campus",
    city: "Munich",
    category: "Career",
    imageUrl: "",
  },
  {
    id: "10",
    title: "Generative AI Showcase",
    description:
      "Demonstrations of cutting-edge generative AI models for text, images, and music, with discussions on their creative applications.",
    date: createDate(-150), // 5 months ago
    location: "Berlin Tech Hub",
    city: "Berlin",
    category: "Showcase",
    imageUrl: "",
  },
  {
    id: "11",
    title: "AI for Sustainability Symposium",
    description:
      "Exploring how AI can help address climate change and promote sustainable development across industries.",
    date: createDate(-180), // 6 months ago
    location: "Berlin Conference Center",
    city: "Berlin",
    category: "Symposium",
    imageUrl: "",
  },
]

export const eventCategories = ["All Categories", "Workshop", "Hackathon", "Talk", "Symposium", "Career", "Showcase"]

export const eventCities = ["All Cities", "Munich", "Berlin", "Online"]
