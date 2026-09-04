import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MotionScene } from "@/motion/motion-scene";
import { HeroScene } from "@/motion/scenes/hero-scene";
import { IdleScene } from "@/motion/scenes/idle-scene";
import { RevealScene } from "@/motion/scenes/reveal-scene";

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Owns the lifecycle of every scene on the page.
 *
 * The background's drift is not among them. It was five scrubbed
 * ScrollTriggers writing transforms to layers whose contents are a Gaussian,
 * so the GPU re-blurred them frame by frame — 834ms of GPU work across a
 * three-second scroll. It is a CSS scroll-timeline animation now, in
 * `globals.css`, and browsers without scroll timelines simply hold the
 * background still: it is decoration, and the JavaScript that drove it is the
 * one thing on the page measured to make scrolling stutter.
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
      new HeroScene(),
      new RevealScene(),
      new IdleScene(),
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
