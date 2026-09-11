/**
 * The dashboard's background light.
 *
 * This is now what `dashboard.css` always claimed it was: painted gradients.
 * The previous version reused the marketing pages' real apparatus — a
 * `RefractionFrame` running `feDisplacementMap` over `feGaussianBlur` across a
 * 1565 x 1400 band, plus two more blurred vector glows down the edges — which
 * is the right call on a landing page that is measured against a design file,
 * and the wrong one behind a tool. That filter chain has to be re-rasterised
 * whenever the element is re-created, which on an App Router navigation is
 * every single time: the content column unmounts and remounts, so every click
 * in the rail paid for the whole chain again before the new page could paint.
 *
 * Three radial gradients and one linear reproduce what the eye actually takes
 * from it — light gathered down both edges and in the upper middle, falling
 * away to ink across the rest — at no compositor cost, because a gradient is
 * painted once into the layer and then scrolled like any other background.
 * The refraction ridges are the one thing lost; they were never legible under
 * the 0.32 opacity this was drawn at.
 *
 * `aria-hidden` and `pointer-events-none`, as before: it is scenery.
 */
const LAYERS = [
  /* The upper-middle bloom — `fieldDim` in the design, which is where the
     light gathers on every marketing page. */
  "radial-gradient(120% 70% at 50% 0%, rgb(9 133 204 / 0.20) 0%, rgb(9 133 204 / 0.07) 42%, transparent 72%)",
  /* The two edge streaks, riding high the way the page's own do. */
  "radial-gradient(38% 58% at 0% 28%, rgb(35 164 236 / 0.26) 0%, rgb(35 164 236 / 0.08) 45%, transparent 75%)",
  "radial-gradient(32% 52% at 100% 22%, rgb(35 164 236 / 0.20) 0%, rgb(35 164 236 / 0.06) 45%, transparent 75%)",
  /* And the fall-off to ink down the rest of the column. */
  "linear-gradient(to bottom, rgb(2 7 28 / 0) 0%, rgb(2 7 28 / 0.55) 60%, rgb(2 7 28 / 0.85) 100%)",
].join(", ");

export function DashboardAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: LAYERS }}
    />
  );
}
