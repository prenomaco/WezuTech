import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";
import { splitAll } from "@/motion/split-text";

interface Recipe {
  /** Starting state. The element animates from here to its laid-out position. */
  readonly from: gsap.TweenVars;
  readonly duration: number;
  readonly ease: string;
  readonly stagger?: number;
  /** ScrollTrigger start; defaults to entering the lower third of the viewport. */
  readonly start?: string;
  /**
   * Reveal a character at a time rather than as one block.
   *
   * Only worth it for type that is already clipped by its own element, where
   * the letters have something to slide out from behind. The trigger stays the
   * element itself — the characters are what moves, not what is watched for.
   */
  readonly split?: boolean;
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

/** Seconds between one letter starting and the next, where a recipe splits. */
const LETTER_STAGGER = 0.026;

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
    duration: 0.47,
    ease: EASE_TYPE,
    split: true,
  },
  "products-heading": {
    from: { yPercent: 115 },
    duration: 0.47,
    ease: EASE_TYPE,
    split: true,
  },
  "testimonials-heading": {
    from: { yPercent: 115 },
    duration: 0.47,
    ease: EASE_TYPE,
    split: true,
  },

  /* Copy rises a short way. The distance is small on purpose: long travel on a
     block of text drags the eye down the page just as it is trying to read. */
  "about-copy": {
    from: { y: 22, autoAlpha: 0 },
    duration: 0.5,
    ease: EASE_SETTLE,
    stagger: 0.054,
  },
  "products-card": {
    from: { y: 28, autoAlpha: 0 },
    duration: 0.52,
    ease: EASE_SETTLE,
  },

  /* Artwork settles out of depth, so the section has a foreground and a
     background rather than one flat plane arriving together. */
  "about-artwork": {
    from: { x: 48, scale: 1.045, autoAlpha: 0 },
    duration: 0.6,
    ease: EASE_SETTLE,
    start: "top 96%",
  },

  /* The grid cascades along the reading order; the stagger is short enough
     that the row still lands as a row. */
  "industry-item": {
    from: { y: 26, scale: 0.985, autoAlpha: 0 },
    duration: 0.39,
    ease: EASE_SETTLE,
    stagger: 0.036,
  },

  /* Panels scale up a hair as they arrive, which reads as the frame drawing
     itself rather than a card being pasted in. */
  "testimonial-stage": {
    from: { scale: 0.975, autoAlpha: 0 },
    duration: 0.5,
    ease: EASE_SETTLE,
  },
  "testimonial-dots": {
    from: { y: 10, autoAlpha: 0 },
    duration: 0.28,
    ease: EASE_SETTLE,
  },

  "contact-title": {
    from: { xPercent: -12, autoAlpha: 0 },
    duration: 0.52,
    ease: EASE_TYPE,
  },
  /* Fields arrive one after another so the form reads as a sequence to fill
     in, not a block that appears. */
  "contact-field": {
    from: { y: 20, autoAlpha: 0 },
    duration: 0.39,
    ease: EASE_SETTLE,
    stagger: 0.042,
  },

  footer: {
    from: { y: 24, autoAlpha: 0 },
    duration: 0.44,
    ease: EASE_SETTLE,
    start: "top 97%",
  },
};

/**
 * Reveals begin before the element is in view, not after.
 *
 * At `top 80%` a section only starts once a fifth of it is already showing, so
 * scrolling at any speed means watching blocks fade in behind you. Starting at
 * 96% gives the tween most of its run before the element is actually being
 * looked at.
 */
const DEFAULT_START = "top 96%";

/**
 * Where every reveal lands: the element's own laid-out position, fully opaque.
 *
 * Spelling the end state out matters. `gsap.from` infers it from whatever the
 * element happens to be at when the tween is built, and re-infers it whenever
 * ScrollTrigger refreshes — which the page does on resize and on any height
 * change. A refresh after a section had already played would re-apply its
 * starting `autoAlpha: 0`, leaving whole sections of the page blank.
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

  /** Undoes the character splits when React unmounts the page. */
  private readonly restores: (() => void)[] = [];

  build({ root, reducedMotion }: SceneContext): void {
    if (reducedMotion) return;

    for (const [motion, recipe] of Object.entries(RECIPES)) {
      const targets = this.query(root, motion);
      if (!targets.length) continue;

      const resting = restingFor(recipe.from);
      /* What actually moves. For a split recipe that is the characters; the
         element itself stays put so its clip has an edge to reveal from. */
      let animated: HTMLElement[] = targets;
      let stagger = recipe.stagger;

      if (recipe.split) {
        const split = splitAll(targets);
        const chars = split.groups.flat();
        if (chars.length) {
          this.restores.push(split.restore);
          animated = chars;
          stagger = recipe.stagger ?? LETTER_STAGGER;
        }
      }

      /*
       * A plain `set` for the starting state and a plain `to` for the reveal,
       * rather than one `fromTo` owned by the trigger.
       *
       * A tween that a ScrollTrigger owns is re-rendered whenever the trigger
       * refreshes, and the page refreshes on resize, on any height change, and
       * twice on mount in development, where React invokes effects twice. Each
       * of those could put a section back to `autoAlpha: 0` after it had
       * already played — on the dev server that left fifteen elements
       * permanently invisible. Nothing here is re-rendered: the trigger only
       * starts a tween, and once it has run there is no from-state left to
       * reapply.
       */
      gsap.set(animated, recipe.from);

      const play = () => {
        gsap.to(animated, {
          ...resting,
          duration: recipe.duration,
          ease: recipe.ease,
          stagger,
          overwrite: "auto",
        });
      };

      ScrollTrigger.create({
        trigger: targets[0],
        start: recipe.start ?? DEFAULT_START,
        once: true,
        onEnter: play,
        /* Covers the element already being past its start when the trigger is
           built or rebuilt — a reload part-way down the page, or a scroll fast
           enough to outrun it. */
        onRefresh: (self) => {
          if (self.progress > 0) play();
        },
      });
    }
  }

  dispose(): void {
    for (const restore of this.restores) restore();
    this.restores.length = 0;
  }
}
