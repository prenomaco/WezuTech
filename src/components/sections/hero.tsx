import Image from "next/image";
import { Header } from "@/components/layout/header";
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

/* Figma node 252:469 — the artwork starts 15px above the frame and is clipped. */
const VEHICLES = { src: "/figma/80d9a6f7455db9ebe3011c930e9d2a30d69a29c2.png", width: 1264, height: 843 };

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

      <div className="relative z-10 aspect-[1512/940] w-full">
        {/* Two layers on purpose: the wrapper owns the scroll-scrubbed drift and
            the image owns the entrance. Animating `y` on one element from both
            scenes lets ScrollTrigger latch the mid-entrance value on refresh and
            leaves the artwork stranded off its mark. */}
        <div
          className="absolute"
          data-motion="hero-vehicles-drift"
          style={{
            left: pct(123),
            top: pct(-15, "height"),
            width: pct(1174.5),
            height: pct(783, "height"),
          }}
        >
          <Image
            alt="Electric car, freight truck and passenger train"
            className="h-full w-full object-cover"
            data-motion="hero-vehicles"
            height={VEHICLES.height}
            priority
            sizes="(min-width: 1512px) 1175px, 78vw"
            src={VEHICLES.src}
            width={VEHICLES.width}
          />
        </div>

        <DisplayTitle as="h1" className="absolute" style={{ left: pct(166), top: pct(231, "height") }}>
          {hero.titleLeft.map((line) => (
            <HeadlineLine key={line}>{line}</HeadlineLine>
          ))}
        </DisplayTitle>

        <DisplayTitle as="p" className="absolute" style={{ left: pct(962), top: pct(613, "height") }}>
          {hero.titleRight.map((line) => (
            <HeadlineLine key={line}>{line}</HeadlineLine>
          ))}
        </DisplayTitle>

        <p
          className="absolute text-[1.125rem] leading-[1.5rem] text-ice"
          data-motion="hero-intro"
          style={{ left: pct(104), top: pct(732, "height"), width: pct(709) }}
        >
          {hero.intro}
        </p>

        <div
          className="absolute flex items-center"
          data-motion="hero-ctas"
          /* A percentage gap resolves against this box's own width, which is
             shrink-to-fit — the cycle collapses it during intrinsic sizing and
             wraps "Contact Us" onto a second line. */
          style={{ left: pct(103), top: pct(838, "height"), gap: "1.1875rem" }}
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
