# Handoff — dynamically responsive atmosphere, and whether the new approach holds

You are picking up mid-task on `/Users/mahir/Code/wezutech` (branch `dev`, nothing
committed since `1b7125c`). Next.js 16 App Router, React 19, TypeScript, Tailwind v4,
GSAP + ScrollTrigger. `npm run dev` on :3000.

## How to read this document

Everything below was written by the agent that did the work, and it is a report, not
evidence. Treat it the way you would treat a colleague's handover notes: useful for
knowing where to look and what has already been tried, and worth nothing as proof.

**Do not take the numbers seriously.** Every figure here — the mean errors, the track
widths, the paint timings, the before/after tables — came out of a script that agent
wrote, against a capture it took, under conditions it chose. Any of those can be wrong,
and several were wrong earlier in this same task in exactly this way:

- A "1512" measurement was taken at 953px, because `resize_page` had silently refused
  to grow the window past the physical screen and nobody checked `innerWidth`.
- The design read 5.7 mean error one minute and 6.5 the next with no code change
  between, because GSAP reveal states differed between the two captures.
- An artefact the client could see plainly was reported as fixed several times running,
  because the metric averaged over a crop that diluted it. The client's words were
  "either you are delusional or im blind." They were not blind.
- The left edge looked 5 units short of the design until it turned out the Figma PNG
  export has a dark 1–2px antialiasing border that is not in the design at all.

So: re-measure anything you intend to rely on, and be suspicious of a number that
happens to support what you were already planning to do. A metric you chose the crop
for is not a measurement — crop the region, render it, and look at it.

**Do not take the conclusions seriously either.** The diagnoses here are the best the
previous agent had, not settled fact. The claim that the mirrored bleed fails in Gecko
because of `isolate` + `plus-lighter` under a mirroring transform is an inference from
one client screenshot; it was never reproduced in a real Gecko instance. The split
between "tiles carry structure, streaks do not" is a reading of the design, not
something the file states. The root-scale approach is one answer to the client's
question, and the client explicitly invited a different one.

**Reason about the problem yourself before acting on any of it.** Read the code, look
at the design, form your own account of what the page is doing and why, and only then
compare it against what is written here. Where you disagree, say so and show the
measurement. The worst outcome is a second agent inheriting a wrong model and spending
a day making it more elaborate.

## The repo, in one pass

A marketing site for Wezu Technologies, built to a Figma file the client owns. Five
public routes (`/`, `/about`, `/privacy-policy`, `/terms-of-service`, plus an `/admin`
area behind NextAuth with Cloudinary uploads and a contact API). The public pages are
the whole of the fidelity work; the admin area has its own visual language and is not
measured against Figma.

```
src/
  app/globals.css            the root scale, the design tokens, the interaction CSS,
                             and the scroll-driven parallax keyframes. Read the long
                             comments before changing anything here — several encode
                             a measurement that cost a day.
  components/
    atmosphere/              the page's light. This is where the hard work lives.
      page-atmosphere.tsx    home page, mobile + desktop, layer for layer
      about-atmosphere.tsx   the About page's own frame
      glow-layer.tsx         one blurred Figma group, drawn as vector + CSS blur
      refraction-frame.tsx   a tile carrying the "Pattern refraction" shader
      streak-layer.tsx       a rotated edge streak
      edge-wash.tsx          the measured gradient washes
    dashboard/               the admin shell's background — NOT a drawn frame, and the
                             only place `relativeTo` is used as a stretch
    layout/section.tsx       CONTAINER: the gutter and the 94.5rem column
    sections/               one file per section of the page
    ui/                     buttons, logo, primitives
  lib/design/
    refraction.ts            the WGSL shader, ported and collapsed to a 1-D remap
    glow-vectors.ts          the glow groups as path data, generated from SVG exports
    edge-wash.ts             the measured edge ramps and falloffs
    units.ts                 designPx() — a design pixel is a rem
  motion/
    scenes/                  GSAP scenes, one per area; reveal-scene drives data-motion
    split-text.ts            letter-by-letter headline splitting
.figma/                      the reference renders and exported SVGs. Treat as truth.
.shots/                      capture and comparison scripts, and a lot of old captures
```

