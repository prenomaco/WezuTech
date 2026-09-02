import { hash } from "bcryptjs";
import { ProductMediaKind, ProductSectionType, ProductStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";

const figmaKioskImage = "http://localhost:3845/assets/4e3fa066be6f748b58327aa09b039a99b2d14394.png";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are required to seed the first admin.");
  }

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: await hash(password, 12), isActive: true },
    create: { email, passwordHash: await hash(password, 12), role: "ADMIN" },
  });

  const product = await prisma.product.upsert({
    where: { slug: "public-kiosk-charger" },
    update: {},
    create: {
      slug: "public-kiosk-charger",
      name: "Public Kiosk Charger",
      status: ProductStatus.PUBLISHED,
      tagline: "Charge infrastructure, built for everywhere.",
      cardDescription: "Weather-sealed public AC/DC charging for connected, open-environment deployments.",
      introduction: "A weather-sealed public AC/DC charging kiosk designed for public spaces, parking areas, and workplace sites.",
      seoTitle: "Public Kiosk Charger | Wezu Technologies",
      seoDescription: "Connected, weather-sealed public charging infrastructure by Wezu Technologies.",
      sortOrder: 1,
    },
  });

  const existingSections = await prisma.productSection.count({ where: { productId: product.id } });
  if (existingSections === 0) {
    await prisma.productMedia.create({ data: { productId: product.id, kind: ProductMediaKind.CARD, url: figmaKioskImage, alt: "Wezu public charging infrastructure", sortOrder: 1 } });
    await prisma.productSection.createMany({
      data: [
        { productId: product.id, type: ProductSectionType.METRICS, sortOrder: 1, data: [{ value: "Up to 5 kW", label: "Capacity per kiosk" }, { value: "1–2", label: "Tethered charging guns" }, { value: "IP65 / IP68", label: "Protection options" }] },
        { productId: product.id, type: ProductSectionType.BENEFITS, title: "Designed for the public charging ecosystem.", sortOrder: 2, data: [{ title: "Public", body: "Accessible charging infrastructure for open and high-traffic environments." }, { title: "Connected", body: "RFID, Bluetooth, and IoT-enabled connectivity for smarter charging operations." }, { title: "Intelligent", body: "Integrated payment systems, remote diagnostics, and reporting for connected infrastructure." }] },
        { productId: product.id, type: ProductSectionType.FEATURES, title: "Engineered around the charging experience.", sortOrder: 3, data: [{ title: "Up to 5 kW", body: "Charging capacity per kiosk." }, { title: "Touchscreen", body: "Active display for charging parameters and system information." }, { title: "Weather-Sealed", body: "IP-rated open-environment construction." }, { title: "RFID + Bluetooth", body: "Flexible communication and user access." }, { title: "Load Sharing", body: "Load-shared two-wheeler charging." }, { title: "IoT Enabled", body: "Monitoring and management infrastructure." }, { title: "Integrated Payments", body: "IoT-enabled payment gateway integration." }, { title: "Diagnostics & Reporting", body: "Full diagnostics and reporting." }] },
        { productId: product.id, type: ProductSectionType.CONFIGURATION, title: "Configure your charging infrastructure.", sortOrder: 4, data: [{ name: "Power Output", options: ["5 kW", "7.4 kW", "11 kW", "22 kW"] }, { name: "Mounting", options: ["Wall Mounted", "Pole Mounted", "Panel Mounted"] }, { name: "Connectivity", options: ["RFID", "Bluetooth", "Wi-Fi", "IoT"] }, { name: "Charging", options: ["Single Gun", "Dual Gun"] }] },
        { productId: product.id, type: ProductSectionType.SPECIFICATIONS, title: "Technical Specifications", sortOrder: 5, data: [{ specification: "Charging Type", details: "AC / DC" }, { specification: "Capacity", details: "Up to 5 kW" }, { specification: "Charging Guns", details: "1–2 tethered guns" }, { specification: "Display", details: "Active touchscreen" }, { specification: "Protection", details: "IP-rated enclosure" }, { specification: "Connectivity", details: "RFID / Bluetooth" }, { specification: "Payment", details: "IoT-enabled payment gateway" }, { specification: "Monitoring", details: "Full diagnostics & reporting" }] },
      ],
    });
  }
}

main().finally(async () => prisma.$disconnect());
