import { cx } from "class-variance-authority";

export default function Disclaimer() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden">
        <div className="container mx-auto flex pt-32 px-4 sm:px-16 max-w-4xl flex-col justify-center">
          <h1 className={cx("text-6xl font-medium md:text-7xl", "text-black")}>
            Disclaimer
          </h1>
        </div>
      </section>

      <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-16 bg-white">
        <section className="mb-8">
          <p className="text-gray-700">
            We are not an educational program. That means you are not only
            joining to learn but also to contribute to the development of the
            organization. We don't give in-depth lectures or crash courses in AI
            and coding yet - you need to interact with other members to learn
            things. Help is always given to those who ask. We do a lot of
            organizational work - the AI ecosystem is not ready, and you will be
            part of building it up. We have a membership fee of 10€ per semester
            for all of our active members.{" "}
          </p>
        </section>
      </div>
    </div>
  );
}
