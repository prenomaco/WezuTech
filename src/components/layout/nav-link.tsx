import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

/**
 * A navigation link that soft-navigates when it can.
 *
 * The site's nav was built entirely from plain `<a>` elements, so every move
 * between Home, About and Products threw the document away and reloaded the
 * whole app — fonts, GSAP, the atmosphere layers and all — when the router
 * already had the means to swap just the page. That is also why the intro
 * cover used to reappear on every visit to Home: a full load has no memory of
 * the one before it.
 *
 * Hash links stay ordinary anchors. `#contact` and `/#gallery` are handled by
 * `AnchorScroll`, which listens for anchor clicks and scrolls with the
 * page's own easing; routing those through the router would fight it.
 */
export function NavLink({
  href,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { readonly href: string }) {
  if (href.includes("#")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
