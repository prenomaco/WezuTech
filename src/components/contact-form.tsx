"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "@/components/analytics";
import { Button } from "@/components/ui/button";

type FormState = "idle" | "sending" | "success" | "error";

/**
 * Figma: two 346px columns with a 16px gutter. Name and Email share row one,
 * Subject occupies the left column only, and Message spans both at 160px tall.
 */
const GRID = "relative grid grid-cols-[repeat(2,minmax(0,21.625rem))] gap-x-4 gap-y-[0.8125rem]";

/** Label 22px + 8px gap + 50px field = the 80px block Figma repeats. */
const LABEL = "block text-base leading-[1.375rem] text-ice";
const FIELD =
  "field-underline block bg-transparent text-[1rem] leading-[1.375rem] text-ice outline-none placeholder:text-[rgb(218_233_202/0.4)]";

/* The frame does not use one rhythm: row one leaves 30px between a label's top
   and its field (label 3062 -> field 3092), rows two and three leave 27, and
   the message block sits 10px lower again. Matching the design means matching
   that irregularity rather than averaging it. */
const FIELD_GAP = { first: "mt-2", rest: "mt-[0.3125rem]" } as const;

interface FieldProps {
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type?: string;
  readonly className?: string;
  readonly gap?: keyof typeof FIELD_GAP;
}

function Field({ label, name, placeholder, type = "text", className, gap = "first" }: FieldProps) {
  return (
    <label className={`${LABEL} ${className ?? ""}`}>
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

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

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
      setMessage("Thank you — our team will be in touch shortly.");
      trackEvent("generate_lead", { form_name: "website_contact" });
    } else {
      setState("error");
      setMessage(payload.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <form className={GRID} data-motion="contact-form" onSubmit={submit}>
      {/* Bot trap: never shown, never focusable, submitted with the payload. */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        name="website"
        tabIndex={-1}
      />

      <Field label="Name" name="name" placeholder="John Doe" />
      <Field label="Email Address" name="email" placeholder="john@prenoma.co" type="email" />
      <Field gap="rest" label="Subject" name="subject" placeholder="Project query" />

      <label className={`${LABEL} col-span-2 mt-[0.5625rem]`}>
        Message
        <textarea
          className={`${FIELD} ${FIELD_GAP.rest} h-[10rem] w-[43.5625rem] resize-none`}
          minLength={10}
          name="message"
          placeholder="Lorem ipsum dolor siet amet"
          required
        />
      </label>

      <div className="col-span-2 -ml-1 mt-[2.625rem] flex items-center gap-4">
        <Button className="w-[10.625rem]" disabled={state === "sending"} type="submit">
          {state === "sending" ? "Sending…" : "Submit Message"}
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
