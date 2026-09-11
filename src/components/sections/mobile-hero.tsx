import { HERO_VIDEO, HeroVideo } from "@/components/media/hero-video";
import { ButtonLink } from "@/components/ui/button";
import { hero } from "@/content/site-content";

/** Scale the 402 composition continuously, then cap it at a readable tablet size. */
const STAGE =
  "relative mx-auto h-[clamp(45.3125rem,180.3483vw,63.4375rem)] w-full max-w-[35.175rem]";
const HEADLINE = "absolute font-display leading-[normal] text-ice";

/*
 * The still this replaced was a transparent PNG, so it could span the headline
 * and let the type read through it. The clip is opaque, so it takes the gap
 * between the two headline halves instead of their full height: 33.8% is where
 * "THE" ends and 49.5% is where "NEXT" begins, and the banner is 11.3-11.7% of
 * the stage across the whole mobile range, so 36% centres it in that gap with
 * roughly 2% of clearance either side.
 */
const ARTWORK = "absolute left-[4.2289%] top-[36%] w-[92.0398%]";

function HeroArtwork() {
  return (
    <div className={`${ARTWORK} overflow-hidden rounded-xl ${HERO_VIDEO.aspect}`}>
      <HeroVideo />
    </div>
  );
}

export function MobileHero() {
  return (
    <div className="overflow-hidden lg:hidden">
      <div className={STAGE}>
        <HeroArtwork />
        <h1
          className={`${HEADLINE} left-[5.7214%] top-[26.4828%] text-[clamp(1.4106875rem,5.6147vw,1.9749625rem)]`}
        >
          {hero.titleLeft.map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
        </h1>
        <p
          className={`${HEADLINE} right-[8.4851%] top-[49.5172%] text-right text-[clamp(1.469625rem,5.8493vw,2.057475rem)]`}
        >
          {hero.titleRight.map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
        </p>
        <p
          className="absolute inset-x-0 top-[65.2414%] mx-auto w-[83.8308%] text-center text-[clamp(1rem,3.9801vw,1.4rem)] leading-normal text-ice"
          data-motion="hero-intro"
        >
          {hero.intro}
        </p>
        <div
          className="absolute inset-x-0 bottom-[3.5%] mx-auto flex w-[81.592%] flex-col items-center gap-[0.75rem] [&_a]:h-[clamp(2.75rem,10.9453vw,3.85rem)] [&_a]:w-full [&_a]:text-[clamp(1rem,3.9801vw,1.4rem)]"
          data-motion="hero-ctas"
        >
          <ButtonLink href="#contact">Contact Us</ButtonLink>
          <ButtonLink href="#about" variant="ghost">
            About
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
