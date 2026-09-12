import type { Icon } from "@phosphor-icons/react/lib";
import {
  AirplaneIcon,
  ArrowsClockwiseIcon,
  AtomIcon,
  BarcodeIcon,
  BatteryChargingIcon,
  BatteryFullIcon,
  BatteryVerticalHighIcon,
  BatteryWarningIcon,
  BicycleIcon,
  BoatIcon,
  BroadcastIcon,
  BuildingsIcon,
  BusIcon,
  CarBatteryIcon,
  CarProfileIcon,
  CellSignalFullIcon,
  ChargingStationIcon,
  ChartBarIcon,
  ChartLineIcon,
  CircuitryIcon,
  ClockIcon,
  CloudIcon,
  CompassIcon,
  CpuIcon,
  CraneIcon,
  CreditCardIcon,
  CubeIcon,
  CylinderIcon,
  DeviceMobileIcon,
  DropIcon,
  EngineIcon,
  FactoryIcon,
  FanIcon,
  FireIcon,
  FlaskIcon,
  GaugeIcon,
  GearSixIcon,
  HardHatIcon,
  HeartbeatIcon,
  IdentificationCardIcon,
  LeafIcon,
  LifebuoyIcon,
  LightbulbIcon,
  LightningIcon,
  LockIcon,
  MagnetIcon,
  MapPinIcon,
  MemoryIcon,
  MonitorIcon,
  MotorcycleIcon,
  NutIcon,
  PackageIcon,
  PlugChargingIcon,
  PlugIcon,
  PlugsConnectedIcon,
  PowerIcon,
  PulseIcon,
  QrCodeIcon,
  RadioIcon,
  RecycleIcon,
  RulerIcon,
  ScalesIcon,
  ScrewdriverIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ShippingContainerIcon,
  SlidersIcon,
  SnowflakeIcon,
  SolarPanelIcon,
  StackIcon,
  SuitcaseIcon,
  SunIcon,
  TargetIcon,
  ThermometerColdIcon,
  ThermometerHotIcon,
  ThermometerIcon,
  TimerIcon,
  ToolboxIcon,
  TractorIcon,
  TrainIcon,
  TruckIcon,
  UsbIcon,
  WarehouseIcon,
  WaveformIcon,
  WindIcon,
  WindmillIcon,
  WrenchIcon,
} from "@phosphor-icons/react/ssr";

/**
 * The glyphs a category or a product feature may use, as a closed set.
 *
 * Phosphor rather than Lucide, and a set of eighty rather than fifteen. The
 * previous list was short enough that most categories ended up wearing an
 * icon that only approximately described them, and a product's six features
 * got whichever of six fixed marks their position happened to land on. Both
 * now pick from here.
 *
 * Closed rather than free text for two reasons: the dashboard needs something
 * to offer in a picker, and resolving an arbitrary name out of the package at
 * runtime would pull all three thousand icons into the bundle. Every entry
 * below is imported by name, so only what is listed ships.
 *
 * Imported from `@phosphor-icons/react/ssr`. The default entry point marks its
 * components `"use client"` so they can read weight and colour from
 * `IconContext`; nothing here uses that context, and these glyphs render
 * inside server components (the category cards, the product page), so the
 * server-safe build is the correct one. It emits a plain `<svg>` and keeps
 * these pages out of the client bundle.
 *
 * `keywords` is what the dashboard's search matches on beyond the label, so
 * someone looking for "ev" or "balance" or "coolant" finds the right glyph
 * without having to guess the name it was filed under.
 */
export interface IconEntry {
  readonly label: string;
  readonly icon: Icon;
  readonly group: IconGroup;
  readonly keywords: string;
}

export type IconGroup =
  | "Charging"
  | "Batteries and storage"
  | "Power electronics"
  | "Thermal"
  | "Monitoring"
  | "Vehicles"
  | "Industry and service"
  | "Trust and safety"
  | "General";

