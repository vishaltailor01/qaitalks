# Configuration Management System

## Overview

The QaiTAlk project uses a centralized configuration management system located at `lib/config/index.ts`. This follows **12-Factor App principles** and ensures all constants, environment variables, and settings are managed in one place.

## Key Principles

1. **No Hardcoded Values** - All configuration values are centralized
2. **Environment Validation** - Zod schemas validate all env vars on startup
3. **Type Safety** - Full TypeScript types for all configuration
4. **Fail Fast** - Invalid configuration throws errors immediately
5. **Single Source of Truth** - One file controls all settings

## Usage

### Import Configuration

```typescript
import { Config, AIConfig, CVReviewConfig } from '@/lib/config';

// Access environment
console.log(Config.env); // 'development' | 'production' | 'test'
console.log(Config.isDevelopment); // true/false

// Access AI configuration
console.log(Config.ai.gemini.enabled); // true/false
console.log(Config.ai.gemini.model); // 'gemini-pro'

// Access CV Review settings
console.log(Config.cvReview.validation.minResumeLength); // 100
console.log(Config.cvReview.cache.maxEntries); // 10
```

### Use Constants Instead of Magic Numbers

**❌ Bad - Hardcoded:**
```typescript
if (text.length > 10000) {
  throw new Error('Input too long');
}
```

**✅ Good - From Config:**
```typescript
import { Config } from '@/lib/config';

if (text.length > Config.cvReview.validation.maxInputLength) {
  throw new Error('Input too long');
}
```

### Access Section Markers

**❌ Bad - Hardcoded:**
```typescript
const markers = [
  '===== SECTION 1:',
  '===== SECTION 2:',
  // ...
];
```

**✅ Good - From Config:**
```typescript
import { SectionMarkers } from '@/lib/config';

const markers = SectionMarkers.markers;
const sectionName = SectionMarkers.names[1]; // 'ATS Optimization Analysis'
```

### Access Optimization Modes

**❌ Bad - Hardcoded:**
```typescript
const modes = {
  minimal: 'with MINIMAL CHANGES...',
  balanced: 'with BALANCED optimization...',
};
```

**✅ Good - From Config:**
```typescript
import { OptimizationModes } from '@/lib/config';

const mode = OptimizationModes.minimal;
console.log(mode.label); // 'Minimal Changes'
console.log(mode.guidance); // Full guidance text
```

## Configuration Sections

### 1. Environment Variables

All environment variables are validated using Zod schemas. Required variables will cause the application to crash on startup if missing.

**Required:**
- `DATABASE_URL` - Database connection string
- `AUTH_SECRET` - Session encryption secret (min 32 chars)
- `NEXT_PUBLIC_BASE_URL` - Application base URL

**Optional but Recommended:**
- `GEMINI_API_KEY` - Google Gemini API key
- `HUGGINGFACE_API_TOKEN` - HuggingFace API token

### 2. AI Provider Configuration

```typescript
Config.ai = {
  gemini: {
    apiKey: string,
    model: string,
    enabled: boolean,
    baseUrl: string,
  },
  huggingface: {
    apiToken: string,
    model: string,
    enabled: boolean,
  },
  fallback: {
    enabled: boolean,
    order: ['gemini', 'huggingface'],
  },
}
```

### 3. CV Review Configuration

```typescript
Config.cvReview = {
  validation: {
    minResumeLength: 100,
    minJobDescriptionLength: 30,
    maxInputLength: 10000,
    maxFileSize: 5MB,
  },
  cache: {
    enabled: true,
    maxEntries: 10,
    ttl: 24 hours,
  },
  retry: {
    maxAttempts: 3,
    initialDelay: 1000ms,
    maxDelay: 10000ms,
  },
  // ... more settings
}
```

### 4. Application Constants

