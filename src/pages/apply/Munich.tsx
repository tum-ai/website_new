import FAQ from "@/components/FAQ";
import Benefits from "@/components/Benefit";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import {
    Star,
    Globe,
    Book,
    Handshake,
    Flame,
    Dumbbell,
    Zap,
    MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

// Munich-specific FAQ data
const munichFaqs = [
    {
        question: "Do I need to be an AI expert to join TUM.ai?",
        answer:
            "You don't need to be an AI expert to join TUM.ai. We believe that individuals can learn and adapt quickly with the right mindset. Even if you're not an AI specialist but have a genuine interest in the field and are eager to learn and contribute, you could be a perfect fit for our team. Diverse perspectives and backgrounds bring fresh insights and innovative ideas. Note that the ML projects in your first semester are based on your area and level of expertise.",
    },
    {
        question: "How does the application timeline look like?",
        answer:
            "Application March 31st - April 27th: Fill out our application form. Interview May 5th - May 11th: If you passed the screening phase, we will invite you to an interview round to get to know you better. Onboarding (Mandatory) May 16th - May 18th: Congratulations! You are invited to our Onboarding program to get to know TUM.ai!",
    },
    {
        question: "How should I prepare myself for the interview?",
        answer:
            "To prepare for the interview, ensure you have a comprehensive understanding of what TUM.ai stands for and its objectives. Familiarize yourself with the content on the TUM.ai website. Additionally, keep up-to-date with the latest trends and developments in AI. The more prepared you are, the more comfortable and confident you'll feel during the interview.",
    },
    {
        question: "Contact us if you have more questions?",
        answer:
            "If you have further questions, feel free to write us an email at recruitment@tum-ai.com.",
    },
    {
        question: "Disclaimer",
        answer:
            "We are not an educational program. That means you are not only joining to learn but also to contribute to the development of the organization. We don't give in-depth lectures or crash courses in AI and coding yet - you need to interact with other members to learn things. Help is always given to those who ask. We do a lot of organizational work - the AI ecosystem is not ready, and you will be part of building it up. We have a membership fee of 10€ per semester for all of our active members.",
    },
];

// Values section data (using Lucide icons)
const values = [
    {
        icon: Star,
        title: "Action, Ambition & Leadership",
        text: "We prioritize setting goals and advancing in all our activities, constantly aiming for excellence. Our commitment to outcomes drives us to take responsibility, even in collaborative settings. We proactively build partnerships with key organizations like 180DC, CDTM, and TUM Blockchain Club, extending our network across TUM, UnternehmerTUM, AppliedAI, ETH Zürich, and beyond.",
    },
    {
        icon: Globe,
        title: "Diversity & Inclusiveness",
        text: "Our club consists of students from 20+ majors and 35+ nationalities worldwide. We recognize and embrace the power of collaborative teams of unique individuals, which help us foster better decision-making and stimulate new ideas.",
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

// Requirements section data (using Lucide icons)
const requirements = [
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
        title: "Pro-activeness",
        text: "Taking initiative and being ready to react quickly to new topics and challenges.",
    },
    {
        icon: MessageCircle,
        title: "Clear Communication",
        text: "Open, honest, and effective communication within the team.",
    },
];

// Stories section data (example, replace with real stories if available)
const stories = [
    {
        name: "Xabier Irizar",
        role: "Robotics, Cognition and Intelligence, TUM",
        story:
            "Being a team lead at TUM.ai allowed me to gain first-hand leadership experience and have the creative freedom to direct a department of 10+ people. TUM.ai helped me immensely in expanding my horizons of what is possible to do during university.",
        image: "/assets/xabi.jpg",
    },
    {
        name: "Maria Aysina",
        role: "Computational Linguistics, LMU",
        story:
            "Within one semester, I gained hands-on skills in designing graphics, managing social media channels, and co-organizing events. Being part of TUM.ai made me realize how much you can achieve when you step out of your comfort zone and take on new challenges.",
        image: "/assets/maria_aysina.png",
    },
    // Add more stories as needed
];

export default function Munich() {
    // Memoize icons for performance
    const valuesWithIcons = useMemo(() => values, []);
    const requirementsWithIcons = useMemo(() => requirements, []);
    const staggerDelay = 0.1;
    return (
        <div className="flex flex-col gap-24">


            <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 to-purple-950 px-4 text-white">
                <div className="relative z-10 max-w-4xl space-y-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="mx-auto flex items-center justify-center"
                    >
                        <img
                            src="/assets/logo_new_white_standard.png"
                            alt="TUM.ai Logo"
                            width={300}
                            height={66}
                            className="mx-auto"
                        />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: staggerDelay, ease: "easeOut" }}
                        className="text-xl font-light tracking-wide md:text-2xl"
                    >
                        <span className="relative">Join Us!
                            Are you a young innovator passionate about making a difference? We're here to bridge the gap by connecting you with key stakeholders in your field. Together, we can harness the power of AI for transformative, interdisciplinary projects that drive tangible social change. </span>
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: staggerDelay * 2,
                            ease: "easeOut",
                        }}
                        className="flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4"
                    ></motion.div>
                    <Button asChild variant="primary" className="px-8 py-4 text-lg">
                        <a href="/">Applications are closed!</a>
                    </Button>
                </div>
            </section>

            {/* Values Section */}
            <section className="container mx-auto max-w-5xl px-4 py-16">
                <h2 className="mb-8 text-3xl font-semibold text-center text-purple-700">Our Values</h2>
                <Benefits benefits={valuesWithIcons} columns={2} showShadow color="purple" />
            </section>


            {/* Stories Section */}
            <section className="container mx-auto max-w-5xl px-4 py-16">
                <h2 className="mb-8 text-3xl font-semibold text-center text-purple-700">Member Stories</h2>
                <div className="grid gap-8 md:grid-cols-2">
                    {stories.map((story) => (
                        <div key={story.name} className="rounded-xl bg-white/5 p-6 shadow-lg flex flex-col items-center">
                            <img src={story.image} alt={story.name} className="mb-4 h-32 w-32 rounded-full object-cover" />
                            <h3 className="text-xl font-bold text-purple-800">{story.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{story.role}</p>
                            <p className="text-base text-gray-800 text-center">{story.story}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Requirements Section */}
            <section className="container mx-auto max-w-5xl px-4 py-16">
                <h2 className="mb-8 text-3xl font-semibold text-center text-purple-700">Is TUM.ai the right choice for me?</h2>
                <p className="text-sm text-gray-600 mb-2">There is no secret to TUM.ai’s fast-paced growth. Every semester, we have recruited amazing members who drive the initiative forward. If you can identify with the following qualities, you are the one that we are looking for!</p>

                <Benefits benefits={requirementsWithIcons} columns={2} showShadow color="purple" />
            </section>

            {/* FAQ Section */}
            <section className="container mx-auto max-w-5xl px-4 py-16">
                <h2 className="mb-8 text-3xl font-semibold text-center text-purple-700">FAQ</h2>
                <FAQ questions={munichFaqs} />
            </section>

            {/* Outro Section */}
            <section className="container mx-auto max-w-5xl px-4 py-16 text-center">
                <h2 className="mb-4 text-3xl font-semibold text-purple-700">Apply now and join TUM.ai</h2>
                <p className="mb-8 text-lg text-gray-700">
                    Together, we shape the AI ecosystem by making AI accessible to everyone in the future. We are excited to have you on board.
                </p>

            </section>
        </div>
    );
}
