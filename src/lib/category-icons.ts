import {
  Activity,
  BatteryCharging,
  Cable,
  CircuitBoard,
  Container,
  Cpu,
  Gauge,
  Package,
  PlugZap,
  Radio,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons a category may use, as a closed set.
 *
 * A category's artwork is optional — most will not have a render for a while,
 * and a family like Thermal Management may never have one obvious picture — so
 * every category also carries an icon, and the card falls back to it. The set
 * is closed rather than free text for two reasons: the dashboard needs
 * something to offer in a picker, and importing an arbitrary name out of
 * `lucide-react` at runtime would pull the whole library into the bundle.
 *
 * Keys are stored in `Category.icon`. An unknown key (a row written before an
 * icon was removed from this list) resolves to `package` rather than crashing
 * the page.
 */
export const CATEGORY_ICONS: Readonly<Record<string, { label: string; icon: LucideIcon }>> = {
  "plug-zap": { label: "Charging plug", icon: PlugZap },
  "battery-charging": { label: "Battery", icon: BatteryCharging },
  container: { label: "Container", icon: Container },
  thermometer: { label: "Thermometer", icon: Thermometer },
  snowflake: { label: "Cooling", icon: Snowflake },
  "circuit-board": { label: "Circuit board", icon: CircuitBoard },
  cpu: { label: "Processor", icon: Cpu },
  activity: { label: "Monitoring", icon: Activity },
  radio: { label: "Connectivity", icon: Radio },
  gauge: { label: "Instrumentation", icon: Gauge },
  zap: { label: "Power", icon: Zap },
  cable: { label: "Cabling", icon: Cable },
  "shield-check": { label: "Protection", icon: ShieldCheck },
  wrench: { label: "Service", icon: Wrench },
  package: { label: "Generic", icon: Package },
};

export const DEFAULT_CATEGORY_ICON = "package";

export function categoryIcon(key: string): LucideIcon {
  return (CATEGORY_ICONS[key] ?? CATEGORY_ICONS[DEFAULT_CATEGORY_ICON]).icon;
}

/** For the dashboard's picker, in the order declared above. */
export const CATEGORY_ICON_OPTIONS = Object.entries(CATEGORY_ICONS).map(([value, { label }]) => ({
  value,
  label,
}));
