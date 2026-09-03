import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MotionScene } from "@/motion/motion-scene";
import { HeroScene } from "@/motion/scenes/hero-scene";
import { ParallaxScene } from "@/motion/scenes/parallax-scene";
import { RevealScene } from "@/motion/scenes/reveal-scene";

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Owns the lifecycle of every scene on the page.
 *
 * Scenes are built inside one `gsap.context` scoped to the root element, so a
 * single `revert()` unwinds all tweens, ScrollTriggers and inline styles when
 * React unmounts — which matters under Fast Refresh and route changes, where
 * orphaned ScrollTriggers otherwise stack up and desynchronise.
 */
export class MotionRegistry {
  private context: gsap.Context | null = null;

  constructor(private readonly scenes: readonly MotionScene[]) {}

  static withDefaults(): MotionRegistry {
    return new MotionRegistry([
      new ParallaxScene(),
      new HeroScene(),
      new RevealScene(),
    ]);
  }

  mount(root: HTMLElement): void {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    this.context = gsap.context(() => {
      for (const scene of this.scenes) {
        scene.build({ root, reducedMotion });
      }
    }, root);
  }

  unmount(): void {
    for (const scene of this.scenes) {
      scene.dispose();
    }
    this.context?.revert();
    this.context = null;
  }
}