```typescript
Config.app = {
  name: 'QaiTAlk',
  version: '1.0.0',
  urls: {
    base: 'http://localhost:3000',
    api: 'http://localhost:3000/api',
  },
  time: {
    second: 1000,
    minute: 60000,
    hour: 3600000,
  },
  size: {
    kb: 1024,
    mb: 1048576,
  },
}
```

## Helper Functions

### Check AI Provider Availability

```typescript
// Get current AI provider
const provider = Config.getAIProvider(); // 'gemini' | 'huggingface'

// Check if fallback is enabled
const hasFallback = Config.isFallbackEnabled(); // true/false
```

### Use Time/Size Constants

```typescript
// Instead of magic numbers
setTimeout(() => {}, Config.app.time.minute); // 60000ms

const maxSize = 5 * Config.app.size.mb; // 5MB in bytes
```

## Environment Files

### `.env.local` (Development - NOT committed)

```env
# Required
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-secret-here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# AI Providers (at least one required)
GEMINI_API_KEY="your_key_here"
GEMINI_MODEL="gemini-pro"
HUGGINGFACE_API_TOKEN="your_token_here"
```

### `.env.example` (Template - committed to Git)

Contains all available environment variables with placeholder values. New developers copy this to `.env.local` and fill in real values.

## Migration Guide

### Migrating Existing Code

1. **Find hardcoded values:**
   ```bash
   # Search for magic numbers
   grep -r "10000\|5000\|6000" lib/
   
   # Search for hardcoded strings
   grep -r "gemini-pro\|mistralai" lib/
   ```

2. **Replace with config:**
   ```typescript
   // Before
   const MAX_LENGTH = 10000;
   
   // After
   import { Config } from '@/lib/config';
   const maxLength = Config.cvReview.validation.maxInputLength;
   ```

3. **Update imports:**
   ```typescript
   // Before
   const apiKey = process.env.GEMINI_API_KEY;
   
   // After
   import { Config } from '@/lib/config';
   const apiKey = Config.ai.gemini.apiKey;
   ```

## Testing

The configuration system validates on module load. To test:

```typescript
// In your test setup
process.env.DATABASE_URL = 'file:./test.db';
process.env.AUTH_SECRET = 'test-secret-at-least-32-chars-long';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

// Now import config - it will validate
import { Config } from '@/lib/config';
```

## Best Practices

### ✅ DO

- Import from `@/lib/config` instead of reading `process.env` directly
- Use TypeScript types exported from config
- Add new constants to config instead of hardcoding
- Document new configuration options in this README

### ❌ DON'T

- Access `process.env` directly in application code (only in config/index.ts)
- Hardcode URLs, API keys, or magic numbers
- Create duplicate constant definitions
- Commit `.env.local` to Git

## Adding New Configuration

### Example: Adding a New Feature Setting

1. **Add to config/index.ts:**
   ```typescript
   export const NewFeatureConfig = {
     enabled: true,
     maxItems: 100,
     timeout: 5000,
   } as const;
   
   export const Config = {
     // ... existing config
     newFeature: NewFeatureConfig,
   };
   ```

2. **Use in your code:**
   ```typescript
   import { Config } from '@/lib/config';
   
   if (Config.newFeature.enabled) {
     // Feature logic
   }
   ```

3. **Document in this README**

## Troubleshooting

### "Invalid environment configuration" Error

**Cause:** Required environment variables are missing or invalid.

**Solution:**
1. Check `.env.local` exists in `next-app/` directory
2. Copy from `.env.example` if missing
3. Ensure all required variables are set
4. Check variable names match (case-sensitive)

### "No AI provider configured" Error

**Cause:** Neither Gemini nor HuggingFace API keys are set.

**Solution:**
Set at least one API key in `.env.local`:
```env
GEMINI_API_KEY="your_key_here"
# OR
HUGGINGFACE_API_TOKEN="your_token_here"
```

## References

- [12-Factor App - Config](https://12factor.net/config)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Zod Validation](https://zod.dev/)

---

**Last Updated:** February 13, 2026
**Maintainer:** Principal Engineer
