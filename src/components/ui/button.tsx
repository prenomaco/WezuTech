import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";

/**
 * Figma (node 252:461 / 252:474 / 252:476): 20px horizontal and 10px vertical
 * padding, 14px radius, 18px label. With a 24px line box that resolves to the
 * 44px control height the design uses everywhere.
 */
const BASE =
  "press inline-flex items-center justify-center rounded-control px-5 py-[0.625rem] text-[1.125rem] leading-[1.5rem]";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-sky text-[#111613] shadow-[0_0_0_rgb(9_133_204/0)] transition-[background-color,transform,box-shadow] duration-300 ease-out hover:bg-sky-bright hover:-translate-y-px hover:shadow-[0_8px_20px_-6px_rgb(35_164_236/0.55)] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  /* Outlined rather than bare text, so the control reads as a button at
     rest instead of only on hover. The fill-on-hover is the same "press
     forward" gesture the primary button makes with its own colour, just in
     white-on-transparent instead of blue-on-dark. */
  ghost:
    "border border-white/60 text-white shadow-[0_0_0_rgb(255_255_255/0)] transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out hover:-translate-y-px hover:border-white hover:bg-white hover:text-[#111613] hover:shadow-[0_8px_20px_-6px_rgb(255_255_255/0.25)] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
};

interface CommonProps {
  readonly variant?: Variant;
  readonly className?: string;
  readonly children: ReactNode;
}

type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type ActionProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

function classes(variant: Variant, className?: string) {
  return [BASE, VARIANT[variant], className].filter(Boolean).join(" ");
}

export function ButtonLink({ variant = "primary", className, children, ...props }: LinkProps) {
  return (
    <a className={classes(variant, className)} {...props}>
      {children}
    </a>
  );
}

export function Button({ variant = "primary", className, children, type, ...props }: ActionProps) {
  return (
    <button className={classes(variant, className)} type={type ?? "button"} {...props}>
      {children}
    </button>
  );
}
