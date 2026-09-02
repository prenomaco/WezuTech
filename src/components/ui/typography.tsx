import type { HTMLAttributes, ReactNode } from "react";

/**
 * The Figma type scale, measured off the design rather than approximated.
 *
 * Line boxes are given in pixels on purpose: the file specifies CSS
 * `line-height: normal`, which Tailwind's `leading-normal` does NOT produce
 * (that utility is 1.5). Pinning the exact box keeps the rendered text metrics
 * identical to the frame.
 */

const DISPLAY = "font-display text-frost";

type Element = "h1" | "h2" | "h3" | "p";

interface TypeProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
  readonly className?: string;
  /** Rendered element. Sections use h2; the hero owns the page's h1. */
  readonly as?: Element;
}

function join(...values: (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

/** Section label — Figma node 252:480: Centauri 23px / 26px, #f0f7fd. */
export function SectionHeading({ children, className, as: Tag = "h2", ...rest }: TypeProps) {
  return (
    <Tag className={join(DISPLAY, "text-[23px] leading-[26px]", className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Headline type — Figma node 252:470 (hero, 36px / 41px) and 252:528 (contact,
 * 34px / 39px). Centauri is an all-caps face, so the casing comes from the font
 * rather than a transform.
 *
 * The size is a prop rather than a `className` override: both would emit a
 * `text-[…]` utility of equal specificity, and which one wins would come down
 * to Tailwind's output order instead of the caller's intent.
 */
const DISPLAY_SIZE = {
  hero: "text-[36px] leading-[41px]",
  section: "text-[34px] leading-[39px]",
} as const;

interface DisplayProps extends TypeProps {
  readonly size?: keyof typeof DISPLAY_SIZE;
}

export function DisplayTitle({
  children,
  className,
  as: Tag = "h2",
  size = "hero",
  ...rest
}: DisplayProps) {
  return (
    <Tag className={join(DISPLAY, DISPLAY_SIZE[size], "text-ice", className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Product name — Figma node 252:484: Centauri over a 27px line box. */
export function ProductTitle({ children, className, ...rest }: TypeProps) {
  return (
    <h3 className={join(DISPLAY, "text-[24px] leading-[27px]", className)} {...rest}>
      {children}
    </h3>
  );
}

/** Body copy — Figma node 252:479: Overused Grotesk 18px / 24px, #f0f7fd. */
export function Prose({ children, className, ...rest }: TypeProps) {
  return (
    <p className={join("text-[18px] leading-[24px] text-frost", className)} {...rest}>
      {children}
    </p>
  );
}
