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
  product: "h-[2.4625rem] w-[1.23125rem]",
  testimonial: "h-[2.575rem] w-[1.2875rem]",
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
      {/* The glyph carries the hover, not the button: the button is mostly hit
          area, so moving it would slide an invisible box around. */}
      <IconChevron
        className={`${direction === "next" ? "chevron-next scale-x-[-1]" : "chevron-prev"} ${GLYPH[scale]}`}
        height={undefined}
        width={undefined}
      />
    </button>
  );
}
