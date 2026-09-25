import Link from "next/link";
import { Aurora } from "@/components/ds/aurora";
import { BrandMark } from "@/components/ds/brand-mark";
import { ButtonLink } from "@/components/ds/button";
import { Container } from "@/components/ds/container";
import { TopBlend } from "@/components/ds/top-blend";

type FooterLink = { label: string; href: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Events", href: "/events" },
      { label: "Research", href: "/research" },
      { label: "Projects", href: "/projects" },
      { label: "Entrepreneurship", href: "/e-lab" },
      { label: "Community", href: "/community" },
      { label: "Partners", href: "/partners" },
      { label: "Q&A", href: "/qanda" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "LinkedIn", href: "https://de.linkedin.com/company/tum-ai" },
      {
        label: "Instagram",
        href: "https://www.instagram.com/tum.ai_official/",
      },
      {
        label: "Slack",
        href: "https://join.slack.com/t/tumaipublic/shared_invite/zt-10kg0t1f9-JLRXDxY_d_vprKWgab0cVw",
      },
      { label: "Email", href: "mailto:contact@tum-ai.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Imprint", href: "/imprint" },
      { label: "Data Privacy", href: "/data-privacy" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
  {
    title: "Contribute",
    links: [{ label: "GitHub", href: "https://github.com/tum-ai/" }],
  },
];

const linkClass =
  "text-small text-fg-muted transition-colors duration-300 hover:text-fg";

function FooterAnchor({ label, href }: FooterLink) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={linkClass}>
        {label}
      </Link>
    );
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={linkClass}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {label}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

export default function Footer() {
  return (
    <footer data-tone="night" className="relative isolate overflow-clip">
      <div aria-hidden className="grain -z-10" />
      <Aurora
        intensity="subtle"
        className="[mask-image:linear-gradient(to_bottom,transparent,black_35%,black_60%,transparent)]"
      />
      <BrandMark className="absolute -right-[6%] -bottom-[22%] -z-10 w-[min(46rem,90%)] text-white/[0.03]" />
      {/* The bottom edge settles into the root canvas that Safari shows under its toolbar. */}
      <TopBlend edge="bottom" />
      <Container className="pt-24 md:pt-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <img
              src="/assets/tum_ai_logo_new.svg"
              alt="TUM.ai"
              width={1640}
              height={406}
              loading="lazy"
              className="h-8 w-auto"
            />
            <p className="mt-10 max-w-lg text-display-md text-fg">
              Empowering students to build the future of AI.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/apply" arrow>
                Become a Member
              </ButtonLink>
              <ButtonLink href="/partners" variant="outline">
                Partner with us
              </ButtonLink>
            </div>
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
                        <FooterAnchor {...link} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </div>
        <div className="mt-24 flex flex-col gap-3 border-t border-hairline py-8 text-meta text-fg-subtle md:flex-row md:items-center md:justify-between">
          <p>TUM.ai - Student Initiative at Technical University of Munich</p>
          <p>Munich, Germany</p>
        </div>
      </Container>
    </footer>
  );
}
