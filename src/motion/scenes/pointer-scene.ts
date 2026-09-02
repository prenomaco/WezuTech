import gsap from "gsap";
import { MotionScene, type SceneContext } from "@/motion/motion-scene";

/** Maximum drift in pixels at the far edge of the viewport. */
const MAX_DRIFT = 18;
/** Vehicles counter-move slightly less than the light behind them. */
const SUBJECT_RATIO = 0.45;

/**
 * Parallax against the pointer, limited to the hero.
 *
 * The light field and the vehicles move by different amounts, which separates
 * them in depth as the cursor crosses the hero. Values are deliberately small —
 * the effect should register as the scene breathing, not as the page reacting.
 */
export class PointerScene extends MotionScene {
  readonly name = "pointer";

  private detach: (() => void) | null = null;

  build({ root, reducedMotion }: SceneContext): void {
    const hero = root.querySelector<HTMLElement>('[data-glow-depth="30"]');
    // The drift wrapper, so the image element stays owned by the intro timeline.
    const vehicles = this.first(root, "hero-vehicles-drift");
    if (reducedMotion || !hero || window.matchMedia("(pointer: coarse)").matches) return;

    const glow = gsap.quickTo(hero, "x", { duration: 0.9, ease: "power3.out" });
    const glowY = gsap.quickTo(hero, "y", { duration: 0.9, ease: "power3.out" });
    const subject = vehicles ? gsap.quickTo(vehicles, "x", { duration: 1.1, ease: "power3.out" }) : null;

    const onPointerMove = (event: PointerEvent) => {
      const offsetX = event.clientX / window.innerWidth - 0.5;
      const offsetY = event.clientY / window.innerHeight - 0.5;
      glow(offsetX * MAX_DRIFT);
      glowY(offsetY * MAX_DRIFT * 0.5);
      subject?.(offsetX * -MAX_DRIFT * SUBJECT_RATIO);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    this.detach = () => window.removeEventListener("pointermove", onPointerMove);
  }

  dispose(): void {
    this.detach?.();
    this.detach = null;
  }
}
