"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { figmaAssets } from "@/lib/figma-assets";

const testimonials = [
  {
    lead: "Wezu Technologies",
    quote: " has consistently delivered innovative solutions for our automotive projects. Their practical designs, quality focus, and attention to detail have been remarkable.",
    client: "Automotive OEM Client",
    title: "Exceptional Innovation and Service",
  },
  {
    lead: "",
    quote: "The team combined strong engineering knowledge with a clear understanding of production constraints. Their responsive approach helped us move from concept to a dependable solution without losing momentum.",
    client: "Mobility Systems Partner",
    title: "Practical Expertise, Delivered",
  },
  {
    lead: "",
    quote: "Wezu brought real clarity to a complex electrification programme. The hardware and software thinking felt connected from day one, and every milestone was handled with care.",
    client: "Electric Vehicle Manufacturer",
    title: "A Trusted Development Partner",
  },
  {
    lead: "",
    quote: "Their focus on reliability, communication, and testing made a meaningful difference to our launch. We value the partnership and the confidence their work gives our operations team.",
    client: "Industrial Fleet Operator",
    title: "Reliability at Every Stage",
  },
] as const;

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const content = useRef<HTMLQuoteElement>(null);
  const testimonial = testimonials[activeIndex];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !content.current) return;
    gsap.fromTo(content.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: "power2.out", overwrite: "auto" });
  }, [activeIndex]);

  const move = (direction: number) => setActiveIndex((current) => (current + direction + testimonials.length) % testimonials.length);

  return <>
    <div className="testimonial-stage">
      <img className="testimonial-frame" src={figmaAssets.quoteFrame} alt="" />
      <button className="testimonial-arrow left" aria-label="Previous testimonial" onClick={() => move(-1)}><img src={figmaAssets.testimonialLeftArrow} alt="" /></button>
      <blockquote className="testimonial-copy" ref={content} aria-live="polite">
        “{testimonial.lead && <strong>{testimonial.lead}</strong>}{testimonial.quote}”
        <footer><strong>{testimonial.client}</strong><br />{testimonial.title}</footer>
      </blockquote>
      <button className="testimonial-arrow right" aria-label="Next testimonial" onClick={() => move(1)}><img src={figmaAssets.testimonialRightArrow} alt="" /></button>
    </div>
    <div className="dots" aria-label="Testimonial selection" role="tablist">
      {testimonials.map((item, index) => <button aria-label={`Show testimonial ${index + 1}`} aria-selected={activeIndex === index} className={activeIndex === index ? "active" : ""} key={item.client} onClick={() => setActiveIndex(index)} role="tab" type="button" />)}
    </div>
  </>;
}
