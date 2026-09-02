/* eslint-disable @next/next/no-img-element */
import { ContactForm } from "@/components/contact-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductCarousel } from "@/components/product-carousel";
import { SiteMotion } from "@/components/site-motion";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { getPublishedProducts } from "@/lib/catalog";
import { figmaAssets } from "@/lib/figma-assets";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

const industries = [
  { title: "Automotive", body: "Innovative control systems and electronics to enhance vehicle performance and safety.", image: "/industry/automotive.png" },
  { title: "Marine Applications", body: "Durable electronics built for marine environments, ensuring operational excellence.", image: "/industry/marine.png" },
  { title: "Agriculture & Mining", body: "Reliable electronic solutions improving efficiency, safety, and productivity in demanding conditions.", image: "/industry/agriculture-mining.png" },
  { title: "Locomotive", body: "Reliable electronic solutions designed for optimal performance in rail transport.", image: "/industry/locomotive.png" },
  { title: "Special Purpose Vehicles", body: "Tailored technology solutions for unique mobility and specialized vehicle needs.", image: "/industry/special-purpose.png" },
  { title: "Aerospace and UAV", body: "High-performance electronic systems built for safety, reliability, and demanding aviation applications.", image: "/industry/aerospace-uav.png" },
];

export default async function Home() {
  const products = await getPublishedProducts();
  const jsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "Wezu Technologies", url: siteUrl, description: "Intelligent mobility hardware and software systems." };
  return <main id="home"><SiteMotion /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><section className="hero"><div className="hero-beam" /><img className="header-polygon" src={figmaAssets.headerPolygon} alt="" /><Header /><div className="hero-grid"><div className="hero-title">ENGINEERING<br />THE</div><img className="hero-vehicles" src={figmaAssets.heroVehicles} alt="Electric mobility vehicles" /><div className="hero-title next">NEXT<br />MOVEMENT</div></div><p className="hero-intro">Wezu Technologies designs and develops intelligent hardware and software systems for the vehicles and mobility platforms of tomorrow — from thermal management and vehicle control to power, diagnostics and connected electronics.</p><div className="hero-ctas"><a className="button" href="#contact">Contact Us</a><a href="#about">About</a></div></section>
    <section id="about" className="about section"><div className="section-beam section-beam-top" /><p className="eyebrow">ABOUT US</p><div className="about-grid"><div><p>Wezu Technologies develops innovative software, hardware, and engineering solutions for the Transportation, Logistics &amp; Mobility sector. Its focus spans safer mobility, green technologies, intelligent connectivity, sustainability, and advanced electrification systems.</p><p>From OEM/ODM solutions and turnkey product development to research and manufacturing, Wezu works across the complete product lifecycle. With a strong focus on innovation, quality, and practical implementation, the company transforms complex ideas into reliable, future-ready mobility solutions.</p></div><img src={figmaAssets.aboutMobility} alt="Connected mobility technology" /></div></section>
    <section id="products" className="section products"><div className="section-beam section-beam-products" /><p className="eyebrow products-title">OUR PRODUCTS</p><ProductCarousel products={products} /></section>
    <section id="gallery" className="industry section"><div className="industry-grid">{industries.map(({ title, body, image }) => <article key={title}><img className="industry-icon" src={image} alt="" /><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
    <section className="testimonial section"><div className="section-beam section-beam-testimonial" /><p className="eyebrow">WHAT PEOPLE SAY</p><TestimonialCarousel /></section>
    <section id="contact" className="contact section"><div className="connect-title">LET’S<br />CONNECT</div><div><ContactForm /></div></section><Footer /></main>;
}
