export interface SceneContext {
  /** Element the whole registry is scoped to. */
  readonly root: HTMLElement;
  /** True when the visitor asked for reduced motion. */
  readonly reducedMotion: boolean;
}

/**
 * A single, self-contained piece of choreography.
 *
 * Scenes are built inside a `gsap.context`, so anything they create is reverted
 * together when the page unmounts — no scene needs its own teardown unless it
 * attaches listeners of its own, which it reports through `dispose`.
 */
export abstract class MotionScene {
  abstract readonly name: string;

  abstract build(context: SceneContext): void;

  /** Optional cleanup for anything gsap.context cannot revert (DOM listeners). */
  dispose(): void {}

  protected query<T extends HTMLElement = HTMLElement>(root: ParentNode, motion: string): T[] {
    return Array.from(root.querySelectorAll<T>(`[data-motion="${motion}"]`));
  }

  protected first<T extends HTMLElement = HTMLElement>(root: ParentNode, motion: string): T | null {
    return root.querySelector<T>(`[data-motion="${motion}"]`);
  }
}
