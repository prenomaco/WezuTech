import { z } from "zod";

/**
 * A product's words, as one object.
 *
 * The dashboard's product form is thirty-odd fields spread over seven cards,
 * and most of what an editor actually wants to do to a live product — tighten
 * the introduction, rewrite six feature blurbs, add four specification rows —
 * is a writing job, not a form-filling job. This is the same content as one
 * JSON document, so it can be handed to a language model with "rewrite this
 * for a marine audience" and pasted back whole.
 *
 * Two things are deliberately absent.
 *
 * Images and the datasheet are not here. A picture cannot survive a round trip
 * through a chat window, and a model asked to edit content should not be in a
 * position to invent a Cloudinary URL: uploads stay their own controls, and
 * the JSON carries only what is safe to rewrite. The `id` is not here either —
 * which product is being saved is decided by the page you are on, never by the
 * payload, so a pasted document cannot retarget the save.
 *
 * The module holds zod and nothing else on purpose: both the client form and
 * the server action read it, and importing anything that reaches Prisma would
 * drag the database client into the browser bundle.
 */

/* The limits are `productInputSchema`'s, restated. A round trip that parses
   here is one that will parse on save, so the editor learns about an
   over-long blurb while the text is still in front of them rather than as a
   server error after pressing Save. */
const line = (max: number) => z.string().trim().max(max).default("");

const metricSchema = z.object({ value: line(80), label: line(120) });
const contentItemSchema = z.object({ title: line(160), body: line(1200) });
const featureItemSchema = contentItemSchema.extend({ icon: line(60) });
const specificationSchema = z.object({ specification: line(120), details: line(300) });

/*
 * `prefault`, not `default`.
 *
 * zod 4 changed `.default()` to short-circuit: given `undefined` it hands back
 * the literal value without running the schema, so `.default({})` on a group
 * whose fields all have defaults yields `{}` and every field inside it comes
 * back missing. `.prefault()` is the one that feeds the value through parsing,
 * which is what a JSON document omitting a whole section needs.
 */
const group = <T extends z.ZodObject>(schema: T) => schema.prefault({} as z.input<T>);

/** Accepts `"published"` as readily as `"PUBLISHED"`; models rarely shout. */
const statusSchema = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim().toUpperCase() : value),
    z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  )
  .default("DRAFT");

export const productJsonSchema = z.object({
  name: line(120),
  slug: line(160),
  status: statusSchema,
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  /* Slugs, lower-cased on the way in: a category the document names but the
     site does not define is dropped on save rather than created. */
  categories: z
    .array(z.string().trim().toLowerCase().max(80))
    .max(12)
    .default([]),
  cardDescription: line(2000),
  hero: group(
    z.object({
      tagline: line(200),
      introduction: line(5000),
      metrics: z.array(metricSchema).max(12).default([]),
    }),
  ),
  overview: group(
    z.object({
      title: line(160),
      intro: line(2000),
      items: z.array(contentItemSchema).max(12).default([]),
    }),
  ),
  features: group(
    z.object({ title: line(160), items: z.array(featureItemSchema).max(20).default([]) }),
  ),
  applications: group(
    z.object({ title: line(160), items: z.array(contentItemSchema).max(20).default([]) }),
  ),
  specifications: group(
    z.object({
      title: line(160),
      note: line(500),
      items: z.array(specificationSchema).max(30).default([]),
    }),
  ),
  cta: group(z.object({ quoteLabel: line(60), datasheetLabel: line(60) })),
  seo: group(z.object({ title: line(70), description: line(160) })),
});

export type ProductJson = z.infer<typeof productJsonSchema>;

/** The headings a product falls back to when nothing has been written yet. */
export const PRODUCT_JSON_DEFAULTS = {
  overviewTitle: "Built for connected public charging.",
  featuresTitle: "Key Features",
  applicationsTitle: "Applications",
  specificationsTitle: "Technical Specifications",
  specificationsNote: "Specifications vary by product configuration",
  quoteLabel: "Request a Quote",
  datasheetLabel: "Download Datasheet",
} as const;

const string = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : fallback;

