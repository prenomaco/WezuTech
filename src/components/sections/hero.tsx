import { Header } from "@/components/layout/header";
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

/*
 * The hero footage is a 1920 x 440 banner, so the stage box is given the clip's
 * own ratio rather than a Figma height. `object-cover` then has nothing to crop:
 * any other box turns a 4.36:1 clip into a single hugely magnified frame, which
 * is what the fixed 1174.5 x 783 slot used to do.
 */
const VEHICLES = { src: "/videos/hero-section.mp4", aspect: "aspect-[1920/440]" };

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
        {/* Two layers on purpose: the wrapper owns the scroll-scrubbed drift and
            the image owns the entrance. Animating `y` on one element from both
            scenes lets ScrollTrigger latch the mid-entrance value on refresh and
            leaves the artwork stranded off its mark. */}
        <div
          className={`absolute overflow-hidden rounded-xl ${VEHICLES.aspect}`}
          data-motion="hero-vehicles-drift"
          style={{ left: pct(166), top: pct(319, "height"), width: pct(1186) }}
        >
          {/* A third wrapper: the drift above is scroll-scrubbed and the video
              below is owned by the intro timeline, so the idle float needs a
              transform of its own rather than a share of either. */}
          <div className="size-full" data-motion="hero-vehicles-float">
            <video
              autoPlay
              className="block size-full object-cover"
              data-motion="hero-vehicles"
              loop
              muted
              playsInline
            >
              <source src={VEHICLES.src} type="video/mp4" />
            </video>
          </div>
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
