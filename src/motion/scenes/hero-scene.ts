import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";
import { splitAll } from "@/motion/split-text";

/** Distance the vehicles drift as the hero scrolls away, in pixels. */
const HERO_EXIT_DRIFT = 90;

/** Seconds between one letter starting and the next. */
const LETTER_STAGGER = 0.028;

/** Seconds between one headline line starting and the next. */
const LINE_STAGGER = 0.085;

/**
 * Hero choreography.
 *
 * The headline is revealed a letter at a time, each one sliding out from
 * behind its line's own clip rather than fading in — display type reads as
 * typeset that way instead of looking like a generic opacity tween, and the
 * sweep along the line gives the page a direction to be read in. The vehicles
 * settle from slightly below and scaled up, so the reveal has depth, and
 * everything shares one timeline so the beats stay in step regardless of frame
 * rate.
 *
 * The letters are cut at runtime by {@link splitAll}, so `sections/hero.tsx`
 * still ships its headline as ordinary text. If the split cannot be made the
 * lines slide as whole lines instead, which is what this did before.
 */
export class HeroScene extends MotionScene {
  readonly name = "hero";

  /** Undoes the character split when React unmounts the page. */
  private restoreLetters: (() => void) | null = null;

  build({ root, reducedMotion }: SceneContext): void {
    const lines = this.query(root, "hero-line");
    const vehicles = this.first(root, "hero-vehicles");
    if (reducedMotion || !lines.length) return;

    // The drift wrapper, not the image: see the note in `sections/hero.tsx`.
    const drift = this.first(root, "hero-vehicles-drift");

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

    intro.from(this.first(root, "header"), { yPercent: -110, autoAlpha: 0, duration: 0.7 });

    this.revealHeadline(intro, lines);

    intro
      .from(
        vehicles,
        { autoAlpha: 0, y: 46, scale: 1.06, duration: 1.25, ease: "power2.out" },
        "-=0.85",
      )
      .from(this.first(root, "hero-intro"), { autoAlpha: 0, y: 20, duration: 0.6 }, "-=0.7")
      .from(this.first(root, "hero-ctas"), { autoAlpha: 0, y: 14, duration: 0.5 }, "-=0.4");

    this.buildExit(drift);
  }

  dispose(): void {
    this.restoreLetters?.();
    this.restoreLetters = null;
  }

  /**
   * The headline, letter by letter.
   *
   * Each line is tweened as its own group so the wave runs along the line and
   * the next line starts a beat later, which is how the four lines keep
   * reading as two headlines rather than one list of characters. Every line
   * begins at a fixed offset from the same point on the timeline instead of
   * being chained, so a long line cannot push the next one late.
   */
  private revealHeadline(intro: gsap.core.Timeline, lines: HTMLElement[]): void {
    const start = "-=0.45";
    const split = splitAll(lines);

    if (!split.groups.length) {
      intro.from(lines, { yPercent: 118, duration: 0.9, ease: "power4.out", stagger: LINE_STAGGER }, start);
      return;
    }

    this.restoreLetters = split.restore;

    split.groups.forEach((chars, index) => {
      intro.from(
        chars,
        {
          yPercent: 120,
          duration: 0.85,
          ease: "expo.out",
          stagger: LETTER_STAGGER,
        },
        index === 0 ? start : `<${LINE_STAGGER}`,
      );
    });
  }

  /** The vehicles keep drifting as the hero leaves, giving the scroll weight. */
  private buildExit(drift: HTMLElement | null): void {
    if (!drift) return;

    gsap.to(drift, {
      y: -HERO_EXIT_DRIFT,
      ease: "none",
      scrollTrigger: {
        // The section, not the artwork: the artwork starts 15px above the frame,
        // so triggering off it would begin the drift already part-way through
        // and leave the hero off its mark at rest.
        trigger: drift.closest("section") ?? drift,
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  }
}
