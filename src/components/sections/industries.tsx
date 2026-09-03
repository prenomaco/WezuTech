import Image from "next/image";
import { Section } from "@/components/layout/section";
import { industries, type Industry } from "@/content/site-content";

/**
 * Figma: two rows of three. Icons sit at x=136 / 566 / 958 with their text at
 * x=274 / 693 / 1091, so the columns are 430 / 392 / rest wide inside the
 * 1304px content column, offset 32px from its left edge.
 */
const GRID =
  "grid grid-cols-1 gap-y-[2rem] " +
  "lg:grid-cols-[26.875rem_24.5rem_minmax(0,1fr)] lg:gap-y-[2.0625rem] lg:pl-8";

/** Every icon renders 146px tall; Figma varies the width with the artwork. */
const ICON_SLOT = "flex w-[5.5rem] shrink-0 justify-end lg:w-[7.625rem]";

/**
 * Per-column measurements from the frame: the gap between the icon slot and
 * the copy, and the text-box width that decides where each body wraps.
 */
const COLUMN = [
  { gap: "gap-4", body: "lg:max-w-[15.0625rem]" },
  { gap: "gap-4 lg:gap-[0.3125rem]", body: "lg:max-w-[15.125rem]" },
  { gap: "gap-4 lg:gap-[0.6875rem]", body: "lg:max-w-[17.75rem]" },
] as const;

/**
 * How far the copy sits below the top of its icon, per row.
 *
 * The frame does not use one value: row one puts all three titles 14px below
 * the icon (y=2105 against icons at 2091), row two puts them 17px below
 * (y=2287 against icons at 2270). Row two's left cell is a further 6px down
 * again at 2293, on its own — that one is a stray nudge rather than a rhythm,
 * so the row follows the two cells that agree.
 */
const ROW_OFFSET = ["pt-[0.875rem]", "pt-[1.0625rem]"] as const;

interface IndustryItemProps {
  readonly industry: Industry;
  readonly column: (typeof COLUMN)[number];
  readonly row: string;
  readonly width: number;
  readonly height: number;
}

function IndustryItem({ industry, column, row, width, height }: IndustryItemProps) {
  return (
    <article className={`flex items-start ${column.gap}`} data-motion="industry-item">
      <div className={ICON_SLOT}>
        <Image
          alt=""
          className="h-[6.5rem] w-auto max-w-none object-contain lg:h-[9.125rem]"
          height={height}
          sizes="122px"
          src={industry.image}
          width={width}
        />
      </div>
      {/* Type is 18px throughout (nodes 252:492 bold / 252:495 book), both in
          #dafaf5 — at 16px the body wraps a word early in every column. */}
      <div className={row}>
        <h3 className="text-[1.125rem] font-bold leading-[1.5rem] text-ice">{industry.title}</h3>
        <p className={`mt-1.5 text-[1.125rem] font-book leading-[1.5rem] text-ice ${column.body}`}>
          {industry.body}
        </p>
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
    <Section id="gallery" className="pt-[5.0625rem] pb-[4.5625rem]">
      <div className={GRID}>
        {industries.map((industry, index) => (
          <IndustryItem
            column={COLUMN[index % COLUMN.length]}
            height={ICON_NATURAL_HEIGHT}
            industry={industry}
            key={industry.title}
            row={ROW_OFFSET[Math.min(Math.floor(index / COLUMN.length), ROW_OFFSET.length - 1)]}
            width={ICON_NATURAL_WIDTH[industry.image] ?? 315}
          />
        ))}
      </div>
    </Section>
  );
}
