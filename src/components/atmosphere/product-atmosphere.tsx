import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { RefractionFrame } from "@/components/atmosphere/refraction-frame";
import { StreakLayer } from "@/components/atmosphere/streak-layer";

const FIGMA = "/figma/";
const MOBILE_FRAME_WIDTH = 402;

const ellipses = [
  ["d3f8ceb521dad64dc4e7e243e20e03c8cf08aa08.svg", 9.8, 101.26, 2221, 1980.484, 1269.61, 1841.864],
  ["42106047e76b1b43f8e576a1581be609bfd0540e.svg", -15, 113.02, 2221, 1980.484, 1269.609, 1841.864],
  ["e3c1eda15d11b97e731d51b3ad82012813b147e0.svg", -14.5, 114.01, 2221, 1980.484, 1269.609, 1841.864],
  ["64337caf741bb1e31fca4f2a9b2322780956d67e.svg", 176.1, 13.9, 2221, 1980.484, 1269.61, 1841.864],
  ["75ea611ef44b5473c5bcb0788931dcb233b12494.svg", 48.4, 87.57, 2187.458, 1935.871, 1227.495, 1826.103],
  ["fcb69b518b5ff4e853c88b85b98f315e19f24bfb.svg", 142.8, 0.96, 2257.929, 1972.887, 1227.495, 1905.704],
] as const;

/** Figma node 510:46 with Home's glass bars added only over the hero. */
export function ProductAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-ink"
    >
      <div className="absolute left-1/2 top-0 h-full w-full max-w-[94.5rem] -translate-x-1/2">
        {/* One continuous intro atmosphere for the hero and connected-charging
            section: it now reaches through to Key Features (y=1229 in the
            1512 frame) instead of being clipped at the hero's own height, and
            fades out gradually rather than stopping on a hard edge. */}
        <div className="product-hero-gradient absolute inset-x-0 top-0 h-[88rem] overflow-hidden lg:h-[76.8125rem]">
          <div className="absolute left-[-22.8125rem] top-[-51.6875rem] h-[130.394rem] w-[151.302rem] overflow-hidden mix-blend-hard-light max-lg:left-1/2 max-lg:-translate-x-1/2">
            {ellipses.map(
              ([asset, left, top, width, height, innerWidth, innerHeight]) => (
                <div
                  className="absolute flex items-center justify-center mix-blend-color-dodge"
                  key={asset}
                  style={{
                    left: `${left / 16}rem`,
                    top: `${top / 16}rem`,
                    width: `${width / 16}rem`,
                    height: `${height / 16}rem`,
                  }}
                >
                  <div
                    className="relative rotate-[-117.71deg]"
                    style={{
                      width: `${innerWidth / 16}rem`,
                      height: `${innerHeight / 16}rem`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="absolute inset-[-5%_-7.5%] h-[110%] w-[115%] max-w-none object-fill"
                      src={`${FIGMA}${asset}`}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

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

        {/* Home's testimonial glow stays behind Technical Specifications. */}
        <div className="hidden lg:block">
          <RefractionFrame
            bleed
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

        {/* Group 13 is clipped to the footer so its broad source SVG cannot wash over the form. */}
        <div className="product-footer-glow absolute inset-x-0 bottom-0 h-[28rem] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="absolute bottom-[-48rem] left-1/2 h-[79.5775rem] w-[129.5rem] max-w-none -translate-x-1/2 object-fill mix-blend-screen"
            src={`${FIGMA}a100626a0b36a4da8ee4cc285d6f36370f0c5270.svg`}
          />
        </div>
      </div>

      {/* The glass bars carry into connected-charging too, at the same
          prominence as the hero — only the coloured gradient wash is capped
          at the hero's own height; the bars use their full natural extent
          (the refraction tile's own height) and taper out through its own
          fade mask rather than being cut short at the section boundary. */}
      <div className="product-hero-bars-fade absolute inset-x-0 top-0 hidden h-[61.375rem] overflow-hidden lg:block">
        <div className="product-hero-bars relative mx-auto h-full w-full max-w-[94.5rem]">
          <RefractionFrame
            bleed
            box={{ left: -13, top: -10.6, width: 1545, height: 992.192 }}
            id="product-hero-bars"
          >
            <GlowLayer
              box={{ left: -64.38, top: -94.01, width: 1656.89, height: 1103.004 }}
              vector="field"
            />
          </RefractionFrame>
        </div>
      </div>

      <div className="product-hero-bars-fade absolute inset-x-0 top-0 h-[clamp(45.3125rem,180.3483vw,63.4375rem)] overflow-hidden lg:hidden">
        <div className="product-hero-bars absolute inset-x-0 top-[17.2414%] mx-auto h-[24.403rem] max-w-[35.175rem]">
          <RefractionFrame
            bleed
            box={{ left: 0, top: 0, width: 402, height: 390.455 }}
            id="product-mobile-hero-bars"
            phaseOffset={-24}
            relativeTo={MOBILE_FRAME_WIDTH}
            scaleWithWidth
          >
            <GlowLayer
              box={{ left: -152.33, top: -36.99, width: 652.032, height: 434.062 }}
              render={{ width: 740.45, height: 522.53 }}
              vector="field"
            />
          </RefractionFrame>
        </div>
      </div>
    </div>
  );
}
