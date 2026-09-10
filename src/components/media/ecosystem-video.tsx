"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";

const POSTER = "/media/industrial-ecosystem-transparent.webp";
const VIDEO_VARIANTS = {
  desktop: { media: "(min-width: 1024px)", src: "/media/industrial-ecosystem-1280p.mp4" },
  mobile: { media: "(max-width: 1023px)", src: "/media/industrial-ecosystem-720p.mp4" },
} as const;

type VideoVariant = keyof typeof VIDEO_VARIANTS;

interface NetworkInformationWithSaveData {
  readonly saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  readonly connection?: NetworkInformationWithSaveData;
}

function shouldRemainStill() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
  return reducedMotion || saveData === true;
}

export function EcosystemVideo({ className, variant }: { readonly className?: string; readonly variant: VideoVariant }) {
  const captionId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = VIDEO_VARIANTS[variant];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldRemainStill()) return;

    let isVisible = false;
    const updatePlayback = () => {
      if (isVisible && !document.hidden) void video.play().catch(() => undefined);
      else video.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        updatePlayback();
      },
      { rootMargin: "160px 0px", threshold: 0.05 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", updatePlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePlayback);
      video.pause();
    };
  }, []);

  return (
    <figure className={cn("relative overflow-hidden bg-transparent", className)} data-motion="about-artwork">
      <video
        aria-describedby={captionId}
        className="ecosystem-video-surface block h-full w-full object-cover"
        height={720}
        loop
        muted
        playsInline
        poster={POSTER}
        preload="metadata"
        ref={videoRef}
        width={1280}
      >
        <source media={source.media} src={source.src} type="video/mp4" />
      </video>
      <figcaption className="sr-only" id={captionId}>
        An animated industrial technology ecosystem connecting vehicles, transport systems and control electronics.
      </figcaption>
    </figure>
  );
}