export const ICON_LIBRARY: Readonly<Record<string, IconEntry>> = {
  /* Charging */
  "plug-charging": { label: "Charging plug", group: "Charging", keywords: "ev charge connector gun socket", icon: PlugChargingIcon },
  "charging-station": { label: "Charging station", group: "Charging", keywords: "ev charger kiosk pile point", icon: ChargingStationIcon },
  "plugs-connected": { label: "Connected plugs", group: "Charging", keywords: "cable link ccs coupling grid tether", icon: PlugsConnectedIcon },
  plug: { label: "Socket", group: "Charging", keywords: "outlet mains ac chademo", icon: PlugIcon },
  lightning: { label: "Fast charge", group: "Charging", keywords: "bolt power dc quick kw volt energy", icon: LightningIcon },
  usb: { label: "USB port", group: "Charging", keywords: "connector data port type-c", icon: UsbIcon },

  /* Batteries and storage */
  "battery-charging": { label: "Battery charging", group: "Batteries and storage", keywords: "cell pack charge backup ups", icon: BatteryChargingIcon },
  "battery-full": { label: "Battery full", group: "Batteries and storage", keywords: "cell pack capacity charged", icon: BatteryFullIcon },
  "battery-vertical-high": { label: "Battery pack", group: "Batteries and storage", keywords: "module lithium kwh capacity cell", icon: BatteryVerticalHighIcon },
  "battery-warning": { label: "Battery warning", group: "Batteries and storage", keywords: "fault alert health degradation", icon: BatteryWarningIcon },
  "car-battery": { label: "Auxiliary battery", group: "Batteries and storage", keywords: "lead acid 12v starter vehicle", icon: CarBatteryIcon },
  "shipping-container": { label: "Container", group: "Batteries and storage", keywords: "iso ess bess enclosure container storage", icon: ShippingContainerIcon },
  cube: { label: "Modular unit", group: "Batteries and storage", keywords: "cabinet block enclosure outdoor module", icon: CubeIcon },
  stack: { label: "Stacked modules", group: "Batteries and storage", keywords: "modular scaling rack platform layers common", icon: StackIcon },
  warehouse: { label: "Warehouse", group: "Batteries and storage", keywords: "depot store site building", icon: WarehouseIcon },
  suitcase: { label: "Portable case", group: "Batteries and storage", keywords: "portable handheld field suitcase briefcase", icon: SuitcaseIcon },
  cylinder: { label: "Cell", group: "Batteries and storage", keywords: "cylindrical 18650 canister drum", icon: CylinderIcon },

  /* Power electronics */
  circuitry: { label: "Circuitry", group: "Power electronics", keywords: "bms board pcb electronics control", icon: CircuitryIcon },
  cpu: { label: "Processor", group: "Power electronics", keywords: "chip controller compute ai mcu", icon: CpuIcon },
  memory: { label: "Module", group: "Power electronics", keywords: "board card ram slot", icon: MemoryIcon },
  power: { label: "Power", group: "Power electronics", keywords: "on off supply mains ac standby", icon: PowerIcon },
  waveform: { label: "Inverter", group: "Power electronics", keywords: "converter signal sine ac dc frequency", icon: WaveformIcon },
  sliders: { label: "Controller", group: "Power electronics", keywords: "settings tuning provisioning configure mixer", icon: SlidersIcon },
  lightbulb: { label: "Lighting", group: "Power electronics", keywords: "lamp led illumination idea", icon: LightbulbIcon },
  "solar-panel": { label: "Solar", group: "Power electronics", keywords: "pv renewable array roof sun", icon: SolarPanelIcon },
  windmill: { label: "Wind", group: "Power electronics", keywords: "turbine renewable generation", icon: WindmillIcon },
  sun: { label: "Sun", group: "Power electronics", keywords: "solar daylight renewable heat", icon: SunIcon },
  atom: { label: "Energy", group: "Power electronics", keywords: "physics nuclear science core", icon: AtomIcon },
  magnet: { label: "Magnetics", group: "Power electronics", keywords: "coil inductor motor field", icon: MagnetIcon },

  /* Thermal */
  thermometer: { label: "Thermometer", group: "Thermal", keywords: "temperature thermal heat climate", icon: ThermometerIcon },
  "thermometer-cold": { label: "Cooling", group: "Thermal", keywords: "cold chill low temperature", icon: ThermometerColdIcon },
  "thermometer-hot": { label: "Heating", group: "Thermal", keywords: "hot high temperature derating", icon: ThermometerHotIcon },
  snowflake: { label: "Refrigeration", group: "Thermal", keywords: "cold cooling chiller freeze air conditioning hvac", icon: SnowflakeIcon },
  fan: { label: "Fan", group: "Thermal", keywords: "air forced cooling blower ventilation cool", icon: FanIcon },
  drop: { label: "Liquid cooling", group: "Thermal", keywords: "coolant cooling water glycol fluid liquid ip rating", icon: DropIcon },
  wind: { label: "Airflow", group: "Thermal", keywords: "convection ventilation breeze weather", icon: WindIcon },
  fire: { label: "Heat", group: "Thermal", keywords: "flame thermal runaway safety burn", icon: FireIcon },

  /* Monitoring */
  pulse: { label: "Monitoring", group: "Monitoring", keywords: "diagnostics live signal activity status", icon: PulseIcon },
  heartbeat: { label: "Health check", group: "Monitoring", keywords: "soh condition uptime diagnostics", icon: HeartbeatIcon },
  gauge: { label: "Instrumentation", group: "Monitoring", keywords: "meter dial measure provisioning capacity", icon: GaugeIcon },
  "chart-line": { label: "Analytics", group: "Monitoring", keywords: "trend graph reporting services data", icon: ChartLineIcon },
  "chart-bar": { label: "Reporting", group: "Monitoring", keywords: "graph statistics load usage", icon: ChartBarIcon },
  broadcast: { label: "Telemetry", group: "Monitoring", keywords: "rfid bluetooth wireless can lora signal antenna", icon: BroadcastIcon },
  "cell-signal-full": { label: "Cellular", group: "Monitoring", keywords: "sim network mobile coverage lte", icon: CellSignalFullIcon },
  cloud: { label: "Cloud", group: "Monitoring", keywords: "remote server iot platform hosted", icon: CloudIcon },
  radio: { label: "Radio", group: "Monitoring", keywords: "rf wireless transmitter comms", icon: RadioIcon },
  monitor: { label: "Display", group: "Monitoring", keywords: "touchscreen screen hmi panel interface", icon: MonitorIcon },
  "device-mobile": { label: "Mobile app", group: "Monitoring", keywords: "phone app remote user", icon: DeviceMobileIcon },
  "map-pin": { label: "Location", group: "Monitoring", keywords: "gps site place tracking", icon: MapPinIcon },
  "qr-code": { label: "QR code", group: "Monitoring", keywords: "scan identify payment tag", icon: QrCodeIcon },
  barcode: { label: "Barcode", group: "Monitoring", keywords: "scan serial identify label", icon: BarcodeIcon },
  timer: { label: "Timer", group: "Monitoring", keywords: "duration schedule turnaround session", icon: TimerIcon },
  clock: { label: "Duty cycle", group: "Monitoring", keywords: "continuous shift hours uptime 24/7 time", icon: ClockIcon },

  /* Vehicles */
  "car-profile": { label: "Car", group: "Vehicles", keywords: "automotive passenger four wheeler ev", icon: CarProfileIcon },
  truck: { label: "Truck", group: "Vehicles", keywords: "commercial fleet logistics lcv haulage", icon: TruckIcon },
  bus: { label: "Bus", group: "Vehicles", keywords: "transit coach public transport fleet", icon: BusIcon },
  motorcycle: { label: "Two wheeler", group: "Vehicles", keywords: "bike scooter moped delivery", icon: MotorcycleIcon },
  bicycle: { label: "Bicycle", group: "Vehicles", keywords: "cycle e-bike light mobility", icon: BicycleIcon },
  boat: { label: "Marine", group: "Vehicles", keywords: "ship vessel water port", icon: BoatIcon },
  train: { label: "Rail", group: "Vehicles", keywords: "locomotive metro track transit", icon: TrainIcon },
  airplane: { label: "Aviation", group: "Vehicles", keywords: "aircraft airport ground support", icon: AirplaneIcon },
  tractor: { label: "Agriculture", group: "Vehicles", keywords: "farm off highway machinery", icon: TractorIcon },
  engine: { label: "Motor", group: "Vehicles", keywords: "drive powertrain traction motor", icon: EngineIcon },

  /* Industry and service */
  factory: { label: "Factory", group: "Industry and service", keywords: "plant manufacturing industrial production", icon: FactoryIcon },
  buildings: { label: "Facility", group: "Industry and service", keywords: "society commercial premises campus residential", icon: BuildingsIcon },
  crane: { label: "Material handling", group: "Industry and service", keywords: "forklift lifting warehouse heavy hoist", icon: CraneIcon },
  "gear-six": { label: "Machinery", group: "Industry and service", keywords: "mechanical gear settings equipment", icon: GearSixIcon },
  wrench: { label: "Service", group: "Industry and service", keywords: "maintenance repair support servicing remote", icon: WrenchIcon },
  toolbox: { label: "Toolkit", group: "Industry and service", keywords: "install commissioning kit spares", icon: ToolboxIcon },
  screwdriver: { label: "Installation", group: "Industry and service", keywords: "fit mount commission assemble", icon: ScrewdriverIcon },
  nut: { label: "Hardware", group: "Industry and service", keywords: "bolt fastener mechanical fitting", icon: NutIcon },
  ruler: { label: "Dimensions", group: "Industry and service", keywords: "measure size format din tray footprint", icon: RulerIcon },
  "hard-hat": { label: "Site work", group: "Industry and service", keywords: "safety installation engineer field", icon: HardHatIcon },
  "arrows-clockwise": { label: "Drop-in swap", group: "Industry and service", keywords: "replacement retrofit exchange cycle reuse", icon: ArrowsClockwiseIcon },
  recycle: { label: "Recycling", group: "Industry and service", keywords: "second life sustainability circular reuse", icon: RecycleIcon },
  leaf: { label: "Sustainability", group: "Industry and service", keywords: "green clean emissions environment", icon: LeafIcon },
  flask: { label: "Testing", group: "Industry and service", keywords: "lab validation research qualification", icon: FlaskIcon },
  scales: { label: "Load balancing", group: "Industry and service", keywords: "load sharing balance distribute equal compliance", icon: ScalesIcon },

  /* Trust and safety */
  "shield-check": { label: "Certified", group: "Trust and safety", keywords: "ip65 ip67 rated sealed approval standard weather", icon: ShieldCheckIcon },
  shield: { label: "Protection", group: "Trust and safety", keywords: "safety guard fault breaker", icon: ShieldIcon },
  lock: { label: "Locking", group: "Trust and safety", keywords: "secure gun lock latch access", icon: LockIcon },
  "identification-card": { label: "Access card", group: "Trust and safety", keywords: "rfid badge authentication user id", icon: IdentificationCardIcon },
  "credit-card": { label: "Payment", group: "Trust and safety", keywords: "billing gateway tariff card upi", icon: CreditCardIcon },
  lifebuoy: { label: "Support", group: "Trust and safety", keywords: "help assistance service desk", icon: LifebuoyIcon },
  target: { label: "Precision", group: "Trust and safety", keywords: "accuracy goal focus", icon: TargetIcon },

  /* General */
  package: { label: "Generic", group: "General", keywords: "product box default general", icon: PackageIcon },
  compass: { label: "Navigation", group: "General", keywords: "direction guide explore", icon: CompassIcon },
};

