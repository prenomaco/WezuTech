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
const LAYOUT = "grid grid-cols-[minmax(0,523px)_minmax(0,708px)]";

/** The headline is optically centred against the form, not its first row. */
const TITLE_OFFSET = "mt-[165px] pl-[73px]";

export function Contact() {
  return (
    <Section id="contact" zone="contact" className="pt-[51px] pb-[101px]">
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
