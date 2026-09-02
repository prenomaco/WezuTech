import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Figma lockup — node 252:447 (header) and 252:545 (footer).
 *
 * The mark and the wordmark are separate nodes with their own offsets, so they
 * are placed rather than laid out: the wordmark is a 120.772 x 62.257 window
 * onto the exported lockup PNG, and that window is baked into the asset at
 * `public/brand/wordmark-lockup.png`.
 */
/** Intrinsic pixel size of the exported assets. */
const SOURCE = {
  mark: { width: 45, height: 44 },
  word: { width: 1037, height: 536 },
} as const;

const LOCKUP = {
  header: {
    mark: { left: 0, top: 8.42, width: 44.825, height: 44.275 },
    word: { left: 51.47, top: 0, width: 120.772, height: 62.257 },
  },
  footer: {
    mark: { left: 0, top: 9.736, width: 52.575, height: 51.747 },
    word: { left: 60.364, top: 0, width: 140.201, height: 73.021 },
  },
} as const;

interface LogoProps {
  readonly href?: string;
  readonly size?: keyof typeof LOCKUP;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function Logo({ href = "#home", size = "header", className, style }: LogoProps) {
  const { mark, word } = LOCKUP[size];

  return (
    <a
      className={`relative block ${className ?? ""}`}
      style={{ ...style, width: word.left + word.width, height: word.top + word.height }}
      href={href}
      aria-label="Wezu Technologies home"
    >
      <Image
        alt=""
        className="absolute"
        height={SOURCE.mark.height}
        priority
        src="/brand/mark.svg"
        style={{ left: mark.left, top: mark.top, width: mark.width, height: mark.height }}
        width={SOURCE.mark.width}
      />
      <Image
        alt="Wezu Technologies"
        className="absolute max-w-none"
        /* Intrinsic size, not the rendered size: giving next/image the rounded
           display box makes it serve an asset whose aspect ratio no longer
           matches the source, and the browser then stretches it. */
        height={SOURCE.word.height}
        priority
        src="/brand/wordmark-lockup.png"
        style={{ left: word.left, top: word.top, width: word.width, height: word.height }}
        width={SOURCE.word.width}
      />
    </a>
  );
}
