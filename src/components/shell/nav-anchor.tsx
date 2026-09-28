import Link from "next/link";
import type { ComponentProps } from "react";
import type { NavLink } from "@/config/navigation";

/** Props for {@link NavAnchor}: a navigation entry plus anchor attributes. */
export type NavAnchorProps = NavLink &
  Omit<ComponentProps<"a">, "href" | "children">;

/**
 * An unstyled link for a navigation entry from `@/config/navigation`: site
 * paths go through next/link, other sites open in a new tab and say so to
 * screen readers, and `mailto:` links stay plain anchors.
 */
export function NavAnchor({ label, href, ...props }: NavAnchorProps) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {label}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      {...props}
    >
      {label}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}
