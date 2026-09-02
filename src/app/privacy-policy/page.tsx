import type { Metadata } from "next";
import Link from "next/link";
import "@/app/legal.css";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Wezu Technologies handles website enquiries and analytics preferences." };

export default function PrivacyPolicy() { return <main className="legal-page"><Link href="/">← Back to Wezu</Link><h1>Privacy Policy</h1><p>Wezu Technologies uses the details you submit through our contact form only to respond to your enquiry and manage potential-client communications.</p><h2>Analytics</h2><p>Optional Google Analytics is loaded only after you accept analytics in the consent banner. We do not send your contact-form details to Google Analytics.</p><h2>Contact</h2><p>To request access to or deletion of your enquiry information, contact Wezu Technologies using the details on this website.</p></main>; }
