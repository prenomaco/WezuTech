# Atmosphere and responsive refinement verification

## Status

Implemented and checked in Chromium against live Figma context. **Native Zen/Gecko and Safari are not verified.** This is not a claim of pixel-perfect or all-browser parity.

Figma remote MCP now works. The source nodes inspected with design context and screenshots were `305:48` (402 × 5011 home), `252:429` (1512 × 3984 home), and `307:165` (1512 × 3151 About), in file `ELdFt6qc0Ex8enNX0ksdv0`.

## Carousel interaction refinement — latest pass

This pass preserves the Figma composition and fixes interaction behavior only. The responsive-adaptation skill directed larger invisible touch targets; the Chrome DevTools skill directed before/after screenshots and fresh-page production verification.

### Reproduced issue and changes

- Before the fix, focusing a testimonial arrow, entering and leaving the carousel with the pointer, then waiting 6.8 seconds advanced the quote despite focus remaining on the arrow. Hover and keyboard focus now have independent pause state. The same sequence retains the selected quote; moving focus away allows autoplay again.
- Testimonial dots now support Left/Right wrapping and Home/End, with one tab stop, linked tab/panel IDs, and focus following selection. Vertical scrolling keys and modified shortcuts are not intercepted. Manual selection can announce its quote; automatic rotation no longer continuously announces through the live region.
- A reduced-motion media-query change now stops/restarts the existing autoplay timer without requiring a reload. Quote tweens revert during effect cleanup to avoid leaving a detached target or partial transition behind.
- Shared carousel arrows have inward-expanding invisible targets of at least **44 × 44 CSS pixels**, including at 320px. Their visible glyphs, padding, placement, and focus styling were not moved. This does not enlarge the closely spaced Figma dots themselves; the equivalent previous/next controls provide the larger touch targets.

### Verification

- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` passed. Production build: compiled successfully, TypeScript completed, generated 11/11 pages.
- `node --import tsx --test scripts/verify-atmosphere.ts scripts/verify-carousel.ts`: **11 passed, 0 failed** (seven atmosphere tests plus four navigation tests).
- Production geometry before/after at **320, 402, 768, 1024, 1512, 1920px** was identical for arrow glyphs, quote, caption capsule, dots, total page height and document width. No horizontal overflow. Canonical home remains 402 × 5011 and 1512 × 3984.
- Browser DOM hit-testing at **320, 402, 768, 1024, 1512px** confirmed all four inside edges of every visible arrow's expanded target reach the correct button and remain within the viewport. Product arrows were included at desktop breakpoints.
- Keyboard Left/Right/Home/End selected and focused the expected tab, maintained one tab stop, and linked the panel to the selected tab. ArrowUp retained native behavior. Twelve rapid next-clicks settled with the quote visible at opacity 1 and zero translation.
- Repeated focus/pointer sequence held the same quote for 6.8 seconds; after focus left, the next quote appeared after another 6.8 seconds.
- A test-injected `MediaQueryList` change signal held quote 1 for 6.8 seconds with reduced motion enabled and advanced to quote 2 after restoring no preference. This tests the event subscription, not an actual OS preference change or native-browser parity.
- Production console checked after a clean reload. Native Zen and Safari limitations remain unchanged; this pass was verified in Chromium.

Exact inventory: **five files — three source files, one new test and this record**. Two files are new, making the total pre-existing dirty worktree plus this pass 38 files. No commit, push, API/data changes, file moves or deletions.

```text
src/components/testimonial-carousel.tsx
src/components/ui/carousel-arrow.tsx
src/lib/carousel-navigation.ts
scripts/verify-carousel.ts
.ai-workflow/contracts/atmosphere-verification-2026-09-05.md
```

Ignored local evidence: `.shots/carousel-before-mobile.png`, `.shots/carousel-after-mobile.png`, `.shots/carousel-before-desktop.png`, `.shots/carousel-after-desktop.png`, and `.shots/carousel-interaction-results.json`. Viewport captures have different scroll offsets; the same-width geometry comparisons use document coordinates rather than screenshot rows.

## Monitor artifact correction

The user's subsequent 1900px screenshots exposed gaps in the earlier verification below. This follow-up supersedes the earlier background-rendering results; it does not establish native Zen parity.

### Evidence and corrections

- Reproduced the industry/testimonial crop in Chromium at 1900px: the two dim frames remained 1565px wide and their horizontal positions differed by 1px. Both halves now share one vertically mirrored canvas with full-viewport continuation. The mobile and About pairs use the same approach.
- Added 64 design pixels of horizontal overscan per side. About's source frame is off-centre by 60.5 design pixels; a bare `100vw` canvas exposed a strip when no classic scrollbar gutter was present. Overscan preserves the artwork's original position while covering the viewport.
- The supplied narrow Zen crop contains hard row changes 512px apart (at y=121 and y=633). This is consistent with a tiled-paint artifact, but the screenshot alone does not prove its browser-internal cause. The remaining scaled/rotated CSS-blurred SVG streaks have been replaced with static Canvas 2D surfaces decoded from the existing vectors, with blur baked in before CSS transforms.
- Plain glow surfaces include a three-sigma transparent margin beyond the original export bounds. All 15 measured surface borders had maximum alpha 0. The settled page has no live CSS blur filters on its SVG/canvas elements.
- No background PNG assets, Canvas `filter`, displacement filters, animation loops, or scroll-driven raster redraws were added. The original vectors and refraction math remain the source. SVG fallbacks remain available during initialization or context failure.

### Production checks

- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` passed. The build generated all 11 pages. The expanded test suite passed **7/7**, including even mirrored halves at fractional DPR and padded/aborted plain-glow draws.
- Home same-page resize sweep: **320, 390, 402, 640, 768, 1024, 1280, 1512, 1900, 1920, 2560px**. About: **402, 768, 1024, 1512, 1900, 2560px**. All visible refraction canvases were ready, covered the viewport, and produced no document overflow.
- The mirrored join's maximum per-channel pixel difference was **0** at every tested size. Additional production checks passed at 1900px/DPR1.25, 1920px/DPR2, and 2560px/DPR2; backing widths remained bounded to 4096px.
- Checked both classic 15px scrollbar gutters and overlay/no-gutter layouts. Canonical no-gutter home dimensions remain **402 × 5011** and **1512 × 3984**. The 15px gutter can change text wrapping and total page height; those alternate heights are not claimed as exact Figma matches.
- After settling, scrolling through the page recorded **0 additional Canvas 2D draws**, including plain glows, at 402px/DPR2 and 1920px/DPR2. This is redraw verification, not a native rendering-performance benchmark.
- Final production reload: no console warnings, errors or issues. Diagnostic `getImageData` calls had previously produced a readback-performance warning; the application itself does not run these diagnostic readbacks on its output canvases.
- Fresh Chromium screenshots checked wide industry/testimonial edges, About at 2560px, and mobile industry/testimonial placement. Native Zen remains pending the user's hard-refresh check; the native launch limitation described below is unchanged. Safari remains unchecked.

