"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "@/components/analytics";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const payload = await response.json();
    if (response.ok) { form.reset(); setState("success"); setMessage("Thank you — our team will be in touch shortly."); trackEvent("generate_lead", { form_name: "website_contact" }); }
    else { setState("error"); setMessage(payload.error ?? "Something went wrong. Please try again."); }
  }
  return <form className="contact-form" onSubmit={submit}>
    <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <label>Name<input required name="name" placeholder="John Doe" minLength={2} /></label>
    <label>Email Address<input required name="email" type="email" placeholder="john@company.com" /></label>
    <label className="wide">Subject<input required name="subject" placeholder="Project enquiry" minLength={2} /></label>
    <label className="wide">Message<textarea required name="message" placeholder="Tell us about your site, application, or deployment requirements." minLength={10} rows={5} /></label>
    <div className="wide"><button className="button" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Submit Message"}</button>{message && <p className={state === "success" ? "form-success" : "form-error"} role="status">{message}</p>}</div>
  </form>;
}
