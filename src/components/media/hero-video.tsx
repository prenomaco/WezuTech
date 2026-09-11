import { cn } from "@/lib/cn";

/**
 * The hero footage is a 1920 x 440 banner, so every composition that places it
 * gives its box the clip's own ratio and leaves `object-cover` nothing to crop.
 * Any other box turns a 4.36:1 clip into a single hugely magnified frame.
 *
 * Two encodes of the same shot. The 1920-wide master is 4.5MB, which is a lot
 * to send to a phone to fill a 370px-wide band; the 960-wide encode is 1.0MB
 * and is already more pixels than that band can show. The desktop composition
 * is the only place the master is actually resolved.
 */
export const HERO_VIDEO = {
  src: "/videos/hero-section.mp4",
  mobileSrc: "/videos/hero-section-mobile.mp4",
  /** Below the `lg` breakpoint, where the 402 composition takes over. */
  mobileMedia: "(max-width: 1023px)",
  aspect: "aspect-[1920/440]",
} as const;

/**
 * The hero clip itself, shared by the 1512 and 402 compositions so both frames
 * play the same footage with the same attributes. `muted` and `playsInline`
 * together are what let a phone start it inline and unprompted: iOS refuses to
 * autoplay a clip that is missing either, and treats a bare `autoPlay` as a
 * request to go fullscreen. Each composition owns the placement and the box.
 */
export function HeroVideo({ className }: { readonly className?: string }) {
  return (
    <video
      autoPlay
      className={cn("block size-full object-cover", className)}
      data-motion="hero-vehicles"
      loop
      muted
      playsInline
    >
      {/*
        * Order matters, and so does `media`.
        *
        * The browser walks the sources and takes the first whose `media`
        * matches, so the phone encode has to come first with the query that
        * selects it and the master second with none — that way a desktop
        * falls past the first and lands on the full-resolution file.
        *
        * Both entries are the same footage at different sizes, which is what
        * makes this safe: `media` on a `<source>` is evaluated once, when the
        * element loads, so a tablet rotated across 1024px keeps whichever it
        * picked. The cost of being "wrong" is a slightly softer or slightly
        * larger file, not a missing video.
        */}
      <source media={HERO_VIDEO.mobileMedia} src={HERO_VIDEO.mobileSrc} type="video/mp4" />
      <source src={HERO_VIDEO.src} type="video/mp4" />
    </video>
  );
}
