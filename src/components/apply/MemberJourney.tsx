import { Briefcase, GraduationCap, Users } from "lucide-react";
import { Button } from "../ui/button";

export default function MemberJourney() {
  return (
    <div className="flex flex-col gap-8 px-8 md:px-16">
      <div className="w-full pb-8 items-center md:max-h-2/3 flex">
        <img
          className="object-cover bg-gray-200 rounded-xl w-full h-auto"
          src="/assets/apply/new_section_photo_3.webp"
          alt="TUM.ai members2"
        />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-title sm:text-2xl md:text-[2rem] font-semibold animate-item">
          How our <span className="gradient-text">Community</span> Works
        </h2>
        <p className="text-xl md:text-2xl animate-item mb-2">
          The <span className="text-primary font-semibold">member journey</span>{" "}
          at TUM.ai spans across semesters, each lasting 6 whole months. When
          you join the TUM.ai community, here's what you can expect:
        </p>
        <div className="text-base space-y-8">
          {/* Steps */}
          <div>
            <p className="font-semibold text-subtitle text-primary mb-2">
              1. Initial Onboarding:
            </p>
            <p className="text-text-gray mb-4">
              Dive right into an onboarding weekend where you'll get acquainted
              with your batch, familiarize yourself with the internal TUM.ai
              frameworks, hone your ideation skills, and discover various
              opportunities TUM.ai offers.
            </p>
          </div>
          <div>
            <p className="font-semibold text-subtitle text-primary mb-2">
              2. Research or Initiative Track: Choose Your Path at TUM.ai
            </p>
            <p className="text-text-gray mb-2">
              In your first semester, you can choose{" "}
              <span className="font-bold text-dark-purple">
                either the Research Track
              </span>{" "}
              or{" "}
              <span className="font-bold text-dark-purple">
                the Initiative Track
              </span>{" "}
              - two distinct ways to leave your mark at{" "}
              <span className="font-bold text-dark-purple">TUM.ai</span>.
            </p>
            <ul className="list-disc pl-6 text-text-gray mb-2">
              <li>
                <span className="font-bold text-dark-purple">
                  Research Track:
                </span>{" "}
                You'll join a dedicated team working on an{" "}
                <span className="font-bold text-dark-purple">
                  Impact Project
                </span>
                , aligned with your skill set. These projects are designed to
                contribute to the broader research community, with the goal of
                achieving tangible outcomes such as{" "}
                <span className="font-bold text-dark-purple">publications</span>
                .
              </li>
              <li>
                <span className="font-bold text-dark-purple">
                  Initiative Track:
                </span>{" "}
                Join one of our{" "}
                <span className="font-bold text-dark-purple">
                  core departments
                </span>{" "}
                and become a driving force behind everything that makes TUM.ai
                stand out. In this track, you'll dive into exciting projects,
                collaborate with motivated peers, and help shape the future of
                our community. Whether it's launching new ideas, strengthening
                our network, or making the day-to-day magic happen - you'll be
                at the heart of it all, growing your skills while making TUM.ai
                better for everyone.
              </li>
            </ul>
            <p className="text-text-gray mb-2">
              Regardless of your track, your first semester is not just about
              completing tasks. You'll have the chance to engage deeply with our
              vibrant community, develop new skills, and participate in learning
              opportunities, trips, and special events.
            </p>
            <div className="mt-4">
              <Button
                asChild
                variant="primary"
                className="w-full rounded-md px-6 py-3 text-center sm:w-auto"
              >
                <a href="/community">Learn more</a>
              </Button>
            </div>
          </div>
          <div>
            <p className="font-semibold text-subtitle text-primary mb-2">
              3. Growth Opportunities:
            </p>
            <p className="text-text-gray mb-4">
              After your first semester, your journey at TUM.ai doesn't end with
              your initial project. You'll have the opportunity to further shape
              the initiative by{" "}
              <span className="font-bold text-dark-purple">
                founding a strategic task force, joining a department or task
                force that's new to you
              </span>{" "}
              or{" "}
              <span className="font-bold text-dark-purple">
                continuing in your current department
              </span>
              , potentially taking on a{" "}
              <span className="font-bold text-dark-purple">Team Lead</span>{" "}
              role.
            </p>
          </div>
          <div>
            <p className="font-semibold text-subtitle text-primary mb-2">
              4. Research Exchange:
            </p>
            <p className="text-text-gray mb-4">
              After one semester, we can send you off to conduct research at
              prestigious institutions such as{" "}
              <span className="font-bold text-dark-purple">MIT, Harvard, </span>
              or <span className="font-bold text-dark-purple">Berkeley</span> as
              part of the Research Exchange (REX) Program. Through our network
              of alumni, we will not only help you find the right topic but also
              support you with the bureaucracy.
            </p>
          </div>
          <div>
            <p className="font-semibold text-subtitle text-primary mb-2">
              5. Alumni Program:
            </p>
            <p className="text-gray-600 mb-4">
              Once you've been with us for two semesters, you're eligible to
              join the{" "}
              <span className="font-bold text-dark-purple">
                TUM.ai Alumni Program
              </span>
              , marking an important milestone in your journey and opening up
              further opportunities for collaboration and networking.
            </p>
          </div>
        </div>
      </div>
      <section className="container mx-auto">
        {/* Track Cards */}
        <div className="flex flex-col gap-8">
          {/* Project work */}
          <div className="flex items-start gap-6 rounded-xl bg-white/5 border-1 p-6 shadow-lg">
            <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center bg-lavender-tint border border-primary/10 rounded-full">
              <Briefcase className="text-primary" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 text-primary">
                Project work
              </h4>
              <p className="text-text-gray">
                Depending on your expertise and capabilities, we aim for you to
                gain the proficiency needed to oversee a machine learning
                project from its inception to completion, whether in a research
                or industrial context. This is an opportunity to leverage your
                existing skills while cultivating new ones. You'll work on
                everything from communication and tech skills to teamwork and
                time management here.
              </p>
            </div>
          </div>
          {/* Organizational work */}
          <div className="flex items-start gap-6 rounded-xl bg-white/5 border-1 p-6 shadow-lg">
            <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center bg-lavender-tint border border-primary/10 rounded-full">
              <Users className="text-primary" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 text-primary">
                Organizational work
              </h4>
              <p className="text-text-gray">
                In just 4.5 years, TUM.ai has experienced exponential growth,
                primarily fuelled by our dedicated members' brilliant ideas and
                ventures. We envision TUM.ai as a playground for your innovative
                ideas. Whether connecting with high schools and giving AI
                lessons there, organizing hackathons and summits, trips,
                participating in RnD projects, or collaborating with other
                initiatives, TUM.ai is about turning your visions into reality.
                Your dedication and drive are what make TUM.ai truly special.
              </p>
            </div>
          </div>
          {/* Education offerings */}
          <div className="flex items-start gap-6 rounded-xl bg-white/5 border-1 p-6 shadow-lg">
            <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center bg-lavender-tint border border-primary/10 rounded-full">
              <GraduationCap className="text-primary" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 text-primary">
                Education offerings
              </h4>
              <p className="text-text-gray">
                There's so much happening at TUM.ai that sometimes it's hard to
                keep up! Our aim is to help you grow, both personally and in
                your knowledge. Here's just a glimpse of what we offer:
              </p>
              <div className="mt-4 space-y-2 text-text-gray">
                <p>
                  ML Discussion Groups: Deep-tech sessions around Machine
                  Learning, where we focus on specific papers, discuss
                  implementations, mathematical background, and much more.
                </p>
                <p>
                  AI Academy: Contribute to our AI Academy or partake in its
                  offerings.
                </p>
                <p>
                  Exclusive Workshops: From soft skills development to visits to
                  industry giants like Google, Nvidia, and QuantCo, we offer a
                  diverse range of workshops tailored to your interests.
                </p>
                <p>
                  If you ever feel like something&apos;s missing, together with
                  the TUM.ai family, you can make it happen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="w-full pt-8 items-center md:max-h-2/3 flex">
        <img
          className="object-cover bg-gray-200 rounded-xl w-full h-auto"
          src="/assets/apply/new_section_photo_4.webp"
          alt="lecture hall"
        />
      </div>
    </div>
  );
}
