/**
 * Single source of truth for the marketing copy rendered on the landing page.
 * Keeping it here means section components stay purely presentational and the
 * copy can move to the CMS later without touching layout.
 */

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

/**
 * A market Wezu builds for, as the home page's own section shows them.
 *
 * These are deliberately NOT the product categories. The catalogue is filed
 * under product families — EV Charging, Battery Systems, Thermal Management —
 * which live in the database and are edited in the dashboard. This is the
 * other question: who the work is for. The six cells, their copy and their
 * isometric artwork are matched to the Figma frame, so they stay here as
 * designed content.
 */
export interface Industry {
  readonly title: string;
  readonly body: string;
  readonly image: string;
  /** Natural width of the artwork at the shared 377px height. */
  readonly imageWidth: number;
}

export interface Testimonial {
  readonly lead: string;
  readonly quote: string;
  readonly client: string;
  readonly title: string;
}

export interface ContactDetail {
  readonly icon: "email" | "phone" | "address";
  readonly label: string;
  readonly href?: string;
  /** Set for a row too long to sit on one line, such as the address. */
  readonly wraps?: boolean;
}

export const primaryNav: readonly NavLink[] = [
  { label: "Home", href: "/" },
  /* There is a dedicated About page (Figma node 307:165), so the nav goes to
     it rather than to the home page's about section. */
  { label: "About", href: "/about" },
  /* Likewise the catalogue index, rather than the home page's carousel — that
     section is still there, it is simply no longer the only way in. */
  { label: "Products", href: "/products" },
];

export const footerNav: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

export const legalNav: readonly NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms Of Service", href: "/terms-of-service" },
];

export const contactDetails: readonly ContactDetail[] = [
  { icon: "email", label: "purchase@wezutech.com", href: "mailto:purchase@wezutech.com" },
  { icon: "phone", label: "+91 9247539016", href: "tel:+919247539016" },
  {
    icon: "address",
    label:
      "1/B, Plot No 94, beside Eenadu Press, Gandhi Nagar Industrial Area, Balanagar, Hyderabad, Telangana 500037",
    wraps: true,
  },
];

/** The address split into the parts a postal schema expects. */
export const postalAddress = {
  streetAddress: "1/B, Plot No 94, beside Eenadu Press, Gandhi Nagar Industrial Area",
  addressLocality: "Balanagar, Hyderabad",
  addressRegion: "Telangana",
  postalCode: "500037",
  addressCountry: "IN",
} as const;

export const hero = {
  titleLeft: ["ENGINEERING", "THE"],
  titleRight: ["NEXT", "MOVEMENT"],
  intro:
    "Wezu Technologies designs and develops intelligent hardware and software systems for the vehicles and mobility platforms of tomorrow, from thermal management and vehicle control to power, diagnostics and connected electronics.",
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
    imageWidth: 315,
  },
  {
    title: "Marine Applications",
    body: "Durable electronics built for marine environments, ensuring operational excellence.",
    image: "/industry/marine.png",
    imageWidth: 315,
  },
  {
    title: "Agriculture & Mining",
    body: "Reliable electronic solutions improving efficiency, safety, and productivity in demanding conditions.",
    image: "/industry/agriculture-mining.png",
    imageWidth: 315,
  },
  {
    title: "Locomotive",
    body: "Reliable electronic solutions designed for optimal performance in rail transport.",
    image: "/industry/locomotive.png",
    imageWidth: 299,
  },
  {
    title: "Special Purpose Vehicles",
    body: "Tailored technology solutions for unique mobility and specialized vehicle needs.",
    image: "/industry/special-purpose.png",
    imageWidth: 299,
  },
  {
    title: "Aerospace and UAV",
    body: "High-performance electronic systems built for safety, reliability, and demanding aviation applications.",
    image: "/industry/aerospace-uav.png",
    imageWidth: 281,
  },
];

/** Every industry icon renders at this height; Figma varies the width. */
export const INDUSTRY_IMAGE_HEIGHT = 377;

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
  {
    lead: "",
    quote:
      "They treated our requirements as engineering problems rather than a specification to sign off. The result is a platform we can keep building on, and a team we would work with again.",
    client: "Commercial Vehicle Group",
    title: "Built to Keep Developing",
  },
];

/**
 * The About page (Figma node 307:165).
 *
 * The frame sets `text-transform: capitalize` on the whole page, so the copy is
 * stored in sentence case and the casing comes from CSS — storing it
 * pre-capitalised would fight every screen reader and every copy edit.
 */
export interface AboutParagraph {
  /** Set in bold ahead of the body, as node 307:233 does for two of them. */
  readonly lead?: string;
  /** The lead takes a line of its own, still inside this paragraph's block. */
  readonly leadOwnLine?: boolean;
  readonly body: string;
}

export const aboutPage = {
  title: "Engineering what moves the world forward.",
  intro: [
    { lead: "Wezu Technologies", body: " builds software, hardware, and engineering solutions for the future of transportation, logistics, and mobility." },
    { body: "We work at the intersection of engineering, technology, and mobility to solve complex challenges across the vehicle and transportation ecosystem. From intelligent connectivity and electrification to safer, greener mobility systems, we turn ideas into solutions that are built for the real world." },
    { lead: "Built for mobility. Engineered for what\u2019s next.", leadOwnLine: true, body: "The future of mobility isn\u2019t defined by a single technology. It is shaped by how software, electronics, hardware, and engineering come together." },
    { body: "At Wezu, we bring these disciplines together to develop solutions that make transportation smarter, safer, more connected, and more sustainable." },
    { body: "Whether it is an OEM/ODM program, a turnkey product, or an R&D challenge, we work closely with our partners from concept to execution \u2014 combining technical expertise with a practical understanding of the mobility industry." },
  ] as readonly AboutParagraph[],
  capabilitiesEyebrow: "HOW WE WORK",
  capabilities: [
    { title: "Intelligent Mobility", body: "Technology that enables vehicles and transportation systems to communicate, adapt, and perform better." },
    { title: "Electrification", body: "Engineering solutions supporting the transition towards cleaner and more efficient mobility." },
    { title: "Connected Systems", body: "Hardware and software that connect vehicles, infrastructure, and data into intelligent ecosystems." },
    { title: "Safer Transportation", body: "Solutions designed around reliability, intelligence, and the evolving safety needs of modern mobility." },
    { title: "Green Technologies", body: "Engineering approaches that help reduce environmental impact while improving efficiency and performance." },
    { title: "Product Engineering", body: "End-to-end development capabilities spanning software, hardware, electronics, and engineering" },
  ],
  process: "Research \u2192 Design \u2192 Engineer \u2192 Validate \u2192 Deploy",
  processBody:
    "From early-stage research and prototyping to engineering, validation, and deployment, our teams collaborate with OEMs, technology companies, and mobility businesses to turn complex requirements into production-ready solutions.",
} as const;

export const contact = {
  title: ["LET’S", "CONNECT"],
  copyright: "©2026 Wezu Technologies | Website Designed & Developed by",
  agency: { label: "prenoma.co", href: "https://prenoma.co" },
} as const;
