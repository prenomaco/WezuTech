import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, letting a caller's utility win over a component's default
 * rather than depending on the order Tailwind happens to emit them in.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
