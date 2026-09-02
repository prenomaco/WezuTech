# Contract — WezuTech desktop Figma parity rebuild

Figma: `ELdFt6qc0Ex8enNX0ksdv0` node `252:429` (MacBook Pro 14", 1512 × 3984)
Date: 2026-09-02
Scope: **desktop only** (≥1280px). Mobile deferred to a later contract.

## Problem statement (verified in browser, not assumed)

1. Every decorative "gradient/fractal" is a raster/vector **image** blown up to 2000–2350px
   (`.section-beam-*`, `.hero-beam`) with `mix-blend-mode: screen`. At 1502px viewport these
   cover the About / Products / Testimonial sections entirely — content is invisible.
2. `document.scrollWidth` = 1970 vs `clientWidth` = 1502 → horizontal overflow.
   Offenders: `.hero-intro`, `.hero-ctas` (margin blowout), `.section-beam-products` (−380 → 1970).
3. Motion is a flat list of `gsap.from(... y:34, autoAlpha:0)` reveals — no parallax, no depth,
   no scrub, uniform easing. Reads as generic.
4. Footer geometry does not match Figma (panel bounds, column x-positions, divider, copyright).

## Non-goals

- Backend (Prisma, NextAuth, admin, Cloudinary, Resend) is untouched.
- Resend wiring waits for client credentials.
- Mobile/tablet breakpoints.

## Target architecture

```
src/
  app/globals.css              @theme tokens + base + atmosphere primitives only
  content/site-content.ts      typed content model (single source of copy)
  lib/design/atmosphere.ts     declarative glow field spec (data, no JSX)
  components/
    atmosphere/                AtmosphereField — pure-CSS gradient layers
    ui/                        Button, SectionHeading, Icon* (inline SVG)
    layout/                    Header, Footer
    sections/                  Hero, About, Products, Industries, Testimonials, Contact
  motion/
    motion-scene.ts            abstract MotionScene contract
    scenes/*.ts                HeroScene, ParallaxScene, RevealScene, MarqueeScene
    motion-registry.ts         composes + owns gsap.context lifecycle
    site-motion.tsx            thin client mount point
```

## Rules

- TypeScript, Next 16 App Router, Tailwind v4 utilities, GSAP + ScrollTrigger.
- **No decorative images.** Every glow/beam/fractal is CSS gradient + `filter: blur()` + mask.
  Real content images (logo, vehicles, product renders, industry icons) stay as files.
- No `transition-all` anywhere GSAP touches an element or its parent.
- Functions < 50 lines, files < 400 lines, max 4 levels nesting, no magic numbers
  (Figma coordinates live in named constants or CSS custom props).
- `prefers-reduced-motion: reduce` → no scroll-driven motion, final state rendered.
- Verify every visual change with Chrome DevTools screenshots against the Figma crop.

## Figma geometry reference (px @ 1512 frame)

| Element | x | y | w | h |
|---|---|---|---|---|
| Header logo group | 186 | 26 | 172 | 62 |
| Header nav frame | 875 | 31 | 463 | 44 |
| Hero image | 123 | −15 | 1174.5 | 783 |
| "ENGINEERING THE" | 166 | 231 | 444 | 82 |
| "NEXT MOVEMENT" | 962 | 613 | 388 | 82 |
| Hero intro | 104 | 732 | 709 | 72 |
| Hero CTAs | 103 | 838 | 231 | 44 |
| ABOUT US eyebrow | 104 | 1010 | 221 | 26 |
| About body | 107 | 1062 | 588 | 240 |
| About image (bleeds right) | 766 | 876 | 840 | 560 |
| OUR PRODUCTS | 587 | 1467 | 338 | 26 |
| Product image | 242 | 1525 | 377 | 402 |
| Product title | 687.6 | 1525 | 491.8 | 54 |
| Product body | 685 | 1598 | 610 | 249 |
| Product CTAs | 688 | 1886 | 496 | 44 |
| Product arrows | 169 / 1342.7 | 1708 | 19.7 | 39.4 |
| Industry icons row 1 | 136 / 566 / 958 | 2091 | 122 | 146 |
| Industry icons row 2 | 141 / 571 / 970 | 2270 | ~116 | 146 |
| Industry text cols | 274 / 693 / 1091 | 2105 / 2287 | 241–284 | — |
| WHAT PEOPLE SAY | 533 | 2562 | 444 | 28 |
| Quote body | 438.9 | 2670 | 634 | 104 |
| Testimonial arrows | 169 / 1342 | 2747 | 20.6 | 41.2 |
| Attribution | 614.6 | 2832 | 283 | 52 |
| Dots | 707.8 | 2950 | 95.4 | 11 |
| LET'S CONNECT | 177 | 3227 | 310 | 78 |
| Name / Email field | 627 / 989 | 3092 | 346 | 50 |
| Subject field | 627 | 3182 | 346 | 50 |
| Message field | 627 | 3282 | 697 | 160 |
| Submit | 623 | 3496 | 170 | 44 |
| Footer panel | 90 | 3641 | 1331 | 305 |
| Footer logo | 139 | 3678 | 200.6 | 73 |
| Footer contact block | 141 | 3765 | 165 | 88 |
| NAVIGATION / LEGAL | 581.9 / 1029.3 | 3702 | — | 25 |
| Nav link cols | 587.2 / 721.6 | 3746 | — | 96 / 59 |
| Legal links | 1029 | 3747 | 137 | 59 |
| Footer divider | 176 | 3880.5 | 1189.5 | 1 |
| Copyright | 465 | 3903 | 518 | 22 |

Container: 1512 frame, content spans x 104 → 1408 → **1304 max-width, 104px gutters**.
Header/footer inner rhythm uses the same gutters.

## Atmosphere field (sampled from the Figma render, 12×33 grid)

Base ink `#02071C`. Glow colour ramp `#0985CC → #7BA3C6 → #94B0C9`.

| y (of 3984) | left edge | right edge | note |
|---|---|---|---|
| 240–600 | `#6D97BA` | `#73A0C3` | hero bloom, brightest band, pinched at centre |
| 600–840 | `#42739B` | `#2A5F8A` | falloff |
| 840–1440 | `#184C77` → `#0D2442` | faint | about rail, left dominant |
| 1440–2400 | ink | ink | quiet band |
| ~2400 | `#103B64` | `#0C3860` | products/industries pulse |
| 3720 | `#244972` | `#245985` | footer approach |
| 3840–3984 | `#94B0C9` | `#83B4D2` | bottom bloom, both corners, widest |

Rendered as: left/right **edge blooms** (elliptical, anchored off-canvas), **comet streaks**
(tapered, rotated, blurred), a **bottom bloom**, and hero **vertical striations**.
Each node carries a `depth` factor consumed by `ParallaxScene`.

## Verification gate

- `npm run lint`, `npm run typecheck`, `npm run build` clean.
- `document.documentElement.scrollWidth === clientWidth` at 1512, 1440, 1280.
- Zero requests to `localhost:3845`; zero 404s in the network panel.
- Section-by-section screenshot diff against the Figma crops in `.shots/`.
