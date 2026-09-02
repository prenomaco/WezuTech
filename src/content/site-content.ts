/**
 * Single source of truth for the marketing copy rendered on the landing page.
 * Keeping it here means section components stay purely presentational and the
 * copy can move to the CMS later without touching layout.
 */

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface Industry {
  readonly title: string;
  readonly body: string;
  readonly image: string;
}

export interface Testimonial {
  readonly lead: string;
  readonly quote: string;
  readonly client: string;
  readonly title: string;
}

export interface ContactDetail {
  readonly icon: "name" | "email" | "phone";
  readonly label: string;
  readonly href?: string;
}

export const primaryNav: readonly NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Gallery", href: "#gallery" },
];

export const footerNav: readonly NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Product", href: "#products" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export const legalNav: readonly NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms Of Service", href: "/terms-of-service" },
];

export const contactDetails: readonly ContactDetail[] = [
  { icon: "name", label: "Name Surname" },
  { icon: "email", label: "name@gmail.com", href: "mailto:name@gmail.com" },
  { icon: "phone", label: "+91 00000 00000", href: "tel:+910000000000" },
];

export const hero = {
  titleLeft: ["ENGINEERING", "THE"],
  titleRight: ["NEXT", "MOVEMENT"],
  intro:
    "Wezu Technologies designs and develops intelligent hardware and software systems for the vehicles and mobility platforms of tomorrow — from thermal management and vehicle control to power, diagnostics and connected electronics.",
} as const;

export const about = {
  eyebrow: "ABOUT US",
  paragraphs: [
    "Wezu Technologies develops innovative software, hardware, and engineering solutions for the Transportation, Logistics & Mobility sector. Its focus spans safer mobility, green technologies, intelligent connectivity, sustainability, and advanced electrification systems.",
    "From OEM/ODM solutions and turnkey product development to research and manufacturing, Wezu works across the complete product lifecycle. With a strong focus on innovation, quality, and practical implementation, the company transforms complex ideas into reliable, future-ready mobility solutions.",
  ],
} as const;

export const products = {
  eyebrow: "OUR PRODUCTS",
} as const;

export const testimonialsSection = {
  eyebrow: "WHAT PEOPLE SAY",
} as const;

export const industries: readonly Industry[] = [
  {
    title: "Automotive",
    body: "Innovative control systems and electronics to enhance vehicle performance and safety.",
    image: "/industry/automotive.png",
  },
  {
    title: "Marine Applications",
    body: "Durable electronics built for marine environments, ensuring operational excellence.",
    image: "/industry/marine.png",
  },
  {
    title: "Agriculture & Mining",
    body: "Reliable electronic solutions improving efficiency, safety, and productivity in demanding conditions.",
    image: "/industry/agriculture-mining.png",
  },
  {
    title: "Locomotive",
    body: "Reliable electronic solutions designed for optimal performance in rail transport.",
    image: "/industry/locomotive.png",
  },
  {
    title: "Special Purpose Vehicles",
    body: "Tailored technology solutions for unique mobility and specialized vehicle needs.",
    image: "/industry/special-purpose.png",
  },
  {
    title: "Aerospace and UAV",
    body: "High-performance electronic systems built for safety, reliability, and demanding aviation applications.",
    image: "/industry/aerospace-uav.png",
  },
];

export const testimonials: readonly Testimonial[] = [
  {
    lead: "Wezu Technologies",
    quote:
      " has consistently provided innovative solutions for our automotive projects. Their ability to understand our requirements and translate them into practical designs is remarkable. We were impressed by their commitment to quality and attention to detail throughout the process.",
    client: "Automotive OEM Client",
    title: "Exceptional Innovation and Service",
  },
  {
    lead: "",
    quote:
      "The team combined strong engineering knowledge with a clear understanding of production constraints. Their responsive approach helped us move from concept to a dependable solution without losing momentum.",
    client: "Mobility Systems Partner",
    title: "Practical Expertise, Delivered",
  },
  {
    lead: "",
    quote:
      "Wezu brought real clarity to a complex electrification programme. The hardware and software thinking felt connected from day one, and every milestone was handled with care.",
    client: "Electric Vehicle Manufacturer",
    title: "A Trusted Development Partner",
  },
  {
    lead: "",
    quote:
      "Their focus on reliability, communication, and testing made a meaningful difference to our launch. We value the partnership and the confidence their work gives our operations team.",
    client: "Industrial Fleet Operator",
    title: "Reliability at Every Stage",
  },
];

export const contact = {
  title: ["LET’S", "CONNECT"],
  copyright: "©2026 Wezu Technologies | Website Designed & Developed by",
  agency: { label: "prenoma.co", href: "https://prenoma.co" },
} as const;
