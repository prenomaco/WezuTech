"use client";

import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";

const consentKey = "wezu-analytics-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params?: Record<string, string>) {
  window.gtag?.("event", name, params);
}

export function AnalyticsConsent() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      window.addEventListener("wezu-consent-change", callback);
      return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener("wezu-consent-change", callback);
      };
    },
    () => localStorage.getItem(consentKey) as "accepted" | "declined" | null,
    () => null,
  );
  const choose = (value: "accepted" | "declined") => {
    localStorage.setItem(consentKey, value);
    window.dispatchEvent(new Event("wezu-consent-change"));
  };
  return (
    <>
      {consent === "accepted" && measurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('consent','default',{analytics_storage:'granted'});gtag('config','${measurementId}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {consent === null && (
        <aside
          className="fixed bottom-[1.125rem] right-[1.125rem] z-50 max-w-[26.25rem] rounded-[1rem] border border-[rgb(218_250_245/0.3)] bg-ink-raised p-[1.125rem] shadow-[0_1rem_3.125rem_rgba(0,0,0,0.35)]"
          role="dialog"
          aria-label="Analytics preference"
          aria-live="polite"
        >
          <p className="font-display text-[0.9375rem] uppercase leading-none tracking-[0.06em] text-ice">
            Privacy settings
          </p>
          <p className="mt-3 text-[0.8125rem] leading-[1.4] text-mist">
            Analytics are optional and help us understand how the website is used. We never send your form
            details to Google.{" "}
            <a className="text-sky underline underline-offset-2" href="/privacy-policy">
              Learn more
            </a>
          </p>
          <div className="mt-4 flex justify-end gap-[0.875rem]">
            <Button variant="ghost" onClick={() => choose("declined")}>
              Only necessary
            </Button>
            <Button onClick={() => choose("accepted")}>Accept analytics</Button>
          </div>
        </aside>
      )}
    </>
  );
}
