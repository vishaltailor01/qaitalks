import { PrismaClient } from "@prisma/client"
import { PrismaD1 } from "@prisma/adapter-d1"

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

/**
 * Lazily initialize Prisma Client with the appropriate adapter
 * - Cloudflare Pages: Uses D1 adapter for D1 database
 * - Local/Vercel: Uses Prisma Data Proxy (Accelerate) or standard PrismaClient
 * 
 * Note: Prisma 7 requires DATABASE_URL or an adapter. For local dev with SQLite,
 * we recommend setting PRISMA_CLIENT_ENGINE_TYPE=dataproxy and using Accelerate,
 * or downgrading to Prisma 6.
 */
/**
 * Lazily initialize Prisma Client with the appropriate adapter
 * - Cloudflare Pages: Uses D1 adapter for D1 database
 * - Local/Vercel: Uses standard Prisma Client with SQLite via DATABASE_URL
 */
const createPrismaClient = (): PrismaClient => {
  // Check for D1 binding (Cloudflare Pages environment)
  const globalThis_ = globalThis as unknown as Record<string, unknown>
  const d1Database = globalThis_.DB

  if (d1Database && typeof d1Database === "object" && !Array.isArray(d1Database)) {
    // Cloudflare Pages with D1 binding
    return new PrismaClient({
      adapter: new PrismaD1(d1Database as never),
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    })
  }

  // Local development or Vercel (uses DATABASE_URL env var)
  // DATABASE_URL should be: file:path (SQLite) or postgresql://... (PostgreSQL)
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    // During build time in CI/CD, we might not have a real database
    // Use a dummy database URL to allow the build to complete
    if (process.env.CI || process.env.VERCEL || process.env.NODE_ENV === "production") {
      console.warn("⚠️ DATABASE_URL not set - using dummy database for build")
      process.env.DATABASE_URL = "file:./prisma/dev.db"
    } else {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
        "For local development, set DATABASE_URL in .env.local (e.g., file:./prisma/dev.db)"
      )
    }
  }

  // Prisma 6 with SQLite works automatically with DATABASE_URL
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  })
}

// Singleton pattern with lazy initialization
let prismaInstance: PrismaClient | undefined = undefined

export const getPrisma = (): PrismaClient => {
  if (!prismaInstance) {
    if (globalForPrisma.prisma) {
      prismaInstance = globalForPrisma.prisma
    } else {
      prismaInstance = createPrismaClient()
      // Cache globally for development to reuse connection
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance
      }
    }
  }
  return prismaInstance
}