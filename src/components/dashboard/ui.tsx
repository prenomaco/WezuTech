import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * The dashboard's primitives.
 *
 * Shadcn's shapes and API, written out rather than generated: the marketing
 * site already owns the global tokens and a shadcn install would put its own
 * theme on `:root` and repaint the pages this project spent its time matching
 * to a design. These read from `--dash-*` instead, which only the admin shell
 * defines, so the two themes cannot collide.
 */

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-fg)] shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[var(--dash-muted)]", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

const BUTTON_VARIANT = {
  default: "bg-[var(--dash-primary)] text-white hover:bg-[var(--dash-primary-hover)]",
  outline:
    "border border-[var(--dash-border)] bg-transparent hover:bg-[var(--dash-subtle)]",
  ghost: "hover:bg-[var(--dash-subtle)]",
  destructive: "bg-red-600 text-white hover:bg-red-700",
} as const;

const BUTTON_SIZE = {
  default: "h-9 px-4",
  sm: "h-8 px-3 text-xs",
  icon: "h-9 w-9",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: keyof typeof BUTTON_VARIANT;
  readonly size?: keyof typeof BUTTON_SIZE;
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-[var(--dash-primary)] focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANT[variant],
        BUTTON_SIZE[size],
        className,
      )}
      {...props}
    />
  );
}

const FIELD =
  "w-full rounded-md border border-[var(--dash-border)] bg-[var(--dash-card)] px-3 py-2 text-sm " +
  "placeholder:text-[var(--dash-muted)] focus-visible:ring-2 focus-visible:ring-[var(--dash-primary)] focus-visible:outline-none";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, "h-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, "min-h-[4.5rem]", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD, "h-9", className)} {...props} />;
}

export function Label({ className, ...props }: HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-medium text-[var(--dash-muted)]", className)} {...props} />;
}

const BADGE_TONE = {
  neutral: "border-[var(--dash-border)] text-[var(--dash-muted)]",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  danger: "border-red-500/30 bg-red-500/10 text-red-600",
} as const;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  readonly tone?: keyof typeof BADGE_TONE;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        BADGE_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-[var(--dash-border)] px-4 py-2 text-left text-xs font-medium text-[var(--dash-muted)]",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("border-b border-[var(--dash-border)] px-4 py-3 align-top", className)} {...props} />
  );
}
