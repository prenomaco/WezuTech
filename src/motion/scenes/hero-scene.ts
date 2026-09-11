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
    /*
     * Every match, not the first. The page ships both compositions — the 402
     * frame's and the 1512 one — and hides whichever does not apply, so the
     * first `hero-intro` in the document is always the mobile one. Animating
     * only that left the desktop copy and buttons with no entrance at all.
     */
    const vehicles = this.query(root, "hero-vehicles");
    if (reducedMotion || !lines.length) return;

    // The drift wrapper, not the image: see the note in `sections/hero.tsx`.
    const drifts = this.query(root, "hero-vehicles-drift");

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

    /*
     * `clearProps: "transform"` matters here beyond tidiness: a `<header>`
     * left with any inline `transform` — even the identity matrix GSAP
     * settles on — becomes a new containing block for its own
     * `position: fixed` descendants, which is exactly what `MobileMenu`
     * renders inside it. Without this, the mobile nav overlay sizes itself
     * against the header's own ~103px box instead of the viewport.
     */
    intro.from(this.first(root, "header"), {
      autoAlpha: 0,
      clearProps: "transform",
      duration: 0.7,
      yPercent: -110,
    });

    this.revealHeadline(intro, lines);

    /*
     * Each of these is skipped when the page has none of that element.
     *
     * `gsap.from([])` warns ("GSAP target not found") and leaves a zero-length
     * tween on the timeline, which is what the catalogue pages produced: they
     * carry a clipped headline but no vehicles and no CTA row, so two of the
     * three tweens below had nothing to act on.
     */
    this.add(intro, vehicles, { autoAlpha: 0, y: 46, scale: 1.06, duration: 1.25, ease: "power2.out" }, "-=0.85");
    this.add(intro, this.query(root, "hero-intro"), { autoAlpha: 0, y: 20, duration: 0.6 }, "-=0.7");
    this.add(intro, this.query(root, "hero-ctas"), { autoAlpha: 0, y: 14, duration: 0.5 }, "-=0.4");

    for (const drift of drifts) this.buildExit(drift);
  }

  dispose(): void {
    this.restoreLetters?.();
    this.restoreLetters = null;
  }

  /** `from` only when there is something to tween. */
  private add(
    intro: gsap.core.Timeline,
    targets: HTMLElement[] | HTMLElement | null,
    vars: gsap.TweenVars,
    position: string,
  ): void {
    const list = Array.isArray(targets) ? targets : targets ? [targets] : [];
    if (list.length) intro.from(list, vars, position);
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
