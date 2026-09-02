import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";

/**
 * Gives the light field depth.
 *
 * Each glow carries a `data-glow-depth` in pixels. The field spans the whole
 * page rather than sitting inside sections, so every layer is scrubbed against
 * the document's own scroll range and drifts by its own amount.
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
        { y: -depth / 2 },
        {
          y: depth / 2,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
        },
      );
    }
  }
}
