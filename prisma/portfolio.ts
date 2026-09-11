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
  /**
   * The home carousel's copy, and the catalogue card's.
   *
   * Separate from `introduction`, which is one sentence sized for the product
   * page's hero. The carousel card is a 610px column beside a 377px render and
   * one sentence left most of it empty, so this is two paragraphs: what the
   * thing is, then what it is for. A blank line becomes a paragraph break.
   */
  readonly cardDescription: string;
  readonly seoDescription: string;
  readonly media: MediaPlan;
  readonly metrics: readonly { value: string; label: string }[];
  readonly overview: { title: string; intro: string; items: readonly { title: string; body: string }[] };
  readonly features: readonly { title: string; body: string }[];
  readonly applications: readonly { title: string; body: string }[];
  readonly specifications: readonly { specification: string; details: string }[];
}

const SPEC_NOTE = "Specifications vary by product configuration";

/**
 * An image under `public/products/<slug>`.
 *
 * The deck's exports are webp, which is the default. The kiosk's are png:
 * they came from Figma rather than the deck and were named by content hash
 * until they were moved in here beside everything else.
 */
function shot(slug: string, file: string, alt: string, extension = "webp"): MediaItem {
  return { url: `${IMAGE_ROOT}/${slug}/${file}.${extension}`, alt };
}

