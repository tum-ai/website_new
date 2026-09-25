import type { LucideIcon } from "lucide-react";
import { FeatureCard, Reveal } from "@/components/ds";
import { cn } from "@/lib/utils";

interface Benefit {
  icon: LucideIcon;
  text: string;
  title: string;
}

const gridColumns = {
  2: "md:grid-cols-2",
  4: "md:grid-cols-2 xl:grid-cols-4",
} as const;

interface Props {
  benefits: Benefit[];
  columns?: keyof typeof gridColumns;
  /** `glass` on dark bands, `raised` on light ones. */
  variant?: "raised" | "glass";
  className?: string;
}

/**
 * Icon-led spotlight cards (DS `FeatureCard`) with an editorial counter,
 * revealed in sequence. Icons always use the brand violet.
 */
export const Benefits = ({
  benefits,
  columns = 2,
  variant = "raised",
  className,
}: Props) => {
  return (
    <ul className={cn("grid gap-4 md:gap-5", gridColumns[columns], className)}>
      {benefits.map((benefit, index) => (
        <Reveal as="li" key={benefit.title} delay={index * 90}>
          <FeatureCard
            icon={benefit.icon}
            title={benefit.title}
            index={String(index + 1).padStart(2, "0")}
            variant={variant}
          >
            {/* Wide two-column cards carry long copy: read it at body size. */}
            <p className={cn(columns === 2 && "md:text-body")}>
              {benefit.text}
            </p>
          </FeatureCard>
        </Reveal>
      ))}
    </ul>
  );
};
