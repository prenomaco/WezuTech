import { IconMail, IconPhone, IconUser } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { contact, contactDetails, footerNav, legalNav } from "@/content/site-content";
import type { ContactDetail } from "@/content/site-content";

/**
 * Figma "Rectangle 38": a 1331 x 305 panel inset 90px from each frame edge.
 *
 * Every offset below is measured from the panel's top-left. The three columns
 * are an even split of the panel width with a 49px leading indent, which puts
 * their starts at x=49 / 493 / 937 — the logo, "Navigation" and "Legal" nodes
 * sit at 49 / 491.9 / 939.3.
 */
/* The panel is inset 16 of 402 on the small frame and 90 of 1512 on the large
   one, so the inset is a custom property the breakpoint swaps rather than a
   value the component picks. */
const PANEL_INSET = "[--panel-inset:3.9801%] lg:[--panel-inset:5.9524%]";
const COLUMN_INDENT = "3.0625rem"; /* 49 */

/* Type, taken from the design rather than rounded: headings are Centauri
   21.112px, links Overused Grotesk 18.766px on a 25.8px line with a 9.383px
   gap (a 35.19px row pitch), contact rows 18px on a 24px line. */
const HEADING = "font-display text-[1.3195rem] leading-[1.539375rem] text-white";
const LINK = "text-[1.172875rem] font-book leading-[1.6125rem] text-white transition-colors hover:text-sky";
const DETAIL = "flex items-center gap-[0.4375rem] text-[1.125rem] leading-[1.5rem] text-white";

const DETAIL_ICON = {
  name: IconUser,
  email: IconMail,
  phone: IconPhone,
} as const;

function ContactRow({ detail }: { detail: ContactDetail }) {
  const Icon = DETAIL_ICON[detail.icon];
  const content = (
    <>
      <Icon className="shrink-0" />
      <span>{detail.label}</span>
    </>
  );
  return (
    <li className={DETAIL}>
      {detail.href ? (
        <a className="flex items-center gap-[0.4375rem] transition-colors hover:text-sky" href={detail.href}>
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}

export function Footer() {
  return (
    <footer className={`relative overflow-clip pb-[0.8125rem] lg:pb-[2.375rem] ${PANEL_INSET}`}>

      <div
        /* Figma "Rectangle 38" (node 252:541) is rgba(0,0,0,0.2) at a 20px
           radius with no stroke — the edge you can see in the render is the
           light behind it showing through. */
        className="relative z-10 rounded-[1.25rem] bg-black/20 px-6 pt-[2.3125rem] pb-[1.3125rem] lg:px-0"
        /* The entrance moves the panel rather than the footer. Translating the
           footer itself grows the document by the tween's offset until it
           plays, so the page loads 26px taller than the frame and settles
           afterwards. */
        data-motion="footer"
        style={{ marginInline: "var(--panel-inset)" }}
      >
        {/* Three even tracks across the full panel width, each indented 49px —
            that lands their contents on x=49 / 493 / 937. */}
        <div className="grid grid-cols-1 gap-y-[2.25rem] lg:grid-cols-3 lg:gap-y-0" style={{ ["--indent" as string]: COLUMN_INDENT }}>
          <div className="lg:pl-(--indent)">
            <Logo size="footer" />
            {/* Contact rows start at y=124 — 14px below the 73px lockup. */}
            <ul className="mt-[0.875rem] flex flex-col gap-[0.5rem] pl-[2px]">
              {contactDetails.map((detail) => (
                <ContactRow key={detail.label} detail={detail} />
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="lg:pl-(--indent)">
            <h2 className={`lg:mt-[1.5rem] ${HEADING}`}>Navigation</h2>
            {/* Five links as 3 rows x 2 columns, filled column-first, with the
                second column starting 134.35px across. */}
            <div className="mt-[1.210625rem] grid grid-flow-col grid-rows-3 justify-start gap-x-[5.375rem] gap-y-[0.586437rem] pl-[0.25rem]">
              {footerNav.map(({ label, href }) => (
                <a className={LINK} href={href} key={label}>
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <nav aria-label="Legal" className="lg:pl-(--indent)">
            <h2 className={`lg:mt-[1.5rem] ${HEADING}`}>Legal</h2>
            <div className="mt-[1.210625rem] flex flex-col gap-[0.53625rem]">
              {legalNav.map(({ label, href }) => (
                <a className={LINK} href={href} key={label}>
                  {label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Figma "Vector 53": x=176..1365.5, i.e. 86px in from the panel edge. */}
        <hr className="mt-[1.7175rem] w-full border-0 border-t border-[rgb(218_250_245/0.28)] lg:ml-[5.375rem] lg:w-[74.34375rem]" />

        <p className="mt-[1.34375rem] text-center text-[1rem] leading-[1.375rem] text-white lg:ml-[23.4375rem] lg:whitespace-nowrap lg:text-left">
          {contact.copyright}{" "}
          <a className="text-sky underline decoration-solid" href={contact.agency.href}>
            {contact.agency.label}
          </a>
        </p>
      </div>
    </footer>
  );
}
