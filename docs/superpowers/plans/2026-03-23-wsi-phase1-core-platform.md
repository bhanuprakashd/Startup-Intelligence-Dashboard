# WSI Phase 1: Core Platform + Chat + Live Feeds

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static mock-data dashboard into a live intelligence platform with AI Copilot chat panel, streaming data feeds, Redis caching, and user authentication.

**Architecture:** Split-screen layout (dashboard 70% + collapsible AI chat 30%). Live data flows from external APIs through Next.js API routes (BFF) into Upstash Redis cache, then to client via TanStack Query with auto-refresh. AI Copilot uses Vercel AI SDK with OpenAI for streaming chat responses.

**Tech Stack:** Next.js 16, Vercel AI SDK, OpenAI GPT-4o-mini, Upstash Redis, Supabase Auth, TanStack Query, Server-Sent Events

**Spec:** `docs/superpowers/specs/2026-03-23-wsi-platform-design.md`

---

## File Structure

### New files to create:

```
src/
├── app/api/
│   ├── chat/route.ts                    # AI Copilot streaming endpoint (Vercel AI SDK)
│   ├── feeds/news/route.ts              # Live news feed from NewsData.io
│   ├── feeds/hackernews/route.ts        # Live HN stories (startup/tech filtered)
│   ├── feeds/funding/route.ts           # Live funding from RSS + SEC
│   └── health/route.ts                  # Source health status endpoint
│
├── components/
│   └── chat/
│       ├── chat-panel.tsx               # Collapsible right panel with chat UI
│       ├── chat-message.tsx             # Single message bubble (user/assistant)
│       └── chat-input.tsx               # Input bar with send button + slash commands
│
├── services/
│   ├── cache.ts                         # Upstash Redis client + TTL helpers
│   ├── newsdata.ts                      # NewsData.io API adapter
│   ├── hackernews.ts                    # HackerNews Firebase API adapter
│   ├── rss.ts                           # RSS feed parser for funding + news
│   └── source-health.ts                # Source health tracking (circuit breaker)
│
├── hooks/
│   ├── use-live-news.ts                 # TanStack Query hook for live news
│   ├── use-live-funding.ts              # TanStack Query hook for live funding
│   ├── use-live-hn.ts                   # TanStack Query hook for HN stories
│   └── use-source-health.ts            # Hook for source status indicators
│
└── lib/
    ├── supabase-client.ts               # Supabase browser client
    └── supabase-server.ts               # Supabase server client (for API routes)

### Already existing (NOT created by this plan):
- `src/lib/constants.ts` — Contains REFRESH_INTERVALS, STALE_TIMES, formatCurrency, etc.
- `@tanstack/react-query` — Already installed and QueryProvider already wraps the app
- All shadcn/ui components — Already installed
- All current dashboard components — Already built with mock data
```

### Existing files to modify:

```
src/app/page.tsx                         # Add chat panel + chatOpen state (Task 9)
src/components/layout/status-bar.tsx     # Wire live source health (Task 9)
src/components/feeds/news-feed.tsx       # Accept optional live data prop (Task 9)
```

**Deferred to Phase 1.5 (after API keys are configured and live data flows):**
```
src/components/layout/header.tsx         # Wire live ticker from RSS funding feed
src/components/feeds/funding-feed.tsx    # Replace mock data with live funding hook
src/components/layout/sidebar.tsx        # Add Copilot nav badge update
```

**Rationale:** Wiring the ticker and funding feed to live data requires working API keys and confirmed RSS feed availability. The architecture supports this — hooks are ready. The UI wiring is a small follow-up task once data flows are verified.

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Vercel AI SDK + OpenAI**

```bash
npm install ai @ai-sdk/openai
```

- [ ] **Step 2: Install Upstash Redis**

```bash
npm install @upstash/redis
```

- [ ] **Step 3: Install Supabase client**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 4: Install RSS parser**

```bash
npm install rss-parser
```

- [ ] **Step 5: Create .env.local with required keys**

