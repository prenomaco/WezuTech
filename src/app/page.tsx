/* eslint-disable @next/next/no-img-element */
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCarousel } from "@/components/product-carousel";
import { getPublishedProducts } from "@/lib/catalog";
import { figmaAssets } from "@/lib/figma-assets";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

const industries = [
  ["Automotive", "Innovative control systems and electronics to enhance vehicle performance and safety."],
  ["Marine Applications", "Durable electronics built for marine environments, ensuring operational excellence."],
  ["Agriculture & Mining", "Reliable electronic solutions improving efficiency, safety, and productivity in demanding conditions."],
  ["Locomotive", "Reliable electronic solutions designed for optimal performance in rail transport."],
  ["Special Purpose Vehicles", "Tailored technology solutions for unique mobility and specialized vehicle needs."],
  ["Aerospace and UAV", "High-performance electronic systems built for safety, reliability, and demanding aviation applications."],
];

export default async function Home() {
  const products = await getPublishedProducts();
  const jsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "Wezu Technologies", url: siteUrl, description: "Intelligent mobility hardware and software systems." };
  return <main id="home"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><section className="hero"><div className="hero-beam" /><Header /><div className="hero-grid"><div className="hero-title">ENGINEERING<br />THE</div><img className="hero-vehicles" src={figmaAssets.heroVehicles} alt="Electric mobility vehicles" /><div className="hero-title next">NEXT<br />MOVEMENT</div></div><p className="hero-intro">Wezu Technologies designs and develops intelligent hardware and software systems for the vehicles and mobility platforms of tomorrow — from thermal management and vehicle control to power, diagnostics and connected electronics.</p><div className="hero-ctas"><a className="button" href="#contact">Contact Us</a><a href="#about">About</a></div></section>
    <section id="about" className="about section"><div className="section-beam section-beam-top" /><p className="eyebrow">ABOUT US</p><div className="about-grid"><div><p>Wezu Technologies develops innovative software, hardware, and engineering solutions for the Transportation, Logistics &amp; Mobility sector. Its focus spans safer mobility, green technologies, intelligent connectivity, sustainability, and advanced electrification systems.</p><p>From OEM/ODM solutions and turnkey product development to research and manufacturing, Wezu works across the complete product lifecycle. With a strong focus on innovation, quality, and practical implementation, the company transforms complex ideas into reliable, future-ready mobility solutions.</p></div><img src={figmaAssets.aboutMobility} alt="Connected mobility technology" /></div></section>
    <section id="products" className="section products"><div className="section-beam section-beam-products" /><p className="eyebrow products-title">OUR PRODUCTS</p><ProductCarousel products={products} /></section>
    <section id="gallery" className="industry section"><div className="industry-grid">{industries.map(([title, body], index) => <article key={title}><span className={`industry-icon icon-${index + 1}`} style={{ backgroundImage: `url(${figmaAssets.applicationSprite})` }} /><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
    <section className="testimonial section"><div className="section-beam section-beam-testimonial" /><p className="eyebrow">WHAT PEOPLE SAY</p><div className="testimonial-stage"><img className="testimonial-frame" src={figmaAssets.quoteFrame} alt="" /><button className="testimonial-arrow left" aria-label="Previous testimonial"><img src={figmaAssets.leftArrow} alt="" /></button><blockquote>“<strong>Wezu Technologies</strong> has consistently provided innovative solutions for our automotive projects. Their ability to understand our requirements and translate them into practical designs is remarkable. We were impressed by their commitment to quality and attention to detail throughout the process.”<footer><strong>Automotive OEM Client</strong><br />Exceptional Innovation and Service</footer></blockquote><button className="testimonial-arrow right" aria-label="Next testimonial"><img src={figmaAssets.rightArrow} alt="" /></button></div><div className="dots"><b /> <i /> <i /> <i /></div></section>
    <section id="contact" className="contact section"><div className="connect-title">LET’S<br />CONNECT</div><div><ContactForm /></div></section><Footer /></main>;
}
