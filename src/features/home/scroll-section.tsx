import Image from "next/image";
import { Marquee } from "@/components/ds";
import { cn } from "@/lib/cn";
import { pictures } from "./data/homepage";
import { PHOTO_RAIL_ITEM } from "./deferred-layout";

/**
 * Full-bleed rail of community photos. Loaded after hydration through
 * DeferredHomeSections (next/dynamic, ssr: false) so none of these images
 * reach the prerendered HTML. The photos are ambience, so the rail is hidden
 * from assistive tech. The DS Marquee pauses on hover and, under reduced
 * motion, holds still as a row that scrolls by hand.
 */
export function ScrollSection() {
  return (
    <div aria-hidden>
      <Marquee label="TUM.ai community photos" duration={70}>
        {pictures.map((picture) => (
          <div
            key={picture.src}
            className={cn(
              "group/zoom relative overflow-hidden rounded-3xl bg-sunken",
              PHOTO_RAIL_ITEM,
            )}
          >
            <Image
              src={picture.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 30rem, (min-width: 640px) 24rem, 17rem"
              className="zoom-media object-cover"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
