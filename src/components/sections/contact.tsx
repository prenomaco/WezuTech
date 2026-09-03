import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/layout/section";
import { DisplayTitle } from "@/components/ui/typography";
import { contact } from "@/content/site-content";

/**
 * Figma: "LET'S / CONNECT" at x=177, y=3227 against the form starting at
 * x=627. Relative to the 1304px content column that is a 73px indent and a
 * 523px first track, with the two 346px field columns filling the rest.
 */
/* Both tracks resolve to their exact Figma widths at 1512 and shrink below it,
   so the form is never clipped by the section on a 1280 desktop. */
const LAYOUT =
  "grid grid-cols-1 " +
  "lg:grid-cols-[minmax(0,32.6875rem)_minmax(0,44.25rem)]";

/** The headline is optically centred against the form, not its first row. */
const TITLE_OFFSET = "mb-[2.5rem] text-center lg:mb-0 lg:mt-[10.3125rem] lg:pl-[4.5625rem] lg:text-left";

/**
 * The About page places this block on its own rhythm, so the spacing above and
 * below it is the caller's to set; the values here are the home frame's.
 */
export function Contact({ className = "pt-[3.1875rem] pb-[6.3125rem]" }: { readonly className?: string }) {
  return (
    <Section id="contact" className={className}>
      <div className={LAYOUT}>
        <DisplayTitle className={TITLE_OFFSET} data-motion="contact-title" size="section">
          {contact.title.map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
        </DisplayTitle>
        <ContactForm />
      </div>
    </Section>
  );
}
