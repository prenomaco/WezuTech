import { Header } from "@/components/layout/header";
import { HERO_VIDEO, HeroVideo } from "@/components/media/hero-video";
import { MobileHero } from "@/components/sections/mobile-hero";
import { ButtonLink } from "@/components/ui/button";
import { DisplayTitle } from "@/components/ui/typography";
import { hero } from "@/content/site-content";

/**
 * The hero is a fixed composition in Figma, so it is laid out on a stage with
 * the frame's aspect ratio and every child placed at its Figma coordinate,
 * expressed as a percentage of the 1512 x 940 frame. That preserves the exact
 * relationship between the headline halves, the vehicles and the copy at any
 * desktop width, which a re-flowing grid would not.
 */
const FRAME = { width: 1512, height: 940 } as const;

const pct = (value: number, axis: "width" | "height" = "width") =>
  `${(value / FRAME[axis]) * 100}%`;

/**
 * Each headline line gets its own clip so the motion layer can slide it up from
 * behind the mask instead of fading it in. Centauri is an all-caps face with no
 * descenders, so the clip can sit tight against the 41px line box and keep the
 * headline's measured height at the Figma value.
 */
function HeadlineLine({ children }: { children: string }) {
  return (
    <span className="block overflow-hidden">
      <span className="block" data-motion="hero-line">
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-clip">
      <Header />

      <MobileHero />

      {/* The hero is a fixed composition, so it stops at the design's own width
          and centres beyond it — the same 1512 column every section below uses.
          Letting it grow with the viewport made the stage taller than the frame
          (1194 against 940 at a 1920 monitor) while the type stayed 36px, so
          the page ran 254px long and the composition opened up. */}
      <div className="relative z-10 mx-auto hidden aspect-[1512/940] w-full max-w-[94.5rem] lg:block">
        {/* No `hero-vehicles-drift` here any more: the scroll-scrubbed parallax
            was choreographed for the still vehicles PNG this clip replaced, and
            on footage that is already moving it read as the banner sliding out
            of its own frame. The box stays — it is what crops the clip to the
            rounded band — it simply no longer moves with the scroll. */}
        <div
          className={`absolute overflow-hidden rounded-xl ${HERO_VIDEO.aspect}`}
          style={{ left: pct(166), top: pct(319, "height"), width: pct(1186) }}
        >
          {/* The idle float is gone with the parallax, and for a second
              reason: the clip fills this box exactly, so lifting it 7px
              exposed a 7px strip of page along the bottom edge of the band
              every time the float came back up. The still it was written for
              was a transparent PNG, where that strip was invisible. */}
          <HeroVideo />
        </div>

        <DisplayTitle as="h1" className="absolute" style={{ left: pct(166), top: pct(231, "height") }}>
          {hero.titleLeft.map((line) => (
            <HeadlineLine key={line}>{line}</HeadlineLine>
          ))}
        </DisplayTitle>

        {/* Node 252:471 is a 388-wide box at x=962 with its two lines set
            flush right, so "NEXT" hangs off the end of "MOVEMENT" rather than
            starting level with it. */}
        <DisplayTitle
          as="p"
          className="absolute text-right"
          style={{ left: pct(962), top: pct(613, "height"), width: pct(388) }}
        >
          {hero.titleRight.map((line) => (
            <HeadlineLine key={line}>{line}</HeadlineLine>
          ))}
        </DisplayTitle>

        <p
          className="absolute text-[1.125rem] leading-[1.5rem] text-ice"
          data-motion="hero-intro"
          style={{ left: pct(166), top: pct(624, "height"), width: pct(709) }}
        >
          {hero.intro}
        </p>

        <div
          className="absolute flex items-center"
          data-motion="hero-ctas"
          /* A percentage gap resolves against this box's own width, which is
             shrink-to-fit — the cycle collapses it during intrinsic sizing and
             wraps "Contact Us" onto a second line. */
          style={{ left: pct(166), top: pct(730, "height"), gap: "1.1875rem" }}
        >
          <ButtonLink href="#contact">Contact Us</ButtonLink>
          <ButtonLink href="#about" variant="ghost">
            About
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
