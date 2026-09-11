"use client";

import { FormEvent, type RefObject, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics";
import { Button } from "@/components/ui/button";
import { PRODUCT_INTEREST_EVENT, type ProductInterestDetail } from "@/lib/product-interest";

type FormState = "idle" | "sending" | "success" | "error";

const MESSAGE_PLACEHOLDERS = [
  "Tell us about your idea, challenge, or next move.",
  "Share the system you want to improve.",
  "What should the next version do better?",
  "Tell us where your project feels stuck.",
  "Describe the outcome you want to create.",
] as const;

function useTypedPlaceholder(field: RefObject<HTMLTextAreaElement | null>) {
  const [placeholder, setPlaceholder] = useState<string>(MESSAGE_PLACEHOLDERS[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let visible = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (callback: () => void, delay: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(callback, delay);
    };
    const tick = () => {
      if (!visible || document.hidden) return;
      const phrase = MESSAGE_PLACEHOLDERS[phraseIndex];
      characterIndex += deleting ? -1 : 1;
      setPlaceholder(phrase.slice(0, characterIndex));
      if (!deleting && characterIndex === phrase.length) {
        deleting = true;
        schedule(tick, 1400);
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % MESSAGE_PLACEHOLDERS.length;
        schedule(tick, 320);
      } else {
        schedule(tick, deleting ? 24 : 42);
      }
    };
    const update = () => {
      if (visible && !document.hidden) schedule(tick, 180);
      else if (timer) clearTimeout(timer);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && characterIndex === 0) setPlaceholder("");
      update();
    }, { threshold: 0.35 });
    if (field.current) observer.observe(field.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      if (timer) clearTimeout(timer);
    };
  }, [field]);

  return placeholder;
}

/**
 * A few different openers so every visitor who clicks a product's quote
 * button doesn't submit the identical sentence. Each still ends in two blank
 * lines — the point is a running start, not a finished message — so there is
 * always room left for the visitor's own words.
 *
 * The pick is a hash of the product's name, not `Math.random()`: this value
 * has to come out of render (a `defaultValue`, so an in-page navigation from
 * one product's quote button reaches a fresh, unmounted textarea rather than
 * an uncontrolled one React just reuses), and this component is first
 * rendered on the server — a random pick there would rarely survive
 * hydration's server/client comparison intact.
 */
const MESSAGE_VARIATIONS: readonly ((name: string) => string)[] = [
  (name) => `Hey! I'm interested in ${name}.\n\n`,
  (name) => `Hi, I'd like to get a quote for ${name}.\n\n`,
  (name) => `Hello, could you tell me more about ${name}?\n\n`,
  (name) => `Hi there, I'm looking into ${name} for a project.\n\n`,
];

function messageFor(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return MESSAGE_VARIATIONS[hash % MESSAGE_VARIATIONS.length](name);
}

/**
 * Figma: two 346px columns with a 16px gutter. Name and Email share row one,
 * Subject occupies the left column only, and Message spans both at 160px tall.
 */
/* 402 frame: one 342-wide column, its rows on a 76px pitch. */
const GRID =
  "relative ml-[0.4375rem] grid w-[calc(100%-0.5rem)] grid-cols-1 gap-x-4 gap-y-[1.84375rem] " +
  "lg:ml-0 lg:w-auto lg:grid-cols-[repeat(2,minmax(0,21.625rem))] lg:gap-y-[0.8125rem]";

/** Label 22px + 8px gap + 50px field = the 80px block Figma repeats. */
/* 402 frame: labels are 18 tall against the 1512 frame's 22. */
const LABEL =
  "block text-[0.875rem] leading-[1.125rem] text-ice lg:text-base lg:leading-[1.375rem]";
const FIELD =
  "field-underline block bg-transparent text-[0.875rem] leading-[1.1875rem] text-ice outline-none placeholder:text-[rgb(218_233_202/0.4)] lg:text-[1rem] lg:leading-[1.375rem]";

