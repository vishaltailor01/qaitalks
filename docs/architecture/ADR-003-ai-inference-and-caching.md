---
title: "ADR-003: AI Inference & Edge Caching"
status: accepted
date: 2026-02-13
---

Context
- AI features via Hugging Face/Gemini; free-tier costs and latency concerns.

Decision
- Stream responses to client; cap token usage per request.
- Read-through cache with KV keyed on normalized inputs; short TTL.
- Fallback chain: primary model → cheaper model → cached last-good.

Consequences
- Lower costs; improved perceived performance; resilience to upstream errors.

Implementation Notes
- Log model name, token count, latency, cache hits; apply jittered retries and circuit breakers.
