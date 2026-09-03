import { contactDetails } from "@/content/site-content";
import { siteUrl } from "@/lib/env";

/**
 * Schema.org descriptions of the site, emitted as JSON-LD.
 *
 * Kept here rather than inline in each page so the organisation is described
 * once: search engines reconcile these by `@id`, and two pages disagreeing
 * about the same company is worse than neither of them saying anything.
 */
const ORGANISATION_ID = `${siteUrl}/#organisation`;

export function organisationSchema() {
  const email = contactDetails.find((detail) => detail.icon === "email")?.label;
  const phone = contactDetails.find((detail) => detail.icon === "phone")?.label;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: "Wezu Technologies",
    url: siteUrl,
    logo: `${siteUrl}/brand/mark.svg`,
    description:
      "Intelligent hardware and software systems for vehicles and mobility platforms, " +
      "from thermal management and vehicle control to power, diagnostics and connected electronics.",
    ...(email || phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            ...(email ? { email } : {}),
            ...(phone ? { telephone: phone } : {}),
          },
        }
      : {}),
  };
}

export function webPageSchema({
  path,
  name,
  description,
}: {
  readonly path: string;
  readonly name: string;
  readonly description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}${path}#page`,
    url: `${siteUrl}${path}`,
    name,
    description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    publisher: { "@id": ORGANISATION_ID },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Wezu Technologies",
    publisher: { "@id": ORGANISATION_ID },
  };
}

/** One `<script type="application/ld+json">` per schema, already serialised. */
export function jsonLd(schema: object) {
  return { __html: JSON.stringify(schema) };
}