const array = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/**
 * Builds the document from loose parts without validating any of it.
 *
 * Used for the two directions that must never fail: seeding the editor from a
 * product that is already in the database, and re-reading the form the moment
 * someone switches tabs mid-sentence. A half-written field is not an error
 * here — it is just what the form currently says.
 */
export function assembleProductJson(raw: {
  readonly name?: unknown;
  readonly slug?: unknown;
  readonly status?: unknown;
  readonly sortOrder?: unknown;
  readonly categories?: unknown;
  readonly cardDescription?: unknown;
  readonly tagline?: unknown;
  readonly introduction?: unknown;
  readonly metrics?: unknown;
  readonly overviewTitle?: unknown;
  readonly overviewIntro?: unknown;
  readonly overviewItems?: unknown;
  readonly featuresTitle?: unknown;
  readonly features?: unknown;
  readonly applicationsTitle?: unknown;
  readonly applications?: unknown;
  readonly specificationsTitle?: unknown;
  readonly specificationsNote?: unknown;
  readonly specifications?: unknown;
  readonly quoteLabel?: unknown;
  readonly datasheetLabel?: unknown;
  readonly seoTitle?: unknown;
  readonly seoDescription?: unknown;
}): ProductJson {
  const status = string(raw.status, "DRAFT").toUpperCase();
  return {
    name: string(raw.name),
    slug: string(raw.slug),
    status: (status === "PUBLISHED" || status === "ARCHIVED" ? status : "DRAFT") as ProductJson["status"],
    sortOrder: Number.parseInt(string(raw.sortOrder, "0"), 10) || 0,
    categories: array(raw.categories).map((value) => string(value).toLowerCase()).filter(Boolean),
    cardDescription: string(raw.cardDescription),
    hero: {
      tagline: string(raw.tagline),
      introduction: string(raw.introduction),
      metrics: array(raw.metrics).map((item) => {
        const row = record(item);
        return { value: string(row.value), label: string(row.label) };
      }),
    },
    overview: {
      title: string(raw.overviewTitle, PRODUCT_JSON_DEFAULTS.overviewTitle),
      intro: string(raw.overviewIntro),
      items: array(raw.overviewItems).map(contentItem),
    },
    features: {
      title: string(raw.featuresTitle, PRODUCT_JSON_DEFAULTS.featuresTitle),
      items: array(raw.features).map((item) => ({ ...contentItem(item), icon: string(record(item).icon) })),
    },
    applications: {
      title: string(raw.applicationsTitle, PRODUCT_JSON_DEFAULTS.applicationsTitle),
      items: array(raw.applications).map(contentItem),
    },
    specifications: {
      title: string(raw.specificationsTitle, PRODUCT_JSON_DEFAULTS.specificationsTitle),
      note: string(raw.specificationsNote, PRODUCT_JSON_DEFAULTS.specificationsNote),
      items: array(raw.specifications).map((item) => {
        const row = record(item);
        return { specification: string(row.specification), details: string(row.details) };
      }),
    },
    cta: {
      quoteLabel: string(raw.quoteLabel, PRODUCT_JSON_DEFAULTS.quoteLabel),
      datasheetLabel: string(raw.datasheetLabel, PRODUCT_JSON_DEFAULTS.datasheetLabel),
    },
    seo: { title: string(raw.seoTitle), description: string(raw.seoDescription) },
  };
}

function contentItem(item: unknown) {
  const row = record(item);
  return { title: string(row.title), body: string(row.body) };
}

/**
 * Strips what a chat window adds around an answer.
 *
 * Models fence JSON in triple backticks about half the time, often with a
 * `json` label on the opening fence, and refusing a paste for that is a poor
 * way to spend an editor's afternoon. Anything before the first brace and
 * after the last is discarded too, which covers the "Here's the updated
 * JSON:" preamble.
 */
export function stripJsonFence(raw: string): string {
  const trimmed = raw.trim().replace(/^```(?:json|jsonc)?\s*/i, "").replace(/```$/, "").trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  return first >= 0 && last > first ? trimmed.slice(first, last + 1) : trimmed;
}

