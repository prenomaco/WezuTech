/**
 * Splits an element's text into per-character spans, and puts it back.
 *
 * The motion layer does this at runtime rather than the sections shipping
 * pre-split markup, for the same reason every other target is found through a
 * `data-motion` attribute: the sections stay plain server components, and the
 * page still renders its headlines as ordinary text when JavaScript never
 * arrives.
 *
 * Characters are grouped into a span per word, and only the gaps between words
 * are real whitespace. An `inline-block` may be broken from its neighbour at
 * any point, so splitting straight into characters lets a line wrap in the
 * middle of a word — "MOVEMENT" coming apart across two lines at a narrow
 * width. Nesting them inside a word that refuses to wrap confines the break
 * points to where they already were.
 *
 * The split subtree is hidden from assistive technology and the original text
 * is restated beside it, off-screen, so a screen reader reads the headline as a
 * headline rather than spelling it out one letter at a time. It is a real text
 * node rather than an `aria-label` because a bare `span` has no role for a
 * label to attach to, and naming one is not reliably honoured.
 */

/** Off-screen but still read: the accessible copy of a split headline. */
const VISUALLY_HIDDEN =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;" +
  "overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0";

/** A split element, and the means to undo it. */
export interface SplitText {
  /** The character spans, in reading order. */
  readonly chars: HTMLElement[];
  /** Restores the original markup and labelling. */
  restore(): void;
}

/**
 * Splits `element` in place.
 *
 * Returns null when there is nothing to split, so a caller can fall back to
 * animating the element whole.
 */
export function splitIntoCharacters(element: HTMLElement): SplitText | null {
  const text = element.textContent ?? "";
  if (!text.trim()) return null;

  const originalHtml = element.innerHTML;

  const chars: HTMLElement[] = [];
  const visual = document.createElement("span");
  visual.setAttribute("aria-hidden", "true");

  for (const word of text.split(/(\s+)/)) {
    if (!word) continue;

    /* Whitespace stays a text node: it is the only place a line may break. */
    if (!word.trim()) {
      visual.appendChild(document.createTextNode(word));
      continue;
    }

    const wordSpan = document.createElement("span");
    wordSpan.style.display = "inline-block";
    wordSpan.style.whiteSpace = "nowrap";

    for (const character of Array.from(word)) {
      const charSpan = document.createElement("span");
      charSpan.style.display = "inline-block";
      charSpan.textContent = character;
      wordSpan.appendChild(charSpan);
      chars.push(charSpan);
    }

    visual.appendChild(wordSpan);
  }

  if (!chars.length) return null;

  const spoken = document.createElement("span");
  spoken.setAttribute("style", VISUALLY_HIDDEN);
  spoken.textContent = text.replace(/\s+/g, " ").trim();

  element.replaceChildren(spoken, visual);

  return {
    chars,
    restore() {
      element.innerHTML = originalHtml;
    },
  };
}

/**
 * Splits several elements, keeping each one's characters in its own group.
 *
 * Grouping matters for the stagger: a headline set as four separate lines
 * should sweep along each line and step between them, not run one continuous
 * wave across a flat list that ignores where the lines actually sit.
 */
export function splitAll(elements: readonly HTMLElement[]): {
  readonly groups: HTMLElement[][];
  restore(): void;
} {
  const splits = elements.map(splitIntoCharacters).filter((split): split is SplitText => !!split);

  return {
    groups: splits.map((split) => split.chars),
    restore() {
      for (const split of splits) split.restore();
    },
  };
}
