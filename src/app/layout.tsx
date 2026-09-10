import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { AnalyticsConsent } from "@/components/analytics";
import { AnchorScroll } from "@/components/anchor-scroll";
import { BackToTop } from "@/components/back-to-top";
import { siteUrl } from "@/lib/env";

const DESCRIPTION =
  "Wezu Technologies builds intelligent hardware and software for vehicles and mobility platforms: " +
  "thermal management, vehicle control, power, diagnostics and connected electronics.";

const SOCIAL_IMAGE = {
  url: "/figma/80d9a6f7455db9ebe3011c930e9d2a30d69a29c2.png",
  width: 1264,
  height: 843,
  alt: "Electric car, freight truck and passenger train engineered by Wezu Technologies",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wezu Technologies | Engineering the next movement",
    template: "%s | Wezu Technologies",
  },
  description: DESCRIPTION,
  applicationName: "Wezu Technologies",
  authors: [{ name: "Wezu Technologies", url: siteUrl }],
  creator: "Wezu Technologies",
  publisher: "Wezu Technologies",
  referrer: "origin-when-cross-origin",
  category: "technology",
  keywords: [
    "EV thermal management",
    "vehicle control systems",
    "automotive electronics",
    "OEM ODM mobility",
    "battery cooling systems",
    "connected vehicle hardware",
    "transportation engineering",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Wezu Technologies",
    title: "Wezu Technologies | Engineering the next movement",
    description: DESCRIPTION,
    locale: "en_US",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wezu Technologies | Engineering the next movement",
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  /*
   * The crawl rules live in `robots.ts` for the whole site; this repeats the
   * indexable defaults so a page that overrides `robots` (the admin routes do)
   * is opting out of something explicit rather than out of nothing.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
};

/** The design is dark throughout, so the browser chrome should match it. */
export const viewport: Viewport = {
  themeColor: "#02071c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        {children}
        <AnalyticsConsent />
        <AnchorScroll />
        <BackToTop />
      </body>
    </html>
  );
}
