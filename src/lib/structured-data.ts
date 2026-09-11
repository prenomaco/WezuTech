import { contactDetails, postalAddress } from "@/content/site-content";
import { siteUrl } from "@/lib/env";
import type { ProductDetail } from "@/lib/product-detail";

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
    /* The registered address, now that the footer states it. Local search
       reconciles a business by name plus address, so leaving it out of the
       schema while printing it on the page was a missed signal. */
    address: { "@type": "PostalAddress", ...postalAddress },
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

export function videoObjectSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${siteUrl}/#industrial-ecosystem-video`,
    name: "Wezu Technologies industrial technology ecosystem",
    description:
      "An animated overview of connected vehicles, transport systems and industrial control electronics.",
    thumbnailUrl: `${siteUrl}/media/industrial-ecosystem-poster.jpg`,
    contentUrl: `${siteUrl}/media/industrial-ecosystem-1280p.mp4`,
    duration: "PT8S",
    inLanguage: "en",
    publisher: { "@id": ORGANISATION_ID },
  };
}

export function productSchema(product: ProductDetail) {
  const images = [product.media.hero, ...product.media.gallery.map((item) => item.url)]
    .filter(Boolean)
    .map((url) => new URL(url, siteUrl).toString());
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/products/${product.slug}#product`,
    name: product.name,
    description: product.seoDescription ?? product.introduction,
    url: `${siteUrl}/products/${product.slug}`,
    ...(images.length ? { image: images } : {}),
    brand: { "@type": "Brand", name: "Wezu Technologies" },
    manufacturer: { "@id": ORGANISATION_ID },
  };
}

/** One `<script type="application/ld+json">` per schema, already serialised. */
export function jsonLd(schema: object) {
  return { __html: JSON.stringify(schema) };
}
