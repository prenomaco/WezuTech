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
 * Two eases, used consistently.
 *
 * `EASE_TYPE` is for anything sliding out from behind a clip: nearly all of
 * the travel happens immediately and the tail is long, so the letters appear
 * already moving. `EASE_SETTLE` is gentler and is what everything that fades
 * uses, so the page has two speeds rather than a dozen.
 */
const EASE_TYPE = "expo.out";
const EASE_SETTLE = "power3.out";

/**
 * Each element type gets its own entrance instead of one shared fade-up.
 *
 * Headings arrive from behind a clip, copy drifts in from the side it is
 * anchored to, artwork settles from depth, and grids cascade. The variation is
 * the point: uniform reveals are what make a page read as templated.
 */
const RECIPES: Record<string, Recipe> = {
  /* Eyebrows are clipped by their own element, so they slide up from behind it
     rather than fading — the same move the hero makes with its headline, which
     is what keeps the two reading as one page. */
  "about-eyebrow": {
    from: { yPercent: 115 },
    duration: 0.85,
    ease: EASE_TYPE,
  },
  "products-heading": {
    from: { yPercent: 115 },
    duration: 0.85,
    ease: EASE_TYPE,
  },
  "testimonials-heading": {
    from: { yPercent: 115 },
    duration: 0.85,
    ease: EASE_TYPE,
  },

  /* Copy rises a short way. The distance is small on purpose: long travel on a
     block of text drags the eye down the page just as it is trying to read. */
  "about-copy": {
    from: { y: 22, autoAlpha: 0 },
    duration: 0.9,
    ease: EASE_SETTLE,
    stagger: 0.09,
  },
  "products-card": {
    from: { y: 28, autoAlpha: 0 },
    duration: 0.95,
    ease: EASE_SETTLE,
  },

  /* Artwork settles out of depth, so the section has a foreground and a
     background rather than one flat plane arriving together. */
  "about-artwork": {
    from: { x: 48, scale: 1.045, autoAlpha: 0 },
    duration: 1.2,
    ease: EASE_SETTLE,
    start: "top 88%",
  },

  /* The grid cascades along the reading order; the stagger is short enough
     that the row still lands as a row. */
  "industry-item": {
    from: { y: 26, scale: 0.985, autoAlpha: 0 },
    duration: 0.7,
    ease: EASE_SETTLE,
    stagger: 0.06,
  },

  /* Panels scale up a hair as they arrive, which reads as the frame drawing
     itself rather than a card being pasted in. */
  "testimonial-stage": {
    from: { scale: 0.975, autoAlpha: 0 },
    duration: 0.9,
    ease: EASE_SETTLE,
  },
  "testimonial-dots": {
    from: { y: 10, autoAlpha: 0 },
    duration: 0.5,
    ease: EASE_SETTLE,
  },

  "contact-title": {
    from: { xPercent: -12, autoAlpha: 0 },
    duration: 0.95,
    ease: EASE_TYPE,
  },
  /* Fields arrive one after another so the form reads as a sequence to fill
     in, not a block that appears. */
  "contact-field": {
    from: { y: 20, autoAlpha: 0 },
    duration: 0.7,
    ease: EASE_SETTLE,
    stagger: 0.07,
  },

  footer: {
    from: { y: 24, autoAlpha: 0 },
    duration: 0.8,
    ease: EASE_SETTLE,
    start: "top 94%",
  },
};

const DEFAULT_START = "top 80%";

/**
 * Where every reveal lands: the element's own laid-out position, fully opaque.
 *
 * Spelling the end state out matters. `gsap.from` infers it from whatever the
 * element happens to be at when the tween is built, and re-infers it whenever
 * ScrollTrigger refreshes — which the page does on resize and on any height
 * change. A refresh after a section had already played would re-apply its
 * starting `autoAlpha: 0`, leaving whole sections of the page blank until they
 * were scrolled past again.
 */
const RESTING: gsap.TweenVars = {
  autoAlpha: 1,
  x: 0,
  y: 0,
  xPercent: 0,
  yPercent: 0,
  scale: 1,
};

/** The resting values for just the properties a recipe actually animates. */
function restingFor(from: gsap.TweenVars): gsap.TweenVars {
  const to: gsap.TweenVars = {};
  for (const key of Object.keys(from)) {
    if (key in RESTING) to[key] = RESTING[key as keyof typeof RESTING];
  }
  return to;
}

export class RevealScene extends MotionScene {
  readonly name = "reveal";

  build({ root, reducedMotion }: SceneContext): void {
    if (reducedMotion) return;

    for (const [motion, recipe] of Object.entries(RECIPES)) {
      const targets = this.query(root, motion);
      if (!targets.length) continue;

      gsap.fromTo(targets, recipe.from, {
        ...restingFor(recipe.from),
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
