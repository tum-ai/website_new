import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

const widths = {
  /** Site grid: 80rem max, same gutters as the partner page. */
  default: "w-[min(80rem,calc(100%-2*var(--gutter)))]",
  wide: "w-[min(90rem,calc(100%-2*var(--gutter)))]",
  narrow: "w-[min(60rem,calc(100%-2*var(--gutter)))]",
  /** Long-form reading measure. */
  prose: "w-[min(46rem,calc(100%-2*var(--gutter)))]",
} as const;

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: keyof typeof widths;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Horizontally centered content column with responsive gutters. */
export function Container<T extends ElementType = "div">({
  as,
  size = "default",
  className,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div";
  return (
    <Component className={cn("mx-auto", widths[size], className)} {...props} />
  );
}
