import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { ProductHeroField } from "@/components/atmosphere/product-hero-field";
import { RefractionFrame } from "@/components/atmosphere/refraction-frame";
import { StreakLayer } from "@/components/atmosphere/streak-layer";
import { PRODUCT_HERO_RINGS, PRODUCT_HERO_ROTATE } from "@/lib/design/product-hero-vectors";

const FIGMA = "/figma/";

/** The shared placement box every ring's `left`/`top` is written against. */
const HERO_FIELD_WIDTH = 2420.832;
const HERO_FIELD_HEIGHT = 2086.304;

/** Figma node 510:46. */
export function ProductAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-ink"
    >
      {/* One continuous intro atmosphere for the hero and connected-charging
          section: it reaches through to Key Features (y=1229 in the 1512
          frame) instead of being clipped at the hero's own height, and fades
          out gradually rather than stopping on a hard edge.

          This box is the screen's, not the column's, and the column is nested
          back inside it to place the field. The field is 2420 design pixels
          wide against a 1512 column — drawn to carry well past it on both
          sides — but the fade is a `mask-image`, and a mask clips to its own
          border box whatever `overflow` says. Sizing that box to the column
          therefore cut the light off at the column edge on any screen wider
          than 1512 and left a flat ink gutter with a lit edge against it. */}
      <div className="product-hero-gradient absolute inset-x-0 top-0 h-[88rem] overflow-hidden lg:h-[76.8125rem]">
        <div className="relative mx-auto h-full w-full max-w-[94.5rem]">
          <div className="absolute left-[-22.8125rem] top-[-51.6875rem] h-[130.394rem] w-[151.302rem] max-lg:left-1/2 max-lg:-translate-x-1/2">
            <ProductHeroField height={HERO_FIELD_HEIGHT} width={HERO_FIELD_WIDTH}>
              <div className="absolute inset-0 overflow-hidden mix-blend-hard-light">
                {PRODUCT_HERO_RINGS.map((ring, index) => {
                  const filterId = `product-hero-ring-${index}`;
                  return (
                    <div
                      className="absolute flex items-center justify-center mix-blend-color-dodge"
                      key={ring.d.slice(0, 24)}
                      style={{
                        left: `${ring.left / 16}rem`,
                        top: `${ring.top / 16}rem`,
                        width: `${ring.outerWidth / 16}rem`,
                        height: `${ring.outerHeight / 16}rem`,
                      }}
                    >
                      <div
                        className="relative"
                        style={{
                          width: `${ring.innerWidth / 16}rem`,
                          height: `${ring.innerHeight / 16}rem`,
                          transform: `rotate(${PRODUCT_HERO_ROTATE}deg)`,
                        }}
                      >
                        {/* A live SVG filter, not a flat image — matches how
                            every other fallback in the atmosphere system
                            (`GlowFallback`) reproduces its blur. */}
                        <svg
                          aria-hidden="true"
                          className="absolute inset-[-5%_-7.5%] h-[110%] w-[115%] max-w-none"
                          preserveAspectRatio="none"
                          viewBox={`0 0 ${ring.nativeWidth} ${ring.nativeHeight}`}
                        >
                          <defs>
                            <filter colorInterpolationFilters="sRGB" id={filterId}>
                              <feGaussianBlur stdDeviation={ring.blur} />
                            </filter>
                          </defs>
                          <path
                            d={ring.d}
                            fill="none"
                            filter={`url(#${filterId})`}
                            stroke={ring.stroke}
                            strokeWidth={ring.strokeWidth}
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ProductHeroField>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-0 h-full w-full max-w-[94.5rem] -translate-x-1/2">
        {/* Connected-charging keeps only the outer edges of the glow lit, so
            it stops washing across the product image, glass panel and copy —
            the hero itself (above y=687) is untouched. */}
        <div className="product-charging-scrim absolute inset-x-0 top-[42.9375rem] hidden h-[35.5625rem] lg:block" />

        {/* Product-specific lower-page ribbons from the Figma frame, placed by
            their rotated bounding box (like every other streak in the design
            system) instead of as raw rotated images — the raw version's
            bright core landed well outside its intended box, bleeding a
            diagonal streak into the contact section below. */}
        <StreakLayer
          box={{ left: -517, top: 2474.7, width: 696.381, height: 1719.612 }}
          depth={0}
          inner={{ width: 1670.825, height: 478.33 }}
          rotate={-97.65}
          vector="streakLower"
        />
        <StreakLayer
          box={{ right: -320.088, top: 2159, width: 698.618, height: 1476.808 }}
          depth={0}
          flipY
          inner={{ width: 1418.65, height: 478.33 }}
          rotate={80.82}
          vector="streakRight"
        />
      </div>

      {/* Stretch the original tile once across the screen, like Home. */}
      <div className="absolute inset-0 hidden lg:block">
        <RefractionFrame
          relativeTo={1512}
          box={{ left: -22, top: 1179, width: 1565, height: 648 }}
          id="product-specifications"
          mirrorY
        >
          <GlowLayer
            box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
            vector="fieldDim"
          />
        </RefractionFrame>
      </div>

      {/* Group 13 is clipped to the footer so its broad source SVG cannot wash
          over the form — and, like the hero field, its band is the screen's
          width rather than the column's, since the mask would otherwise trim
          it back to 1512. The source is centred either way, so the placement
          is the same one the frame draws. */}
      <div className="product-footer-glow absolute inset-x-0 bottom-0 h-[28rem] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="absolute bottom-[-48rem] left-1/2 h-[79.5775rem] w-[max(129.5rem,100vw)] max-w-none -translate-x-1/2 object-fill mix-blend-screen"
          src={`${FIGMA}a100626a0b36a4da8ee4cc285d6f36370f0c5270.svg`}
        />
      </div>
    </div>
  );
}
