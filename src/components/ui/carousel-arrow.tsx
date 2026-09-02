import { IconChevron } from "@/components/ui/icons";

/**
 * Figma draws the two carousels' chevrons at slightly different sizes, so the
 * glyph box is selected rather than scaled: products 19.7x39.4, testimonials
 * 20.6x41.2. The button adds 12px of padding on every side purely as hit area —
 * callers offset their absolute placement by that amount so the *glyph* still
 * lands on the Figma x-coordinate.
 */
export const ARROW_HIT_PADDING = 12;

export type ArrowScale = "product" | "testimonial";

const GLYPH: Record<ArrowScale, string> = {
  product: "h-[39.4px] w-[19.7px]",
  testimonial: "h-[41.2px] w-[20.6px]",
};

interface CarouselArrowProps {
  readonly direction: "prev" | "next";
  readonly label: string;
  readonly scale: ArrowScale;
  readonly onClick: () => void;
  /** Absolute placement utilities against the carousel stage. */
  readonly className?: string;
}

export function CarouselArrow({ direction, label, scale, onClick, className }: CarouselArrowProps) {
  return (
    <button
      aria-label={label}
      className={`absolute z-20 grid place-items-center p-3 text-ice/70 transition-colors duration-200 ease-out hover:text-ice ${className ?? ""}`}
      onClick={onClick}
      type="button"
    >
      <IconChevron
        className={`${GLYPH[scale]} ${direction === "next" ? "scale-x-[-1]" : ""}`}
        height={undefined}
        width={undefined}
      />
    </button>
  );
}
