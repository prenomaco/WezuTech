import { ProductMediaKind, ProductSectionType, type ProductStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";

/**
 * The catalogue — every product the site sells, in one list.
 *
 * Content is taken from `WEZU-PRODUCT-PORTFOLIO.pdf`: the capacities, gun
 * counts, voltages and ratings are the deck's own numbers, and nothing is
 * specified here that the deck does not state. Where a page names variants
 * rather than one unit (2W/3W/4W packs, portable and medium ESS, large and
 * load-balancing ESS) the variants are that product's overview items, which is
 * how the deck presents them: one page, one product, several sizes.
 *
 * Every entry carries the same six section types in the same order, so each
 * one renders through the product page with nothing special-cased.
 *
 * This is the only definition of product content. `seed.ts` writes it as part
 * of a first run and `seed-portfolio.ts` writes it on its own; neither owns a
 * copy, so they cannot drift apart or revert each other.
 */

const IMAGE_ROOT = "/products";

interface MediaItem {
  readonly url: string;
  readonly alt: string;
}

/** The media slots the product page reads, in the order it reads them. */
interface MediaPlan {
  readonly card: MediaItem;
  readonly hero: MediaItem;
  readonly detail?: MediaItem;
  readonly gallery?: readonly MediaItem[];
  readonly applications?: readonly MediaItem[];
}

export interface PortfolioProduct {
  readonly slug: string;
  readonly name: string;
  readonly sortOrder: number;
  readonly tagline: string;
  readonly introduction: string;
  readonly seoDescription: string;
  readonly media: MediaPlan;
  readonly metrics: readonly { value: string; label: string }[];
  readonly overview: { title: string; intro: string; items: readonly { title: string; body: string }[] };
  readonly features: readonly { title: string; body: string }[];
  readonly applications: readonly { title: string; body: string }[];
  readonly specifications: readonly { specification: string; details: string }[];
}

const SPEC_NOTE = "Specifications vary by product configuration";

/** The webp set exported from the portfolio deck, under `public/products/<slug>`. */
function shot(slug: string, file: string, alt: string): MediaItem {
  return { url: `${IMAGE_ROOT}/${slug}/${file}.webp`, alt };
}

/** The Public Kiosk Charger's artwork, which predates the deck and came from Figma. */
function figma(name: string, alt: string): MediaItem {
  return { url: `/figma/${name}`, alt };
}

export const PORTFOLIO: readonly PortfolioProduct[] = [
  {
    slug: "public-kiosk-charger",
    name: "Public Kiosk Charger",
    sortOrder: 1,
    tagline: "Charge infrastructure, built for everywhere.",
    introduction:
      "A weather-sealed public AC/DC charging kiosk designed for open-environment charging across public spaces, parking areas, and workplace sites.",
    seoDescription: "Connected, weather-sealed public charging infrastructure by Wezu Technologies.",
    /*
     * The deck gives this product three pages and three different builds
     * (p4: 5 kW, IP65, one gun; p5: 5 kW, IP68, one to two guns; p6: 25 kW,
     * one gun, LoRa-WAN). They are one kiosk at three capacities rather than
     * three products, so the range spans all three rather than picking a page.
     */
    media: {
      card: figma("4e3fa066be6f748b58327aa09b039a99b2d14394.png", "Public Kiosk Charger catalogue image"),
      hero: figma("8384c03f1cb890da0410e0a8b138fae483ff3a99.png", "Public Kiosk Charger annotated hero view"),
      detail: figma("0529044b984d351e17b45130541d776828be4381.png", "Public Kiosk Charger front view"),
      gallery: [
        figma("66617baaaeac843d46dcf432724ecbbf89643e59.png", "Public Kiosk Charger wall-mounted view"),
        figma("dc3dbe7493ab4d8123e212e078c31de01a51110a.png", "Public Kiosk Charger cable-hook view"),
      ],
      applications: [
        figma("f244f86516f41aac4f54fdef2c7943b8e6413c4d.png", "Public charging space"),
        figma("964e4d39b3740c17a805897874e5c3497bf679f5.png", "Parking and workplace charging"),
        figma("ee3aa089783daeb934cee841a5dca039bc96811f.png", "Managed charging fleet"),
      ],
    },
    metrics: [
      { value: "Up to 25 kW", label: "Capacity per kiosk" },
      { value: "1–2", label: "Tethered guns, 2.5 – 25 kW" },
      { value: "IP65 / IP68", label: "Protection options" },
    ],
    overview: {
      title: "Built for connected public charging.",
      intro:
        "The Public Kiosk Charger is designed for accessible, reliable charging in open environments, with flexible mounting and connected charging capabilities.",
      items: [
        { title: "Flexible Deployment", body: "Wall, pole, or panel-mounted configurations for different public and commercial sites." },
        { title: "Connected Charging", body: "RFID, Bluetooth, Wi-Fi, LoRa-WAN and IoT connectivity for user access and remote management." },
        { title: "Smart Infrastructure", body: "Integrated payment systems, diagnostics, reporting, and load-shared charging." },
      ],
    },
    features: [
      { title: "Active Touchscreen", body: "Toughened glass touchscreen showing all charging parameters." },
      { title: "RFID & Bluetooth", body: "RFID, Bluetooth, Wi-Fi and LoRa-WAN communication." },
      { title: "Weather-Sealed", body: "IP65 and IP68 rated construction for open-environment deployment." },
      { title: "Gun Locking", body: "Receptacle and gun locking on the kiosk." },
      { title: "Load Sharing", body: "Supports load-shared two-wheeler charging." },
      { title: "Payment Integration", body: "IoT-enabled payment gateway systems." },
    ],
    applications: [
      { title: "Public Spaces", body: "Charging infrastructure for streets, public areas, and mobility hubs." },
      { title: "Parking & Workplace", body: "Suitable for parking facilities, workplaces, and commercial sites." },
      { title: "Fleets", body: "Connected charging infrastructure for managed mobility operations." },
    ],
    specifications: [
      { specification: "Charging Type", details: "AC / DC" },
      { specification: "Capacity", details: "2.5 – 25 kW per kiosk" },
      { specification: "Charging Guns", details: "1–2 tethered guns" },
      { specification: "Output per Gun", details: "2.5 / 5 kW, up to 25 kW" },
      { specification: "Display", details: "Toughened glass touchscreen" },
      { specification: "Protection", details: "IP65 / IP68" },
      { specification: "Locking", details: "Receptacle and gun locking" },
      { specification: "Connectivity", details: "RFID / Bluetooth / Wi-Fi / LoRa-WAN / IoT" },
      { specification: "Payment", details: "IoT-enabled payment gateway" },
      { specification: "Charging", details: "Load-shared two-wheeler charging" },
      { specification: "Deployment", details: "Pan-India deployment digital platform" },
      { specification: "Monitoring", details: "Full diagnostics & reporting" },
      { specification: "Mounting", details: "Wall / Pole / Panel" },
    ],
  },
  {
    slug: "multi-bike-charging-station",
    name: "Multi-Bike Charging Station",
    sortOrder: 2,
    tagline: "Charging built for a rank of two-wheelers.",
    introduction:
      "A rise-mount kiosk that charges several two-wheelers at once, sharing the available power between four to eight tethered guns and holding the station open through heat and outage.",
    seoDescription:
      "Up to 22 kW per kiosk across 4–8 tethered guns at 3.3 kW each, with load-shared two-wheeler charging, integrated backup and AI-enabled load balancing.",
    media: {
      card: shot("multi-bike-charging-station", "card", "Multi-Bike Charging Station catalogue image"),
      hero: shot("multi-bike-charging-station", "hero", "Multi-Bike Charging Station with two-wheelers on charge"),
      detail: shot("multi-bike-charging-station", "detail", "Multi-Bike Charging Station bay detail"),
      gallery: [
        shot("multi-bike-charging-station", "gallery-1", "Multi-Bike Charging Station at a bike rank"),
        shot("multi-bike-charging-station", "gallery-2", "Multi-Bike Charging Station charge points"),
      ],
      applications: [
        shot("multi-bike-charging-station", "application-1", "Two-wheeler fleet charging at a multi-bike kiosk"),
        shot("multi-bike-charging-station", "application-2", "Bike rank charging at a public parking facility"),
        shot("multi-bike-charging-station", "application-3", "Shared two-wheeler charging points"),
      ],
    },
    metrics: [
      { value: "Up to 22 kW", label: "Capacity per kiosk" },
      { value: "4–8", label: "Tethered guns at 3.3 kW each" },
      { value: "AI enabled", label: "Safety and charge balancing" },
    ],
    overview: {
      title: "Built for two-wheeler ranks.",
      intro:
        "The Multi-Bike Charging Station puts several charge points on one rise-mount kiosk and shares the supply between them, so a rank of bikes charges from a single connection rather than a row of separate units.",
      items: [
        { title: "Load-Shared Power", body: "Four to eight tethered guns at 3.3 kW each, balanced across a supply of up to 22 kW." },
        { title: "All-Weather Duty", body: "Thermal management and integrated power backup keep the station charging through heat and through an outage." },
        { title: "AI-Assisted Operation", body: "Safety monitoring and charge load balancing are handled on the station itself." },
      ],
    },
    features: [
      { title: "Touchscreen", body: "On-station display for charging parameters and system information." },
      { title: "RFID Access", body: "Card-based user access at every charge point." },
      { title: "Load Sharing", body: "Available power balanced across four to eight two-wheelers." },
      { title: "Integrated Backup", body: "On-board power backup keeps the station available during an outage." },
      { title: "Thermal Management", body: "All-weather operation across Indian site conditions." },
      { title: "Payment Integration", body: "IoT-enabled payment gateway systems." },
    ],
    applications: [
      { title: "Two-Wheeler Fleets", body: "Delivery and ride-hailing operations charging several bikes from one kiosk." },
      { title: "Public Parking", body: "Bike ranks at transit hubs, markets, and parking facilities." },
      { title: "Residential & Workplace", body: "Shared two-wheeler charging for societies and campuses." },
    ],
    specifications: [
      { specification: "Capacity", details: "Up to 22 kW per kiosk" },
      { specification: "Charging Guns", details: "4–8 tethered guns" },
      { specification: "Output per Gun", details: "3.3 kW" },
      { specification: "Display", details: "Touchscreen" },
      { specification: "Access", details: "RFID" },
      { specification: "Charging", details: "Load-shared two-wheeler charging" },
      { specification: "Power Backup", details: "Integrated" },
      { specification: "Thermal Management", details: "Enabled for all-weather duty" },
      { specification: "Intelligence", details: "AI-enabled safety and charge load balancing" },
      { specification: "Payment", details: "IoT-enabled payment gateway" },
      { specification: "Deployment", details: "Pan-India deployment digital platform" },
      { specification: "Monitoring", details: "Full diagnostics & reporting" },
      { specification: "Mounting", details: "Rise / pole mounted" },
    ],
  },
  {
    slug: "dc-fast-charging-station",
    name: "DC Fast Charging Station",
    sortOrder: 3,
    tagline: "High power, for the corridor and the depot.",
    introduction:
      "Wezu's flagship high-power DC charger, built for highway corridors and commercial fleets — 30, 60 or 100 kW DC through dual CCS-2 and CHAdeMO connectors on liquid-cooled cables, with an optional 22 kW AC outlet.",
    seoDescription:
      "30 / 60 / 100 kW DC fast charging at up to 250 A per gun, with dual CCS-2 and CHAdeMO connectors, liquid-cooled cables and an optional 22 kW AC outlet.",
    media: {
      card: shot("dc-fast-charging-station", "card", "DC Fast Charging Station catalogue image"),
      hero: shot("dc-fast-charging-station", "hero", "DC Fast Charging Station at a highway forecourt"),
      detail: shot("dc-fast-charging-station", "detail", "DC Fast Charging Station front view"),
      applications: [
        shot("dc-fast-charging-station", "application-1", "DC fast charging on a highway corridor"),
        shot("dc-fast-charging-station", "application-2", "Commercial fleet vehicles on DC fast charge"),
        shot("dc-fast-charging-station", "application-3", "Public fast charging in a city plaza"),
      ],
    },
    metrics: [
      { value: "30 / 60 / 100 kW", label: "DC output options" },
      { value: "Up to 250 A", label: "Per charging gun" },
      { value: "CCS-2 + CHAdeMO", label: "Dual-standard connectors" },
    ],
    overview: {
      title: "Built for highway corridors and fleets.",
      intro:
        "This is the flagship of the charging range, specified for the corridors and depots where turnaround time is what decides whether a vehicle is in service or waiting.",
      items: [
        { title: "High-Power DC", body: "Specified at 30, 60 or 100 kW DC, delivering up to 250 A per gun." },
        { title: "Dual-Standard Connectors", body: "CCS-2 and CHAdeMO on the same unit, with an optional 22 kW AC outlet alongside them." },
        { title: "Liquid-Cooled Cables", body: "Sustained high-current delivery through a cable that stays manageable in the hand." },
      ],
    },
    features: [
      { title: "100 kW Peak", body: "Specified at 30, 60, or 100 kW DC." },
      { title: "250 A Per Gun", body: "High-current delivery for fast turnaround." },
      { title: "CCS-2", body: "Dual CCS-2 connectors for standard DC fast charging." },
      { title: "CHAdeMO", body: "CHAdeMO support alongside CCS-2." },
      { title: "Optional AC", body: "A 22 kW AC outlet available beside the DC guns." },
      { title: "Liquid Cooling", body: "Liquid-cooled cables for sustained high current." },
    ],
    applications: [
      { title: "Highway Corridors", body: "Charging points along intercity routes, where turnaround time is the constraint." },
      { title: "Commercial Fleets", body: "Depot charging for commercial and passenger fleet operations." },
      { title: "Public Fast Charging", body: "High-power charging at forecourts and destination sites." },
    ],
    specifications: [
      { specification: "Charging Type", details: "DC, with optional AC" },
      { specification: "Capacity", details: "30 / 60 / 100 kW DC" },
      { specification: "Current", details: "Up to 250 A per gun" },
      { specification: "Connectors", details: "Dual CCS-2 + CHAdeMO" },
      { specification: "AC Option", details: "22 kW AC" },
      { specification: "Cables", details: "Liquid-cooled" },
      { specification: "Deployment", details: "Highway corridors and commercial fleets" },
    ],
  },
  {
    slug: "mobility-battery-packs",
    name: "Mobility Battery Packs",
    sortOrder: 4,
    tagline: "Lithium-ion packs for 2W, 3W and 4W.",
    introduction:
      "Lithium-ion mobility packs sized for India's most common EV form factors — from scooter and bike packs, through auto, e-rickshaw and cargo three-wheelers, to LCV and passenger four-wheelers.",
    seoDescription:
      "Lithium-ion mobility battery packs from 1.5 to 35 kWh at 48–320 V across 2W, 3W and 4W form factors, with IP67 enclosures, in-house BMS and CAN telemetry.",
    media: {
      card: shot("mobility-battery-packs", "card", "Mobility battery packs catalogue image"),
      hero: shot("mobility-battery-packs", "hero", "Four-wheeler mobility battery pack"),
      detail: shot("mobility-battery-packs", "detail", "Three-wheeler mobility battery pack"),
      gallery: [
        shot("mobility-battery-packs", "gallery-1", "Two-wheeler mobility battery pack"),
        shot("mobility-battery-packs", "gallery-2", "Three-wheeler mobility battery pack"),
      ],
      applications: [
        shot("mobility-battery-packs", "application-1", "Two-wheeler battery pack"),
        shot("mobility-battery-packs", "application-2", "Three-wheeler battery pack"),
        shot("mobility-battery-packs", "application-3", "Four-wheeler battery pack"),
      ],
    },
    metrics: [
      { value: "1.5 – 35 kWh", label: "Across 2W / 3W / 4W" },
      { value: "48 – 320 V", label: "Pack voltage range" },
      { value: "IP67", label: "Enclosure rating" },
    ],
    overview: {
      title: "Three form factors, one platform.",
      intro:
        "The mobility packs share a cell, BMS and enclosure platform, sized to the vehicle classes that carry most of India's electric traffic rather than to a single model.",
      items: [
        { title: "2-Wheeler Pack", body: "Scooter and bike packs at the low end of the capacity range." },
        { title: "3-Wheeler Pack", body: "Packs for auto, e-rickshaw and cargo three-wheelers." },
        { title: "4-Wheeler Pack", body: "LCV and passenger vehicle packs up to 35 kWh." },
      ],
    },
    features: [
      { title: "In-House BMS", body: "Battery management designed and built by Wezu." },
      { title: "CAN Telemetry", body: "Pack data over CAN for vehicle and fleet systems." },
      { title: "IP67 Enclosure", body: "Sealed against dust and water ingress." },
      { title: "48 – 320 V", body: "Voltage options across the three form factors." },
      { title: "1.5 – 35 kWh", body: "Capacity sized to the vehicle class." },
      { title: "Common Platform", body: "Cell, BMS and power electronics shared across the range." },
    ],
    applications: [
      { title: "Two-Wheelers", body: "Scooter and bike packs for personal and delivery duty." },
      { title: "Three-Wheelers", body: "Auto, e-rickshaw and cargo applications." },
      { title: "Four-Wheelers", body: "Light commercial vehicles and passenger cars." },
    ],
    specifications: [
      { specification: "Capacity", details: "1.5 – 35 kWh" },
      { specification: "Voltage", details: "48 – 320 V" },
      { specification: "Form Factors", details: "2W / 3W / 4W" },
      { specification: "Chemistry", details: "Lithium-ion" },
      { specification: "Enclosure", details: "IP67" },
      { specification: "Battery Management", details: "In-house BMS" },
      { specification: "Telemetry", details: "CAN" },
      { specification: "2-Wheeler Pack", details: "Scooter and bike" },
      { specification: "3-Wheeler Pack", details: "Auto, e-rickshaw, cargo" },
      { specification: "4-Wheeler Pack", details: "LCV and passenger" },
    ],
  },
  {
    slug: "industrial-auxiliary-battery-packs",
    name: "Industrial & Auxiliary Battery Packs",
    sortOrder: 5,
    tagline: "Engineered for the shift that does not stop.",
    introduction:
      "Battery packs engineered for 24/7 duty cycles — material handling, vehicle sub-systems and back-up — from drop-in 12 V and 24 V auxiliary replacements to DIN-tray forklift packs.",
    seoDescription:
      "Industrial and auxiliary lithium-ion packs from 0.25 to 60 kWh at 12 / 24 / 48 / 80 V, as drop-in lead-acid replacements and DIN-tray forklift packs for 2–5 ton handling.",
    media: {
      card: shot("industrial-auxiliary-battery-packs", "card", "Industrial and auxiliary battery packs catalogue image"),
      hero: shot("industrial-auxiliary-battery-packs", "hero", "Forklift battery pack on a material handling floor"),
      detail: shot("industrial-auxiliary-battery-packs", "detail", "Auxiliary 12 V battery pack"),
      gallery: [shot("industrial-auxiliary-battery-packs", "gallery-1", "Auxiliary battery pack")],
      applications: [
        shot("industrial-auxiliary-battery-packs", "application-1", "Forklift battery pack in a material handling bay"),
        shot("industrial-auxiliary-battery-packs", "application-2", "Auxiliary vehicle battery pack"),
        shot("industrial-auxiliary-battery-packs", "application-3", "Auxiliary battery pack in back-up duty"),
      ],
    },
    metrics: [
      { value: "0.25 – 60 kWh", label: "Capacity range" },
      { value: "12 / 24 / 48 / 80 V", label: "Voltage options" },
      { value: "2 – 5 ton", label: "Forklift classes served" },
    ],
    overview: {
      title: "Engineered for continuous duty.",
      intro:
        "These packs are specified for the shifts that do not stop — material handling floors, vehicle sub-systems and back-up duty, where the pack is expected to work every hour the site is open.",
      items: [
        { title: "Auxiliary Pack", body: "A drop-in replacement for 12 V and 24 V lead-acid vehicle batteries." },
        { title: "Forklift Pack", body: "DIN-tray industrial packs for 2 to 5 ton material handling." },
        { title: "24/7 Duty", body: "Specified for continuous-shift operation rather than intermittent use." },
      ],
    },
    features: [
      { title: "Drop-In Replacement", body: "Auxiliary packs replace lead-acid without rework." },
      { title: "DIN-Tray Format", body: "Forklift packs built to standard tray dimensions." },
      { title: "0.25 – 60 kWh", body: "Capacity across auxiliary and industrial duty." },
      { title: "12 – 80 V", body: "12, 24, 48 and 80 V options." },
      { title: "Material Handling", body: "Sized for 2 to 5 ton forklift classes." },
      { title: "Continuous Duty", body: "Engineered for 24/7 shift cycles." },
    ],
    applications: [
      { title: "Material Handling", body: "Forklifts and warehouse equipment on continuous shifts." },
      { title: "Vehicle Sub-Systems", body: "Auxiliary 12 V and 24 V duty on board vehicles." },
      { title: "Back-Up Power", body: "Standby duty where lead-acid was previously used." },
    ],
    specifications: [
      { specification: "Capacity", details: "0.25 – 60 kWh" },
      { specification: "Voltage", details: "12 / 24 / 48 / 80 V" },
      { specification: "Chemistry", details: "Lithium-ion" },
      { specification: "Auxiliary Format", details: "Drop-in lead-acid replacement" },
      { specification: "Industrial Format", details: "DIN-tray forklift pack" },
      { specification: "Forklift Classes", details: "2 – 5 ton" },
      { specification: "Duty Cycle", details: "24/7" },
    ],
  },
  {
    slug: "portable-medium-energy-storage",
    name: "Portable & Medium Energy Storage",
    sortOrder: 6,
    tagline: "Backup that travels, storage that stays.",
    introduction:
      "Backup, off-grid and small-commercial energy storage — a suitcase-class portable unit from 1 to 5 kWh, and an outdoor cabinet from 10 to 100 kWh for small-commercial and society duty.",
    seoDescription:
      "Portable energy storage from 1 to 5 kWh and medium systems from 10 to 100 kWh — suitcase-class backup and outdoor cabinets, site-ready and grid-ready.",
    media: {
      card: shot("portable-medium-energy-storage", "card", "Portable and medium energy storage catalogue image"),
      hero: shot("portable-medium-energy-storage", "hero", "Portable energy storage unit"),
      detail: shot("portable-medium-energy-storage", "detail", "Medium energy storage cabinet"),
      gallery: [shot("portable-medium-energy-storage", "gallery-1", "Medium energy storage cabinet, open")],
      applications: [
        shot("portable-medium-energy-storage", "application-1", "Portable energy storage in field backup duty"),
        shot("portable-medium-energy-storage", "application-2", "Medium energy storage cabinet at a commercial site"),
        shot("portable-medium-energy-storage", "application-3", "Medium energy storage cabinet for a residential society"),
      ],
    },
    metrics: [
      { value: "1 – 5 kWh", label: "Portable ESS" },
      { value: "10 – 100 kWh", label: "Medium ESS" },
      { value: "Site & grid ready", label: "Deployment" },
    ],
    overview: {
      title: "Site-ready and grid-ready storage.",
      intro:
        "Two systems covering the range between a backup you can carry to a field site and an outdoor cabinet sized for a whole building.",
      items: [
        { title: "Portable ESS", body: "A suitcase-class unit from 1 to 5 kWh for field and home backup." },
        { title: "Medium ESS", body: "An outdoor cabinet from 10 to 100 kWh for small-commercial and society duty." },
        { title: "Off-Grid Capable", body: "Backup, off-grid and grid-connected operation from the same range." },
      ],
    },
    features: [
      { title: "Suitcase Class", body: "A portable unit sized to be moved by hand." },
      { title: "Outdoor Cabinet", body: "The medium system is built for outdoor installation." },
      { title: "1 – 100 kWh", body: "Capacity across the two formats." },
      { title: "Field Backup", body: "Power for sites without a reliable supply." },
      { title: "Society Duty", body: "Sized for residential societies and small commercial buildings." },
      { title: "Grid Ready", body: "Connects alongside an existing supply." },
    ],
    applications: [
      { title: "Field & Home Backup", body: "Portable power for sites, events and homes." },
      { title: "Small Commercial", body: "Shops, offices and small commercial premises." },
      { title: "Residential Societies", body: "Shared backup for housing societies." },
    ],
    specifications: [
      { specification: "Portable Capacity", details: "1 – 5 kWh" },
      { specification: "Medium Capacity", details: "10 – 100 kWh" },
      { specification: "Portable Format", details: "Suitcase-class unit" },
      { specification: "Medium Format", details: "Outdoor cabinet" },
      { specification: "Duty", details: "Backup, off-grid, small-commercial" },
      { specification: "Installation", details: "Site-ready and grid-ready" },
    ],
  },
  {
    slug: "large-load-balancing-energy-storage",
    name: "Large & Load-Balancing Energy Storage",
    sortOrder: 7,
    tagline: "Container-class storage for utility duty.",
    introduction:
      "AI-enabled container-class battery energy storage for utility, microgrid and grid-services duty — 250 kWh to 5 MWh per container, scaling modularly from 500 kWh to 50 MWh, and pairing with multi-point charging kiosks for power backup and energy provisioning.",
    seoDescription:
      "Container-class BESS from 250 kWh to 5 MWh, scaling 500 kWh to 50 MWh modular, with AI-enabled load balancing for utility, microgrid and grid-services duty.",
    media: {
      card: shot("large-load-balancing-energy-storage", "card", "Large and load-balancing energy storage catalogue image"),
      hero: shot("large-load-balancing-energy-storage", "hero", "Container-class battery energy storage system"),
      detail: shot("large-load-balancing-energy-storage", "detail", "Load-balancing energy storage rack"),
      gallery: [
        shot("large-load-balancing-energy-storage", "gallery-1", "Modular grid-services energy storage rack"),
        shot("large-load-balancing-energy-storage", "gallery-2", "Energy storage paired with a multi-point charging kiosk"),
      ],
      applications: [
        shot("large-load-balancing-energy-storage", "application-1", "Container-class energy storage in utility duty"),
        shot("large-load-balancing-energy-storage", "application-2", "Modular grid-services racks in a microgrid"),
        shot("large-load-balancing-energy-storage", "application-3", "Energy storage paired with a charging hub"),
      ],
    },
    metrics: [
      { value: "250 kWh – 5 MWh", label: "Per container" },
      { value: "500 kWh – 50 MWh", label: "Modular scaling" },
      { value: "AI enabled", label: "Load balancing" },
    ],
    overview: {
      title: "Container-class storage, grid-services ready.",
      intro:
        "Large ESS is an ISO-container system for commercial and utility duty; the load-balancing variant is a modular grid-services rack for microgrid work. Both pair with Wezu's multi-point charging kiosks.",
      items: [
        { title: "Large ESS", body: "ISO-container BESS from 250 kWh to 5 MWh per container." },
        { title: "Load-Balancing ESS", body: "A modular grid-services rack for microgrid and utility balancing." },
        { title: "Charger Pairing", body: "Pairs with multi-point charging kiosks for power backup and energy provisioning." },
      ],
    },
    features: [
      { title: "ISO Container", body: "Container-class commercial system." },
      { title: "Modular Scaling", body: "500 kWh to 50 MWh across modules." },
      { title: "Grid Services", body: "Microgrid and utility load balancing." },
      { title: "AI Enabled", body: "Load balancing handled by the system." },
      { title: "Remote Servicing", body: "Serviced and monitored remotely." },
      { title: "Energy Provisioning", body: "Power backup and energy provisioning for paired charging sites." },
    ],
    applications: [
      { title: "Utility & Grid Services", body: "Load balancing and grid-services duty." },
      { title: "Microgrids", body: "Islanded and hybrid microgrid installations." },
      { title: "Charging Hubs", body: "Paired with multi-point charging kiosks for backup and provisioning." },
    ],
    specifications: [
      { specification: "Capacity per Container", details: "250 kWh – 5 MWh" },
      { specification: "Modular Range", details: "500 kWh – 50 MWh" },
      { specification: "Large Format", details: "ISO-container BESS" },
      { specification: "Load-Balancing Format", details: "Modular grid-services rack" },
      { specification: "Duty", details: "Utility, microgrid, grid services" },
      { specification: "Intelligence", details: "AI-enabled load balancing" },
      { specification: "Servicing", details: "Remote servicing and monitoring" },
      { specification: "Pairing", details: "Multi-point charging kiosks" },
    ],
  },
];

/** Every media row for one product, flattened into the shape the table takes. */
function mediaRows(entry: PortfolioProduct) {
  const { card, hero, detail, gallery = [], applications = [] } = entry.media;
  const rows = [
    { kind: ProductMediaKind.CARD, ...card, sortOrder: 0 },
    { kind: ProductMediaKind.HERO, ...hero, sortOrder: 0 },
  ];
  if (detail) rows.push({ kind: ProductMediaKind.DETAIL, ...detail, sortOrder: 0 });
  gallery.forEach((item, index) => rows.push({ kind: ProductMediaKind.GALLERY, ...item, sortOrder: index }));
  applications.forEach((item, index) => rows.push({ kind: ProductMediaKind.APPLICATION, ...item, sortOrder: index }));
  return rows;
}

/** The six sections the product page reads, in the order it lays them out. */
function sectionRows(entry: PortfolioProduct) {
  return [
    { type: ProductSectionType.METRICS, title: null, sortOrder: 1, data: { items: entry.metrics } },
    { type: ProductSectionType.BENEFITS, title: entry.overview.title, sortOrder: 2, data: { intro: entry.overview.intro, items: entry.overview.items } },
    { type: ProductSectionType.FEATURES, title: "Key Features", sortOrder: 3, data: { items: entry.features } },
    { type: ProductSectionType.ENVIRONMENTS, title: "Applications", sortOrder: 4, data: { items: entry.applications } },
    { type: ProductSectionType.SPECIFICATIONS, title: "Technical Specifications", sortOrder: 5, data: { items: entry.specifications, note: SPEC_NOTE } },
    { type: ProductSectionType.CTA, title: null, sortOrder: 6, data: { quoteLabel: "Request a Quote", datasheetLabel: "Download Datasheet" } },
  ];
}

/**
 * Writes the catalogue.
 *
 * Idempotent by design: products are upserted on their slug, and each one's
 * media and sections are deleted and rewritten rather than appended, so a
 * second run reconciles the catalogue instead of stacking a duplicate of every
 * image behind the first. Leads, testimonials and admin users are untouched —
 * a product's leads survive because the product row itself is updated, never
 * dropped and recreated.
 */
export async function writePortfolio(
  status: ProductStatus,
  log: (line: string) => void = () => {},
): Promise<void> {
  for (const entry of PORTFOLIO) {
    const fields = {
      name: entry.name,
      status,
      tagline: entry.tagline,
      cardDescription: entry.introduction,
      introduction: entry.introduction,
      seoTitle: `${entry.name} | Wezu Technologies`,
      seoDescription: entry.seoDescription,
      sortOrder: entry.sortOrder,
    };

    const product = await prisma.product.upsert({
      where: { slug: entry.slug },
      update: fields,
      create: { slug: entry.slug, ...fields },
    });

    const media = mediaRows(entry);
    await prisma.productMedia.deleteMany({ where: { productId: product.id, kind: { in: media.map((row) => row.kind) } } });
    await prisma.productMedia.createMany({ data: media.map((row) => ({ productId: product.id, ...row })) });

    const sections = sectionRows(entry);
    await prisma.productSection.deleteMany({ where: { productId: product.id, type: { in: sections.map((section) => section.type) } } });
    await prisma.productSection.createMany({ data: sections.map((section) => ({ productId: product.id, ...section })) });

    log(`${status.padEnd(9)} ${entry.sortOrder}  ${entry.slug}  (${media.length} media, ${sections.length} sections)`);
  }
}
