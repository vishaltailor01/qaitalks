---
title: "ADR-004: Observability & SLOs on Free Tier"
status: accepted
date: 2026-02-13
---

Context
- Need reliability without paid tooling; Cloudflare platform.

Decision
- Use inexpensive/free tooling: Cloudflare Analytics/Logs + minimal Sentry free tier.
- Track SLOs: p95 latency for AI requests (<3s), error rate (<2%), cache hit ratio (>60%).

Consequences
- Enough visibility to iterate; minimal cost.

Implementation Notes
- Add structured logs for key events; export basic OTel traces where feasible; synthetic health checks.
