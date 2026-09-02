"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SiteMotion() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hoverListeners: Array<() => void> = [];
    const context = gsap.context(() => {
      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
      hero
        .from(".site-header", { autoAlpha: 0, y: -16, duration: 0.55 })
        .from(".hero-title", { autoAlpha: 0, y: 28, duration: 0.7, stagger: 0.14 }, "-=0.2")
        .from(".hero-vehicles", { autoAlpha: 0, y: 34, scale: 0.95, duration: 1.05 }, "-=0.62")
        .from(".hero-intro", { autoAlpha: 0, y: 18, duration: 0.55 }, "-=0.45")
        .from(".hero-ctas", { autoAlpha: 0, y: 14, duration: 0.45 }, "-=0.28");

      const reveal = (target: string, trigger: string, vars: gsap.TweenVars = {}) => {
        const elements = gsap.utils.toArray(target);
        if (!elements.length) return;
        gsap.from(elements, {
          autoAlpha: 0,
          y: 34,
          duration: 0.75,
          ease: "power3.out",
          ...vars,
          scrollTrigger: { trigger, start: "top 77%", once: true },
        });
      };

      reveal("#about .eyebrow", "#about", { x: -18, y: 0 });
      reveal("#about .about-grid > div", "#about", { x: -30, y: 0, delay: 0.08 });
      reveal("#about .about-grid img", "#about", { x: 34, y: 0, duration: 0.95 });
      reveal("#products .products-title", "#products", { y: 18 });
      reveal(".product-card", "#products", { y: 24, duration: 0.85 });
      reveal(".industry-grid article", "#gallery", { y: 26, stagger: 0.075, duration: 0.55 });
      reveal(".testimonial > .eyebrow", ".testimonial", { y: 16 });
      reveal(".testimonial-stage", ".testimonial", { scale: 0.975, y: 22, duration: 0.8 });
      reveal(".dots", ".testimonial", { y: 12, duration: 0.45, delay: 0.18 });
      reveal(".connect-title", "#contact", { x: -26, y: 0 });
      reveal(".contact-form", "#contact", { x: 28, y: 0, duration: 0.8 });
      reveal(".site-footer", ".site-footer", { y: 28, duration: 0.7 });

      gsap.to(".hero-beam", { y: 16, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(".dots b", { scale: 1.12, duration: 1.15, ease: "sine.inOut", repeat: -1, yoyo: true });

      for (const card of gsap.utils.toArray<HTMLElement>(".industry-grid article, .product-card")) {
        const enter = () => gsap.to(card, { y: -6, duration: 0.24, ease: "power2.out", overwrite: "auto" });
        const leave = () => gsap.to(card, { y: 0, duration: 0.36, ease: "power2.out", overwrite: "auto" });
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        hoverListeners.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      }
    }, document.body);

    return () => {
      hoverListeners.forEach((remove) => remove());
      context.revert();
    };
  }, []);

  return null;
}