Saved local artifacts (ignored by git):

```text
.shots/zen-before-1900.png
.shots/zen-after-home-1900.png
.shots/zen-after-about-2560.png
.shots/zen-after-mobile-industries.png
.shots/zen-after-mobile-testimonial.png
.shots/zen-correction-results.json
```

### Exact follow-up inventory

**10 files: eight source files, one test and this record.** Two source files are new; the remaining files overlap the earlier pass. Existing unrelated changes were preserved. Total dirty-worktree inventory is 36 files, not 36 files changed in this follow-up. No files were moved or removed; no commit or push was made.

```text
src/components/atmosphere/glow-layer.tsx
src/components/atmosphere/glow-surface.tsx
src/lib/design/render-glow.ts
src/components/atmosphere/refraction-frame.tsx
src/components/atmosphere/refraction-canvas.tsx
src/lib/design/render-refraction.ts
src/components/atmosphere/page-atmosphere.tsx
src/components/atmosphere/about-atmosphere.tsx
scripts/verify-atmosphere.ts
.ai-workflow/contracts/atmosphere-verification-2026-09-05.md
```

The production preview remains available at `http://localhost:3000` with hot reload off.

## Earlier refinement pass (historical record)

The sections below record the initial refinement and its original four-test verification. The correction above is the latest result.

## Changes

- Replaced the four-copy SVG/mask/plus-lighter refraction stack with a static Canvas 2D surface generated from the exported vector paths. The original one-dimensional Figma refraction calculation samples the source directly. No background image files, displacement filters, animation loops, or scroll listeners were added.
- Canvas redraws follow element resizing and DPR changes, with cancellation and SVG fallback. Wide-screen continuation reflects source coordinates instead of repeating DOM tiles. Source page-ink coverage is converted to transparency so it cannot obscure separate edge streaks with rectangular edges.
- Fixed the mobile light-band pair: both halves share one percentage anchor, with the second beginning exactly at the first half's 233px boundary. Separate percentage anchors previously opened a gap as page height changed.
- Replaced guessed mobile glow washes with live vector geometry and transforms. Hero artwork and light share fluid sizing through intermediate widths.
- Corrected About light vectors, fleet asset and placement, and introduction alignment. Mobile/tablet About layout is an adaptation; no mobile About reference was supplied. The lower-left About streak still reuses the shared lower-streak shape at the live bounds rather than a separate exact export.
- Matched mobile testimonial frame/capsule paths, 11.203 × 22.407px arrows, 230 × 64px capsule at x=80, 176px quote slot with 22px line spacing, and 13.562px heading. Capsule overlap stays stable for all five quotes. The caption retains the reference's independent horizontal offset.
- Refined mobile About artwork/copy, products, industry rows, contact spacing and footer to restore the home frame's vertical rhythm.
- Fixed the clipped desktop “MOVEMENT” headline at 1024px by scaling display type with its stage below the global root-font minimum.

Contact form changes are layout classes only. No API, authentication, database or submission behavior was changed.

## Verification

All commands exited successfully:

