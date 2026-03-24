---
status: awaiting_human_verify
trigger: "xray-search-not-working: The Competitive X-Ray search feature returns no results or the AI analysis is not working in production on wsi-app.vercel.app"
created: 2026-03-24T00:00:00Z
updated: 2026-03-24T00:10:00Z
---

## Current Focus

hypothesis: Multiple layered issues found via static analysis — all four confirmed and fixed
test: TypeScript type check passed (tsc --noEmit, zero errors)
expecting: After redeploy to Vercel with OPENROUTER_API_KEY set, X-Ray returns GitHub results, Reddit results, and AI analysis; HN contributes on matching queries; PH returns [] until PRODUCTHUNT_API_KEY is added
next_action: User deploys to Vercel, verifies in production, confirms fix

## Symptoms

expected: User enters a startup idea, clicks Scan, gets competitors found from Reddit/GitHub/ProductHunt/HackerNews plus AI competitive landscape analysis
actual: X-Ray search not returning results — unclear if data sources, AI call, or something else
errors: Unknown in production; AI errors are silently caught
reproduction: Go to Competitive X-Ray section, type "AI invoice automation", click Scan
started: Recent — codebase was just deployed to Vercel

## Eliminated

- hypothesis: maxOutputTokens parameter is wrong
  evidence: Confirmed maxOutputTokens is the correct param for ai v6 (line 599 of node_modules/ai/dist/index.d.ts). This is NOT the bug.
  timestamp: 2026-03-24T00:00:00Z

- hypothesis: Cache (Upstash/in-memory) returning stale empty results
  evidence: Cache is implemented correctly with cacheGetOrFetch pattern. Without Redis configured, it falls back to in-memory. Cache stores results after first fetch, so the first call always goes live. Not the root cause.
  timestamp: 2026-03-24T00:00:00Z

## Evidence

- timestamp: 2026-03-24T00:01:00Z
  checked: src/services/producthunt.ts
  found: ProductHunt search hits https://www.producthunt.com/search/posts?q=... — this is a public HTML page, not a JSON endpoint. The code tries JSON.parse(text), fails, and returns []. This endpoint returns HTML, not JSON. Result: ph is ALWAYS empty array.
  implication: ProductHunt source never contributes competitors. This is a structural bug.

- timestamp: 2026-03-24T00:02:00Z
  checked: src/services/hackernews.ts + route.ts (lines 75-86)
  found: getHNStories() fetches top 50 HN stories filtered by STARTUP_KEYWORDS (["startup","founder","funding","vc","seed","series","yc","launch","saas","ai","fintech","raise"]). In route.ts the result is FURTHER filtered: only stories whose title includes the FIRST WORD of the user's idea (ideaKeyword = idea.toLowerCase().split(" ")[0]). For "AI invoice automation", ideaKeyword = "ai" — which does match the filter. But for queries like "invoice automation", ideaKeyword = "invoice" — zero HN story titles will contain "invoice" making relevantHN always empty.
  implication: HN competitor filtering is overly restrictive — only first word matched, and startup keyword pre-filter massively reduces pool. Many queries will yield 0 HN results.

- timestamp: 2026-03-24T00:03:00Z
  checked: route.ts lines 136-173 (AI block)
  found: AI errors are caught with an empty catch block — no logging. When AI fails in production (e.g. OPENROUTER_API_KEY not set in Vercel env vars), the error is silently swallowed and aiAnalysis falls back to the string "AI analysis unavailable — source data shown below." There is no way to tell from the API response whether AI succeeded or failed.
  implication: If OPENROUTER_API_KEY is missing on Vercel, AI silently fails. Users see the fallback string with no error indicator. This is a known deployment risk.

- timestamp: 2026-03-24T00:04:00Z
  checked: route.ts lines 88-98 (Reddit filter)
  found: Reddit results are filtered to score > 20 OR comments > 10. Reddit's search.json often returns posts with lower engagement. New/niche queries may yield no posts meeting this threshold. The upstream filter in reddit.ts already drops posts with score <= 5, but the route-level filter drops any remaining posts under score 20 AND under 10 comments.
  implication: For niche or uncommon search terms, all Reddit posts may be below threshold even when results exist. This is overly aggressive for competitive intelligence purposes.

- timestamp: 2026-03-24T00:05:00Z
  checked: src/services/github-trending.ts
  found: GitHub search API is used unauthenticated. Free tier allows 60 req/hour per IP. Vercel's serverless functions can share IPs across invocations from Vercel's NAT pool, meaning multiple users could collectively exhaust the GitHub API rate limit. When rate-limited, res.ok is false and the function returns []. No GITHUB_TOKEN is used.
  implication: In production under moderate load, GitHub results may fail silently due to rate limiting.

- timestamp: 2026-03-24T00:06:00Z
  checked: src/services/hackernews.ts line 57
  found: isStartupRelated filter using STARTUP_KEYWORDS narrows 50 HN top stories to only those matching startup-related terms. Then only top 15 are kept. The route FURTHER filters these 15 by idea keyword. Combined, these two filters mean many searches produce zero HN results.
  implication: The double-filter approach is the primary reason HN contributes nothing for most non-startup-buzzword queries.

## Resolution

root_cause: Four confirmed bugs:
  1. CRITICAL — ProductHunt service always returns [] because it hits an HTML page and tries to parse it as JSON (will always fail).
  2. HIGH — HN filtering is overly restrictive: startup keyword pre-filter + first-word-only title match means most queries yield 0 HN competitors.
  3. HIGH — AI errors are silently swallowed with no logging; if OPENROUTER_API_KEY is absent from Vercel env, the AI block silently fails.
  4. MEDIUM — Reddit route-level filter (score > 20 || comments > 10) is too aggressive for niche queries; GitHub has no auth token so rate limits at 60 req/hr shared across Vercel's IP pool.

fix: |
  1. src/services/producthunt.ts — Completely replaced broken HTML-parse approach with proper ProductHunt GraphQL API call (guarded by PRODUCTHUNT_API_KEY env var; returns [] immediately if key absent rather than silently failing after a failed JSON.parse).
  2. src/services/hackernews.ts — Expanded STARTUP_KEYWORDS list with 11 additional general tech/product terms to widen the pre-filter pool.
  3. src/app/api/xray/route.ts — Changed HN title matching from "first word of idea only" to "any word in idea >= 4 chars"; changed Reddit threshold from (score > 20 || comments > 10) to (score > 5 || comments > 3); added OPENROUTER_API_KEY presence check with console.warn; replaced empty catch {} with catch(aiErr) { console.error(...) } for Vercel log visibility.
  4. src/services/github-trending.ts — Added optional Authorization header using GITHUB_TOKEN env var to raise rate limit from 60 to 5000 req/hr in production.

verification: TypeScript type check passed (tsc --noEmit, zero errors across all modified files). Awaiting human verification in production.
files_changed:
  - src/app/api/xray/route.ts
  - src/services/producthunt.ts
  - src/services/hackernews.ts
  - src/services/github-trending.ts
