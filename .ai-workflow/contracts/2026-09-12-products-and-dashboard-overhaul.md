# Products pages + dashboard overhaul

Date: 2026-09-12
Branch: main

## Decisions taken (confirmed by user)

1. **Categories are many-to-many.** A product can sit in several of the six
   categories. Join table, multi-select in the dashboard.
2. **Add / edit opens its own page.** `/admin/products/new`,
   `/admin/products/[id]/edit`, and the same for testimonials. No `<details>`
   dropdowns, no modals.
3. **Category artwork reuses the six `/industry/*.png` icons** already on the
   home page. Swappable per category when new art arrives.
4. **Header "Products" points at `/products`.** The home carousel stays.

## Route shape

`/products/[slug]` already owns the product detail route, so category pages
cannot live at `/products/[category]` — they go to
`/products/category/[category]`.

| Route | Purpose |
| --- | --- |
| `/products` | Index: Centauri title, six category cards, "Show all products" toggle |
| `/products/category/[category]` | One category: its products |
| `/products/[slug]` | Unchanged product detail |

## Task list

Every item the user asked for, numbered so nothing is dropped.

### Public site

- [x] P1. `/products` page exists, follows the site design, title set in
      Centauri (the "techy font").
- [x] P2. Six category cards on `/products` — the home page's industries
      section, reused rather than reimplemented.
- [x] P3. Home page category cards link to their category page.
- [x] P4. Category pages list that category's products.
- [x] P5. "Show all products" toggle on `/products` shows the whole catalogue.
- [x] P6. Responsive at 320 / 402 / 768 / 1023 / 1512 / 1920.
- [x] P7. Back-to-top control moves to the bottom **right**.
- [x] P8. Curtain intro bars change from `sky-bright` to the home page's dark
      navy (`--color-ink`). Nothing else about the intro changes.
- [x] P9. Mobile variant of the hero clip (currently one 4.5MB 1920x440 file
      served to phones).
- [x] P10. The intro cover plays once per visit, not on every return to the
      home page.
- [x] P11. Product page hero gallery: the side thumbnails crop their images.
      Frame them so nothing is cut off, desktop and mobile.
- [x] P12. The hero video must not carry the scroll parallax. That drift was
      choreographed for the still vehicles PNG, which the clip replaced.

### Database

- [x] D1. `Category` model + `ProductCategory` join, seeded with the six
      categories.
- [x] D2. Existing seven products assigned to categories.
- [x] D3. Migration committed, `db:generate` run, seed idempotent.

### Admin dashboard

- [x] A1. Products: "Add product" is a **button**, not a dropdown.
- [x] A2. Products: every row has an **Edit** button.
- [x] A3. Products: search box.
- [x] A4. Products: filter, including by category.
- [x] A5. Products: category shown/editable on the product form.
- [x] A6. Status pills → coloured **text**, no pill, not shouting caps
      (Products, Enquiries, Overview, Testimonials).
- [x] A7. Add/edit product on its own page (see decision 2).
- [x] A8. Testimonials: same overhaul — list, search, Add button, Edit per row,
      own add/edit pages.
- [x] A9. Enquiries page rethought: no pills, no full caps, better type scale,
      elements placed where a dashboard puts them.
- [x] A10. Navigation speed. Current suspects, to be confirmed with a trace:
      - `dynamic = "force-dynamic"` on the shell **and** every page
      - `DashboardAtmosphere` draws an SVG `feDisplacementMap` +
        `feGaussianBlur` over a 1565x1400 band, re-rasterised on every
        navigation (the CSS comment claims "two painted gradients" — the
        component does not do that)
      - no `prefetch` on the rail links
- [x] A11. Title sizing / hierarchy pass on every dashboard page.
- [x] A12. Any other quality-of-life fix found along the way, logged below.
- [x] A13. Media fields must not expose raw `/figma/...` paths as editable
      text. Uploads go to Cloudinary; the URL becomes a hidden field behind a
      thumbnail, an upload control and a remove control. Also fixes a live bug:
      the field is `type="url"`, and a relative path like
      `/figma/4e3f....png` fails its validation, so a product seeded with one
      cannot be saved without re-uploading.

