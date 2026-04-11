"use client";

import dynamic from "next/dynamic";

const DeferredScrollSection = dynamic(() => import("./ScrollSection"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="mx-4 mb-4 h-56 rounded-xl bg-gray-100/70 md:mx-8 md:mb-16 md:h-72"
    />
  ),
});

const DeferredCarouselHome = dynamic(() => import("./CarouselHome"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="mx-4 mb-12 aspect-[16/9] rounded-xl bg-gray-100/80 md:mx-10"
    />
  ),
});

export function DeferredHomeSections() {
  return (
    <>
      <DeferredScrollSection />
      <DeferredCarouselHome />
    </>
  );
}
