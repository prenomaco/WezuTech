/**
 * The six application areas, as one definition.
 *
 * These are the cells of the home page's industries section, the cards on
 * `/products`, the category pages themselves, and the rows seeded into the
 * `Category` table that products are tagged against. Stating them once keeps
 * the copy on the marketing page and the taxonomy in the database from
 * drifting apart — a seventh category means one entry here plus its artwork,
 * and every surface picks it up.
 *
 * `imageWidth` is the artwork's natural width at the shared 377px height, so
 * `next/image` can reserve the right box before the file arrives; the icons
 * are not all the same shape.
 */
export interface ProductCategory {
  readonly slug: string;
  readonly title: string;
  readonly body: string;
  readonly image: string;
  readonly imageWidth: number;
}

/** Every icon renders at this height; Figma varies the width with the artwork. */
export const CATEGORY_IMAGE_HEIGHT = 377;

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  {
    slug: "automotive",
    title: "Automotive",
    body: "Innovative control systems and electronics to enhance vehicle performance and safety.",
    image: "/industry/automotive.png",
    imageWidth: 315,
  },
  {
    slug: "marine",
    title: "Marine Applications",
    body: "Durable electronics built for marine environments, ensuring operational excellence.",
    image: "/industry/marine.png",
    imageWidth: 315,
  },
  {
    slug: "agriculture-mining",
    title: "Agriculture & Mining",
    body: "Reliable electronic solutions improving efficiency, safety, and productivity in demanding conditions.",
    image: "/industry/agriculture-mining.png",
    imageWidth: 315,
  },
  {
    slug: "locomotive",
    title: "Locomotive",
    body: "Reliable electronic solutions designed for optimal performance in rail transport.",
    image: "/industry/locomotive.png",
    imageWidth: 299,
  },
  {
    slug: "special-purpose-vehicles",
    title: "Special Purpose Vehicles",
    body: "Tailored technology solutions for unique mobility and specialized vehicle needs.",
    image: "/industry/special-purpose.png",
    imageWidth: 299,
  },
  {
    slug: "aerospace-uav",
    title: "Aerospace and UAV",
    body: "High-performance electronic systems built for safety, reliability, and demanding aviation applications.",
    image: "/industry/aerospace-uav.png",
    imageWidth: 281,
  },
];

/**
 * `/products/[slug]` already owns the product detail route, so category pages
 * cannot also be `/products/[category]` — the two would be the same segment.
 */
export function categoryPath(slug: string) {
  return `/products/category/${slug}`;
}

export function findProductCategory(slug: string) {
  return PRODUCT_CATEGORIES.find((category) => category.slug === slug);
}
