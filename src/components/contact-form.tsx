"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "@/components/analytics";
import { Button } from "@/components/ui/button";

type FormState = "idle" | "sending" | "success" | "error";

/**
 * Figma: two 346px columns with a 16px gutter. Name and Email share row one,
 * Subject occupies the left column only, and Message spans both at 160px tall.
 */
const GRID = "relative grid grid-cols-[repeat(2,minmax(0,346px))] gap-x-4 gap-y-[13px]";

/** Label 22px + 8px gap + 50px field = the 80px block Figma repeats. */
const LABEL = "block text-base leading-[22px] text-ice";
const FIELD =
  "field-underline mt-2 block w-full bg-transparent text-base text-ice outline-none placeholder:text-mist/45";

interface FieldProps {
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type?: string;
  readonly className?: string;
}

function Field({ label, name, placeholder, type = "text", className }: FieldProps) {
  return (
    <label className={`${LABEL} ${className ?? ""}`}>
      {label}
      <input
        className={`${FIELD} h-[50px]`}
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
      <Field label="Email Address" name="email" placeholder="john@company.com" type="email" />
      <Field label="Subject" name="subject" placeholder="Project enquiry" />

      <label className={`${LABEL} col-span-2 mt-[9px]`}>
        Message
        <textarea
          className={`${FIELD} h-[160px] resize-none pt-[14px] leading-[1.5]`}
          minLength={10}
          name="message"
          placeholder="Tell us about your site, application, or deployment requirements."
          required
        />
      </label>

      <div className="col-span-2 mt-[38px] flex items-center gap-4">
        <Button className="w-[170px]" disabled={state === "sending"} type="submit">
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