export type ProductJsonResult =
  | { readonly ok: true; readonly value: ProductJson }
  | { readonly ok: false; readonly error: string };

/**
 * Parses a pasted document, reporting the first few problems in the editor's
 * own vocabulary — `specifications.items.3.details` rather than a zod dump.
 */
export function parseProductJson(raw: string): ProductJsonResult {
  if (!raw.trim()) return { ok: false, error: "Nothing to read yet — paste the product JSON here." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(raw));
  } catch (error) {
    return {
      ok: false,
      error: `That is not valid JSON. ${error instanceof Error ? error.message : ""}`.trim(),
    };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "Expected a single JSON object describing one product." };
  }
  const result = productJsonSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 4)
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
    const extra = result.error.issues.length - issues.length;
    return { ok: false, error: issues.join(" · ") + (extra > 0 ? ` · and ${extra} more` : "") };
  }
  return { ok: true, value: result.data };
}

/** Two-space JSON, keys in the order the form asks for them. */
export function formatProductJson(value: ProductJson): string {
  return JSON.stringify(
    {
      name: value.name,
      slug: value.slug,
      status: value.status,
      sortOrder: value.sortOrder,
      categories: value.categories,
      cardDescription: value.cardDescription,
      hero: value.hero,
      overview: value.overview,
      features: value.features,
      applications: value.applications,
      specifications: value.specifications,
      cta: value.cta,
      seo: value.seo,
    },
    null,
    2,
  );
}

/** A row an editor left blank is a row they did not mean to add. */
const filled = (...parts: readonly string[]) => parts.some((part) => part.trim().length > 0);

/**
 * Flattens the document onto the field names `productInputSchema` expects, so
 * a saved JSON product and a saved form product are the same write.
 *
 * Blank rows are dropped rather than rejected: the item schemas require both
 * halves of a pair, and an empty object left at the end of a list is the most
 * ordinary thing for a model to produce.
 */
export function productJsonToInput(value: ProductJson) {
  return {
    name: value.name,
    slug: value.slug,
    status: value.status,
    sortOrder: value.sortOrder,
    categorySlugs: value.categories,
    cardDescription: value.cardDescription || undefined,
    tagline: value.hero.tagline || undefined,
    introduction: value.hero.introduction || undefined,
    metrics: value.hero.metrics.filter((item) => filled(item.value, item.label)),
    overviewTitle: value.overview.title || undefined,
    overviewIntro: value.overview.intro || undefined,
    overviewItems: value.overview.items.filter((item) => filled(item.title, item.body)),
    featuresTitle: value.features.title || undefined,
    features: value.features.items.filter((item) => filled(item.title, item.body)),
    applicationsTitle: value.applications.title || undefined,
    applications: value.applications.items.filter((item) => filled(item.title, item.body)),
    specificationsTitle: value.specifications.title || undefined,
    specificationsNote: value.specifications.note || undefined,
    specifications: value.specifications.items.filter((item) => filled(item.specification, item.details)),
    cta: {
      quoteLabel: value.cta.quoteLabel || PRODUCT_JSON_DEFAULTS.quoteLabel,
      datasheetLabel: value.cta.datasheetLabel || PRODUCT_JSON_DEFAULTS.datasheetLabel,
    },
    seoTitle: value.seo.title || undefined,
    seoDescription: value.seo.description || undefined,
  };
}

/**
 * A complete product, shown to an assistant as a worked example.
 *
 * Adding a product copies out an empty skeleton, and an empty skeleton teaches
 * a model the key names and nothing else: it does not say that `hero.metrics`
 * wants "150 kW" and not "very fast", that `cardDescription` is two
 * paragraphs, or that a specification row is a property and a value rather
 * than a sentence. This is a product that does not exist, written the way the
 * catalogue is written, so the shape and the register both come across.
 *
 * The `icon` keys are real entries in `icon-library.ts`. They are here so the
 * model can see the field is a short lower-case name rather than an emoji or a
 * component, not so that it invents its own — the prompt tells it to leave
 * them alone.
 */
