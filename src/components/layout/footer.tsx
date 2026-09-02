import { Atmosphere } from "@/components/atmosphere/atmosphere";
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
const PANEL_INSET = "5.9524%"; /* 90 / 1512 */
const COLUMN_INDENT = 49;

/* Type, taken from the design rather than rounded: headings are Centauri
   21.112px, links Overused Grotesk 18.766px on a 25.8px line with a 9.383px
   gap (a 35.19px row pitch), contact rows 18px on a 24px line. */
const HEADING = "font-display text-[21.112px] leading-[24.63px] text-white";
const LINK = "text-[18.766px] leading-[25.8px] text-white transition-colors hover:text-sky";
const DETAIL = "flex items-center gap-[7px] text-[18px] leading-[24px] text-white";

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
        <a className="flex items-center gap-[7px] transition-colors hover:text-sky" href={detail.href}>
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
    <footer className="relative overflow-clip pb-[38px]" data-motion="footer">
      <Atmosphere zone="footer" />

      <div
        /* The hairline is an inset ring rather than a border so it does not
           consume a pixel of the panel's box and shift every child by 1. */
        className="relative z-10 rounded-[24px] bg-black/25 pt-[37px] pb-[21px] shadow-[inset_0_0_0_1px_rgb(218_250_245/0.16)] backdrop-blur-[2px]"
        style={{ marginInline: PANEL_INSET }}
      >
        {/* Three even tracks across the full panel width, each indented 49px —
            that lands their contents on x=49 / 493 / 937. */}
        <div className="grid grid-cols-3" style={{ ["--indent" as string]: `${COLUMN_INDENT}px` }}>
          <div className="pl-(--indent)">
            <Logo size="footer" />
            {/* Contact rows start at y=124 — 14px below the 73px lockup. */}
            <ul className="mt-[14px] flex flex-col gap-[8px] pl-[2px]">
              {contactDetails.map((detail) => (
                <ContactRow key={detail.label} detail={detail} />
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="pl-(--indent)">
            <h2 className={`mt-[24px] ${HEADING}`}>Navigation</h2>
            {/* Five links as 3 rows x 2 columns, filled column-first, with the
                second column starting 134.35px across. */}
            <div className="mt-[19.37px] grid grid-flow-col grid-rows-3 justify-start gap-x-[86px] gap-y-[9.383px] pl-[4px]">
              {footerNav.map(({ label, href }) => (
                <a className={LINK} href={href} key={label}>
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <nav aria-label="Legal" className="pl-(--indent)">
            <h2 className={`mt-[24px] ${HEADING}`}>Legal</h2>
            <div className="mt-[19.37px] flex flex-col gap-[8.58px]">
              {legalNav.map(({ label, href }) => (
                <a className={LINK} href={href} key={label}>
                  {label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Figma "Vector 53": x=176..1365.5, i.e. 86px in from the panel edge. */}
        <hr className="mt-[27.48px] ml-[86px] w-[1189.5px] border-0 border-t border-[rgb(218_250_245/0.28)]" />

        <p className="mt-[21.5px] ml-[375px] whitespace-nowrap text-[16px] leading-[22px] text-white">
          {contact.copyright}{" "}
          <a className="text-sky underline decoration-solid" href={contact.agency.href}>
            {contact.agency.label}
          </a>
        </p>
      </div>
    </footer>
  );
}
