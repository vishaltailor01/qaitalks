import { PrismaClient } from "@prisma/client"
import { PrismaD1 } from "@prisma/adapter-d1"

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Get Cloudflare D1 database binding (available in production/edge runtime)
const d1Database = process.env.DB || ((globalThis as unknown as Record<string, unknown>).DB as unknown)

// Use D1 adapter if running on Cloudflare (DB binding available)
// Otherwise use standard Prisma Client for local development/Vercel
const createPrismaClient = () => {
  if (d1Database) {
    // Cloudflare Pages with D1 binding
    return new PrismaClient({
      adapter: new PrismaD1(d1Database as unknown),
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    })
  } else {
    // Local development or Vercel deployment
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    })
  }
}

const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export { prisma }