export const EXAMPLE_PRODUCT_JSON = formatProductJson(
  productJsonSchema.parse({
    name: "Depot Charging Column",
    slug: "depot-charging-column",
    status: "PUBLISHED",
    sortOrder: 2,
    categories: ["ev-charging"],
    cardDescription:
      "A dual-outlet AC column for fleet yards and staff car parks, rated for continuous overnight duty in the open.\n\nBuilt for sites that charge a whole fleet between shifts: two vehicles at once, load shared across the yard, and a housing that survives a winter outdoors.",
    hero: {
      tagline: "Two vehicles, one footprint, every night.",
      introduction:
        "The Depot Charging Column delivers up to 22 kW to each of two outlets from a single grid connection, sharing the available supply across the yard so a site can add vehicles without adding capacity. The housing is sealed to IP55 and finished for coastal air.",
      metrics: [
        { value: "22 kW", label: "Per outlet" },
        { value: "2", label: "Vehicles at once" },
        { value: "IP55", label: "Sealed housing" },
      ],
    },
    overview: {
      title: "Built for the hours a fleet is standing still.",
      intro:
        "Depot charging is a scheduling problem before it is a power problem. The column is designed around that: it shares what the site has, reports what it did, and asks nothing of the driver beyond plugging in.",
      items: [
        {
          title: "Dynamic load sharing",
          body: "Columns on the same feed negotiate their draw between them, so the yard stays inside its supply limit without a vehicle being left uncharged.",
        },
        {
          title: "Scheduled charging",
          body: "Sessions can be held back to the cheapest hours of the night and still finish before the first shift.",
        },
        {
          title: "Serviceable in place",
          body: "The electronics tray withdraws from the front of the column, so a swap needs one engineer and no crane.",
        },
      ],
    },
    features: {
      title: "Key Features",
      items: [
        { title: "Dual Type 2 outlets", body: "Two independent 22 kW sockets, each with its own metering and RCD.", icon: "plug-charging" },
        { title: "RFID access", body: "Drivers present a card; sessions are logged against the vehicle and the driver.", icon: "identification-card" },
        { title: "MID metering", body: "Billing-grade measurement per outlet, for recharging costs to departments or tenants.", icon: "gauge" },
        { title: "OCPP 1.6J", body: "Connects to any compliant back office over the site's own network or the built-in modem.", icon: "broadcast" },
        { title: "Convection cooled", body: "No fans and no filters, which is one fewer service item on an outdoor asset.", icon: "wind" },
        { title: "Marine-grade finish", body: "Powder-coated 316 stainless, tested to 720 hours of salt spray.", icon: "shield-check" },
      ],
    },
    applications: {
      title: "Applications",
      items: [
        { title: "Fleet depots", body: "Overnight charging for vans and light trucks returning to a single yard." },
        { title: "Workplace car parks", body: "Shared charging for staff vehicles, billed back by department." },
        { title: "Residential developments", body: "Allocated bays in apartment car parks, metered per resident." },
      ],
    },
    specifications: {
      title: "Technical Specifications",
      note: "Specifications vary by product configuration",
      items: [
        { specification: "Rated output", details: "22 kW per outlet, 44 kW total" },
        { specification: "Supply", details: "400 V three phase, 32 A per outlet" },
        { specification: "Connector", details: "Two Type 2 sockets, shuttered" },
        { specification: "Protection", details: "IP55, IK10" },
        { specification: "Operating temperature", details: "-25 °C to +50 °C" },
        { specification: "Communications", details: "Ethernet, Wi-Fi, 4G modem" },
        { specification: "Protocol", details: "OCPP 1.6J, OCPP 2.0.1 ready" },
        { specification: "Dimensions", details: "1500 x 300 x 220 mm" },
      ],
    },
    cta: { quoteLabel: "Request a Quote", datasheetLabel: "Download Datasheet" },
    seo: {
      title: "Depot Charging Column | Wezu Technologies",
      description:
        "A dual-outlet 22 kW AC charging column for fleet depots and workplace car parks, with dynamic load sharing and MID metering.",
    },
  }),
);
