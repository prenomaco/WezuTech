import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";

/** Distance the vehicles drift as the hero scrolls away, in pixels. */
const HERO_EXIT_DRIFT = 90;

/**
 * Hero choreography.
 *
 * The headline is revealed by sliding each line out from behind its own clip
 * rather than fading it in — display type reads as typeset that way instead of
 * looking like a generic opacity tween. The vehicles settle from slightly
 * below and scaled up, so the reveal has a direction, and everything shares one
 * timeline so the beats stay in step regardless of frame rate.
 */
export class HeroScene extends MotionScene {
  readonly name = "hero";

  build({ root, reducedMotion }: SceneContext): void {
    const lines = this.query(root, "hero-line");
    const vehicles = this.first(root, "hero-vehicles");
    if (reducedMotion || !lines.length) return;

    // The drift wrapper, not the image: see the note in `sections/hero.tsx`.
    const drift = this.first(root, "hero-vehicles-drift");

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

    intro
      .from(this.first(root, "header"), { yPercent: -110, autoAlpha: 0, duration: 0.7 })
      .from(
        lines,
        { yPercent: 118, duration: 0.9, ease: "power4.out", stagger: 0.08 },
        "-=0.45",
      )
      .from(
        vehicles,
        { autoAlpha: 0, y: 46, scale: 1.06, duration: 1.25, ease: "power2.out" },
        "-=0.85",
      )
      .from(this.first(root, "hero-intro"), { autoAlpha: 0, y: 20, duration: 0.6 }, "-=0.7")
      .from(this.first(root, "hero-ctas"), { autoAlpha: 0, y: 14, duration: 0.5 }, "-=0.4");

    this.buildExit(drift);
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