export const PORTFOLIO: readonly PortfolioProduct[] = [
  {
    slug: "public-kiosk-charger",
    name: "Public Kiosk Charger",
    sortOrder: 1,
    tagline: "Charge infrastructure, built for everywhere.",
    introduction:
      "A weather-sealed public AC/DC charging kiosk designed for open-environment charging across public spaces, parking areas, and workplace sites.",
    cardDescription:
      "A weather-sealed public AC/DC charging kiosk for open-environment charging across public spaces, parking areas and workplace sites. One kiosk covers 2.5 to 25 kW with one or two tethered guns, and mounts to a wall, a pole or a panel depending on the site.\n\nEverything a managed site needs is built in: a toughened glass touchscreen, RFID, Bluetooth, Wi-Fi and LoRa-WAN access, an IoT payment gateway, receptacle and gun locking, load-shared two-wheeler charging, and full diagnostics and reporting. IP65 and IP68 options cover exposed installations.",
    seoDescription: "Connected, weather-sealed public charging infrastructure by Wezu Technologies.",
    /*
     * The deck gives this product three pages and three different builds
     * (p4: 5 kW, IP65, one gun; p5: 5 kW, IP68, one to two guns; p6: 25 kW,
     * one gun, LoRa-WAN). They are one kiosk at three capacities rather than
     * three products, so the range spans all three rather than picking a page.
     */
    media: {
      hero: shot("public-kiosk-charger", "hero", "Public Kiosk Charger annotated hero view", "png"),
      detail: shot("public-kiosk-charger", "detail", "Public Kiosk Charger front view", "png"),
      gallery: [
        shot("public-kiosk-charger", "gallery-1", "Public Kiosk Charger wall-mounted view", "png"),
        shot("public-kiosk-charger", "gallery-2", "Public Kiosk Charger cable-hook view", "png"),
      ],
      applications: [
        shot("public-kiosk-charger", "application-1", "Public charging space", "png"),
        shot("public-kiosk-charger", "application-2", "Parking and workplace charging", "png"),
        shot("public-kiosk-charger", "application-3", "Managed charging fleet", "png"),
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
    cardDescription:
      "A multi-point charging station built for ranks of two-wheelers and light EVs, so one grid connection and one footprint serve a whole bay rather than a single vehicle. Outputs are shared intelligently across points, which keeps the supply sized to the site instead of to the worst case.\n\nIt suits shared-mobility fleets, campuses, residential parking and delivery hubs, where many small batteries arrive at once and each one needs a metered, identified session. Access, payment and remote monitoring are handled on the station itself.",
    seoDescription:
      "Up to 22 kW per kiosk across 4–8 tethered guns at 3.3 kW each, with load-shared two-wheeler charging, integrated backup and AI-enabled load balancing.",
    media: {
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
      "Wezu's flagship high-power DC charger, built for highway corridors and commercial fleets, delivering 30, 60 or 100 kW DC through dual CCS-2 and CHAdeMO connectors on liquid-cooled cables, with an optional 22 kW AC outlet.",
    cardDescription:
      "Wezu's flagship high-power DC charger for highway corridors and commercial fleets, delivering 30, 60 or 100 kW through dual CCS-2 and CHAdeMO connectors on liquid-cooled cables, with an optional 22 kW AC outlet for lighter vehicles.\n\nLiquid cooling keeps the cable manageable at full current and holds output through back-to-back sessions instead of derating once the unit warms. Built for depots and public corridors where uptime, session throughput and remote diagnostics decide whether the site pays for itself.",
    seoDescription:
      "30 / 60 / 100 kW DC fast charging at up to 250 A per gun, with dual CCS-2 and CHAdeMO connectors, liquid-cooled cables and an optional 22 kW AC outlet.",
    media: {
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
      "Lithium-ion mobility packs sized for India's most common EV form factors, from scooter and bike packs, through auto, e-rickshaw and cargo three-wheelers, to LCV and passenger four-wheelers.",
    cardDescription:
      "Lithium-ion mobility packs sized for India's most common EV form factors, from scooter and bike packs, through auto, e-rickshaw and cargo three-wheelers, to LCV and passenger four-wheelers.\n\nEach pack is engineered around its vehicle rather than adapted to it: cell selection, pack architecture, thermal path and BMS are matched to the duty cycle the vehicle actually sees. The result is usable range that holds up over the life of the vehicle, with diagnostics the operator can read.",
    seoDescription:
      "Lithium-ion mobility battery packs from 1.5 to 35 kWh at 48–320 V across 2W, 3W and 4W form factors, with IP67 enclosures, in-house BMS and CAN telemetry.",
    media: {
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
      "Battery packs engineered for 24/7 duty cycles across material handling, vehicle sub-systems and back-up, from drop-in 12 V and 24 V auxiliary replacements to DIN-tray forklift packs.",
    cardDescription:
      "Battery packs engineered for 24/7 duty cycles across material handling, vehicle sub-systems and back-up, from drop-in 12 V and 24 V auxiliary replacements to DIN-tray forklift packs.\n\nThese are specified for the shifts that do not stop, where a pack is expected to work every hour the site is open and a failure stops more than one machine. Thermal design, cycle life and state-of-health reporting are the priorities, and the mechanical envelope matches what the equipment already accepts.",
    seoDescription:
      "Industrial and auxiliary lithium-ion packs from 0.25 to 60 kWh at 12 / 24 / 48 / 80 V, as drop-in lead-acid replacements and DIN-tray forklift packs for 2–5 ton handling.",
    media: {
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
        "These packs are specified for the shifts that do not stop: material handling floors, vehicle sub-systems and back-up duty, where the pack is expected to work every hour the site is open.",
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
      "Backup, off-grid and small-commercial energy storage: a suitcase-class portable unit from 1 to 5 kWh, and an outdoor cabinet from 10 to 100 kWh for small-commercial and society duty.",
    cardDescription:
      "Backup, off-grid and small-commercial energy storage: a suitcase-class portable unit from 1 to 5 kWh, and an outdoor cabinet from 10 to 100 kWh for small-commercial and society duty.\n\nThe portable units go where the work is, for sites, events and field equipment with no supply to draw on. The cabinets stay put, ride through outages and shave peaks for shops, clinics and residential blocks. Both are site-ready and grid-ready out of the box.",
    seoDescription:
      "Portable energy storage from 1 to 5 kWh and medium systems from 10 to 100 kWh, covering suitcase-class backup and outdoor cabinets, site-ready and grid-ready.",
    media: {
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
      "AI-enabled container-class battery energy storage for utility, microgrid and grid-services duty, from 250 kWh to 5 MWh per container, scaling modularly from 500 kWh to 50 MWh, and pairing with multi-point charging kiosks for power backup and energy provisioning.",
    cardDescription:
      "AI-enabled container-class battery energy storage for utility, microgrid and grid-services duty, from 250 kWh to 5 MWh per container and scaling modularly from 500 kWh to 50 MWh.\n\nThe control layer is the point: forecasting and scheduling decide when to store and when to release, so the same asset can firm renewable output, balance load across a site and sell grid services. Containers pair with multi-point charging kiosks where a depot needs both power backup and energy provisioning.",
    seoDescription:
      "Container-class BESS from 250 kWh to 5 MWh, scaling 500 kWh to 50 MWh modular, with AI-enabled load balancing for utility, microgrid and grid-services duty.",
    media: {
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

/**
 * Every media row for one product, flattened into the shape the table takes.
 *
 * No CARD row. The catalogue card shows the hero image, so a separate card
 * asset was a second picture to keep in step with the first, and this seed
 * proved why that fails: the kiosk's card was a compressor drawing while its
 * hero was the actual charger, so the home carousel advertised the wrong
 * product. `writePortfolio` deletes the CARD kind explicitly to clear rows
 * left behind by that field.
 */
function mediaRows(entry: PortfolioProduct) {
  const { hero, detail, gallery = [], applications = [] } = entry.media;
  const rows = [{ kind: ProductMediaKind.HERO, ...hero, sortOrder: 0 }];
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
      cardDescription: entry.cardDescription,
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
    /* `CARD` is included in the delete but never written, which is what
       retires the old per-product card asset. */
    const kinds = [...new Set([...media.map((row) => row.kind), ProductMediaKind.CARD])];
    await prisma.productMedia.deleteMany({ where: { productId: product.id, kind: { in: kinds } } });
    await prisma.productMedia.createMany({ data: media.map((row) => ({ productId: product.id, ...row })) });

    const sections = sectionRows(entry);
    await prisma.productSection.deleteMany({ where: { productId: product.id, type: { in: sections.map((section) => section.type) } } });
    await prisma.productSection.createMany({ data: sections.map((section) => ({ productId: product.id, ...section })) });

    log(`${status.padEnd(9)} ${entry.sortOrder}  ${entry.slug}  (${media.length} media, ${sections.length} sections)`);
  }
}
