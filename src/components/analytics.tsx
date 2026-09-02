"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

const consentKey = "wezu-analytics-consent";

declare global { interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] } }

export function trackEvent(name: string, params?: Record<string, string>) {
  window.gtag?.("event", name, params);
}

export function AnalyticsConsent() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useSyncExternalStore(
    (callback) => { window.addEventListener("storage", callback); window.addEventListener("wezu-consent-change", callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener("wezu-consent-change", callback); }; },
    () => localStorage.getItem(consentKey) as "accepted" | "declined" | null,
    () => null,
  );
  const choose = (value: "accepted" | "declined") => {
    localStorage.setItem(consentKey, value);
    window.dispatchEvent(new Event("wezu-consent-change"));
  };
  return <>
    {consent === "accepted" && measurementId && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('consent','default',{analytics_storage:'granted'});gtag('config','${measurementId}',{anonymize_ip:true});`}</Script>
    </>}
    {consent === null && <aside className="consent" role="dialog" aria-label="Analytics preference" aria-live="polite"><div className="consent-copy"><p className="consent-eyebrow">Privacy settings</p><p className="consent-message">Analytics are optional and help us understand how the website is used. We never send your form details to Google. <a href="/privacy-policy">Learn more</a></p></div><div className="consent-actions"><button className="text-button" onClick={() => choose("declined")}>Only necessary</button><button className="button" onClick={() => choose("accepted")}>Accept analytics</button></div></aside>}
  </>;
}
