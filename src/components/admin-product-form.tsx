"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Product, ProductMedia, ProductSection } from "@prisma/client";
import { useFormStatus } from "react-dom";
import {
  BracketsCurlyIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  SlidersHorizontalIcon,
  SparkleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import { saveProduct } from "@/app/admin/actions";
import { Button, Input, Label, Select, Textarea } from "@/components/dashboard/ui";
import { IconPicker } from "@/components/dashboard/icon-picker";
import {
  GalleryUpload,
  MediaUpload,
  type GalleryImage,
  type MediaValue,
} from "@/components/media-upload";
import {
  assembleProductJson,
  EXAMPLE_PRODUCT_JSON,
  formatProductJson,
  parseProductJson,
  type ProductJson,
} from "@/lib/product-json";

type Pair = { title: string; body: string; icon: string };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function Field({
  children,
  label,
  hint,
  wide,
}: {
  readonly children: React.ReactNode;
  readonly label: string;
  /** A line under the label, for fields whose effect is not obvious. */
  readonly hint?: string;
  readonly wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {hint ? <span className="-mt-1 text-xs text-[var(--dash-muted)]">{hint}</span> : null}
      {children}
    </label>
  );
}

/**
 * One group of the form, with a caption saying where the fields inside it
 * actually land on the live product page — the form has no visual
 * relationship to the page it edits otherwise, and that gap was most of why
 * nine similar-looking upload fields and six similar-looking list editors
 * read as one undifferentiated wall.
 *
 * A card, not a `<details>`. Collapsed sections made sense when every product
 * rendered a form on the index page and they all had to be folded away; on a
 * page of its own the form should show its work, and a section you have to
 * open is a field you can forget to fill in.
 */
function FormSection({
  title,
  whereItAppears,
  children,
}: {
  readonly title: string;
  readonly whereItAppears: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
      <div className="border-b border-[var(--dash-border)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--dash-fg)]">{title}</h2>
        <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{whereItAppears}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function dataObject(section: ProductSection | undefined): Record<string, unknown> {
  if (!section || !section.data || Array.isArray(section.data) || typeof section.data !== "object") return {};
  return section.data as Record<string, unknown>;
}

function itemArray(section: ProductSection | undefined): Pair[] {
  const source = Array.isArray(section?.data) ? section.data : dataObject(section).items;
  if (!Array.isArray(source)) return [];
  return source.map((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      title: String(row.title ?? row.value ?? row.specification ?? ""),
      body: String(row.body ?? row.label ?? row.details ?? ""),
      icon: String(row.icon ?? ""),
    };
  });
}

/**
 * A key:value list (metrics, features, specification rows, …) as a stack of
 * numbered cards rather than a grid of near-identical rows — each one reads
 * as "item 3 of the Key Features list", not as an anonymous table line.
 */
function PairEditor({ name, title, firstLabel, secondLabel, initial, withIcons = false }: { readonly name: string; readonly title: string; readonly firstLabel: string; readonly secondLabel: string; readonly initial: Pair[]; readonly withIcons?: boolean }) {
  const [items, setItems] = useState<Pair[]>(initial);
  const payload = items.map(({ title: first, body: second, icon }) => name === "metrics" ? { value: first, label: second } : name === "specifications" ? { specification: first, details: second } : withIcons ? { title: first, body: second, icon } : { title: first, body: second });
  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-semibold">{title}</span>
      <input name={name} type="hidden" value={JSON.stringify(payload)} />
      <div className="mt-2 flex flex-col gap-2">
        {items.map((item, index) => (
          <div className="flex gap-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-subtle)] p-3" key={`${name}-${index}`}>
            {/* For features, the glyph the public page draws above the
                feature replaces the row number: the number was only ever a
                position marker, and the icon says which row this is far
                better than "#3" did. */}
            {withIcons ? (
              <IconPicker
                label={`${firstLabel} ${index + 1} icon`}
                name=""
                onChange={(next) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, icon: next } : row))}
                value={item.icon}
                variant="compact"
              />
            ) : (
              <span className="mt-2 shrink-0 text-xs font-medium text-[var(--dash-muted)]">#{index + 1}</span>
            )}
            <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
              <Input aria-label={`${firstLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} placeholder={firstLabel} value={item.title} />
              <Textarea aria-label={`${secondLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, body: event.target.value } : row))} placeholder={secondLabel} rows={2} value={item.body} />
            </div>
            <Button className="mt-0.5 self-start" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))} type="button" variant="outline">Remove</Button>
          </div>
        ))}
        <Button className="self-start" onClick={() => setItems((current) => [...current, { title: "", body: "", icon: "" }])} type="button" variant="outline">
          Add {items.length ? "another" : "a"} row
        </Button>
      </div>
    </div>
  );
}

