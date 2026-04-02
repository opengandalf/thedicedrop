---
name: BGG API usage constraint
description: Bartosz's rule — never bulk-load from live BGG API; only per-article targeted enrichment is allowed
type: feedback
---

Never bulk-load from live BGG API by default. Per-article targeted enrichment (fetching data for games discussed in a single article) is allowed. Use the existing bgg_client with its caching and rate limiting.

**Why:** Bartosz set this constraint to avoid hammering BGG's API and stay within acceptable usage. The approved bg_ranks dump is for bulk work; the live API is for targeted lookups only.

**How to apply:** When adding new BGG API calls, ensure they are scoped to a single article's discussed games (typically <10 games). Always use bgg_client's built-in caching (7-day TTL for thing, 24-hour for search). Never loop over hundreds of games.
