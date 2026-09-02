import Image from "next/image";
import { Section } from "@/components/layout/section";
import { industries, type Industry } from "@/content/site-content";

/**
 * Figma: two rows of three. Icons sit at x=136 / 566 / 958 with their text at
 * x=274 / 693 / 1091, so the columns are 430 / 392 / rest wide inside the
 * 1304px content column, offset 32px from its left edge.
 */
const GRID = "grid grid-cols-[430px_392px_minmax(0,1fr)] gap-y-[33px] pl-8";

/** Every icon renders 146px tall; Figma varies the width with the artwork. */
const ICON_SLOT = "flex w-[122px] shrink-0 justify-end";

/**
 * Per-column measurements from the frame: the gap between the icon slot and
 * the copy, and the text-box width that decides where each body wraps.
 */
const COLUMN = [
  { gap: "gap-4", body: "max-w-[241px]" },
  { gap: "gap-[5px]", body: "max-w-[242px]" },
  { gap: "gap-[11px]", body: "max-w-[284px]" },
] as const;

interface IndustryItemProps {
  readonly industry: Industry;
  readonly column: (typeof COLUMN)[number];
  readonly width: number;
  readonly height: number;
}

function IndustryItem({ industry, column, width, height }: IndustryItemProps) {
  return (
    <article className={`flex items-start ${column.gap}`} data-motion="industry-item">
      <div className={ICON_SLOT}>
        <Image
          alt=""
          className="h-[146px] w-auto max-w-none object-contain"
          height={height}
          sizes="122px"
          src={industry.image}
          width={width}
        />
      </div>
      {/* Titles sit 14px below the top of the icon in the Figma frame. */}
      <div className="pt-[14px]">
        <h3 className="text-base font-semibold leading-[1.5] text-ice">{industry.title}</h3>
        <p className={`mt-1.5 text-base leading-[1.5] text-mist ${column.body}`}>{industry.body}</p>
      </div>
    </article>
  );
}

/** Natural pixel sizes of the source artwork, so next/image can reserve space. */
const ICON_NATURAL_HEIGHT = 377;
const ICON_NATURAL_WIDTH: Record<string, number> = {
  "/industry/automotive.png": 315,
  "/industry/marine.png": 315,
  "/industry/agriculture-mining.png": 315,
  "/industry/locomotive.png": 299,
  "/industry/special-purpose.png": 299,
  "/industry/aerospace-uav.png": 281,
};

export function Industries() {
  return (
    <Section id="gallery" zone="industries" className="pt-[81px] pb-[73px]">
      <div className={GRID}>
        {industries.map((industry, index) => (
          <IndustryItem
            column={COLUMN[index % COLUMN.length]}
            height={ICON_NATURAL_HEIGHT}
            industry={industry}
            key={industry.title}
            width={ICON_NATURAL_WIDTH[industry.image] ?? 315}
          />
        ))}
      </div>
    </Section>
  );
}
