import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for database operations.");
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

// Delay connection construction: public fallback rendering and build-time compilation do not need a database.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, property) {
    const value = (getClient() as unknown as Record<PropertyKey, unknown>)[property];
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});