/* The frame does not use one rhythm: row one leaves 30px between a label's top
   and its field (label 3062 -> field 3092), rows two and three leave 27, and
   the message block sits 10px lower again. Matching the design means matching
   that irregularity rather than averaging it. */
/* 402 frame: 5px between a label and its container, against the 1512
   frame's 8 and 5. */
const FIELD_GAP = {
  first: "mt-[0.3125rem] lg:mt-2",
  rest: "mt-[0.3125rem]",
} as const;

interface FieldProps {
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type?: string;
  readonly className?: string;
  readonly gap?: keyof typeof FIELD_GAP;
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  className,
  gap = "first",
}: FieldProps) {
  return (
    <label
      className={`${LABEL} ${className ?? ""}`}
      data-motion="contact-field"
    >
      {label}
      <input
        className={`${FIELD} ${FIELD_GAP[gap]} w-full`}
        minLength={type === "email" ? undefined : 2}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}

export function ContactForm({
  productName,
  productSlug,
}: {
  readonly productName?: string;
  readonly productSlug?: string;
}) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const prefilledMessage = productName ? messageFor(productName) : undefined;
  const messageField = useRef<HTMLTextAreaElement>(null);
  const messagePlaceholder = useTypedPlaceholder(messageField);

  /* The home page's carousel cards each carry their own "Contact For
     Purchase" button, but they all share this one Contact section rather
     than getting a form of their own — there's no prop path from a card's
     click to this field, so the click is broadcast as a DOM event instead
     and applied here imperatively (the field is uncontrolled, same as its
     `defaultValue` above). */
  useEffect(() => {
    function onInterest(event: Event) {
      const detail = (event as CustomEvent<ProductInterestDetail>).detail;
      if (!detail?.name || !messageField.current) return;
      messageField.current.value = messageFor(detail.name);
    }
    window.addEventListener(PRODUCT_INTEREST_EVENT, onInterest);
    return () => window.removeEventListener(PRODUCT_INTEREST_EVENT, onInterest);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json();
    if (response.ok) {
      form.reset();
      setState("success");
      setMessage("Thank you. Our team will be in touch shortly.");
      trackEvent("generate_lead", { form_name: "website_contact" });
    } else {
      setState("error");
      setMessage(payload.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    /* The fields carry the reveal, not the form: staggering them reads as a
       sequence to fill in, and animating both would double the movement. */
    <form className={GRID} onSubmit={submit}>
      {productSlug ? <input name="productSlug" type="hidden" value={productSlug} /> : null}
      {/* Bot trap: never shown, never focusable, submitted with the payload. */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        name="website"
        tabIndex={-1}
      />

      <Field label="Name" name="name" placeholder="Your name" />
      <Field
        label="Email Address"
        name="email"
        placeholder="you@company.com"
        type="email"
      />
      <Field
        className="col-span-full"
        gap="rest"
        label="Subject"
        name="subject"
        placeholder="What can we help you build?"
      />

      <label
        className={`${LABEL} col-span-full lg:mt-[0.5625rem]`}
        data-motion="contact-field"
      >
        Message
        <textarea
          className={`${FIELD} -mt-[0.3125rem] h-[4.125rem] w-full resize-none lg:mt-[0.3125rem] lg:h-[10rem] lg:w-[43.5625rem]`}
          defaultValue={prefilledMessage}
          key={productSlug ?? "general"}
          minLength={10}
          name="message"
          placeholder={messagePlaceholder}
          ref={messageField}
          required
        />
      </label>

      <div
        className="col-span-full flex flex-wrap items-center gap-4 lg:-ml-1 lg:mt-[2.625rem]"
        data-motion="contact-field"
      >
        <Button
          className="h-8 w-full !rounded-[0.5rem] lg:h-11 lg:w-[12.5rem]"
          disabled={state === "sending"}
          type="submit"
        >
          {state === "sending" ? "Sending…" : "Start a Conversation"}
        </Button>
        {message ? (
          <p
            className={`text-base leading-[1.5] ${state === "success" ? "text-ice" : "text-sky-bright"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
