/**
 * Declarative description of the site's light field.
 *
 * The Figma design paints its atmosphere with exported vector blobs. Those are
 * replaced here by data: each entry becomes a single element whose gradient is
 * driven entirely by CSS custom properties (see `.glow-*` in globals.css), so
 * nothing about the background ships as an image.
 *
 * Alphas are not guesses. A 12x33 luminance grid was sampled off the Figma
 * render and off the built page, and each zone was tuned until the two agreed —
 * see `.ai-workflow/contracts/2026-09-02-figma-parity-rebuild.md`. The edge
 * luminance the design asks for, by band:
 *
 *   hero      y  240-600  ~150     industries  y 2400  ~52
 *   hero tail y  600-840   ~90     testimonials        ~20
 *   about     y  840-1200  ~45     contact             ~22
 *   products  y 1440-1900  ~15     footer      y 3860  ~172
 */

export type GlowVariant = "wash" | "edge" | "comet" | "bloom" | "striations";

/** Raw RGB channels so each layer can pick its own alpha without new colours. */
export const glowPalette = {
  /** Relative luminance 241 — the glare under the footer, the page's brightest. */
  glare: "232 243 251",
  /** Relative luminance 215. */
  pale: "196 219 236",
  /** Relative luminance 172 — the hero and footer edge light. */
  core: "148 176 201",
  /** Relative luminance 112 — mid-page accents. */
  mid: "13 132 204",
  /** Relative luminance 66 — ambient fill. */
  deep: "24 76 119",
} as const;

export type GlowTone = keyof typeof glowPalette;

export interface GlowSpec {
  readonly id: string;
  readonly variant: GlowVariant;
  /** Offsets are relative to the zone the field is mounted in. */
  readonly top: string;
  readonly height: string;
  readonly width: string;
  readonly side?: "left" | "right";
  /** Focus of the gradient inside its own box. */
  readonly anchorX?: string;
  readonly anchorY?: string;
  readonly tone: GlowTone;
  readonly alpha: number;
  readonly blur?: string;
  readonly rotate?: string;
  readonly opacity?: number;
  /** Vertical reach of a wash's mask, as a percentage of its own height. */
  readonly band?: string;
  /** Bloom radii, as percentages of the layer's own box. */
  readonly radiusX?: string;
  readonly radiusY?: string;
  /**
   * Parallax travel in pixels across the zone's scroll range. Positive values
   * drift down (slower than the page), negative drift up (faster). 0 pins the
   * layer to the section.
   */
  readonly depth: number;
}

export type AtmosphereZone =
  | "hero"
  | "about"
  | "products"
  | "industries"
  | "testimonials"
  | "contact"
  | "footer";

/**
 * Full-width band lit from both edges. Layers paint in array order, so an
 * ambient fill must be listed before the bright wash — otherwise it composites
 * over the top and drags the edge luminance down.
 */
function wash(
  id: string,
  config: Omit<GlowSpec, "id" | "variant" | "width" | "side" | "anchorX">,
): GlowSpec {
  return { ...config, id, variant: "wash", width: "100%" };
}

/**
 * The hero's vertical profile is asymmetric — it climbs steeply from the header
 * to a peak at 45% of the frame, then trails off slowly and is still lit where
 * the About section begins. One ellipse cannot describe that, so the peak and
 * the tail are separate layers.
 */
/**
 * The hero's light is the Figma vector field (see `GlowField`), so this zone
 * only carries the vertical light rays that sit over it.
 */
const heroField: GlowSpec[] = [
  {
    id: "hero-striations",
    variant: "striations",
    top: "0%",
    height: "100%",
    width: "100%",
    tone: "core",
    alpha: 1,
    opacity: 0.9,
    depth: 24,
  },
];

const aboutField: GlowSpec[] = [
  wash("about-light", {
    top: "-14%",
    height: "104%",
    anchorY: "24%",
    band: "70%",
    tone: "mid",
    alpha: 0.26,
    depth: 90,
  }),
  {
    id: "about-comet",
    variant: "comet",
    side: "left",
    top: "4%",
    height: "82%",
    width: "13%",
    tone: "core",
    alpha: 0.3,
    blur: "34px",
    rotate: "9deg",
    depth: 132,
  },
];

const productsField: GlowSpec[] = [
  wash("products-light", {
    top: "0%",
    height: "100%",
    anchorY: "40%",
    band: "72%",
    tone: "deep",
    alpha: 0.22,
    depth: 74,
  }),
  {
    id: "products-comet",
    variant: "comet",
    side: "right",
    top: "-6%",
    height: "78%",
    width: "12%",
    tone: "mid",
    alpha: 0.22,
    blur: "40px",
    rotate: "-11deg",
    depth: 118,
  },
];

/** The light builds through the industry grid and peaks at its lower edge. */
const industriesField: GlowSpec[] = [
  wash("industries-light", {
    top: "0%",
    height: "100%",
    anchorY: "98%",
    band: "56%",
    tone: "mid",
    alpha: 0.32,
    depth: 86,
  }),
];

const testimonialsField: GlowSpec[] = [
  wash("testimonials-light", {
    top: "-10%",
    height: "110%",
    anchorY: "8%",
    band: "58%",
    tone: "mid",
    alpha: 0.24,
    depth: 46,
  }),
  {
    id: "testimonials-comet",
    variant: "comet",
    side: "left",
    top: "-14%",
    height: "86%",
    width: "11%",
    tone: "core",
    alpha: 0.2,
    blur: "36px",
    depth: 126,
  },
];

const contactField: GlowSpec[] = [
  wash("contact-light", {
    top: "0%",
    height: "100%",
    anchorY: "74%",
    band: "86%",
    tone: "deep",
    alpha: 0.35,
    depth: 68,
  }),
];

/** The page closes on the brightest light in the design, under the panel. */
const footerField: GlowSpec[] = [
  wash("footer-ambient", {
    top: "0%",
    height: "100%",
    anchorY: "106%",
    band: "58%",
    tone: "mid",
    alpha: 0.09,
    depth: 18,
  }),
  {
    id: "footer-bloom-left",
    variant: "bloom",
    side: "left",
    top: "0%",
    height: "100%",
    width: "100%",
    anchorX: "0%",
    anchorY: "100%",
    radiusX: "42%",
    radiusY: "82%",
    tone: "glare",
    alpha: 0.9,
    blur: "0px",
    depth: 22,
  },
  {
    id: "footer-bloom-right",
    variant: "bloom",
    side: "right",
    top: "0%",
    height: "100%",
    width: "100%",
    anchorX: "100%",
    anchorY: "100%",
    radiusX: "42%",
    radiusY: "82%",
    tone: "glare",
    alpha: 0.9,
    blur: "0px",
    depth: 22,
  },
];

export const atmosphereField: Record<AtmosphereZone, readonly GlowSpec[]> = {
  hero: heroField,
  about: aboutField,
  products: productsField,
  industries: industriesField,
  testimonials: testimonialsField,
  contact: contactField,
  footer: footerField,
};
