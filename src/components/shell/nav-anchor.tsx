import type { ComponentProps } from "react";
import { Anchor } from "@/components/ds";
import type { NavLink } from "@/config/navigation";

/** Props for {@link NavAnchor}: a navigation entry plus anchor attributes. */
export type NavAnchorProps = NavLink &
  Omit<ComponentProps<"a">, "href" | "children">;

/**
 * An unstyled link for a navigation entry from `@/config/navigation`, through
 * the ds <Anchor>: site paths go through next/link, other sites open in a new
 * tab and say so to screen readers, and `mailto:` links stay plain anchors.
 */
export function NavAnchor({ label, href, ...props }: NavAnchorProps) {
  return (
    <Anchor href={href} {...props}>
      {label}
    </Anchor>
  );
}