Two things about this codebase that will bite you if you skim:

- **Comments here are load-bearing.** Most of the long ones record a measurement, a
  Figma inconsistency that had to be resolved by looking at the render, or a browser
  behaviour that was diagnosed the hard way. If you are about to change a line with a
  paragraph above it, read the paragraph — it very likely explains why the obvious
  alternative was tried and failed.
- **The performance work is done and is fragile.** The refraction used to be an
  `feImage` feeding an `feDisplacementMap`; no engine implements that on the
  compositor, so Gecko rendered the subtree as a CPU blob and re-ran the graph as the
  displayport moved — 106.77ms per content paint over a real APZ wheel scroll, against
  0.84ms now, with blob rasterizations at 2280 → 0. It is now four masked, translated
  copies summed with `plus-lighter` inside an `isolate`. Separately, **nothing in the
  background may be promoted**: `will-change: transform` makes Gecko size the layer to
  the element's own bounds and clip everything drawn outside them, which is what
  produced the hard-edged rectangular blocks down the sides of the page. Both
  promotions were removed and both removals also made it faster. Do not add
  `will-change`, `translateZ(0)`, or `backface-visibility` to any atmosphere element.

## Working with this Figma file — read this before you open the MCP

File key `ELdFt6qc0Ex8enNX0ksdv0`. Frames: `252:429` (home, 1512), `305:48` (mobile,
402), `307:165` (About), `362:46` (the home background with content stripped out).

The file has fought every attempt to read geometry out of it programmatically. What
went wrong, so you do not repeat it:

- **Positions are reported three different ways for the same node.** Frame 7 on the
  home page: the page metadata says `y=3112`, the generated code says `2464`, the
  isolated background copy renders it at `2304`. Only 2464 joins Frame 6 without a
  visible banded step. Several other nodes report their **far edge** as `y` — Group 17
  on About reports 3772.32 for a node 1578.6 tall that starts at 2193.72, and the home
  frame reports 3986.32 for one that starts at 2407.72. When the numbers disagree,
  **the render settles it**: sample a column of the exported PNG and find where the
  value actually steps.
- **Rotated groups report their pre-rotation box.** The 402 frame's edge groups
  (34, 35, 36, 37, two called 17, two called 21) come back as boxes like "961 wide at
  x=-43" and "885 wide at x=444" inside a 402-wide frame. Reconstructing them from
  those numbers put a bright wash straight across the footer navigation — that attempt
  was reverted, and the `EdgeWash` measurement exists because of it. `get_design_context`
  on such a node returns the node in isolation with no placement transform, so it does
  not help either. **If you need real geometry for a rotated group, ask the client to
  select it in the Figma desktop app and read you the transform, or to export the group
  at frame scale as a PNG so it can be placed by measurement.**
- **`get_design_context`'s flat output collapses layer effects.** Backdrop blur,
  inner-shadow rims, gradient strokes and glows all come back as one base fill. For
  anything with an effect on it, pull `get_screenshot` at a high `maxDimension` and
  replicate what you see. `Vector 3` looked like a glow in the export and turned out to
  be the header plate (`#101113` at 0.5 plus a gradient stroke).
- **Group 45 on the About page** was placed on the strength of its bounding box and
  measured 69.1 where the design is 17.8. Reverted. It is still unplaced, and it is
  one of the things the About right edge is short of.
- **Exports carry a dark 1–2px border.** The design PNG reads 68 at x=0 where x=6 reads
  130 and our render reads 132–147 across both. That first column is an antialiasing
  artefact of the export, not the design. Do not chase it.
- **Some exports are partial.** `.figma/mobile-full.png` is 402x3888 and stops after the
  products section; the full frame is `.figma/mobile-frame-full.png` at 402x5011,
  pulled fresh with `get_screenshot` on `305:48` at `maxDimension: 5011`. Check the
  height of any reference before trusting a full-page comparison against it.

### What to ask the client for

They have the file open and can answer these in seconds where the MCP cannot:

