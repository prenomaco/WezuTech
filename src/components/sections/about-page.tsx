import Image from "next/image";
import { Section } from "@/components/layout/section";
import { NotchedPanel } from "@/components/ui/notched-panel";
import { aboutPage } from "@/content/site-content";
import { CAPABILITIES_PANEL } from "@/lib/design/notched-frame";

/**
 * The About page's own sections (Figma node 307:165, a 1512 x 3151 frame).
 *
 * The page shares its header, testimonials, contact and footer with the home
 * page; what is new is the introduction, the capabilities panel and the process
 * line. Every length below is the frame's own, so they can be checked against
 * the file: the introduction runs x=106 with the artwork at x=875 y=256, the
 * panel spans x=136..1376 between y=824 and 1285, and the process line sits at
 * y=1399 with its paragraph at y=1458.
 *
 * The whole frame sets `text-transform: capitalize`, which is why the copy is
 * stored in sentence case and cased here.
 */

/** Node 374:279 — the fleet render beside the introduction. */
const FLEET = { src: "/figma/about-fleet.png", width: 601, height: 401 };

/**
 * Overused Grotesk Book 18.766px, white (node 307:233).
 *
 * The line box is 25, not the browser's "normal": node 374:244 is 75 tall for
 * three lines and node 374:242 is 125 for five.
 */
const BODY = "text-[1.172875rem] font-book leading-[1.5625rem] text-white capitalize";

/** Centauri 23px, white (node 307:234). */
const TITLE = "font-display text-[1.4375rem] leading-[1.625rem] text-white capitalize";

function Intro() {
  /* The heading sits at y=198 in the frame, and the header box above this
     section already accounts for its first 106. */
  return (
    <Section className="pt-[5.75rem]" innerClassName="relative">
      {/* x=875, y=256 against a section starting at y=0 — 58px above the copy. */}
      <Image
        alt="An electric truck, car, tram and bus"
        className="absolute top-[3.625rem] left-[57.8704%] hidden w-[39.7487%] max-w-none lg:block"
        data-motion="about-artwork"
        height={FLEET.height}
        priority
        sizes="(min-width: 1512px) 601px, 40vw"
        src={FLEET.src}
        width={FLEET.width}
      />

      <h1 className={`${TITLE} max-w-[37.8125rem]`} data-motion="contact-title">
        {aboutPage.title}
      </h1>

      <div
        /* One blank line between paragraphs, as the frame sets them. */
        className="mt-[1.625rem] flex max-w-[46.8125rem] flex-col gap-[1.5625rem]"
        data-motion="about-copy"
      >
        {aboutPage.intro.map((paragraph) => (
          <p className={BODY} key={(paragraph.lead ?? "") + paragraph.body.slice(0, 24)}>
            {paragraph.lead ? <strong className="font-bold">{paragraph.lead}</strong> : null}
            {paragraph.body}
          </p>
        ))}
      </div>

      {/* The artwork leads on a narrow screen, where there is no column to sit
          beside. */}
      <Image
        alt="An electric truck, car, tram and bus"
        className="mt-[2.5rem] w-full max-w-none lg:hidden"
        height={FLEET.height}
        sizes="100vw"
        src={FLEET.src}
        width={FLEET.width}
      />
    </Section>
  );
}

/**
 * "How we work" — six capabilities inside the notched panel (node 374:264).
 *
 * The columns start at x=222 / 547 / 952 inside the 1512 frame, so against the
 * panel's own left edge at 136 they are 86 / 411 / 816 across. Below `lg` they
 * stack, since three 340px columns cannot survive a phone.
 */
/**
 * Text measure per cell, from nodes 374:242 / 259 / 257 and 255 / 253 / 251.
 * The two rows differ by a few pixels, and that is what decides whether the
 * first cell wraps to five lines or four.
 */
const MEASURE = [293, 342, 338, 285, 354, 357] as const;

function Capabilities() {
  return (
    <Section className="pt-[4.5625rem]">
      <div className="relative mx-auto w-full max-w-[77.5rem] px-6 pt-[2.875rem] pb-[4rem] lg:px-[5.375rem]">
        <NotchedPanel gradientId="about-capabilities" shape={CAPABILITIES_PANEL} />

        <h2
          className="relative text-center font-display text-[1.4375rem] leading-[1.625rem] text-white capitalize"
          data-motion="products-heading"
        >
          {aboutPage.capabilitiesEyebrow}
        </h2>

        {/* The columns are not even: inside the panel's 1068 they start at
            86 / 411 / 816, so the tracks are 325 / 405 / 338. Each cell's copy
            is capped at its own measure from the frame, which is what decides
            where every one of them wraps. */}
        <div className="relative mt-[1.9375rem] grid grid-cols-1 gap-y-[2.75rem] sm:grid-cols-2 lg:grid-cols-[325fr_405fr_338fr]">
          {aboutPage.capabilities.map((item, index) => (
            <p
              className={BODY}
              data-motion="industry-item"
              key={item.title}
              style={{ maxWidth: MEASURE[index] }}
            >
              {item.title}
              <br />
              {item.body}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** The process line (node 374:248) and its paragraph (node 374:244). */
function Process() {
  return (
    <Section className="pt-[7.125rem]">
      {/* Centauri 24.94px. It is one unbroken line in the frame at 1248 wide,
          so it is allowed to wrap rather than overflow on anything narrower. */}
      <h2
        /* Node 374:248 is 29 tall for its single line. */
        className="text-center font-display text-[1.55875rem] leading-[1.8125rem] text-white capitalize"
        data-motion="testimonials-heading"
      >
        {aboutPage.process}
      </h2>

      <p
        className={`${BODY} mx-auto mt-[1.875rem] max-w-[50.6875rem] text-center`}
        data-motion="about-copy"
      >
        {aboutPage.processBody}
      </p>
    </Section>
  );
}

export function AboutIntro() {
  return (
    <>
      <Intro />
      <Capabilities />
      <Process />
    </>
  );
}
