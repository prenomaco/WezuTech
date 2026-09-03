import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";

/** How far the artwork drifts from its resting position, in pixels. */
const FLOAT = 7;

/** One full rise and fall, in seconds. Slow enough to read as weight. */
const PERIOD = 6;

/**
 * The one thing on the page that keeps moving after everything has arrived.
 *
 * A page whose motion all happens on entry feels finished the moment it lands.
 * A single slow float on the hero's subject is enough to keep it alive, and it
 * is close to free: the artwork is a plain image with no filter and no blend,
 * so the compositor moves a cached layer and nothing re-rasters.
 *
 * It gets its own wrapper rather than sharing one. The element below it is
 * driven by the intro timeline and the element above by the scroll drift; a
 * third scene writing `y` to either would fight them for the same transform.
 */
export class IdleScene extends MotionScene {
  readonly name = "idle";

  build({ root, reducedMotion }: SceneContext): void {
    if (reducedMotion) return;

    const targets = this.query(root, "hero-vehicles-float");
    if (!targets.length) return;

    gsap.to(targets, {
      y: -FLOAT,
      duration: PERIOD / 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      /* Starts once the intro has put the artwork where it belongs, so the
         two never overlap. */
      delay: 1.6,
    });
  }
}
