import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";

/**
 * Figma (node 252:461 / 252:474 / 252:476): 20px horizontal and 10px vertical
 * padding, 14px radius, 18px label. With a 24px line box that resolves to the
 * 44px control height the design uses everywhere.
 */
const BASE = "inline-flex items-center justify-center rounded-control px-5 py-[0.625rem] text-[1.125rem] leading-[1.5rem]";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-sky text-[#111613] transition-[background-color,transform] duration-200 ease-out hover:bg-sky-bright hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60",
  ghost: "text-mist transition-colors duration-200 ease-out hover:text-ice",
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
