// Cloudflare Workers/Pages type definitions for D1 Database bindings

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Cloudflare D1 Database binding (available in edge runtime)
      DB?: D1Database
    }
  }
  
  // D1 Database available in globalThis on Cloudflare Workers
  var DB: D1Database | undefined
}

// Cloudflare Environment interface for Pages Functions
export interface CloudflareEnv {
  // D1 Database binding
  DB: D1Database
  
  // Add other Cloudflare bindings here as needed:
  // KV: KVNamespace
  // R2: R2Bucket
  // etc.
}

// D1 Database types (from @cloudflare/workers-types)
// Note: Install @cloudflare/workers-types for full type support
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  dump(): Promise<ArrayBuffer>
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run(): Promise<D1Result>
  all<T = unknown>(): Promise<D1Result<T>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  meta: {
    duration: number
    size_after: number
    rows_read: number
    rows_written: number
  }
  error?: string
}

export interface D1ExecResult {
  count: number
  duration: number
}

export {}
