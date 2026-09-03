import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";

/**
 * Gives the light field depth.
 *
 * Each glow carries a `data-glow-depth` in pixels. The field spans the whole
 * page rather than sitting inside sections, so every layer is scrubbed against
 * the document's own scroll range and drifts by its own amount.
 *
 * The drift starts at zero rather than straddling it. Splitting the travel
 * either side of the design position looks the same in motion but leaves every
 * layer offset by half its depth at the top of the page, where the background
 * is most visible and is supposed to sit exactly where the design puts it.
 *
 * Vertical only, and only on the layers that are cheap to move. The frames
 * carrying the refraction shader stay put: `feDisplacementMap` has no CSS
 * equivalent, so it is rastered on the CPU, and moving it re-runs the
 * displacement on every scroll frame.
 */
export class ParallaxScene extends MotionScene {
  readonly name = "parallax";

  build({ root, reducedMotion }: SceneContext): void {
    if (reducedMotion) return;

    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-glow-depth]"));
    if (!layers.length) return;

    for (const layer of layers) {
      const depth = Number(layer.dataset.glowDepth ?? 0);
      if (!depth) continue;

      gsap.fromTo(
        layer,
        { y: 0 },
        {
          y: depth,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
        },
      );
    }
  }
}