/**
 * Which product families this product belongs to.
 *
 * Checkboxes rather than a `<select multiple>`: a handful of categories all
 * fit on screen, and a multi-select requires the reader to know to hold a
 * modifier key. A product genuinely belongs to several — a DC fast charger is
 * charging hardware, power electronics and thermal management at once — which
 * is why the join is many-to-many rather than a column.
 *
 * The options come from the database, so adding a family in Categories makes
 * it selectable here with no code change.
 */
function CategoryPicker({
  selected,
  options,
}: {
  readonly selected: readonly string[];
  readonly options: readonly { slug: string; name: string }[];
}) {
  const [chosen, setChosen] = useState<readonly string[]>(selected);

  if (!options.length) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--dash-border-strong)] p-4 text-xs text-[var(--dash-muted)] sm:col-span-2">
        No categories yet. Add them under Categories and they will appear here.
      </p>
    );
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-semibold text-[var(--dash-fg)]">Categories</legend>
      <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
        Decides which category pages list this product. Leaving all of them clear hides it from
        every category page, though it still shows in the full catalogue.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((category) => {
          const active = chosen.includes(category.slug);
          return (
            <label
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "border-[var(--dash-primary)] bg-[rgb(9_133_204/0.12)] text-[var(--dash-fg)]"
                  : "border-[var(--dash-border)] text-[var(--dash-muted)] hover:bg-[var(--dash-subtle)]"
              }`}
              key={category.slug}
            >
              <input
                checked={active}
                className="size-4 accent-[var(--dash-primary)]"
                name="categorySlugs"
                onChange={(event) =>
                  setChosen((current) =>
                    event.target.checked
                      ? [...current, category.slug]
                      : current.filter((slug) => slug !== category.slug),
                  )
                }
                type="checkbox"
                value={category.slug}
              />
              {category.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Sticky, so Save is reachable without scrolling to the end of a long form. */
function SaveBar({ isNew, blocked }: { readonly isNew: boolean; readonly blocked?: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--dash-border-strong)] bg-[var(--dash-bg)]/95 px-6 py-4 backdrop-blur lg:-mx-10 lg:px-10">
      {/* Why Save is off, on the same line as Save. A disabled button with its
          reason three cards further up is a dead end. */}
      {blocked ? (
        <p className="mr-auto flex items-center gap-1.5 text-xs text-[var(--dash-status-danger)]">
          <WarningCircleIcon aria-hidden className="size-3.5 shrink-0" />
          {blocked}
        </p>
      ) : null}
      <Link
        className="inline-flex h-10 items-center rounded-lg border border-[var(--dash-border-strong)] px-4 text-sm font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)]"
        href="/admin/products"
      >
        Cancel
      </Link>
      <Button className="h-10 px-5" disabled={pending || Boolean(blocked)} type="submit">
        {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
      </Button>
    </div>
  );
}

/** Copies a string, and says so for a couple of seconds. */
function CopyButton({
  children,
  className = "",
  getText,
  title,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly getText: () => string;
  readonly title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard access is denied over plain HTTP and in some embedded
         browsers. Nothing is lost — the text is visible in the editor below
         and can be selected by hand — so this says nothing rather than
         throwing an error at someone who only wanted a shortcut. */
    }
  }

  return (
    <button
      className={
        "inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--dash-border-strong)] px-3 " +
        "text-sm font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)] " +
        className
      }
      onClick={copy}
      title={title}
      type="button"
    >
      {copied ? (
        <CheckIcon aria-hidden className="size-4 text-[var(--dash-status-success)]" />
      ) : (
        <CopyIcon aria-hidden className="size-4" />
      )}
      {copied ? "Copied" : children}
    </button>
  );
}

/**
 * What to say to a language model, above the document itself.
 *
 * The point of the JSON tab is that a client can hand this to an assistant and
 * get usable JSON back, and the three ways that goes wrong are all worth a few
 * lines of prose to prevent: a model that answers in prose, a model that
 * helpfully renames or reorders the keys, and — on a brand new product, where
 * the document copied out is an empty skeleton — a model with no idea what any
 * of these fields is for or what good copy for one looks like. So the block
 * carries a field-by-field guide and a filled-in example alongside the
 * document itself, and says outright which of the two is the thing to edit.
 */
function llmPrompt(json: string, {
  categories,
  isNew,
}: {
  readonly categories: readonly { slug: string; name: string }[];
  readonly isNew: boolean;
}) {
  const categoryList = categories.length
    ? categories.map((category) => `"${category.slug}" (${category.name})`).join(", ")
    : "none are defined yet — leave this array empty";

  return [
    isNew
      ? "I am adding a new product to the Wezu Technologies website. Below is the empty template it uses, a guide to every field, and a filled-in example of a different product so you can see the house style."
      : "I am updating a product on the Wezu Technologies website. Below is its current content as JSON, a guide to every field, and a filled-in example of a different product so you can see the house style.",
    "",
    "WHAT I WANT",
    isNew
      ? "Fill the template in for: <describe the product here — what it is, who it is for, the numbers that matter>"
      : "<describe your change here — for example: rewrite this for marine installers, or add four specification rows about the cooling loop>",
    "",
    "HOW TO REPLY",
    "- Reply with one JSON object and nothing else. No greeting, no explanation, no code fences.",
    "- Use exactly the keys shown. Do not add, rename, remove or reorder any of them.",
    "- Every key must be present, even when its value is an empty string or an empty array.",
    "- Write in British English, in a plain, factual, engineering register. No marketing superlatives.",
    "- Do not invent image or file URLs. Pictures and the datasheet are handled outside this JSON.",
    "- Leave anything I have not asked you to change exactly as it is.",
    "",
    "WHAT EACH FIELD IS",
    "name                  The product's name, as the page heading shows it.",
    "slug                  Its web address: lower-case words joined by hyphens, no spaces. Keep it unchanged unless I ask for a new address.",
    `status                One of "DRAFT", "PUBLISHED" or "ARCHIVED".`,
    "sortOrder             Where it sits in the home page carousel. A whole number; 0 comes first.",
    `categories            Which family pages list it. Use only these slugs: ${categoryList}.`,
    "cardDescription       The catalogue card. Two short paragraphs — what it is, then what it is for — separated by a blank line. Under 2000 characters.",
    "hero.tagline          One line under the product name at the top of the page.",
    "hero.introduction     The opening paragraph. Two or three sentences.",
    `hero.metrics          The stat boxes at the top; the first 3 are shown. "value" is the figure ("150 kW"), "label" names it ("Peak output"). Keep both short.`,
    "overview.title        Heading of the panel below the hero. A full sentence works well here."
      + (isNew
        ? " The template's current value is left over from another product — replace it."
        : ""),
    "overview.intro        One short paragraph introducing that panel.",
    `overview.items        The benefits listed in it. "title" is two to four words; "body" is one or two sentences.`,
    "features.title        Heading of the icon grid.",
    `features.items        The first 6 are shown. "icon" names a glyph from our fixed library — keep the ones already there, and use "" for any row you add.`,
    "applications.title    Heading of the photo section.",
    "applications.items    The first 3 are shown; each one pairs with a photograph uploaded separately.",
    "specifications.title  Heading of the technical table.",
    "specifications.note   The small disclaimer under that heading.",
    `specifications.items  The table rows. "specification" is the property ("Peak output"), "details" is the value ("150 kW"). Under 300 characters each.`,
    "cta.quoteLabel        Label on the enquiry button.",
    "cta.datasheetLabel    Label on the datasheet button.",
    "seo.title             Search-result title. Up to 70 characters.",
    "seo.description       Search-result description. Up to 160 characters.",
    "",
    "A FILLED-IN EXAMPLE — this is a different product, for reference only. Do not return this.",
    EXAMPLE_PRODUCT_JSON,
    "",
    isNew ? "THE TEMPLATE TO FILL IN — return this, filled in." : "THE PRODUCT TO UPDATE — return this, edited.",
    json,
  ].join("\n");
}

/** The tab strip. Two ways into the same product, not two kinds of product. */
function ModeTabs({
  mode,
  onSelect,
}: {
  readonly mode: Mode;
  readonly onSelect: (next: Mode) => void;
}) {
  const tab = (value: Mode) =>
    "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors " +
    (mode === value
      ? "bg-[rgb(9_133_204/0.18)] text-[var(--dash-fg)] shadow-[inset_0_0_0_1px_rgb(9_133_204/0.45)]"
      : "text-[var(--dash-muted)] hover:text-[var(--dash-fg)]");

  return (
    <div
      aria-label="How to edit this product"
      className="inline-flex gap-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-subtle)] p-1"
      role="tablist"
    >
      <button
        aria-selected={mode === "form"}
        className={tab("form")}
        onClick={() => onSelect("form")}
        role="tab"
        type="button"
      >
        <SlidersHorizontalIcon aria-hidden className="size-4" />
        Fill in the form
      </button>
      <button
        aria-selected={mode === "json"}
        className={tab("json")}
        onClick={() => onSelect("json")}
        role="tab"
        type="button"
      >
        <BracketsCurlyIcon aria-hidden className="size-4" />
        Paste JSON
      </button>
    </div>
  );
}

type Mode = "form" | "json";

type MediaSlot = "hero" | "detail" | "datasheet" | "applicationOne" | "applicationTwo" | "applicationThree";

type MediaState = Record<MediaSlot, MediaValue> & { readonly gallery: readonly GalleryImage[] };

const EMPTY_MEDIA: MediaValue = { url: "", publicId: "" };

/**
 * The product's pictures and datasheet, as hidden fields.
 *
 * Rendered once at the root of the form rather than beside each upload
 * control, because the controls themselves appear on both tabs and only one
 * tab is mounted at a time. Keeping the fields here means the names post
 * exactly once whichever tab is open, and an image uploaded on one tab is
 * still there on the other.
 */
function MediaFields({ media }: { readonly media: MediaState }) {
  const slots: readonly (readonly [string, MediaValue])[] = [
    ["heroUrl", media.hero],
    ["detailUrl", media.detail],
    ["applicationOneUrl", media.applicationOne],
    ["applicationTwoUrl", media.applicationTwo],
    ["applicationThreeUrl", media.applicationThree],
    ["datasheetUrl", media.datasheet],
  ];
  /*
   * `Fragment`, not a wrapping element.
   *
   * The form is a flex column, and a `<span>` around each pair was a flex item
   * of its own: seven of them stacked up seven `gap-4` rows of nothing between
   * the page heading and the first card, which is where the empty band at the
   * top of the form came from. A hidden input is `display: none` and takes no
   * part in the layout, so with the wrappers gone the gap goes too.
   */
  return (
    <>
      {slots.map(([name, value]) => (
        <Fragment key={name}>
          <input name={name} type="hidden" value={value.url} />
          <input name={`${name}PublicId`} type="hidden" value={value.publicId} />
        </Fragment>
      ))}
      <input name="gallery" type="hidden" value={JSON.stringify(media.gallery)} />
    </>
  );
}

export function AdminProductForm({
  product,
  media = [],
  sections = [],
  categorySlugs = [],
  categoryOptions,
}: {
  readonly product?: Product;
  readonly media?: ProductMedia[];
  readonly sections?: ProductSection[];
  readonly categorySlugs?: readonly string[];
  readonly categoryOptions: readonly { slug: string; name: string }[];
}) {
  const findSection = (type: ProductSection["type"]) => sections.find((section) => section.type === type);
  const findMedia = (kind: ProductMedia["kind"], index = 0) => media.filter((item) => item.kind === kind).sort((a, b) => a.sortOrder - b.sortOrder)[index];
  const isNew = !product;

  /*
   * The product as it stands in the database, as one JSON document.
   *
   * Both editors read from this: the form uses it for its `defaultValue`s and
   * the JSON tab shows it as text, so whichever tab you open first is showing
   * the same product rather than its own idea of one.
   */
  const saved = useMemo<ProductJson>(() => {
    const overview = findSection("BENEFITS");
    const specifications = findSection("SPECIFICATIONS");
    const cta = dataObject(findSection("CTA"));
    return assembleProductJson({
      name: product?.name,
      slug: product?.slug,
      status: product?.status,
      sortOrder: product?.sortOrder,
      categories: categorySlugs,
      cardDescription: product?.cardDescription,
      tagline: product?.tagline,
      introduction: product?.introduction,
      /* Through `itemArray` so the seed data's older shapes — a bare array, a
         `label` where the editor now writes `body` — still land in the right
         halves of each pair. */
      metrics: itemArray(findSection("METRICS")).map((pair) => ({ value: pair.title, label: pair.body })),
      overviewTitle: overview?.title,
      overviewIntro: dataObject(overview).intro,
      overviewItems: itemArray(overview),
      featuresTitle: findSection("FEATURES")?.title,
      features: itemArray(findSection("FEATURES")),
      applicationsTitle: findSection("ENVIRONMENTS")?.title,
      applications: itemArray(findSection("ENVIRONMENTS")),
      specificationsTitle: specifications?.title,
      specificationsNote: dataObject(specifications).note,
      specifications: itemArray(specifications).map((pair) => ({ specification: pair.title, details: pair.body })),
      quoteLabel: cta.quoteLabel,
      datasheetLabel: cta.datasheetLabel,
      seoTitle: product?.seoTitle,
      seoDescription: product?.seoDescription,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the row is fixed for the life of the page
  }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<Mode>("form");
  /** What the form's fields are currently seeded with. Replaced by an applied paste. */
  const [draft, setDraft] = useState<ProductJson>(saved);
  /** Bumped to remount the fields, which is how uncontrolled inputs take new defaults. */
  const [revision, setRevision] = useState(0);
  const [jsonText, setJsonText] = useState(() => formatProductJson(saved));
  const [switchError, setSwitchError] = useState("");
  const [mediaState, setMediaState] = useState<MediaState>({
    hero: mediaValue(findMedia("HERO")),
    detail: mediaValue(findMedia("DETAIL")),
    datasheet: mediaValue(findMedia("DATASHEET")),
    applicationOne: mediaValue(findMedia("APPLICATION", 0)),
    applicationTwo: mediaValue(findMedia("APPLICATION", 1)),
    applicationThree: mediaValue(findMedia("APPLICATION", 2)),
    gallery: media
      .filter((item) => item.kind === "GALLERY")
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({ url: item.url, publicId: item.cloudinaryPublicId ?? "" })),
  });

  const parsed = useMemo(() => parseProductJson(jsonText), [jsonText]);

  /**
   * Everything the form's fields currently say, as a document.
   *
   * Read out of the DOM rather than mirrored in state: the fields are
   * uncontrolled, and a `FormData` of the live form is both the cheapest and
   * the most truthful description of them. It is what makes switching to the
   * JSON tab lossless mid-edit.
   */
  function readForm(): ProductJson {
    const form = formRef.current;
    if (!form) return draft;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "");
    const list = (key: string) => {
      try {
        const raw: unknown = JSON.parse(value(key) || "[]");
        return Array.isArray(raw) ? raw : [];
      } catch {
        return [];
      }
    };
    return assembleProductJson({
      name: value("name"), slug: value("slug"), status: value("status"), sortOrder: value("sortOrder"),
      categories: data.getAll("categorySlugs").map(String),
      cardDescription: value("cardDescription"), tagline: value("tagline"), introduction: value("introduction"),
      metrics: list("metrics"),
      overviewTitle: value("overviewTitle"), overviewIntro: value("overviewIntro"), overviewItems: list("overviewItems"),
      featuresTitle: value("featuresTitle"), features: list("features"),
      applicationsTitle: value("applicationsTitle"), applications: list("applications"),
      specificationsTitle: value("specificationsTitle"), specificationsNote: value("specificationsNote"), specifications: list("specifications"),
      quoteLabel: value("quoteLabel"), datasheetLabel: value("datasheetLabel"),
      seoTitle: value("seoTitle"), seoDescription: value("seoDescription"),
    });
  }

  /** Whichever editor is open, as the document Copy as JSON hands over. */
  const currentJson = () =>
    mode === "form" ? formatProductJson(readForm()) : parsed.ok ? formatProductJson(parsed.value) : jsonText;

  function selectMode(next: Mode) {
    if (next === mode) return;
    setSwitchError("");
    if (next === "json") {
      /* Carry the half-typed form across rather than showing the product as it
         was last saved: the tabs are two views of one edit, not two edits. */
      const live = readForm();
      setDraft(live);
      setJsonText(formatProductJson(live));
      setMode("json");
      return;
    }
    const result = parseProductJson(jsonText);
    if (!result.ok) {
      setSwitchError(`${result.error} Fix it here, or use “Start again from saved” below.`);
      return;
    }
    setDraft(result.value);
    setRevision((current) => current + 1);
    setMode("form");
  }

  /*
   * What stops a save, in the editor's words.
   *
   * Only the JSON tab can produce these: the form's own fields carry
   * `required` and `pattern`, so the browser catches the same two problems
   * there without our help.
   */
  const blocked = (() => {
    if (mode !== "json") return undefined;
    if (!parsed.ok) return "The JSON below cannot be read yet.";
    if (!parsed.value.name.trim()) return "The JSON needs a “name”.";
    if (!SLUG_PATTERN.test(parsed.value.slug)) {
      return "“slug” must be lower-case words joined by hyphens, like dc-fast-charging-station.";
    }
    return undefined;
  })();

  const slot = (key: MediaSlot) => ({
    onChange: (next: MediaValue) => setMediaState((current) => ({ ...current, [key]: next })),
    value: mediaState[key],
  });
  const galleryProps = {
    initial: [] as readonly GalleryImage[],
    onChange: (next: readonly GalleryImage[]) => setMediaState((current) => ({ ...current, gallery: next })),
    value: mediaState.gallery,
  };

  const heroUpload = (
    <MediaUpload
      {...slot("hero")}
      hint="Used in three places: the main image at the top of this product's page, its card in the home page carousel, and its thumbnail on the products index and category pages. Upload once and all three follow."
      label="Main product image"
    />
  );
  const detailUpload = (
    <MediaUpload {...slot("detail")} hint="Floats over the glass panel, in front of the benefits above." label="Overview detail image" />
  );
  const datasheetUpload = (
    <MediaUpload {...slot("datasheet")} accept="application/pdf,.pdf" hint="Opened by the 'Datasheet button label' above." label="Datasheet PDF" />
  );
  const applicationUploads = (
    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
      <MediaUpload {...slot("applicationOne")} hint="Matches application item 1 above." label="Photo 1" />
      <MediaUpload {...slot("applicationTwo")} hint="Matches application item 2 above." label="Photo 2" />
      <MediaUpload {...slot("applicationThree")} hint="Matches application item 3 above." label="Photo 3" />
    </div>
  );

  const pairs = (items: readonly { readonly title: string; readonly body: string; readonly icon?: string }[]): Pair[] =>
    items.map((item) => ({ title: item.title, body: item.body, icon: item.icon ?? "" }));

  return (
    <form
      action={saveProduct}
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        /* The button is already disabled; this catches the Enter key, which
           submits a form without going near it. */
        if (blocked) event.preventDefault();
      }}
      ref={formRef}
    >
      <input name="id" type="hidden" value={product?.id ?? ""} />
      <MediaFields media={mediaState} />
      {/* Present only on the JSON tab, and the only thing that tells the server
          action which editor sent this. The form's own fields are unmounted
          while it is here, so the two can never both describe the product. */}
      {mode === "json" ? <input name="contentJson" type="hidden" value={jsonText} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ModeTabs mode={mode} onSelect={selectMode} />
        <CopyButton
          getText={currentJson}
          title="Copies this product's words as JSON, ready to hand to an assistant"
        >
          Copy as JSON
        </CopyButton>
      </div>

      {switchError ? (
        <p className="flex items-start gap-1.5 rounded-lg border border-[rgb(201_129_133/0.4)] bg-[rgb(201_129_133/0.08)] px-3 py-2.5 text-xs text-[var(--dash-status-danger)]">
          <WarningCircleIcon aria-hidden className="mt-px size-3.5 shrink-0" />
          {switchError}
        </p>
      ) : null}

      {mode === "json" ? (
        <JsonEditor
          categoryOptions={categoryOptions}
          gallery={galleryProps}
          isNew={isNew}
          media={{ applications: applicationUploads, datasheet: datasheetUpload, detail: detailUpload, hero: heroUpload }}
          onChange={(next) => {
            setJsonText(next);
            setSwitchError("");
          }}
          onReset={() => {
            setJsonText(formatProductJson(saved));
            setSwitchError("");
          }}
          parsed={parsed}
          value={jsonText}
        />
      ) : (
        /* `key`: applying a pasted document replaces what these uncontrolled
           fields were seeded with, and only a remount makes a `defaultValue`
           take again. The uploads are untouched by it — they live in this
           component's state, above the remount. */
        <div className="flex flex-col gap-4" key={revision}>
          <FormSection title="Basics" whereItAppears="Not shown on the product page itself. Controls the URL, publish state, and where the product sits in the homepage carousel.">
            <Field label="Name"><Input defaultValue={draft.name} name="name" required /></Field>
            <Field label="Slug"><Input defaultValue={draft.slug} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></Field>
            <Field label="Status"><Select defaultValue={draft.status} name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select></Field>
            <Field label="Carousel order"><Input defaultValue={draft.sortOrder} min={0} name="sortOrder" type="number" /></Field>
            <CategoryPicker options={categoryOptions} selected={draft.categories} />
            <Field
              hint="Two short paragraphs read best: what it is, then what it is for. A blank line starts a new paragraph."
              label="Catalogue card description"
              wide
            >
              <Textarea defaultValue={draft.cardDescription} name="cardDescription" rows={6} />
            </Field>
          </FormSection>

          <FormSection title="Hero" whereItAppears="The top of the product page: the big heading, the intro paragraph under it, and the row of stat boxes (e.g. 'Up to 5 kW').">
            <Field label="Hero lead / tagline" wide><Input defaultValue={draft.hero.tagline} name="tagline" /></Field>
            <Field label="Hero introduction" wide><Textarea defaultValue={draft.hero.introduction} name="introduction" rows={4} /></Field>
            <PairEditor firstLabel="Metric value" initial={draft.hero.metrics.map((metric) => ({ title: metric.value, body: metric.label, icon: "" }))} name="metrics" secondLabel="Metric label" title="Stat boxes (up to 3 show)" />
            <div className="sm:col-span-2">{heroUpload}</div>
            <GalleryUpload {...galleryProps} />
            <Field label="Quote button label"><Input defaultValue={draft.cta.quoteLabel} name="quoteLabel" /></Field>
            <Field label="Datasheet button label"><Input defaultValue={draft.cta.datasheetLabel} name="datasheetLabel" /></Field>
            <div className="sm:col-span-2">{datasheetUpload}</div>
          </FormSection>

          <FormSection title="Overview" whereItAppears="The glass panel just below the hero, titled by 'Overview heading'. The second thing a visitor scrolls to.">
            <Field label="Overview heading" wide><Input defaultValue={draft.overview.title} name="overviewTitle" /></Field>
            <Field label="Overview introduction" wide><Textarea defaultValue={draft.overview.intro} name="overviewIntro" rows={3} /></Field>
            <PairEditor firstLabel="Benefit title" initial={pairs(draft.overview.items)} name="overviewItems" secondLabel="Benefit description" title="Benefits listed in the panel" />
            <div className="sm:col-span-2">{detailUpload}</div>
          </FormSection>

          <FormSection title="Key Features" whereItAppears="The icon grid section below the Overview panel. Up to 6 items show. The icon beside each row is the mark drawn above it on the page: click it to search the library.">
            <Field label="Section heading" wide><Input defaultValue={draft.features.title} name="featuresTitle" /></Field>
            <PairEditor firstLabel="Feature" initial={pairs(draft.features.items)} name="features" secondLabel="Feature description" title="Features (first 6 show)" withIcons />
          </FormSection>

          <FormSection title="Applications" whereItAppears="The 3-photo card section below Key Features. Each photo below pairs with the application item above it, in order.">
            <Field label="Section heading" wide><Input defaultValue={draft.applications.title} name="applicationsTitle" /></Field>
            <PairEditor firstLabel="Application title" initial={pairs(draft.applications.items)} name="applications" secondLabel="Application description" title="Applications (first 3 show)" />
            {applicationUploads}
          </FormSection>

          <FormSection title="Specifications" whereItAppears="The 'Technical Specifications' table. The first 5 rows show by default, the rest sit behind a 'View all' button.">
            <Field label="Section heading" wide><Input defaultValue={draft.specifications.title} name="specificationsTitle" /></Field>
            <Field label="Disclaimer under the heading" wide><Input defaultValue={draft.specifications.note} name="specificationsNote" /></Field>
            <PairEditor firstLabel="Specification" initial={draft.specifications.items.map((row) => ({ title: row.specification, body: row.details, icon: "" }))} name="specifications" secondLabel="Details" title="Table rows" />
          </FormSection>

          <FormSection title="SEO" whereItAppears="Not shown on the page. Used for search engine results and link previews when this page is shared.">
            <Field label="SEO title"><Input defaultValue={draft.seo.title} maxLength={70} name="seoTitle" /></Field>
            <Field label="SEO description"><Input defaultValue={draft.seo.description} maxLength={160} name="seoDescription" /></Field>
          </FormSection>
        </div>
      )}

      <SaveBar blocked={blocked} isNew={isNew} />
    </form>
  );
}

function mediaValue(row: ProductMedia | undefined): MediaValue {
  return row ? { url: row.url, publicId: row.cloudinaryPublicId ?? "" } : EMPTY_MEDIA;
}

/** One numbered step in the "how this works" card. */
function Step({ children, n }: { readonly children: React.ReactNode; readonly n: number }) {
  return (
    <li className="flex gap-3">
      <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-[rgb(9_133_204/0.18)] text-[0.6875rem] font-semibold text-[var(--dash-primary)]">
        {n}
      </span>
      <span className="text-sm text-[var(--dash-muted)]">{children}</span>
    </li>
  );
}

/**
 * The second way into a product: its words as one document, and its pictures
 * as the same upload controls the form uses.
 *
 * The split is the whole idea. Text is what an assistant is good at rewriting
 * and what a client most often wants changed, so it travels as JSON that can
 * be copied out, edited in a chat window and pasted back. Images cannot make
 * that trip, so they never leave the dashboard: the uploads below are the
 * same controls, holding the same state, as the ones on the form tab — an
 * image added here is already there if you switch back.
 */
function JsonEditor({
  categoryOptions,
  gallery,
  isNew,
  media,
  onChange,
  onReset,
  parsed,
  value,
}: {
  readonly categoryOptions: readonly { slug: string; name: string }[];
  readonly gallery: {
    readonly initial: readonly GalleryImage[];
    readonly onChange: (next: readonly GalleryImage[]) => void;
    readonly value: readonly GalleryImage[];
  };
  readonly isNew: boolean;
  readonly media: {
    readonly applications: React.ReactNode;
    readonly datasheet: React.ReactNode;
    readonly detail: React.ReactNode;
    readonly hero: React.ReactNode;
  };
  readonly onChange: (next: string) => void;
  readonly onReset: () => void;
  readonly parsed: ReturnType<typeof parseProductJson>;
  readonly value: string;
}) {
  /* A line of plain English about what the document currently says, so a
     paste can be sanity-checked without reading 200 lines of JSON. */
  const summary = parsed.ok
    ? [
        parsed.value.name || "Untitled",
        `${parsed.value.features.items.length} feature${parsed.value.features.items.length === 1 ? "" : "s"}`,
        `${parsed.value.specifications.items.length} spec row${parsed.value.specifications.items.length === 1 ? "" : "s"}`,
        `${parsed.value.categories.length} categor${parsed.value.categories.length === 1 ? "y" : "ies"}`,
      ].join(" · ")
    : "";

  return (
    <>
      <FormSection
        title="Editing with an assistant"
        whereItAppears="A shortcut for rewriting a lot of copy at once. Everything here saves exactly as the form does."
      >
        <ol className="flex flex-col gap-2.5 sm:col-span-2">
          <Step n={1}>
            Press{" "}
            <strong className="font-medium text-[var(--dash-fg)]">
              Copy with an instruction for the assistant
            </strong>{" "}
            below. It copies {isNew ? "the blank template" : "this product"} together with a guide
            to every field and a complete worked example, so the assistant knows exactly what shape
            to send back.
          </Step>
          <Step n={2}>
            Paste that into ChatGPT, Claude or any assistant, and replace the one line marked{" "}
            <code className="font-mono text-[var(--dash-fg)]">
              {isNew ? "<describe the product here>" : "<describe your change here>"}
            </code>{" "}
            with what you want
            {isNew
              ? " — “a 240 kW dual-gun DC charger for motorway services”."
              : " — “rewrite this for marine installers”, “add four specification rows about the cooling loop”."}
          </Step>
          <Step n={3}>Paste the answer back into the box below. It is checked as you type.</Step>
          <Step n={4}>
            Add {isNew ? "the" : "or replace"} pictures under{" "}
            <strong className="font-medium text-[var(--dash-fg)]">Images and files</strong>, then
            save.
          </Step>
        </ol>
        <p className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-subtle)] p-3 text-xs text-[var(--dash-muted)] sm:col-span-2">
          Pictures and the datasheet are never part of the JSON — they cannot survive a trip through
          a chat window. They stay on the upload controls below, and keep whatever is already on the
          product unless you change them there.
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <CopyButton
            className="border-[var(--dash-primary)] bg-[rgb(9_133_204/0.14)]"
            getText={() =>
              llmPrompt(parsed.ok ? formatProductJson(parsed.value) : value, {
                categories: categoryOptions,
                isNew,
              })
            }
          >
            <SparkleIcon aria-hidden className="size-4" /> Copy with an instruction for the assistant
          </CopyButton>
          <CopyButton getText={() => (parsed.ok ? formatProductJson(parsed.value) : value)}>
            Copy the JSON on its own
          </CopyButton>
        </div>

        {/* Closed by default: it is reference, not a step. Open, it answers
            "what is a good `cardDescription`?" far faster than the field
            guide's one-line description of it does. */}
        <details className="group sm:col-span-2">
          <summary className="cursor-pointer list-none text-xs text-[var(--dash-muted)] underline underline-offset-2 transition-colors hover:text-[var(--dash-fg)]">
            See a filled-in example product
          </summary>
          <p className="mt-2 text-xs text-[var(--dash-muted)]">
            A product that does not exist, written the way the catalogue is written. This same
            example is included in the instruction the button above copies.
          </p>
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg border border-[var(--dash-border)] bg-[rgb(2_7_28/0.6)] p-3 font-mono text-[0.6875rem] leading-relaxed text-[var(--dash-muted)]">
            {EXAMPLE_PRODUCT_JSON}
          </pre>
        </details>
      </FormSection>

      <FormSection
        title="Product content"
        whereItAppears="Every word on the product page, as one JSON document. Keep the key names; change the values."
      >
        <div className="flex flex-col gap-2 sm:col-span-2">
          <textarea
            aria-label="Product content as JSON"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={
              "min-h-[28rem] w-full rounded-lg border bg-[rgb(2_7_28/0.6)] p-3.5 font-mono text-xs " +
              "leading-relaxed text-[var(--dash-fg)] focus-visible:outline-none focus-visible:ring-2 " +
              "focus-visible:ring-[var(--dash-primary)] " +
              (parsed.ok ? "border-[var(--dash-border-strong)]" : "border-[rgb(201_129_133/0.55)]")
            }
            onChange={(event) => onChange(event.target.value)}
            spellCheck={false}
            value={value}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {parsed.ok ? (
              <p className="flex items-center gap-1.5 text-xs text-[var(--dash-status-success)]">
                <CheckCircleIcon aria-hidden className="size-4 shrink-0" />
                <span className="text-[var(--dash-muted)]">Reads as: {summary}</span>
              </p>
            ) : (
              <p className="flex items-start gap-1.5 text-xs text-[var(--dash-status-danger)]">
                <WarningCircleIcon aria-hidden className="mt-px size-4 shrink-0" />
                {parsed.error}
              </p>
            )}
            <button
              className="text-xs text-[var(--dash-muted)] underline underline-offset-2 transition-colors hover:text-[var(--dash-fg)]"
              onClick={onReset}
              type="button"
            >
              Start again from saved
            </button>
          </div>

          {categoryOptions.length ? (
            <p className="text-xs text-[var(--dash-muted)]">
              Valid entries for <code className="font-mono">categories</code>:{" "}
              {categoryOptions.map((category) => category.slug).join(", ")}. Anything else is
              ignored when you save.
            </p>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        title="Images and files"
        whereItAppears="The same uploads as the form tab, holding the same pictures. Change one here and it is changed there."
      >
        <div className="sm:col-span-2">{media.hero}</div>
        <GalleryUpload {...gallery} />
        <div className="sm:col-span-2">{media.detail}</div>
        <div className="sm:col-span-2">
          <div className="mb-2">
            <Label>Application photos</Label>
            <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
              Each photo pairs with the matching entry in{" "}
              <code className="font-mono">applications.items</code>, in order.
            </p>
          </div>
          {media.applications}
        </div>
        <div className="sm:col-span-2">{media.datasheet}</div>
      </FormSection>
    </>
  );
}
