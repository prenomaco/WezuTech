import { contactDetails } from "@/content/site-content";

/** Existing business contacts, not an invented officer appointment. */
export function LegalContact() {
  return (
    <section aria-labelledby="grievance-contact">
      <h2 id="grievance-contact">Grievance redressal and contact</h2>
      <p>
        For a privacy request, website complaint or concern about these terms,
        contact Wezu Technologies using the details below. Please use the subject
        “Grievance / Privacy request” and include the relevant page or enquiry,
        a description of the concern and how we can reach you. Please do not send
        passwords, payment details or identity documents in your initial message.
      </p>
      <address className="mt-4 flex flex-col items-start gap-2 not-italic">
        <span>Wezu Technologies</span>
        {contactDetails.filter(({ icon }) => icon === "email" || icon === "phone").map(({ href, label }) => (
          <a href={href} key={href}>{label}</a>
        ))}
      </address>
      <p>
        This is the current business contact channel for grievance redressal.
        You can request the details of the person responsible for handling your concern through this channel.
      </p>
    </section>
  );
}
