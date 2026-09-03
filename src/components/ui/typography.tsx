import type { HTMLAttributes, ReactNode } from "react";

/**
 * The Figma type scale, read out of the file node by node.
 *
 * Two things are deliberate here. Sizes are the design's own fractional values
 * rather than rounded ones — at 24px instead of 23.866px the product title
 * wraps a word early. And line boxes are pinned explicitly, because the file
 * specifies CSS `line-height: normal`, which Tailwind's `leading-normal` does
 * NOT produce (that utility is 1.5).
 *
 * The eyebrows are not one style: "ABOUT US" is #f0f7fd while "OUR PRODUCTS"
 * and "WHAT PEOPLE SAY" are #dafaf5, and the last is a size of its own. They
 * are variants rather than `className` overrides, since an override would emit
 * a competing utility of equal specificity and let Tailwind's output order,
 * not the caller, decide the winner.
 */

const DISPLAY = "font-display";

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

/**
 * Section eyebrows — Figma nodes 252:480, 252:481, 252:511 on the 1512 frame,
 * 305:73 and 305:119 on the 402 one. The small frame sets all of them at 18px
 * on a 21px line; the sizes below the `lg:` prefix are its, the rest desktop's.
 */
const HEADING_SM = "text-[1.125rem] leading-[1.3125rem]";
const HEADING_VARIANT = {
  /** ABOUT US — 23px / 26px, #f0f7fd. */
  about: `${HEADING_SM} text-frost lg:text-[1.4375rem] lg:leading-[1.625rem]`,
  /** OUR PRODUCTS — 23px / 26px, #dafaf5. */
  products: `${HEADING_SM} text-ice lg:text-[1.4375rem] lg:leading-[1.625rem]`,
  /** WHAT PEOPLE SAY — 24.934px / 28.19px, #dafaf5. */
  testimonials: `${HEADING_SM} text-ice lg:text-[1.558375rem] lg:leading-[1.761875rem]`,
} as const;

interface HeadingProps extends TypeProps {
  readonly variant?: keyof typeof HEADING_VARIANT;
}

export function SectionHeading({
  children,
  className,
  as: Tag = "h2",
  variant = "products",
  ...rest
}: HeadingProps) {
  return (
    <Tag className={join(DISPLAY, HEADING_VARIANT[variant], className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Headline type — Figma node 252:470 (hero, 36px / 41px) and 252:528 (contact,
 * 33.741px / 39px). Centauri is an all-caps face, so the casing comes from the
 * font rather than a transform.
 */
const DISPLAY_SIZE = {
  hero: "text-[2.25rem] leading-[2.5625rem]",
  section: "text-[2.10880625rem] leading-[2.4375rem]",
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

/** Product name — Figma node 252:484: Centauri 23.866px / 26.98px, #dafaf5. */
export function ProductTitle({ children, className, ...rest }: TypeProps) {
  return (
    <h3 className={join(DISPLAY, "text-[1.491625rem] leading-[1.68625rem] text-ice", className)} {...rest}>
      {children}
    </h3>
  );
}

/**
 * Body copy. The About column is 18px / #f0f7fd (node 252:479); the product
 * card is 18.677px / #dafaf5 (node 252:482).
 */
const PROSE_SIZE = {
  /* Mobile-first: the 402 frame sets both columns at 16px on a normal line
     box (nodes 305:72 and 305:123); the `lg:` half is the 1512 frame's. */
  about: "text-[1rem] leading-normal text-frost lg:text-[1.125rem] lg:leading-[1.5rem]",
  /* Node 252:482 is 249.032 tall for nine lines and the blank line
     between its two paragraphs — a 24.9032px line, not the flat 24 the rest
     of the page uses. */
  product: "text-[1rem] leading-normal text-ice lg:text-[1.16731rem] lg:leading-[1.5565rem]",
} as const;

interface ProseProps extends TypeProps {
  readonly size?: keyof typeof PROSE_SIZE;
}

export function Prose({ children, className, size = "about", ...rest }: ProseProps) {
  return (
    <p className={join(PROSE_SIZE[size], className)} {...rest}>
      {children}
    </p>
  );
}