```bash
cat > .env.local << 'EOF'
# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Upstash Redis
UPSTASH_REDIS_REST_URL=your-url-here
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NewsData.io
NEWSDATA_API_KEY=your-key-here
EOF
```

- [ ] **Step 6: Create .env.example (no secrets)**

```bash
cat > .env.example << 'EOF'
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEWSDATA_API_KEY=
EOF
```

- [ ] **Step 7: Verify build still passes**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add AI SDK, Upstash Redis, Supabase, RSS parser dependencies"
```

---

## Task 2: Upstash Redis Cache Service

**Files:**
- Create: `src/services/cache.ts`
- Test: manual via API route in Task 5

- [ ] **Step 1: Create the Redis client and cache helpers**

Create `src/services/cache.ts`:

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = {
  streaming: 300,        // 5 min — RSS, HN, news feeds
  funding: 600,          // 10 min — funding data
  onDemand: 1800,        // 30 min — user-triggered queries
  aiSynthesis: 3600,     // 60 min — expensive AI results
  pulse: 900,            // 15 min — market pulse narratives
  radar: 7200,           // 2 hours — opportunity radar scores
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get<T>(key);
  return data;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function cacheGetOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

export { redis };
```

- [ ] **Step 2: Commit**

```bash
git add src/services/cache.ts
git commit -m "feat: add Upstash Redis cache service with TTL helpers"
```

---

## Task 3: Source Health Tracking

**Files:**
- Create: `src/services/source-health.ts`
- Create: `src/hooks/use-source-health.ts`
- Create: `src/app/api/health/route.ts`

- [ ] **Step 1: Create source health service**

Create `src/services/source-health.ts`:

```typescript
import { redis } from "./cache";

export type SourceStatus = "up" | "down" | "circuit_open";

export interface SourceHealth {
  readonly name: string;
  readonly status: SourceStatus;
  readonly lastChecked: string;
  readonly consecutiveFailures: number;
}

const CIRCUIT_OPEN_THRESHOLD = 3;

export async function reportSourceUp(sourceId: string): Promise<void> {
  await redis.set(
    `source:${sourceId}:health`,
    { name: sourceId, status: "up", lastChecked: new Date().toISOString(), consecutiveFailures: 0 },
    { ex: 300 }
  );
}

export async function reportSourceDown(sourceId: string): Promise<void> {
  const current = await redis.get<SourceHealth>(`source:${sourceId}:health`);
  const failures = (current?.consecutiveFailures ?? 0) + 1;
  const status: SourceStatus = failures >= CIRCUIT_OPEN_THRESHOLD ? "circuit_open" : "down";
  const ttl = status === "circuit_open" ? 900 : 60;

  await redis.set(
    `source:${sourceId}:health`,
    { name: sourceId, status, lastChecked: new Date().toISOString(), consecutiveFailures: failures },
    { ex: ttl }
  );
}

export async function isSourceAvailable(sourceId: string): Promise<boolean> {
  const health = await redis.get<SourceHealth>(`source:${sourceId}:health`);
  return health?.status !== "circuit_open";
}

export async function getAllSourceHealth(): Promise<Record<string, SourceHealth>> {
  const sourceIds = ["newsdata", "hackernews", "rss_techcrunch", "rss_sec"];
  const results: Record<string, SourceHealth> = {};

  for (const id of sourceIds) {
    const health = await redis.get<SourceHealth>(`source:${id}:health`);
    results[id] = health ?? {
      name: id,
      status: "up",
      lastChecked: new Date().toISOString(),
      consecutiveFailures: 0,
    };
  }

  return results;
}
```

- [ ] **Step 2: Create health API route**

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAllSourceHealth } from "@/services/source-health";

