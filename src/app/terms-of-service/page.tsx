import type { Metadata } from "next";
import Link from "next/link";
import "@/app/legal.css";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms for using the Wezu Technologies website." };

export default function TermsOfService() { return <main className="legal-page"><Link href="/">← Back to Wezu</Link><h1>Terms of Service</h1><p>This website provides information about Wezu Technologies and its solutions. Product specifications, availability, and deployment requirements are subject to confirmation by Wezu Technologies.</p><h2>Enquiries</h2><p>Submitting an enquiry does not create a contract or obligation to supply products or services. Wezu Technologies will confirm applicable terms in writing for any engagement.</p></main>; }
