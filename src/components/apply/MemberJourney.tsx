import { Briefcase, GraduationCap, Users } from "lucide-react";

export default function MemberJourney() {
  return (
    <section className="container mx-auto max-w-4xl px-2 py-16">
      <h3 className="text-3xl md:text-4xl font-bold mb-4">
        How our <span className="text-purple-600">Community</span> Works
      </h3>
      <div className="mb-8">
        <span className="text-lg text-gray-700">
          The member journey at{" "}
          <span className="text-purple-600 font-semibold">TUM.ai</span> spans
          across semesters, each lasting 6 whole months. When you join the{" "}
          <span className="text-purple-600 font-semibold">TUM.ai</span>{" "}
          community, here's what you can expect:
        </span>
      </div>
      <div className="space-y-8 mb-12">
        {/* Steps */}
        <div>
          <p className="font-semibold text-lg text-purple-700 mb-2">
            1. Initial Onboarding:
          </p>
          <p className="text-gray-700 mb-4">
            Dive right into an onboarding weekend where you'll get acquainted
            with your batch, familiarize yourself with the internal TUM.ai
            frameworks, hone your ideation skills, and discover various
            opportunities TUM.ai offers.
          </p>
        </div>
        <div>
          <p className="font-semibold text-lg text-purple-700 mb-2">
            2. Research or Initiative Track: Choose Your Path at TUM.ai
          </p>
          <p className="text-gray-700 mb-2">
            In your first semester, you can choose{" "}
            <span className="font-semibold text-purple-700">
              either the Research Track
            </span>{" "}
            or{" "}
            <span className="font-semibold text-purple-700">
              the Initiative Track
            </span>{" "}
            - two distinct ways to leave your mark at{" "}
            <span className="font-semibold text-purple-700">TUM.ai</span>.
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-2">
            <li>
              <span className="font-semibold text-purple-700">
                Research Track:
              </span>{" "}
              You'll join a dedicated team working on an{" "}
              <span className="font-semibold text-purple-700">
                Impact Project
              </span>
              , aligned with your skill set. These projects are designed to
              contribute to the broader research community, with the goal of
              achieving tangible outcomes such as{" "}
              <span className="font-semibold text-purple-700">
                publications
              </span>
              .
            </li>
            <li>
              <span className="font-semibold text-purple-700">
                Initiative Track:
              </span>{" "}
              Join one of our{" "}
              <span className="font-semibold text-purple-700">
                core departments
              </span>{" "}
              and become a driving force behind everything that makes{" "}
              <span className="font-semibold text-purple-700">TUM.ai</span>{" "}
              stand out. In this track, you'll dive into exciting projects,
              collaborate with motivated peers, and help shape the future of our
              community. Whether it's launching new ideas, strengthening our
              network, or making the day-to-day magic happen - you'll be at the
              heart of it all, growing your skills while making{" "}
              <span className="font-semibold text-purple-700">TUM.ai</span>{" "}
              better for everyone.
            </li>
          </ul>
          <p className="text-gray-700 mb-2">
            Regardless of your track, your first semester is not just about
            completing tasks. You'll have the chance to engage deeply with our
            vibrant community, develop new skills, and participate in learning
            opportunities, trips, and special events. Find out more about the
            Tracks and your journey at{" "}
            <a
              href="https://www.tum-ai.com/members"
              className="text-purple-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              TUM.ai
            </a>
            .
          </p>
        </div>
        <div>
          <p className="font-semibold text-lg text-purple-700 mb-2">
            3. Growth Opportunities:
          </p>
          <p className="text-gray-700 mb-4">
            After your first semester, your journey at{" "}
            <span className="font-semibold text-purple-700">TUM.ai</span>{" "}
            doesn't end with your initial project. You'll have the opportunity
            to further shape the initiative by{" "}
            <span className="font-semibold text-purple-700">
              founding a strategic task force, joining a department or task
              force that's new to you
            </span>{" "}
            or{" "}
            <span className="font-semibold text-purple-700">
              continuing in your current department
            </span>
            , potentially taking on a{" "}
            <span className="font-semibold text-purple-700">Team Lead</span>{" "}
            role.
          </p>
        </div>
        <div>
          <p className="font-semibold text-lg text-purple-700 mb-2">
            4. Research Exchange:
          </p>
          <p className="text-gray-700 mb-4">
            Now, we can send you off into research at prestigious institutions
            such as{" "}
            <span className="font-semibold text-purple-700">
              MIT, Harvard, or Berkeley
            </span>
            . Through our network of alumni, we will not only help you find the
            right topic but also support you with the bureaucracy.
          </p>
        </div>
        <div>
          <p className="font-semibold text-lg text-purple-700 mb-2">
            5. Alumni Program:
          </p>
          <p className="text-gray-700 mb-4">
            Once you've been with us for two semesters, you're eligible to join
            the{" "}
            <span className="font-semibold text-purple-700">
              TUM.ai Alumni Program
            </span>
            , marking an important milestone in your journey and opening up
            further opportunities for collaboration and networking.
          </p>
        </div>
      </div>
      {/* Track Cards */}
      <div className="flex flex-col gap-8 mt-12">
        {/* Project work */}
        <div className="flex items-start gap-6 rounded-xl bg-white/5 border border-white/10 p-6 shadow-lg hover:scale-[1.03] transition-transform">
          <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full">
            <Briefcase className="text-purple-700" size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2 text-purple-700">
              Project work
            </h4>
            <p className="text-gray-700">
              Depending on your expertise and capabilities, we aim for you to
              gain the proficiency needed to oversee a machine learning project
              from its inception to completion, whether in a research or
              industrial context. This is an opportunity to leverage your
              existing skills while cultivating new ones. You'll work on
              everything from communication and tech skills to teamwork and time
              management here.
            </p>
          </div>
        </div>
        {/* Organizational work */}
        <div className="flex items-start gap-6 rounded-xl bg-white/5 border border-white/10 p-6 shadow-lg hover:scale-[1.03] transition-transform">
          <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full">
            <Users className="text-purple-700" size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2 text-purple-700">
              Organizational work
            </h4>
            <p className="text-gray-700">
              In just 4.5 years, TUM.ai has experienced exponential growth,
              primarily fuelled by our dedicated members' brilliant ideas and
              ventures. We envision TUM.ai as a playground for your innovative
              ideas. Whether connecting with high schools and giving AI lessons
              there, organizing hackathons and summits, trips, participating in
              RnD projects, or collaborating with other initiatives, TUM.ai is
              about turning your visions into reality. Your dedication and drive
              are what make TUM.ai truly special.
            </p>
          </div>
        </div>
        {/* Education offerings */}
        <div className="flex items-start gap-6 rounded-xl bg-white/5 border border-white/10 p-6 shadow-lg hover:scale-[1.03] transition-transform">
          <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full">
            <GraduationCap className="text-purple-700" size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2 text-purple-700">
              Education offerings
            </h4>
            <p className="text-gray-700">
              There's so much happening at TUM.ai that sometimes it's hard to
              keep up! Our aim is to help you grow, both personally and in your
              knowledge. Here's just a glimpse of what we offer:
              <br />
              ML Discussion Groups: Deep-tech sessions around Machine Learning,
              where we focus on specific papers, discuss implementations,
              mathematical background, and much more!
              <br />
              AI Academy: Contribute to our AI Academy or partake in its
              offerings.
              <br />
              Exclusive Workshops: From soft skills development to visits to
              industry giants like Google, Nvidia, and QuantCo, we offer a
              diverse range of workshops tailored to your interests.
              <br />
              If you ever feel like something's missing, together with the
              TUM.ai family, you can make it happen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
