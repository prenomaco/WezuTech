import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";

interface Recipe {
  /** Starting state. The element animates from here to its laid-out position. */
  readonly from: gsap.TweenVars;
  readonly duration: number;
  readonly ease: string;
  readonly stagger?: number;
  /** ScrollTrigger start; defaults to entering the lower third of the viewport. */
  readonly start?: string;
}

/**
 * Each element type gets its own entrance instead of one shared fade-up.
 *
 * Headings arrive from behind a clip, copy drifts in from the side it is
 * anchored to, artwork settles from depth, and grids cascade. The variation is
 * the point: uniform reveals are what make a page read as templated.
 */
const RECIPES: Record<string, Recipe> = {
  "about-eyebrow": {
    from: { xPercent: -12, autoAlpha: 0 },
    duration: 0.7,
    ease: "power3.out",
  },
  "about-copy": {
    from: { y: 26, autoAlpha: 0 },
    duration: 0.8,
    ease: "power2.out",
  },
  "about-artwork": {
    from: { x: 54, scale: 1.04, autoAlpha: 0 },
    duration: 1.15,
    ease: "power2.out",
    start: "top 88%",
  },
  "products-heading": {
    from: { y: 18, autoAlpha: 0 },
    duration: 0.65,
    ease: "power3.out",
  },
  "products-card": {
    from: { y: 34, autoAlpha: 0 },
    duration: 0.9,
    ease: "power3.out",
  },
  "industry-item": {
    from: { y: 30, autoAlpha: 0 },
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.07,
  },
  "testimonials-heading": {
    from: { y: 16, autoAlpha: 0 },
    duration: 0.6,
    ease: "power3.out",
  },
  "testimonial-stage": {
    from: { scale: 0.97, autoAlpha: 0 },
    duration: 0.85,
    ease: "power2.out",
  },
  "testimonial-dots": {
    from: { y: 12, autoAlpha: 0 },
    duration: 0.45,
    ease: "power2.out",
  },
  "contact-title": {
    from: { xPercent: -14, autoAlpha: 0 },
    duration: 0.85,
    ease: "power3.out",
  },
  "contact-form": {
    from: { y: 30, autoAlpha: 0 },
    duration: 0.8,
    ease: "power2.out",
  },
  footer: {
    from: { y: 26, autoAlpha: 0 },
    duration: 0.7,
    ease: "power2.out",
    start: "top 94%",
  },
};

const DEFAULT_START = "top 80%";

export class RevealScene extends MotionScene {
  readonly name = "reveal";

  build({ root, reducedMotion }: SceneContext): void {
    if (reducedMotion) return;

    for (const [motion, recipe] of Object.entries(RECIPES)) {
      const targets = this.query(root, motion);
      if (!targets.length) continue;

      gsap.from(targets, {
        ...recipe.from,
        duration: recipe.duration,
        ease: recipe.ease,
        stagger: recipe.stagger,
        scrollTrigger: {
          trigger: targets[0],
          start: recipe.start ?? DEFAULT_START,
          once: true,
        },
      });
    }
  }
}
