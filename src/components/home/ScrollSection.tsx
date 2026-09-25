import Image from "next/image";
import { Marquee } from "@/components/ds";
import { pictures } from "@/data/homepage";
import { PHOTO_RAIL_ITEM } from "./deferred-layout";

/**
 * Full-bleed rail of community photos. Loaded after hydration through
 * DeferredHomeSections (next/dynamic, ssr: false) so none of these images
 * reach the prerendered HTML. The photos are ambience, so the rail is hidden
 * from assistive tech. The DS Marquee pauses on hover; under reduced motion
 * it would wrap every photo into a tall grid, so the rail stays one static,
 * centered row instead.
 */
export function ScrollSection() {
  return (
    <div aria-hidden>
      <Marquee
        label="TUM.ai community photos"
        duration={70}
        className="motion-reduce:[&_ul]:flex-nowrap"
      >
        {pictures.map((picture) => (
          <div
            key={picture.src}
            className={`group/photo relative overflow-hidden rounded-3xl bg-sunken ${PHOTO_RAIL_ITEM}`}
          >
            <Image
              src={picture.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 30rem, (min-width: 640px) 24rem, 17rem"
              className="object-cover transition-transform duration-[1.4s] ease-brand group-hover/photo:scale-[1.045] motion-reduce:transition-none"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
}

export default ScrollSection;