```text
npm run typecheck
npm run lint
node --import tsx --test scripts/verify-atmosphere.ts
  4 tests passed, 0 failed
npm run build
  Next.js 16.3.4 (Turbopack)
  Compiled successfully
  TypeScript completed
  Generated static pages (11/11)
git diff --check
```

Prettier was run on all 21 touched source files and the new test. Its temporary npm cache was `/private/tmp/wezutech-tool-cache`; the user's npm cache was not modified or repaired.

### Browser checks

Chrome DevTools used a background isolated page and viewport emulation, not physical window resizing.

- Same-page home resize sweep: **320, 390, 402, 480, 560, 639, 640, 768, 900, 1023, 1024, 1280, 1440, 1512, 1920, 2560px**. No document overflow; visible canvases resized and became ready; product copy fit; mobile paired-tile join remained zero.
- About sweep: **390, 402, 640, 768, 1024, 1512, 1920, 2560px**. No document or measured text overflow. Initial sweep retained the browser's 15px scrollbar gutter.
- Production home measured **5011px at 402px** and **3984px at 1512px**. About measured 3150–3151px depending on scrollbar/rounding. Overall heights alone are not fidelity proof.
- All five testimonials were cycled at **402, 640, 768, 1024 and 1512px**. Stage/capsule geometry stayed unchanged within each width; captions fit. The final 22px quote-line-height adjustment was rechecked across all five at 402px and retained the 5011px page height.
- At **1920px with emulated DPR 2**, the hero surface was 3840 × 1985, all visible canvases were ready, headline text fit, and no horizontal overflow appeared. This is a visual check, not a performance benchmark.
- Instrumenting `CanvasRenderingContext2D.drawImage` on the settled production page recorded **zero additional canvas draws during scrolling** at 402px/DPR1 and 1920px/DPR2. This proves redraw behavior only; it does not measure frame rate, compositor work, or native Gecko paint cost.
- Final production home console: no warnings or errors. About console was also clean during its visual check.

Local diagnostic artifacts are ignored by git:

- `.shots/live-mobile.png`, `.shots/live-home.png`, `.shots/live-about.png`: live Figma references.
- `.shots/home-final-402.png`, `.shots/home-final-1512.png`: full-page comparison captures immediately before the final mobile testimonial type adjustment.
- `.shots/testimonial-production.png`: final mobile testimonial/caption placement and typography.
- `.shots/about-final.png`: About full-page comparison.
- `.shots/verify-home-<width>.png`: intermediate-width visual sweep.
- `.shots/verification-results.json`: captured resize/carousel diagnostic outputs.

### Remaining native-browser gate

Zen 1.21.16b is installed. A task-isolated headless launch aborted with SIGABRT in macOS `_RegisterApplication` / `TransformProcessType` before a Marionette endpoint was available. This sandbox cannot complete that native launch. No sandbox bypass or user-profile automation was attempted.

Next manual check: hard-reload `http://localhost:3000` in Zen, inspect hero/industry/testimonial edges at >1512px, then drag responsive width through 390, 402, 640, 768 and 1024px and cycle every testimonial. Capture viewport dimensions and any remaining seam. Native Safari remains unchecked too.

## Local server

The final preview runs the production build with `npm run start` on port 3000. Hot reload is intentionally off. The task-owned development process was stopped before the final build.

Earlier development watching produced EMFILE errors; webpack with `WATCHPACK_POLLING=1000` was usable. No cache directory was deleted. To resume editing later, stop the production preview and start the preferred development command. Do not run a build over an active dev server when comparing screenshots; hot updates and shared generated artifacts interfered with earlier diagnostic captures.

## Exact task inventory

**24 files: 21 source files, one exact Figma foreground asset, one test and this record.** Existing dirty work was preserved, so total git-status count is larger. No files were moved or deleted, and no commit or push was made.

```text
src/components/atmosphere/refraction-frame.tsx
src/components/atmosphere/refraction-canvas.tsx
src/lib/design/render-refraction.ts
src/components/atmosphere/glow-layer.tsx
src/components/atmosphere/page-atmosphere.tsx
src/components/atmosphere/about-atmosphere.tsx
src/components/atmosphere/streak-layer.tsx
src/lib/design/glow-vectors.ts
src/components/sections/mobile-hero.tsx
src/components/sections/about.tsx
src/components/sections/about-page.tsx
src/components/sections/industries.tsx
src/components/sections/products.tsx
src/components/sections/testimonials.tsx
src/components/ui/typography.tsx
src/components/ui/carousel-arrow.tsx
src/components/product-carousel.tsx
src/components/testimonial-carousel.tsx
src/lib/design/testimonial-frame.ts
src/components/contact-form.tsx
src/components/layout/footer.tsx
public/figma/e82ee81068ab79863936c9f1c227d78b6fa756a8.png
scripts/verify-atmosphere.ts
.ai-workflow/contracts/atmosphere-verification-2026-09-05.md
```

The downloaded fleet asset's SHA-256 is `2746ae358c52b4e886a232038b0bad7b90e4402818eeb7e77be53fd3aa94c0d7` (1536 × 1024). Other source imagery was reused from the existing exact Figma exports. Existing, unused edge-wash helper files were not removed.
