import { createElement } from "react";
import { categoryIcon } from "@/lib/category-icons";

/**
 * A category's fallback glyph, resolved from its stored icon key.
 *
 * `createElement` rather than `const Icon = categoryIcon(key)` followed by
 * `<Icon />`: the lookup returns an existing component from a fixed table, but
 * assigning it to a capitalised local reads to `react-hooks/static-components`
 * as declaring a component inside render — a real hazard in general, since such
 * a component remounts and loses state on every render, just not what is
 * happening here. Going through `createElement` states the intent plainly and
 * keeps one copy of this lookup instead of one per call site.
 */
export function CategoryIcon({
  icon,
  className,
  strokeWidth = 1.6,
}: {
  readonly icon: string;
  readonly className?: string;
  readonly strokeWidth?: number;
}) {
  return createElement(categoryIcon(icon), { "aria-hidden": true, className, strokeWidth });
}
