import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { hero } from "@/content/site-content";

/**
 * The hero as the 402 frame draws it (node 305:48).
 *
 * It is a different composition rather than the desktop one reflowed: the
 * headline splits across the artwork instead of flanking it, the copy and the
 * buttons centre, and the buttons stack full-width. Positions are percentages
 * of the 402 frame across and pixels down, since the type is a fixed size —
 * scaling the whole stage would shrink 24px Centauri below legibility on a
 * narrow phone.
 */
const FRAME_WIDTH = 402;

const x = (value: number) => `${(value / FRAME_WIDTH) * 100}%`;

/** Node 252:469's artwork, cropped to the 370 x 246.667 window at node 305:96. */
const VEHICLES = { src: "/figma/80d9a6f7455db9ebe3011c930e9d2a30d69a29c2.png", width: 1264, height: 843 };

/**
 * Centauri 24px, as nodes 305:98 and 305:102 set it. Both are 56 tall for two
 * lines, so the line box is 28 — Figma's "normal" for this face, not 1.
 */
const HEADLINE = "absolute font-display text-[1.5rem] leading-[1.75rem] text-ice";

export function MobileHero() {
  return (
    /* Capped at the frame's own width. Every offset below is a percentage of
       402, so letting the stage grow past that spreads the composition apart —
       the CTA becomes a 750px bar and the headline drifts off the artwork. On
       anything wider than the frame the stage centres instead. */
    <div className="relative mx-auto h-[45.3125rem] w-full max-w-[25.125rem] lg:hidden">
      <div
        className="absolute"
        data-motion="hero-vehicles-drift"
        style={{ left: x(17), top: "9.2375rem", width: x(370), height: "15.4167rem" }}
      >
        <Image
          alt="Electric car, freight truck and passenger train"
          className="h-full w-full object-contain"
          data-motion="hero-vehicles"
          height={VEHICLES.height}
          priority
          sizes="370px"
          src={VEHICLES.src}
          width={VEHICLES.width}
        />
      </div>

      {/* 305:98 — set left, its own two lines. */}
      <h1 className={HEADLINE} style={{ left: x(29.918), top: "12.3325rem" }}>
        {hero.titleLeft.map((line) => (
          <span className="block" key={line}>
            {line}
          </span>
        ))}
      </h1>

      {/* 305:102 — set right, its right edge on x=367.65. */}
      <p className={`${HEADLINE} text-right`} style={{ right: x(34.35), top: "22.3669rem" }}>
        {hero.titleRight.map((line) => (
          <span className="block" key={line}>
            {line}
          </span>
        ))}
      </p>

      <p
        className="absolute left-1/2 -translate-x-1/2 text-center text-[1rem] leading-normal text-ice"
        data-motion="hero-intro"
        style={{ top: "29.5625rem", width: x(337) }}
      >
        {hero.intro}
      </p>

      {/* 305:106 — a 328-wide column: the primary fills it, the ghost centres
          under it. */}
      <div
        className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
        data-motion="hero-ctas"
        style={{ top: "39.8125rem", width: x(328) }}
      >
        <ButtonLink className="w-full" href="#contact">
          Contact Us
        </ButtonLink>
        <ButtonLink href="#about" variant="ghost">
          About
        </ButtonLink>
      </div>
    </div>
  );
}