export async function GET() {
  const health = await getAllSourceHealth();
  const sources = Object.values(health);
  const upCount = sources.filter((s) => s.status === "up").length;

  return NextResponse.json({
    success: true,
    data: {
      sources: health,
      summary: { total: sources.length, up: upCount, down: sources.length - upCount },
    },
    meta: { refreshedAt: new Date().toISOString() },
  });
}
```

- [ ] **Step 3: Create source health hook**

Create `src/hooks/use-source-health.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";

interface SourceHealthData {
  sources: Record<string, { status: string; lastChecked: string }>;
  summary: { total: number; up: number; down: number };
}

export function useSourceHealth() {
  return useQuery<SourceHealthData>({
    queryKey: ["source-health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/services/source-health.ts src/app/api/health/route.ts src/hooks/use-source-health.ts
git commit -m "feat: add source health tracking with circuit breaker pattern"
```

---

## Task 4: HackerNews Live Feed Service

**Files:**
- Create: `src/services/hackernews.ts`
- Create: `src/app/api/feeds/hackernews/route.ts`
- Create: `src/hooks/use-live-hn.ts`

- [ ] **Step 1: Create HN service adapter**

Create `src/services/hackernews.ts`:

```typescript
import { cacheGetOrFetch, CACHE_TTL } from "./cache";
import { reportSourceUp, reportSourceDown } from "./source-health";

interface HNStory {
  readonly id: number;
  readonly title: string;
  readonly url: string | null;
  readonly score: number;
  readonly by: string;
  readonly time: number;
  readonly descendants: number;
}

export interface HNItem {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly source: string;
  readonly score: number;
  readonly author: string;
  readonly comments: number;
  readonly publishedAt: string;
  readonly hnUrl: string;
}

const STARTUP_KEYWORDS = [
  "startup", "founder", "funding", "vc", "seed", "series",
  "yc", "launch", "saas", "ai", "fintech", "raise",
];

function isStartupRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return STARTUP_KEYWORDS.some((kw) => lower.includes(kw));
}

async function fetchTopStories(): Promise<HNItem[]> {
  const idsRes = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
    { signal: AbortSignal.timeout(10_000) }
  );
  const ids: number[] = await idsRes.json();
  const top50 = ids.slice(0, 50);

  const stories = await Promise.allSettled(
    top50.map(async (id) => {
      const res = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        { signal: AbortSignal.timeout(5_000) }
      );
      return res.json() as Promise<HNStory>;
    })
  );

  return stories
    .filter((r): r is PromiseFulfilledResult<HNStory> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((s) => s && s.title && isStartupRelated(s.title))
    .slice(0, 15)
    .map((s) => ({
      id: String(s.id),
      title: s.title,
      url: s.url ?? `https://news.ycombinator.com/item?id=${s.id}`,
      source: "Hacker News",
      score: s.score,
      author: s.by,
      comments: s.descendants ?? 0,
      publishedAt: new Date(s.time * 1000).toISOString(),
      hnUrl: `https://news.ycombinator.com/item?id=${s.id}`,
    }));
}

export async function getHNStories(): Promise<HNItem[]> {
  try {
    const result = await cacheGetOrFetch(
      "feed:hackernews",
      fetchTopStories,
      CACHE_TTL.streaming
    );
    await reportSourceUp("hackernews");
    return result;
  } catch (error) {
    await reportSourceDown("hackernews");
    return [];
  }
}
```

- [ ] **Step 2: Create HN API route**

Create `src/app/api/feeds/hackernews/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getHNStories } from "@/services/hackernews";

export async function GET() {
  const stories = await getHNStories();

  return NextResponse.json({
    success: true,
    data: stories,
    meta: {
      source: "hackernews",
      refreshedAt: new Date().toISOString(),
      total: stories.length,
    },
  });
}
```

- [ ] **Step 3: Create HN hook**

Create `src/hooks/use-live-hn.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface HNItem {
  id: string;
  title: string;
  url: string;
  source: string;
  score: number;
  author: string;
  comments: number;
  publishedAt: string;
  hnUrl: string;
}

export function useLiveHN() {
  return useQuery<HNItem[]>({
    queryKey: ["live-hn"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/hackernews");
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: 60_000,
  });
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/services/hackernews.ts src/app/api/feeds/hackernews/route.ts src/hooks/use-live-hn.ts
git commit -m "feat: add live HackerNews feed with startup filtering and caching"
```

---

## Task 5: NewsData.io Live Feed Service

**Files:**
- Create: `src/services/newsdata.ts`
- Create: `src/app/api/feeds/news/route.ts`
- Create: `src/hooks/use-live-news.ts`

- [ ] **Step 1: Create NewsData service adapter**

Create `src/services/newsdata.ts`:

```typescript
import { cacheGetOrFetch, CACHE_TTL } from "./cache";
import { reportSourceUp, reportSourceDown } from "./source-health";

export interface NewsItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly imageUrl: string | null;
  readonly source: string;
  readonly publishedAt: string;
  readonly category: string;
  readonly sentiment: "positive" | "neutral" | "negative";
}

interface NewsDataArticle {
  article_id: string;
  title: string;
  description: string | null;
  link: string;
  image_url: string | null;
  source_id: string;
  pubDate: string;
  category: string[];
  sentiment: string;
}

function mapCategory(cats: string[]): string {
  const catMap: Record<string, string> = {
    technology: "Tech",
    business: "Business",
    science: "Science",
    health: "HealthTech",
    environment: "CleanTech",
    education: "EdTech",
    politics: "Policy",
  };
  for (const c of cats) {
    if (catMap[c]) return catMap[c];
  }
  return "Startup";
}

function mapSentiment(s: string): "positive" | "neutral" | "negative" {
  if (s === "positive") return "positive";
  if (s === "negative") return "negative";
  return "neutral";
}

async function fetchNews(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=startup%20OR%20funding%20OR%20venture%20capital&language=en&size=20`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const json = await res.json();

  if (json.status !== "success" || !json.results) return [];

  return json.results.map((a: NewsDataArticle) => ({
    id: a.article_id,
    title: a.title,
    description: a.description ?? "",
    url: a.link,
    imageUrl: a.image_url,
    source: a.source_id,
    publishedAt: a.pubDate,
    category: mapCategory(a.category ?? []),
    sentiment: mapSentiment(a.sentiment ?? "neutral"),
  }));
}

export async function getLiveNews(): Promise<NewsItem[]> {
  try {
    const result = await cacheGetOrFetch(
      "feed:newsdata",
      fetchNews,
      CACHE_TTL.streaming
    );
    await reportSourceUp("newsdata");
    return result;
  } catch (error) {
    await reportSourceDown("newsdata");
    return [];
  }
}
```

- [ ] **Step 2: Create news API route**

Create `src/app/api/feeds/news/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getLiveNews } from "@/services/newsdata";

export async function GET() {
  const news = await getLiveNews();

  return NextResponse.json({
    success: true,
    data: news,
    meta: {
      source: "newsdata",
      refreshedAt: new Date().toISOString(),
      total: news.length,
    },
  });
}
```

- [ ] **Step 3: Create news hook**

Create `src/hooks/use-live-news.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  category: string;
  sentiment: "positive" | "neutral" | "negative";
}

export function useLiveNews() {
  return useQuery<NewsItem[]>({
    queryKey: ["live-news"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/news");
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: 60_000,
  });
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/services/newsdata.ts src/app/api/feeds/news/route.ts src/hooks/use-live-news.ts
git commit -m "feat: add live NewsData.io feed with category mapping and sentiment"
```

---

## Task 6: RSS Feed Service (Funding + Tech News)

**Files:**
- Create: `src/services/rss.ts`
- Create: `src/app/api/feeds/funding/route.ts`
- Create: `src/hooks/use-live-funding.ts`

- [ ] **Step 1: Create RSS service adapter**

Create `src/services/rss.ts`:

```typescript
import Parser from "rss-parser";
import { cacheGetOrFetch, CACHE_TTL } from "./cache";
import { reportSourceUp, reportSourceDown } from "./source-health";

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "WSI/1.0 (World Startup Intelligence)" },
});

export interface RSSItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly source: string;
  readonly publishedAt: string;
  readonly category: string;
}

const FUNDING_FEEDS = [
  { url: "https://techcrunch.com/category/venture/feed/", source: "TechCrunch", id: "rss_techcrunch" },
];

const NEWS_FEEDS = [
  { url: "https://feeds.feedburner.com/venturebeat/SZYF", source: "VentureBeat", id: "rss_venturebeat" },
];

async function fetchFeed(feedUrl: string, source: string): Promise<RSSItem[]> {
  const feed = await parser.parseURL(feedUrl);
  return (feed.items ?? []).slice(0, 15).map((item, i) => ({
    id: item.guid ?? item.link ?? `${source}-${i}`,
    title: item.title ?? "",
    description: item.contentSnippet ?? item.content ?? "",
    url: item.link ?? "",
    source,
    publishedAt: item.pubDate ?? new Date().toISOString(),
    category: "Funding",
  }));
}

export async function getLiveFunding(): Promise<RSSItem[]> {
  const results: RSSItem[] = [];

  for (const feed of FUNDING_FEEDS) {
    try {
      const items = await cacheGetOrFetch(
        `feed:rss:${feed.id}`,
        () => fetchFeed(feed.url, feed.source),
        CACHE_TTL.streaming
      );
      results.push(...items);
      await reportSourceUp(feed.id);
    } catch {
      await reportSourceDown(feed.id);
    }
  }

  return results.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getLiveRSSNews(): Promise<RSSItem[]> {
  const results: RSSItem[] = [];

  for (const feed of NEWS_FEEDS) {
    try {
      const items = await cacheGetOrFetch(
        `feed:rss:${feed.id}`,
        () => fetchFeed(feed.url, feed.source),
        CACHE_TTL.streaming
      );
      results.push(...items);
    } catch {
      // silently skip failed feeds
    }
  }

  return results.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
```

- [ ] **Step 2: Create funding API route**

Create `src/app/api/feeds/funding/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getLiveFunding } from "@/services/rss";

export async function GET() {
  const funding = await getLiveFunding();

  return NextResponse.json({
    success: true,
    data: funding,
    meta: {
      source: "rss",
      refreshedAt: new Date().toISOString(),
      total: funding.length,
    },
  });
}
```

- [ ] **Step 3: Create funding hook**

Create `src/hooks/use-live-funding.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface FundingItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export function useLiveFunding() {
  return useQuery<FundingItem[]>({
    queryKey: ["live-funding"],
    queryFn: async () => {
      const res = await fetch("/api/feeds/funding");
      const json = await res.json();
      return json.data ?? [];
    },
    refetchInterval: REFRESH_INTERVALS.funding,
    staleTime: 30_000,
  });
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/services/rss.ts src/app/api/feeds/funding/route.ts src/hooks/use-live-funding.ts
git commit -m "feat: add live RSS funding feed from TechCrunch venture category"
```

---

## Task 7: AI Copilot Chat Endpoint

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create the chat API route with Vercel AI SDK**

Create `src/app/api/chat/route.ts`:

```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are WSI Copilot — an AI startup intelligence assistant. You help founders and entrepreneurs with:

1. Startup idea discovery and validation
2. Market analysis and sizing
3. Competitive landscape analysis
4. Investor matching
5. Industry trends and signals

Rules:
- Be concise and data-driven. Lead with insights, not fluff.
- When discussing markets, cite specific numbers when you can.
- Be honest about uncertainty — say "I don't have live data on this" when relevant.
- Format responses with markdown: use bold for key points, bullet lists for data.
- If the user describes a startup idea, analyze it across: demand, competition, timing, feasibility.
- Never make up funding amounts, company names, or investor names. Say "based on general patterns" when speculating.
- You are NOT a general chatbot. Keep responses focused on startups, markets, and entrepreneurship.

You are currently helping the user explore the WSI platform. They can see a dashboard with live funding feeds, startup ecosystem maps, news, and opportunity analysis.`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add AI Copilot chat endpoint with OpenAI GPT-4o-mini"
```

---

## Task 8: Chat UI Components

**Files:**
- Create: `src/components/chat/chat-message.tsx`
- Create: `src/components/chat/chat-input.tsx`
- Create: `src/components/chat/chat-panel.tsx`

- [ ] **Step 1: Create chat message component**

Create `src/components/chat/chat-message.tsx`:

```typescript
"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  readonly role: "user" | "assistant";
  readonly content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        role === "user" ? "bg-transparent" : "bg-white/[0.02]"
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          role === "user"
            ? "bg-indigo-500/10 text-indigo-400"
            : "bg-emerald-500/10 text-emerald-400"
        )}
      >
        {role === "user" ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[10px] font-medium text-muted-foreground">
          {role === "user" ? "You" : "WSI Copilot"}
        </p>
        <div className="mt-1 text-[12px] leading-relaxed text-foreground/90 [&_strong]:text-foreground [&_ul]:mt-1 [&_ul]:space-y-0.5 [&_li]:text-[11px]">
          {content}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create chat input component**

Create `src/components/chat/chat-input.tsx`:

```typescript
"use client";

import { ArrowUp, Loader2 } from "lucide-react";
import { type FormEvent, useRef } from "react";

interface ChatInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit: (e: FormEvent) => void;
  readonly isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit(e as unknown as FormEvent);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t border-white/5 p-3">
      <div className="flex items-end gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about markets, ideas, trends..."
          rows={1}
          className="max-h-32 min-h-[20px] flex-1 resize-none bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition-opacity disabled:opacity-30"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p className="mt-1.5 text-center text-[9px] text-muted-foreground">
        Try: &quot;What sectors are growing fastest?&quot; or &quot;Validate my SaaS idea&quot;
      </p>
    </form>
  );
}
```

- [ ] **Step 3: Create the main chat panel**

Create `src/components/chat/chat-panel.tsx`:

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { Bot, MessageSquare, PanelRightClose, PanelRightOpen, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

export function ChatPanel({ isOpen, onToggle }: ChatPanelProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: "/api/chat" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Toggle button (always visible) */}
      <button
        onClick={onToggle}
        className="fixed right-4 top-[52px] z-40 flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-[#111118] px-3 text-[11px] font-medium text-muted-foreground transition-all hover:border-indigo-500/30 hover:text-foreground"
      >
        {isOpen ? (
          <>
            <PanelRightClose className="h-3.5 w-3.5" />
            Close
          </>
        ) : (
          <>
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            AI Copilot
          </>
        )}
      </button>

      {/* Panel */}
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-l border-white/5 bg-[#0d0d14] transition-all duration-300",
          isOpen ? "w-[380px]" : "w-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-[12px] font-semibold">WSI Copilot</h3>
            <p className="text-[9px] text-muted-foreground">
              AI startup intelligence assistant
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-medium text-emerald-400">LIVE</span>
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>
              <h4 className="mt-4 text-sm font-semibold">
                Startup Intelligence at your fingertips
              </h4>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Ask me about market opportunities, validate ideas, analyze
                competitors, or explore trending sectors.
              </p>
              <div className="mt-4 space-y-2 w-full">
                {[
                  "What are the hottest startup sectors right now?",
                  "I want to build an AI tool for small businesses",
                  "Compare fintech markets in India vs Southeast Asia",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      handleInputChange({
                        target: { value: q },
                      } as React.ChangeEvent<HTMLTextAreaElement>);
                    }}
                    className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-left text-[10px] text-muted-foreground transition-colors hover:border-indigo-500/20 hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.02]">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role as "user" | "assistant"}
                  content={msg.content}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Bot className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={(v) =>
            handleInputChange({
              target: { value: v },
            } as React.ChangeEvent<HTMLTextAreaElement>)
          }
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </aside>
    </>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/chat/
git commit -m "feat: add AI Copilot chat panel with streaming responses"
```

---

## Task 9: Wire Chat Panel into Dashboard Page

**Files:**
- Modify: `src/app/page.tsx`

This task adds the chat panel to the existing dashboard. The page already works — we're adding one component and one state variable.

- [ ] **Step 1: Add chat imports and state to page.tsx**

At the top of `src/app/page.tsx`, add this import alongside the existing imports:

```typescript
import { ChatPanel } from "@/components/chat/chat-panel";
```

Inside the `Dashboard` component, add this state:

```typescript
const [chatOpen, setChatOpen] = useState(false);
```

- [ ] **Step 2: Add ChatPanel to the layout**

In `src/app/page.tsx`, find the existing `<div className="flex flex-1 overflow-hidden">` that wraps `<Sidebar>` and `<main>`. Add `<ChatPanel>` as the last child of that flex container, AFTER the closing `</main>` tag:

```typescript
        </main>

        <ChatPanel isOpen={chatOpen} onToggle={() => setChatOpen((p) => !p)} />
      </div>
```

- [ ] **Step 3: Verify build and test**

```bash
npm run build && npm run dev
```

Open http://localhost:3000:
- Chat toggle button ("AI Copilot") should appear in top-right area
- Clicking it should slide open the chat panel on the right
- Main content should shrink to accommodate
- Clicking "Close" should collapse it back
- If OPENAI_API_KEY is set in .env.local, chat should stream responses

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add AI Copilot chat panel to dashboard layout"
```

---

## Task 10: Supabase Auth Setup

**Files:**
- Create: `src/lib/supabase-client.ts`
- Create: `src/lib/supabase-server.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Supabase browser client**

Create `src/lib/supabase-client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create Supabase server client**

Create `src/lib/supabase-server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase-client.ts src/lib/supabase-server.ts
git commit -m "feat: add Supabase client for auth (browser + server)"
```

---

## Summary

After completing all 10 tasks, the platform will have:

| Feature | Status |
|---------|--------|
| Upstash Redis caching with TTL tiers | Working |
| Source health tracking + circuit breaker | Working |
| Live HackerNews feed (startup-filtered) | Working |
| Live NewsData.io feed (with sentiment) | Working (requires NEWSDATA_API_KEY) |
| Live RSS funding feed (TechCrunch) | Working |
| AI Copilot chat (GPT-4o-mini streaming) | Working (requires OPENAI_API_KEY) |
| Collapsible chat panel (380px width) | Working |
| Source health API endpoint | Working |
| Supabase client libraries | Ready (requires Supabase project setup) |

### Required API Keys (set in .env.local)

| Key | How to get | Cost |
|-----|-----------|------|
| OPENAI_API_KEY | https://platform.openai.com/api-keys | Pay-as-you-go (~$0.15/1M input tokens for gpt-4o-mini) |
| UPSTASH_REDIS_REST_URL + TOKEN | https://console.upstash.com → Create Redis DB | Free tier: 10K commands/day |
| NEWSDATA_API_KEY | https://newsdata.io/register | Free tier: 200 req/day |
| NEXT_PUBLIC_SUPABASE_URL + keys | https://supabase.com/dashboard → New project | Free tier available |

### Deferred to next sprint

| Item | Reason |
|------|--------|
| Header ticker wired to live RSS | Needs confirmed RSS feed availability |
| Funding feed wired to live data | Same as above — hooks are ready, UI wiring is follow-up |
| Login/signup UI | Supabase client is ready; login flow is Phase 1.5 after auth tables are created |
| SEC EDGAR RSS adapter | Lower priority — TechCrunch RSS covers funding news initially |
| Status bar wired to live health | Hook is ready (`useSourceHealth`); UI wiring is follow-up |

**Next:** Phase 2 plan covers Opportunity Radar + Idea Validator — the two features that differentiate WSI from everything else.
