import { PrismaClient } from "@prisma/client"
import { PrismaD1 } from "@prisma/adapter-d1"

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Check if we're running on Cloudflare with D1 database binding
const getD1Database = (): Record<string, unknown> | null => {
  const globalThis_ = globalThis as unknown as Record<string, unknown>
  const db = globalThis_.DB
  // D1 binding is an object with execute method, not a string
  if (db && typeof db === "object" && !Array.isArray(db)) {
    return db as Record<string, unknown>
  }
  return null
}

// Use D1 adapter if running on Cloudflare (DB binding available)
// Otherwise use standard Prisma Client for local development/Vercel
const createPrismaClient = () => {
  const d1Db = getD1Database()
  if (d1Db) {
    // Cloudflare Pages with D1 binding
    return new PrismaClient({
      adapter: new PrismaD1(d1Db as never),
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    })
  } else {
    // Local development or Vercel deployment (uses DATABASE_URL env var)
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