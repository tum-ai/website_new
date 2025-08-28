import Logos from "@/components/Logos";
import { Separator } from "@/components/ui/separator";
// components/ContentPage.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentPageProps<T> {
  title: string;
  description: string;
  tabs: {
    value: string;
    label: string;
    content: React.ReactNode;
  }[];
  collaborators?: { logos: string[] };
  gradientColors?: string; // optional gradient for hero section
}

export function ContentPage<T>({
  title,
  description,
  tabs,
  collaborators,
  gradientColors,
}: ContentPageProps<T>) {
  return (
    <section
      className={`relative overflow-hidden p-8 text-white ${
        gradientColors || "bg-gradient-to-br from-blue-900 to-purple-900"
      } sm:py-16 lg:py-24`}
    >
      {/* Hero Section */}
      <div className="inset-0 flex items-center justify-center flex-col mb-8">
        <div className="relative z-10 w-full max-w-5xl px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 w-full max-w-2xl">
              <h1 className="text-4xl font-bold text-white md:text-5xl">
                {title}
              </h1>
            </div>
            <p className="mx-auto max-w-2xl text-lg text-white">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        defaultValue={tabs[0].value}
        className="w-full flex items-center justify-center px-30"
      >
        <TabsList className="w-full bg-transparent gap-4 justify-center text-xl">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-white"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Separator className="bg-gray-700 my-2" />

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {collaborators?.logos && (
        <>
          <div className="my-8 h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-auto"></div>
          <h3 className="mb-4 text-center text-3xl font-semibold">
            Collaborators
          </h3>
          <Logos logos={collaborators.logos} />
        </>
      )}
    </section>
  );
}
