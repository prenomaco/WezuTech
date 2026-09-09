import { hash } from "bcryptjs";
import { ProductMediaKind, ProductSectionType, ProductStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";

const asset = (name: string) => `/figma/${name}`;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are required to seed the first admin.");

  await prisma.user.upsert({ where: { email }, update: { passwordHash: await hash(password, 12), isActive: true }, create: { email, passwordHash: await hash(password, 12), role: "ADMIN" } });

  const product = await prisma.product.upsert({
    where: { slug: "public-kiosk-charger" },
    update: { name: "Public Kiosk Charger", status: ProductStatus.PUBLISHED, tagline: "Charge infrastructure, built for everywhere.", cardDescription: "A weather-sealed public AC/DC charging kiosk designed for open-environment charging across public spaces, parking areas, and workplace sites.", introduction: "A weather-sealed public AC/DC charging kiosk designed for open-environment charging across public spaces, parking areas, and workplace sites.", seoTitle: "Public Kiosk Charger | Wezu Technologies", seoDescription: "Connected, weather-sealed public charging infrastructure by Wezu Technologies." },
    create: { slug: "public-kiosk-charger", name: "Public Kiosk Charger", status: ProductStatus.PUBLISHED, tagline: "Charge infrastructure, built for everywhere.", cardDescription: "A weather-sealed public AC/DC charging kiosk designed for open-environment charging across public spaces, parking areas, and workplace sites.", introduction: "A weather-sealed public AC/DC charging kiosk designed for open-environment charging across public spaces, parking areas, and workplace sites.", seoTitle: "Public Kiosk Charger | Wezu Technologies", seoDescription: "Connected, weather-sealed public charging infrastructure by Wezu Technologies.", sortOrder: 1 },
  });

  const media = [
    [ProductMediaKind.CARD, asset("4e3fa066be6f748b58327aa09b039a99b2d14394.png"), "Public Kiosk Charger catalogue image", 0],
    [ProductMediaKind.HERO, asset("8384c03f1cb890da0410e0a8b138fae483ff3a99.png"), "Public Kiosk Charger annotated hero view", 0],
    [ProductMediaKind.DETAIL, asset("0529044b984d351e17b45130541d776828be4381.png"), "Public Kiosk Charger front view", 0],
    [ProductMediaKind.GALLERY, asset("66617baaaeac843d46dcf432724ecbbf89643e59.png"), "Public Kiosk Charger wall-mounted view", 0],
    [ProductMediaKind.GALLERY, asset("dc3dbe7493ab4d8123e212e078c31de01a51110a.png"), "Public Kiosk Charger cable-hook view", 1],
    [ProductMediaKind.APPLICATION, asset("f244f86516f41aac4f54fdef2c7943b8e6413c4d.png"), "Public charging space", 0],
    [ProductMediaKind.APPLICATION, asset("964e4d39b3740c17a805897874e5c3497bf679f5.png"), "Parking and workplace charging", 1],
    [ProductMediaKind.APPLICATION, asset("ee3aa089783daeb934cee841a5dca039bc96811f.png"), "Managed charging fleet", 2],
  ] as const;
  await prisma.productMedia.deleteMany({ where: { productId: product.id, kind: { in: [ProductMediaKind.CARD, ProductMediaKind.HERO, ProductMediaKind.DETAIL, ProductMediaKind.GALLERY, ProductMediaKind.APPLICATION] } } });
  await prisma.productMedia.createMany({ data: media.map(([kind, url, alt, sortOrder]) => ({ productId: product.id, kind, url, alt, sortOrder })) });

  const sections = [
    { type: ProductSectionType.METRICS, title: null, sortOrder: 1, data: { items: [{ value: "Up to 5 kW", label: "Capacity per kiosk" }, { value: "1–2", label: "Tethered charging guns" }, { value: "IP65 / IP68", label: "Protection options" }] } },
    { type: ProductSectionType.BENEFITS, title: "Built for connected public charging.", sortOrder: 2, data: { intro: "The Public Kiosk Charger is designed for accessible, reliable charging in open environments, with flexible mounting and connected charging capabilities.", items: [{ title: "Flexible Deployment", body: "Wall, pole, or panel-mounted configurations for different public and commercial sites." }, { title: "Connected Charging", body: "RFID, Bluetooth, Wi-Fi, and IoT connectivity for user access and remote management." }, { title: "Smart Infrastructure", body: "Integrated payment systems, diagnostics, reporting, and load-shared charging." }] } },
    { type: ProductSectionType.FEATURES, title: "Key Features", sortOrder: 3, data: { items: [{ title: "Active Touchscreen", body: "Displays charging parameters and system information." }, { title: "RFID & Bluetooth", body: "Flexible communication and user access." }, { title: "Weather-Sealed", body: "IP-rated construction for open-environment deployment." }, { title: "Load Sharing", body: "Supports load-shared two-wheeler charging." }, { title: "IoT Enabled", body: "Connected monitoring and management." }, { title: "Payment Integration", body: "IoT-enabled payment gateway systems." }] } },
    { type: ProductSectionType.ENVIRONMENTS, title: "Applications", sortOrder: 4, data: { items: [{ title: "Public Spaces", body: "Charging infrastructure for streets, public areas, and mobility hubs." }, { title: "Parking & Workplace", body: "Suitable for parking facilities, workplaces, and commercial sites." }, { title: "Fleets", body: "Connected charging infrastructure for managed mobility operations." }] } },
    { type: ProductSectionType.SPECIFICATIONS, title: "Technical Specifications", sortOrder: 5, data: { items: [{ specification: "Charging Type", details: "AC / DC" }, { specification: "Capacity", details: "Up to 5 kW" }, { specification: "Charging Guns", details: "1–2 tethered guns" }, { specification: "Display", details: "Touchscreen" }, { specification: "Protection", details: "IP65 / IP68" }, { specification: "Connectivity", details: "RFID / Bluetooth / Wi-Fi / IoT" }, { specification: "Payment", details: "IoT-enabled payment gateway" }, { specification: "Charging", details: "Load-shared two-wheeler charging" }, { specification: "Monitoring", details: "Diagnostics & reporting" }, { specification: "Mounting", details: "Wall / Pole / Panel" }], note: "Specifications vary by product configuration" } },
    { type: ProductSectionType.CTA, title: null, sortOrder: 6, data: { quoteLabel: "Request a Quote", datasheetLabel: "Download Datasheet" } },
  ];
  await prisma.productSection.deleteMany({ where: { productId: product.id, type: { in: sections.map((section) => section.type) } } });
  await prisma.productSection.createMany({ data: sections.map((section) => ({ productId: product.id, ...section })) });

  const testimonials = [
    ["seed-testimonial-1", "Wezu Technologies", " has consistently provided innovative solutions for our automotive projects. Their ability to understand our requirements and translate them into practical designs is remarkable. We were impressed by their commitment to quality and attention to detail throughout the process.", "Automotive OEM Client", "Exceptional Innovation and Service", 0],
    ["seed-testimonial-2", null, "The team combined strong engineering knowledge with a clear understanding of production constraints. Their responsive approach helped us move from concept to a dependable solution without losing momentum.", "Mobility Systems Partner", "Practical Expertise, Delivered", 1],
    ["seed-testimonial-3", null, "Wezu brought real clarity to a complex electrification programme. The hardware and software thinking felt connected from day one, and every milestone was handled with care.", "Electric Vehicle Manufacturer", "A Trusted Development Partner", 2],
    ["seed-testimonial-4", null, "Their focus on reliability, communication, and testing made a meaningful difference to our launch. We value the partnership and the confidence their work gives our operations team.", "Industrial Fleet Operator", "Reliability at Every Stage", 3],
    ["seed-testimonial-5", null, "They treated our requirements as engineering problems rather than a specification to sign off. The result is a platform we can keep building on, and a team we would work with again.", "Commercial Vehicle Group", "Built to Keep Developing", 4],
  ] as const;
  for (const [id, lead, quote, client, title, sortOrder] of testimonials) await prisma.testimonial.upsert({ where: { id }, update: { lead, quote, client, title, sortOrder, isPublished: true }, create: { id, lead, quote, client, title, sortOrder, isPublished: true } });
}

main().finally(async () => prisma.$disconnect());