1. **The rotated edge groups on the 402 frame** — 375:105 (Group 34), 375:117 (35),
   375:127 (36), 375:131 (37), 375:113 (17), 375:97 (21), 305:112 (21). For each: the
   rotation angle, the unrotated child size, and the placement box, as the Figma
   inspector shows them. With those, the mobile edges could go back to being the
   design's actual vectors instead of a measured approximation — worth doing only if
   the approximation stops being good enough.
2. **Group 45 and Group 46 on the About page** — same information. These are what the
   right edge is short of between y≈700 and y≈1400.
3. **Whether the 1512 frame is the intended maximum**, or whether the design is meant
   to keep growing on a 2560 monitor. Everything above 1512 is currently a judgement
   call: the content centres at its drawn size and the edge light is continued outward.
4. **Whether the tablet range has a drawn frame anywhere in the file.** 402 and 1512
   are the only two found. Everything between 640 and 1024 is invented, and it is the
   range they have complained about most.
5. **Whether the mobile page is allowed to be taller than the frame.** It is 5275
   against 5011 because the copy re-wraps at the same type size. Every vertical
   position in the mobile atmosphere is a fraction of the page for this reason.

## Hard constraints (from the client, non-negotiable)

- The background is **coded, not images**. No PNG/JPEG backgrounds, ever.
- **1:1 pixel fidelity to Figma** at the two drawn frames: 1512 wide (desktop,
  `.figma/design-full.png`, 1512x3984) and 402 wide (mobile,
  `.figma/mobile-frame-full.png`, 402x5011). About page: `.figma/about-full.png`.
- Never commit `.env.local`.
- Do not time `requestAnimationFrame` to judge scroll cost — it is main-thread and
  says nothing about compositor jank. Do not measure under an emulated DPR.
- "Firefox is slow at X" is not an acceptable answer. Find the actual cost.
- Verify every visual change with Chrome DevTools MCP, and re-check fidelity
  numerically (see "How to measure" below). Do not report a fix from a metric that
  averages over a region you chose — crop the region and look at it.

## What has already been done (do not redo)

### 1. One scale for the whole design — the architectural change

The codebase was 278 `rem` values against 7 `px`. So the root font size is now the
single dial that maps a Figma frame onto a screen (`src/app/globals.css`, `@layer base`):

```css
html { font-size: 16px; }
@media (width < 25.125rem) { html { font-size: max(14px, 3.9801vw); } }
@media (width >= 64rem)    { html { font-size: clamp(12px, 1.0582vw, 16px); } }
```

`1.0582vw` is `16/1512`. Consequences, all verified:

