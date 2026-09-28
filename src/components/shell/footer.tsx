import Image from "next/image";
import {
  Actions,
  Aurora,
  BrandMark,
  ButtonLink,
  Container,
  TopBlend,
} from "@/components/ds";
import {
  connectLinks,
  contributeLinks,
  legalLinks,
  mainNavigation,
  type NavLink,
} from "@/config/navigation";
import { NavAnchor } from "./nav-anchor";

const columns: { title: string; links: readonly NavLink[] }[] = [
  { title: "Explore", links: mainNavigation },
  { title: "Connect", links: connectLinks },
  { title: "Legal", links: legalLinks },
  { title: "Contribute", links: contributeLinks },
];

/** Site footer on every page: logo, tagline, both CTAs and the link columns. */
export function Footer() {
  return (
    <footer data-tone="night" className="relative isolate overflow-clip">
      <div aria-hidden className="grain -z-10" />
      <Aurora
        intensity="subtle"
        className="[mask-image:linear-gradient(to_bottom,transparent,black_35%,black_60%,transparent)]"
      />
      <BrandMark
        className="absolute -right-[6%] -bottom-[22%] -z-10 w-[min(46rem,90%)]"
        intensity="faint"
      />
      {/* The bottom edge settles into the root canvas that Safari shows under its toolbar. */}
      <TopBlend edge="bottom" />
      <Container className="pt-24 md:pt-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <Image
              src="/assets/tum_ai_logo_new.svg"
              alt="TUM.ai"
              width={1640}
              height={406}
              className="h-8 w-auto"
            />
            <p className="mt-10 max-w-lg text-display-md text-fg">
              Empowering students to build the future of AI.
            </p>
            <Actions className="mt-10">
              <ButtonLink href="/apply" arrow>
                Become a Member
              </ButtonLink>
              <ButtonLink href="/partners" variant="outline">
                Partner with us
              </ButtonLink>
            </Actions>
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4"
          >
            {columns.map((column) => {
              const titleId = `footer-${column.title.toLowerCase()}`;
              return (
                <div key={column.title}>
                  <p
                    id={titleId}
                    className="text-eyebrow text-fg-subtle uppercase"
                  >
                    {column.title}
                  </p>
                  <ul aria-labelledby={titleId} className="mt-5 space-y-3">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <NavAnchor
                          {...link}
                          className="-my-1.5 inline-block py-1.5 text-fg-muted text-small transition-colors duration-300 hover:text-fg"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>
        <div className="mt-24 flex flex-col gap-3 border-hairline border-t py-8 text-fg-subtle text-meta md:flex-row md:items-center md:justify-between">
          <p>TUM.ai - Student Initiative at Technical University of Munich</p>
          <p>Munich, Germany</p>
        </div>
      </Container>
    </footer>
  );
}
