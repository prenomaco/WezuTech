import Image from "next/image";
import { Section } from "@/components/layout/section";
import { industries, type Industry } from "@/content/site-content";

/**
 * Figma: two rows of three. Icons sit at x=136 / 566 / 958 with their text at
 * x=274 / 693 / 1091, so the columns are 430 / 392 / rest wide inside the
 * 1304px content column, offset 32px from its left edge.
 */
/* The 402 frame stacks these as six rows on a 151px pitch, each 121 tall.
   Between the two designed widths there is a tablet, where six full-width rows
   leave most of the screen empty and the eye has to travel the whole way down
   a single column; two columns there keep the same cells and simply use the
   room. */
/*
 * The three tracks are the design's, as ratios rather than lengths.
 *
 * `430fr 392fr 450fr` divides whatever the row is given in exactly the
 * proportion the frame does, so at 1512 the icons land on x=136 / 566 / 958 to
 * the pixel and at any narrower width the columns keep their relative
 * measures instead of one of them collapsing to a word per line — which is
 * what three equal columns did to the third one, and what three fixed lengths
 * did to all of them below the width they were measured at.
 */
const GRID =
  "-mx-[0.75rem] grid grid-cols-1 gap-y-[1.875rem] " +
  "sm:mx-0 sm:grid-cols-2 sm:gap-x-[1.5rem] sm:gap-y-[2rem] " +
  "lg:mx-0 lg:grid-cols-[430fr_392fr_450fr] lg:gap-x-0 lg:gap-y-[2.0625rem] lg:pl-8";

/** Every icon renders 146px tall; Figma varies the width with the artwork. */
const ICON_SLOT = "flex w-[6.3125rem] shrink-0 justify-end lg:w-[7.625rem]";

/**
 * Per-column measurements from the frame: the gap between the icon slot and
 * the copy, and the text-box width that decides where each body wraps.
 */
/*
 * The measures are given as a share of the copy's own column rather than as a
 * length, for the same reason the tracks are ratios: the frame's 241 / 242 /
 * 284 are what is left of a 430 / 392 / 450 track once the 122 icon slot and
 * the column's own gap are taken out, and stated that way they stay the design
 * at any width the row is handed.
 */
const COLUMN = [
  {
    gap: "gap-[0.8125rem] lg:gap-[1rem]",
    body: "max-w-[16.1875rem] lg:max-w-[82.53%]",
  },
  {
    gap: "gap-[0.8125rem] lg:gap-[0.3125rem]",
    body: "max-w-[16.1875rem] lg:max-w-[91.32%]",
  },
  {
    gap: "gap-[0.8125rem] lg:gap-[0.6875rem]",
    body: "max-w-[16.1875rem] lg:max-w-[89.59%]",
  },
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
const ROW_OFFSET = [
  "pt-[0.25rem] lg:pt-[0.875rem]",
  "pt-[0.25rem] lg:pt-[1.0625rem]",
] as const;

interface IndustryItemProps {
  readonly industry: Industry;
  readonly column: (typeof COLUMN)[number];
  readonly row: string;
  readonly width: number;
  readonly height: number;
}

function IndustryItem({
  industry,
  column,
  row,
  width,
  height,
}: IndustryItemProps) {
  return (
    <article
      className={`lift flex items-start ${column.gap}`}
      data-motion="industry-item"
    >
      <div className={ICON_SLOT}>
        <Image
          alt=""
          className="h-[7.5625rem] w-auto max-w-none object-contain lg:h-[9.125rem]"
          height={height}
          sizes="122px"
          src={industry.image}
          width={width}
        />
      </div>
      {/* Type is 18px throughout (nodes 252:492 bold / 252:495 book), both in
          #dafaf5 — at 16px the body wraps a word early in every column. */}
      <div className={`min-w-0 flex-1 ${row}`}>
        <h3 className="text-[1.125rem] font-bold leading-[1.5rem] text-ice">
          {industry.title}
        </h3>
        <p
          className={`mt-[0.4375rem] text-[1rem] font-book leading-[1.3125rem] text-ice lg:mt-1.5 lg:text-[1.125rem] lg:leading-[1.5rem] ${column.body}`}
        >
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
    <Section
      id="gallery"
      className="pt-[5.0625rem] pb-[2.5rem] lg:pb-[4.5625rem]"
    >
      <div className={GRID}>
        {industries.map((industry, index) => (
          <IndustryItem
            column={COLUMN[index % COLUMN.length]}
            height={ICON_NATURAL_HEIGHT}
            industry={industry}
            key={industry.title}
            row={
              ROW_OFFSET[
                Math.min(
                  Math.floor(index / COLUMN.length),
                  ROW_OFFSET.length - 1,
                )
              ]
            }
            width={ICON_NATURAL_WIDTH[industry.image] ?? 315}
          />
        ))}
      </div>
    </Section>
  );
}
