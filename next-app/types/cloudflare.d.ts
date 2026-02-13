// Cloudflare Workers/Pages type definitions for D1 Database bindings

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Cloudflare D1 Database binding (available in edge runtime)
      DB?: D1Database
      
      // Cloudflare KV bindings (available in edge runtime)
      RATE_LIMIT?: KVNamespace
      API_CACHE?: KVNamespace
    }
  }
  
  // Cloudflare bindings available in globalThis on Cloudflare Workers
  var DB: D1Database | undefined
  var RATE_LIMIT: KVNamespace | undefined
  var API_CACHE: KVNamespace | undefined
}

// Cloudflare Environment interface for Pages Functions
export interface CloudflareEnv {
  // D1 Database binding
  DB: D1Database
  
  // KV Namespace bindings
  RATE_LIMIT?: KVNamespace
  API_CACHE?: KVNamespace
  
  // Add other Cloudflare bindings here as needed:
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

// KV Namespace types
export interface KVNamespace {
  get(key: string, options?: KVGetOptions): Promise<string | null>
  get(key: string, type: 'text'): Promise<string | null>
  get(key: string, type: 'json'): Promise<unknown | null>
  get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>
  get(key: string, type: 'stream'): Promise<ReadableStream | null>
  
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: KVPutOptions): Promise<void>
  
  delete(key: string): Promise<void>
  
  list(options?: KVListOptions): Promise<KVListResult>
}

export interface KVGetOptions {
  cacheTtl?: number
}

export interface KVPutOptions {
  expiration?: number
  expirationTtl?: number
  metadata?: Record<string, unknown>
}

export interface KVListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

export interface KVListResult {
  keys: Array<{ name: string; expiration?: number; metadata?: Record<string, unknown> }>
  list_complete: boolean
  cursor?: string
}

export {}