## File inventory

Estimated 45 before starting. Actual: **63** — 32 modified, 29 added, 2 deleted.
The gap is the five items that arrived after the count was taken (P10, P11,
P12, A13 and the soft-navigation fix), plus the shared pieces they needed:
`nav-link.tsx`, `skeleton.tsx`, `delete-row-button.tsx`, four `loading.tsx`
files and `prisma/categories.ts`.

### Deleted (2)

- `src/components/admin-delete-product-button.tsx` — replaced by the generic
  `dashboard/delete-row-button.tsx`, which products and testimonials share.
- `src/components/dashboard/lead-status.ts` — its badge tones moved into
  `dashboard/status-text.tsx` alongside the product tones.

## Verification

| What | Before | After |
| --- | --- | --- |
| `/admin` -> `/admin/products` | 1233ms | 46ms |
| `/admin/products` -> `/admin/leads` | 580ms | 45ms |
| `/admin/testimonials` | 584ms (558ms TTFB) | 53ms |
| `/admin` | 330ms | 54ms |
| Hero clip on a phone | 4.5MB, 1920x440 | 1.0MB, 960x220 |
| Hydration warnings on `/` | 1 (introduced mid-work, then fixed) | 0 |

Measured in Chrome via the DevTools MCP, clicking the real rail links and
waiting for the destination's own content rather than for the skeleton.

Checked visually at 320 / 402 / 768 / 1023 / 1512: no horizontal overflow on
`/products` or a category page, category grid collapses to one column below
`sm`, product grid runs 1 / 2 / 3 columns.

`npm run lint`, `npm run typecheck` and `npm run build` all clean; 20 static
pages generated, including all six category routes.

## Log

- **Migration applied by hand.** `prisma migrate dev` wanted to reset the
  database — an earlier migration
  (`20260909000000_product_details_and_testimonials`) had been edited after it
  was applied, so its checksum no longer matched and Prisma's only offer was
  a full reset. That would have destroyed seven products, five testimonials
  and two enquiries. Instead the delta was generated with `migrate diff`,
  read (purely additive: two `CREATE TABLE`s, three indexes, two foreign
  keys — the only `DELETE` tokens were `ON DELETE CASCADE` clauses), applied
  with `db execute`, and recorded with `migrate resolve --applied`.
  **The checksum drift is still there** and the next person to run
  `migrate dev` will be asked to reset again.
- **Product -> category mapping is a guess that needs your eyes.** Every
  product is charging or storage hardware, so none of them map cleanly onto
  one of six vehicle categories. The opening assignment is in
  `prisma/categories.ts`; each product now sits in two or three categories and
  every category has at least two products. Correct it in the dashboard.
- **Two bugs found and fixed on the way, neither reported:**
  - The media field was `type="url"` holding values like
    `/figma/4e3f….png`. A relative path fails URL validation, so opening any
    seeded product and pressing Save was silently blocked on a field nobody
    had touched. The URL is a hidden input now.
  - The hero's idle float lifted the clip 7px inside a box it fills exactly,
    exposing a 7px strip of page along the bottom of the band on every cycle.
    Invisible with the transparent PNG it was written for.
- **The nav was entirely plain `<a>` elements.** Every move between Home,
  About and Products reloaded the whole document. That is also why the intro
  cover reappeared on every visit to Home — a full load has no memory of the
  one before it. Route links now go through `next/link`; hash links stay
  anchors so `AnchorScroll` keeps handling them.
- **One self-inflicted regression, caught and fixed.** The first version of
  the once-per-visit intro put a class on `<html>` from an inline script,
  which React reported as a hydration mismatch because the root layout owns
  that element's attributes. It appends a `<style>` node instead.
- **`IdleScene` now has no targets.** Removing the hero float left it a
  no-op. It is still registered and guarded, so nothing breaks, but nothing on
  the page floats any more.
- **Still local paths, not Cloudinary.** The form no longer shows
  `/figma/…` as editable text, but the seeded products' media rows still point
  at those files. Uploading a replacement in the dashboard is what moves a
  given image to Cloudinary; they cannot be invented.
