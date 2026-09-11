import type { Metadata } from "next";
import Link from "next/link";
import { LegalContact } from "@/components/legal-contact";
import "@/app/legal.css";

const DESCRIPTION = "How Wezu Technologies handles website enquiries and analytics preferences.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy-policy" },
  openGraph: { type: "website", url: "/privacy-policy", title: "Privacy Policy", description: DESCRIPTION },
};

export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <Link href="/">← Back to Wezu</Link>
      <h1>Privacy Policy</h1>
      <p>This policy explains how Wezu Technologies handles information submitted through this website and your optional analytics preference.</p>
      <h2>Information you share</h2>
      <p>When you send an enquiry, we receive your name, email address, subject and message, together with any phone number, company details or product interest supplied through the form. Please avoid including sensitive personal information that is not needed to discuss your enquiry.</p>
      <h2>How enquiries are handled</h2>
      <p>Enquiries are stored in our enquiry-management system and may be included in email notifications to the team. We use these details to respond, understand your requirements and manage related business communications. Website hosting, database and email services process information as part of providing these functions.</p>
      <h2>Analytics and browser storage</h2>
      <p>The site stores your analytics choice in your browser. Optional Google Analytics loads only after you accept analytics and when it is configured for the website. We do not send contact-form fields to Google Analytics. Choosing “Only necessary” lets you continue using the site without optional analytics.</p>
      <p>To choose again, clear this website’s cookies and site data in your browser settings, then reload the page. Hosting services may also process technical request information to deliver and protect the website.</p>
      <h2>Your information and requests</h2>
      <p>You can contact us to request access to, correction or deletion of your enquiry information, or to ask us to stop further enquiry-related communications. We may need to verify that the request relates to you. Some records may need to be retained for an ongoing engagement or applicable legal obligations; please contact us for information about your specific record.</p>
      <h2>External links and changes</h2>
      <p>Third-party websites have their own privacy practices. Any updates to this website policy will be published here. Contact us if you have questions about how your enquiry is handled.</p>
      <LegalContact />
    </main>
  );
}
