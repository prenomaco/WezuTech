import { createElement } from "react";
import type { IconWeight } from "@phosphor-icons/react/lib";
import { resolveIcon } from "@/lib/icon-library";

/**
 * A glyph from the icon library, resolved from its stored key.
 *
 * Used by the category cards, the dashboard's category list and the product
 * page's feature row, so it lives outside any one of them.
 *
 * `createElement` rather than `const Icon = resolveIcon(key)` followed by
 * `<Icon />`: the lookup returns an existing component from a fixed table, but
 * assigning it to a capitalised local reads to `react-hooks/static-components`
 * as declaring a component inside render, which is a real hazard in general
 * since such a component remounts and loses state on every render. It is not
 * what is happening here, and going through `createElement` says so.
 *
 * `weight` rather than a stroke width: Phosphor's glyphs are filled paths cut
 * to a weight, not strokes, so there is nothing to thin. `regular` is the
 * design's line weight; `duotone` and `fill` exist for a mark that has to
 * hold its own at a small size.
 */
export function Glyph({
  icon,
  className,
  weight = "regular",
}: {
  readonly icon: string;
  readonly className?: string;
  readonly weight?: IconWeight;
}) {
  /* `size` is left at Phosphor's `1em` default and driven by `className`
     instead: the component writes width and height as SVG attributes, which a
     Tailwind `size-*` class overrides, so passing both would only have the
     larger of the two win silently. */
  return createElement(resolveIcon(icon), { "aria-hidden": true, className, weight });
}
