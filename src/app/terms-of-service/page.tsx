import type { Metadata } from "next";
import Link from "next/link";
import { LegalContact } from "@/components/legal-contact";
import "@/app/legal.css";

const DESCRIPTION = "Terms for using the Wezu Technologies website.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: DESCRIPTION,
  alternates: { canonical: "/terms-of-service" },
  openGraph: { type: "website", url: "/terms-of-service", title: "Terms of Service", description: DESCRIPTION },
};

export default function TermsOfService() {
  return (
    <main className="legal-page">
      <Link href="/">← Back to Wezu</Link>
      <h1>Terms of Service</h1>
      <p>This website introduces Wezu Technologies and its hardware, software and engineering solutions. These terms explain how you may use the website; a separate written agreement governs any purchase or project.</p>
      <h2>Product information and enquiries</h2>
      <p>Product images and descriptions are for general information. Specifications, availability, suitability for your application, pricing and deployment requirements must be confirmed with Wezu Technologies. Submitting an enquiry does not place an order or create an obligation to supply products or services.</p>
      <h2>Using this website</h2>
      <p>You may browse the website and contact us for legitimate business enquiries. Do not attempt unauthorised access, interfere with the website, submit malicious material or impersonate another person. Please provide accurate contact information and only share material you are entitled to share.</p>
      <h2>Content and third-party links</h2>
      <p>Website text, artwork, branding and other materials belong to Wezu Technologies or their respective owners. Viewing the website does not transfer ownership or grant a licence for commercial reuse. External websites and linked resources operate under their own terms and privacy policies.</p>
      <h2>Availability and project decisions</h2>
      <p>Website content may change and the site may occasionally be unavailable. Please confirm important technical or commercial information with us before relying on it for a project. Nothing on this page excludes rights or remedies that cannot be excluded under applicable law.</p>
      <h2>Privacy and updates</h2>
      <p>Our <Link href="/privacy-policy">Privacy Policy</Link> explains how website enquiries and analytics preferences are handled. Updates to these website terms will appear on this page; agreed project terms remain governed by the relevant written agreement.</p>
      <LegalContact />
    </main>
  );
}
