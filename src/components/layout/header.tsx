import { HeaderPlate } from "@/components/layout/header-plate";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { primaryNav } from "@/content/site-content";

/**
 * Figma header, measured against the 1512 frame. Lengths are rem (16px base),
 * with the source pixel value noted so they can be checked against the file.
 *
 * The plate is `HeaderPlate` — a rotated vector whose corners are 30deg
 * chamfers, not radii. Children are placed at their Figma coordinates rather
 * than laid out with flex, so the lockup and nav land exactly where the design
 * puts them: logo group x=186 / y=26.371, nav frame x=875..1338, y=31, h=44.
 */
const HEADER_HEIGHT = "6.625rem"; /* 106 */
const LOGO_LEFT = "12.3016%"; /* 186 / 1512 */
const LOGO_TOP = "1.6482rem"; /* 26.371 */

/* The 402 frame (node 305:51) keeps the same lockup and puts it at x=50,
   y=19, with the menu glyph opposite it. */
const LOGO_LEFT_SM = "12.4378%"; /* 50 / 402 */
const LOGO_TOP_SM = "1.1875rem"; /* 19 */

/* Anchoring the nav frame and distributing inside it lands every item on its
   Figma x. A fixed 30px gap instead accumulates the sub-pixel difference
   between our webfont's advance widths and Figma's, drifting the row ~2.4px. */
const NAV_LEFT = "57.8704%"; /* 875 / 1512 */
const NAV_WIDTH = "30.6217%"; /* 463 / 1512 */
const NAV_TOP = "1.9375rem"; /* 31 */

export function Header() {
  return (
    <header
      className="absolute inset-x-0 top-0 z-30"
      style={{ height: HEADER_HEIGHT }}
      data-motion="header"
    >
      <HeaderPlate />

      <Logo
        className="absolute lg:hidden"
        style={{ left: LOGO_LEFT_SM, top: LOGO_TOP_SM }}
      />
      <Logo className="absolute hidden lg:block" style={{ left: LOGO_LEFT, top: LOGO_TOP }} />

      <MobileMenu />

      <nav
        className="absolute hidden h-11 items-center justify-between text-[1.125rem] leading-[1.5rem] lg:flex"
        style={{ left: NAV_LEFT, width: NAV_WIDTH, top: NAV_TOP }}
      >
        {primaryNav.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-mist transition-colors duration-200 ease-out hover:text-sky"
          >
            {label}
          </a>
        ))}
        <ButtonLink href="#contact">Contact Us</ButtonLink>
      </nav>
    </header>
  );
}
