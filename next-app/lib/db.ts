import { PrismaClient } from "@prisma/client"
import { PrismaD1 } from "@prisma/adapter-d1"

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Get Cloudflare D1 database binding (available in production/edge runtime)
// @ts-expect-error - Cloudflare env types are defined in cloudflare.d.ts
const d1Database = process.env.DB || globalThis.DB

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db"

// Use D1 adapter if running on Cloudflare (DB binding available)
// Otherwise use standard Prisma Client for local development
const prisma = globalForPrisma.prisma ||
  new PrismaClient({
    adapter: d1Database ? new PrismaD1(d1Database) : undefined,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export { prisma }
