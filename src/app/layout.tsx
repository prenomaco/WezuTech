import type { Metadata } from "next";
import "@/app/globals.css";
import { AnalyticsConsent } from "@/components/analytics";
import { siteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Wezu Technologies | Engineering the next movement", template: "%s | Wezu Technologies" },
  description: "Intelligent hardware and software systems for the vehicles and mobility platforms of tomorrow.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Wezu Technologies", title: "Wezu Technologies", description: "Engineering the next movement." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<AnalyticsConsent /></body></html>;
}
