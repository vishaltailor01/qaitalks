---
title: "ADR-001: Database Strategy for 1k DAU on Free Tier"
status: accepted
date: 2026-02-13
---

Context
- Scale: ~1k DAU, budget: free/open-source, team prefers managed-free.
- Current: Cloudflare D1 (SQLite) via Prisma adapter.

Decision
- Keep D1 for primary persistence with careful indexing and connection usage.
- Use Cloudflare KV for caching hot reads and rate-limit counters.
- If DAU grows beyond ~10k or write contention increases, plan migration to managed Postgres (Neon free tier), keeping Prisma models intact.

Consequences
- Low cost, acceptable consistency for current workload.
- Read-heavy flows benefit from KV; write conflicts mitigated via queueing.

Implementation Notes
- Add read-through cache on common queries.
- Instrument hit ratio and fallbacks; add migration playbook to Postgres if needed.
