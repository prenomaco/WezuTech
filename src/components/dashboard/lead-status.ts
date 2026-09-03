import type { LeadStatus } from "@prisma/client";

/** Badge tone per enquiry state, so every table reads the same. */
export const LEAD_TONE: Record<LeadStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  NEW: "info",
  CONTACTED: "warning",
  QUALIFIED: "success",
  CLOSED: "neutral",
  SPAM: "danger",
};

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"] as const;