export const DEFAULT_ICON = "package";

/**
 * Keys written by the Lucide set this replaced.
 *
 * Stored rows still carry them, and a category is edited rarely, so the names
 * are mapped rather than rewritten in place: an old row keeps rendering the
 * glyph it was chosen for, and nothing depends on a data migration having run
 * before the page can be served.
 */
const LEGACY_KEYS: Readonly<Record<string, string>> = {
  "plug-zap": "plug-charging",
  container: "shipping-container",
  "circuit-board": "circuitry",
  activity: "pulse",
  zap: "lightning",
  cable: "plugs-connected",
};

/** The stored key, mapped through the legacy names and defaulted if unknown. */
export function canonicalIconKey(key: string): string {
  const mapped = LEGACY_KEYS[key] ?? key;
  return ICON_LIBRARY[mapped] ? mapped : DEFAULT_ICON;
}

export function resolveIcon(key: string): Icon {
  return ICON_LIBRARY[canonicalIconKey(key)].icon;
}

export function iconLabel(key: string): string {
  return ICON_LIBRARY[canonicalIconKey(key)].label;
}

export interface IconOption {
  readonly value: string;
  readonly label: string;
  readonly group: IconGroup;
  /** Everything the picker's search matches against, pre-lowercased. */
  readonly haystack: string;
}

/** For the dashboard's picker, in the order declared above. */
export const ICON_OPTIONS: readonly IconOption[] = Object.entries(ICON_LIBRARY).map(
  ([value, entry]) => ({
    value,
    label: entry.label,
    group: entry.group,
    haystack: `${entry.label} ${value} ${entry.group} ${entry.keywords}`.toLowerCase(),
  }),
);
