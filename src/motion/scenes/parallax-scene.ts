import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";

/**
 * Gives the light field depth.
 *
 * Every glow carries a `data-glow-depth` in pixels (see `lib/design/atmosphere`).
 * Layers meant to read as distant get a small value and barely move; near
 * layers get a large one and slide noticeably against the content. The tween is
 * scrubbed to scroll position rather than triggered, so the effect is
 * continuous and reversible instead of a one-shot.
 */
export class ParallaxScene extends MotionScene {
  readonly name = "parallax";

  build({ root, reducedMotion }: SceneContext): void {
    if (reducedMotion) return;

    for (const field of root.querySelectorAll<HTMLElement>("[data-atmosphere]")) {
      const section = field.parentElement;
      if (!section) continue;

      const layers = Array.from(field.querySelectorAll<HTMLElement>("[data-glow-depth]"));
      if (!layers.length) continue;

      const depth = (_: number, target: HTMLElement) => Number(target.dataset.glowDepth ?? 0);

      // Travel is centred on the section's own scroll range so the layout
      // matches the Figma composition when the section is mid-viewport.
      gsap.fromTo(
        layers,
        { y: (index, target: HTMLElement) => -depth(index, target) / 2 },
        {
          y: (index, target: HTMLElement) => depth(index, target) / 2,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }
  }
}