- At 1512 the root is exactly 16px and the page is 3984 tall — the frame's own height.
- At 1280 the industries grid tracks measure 429.99 / 392.01 / 450.02 in design units
  (the frame's 430 / 392 / 450) and the page is 3997 design-tall against 3984.
- At 1024 the root floors at 12px, body copy 13.5px, no horizontal overflow.
- Below 1134 the column would be wider than the window, so the **gutter** absorbs it:
  `CONTAINER` in `src/components/layout/section.tsx` is
  `lg:px-[min(6.5rem,calc((100vw-81.5rem)/2))]` — the design's 104 wherever there is
  room, whatever is left over when there is not.

Every design-pixel measurement in the atmosphere now goes through
`designPx()` in `src/lib/design/units.ts` (`px / 16` → `rem`), so the light scales in
lockstep with the content it lights. `relativeTo` survives on `GlowLayer` and
`RefractionFrame` only as an escape hatch for surfaces that are not drawn frames
(the dashboard shell, and the mobile tiles above 640 — see below).

### 2. Structure vs. decoration

`src/components/atmosphere/page-atmosphere.tsx` splits the desktop layers:

- **Tiles carry structure** (the `field` vector has a dark waist ~5/12 across that is
  drawn to land on the hero artwork). They live in a `max-w-[94.5rem]` column so they
  track the content. Stretching them to the viewport put that waist at 160/255 on a
  1905 screen where the design has 4.7.
- **Streaks carry none** — they decorate an edge, and the edge is the screen's. They
  hang off the full-width parent.

### 3. Edge washes — the measured, coded replacement for unplaceable vector groups

`src/lib/design/edge-wash.ts` + `src/components/atmosphere/edge-wash.tsx`.

Three surfaces, each a vertical colour ramp (`linear-gradient(to bottom, ...)`) masked
by a horizontal falloff (`linear-gradient(to right, ...)`):

| surface | what it is | how it composites |
|---|---|---|
| `mobile` | the 402 frame's eight edge groups (34/35/36/37, two 17s, two 21s), which Figma reports as pre-rotation boxes that cannot be placed | `plus-lighter` over the tiles, ramp = design − our render |
| `about` | what the About hero tile is short of on the right and the footer band at both ends | same |
| `frame` | the 1512 frame's own edge, continued **outward** past the column on a screen wider than 1512 | normal compositing, `right-full` / `left-full`, nothing beneath it |

All ramp stops are **fractions of the page**, not pixels, so they track copy re-wrap
(the mobile page is 5275 tall against the frame's 5011).

Measured results:

- Mobile edge light, mean error against the frame render over 26 samples down each side:
  left **18.5 → 2.6**, right **26.1 → 4.2**.
- 1512 desktop: RAW mean ~5.7–6.5 against `design-full.png` (varies with GSAP reveal
  state at capture; the >12 band list is stable).
- 1920: no seam at the column edge (x200→x210 reads 118.0→128.9, x1700→x1710
  131.7→133.3) and light reaches both screen edges.

**Why the `frame` wash is a gradient and not a mirrored copy of the tile.** It was a
mirrored copy first — three `<HeroTile />`s with `transform: scaleX(-1)` about the
tile's own edges. It worked in Chromium and did **not** paint in Zen/Gecko: the client's
screenshot at a 1901 window showed the light spanning exactly 1545px (the tile at design
size) with hard vertical ink bands either side. The mirrored copy carries a
`isolation: isolate` + `mix-blend-mode: plus-lighter` refraction stack under a mirroring
transform, which is the fragile combination. The gradient uses no blend mode, no
transform, and no isolate — verify it renders in Zen before doing anything else.

### 4. Other fixes in the working tree

- Industries grid: proportional `lg:grid-cols-[430fr_392fr_450fr]` with body measures as
  a share of the copy column (`lg:max-w-[82.53%]` / `[91.32%]` / `[89.59%]`). At a true
  1512 the icons land at 135.83 / 565.83 / 957.84 (design 136 / 566 / 958) and the body
  boxes at 241.03 / 241.98 / 284.05 (design 241 / 242 / 284).
- Mobile tiles hold the frame's width up to 402 and fill the screen above it
  (`MobileLayer` wraps children in `max-w-[25.125rem] sm:max-w-none`, tiles use
  `relativeTo={402}`), so tablet no longer ends the hero light on a hard vertical line a
  third of the way across. **This is written but not yet verified — start here.**

## What is left

1. **Verify in Zen (Gecko).** Open `http://localhost:3000` in Zen at >1512 and confirm
   the light reaches both screen edges with no vertical step. This is the client's live
   complaint. If it still fails, the cause is not the bleed — instrument rather than
   guess (`Services.profiler`, `CONTENT_FULL_PAINT_TIME`, `RasterizeSingleBlob`; drive it
   over raw Marionette on TCP 2828 with a cold start and real APZ wheel events, and
   capture with macOS `screencapture` — browser screenshot APIs force a repaint and hide
   compositor artefacts).
2. **Verify the tablet band** (640–1024) at 768 and 900. Before the last edit, 768 showed
   the mobile hero scaled 1.4x with a 60px full-width CTA and the hero tile ending at
   x≈481 of a 753 viewport. Confirm the tile now reaches the edges; then judge whether
   `sm:scale-[1.2] md:scale-[1.4]` on `src/components/sections/mobile-hero.tsx` is still
   the right call, or whether the tablet should hold the 402 composition at its drawn
   size and let the reflow (`sm:grid-cols-2` etc.) use the room.
3. **About page**: RAW 6.92 → 7.46 after its wash. The edge metrics all improved
   (y2800 left 33→46 against 50, right 36→50 against 54; y0 right 107→115 against 135)
   and the regression is in the *middle* columns, which the wash does not touch — almost
   certainly GSAP reveal state differing between the two captures. Confirm with two
   captures taken in one session, one with the wash disabled via injected CSS.
4. **The About hero's right side is still ~20 short** (115 against 135). The tile's glow
   is centred 270px left of the frame centre per the file's own numbers; check whether
   `render={{ width: 2347.8, height: 1529.243 }}` on that `GlowLayer` is the right
   instanced size before adding more wash.
5. **Sweep every width with Chrome DevTools** — 390, 402, 640, 768, 900, 1024, 1280,
   1440, 1512, 1920, 2560 — checking `document.documentElement.scrollWidth === clientWidth`
   and that grid tracks stay in design ratio. Ignore elements with a non-`none`
   `transform`: those are GSAP from-states, not overflow.
6. **Nothing is committed.** The client asked to verify before pushing. When they
   approve, conventional commits, and `git log` author must be `mahir-prenoma`.

## The question the client actually asked

> "if the design was hard coded what you can do is create a gradient layer then add the
> fractal glass layer above it to create the same effect — or go research how to make
> this design optimized and dynamically adjustable, more responsive and not just
> responsive after hard code."

The answer so far, which you should extend rather than restart:

- **Responsiveness** is the root-font-size dial. One number derived from the frame,
  no per-breakpoint patching. A width nobody tested is still the design.
- **The gradient-over-vector idea is right, and it is already in use** — that is exactly
  what `EdgeWash` is, and it measurably beat the vector groups it replaced (18.5 → 2.6).
  The open question is how much further it should go: the two dim `fieldDim` tiles and
  the footer band may also be separable into ramp × falloff, which would remove three
  more blurred SVGs. Measure before replacing: sample the design render, build the
  candidate gradient, and compare the two numerically at 1512 before keeping it.
- **What must stay vector** is the hero `field` tile. Its dark waist is a shape, not a
  ramp — the last shape in the group is filled with page ink and painted over the bright
  ones, which no gradient reproduces — and the refraction ridges on top of it are a
  1-D remap of that shape.

## How to measure

### Keep the browser out of the client's way

The client works on this machine while you verify, and every browser window that jumps
to the front interrupts them. They have asked for this explicitly, more than once.

- Open pages with `new_page` and **`background: true`**. Never open one in the
  foreground, and do not call `select_page` to bring one forward.
- Reuse the one page you opened for the whole session. Opening a page per check is what
  produces a stream of window activations.
- Set the viewport with **`emulate`**, not `resize_page`. `resize_page` moves the real
  OS window — it also silently fails to grow past the physical screen, which is how an
  early "1512" measurement was actually taken at 953px. `emulate` changes only the page's
  own metrics, works at any width including 2560, and touches nothing on screen.
- Take screenshots to `filePath` and read the file, rather than attaching them inline —
  it keeps the window untouched and the context small.
- Scroll with `window.scrollTo` inside `evaluate_script`, not by clicking or keying.
- Do not use `performance_start_trace` unless you actually need a trace; it reloads and
  focuses the page.

If a page becomes stale or errors, close it and open a fresh background one — but at
most twice, then stop and report the exact error rather than cycling windows.

### The numbers

- Dev server: `npm run dev`, port 3000. Restarting it changes the chunk hashes, so any
  browser tab left open goes stale — the client hit this once and reported the site as
  broken when it was a cached stylesheet. Tell them to hard-reload after a restart.
- Suppress the scrollbar before any fidelity capture, or the design lands 15px narrow:
  inject `html{scrollbar-width:none}` and confirm `document.body.clientWidth` is exactly
  the emulated width before screenshotting.
- Scroll the whole page in ~400px steps with a short wait, then return to 0 and wait
  ~1.4s, so GSAP reveals have settled before a `fullPage` capture. Even then some
  elements can be caught pre-reveal — check a suspicious region with a viewport
  screenshot at that scroll position before believing it is a layout bug.
- `.shots/shoot1512.py <render.png>` prints RAW mean/p95 against `design-full.png`, the
  multi-row bands over 12, and a left/right edge table every 240 rows.
- For edge work, sample columns 0..3 and -3.. of both renders down the page at matched
  *fractions* (the pages are different heights), mask the rows where content reaches the
  edge (the full-bleed hero photograph at y 780–1078 and the footer panel below 4955 on
  mobile), interpolate across them, and smooth over ~81 rows.
